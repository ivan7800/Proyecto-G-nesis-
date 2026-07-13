const DB_NAME = 'genesis-omega-db';
const STORE = 'worlds';
const STATS_STORE = 'stats';
const VERSION = 2;
const LOCAL_FALLBACK_KEY = 'genesis-omega-latest';
const MAX_SLOTS = 5;
const DB_TIMEOUT_MS = 5000;

function openDB() {
  if (!('indexedDB' in globalThis)) return Promise.reject(new Error('IndexedDB no disponible'));
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) { settled = true; reject(new Error('Tiempo de espera agotado al abrir IndexedDB')); }
    }, DB_TIMEOUT_MS);
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      if (event.oldVersion < 2 && !db.objectStoreNames.contains(STATS_STORE)) db.createObjectStore(STATS_STORE);
    };
    request.onsuccess = () => {
      if (settled) { request.result.close(); return; }
      settled = true;
      clearTimeout(timeout);
      resolve(request.result);
    };
    request.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(request.error || new Error('No se pudo abrir IndexedDB'));
    };
    request.onblocked = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(new Error('IndexedDB está bloqueado por otra pestaña'));
    };
  });
}

export async function saveWorld(data, slotName = 'latest') {
  const key = `world:${slotName}`;
  const record = { ...data, savedAt: new Date().toISOString(), slot: slotName };
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE], 'readwrite');
      tx.objectStore(STORE).put(record, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('Error de escritura en IndexedDB'));
      tx.onabort = () => reject(tx.error || new Error('Guardado cancelado'));
    });
    db.close();
    if (slotName === 'latest') removeFallback();
    return { backend: 'indexedDB', slot: slotName };
  } catch (dbError) {
    if (slotName === 'latest') {
      try {
        localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(record));
        return { backend: 'localStorage', warning: dbError.message, slot: slotName };
      } catch (fallbackError) {
        throw new Error(`No se pudo guardar: ${fallbackError.message || dbError.message}`);
      }
    }
    throw dbError;
  }
}

export async function listSlots() {
  const slots = [];
  try {
    const db = await openDB();
    const allKeys = await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE], 'readonly');
      const request = tx.objectStore(STORE).getAllKeys();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    for (const key of allKeys) {
      if (typeof key === 'string' && key.startsWith('world:')) {
        const slotName = key.slice(6);
        slots.push(slotName);
      }
    }
  } catch (error) {
    if ('indexedDB' in globalThis) console.warn('No se pudo listar slots:', error);
  }
  return slots.sort((a, b) => {
    if (a === 'latest') return -1;
    if (b === 'latest') return 1;
    return b.localeCompare(a);
  });
}

export async function loadWorld(slotName = 'latest') {
  const key = `world:${slotName}`;
  try {
    const db = await openDB();
    const result = await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE], 'readonly');
      const request = tx.objectStore(STORE).get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error || new Error('Error de lectura en IndexedDB'));
      tx.onabort = () => reject(tx.error || new Error('Lectura cancelada'));
    });
    db.close();
    if (result) return { data: result, backend: 'indexedDB', slot: slotName };
  } catch (error) {
    if ('indexedDB' in globalThis) console.warn('IndexedDB no disponible; se intentará la copia local.', error);
  }

  if (slotName === 'latest') {
    const raw = safeLocalGet();
    if (!raw) return { data: null, backend: 'none', slot: slotName };
    try {
      return { data: JSON.parse(raw), backend: 'localStorage', slot: slotName };
    } catch {
      removeFallback();
      throw new Error('La instantánea local está dañada y se ha descartado');
    }
  }
  return { data: null, backend: 'none', slot: slotName };
}

export async function deleteSlot(slotName) {
  const key = `world:${slotName}`;
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE], 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    if ('indexedDB' in globalThis) console.warn('No se pudo borrar el slot:', error);
  }
}

export async function clearSavedWorld() {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE], 'readwrite');
      tx.objectStore(STORE).delete('world:latest');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    if ('indexedDB' in globalThis) console.warn('No se pudo limpiar IndexedDB.', error);
  }
  removeFallback();
}

export async function recordStats(simulation) {
  const stats = {
    maxPopulation: simulation.creatures.length,
    maxGeneration: simulation.maxGeneration?.() ?? simulation.generation,
    totalWorks: simulation.workshop?.obras.length ?? 0,
    totalBirths: simulation.totalBirths,
    totalDeaths: simulation.totalDeaths,
    sessionYear: simulation.year,
    recordedAt: new Date().toISOString()
  };
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction([STATS_STORE], 'readwrite');
      tx.objectStore(STATS_STORE).put(stats, 'latest');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    if ('indexedDB' in globalThis) console.warn('No se pudo guardar estadísticas:', error);
  }
}

export async function getStats() {
  try {
    const db = await openDB();
    const result = await new Promise((resolve, reject) => {
      const tx = db.transaction([STATS_STORE], 'readonly');
      const request = tx.objectStore(STATS_STORE).get('latest');
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return result;
  } catch (error) {
    if ('indexedDB' in globalThis) console.warn('No se pudo leer estadísticas:', error);
    return null;
  }
}

function safeLocalGet() {
  try { return localStorage.getItem(LOCAL_FALLBACK_KEY); }
  catch { return null; }
}

function removeFallback() {
  try { localStorage.removeItem(LOCAL_FALLBACK_KEY); }
  catch { /* El almacenamiento puede estar bloqueado. */ }
}
