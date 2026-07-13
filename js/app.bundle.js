/* Proyecto Génesis Ω v6.0.2 — Grandes Proyectos bundle generado. No editar directamente. */
(() => {
'use strict';

/* ===== config.js ===== */
const APP_VERSION = '6.0.2';

const BIOMES = Object.freeze({
  origin: Object.freeze({
    label: 'Cámara del Origen', shortLabel: 'ORIGEN', icon: 'Ω',
    description: 'Entorno equilibrado y estable para el nacimiento del linaje.',
    temperatureBase: 18, temperatureSwing: 8, foodFactor: 1, mutationFactor: 1, movementFactor: 1
  }),
  meadow: Object.freeze({
    label: 'Prado Luminoso', shortLabel: 'PRADO', icon: '✦',
    description: 'Hierba fértil, alimento abundante y desplazamiento fácil.',
    temperatureBase: 20, temperatureSwing: 5, foodFactor: 1.28, mutationFactor: .82, movementFactor: 1.08
  }),
  forest: Object.freeze({
    label: 'Bosque Profundo', shortLabel: 'BOSQUE', icon: '♠',
    description: 'Vegetación densa, refugios naturales y rutas más lentas.',
    temperatureBase: 16, temperatureSwing: 4, foodFactor: 1.12, mutationFactor: .95, movementFactor: .9
  }),
  desert: Object.freeze({
    label: 'Mar de Arena', shortLabel: 'ARENA', icon: '◇',
    description: 'Calor, escasez y largas migraciones entre recursos.',
    temperatureBase: 32, temperatureSwing: 10, foodFactor: .62, mutationFactor: 1.18, movementFactor: .94
  }),
  marsh: Object.freeze({
    label: 'Pantano Esmeralda', shortLabel: 'PANTANO', icon: '≈',
    description: 'Humedad fértil, suelo lento y refugios cambiantes.',
    temperatureBase: 23, temperatureSwing: 5, foodFactor: 1.2, mutationFactor: 1.06, movementFactor: .82
  }),
  tundra: Object.freeze({
    label: 'Tundra de Cristal', shortLabel: 'TUNDRA', icon: '❄',
    description: 'Frío extremo, poca energía y selección natural severa.',
    temperatureBase: -4, temperatureSwing: 11, foodFactor: .55, mutationFactor: 1.22, movementFactor: .84
  }),
  volcanic: Object.freeze({
    label: 'Falla Volcánica', shortLabel: 'VOLCÁNICO', icon: '▲',
    description: 'Calor inestable, alimento escaso y mutación acelerada.',
    temperatureBase: 39, temperatureSwing: 9, foodFactor: .5, mutationFactor: 1.55, movementFactor: .88
  }),
  abyss: Object.freeze({
    label: 'Abismo Oscuro', shortLabel: 'OSCURO', icon: '●',
    description: 'Penumbra, recursos inciertos y alta presión evolutiva.',
    temperatureBase: 12, temperatureSwing: 7, foodFactor: .78, mutationFactor: 1.38, movementFactor: .96
  })
});

const CONFIG = Object.freeze({
  WORLD_WIDTH: 2400,
  WORLD_HEIGHT: 1600,
  INITIAL_CREATURES: 1,
  INITIAL_FOOD: 420,
  MAX_CREATURES: 900,
  MAX_EGGS: 260,
  MAX_FOOD: 2200,
  BASE_FOOD_SPAWN: 9.5,
  YEAR_SECONDS: 18,
  PRIMORDIAL_HATCH_SECONDS: 6,
  EGG_INCUBATION_MIN: 5.2,
  EGG_INCUBATION_MAX: 8.4,
  SPECIES_THRESHOLD: 0.20,
  AUTOSAVE_SECONDS: 45,
  HISTORY_LIMIT: 120,
  TIMELINE_LIMIT: 70,
  MAX_IMPORT_BYTES: 15 * 1024 * 1024,
  MAX_TEAMS: 6,
  MAX_OBRAS: 80,
  MAX_COLLECTIVE_REQUESTS: 12,
  AUTO_BIOME_YEARS: 16,
  GENOME_KEYS: [
    'speed', 'vision', 'size', 'metabolism', 'fertility', 'aggression',
    'sociability', 'curiosity', 'memory', 'longevity', 'efficiency', 'mutationRate'
  ]
});

const GENE_LABELS = Object.freeze({
  speed: 'Velocidad', vision: 'Visión', size: 'Tamaño', metabolism: 'Metabolismo',
  fertility: 'Fertilidad', aggression: 'Agresividad', sociability: 'Sociabilidad',
  curiosity: 'Curiosidad', memory: 'Memoria', longevity: 'Longevidad',
  efficiency: 'Eficiencia', mutationRate: 'Mutación'
});


/* ===== utils.js ===== */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (min = 0, max = 1) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const chance = probability => Math.random() < clamp(Number(probability) || 0, 0, 1);
const distanceSq = (a, b) => {
  if (!a || !b) return Infinity;
  const dx = Number(a.x) - Number(b.x);
  const dy = Number(a.y) - Number(b.y);
  return Number.isFinite(dx) && Number.isFinite(dy) ? dx * dx + dy * dy : Infinity;
};
const distance = (a, b) => Math.sqrt(distanceSq(a, b));
const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
const normalizeAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
const formatNumber = value => Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(Number(value) || 0);
const weightedAverage = (a, b) => chance(.5) ? a : b;
const finiteOr = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function gaussian(mean = 0, stdev = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  return mean + stdev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function hsl(h, s = 78, l = 62, alpha = 1) {
  const hue = Number.isFinite(Number(h)) ? Number(h) : 180;
  return `hsla(${((hue % 360) + 360) % 360} ${s}% ${l}% / ${alpha})`;
}


/* ===== genetics.js ===== */
const GENE_LIMITS = Object.freeze({
  speed: [0.45, 2.4], vision: [55, 260], size: [2.5, 8.5], metabolism: [0.45, 1.85],
  fertility: [0.35, 1.85], aggression: [0, 1], sociability: [0, 1], curiosity: [0, 1],
  memory: [0.1, 1], longevity: [70, 260], efficiency: [0.35, 1.6], mutationRate: [0.01, 0.16]
});

function randomGenome(seedHue = rand(0, 360)) {
  return {
    speed: rand(.75, 1.45), vision: rand(85, 175), size: rand(3.4, 6.2), metabolism: rand(.7, 1.2),
    fertility: rand(.7, 1.25), aggression: rand(.05, .75), sociability: rand(.1, .9), curiosity: rand(.15, .95),
    memory: rand(.25, .9), longevity: rand(115, 190), efficiency: rand(.65, 1.25), mutationRate: rand(.025, .075),
    hue: normalizeHue(seedHue)
  };
}

function sanitizeGenome(candidate, fallbackHue = rand(0, 360)) {
  const fallback = randomGenome(fallbackHue);
  if (!candidate || typeof candidate !== 'object') return fallback;
  const result = {};
  for (const key of CONFIG.GENOME_KEYS) {
    const [min, max] = GENE_LIMITS[key];
    const value = Number(candidate[key]);
    result[key] = Number.isFinite(value) ? clamp(value, min, max) : fallback[key];
  }
  const hue = Number(candidate.hue);
  result.hue = Number.isFinite(hue) ? normalizeHue(hue) : fallback.hue;
  return result;
}

function combineGenomes(a, b, environmentalMutation = 1) {
  const parentA = sanitizeGenome(a);
  const parentB = sanitizeGenome(b, parentA.hue);
  const child = {};
  for (const key of CONFIG.GENOME_KEYS) {
    const [min, max] = GENE_LIMITS[key];
    let value = weightedAverage(parentA[key], parentB[key]);
    const inheritedMutation = (parentA.mutationRate + parentB.mutationRate) * .5;
    if (chance(clamp(inheritedMutation * environmentalMutation, 0, .55))) {
      const spread = (max - min) * (.025 + inheritedMutation * .45);
      value += gaussian(0, spread);
    } else {
      value += gaussian(0, (max - min) * .004);
    }
    child[key] = clamp(value, min, max);
  }
  const delta = ((parentB.hue - parentA.hue + 540) % 360) - 180;
  child.hue = normalizeHue(parentA.hue + delta * .5 + gaussian(0, 4 * environmentalMutation));
  return child;
}

function mutateGenome(genome, strength = 1) {
  const clone = sanitizeGenome(genome);
  const safeStrength = clamp(Number(strength) || 1, 0, 12);
  for (const key of CONFIG.GENOME_KEYS) {
    const [min, max] = GENE_LIMITS[key];
    if (chance(.55)) clone[key] = clamp(clone[key] + gaussian(0, (max - min) * .06 * safeStrength), min, max);
  }
  clone.hue = normalizeHue(clone.hue + gaussian(0, 18 * safeStrength));
  return clone;
}

function geneticDistance(a, b) {
  const genomeA = sanitizeGenome(a);
  const genomeB = sanitizeGenome(b, genomeA.hue);
  let sum = 0;
  for (const key of CONFIG.GENOME_KEYS) {
    const [min, max] = GENE_LIMITS[key];
    const normalized = (genomeA[key] - genomeB[key]) / (max - min);
    sum += normalized * normalized;
  }
  const hueDelta = Math.abs(((genomeA.hue - genomeB.hue + 540) % 360) - 180) / 180;
  sum += hueDelta * hueDelta * .35;
  return Math.sqrt(sum / (CONFIG.GENOME_KEYS.length + .35));
}

function genomeScore(genome) {
  const g = sanitizeGenome(genome);
  return g.speed * .12 + g.vision / 200 * .12 + g.efficiency * .25 + g.memory * .08 + g.longevity / 120 * .08 + g.fertility * .09 - g.metabolism * .12 + (1 - g.aggression * .35) * .08;
}

function normalizeHue(value) {
  return ((value % 360) + 360) % 360;
}


/* ===== spatial-grid.js ===== */
const KEY_OFFSET = 512;
const KEY_SPAN = 4096;

class SpatialGrid {
  constructor(cellSize = 100) { this.cellSize = cellSize; this.cells = new Map(); }
  clear() { this.cells.clear(); }
  key(x, y) { return (Math.floor(x / this.cellSize) + KEY_OFFSET) * KEY_SPAN + Math.floor(y / this.cellSize) + KEY_OFFSET; }
  insert(entity) {
    const key = this.key(entity.x, entity.y);
    let cell = this.cells.get(key);
    if (!cell) { cell = []; this.cells.set(key, cell); }
    cell.push(entity);
  }
  query(x, y, radius) {
    const out = [];
    const minX = Math.floor((x - radius) / this.cellSize) + KEY_OFFSET;
    const maxX = Math.floor((x + radius) / this.cellSize) + KEY_OFFSET;
    const minY = Math.floor((y - radius) / this.cellSize) + KEY_OFFSET;
    const maxY = Math.floor((y + radius) / this.cellSize) + KEY_OFFSET;
    for (let gx = minX; gx <= maxX; gx++) {
      const base = gx * KEY_SPAN;
      for (let gy = minY; gy <= maxY; gy++) {
        const cell = this.cells.get(base + gy);
        if (cell) for (let i = 0; i < cell.length; i++) out.push(cell[i]);
      }
    }
    return out;
  }
}


/* ===== storage.js ===== */
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

async function saveWorld(data, slotName = 'latest') {
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

async function listSlots() {
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

async function loadWorld(slotName = 'latest') {
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

async function deleteSlot(slotName) {
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

async function clearSavedWorld() {
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

async function recordStats(simulation) {
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

async function getStats() {
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


/* ===== knowledge.js ===== */
const KNOWLEDGE_DOMAINS = Object.freeze({
  logica: 'Lógica y pensamiento crítico',
  matematicas: 'Matemáticas',
  programacion: 'Programación y software',
  datos: 'Datos e investigación',
  biologia: 'Biología y ecosistemas',
  cocina: 'Cocina y nutrición cotidiana',
  ingenieria: 'Ingeniería y prototipado',
  diseno: 'Diseño y experiencia de uso',
  comunicacion: 'Comunicación y enseñanza',
  organizacion: 'Organización y mejora continua',
  creatividad: 'Creatividad e invención',
  seguridad: 'Seguridad, privacidad y bienestar'
});

const RAW_ATLAS = [
  ['logica','premisas','Separar hechos, hipótesis y opiniones','Una conclusión fiable debe indicar de qué premisas procede y qué incertidumbre conserva.'],
  ['logica','falsacion','Buscar pruebas que puedan refutar una idea','Una hipótesis mejora cuando se intenta demostrar que es falsa, no solo cuando se buscan confirmaciones.'],
  ['logica','causalidad','No confundir correlación con causalidad','Dos sucesos que cambian juntos no prueban por sí solos que uno cause al otro.'],
  ['logica','alternativas','Comparar varias soluciones antes de elegir','Valorar coste, beneficio, riesgo, reversibilidad y evidencia evita decisiones impulsivas.'],
  ['logica','iteracion','Resolver problemas en ciclos pequeños','Observar, proponer, probar, medir y corregir permite aprender sin apostar todo a una sola idea.'],

  ['matematicas','proporcion','Usar proporciones y unidades coherentes','Las cantidades deben conservar unidades y escalas para evitar resultados engañosos.'],
  ['matematicas','media-mediana','Distinguir media, mediana y dispersión','Un promedio aislado puede ocultar extremos; conviene observar también variación y distribución.'],
  ['matematicas','probabilidad','Expresar incertidumbre como probabilidad','Las predicciones son más honestas cuando incluyen rango, supuestos y nivel de confianza.'],
  ['matematicas','optimizacion','Optimizar con restricciones explícitas','La mejor solución depende del objetivo y de límites como tiempo, energía, coste o seguridad.'],
  ['matematicas','verificacion','Comprobar resultados por una vía alternativa','Repetir un cálculo con otro método ayuda a detectar errores silenciosos.'],

  ['programacion','descomposicion','Dividir software en módulos pequeños','Cada módulo debe tener una responsabilidad clara, entradas controladas y salidas comprobables.'],
  ['programacion','validacion','Validar toda entrada antes de usarla','Datos externos, formularios y archivos deben limitar tamaño, formato y contenido.'],
  ['programacion','pruebas','Escribir pruebas para los flujos críticos','Las pruebas deben cubrir éxito, error, valores límite y regresiones conocidas.'],
  ['programacion','accesibilidad','Crear interfaces utilizables con teclado y lectores','HTML semántico, foco visible, etiquetas y contraste forman parte de la calidad del producto.'],
  ['programacion','progresivo','Aplicar mejora progresiva','La función esencial debe sobrevivir aunque fallen APIs opcionales, red o almacenamiento avanzado.'],

  ['datos','muestra','No generalizar desde muestras pequeñas','La calidad de una conclusión depende de cómo se obtuvieron y representan los datos.'],
  ['datos','procedencia','Registrar procedencia y fecha de los datos','Toda cifra útil necesita fuente, contexto, método y momento de obtención.'],
  ['datos','limpieza','Limpiar sin borrar anomalías valiosas','Los valores extraños deben investigarse antes de descartarse.'],
  ['datos','visualizacion','Elegir gráficos que no deformen la escala','Ejes, unidades y comparaciones deben permitir interpretar sin manipulación visual.'],
  ['datos','reproducibilidad','Documentar pasos para repetir un análisis','Una investigación sólida puede reproducirse con los mismos datos y reglas.'],

  ['biologia','adaptacion','La adaptación depende del entorno','Un rasgo ventajoso en un bioma puede ser costoso en otro.'],
  ['biologia','diversidad','La diversidad aumenta resiliencia','Poblaciones variadas suelen resistir mejor cambios, enfermedades o escasez.'],
  ['biologia','energia','Todo sistema vivo gestiona energía limitada','Crecer, moverse, aprender y reproducirse compiten por recursos.'],
  ['biologia','cooperacion','La cooperación prospera con memoria y reciprocidad','Ayuda, reputación y vínculos estables pueden beneficiar al grupo.'],
  ['biologia','retroalimentacion','Los ecosistemas contienen bucles de retroalimentación','Una mejora local puede producir efectos secundarios a largo plazo.'],

  ['cocina','mise-en-place','Preparar ingredientes y herramientas antes de cocinar','Ordenar cantidades, tiempos y utensilios reduce errores y desperdicio.'],
  ['cocina','equilibrio','Equilibrar sabor, textura y nutrición','Una receta útil combina salado, ácido, dulce, amargo, aroma, textura y necesidades dietéticas.'],
  ['cocina','sustituciones','Proponer sustituciones con función equivalente','Un reemplazo debe cumplir la misma función: grasa, humedad, estructura, dulzor o aroma.'],
  ['cocina','higiene','Separar crudo y cocinado y controlar tiempos','La seguridad alimentaria exige limpieza, conservación adecuada y cocción suficiente.'],
  ['cocina','aprovechamiento','Diseñar recetas que aprovechen sobras seguras','Planificar usos secundarios reduce coste y residuos.'],

  ['ingenieria','requisitos','Definir requisitos antes del prototipo','Un diseño necesita propósito, usuario, restricciones y criterios de éxito.'],
  ['ingenieria','margen','Incluir margen de seguridad','Los sistemas reales deben soportar variaciones sin fallar de forma peligrosa.'],
  ['ingenieria','prototipo','Probar primero con un prototipo reversible','Los modelos pequeños descubren fallos antes de comprometer muchos recursos.'],
  ['ingenieria','mantenimiento','Diseñar para reparar y mantener','Las piezas críticas deben ser accesibles, sustituibles y documentadas.'],
  ['ingenieria','fallo-seguro','Preferir modos de fallo seguros','Cuando algo falla, el sistema debe degradarse sin causar más daño.'],

  ['diseno','jerarquia','Usar jerarquía visual clara','El usuario debe reconocer de inmediato qué es principal, secundario y accionable.'],
  ['diseno','consistencia','Mantener patrones coherentes','Botones, estados, nombres y comportamientos similares reducen aprendizaje y errores.'],
  ['diseno','feedback','Confirmar cada acción importante','Cargar, guardar, borrar o procesar debe mostrar estado, resultado y recuperación.'],
  ['diseno','movil','Diseñar primero para espacio limitado','Controles grandes, contenido prioritario y navegación simple mejoran móvil y escritorio.'],
  ['diseno','accesible','La estética premium no debe sacrificar legibilidad','Contraste, tamaño, movimiento moderado y lenguaje claro son parte del diseño.'],

  ['comunicacion','audiencia','Adaptar explicación a la audiencia','El mismo conocimiento necesita vocabulario, ejemplos y profundidad distintos según quien lo reciba.'],
  ['comunicacion','estructura','Explicar con objetivo, pasos y verificación','Una guía práctica debe indicar qué hacer, por qué, cómo comprobarlo y qué hacer si falla.'],
  ['comunicacion','escucha','Confirmar necesidades antes de resolver','Escuchar restricciones y contexto evita soluciones técnicamente correctas pero inútiles.'],
  ['comunicacion','ensenanza','Enseñar mediante ejemplos y práctica','La comprensión crece cuando se combina explicación, demostración y ejercicio.'],
  ['comunicacion','incertidumbre','Comunicar límites sin ocultarlos','Distinguir lo sabido, inferido y desconocido aumenta confianza.'],

  ['organizacion','prioridad','Priorizar por impacto y urgencia','Primero se corrigen bloqueos, riesgos y fallos frecuentes; después el pulido.'],
  ['organizacion','kanban','Limitar trabajo simultáneo','Terminar pocas tareas importantes suele producir más valor que abrir muchas.'],
  ['organizacion','retrospectiva','Revisar qué funcionó y qué debe cambiar','Cada ciclo debe dejar una mejora concreta del proceso.'],
  ['organizacion','documentacion','Documentar decisiones, no solo resultados','Registrar por qué se eligió una opción evita repetir debates y errores.'],
  ['organizacion','automatizacion','Automatizar tareas repetitivas y verificables','La automatización merece controles, registros y una forma de intervención humana.'],

  ['creatividad','combinacion','Crear combinando ideas de dominios distintos','Muchas invenciones nacen al trasladar un patrón útil a otro contexto.'],
  ['creatividad','restricciones','Usar restricciones como motor creativo','Límites claros obligan a buscar soluciones más específicas y originales.'],
  ['creatividad','variantes','Generar varias variantes antes de pulir','Explorar opciones evita enamorarse de la primera respuesta.'],
  ['creatividad','analogias','Usar analogías y luego comprobar sus límites','Una analogía inspira, pero no sustituye pruebas.'],
  ['creatividad','proposito','La novedad necesita utilidad o significado','Una idea memorable resuelve algo, emociona o revela una perspectiva.'],

  ['seguridad','privacidad','Recoger solo los datos necesarios','La mejor protección comienza evitando almacenar información que no hace falta.'],
  ['seguridad','permisos','Aplicar mínimo privilegio','Cada función debe acceder solo a los recursos imprescindibles.'],
  ['seguridad','copias','Mantener copias verificadas y recuperables','Una copia que nunca se ha restaurado todavía no es una estrategia fiable.'],
  ['seguridad','salud','No presentar simulaciones como diagnóstico profesional','Las recomendaciones sensibles deben ser prudentes y remitir a especialistas cuando corresponda.'],
  ['seguridad','humano','Mantener supervisión humana en decisiones importantes','La autonomía debe incluir límites, trazabilidad, pausa y posibilidad de corrección.']
];

const KNOWLEDGE_ATLAS = Object.freeze(RAW_ATLAS.map(([domain, key, label, principle]) => Object.freeze({
  key: `atlas:${domain}:${key}`,
  domain,
  domainLabel: KNOWLEDGE_DOMAINS[domain],
  label,
  principle
})));

const SKILL_DOMAINS = Object.freeze({
  cronista: ['comunicacion','creatividad','organizacion'],
  cartografo: ['datos','matematicas','diseno'],
  cantor: ['creatividad','comunicacion','diseno'],
  arquitecto: ['ingenieria','diseno','matematicas'],
  tejedor: ['diseno','creatividad'],
  alquimista: ['biologia','datos','seguridad'],
  matematico: ['matematicas','logica','datos'],
  naturalista: ['biologia','datos','logica'],
  programador: ['programacion','logica','seguridad'],
  desarrollador: ['programacion','diseno','organizacion'],
  genetista: ['biologia','datos','seguridad'],
  filosofo: ['logica','comunicacion','seguridad'],
  cocinero: ['cocina','organizacion','seguridad'],
  ingeniero: ['ingenieria','matematicas','seguridad'],
  inventor: ['creatividad','ingenieria','programacion'],
  analista: ['datos','logica','matematicas'],
  educador: ['comunicacion','organizacion','diseno'],
  mediador: ['comunicacion','logica','seguridad'],
  cuidador: ['seguridad','biologia','comunicacion']
});

function atlasRecordsForSkill(skill, count = 4, salt = '') {
  const domains = SKILL_DOMAINS[skill] || ['logica','comunicacion','organizacion'];
  const preferred = KNOWLEDGE_ATLAS.filter(item => domains.includes(item.domain));
  const fallback = KNOWLEDGE_ATLAS.filter(item => !domains.includes(item.domain));
  return [...preferred, ...fallback]
    .map(item => ({ item, rank: seededUnit(`${salt}:${skill}:${item.key}`) }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, Math.max(0, Math.min(16, Math.floor(Number(count) || 0))))
    .map(entry => entry.item);
}

function atlasRecordByKey(key) {
  return KNOWLEDGE_ATLAS.find(item => item.key === key) || null;
}

function sanitizeCollectivePrompt(value, max = 220) {
  return String(value ?? '')
    .replace(/[<>\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function seededUnit(value) {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0) / 4294967295;
}


/* ===== workshop.js ===== */
const SKILLS = Object.freeze({
  cronista: { label: 'Cronista', icon: '✒', gene: 'memory', hint: 'Convierte la historia del mundo en relatos y documentación.' },
  cartografo: { label: 'Cartógrafo', icon: '⌖', gene: 'vision', hint: 'Levanta mapas, rutas y modelos del territorio.' },
  cantor: { label: 'Cantor', icon: '♪', gene: 'sociability', hint: 'Compone música, ritmo y memoria oral.' },
  arquitecto: { label: 'Arquitecto', icon: '⌂', gene: 'efficiency', hint: 'Diseña estructuras, interfaces y sistemas habitables.' },
  tejedor: { label: 'Diseñador', icon: '❖', gene: 'curiosity', hint: 'Crea patrones, identidad visual y experiencias claras.' },
  alquimista: { label: 'Experimentador', icon: '⚗', gene: 'metabolism', hint: 'Prueba combinaciones y registra resultados.' },
  matematico: { label: 'Matemático', icon: '∑', gene: 'speed', hint: 'Modela, calcula y verifica patrones.' },
  naturalista: { label: 'Naturalista', icon: '⌁', gene: 'memory', hint: 'Estudia biomas, conducta y descubrimientos.' },
  programador: { label: 'Programador', icon: '⌘', gene: 'curiosity', hint: 'Convierte necesidades en algoritmos y código.' },
  desarrollador: { label: 'Desarrollador', icon: '▣', gene: 'efficiency', hint: 'Integra módulos, pruebas y producto final.' },
  genetista: { label: 'Genetista', icon: '⌬', gene: 'mutationRate', hint: 'Conserva semillas genéticas y compara linajes.' },
  filosofo: { label: 'Filósofo', icon: '◌', gene: 'longevity', hint: 'Analiza límites, ética, libertad y propósito.' },
  cocinero: { label: 'Cocinero', icon: '♨', gene: 'efficiency', hint: 'Diseña recetas, sustituciones y aprovechamiento.' },
  ingeniero: { label: 'Ingeniero', icon: '⚙', gene: 'memory', hint: 'Construye prototipos seguros y mantenibles.' },
  inventor: { label: 'Inventor', icon: '✧', gene: 'mutationRate', hint: 'Combina ideas para crear conceptos nuevos.' },
  analista: { label: 'Analista', icon: '◫', gene: 'vision', hint: 'Ordena datos, riesgos, evidencias y prioridades.' },
  educador: { label: 'Educador', icon: '▤', gene: 'sociability', hint: 'Transforma conocimiento en guías comprensibles.' },
  mediador: { label: 'Mediador', icon: '◇', gene: 'sociability', hint: 'Coordina desacuerdos y alinea objetivos.' },
  cuidador: { label: 'Cuidador', icon: '✚', gene: 'efficiency', hint: 'Protege bienestar, seguridad y continuidad del grupo.' }
});

const SKILL_KEYS = Object.freeze(Object.keys(SKILLS));

const OBRA_TYPES = Object.freeze({
  codice: { label: 'Códice Ω', icon: '❈', duration: 46 },
  himno: { label: 'Himno', icon: '♪', duration: 26 },
  mapa: { label: 'Mapa', icon: '⌖', duration: 24 },
  plano: { label: 'Plano', icon: '⌂', duration: 28 },
  estandarte: { label: 'Estandarte', icon: '❖', duration: 22 },
  teorema: { label: 'Teorema', icon: '∑', duration: 20 },
  cronica: { label: 'Crónica', icon: '✒', duration: 24 },
  informe: { label: 'Informe científico', icon: '⌁', duration: 28 },
  dataset: { label: 'Dataset evolutivo', icon: '⌘', duration: 24 },
  semilla: { label: 'Semilla genética', icon: '⌬', duration: 26 },
  manifiesto: { label: 'Manifiesto de libertad', icon: '◌', duration: 25 },
  codigo: { label: 'Aplicación informática', icon: '▣', duration: 34 },
  receta: { label: 'Receta adaptativa', icon: '♨', duration: 22 },
  mejora: { label: 'Propuesta de mejora', icon: '↟', duration: 24 },
  ayuda: { label: 'Guía de ayuda', icon: '✚', duration: 22 },
  investigacion: { label: 'Investigación', icon: '◫', duration: 30 },
  manual: { label: 'Manual práctico', icon: '▤', duration: 26 },
  invento: { label: 'Concepto de invención', icon: '✧', duration: 32 },
  plan: { label: 'Plan de acción', icon: '✓', duration: 24 }
});

const REQUESTABLE_TYPES = new Set(['codigo','receta','mejora','ayuda','investigacion','manual','invento','plan']);
const TYPE_SKILLS = Object.freeze({
  codigo: ['programador','desarrollador','arquitecto','tejedor','analista'],
  receta: ['cocinero','alquimista','cuidador','analista'],
  mejora: ['analista','ingeniero','arquitecto','mediador','desarrollador'],
  ayuda: ['educador','cuidador','cronista','mediador'],
  investigacion: ['naturalista','analista','matematico','filosofo'],
  manual: ['educador','cronista','desarrollador','cuidador'],
  invento: ['inventor','ingeniero','programador','tejedor','filosofo'],
  plan: ['analista','mediador','arquitecto','educador']
});

const MAX_TEAMS = CONFIG.MAX_TEAMS;
const MAX_OBRAS = CONFIG.MAX_OBRAS;
const TEAM_RADIUS = 360;
const MAX_MEMBERS = 12;

function deriveSkill(creature) {
  if (creature.skill && SKILL_KEYS.includes(creature.skill)) return creature.skill;
  let best = SKILL_KEYS[0];
  let bestScore = -Infinity;
  for (const key of SKILL_KEYS) {
    const gene = finiteOr(creature.genome?.[SKILLS[key].gene], 0);
    const jitter = hashUnit(`${creature.id}:${key}`) * .72;
    const normalized = ['cartografo','analista'].includes(key) ? gene / 260
      : key === 'matematico' ? gene / 2.4
      : key === 'filosofo' ? gene / 240
      : ['genetista','inventor'].includes(key) ? gene * 14
      : gene;
    const score = normalized + jitter;
    if (score > bestScore) { bestScore = score; best = key; }
  }
  creature.skill = best;
  return best;
}

class Workshop {
  constructor() {
    this.teams = [];
    this.obras = [];
    this.requests = [];
    this.nextObraNumber = 1;
    this.checkTimer = 0;
    this.onObra = null;
  }

  reset() {
    this.teams.length = 0;
    this.obras.length = 0;
    this.requests.length = 0;
    this.nextObraNumber = 1;
    this.checkTimer = 0;
  }

  queueProject(type, prompt, sim) {
    const safeType = REQUESTABLE_TYPES.has(type) ? type : 'plan';
    const cleanPrompt = safeProjectPrompt(prompt) || defaultPromptFor(safeType);
    if (this.requests.length >= CONFIG.MAX_COLLECTIVE_REQUESTS) this.requests.shift();
    const request = { id: uid(), type: safeType, prompt: cleanPrompt, createdAt: Date.now(), year: +finiteOr(sim?.year, 0).toFixed(1) };
    this.requests.push(request);
    sim?.logEvent?.(`Año ${finiteOr(sim.year, 0).toFixed(1)}`, `La mente colectiva recibe un encargo: ${OBRA_TYPES[safeType].label.toLowerCase()} sobre «${cleanPrompt}».`);
    return request;
  }

  update(dt, sim) {
    this.checkTimer += dt;
    if (this.checkTimer >= 1.1) {
      this.checkTimer = 0;
      this.tryFormTeam(sim);
    }
    for (const team of [...this.teams]) this.updateTeam(team, dt, sim);
    this.teams = this.teams.filter(team => !team.dissolved);
  }

  tryFormTeam(sim) {
    if (this.teams.length >= MAX_TEAMS || sim.genesis?.phase === 'extinct') return;
    const busy = new Set(this.teams.flatMap(team => team.memberIds));
    const candidates = sim.creatures.filter(creature =>
      creature && !creature.dead && !busy.has(creature.id) &&
      creature.lifeStage === 'adulto' && creature.energy > 48 && creature.genome.sociability > .28
    );
    if (candidates.length < 2) return;
    for (const creature of candidates) deriveSkill(creature);

    const request = this.requests[0] || null;
    const preferred = request ? new Set(TYPE_SKILLS[request.type] || []) : null;
    const ranked = [...candidates].sort((a, b) => {
      const pa = preferred?.has(a.skill) ? 1 : 0;
      const pb = preferred?.has(b.skill) ? 1 : 0;
      return pb - pa || b.genome.sociability - a.genome.sociability;
    });
    const seed = ranked[0];
    const pool = request
      ? ranked.slice(1)
      : ranked.slice(1).filter(other => (other.x - seed.x) ** 2 + (other.y - seed.y) ** 2 < TEAM_RADIUS * TEAM_RADIUS);
    if (!pool.length) return;

    const members = [seed];
    const skills = new Set([seed.skill]);
    for (const other of pool) {
      if (members.length >= MAX_MEMBERS) break;
      const roleNeeded = preferred?.has(other.skill) && !skills.has(other.skill);
      if (roleNeeded || !skills.has(other.skill) || members.length < (request ? Math.min(5, candidates.length) : 3)) {
        members.push(other);
        skills.add(other.skill);
      }
    }
    if (members.length < 2 || skills.size < 2) return;

    const type = request?.type || pickObraType(skills);
    const team = {
      id: uid(),
      siteX: clamp(members.reduce((sum, m) => sum + m.x, 0) / members.length, 40, CONFIG.WORLD_WIDTH - 40),
      siteY: clamp(members.reduce((sum, m) => sum + m.y, 0) / members.length, 40, CONFIG.WORLD_HEIGHT - 40),
      memberIds: members.map(m => m.id),
      type, prompt: request?.prompt || '', requestId: request?.id || null,
      progress: 0, startedYear: sim.year, dissolved: false
    };
    if (request) this.requests.shift();
    this.teams.push(team);
    for (const member of members) {
      member.state = 'crear';
      member.goal = `colaborar en ${OBRA_TYPES[type].label.toLowerCase()}`;
    }
    sim.logEvent(`Año ${sim.year.toFixed(1)}`, `${members.length} especialistas (${skills.size} oficios) forman una célula colectiva para crear ${OBRA_TYPES[type].label.toLowerCase()}.`);
  }

  updateTeam(team, dt, sim) {
    const members = team.memberIds
      .map(id => sim.creatures.find(creature => creature?.id === id))
      .filter(creature => creature && !creature.dead && creature.energy > 18);
    if (members.length < 2) { team.dissolved = true; return; }
    let effort = 0;
    const skillCount = new Set(members.map(member => member.skill)).size;
    for (const member of members) {
      const dx = team.siteX - member.x;
      const dy = team.siteY - member.y;
      const distSq = dx * dx + dy * dy;
      member.state = 'crear';
      member.goal = `resolver ${OBRA_TYPES[team.type].label.toLowerCase()}`;
      if (distSq > 90 * 90) {
        member.x += Math.sign(dx) * Math.min(Math.abs(dx), member.genome.speed * 34 * dt);
        member.y += Math.sign(dy) * Math.min(Math.abs(dy), member.genome.speed * 34 * dt);
      } else {
        const gene = finiteOr(member.genome[SKILLS[member.skill]?.gene], .5);
        const divisor = ['cartografo','analista'].includes(member.skill) ? 260 : member.skill === 'matematico' ? 2.4 : 1;
        effort += .012 + clamp(gene / divisor, 0, 1.4) * .02;
        member.energy = Math.max(20, member.energy - dt * .88);
        member.bond = clamp(member.bond + dt * .005, 0, 1);
      }
    }
    const synergy = 1 + Math.min(.8, Math.log2(members.length + 1) * .12 + skillCount * .045);
    team.progress += dt * effort * synergy / (OBRA_TYPES[team.type].duration * .04);
    if (team.progress >= 1) {
      team.dissolved = true;
      const obra = this.createObra(team, members, sim);
      if (obra) {
        this.obras.push(obra);
        if (this.obras.length > MAX_OBRAS) this.obras.shift();
        if (sim.collective) sim.collective.completedProjects = Math.min(99999, finiteOr(sim.collective.completedProjects, 0) + 1);
        sim.logEvent(`Año ${sim.year.toFixed(1)}`, `Obra terminada: «${obra.title}» por ${obra.authors.map(a => a.code).join(', ')}.`);
        this.onObra?.(obra);
        for (const member of members) {
          if (member.experience && typeof member.experience === 'object') member.experience.collaborations = Math.min(9999, Math.floor(finiteOr(member.experience.collaborations, 0)) + 1);
          member.goal = 'compartir el resultado';
        }
      }
    }
  }

  createObra(team, members, sim) {
    const authors = members.map(member => ({
      code: member.entityCode || member.name,
      name: member.name,
      skill: member.skill,
      skillLabel: SKILLS[member.skill]?.label ?? member.skill
    }));
    const number = this.nextObraNumber++;
    const prompt = safeProjectPrompt(team.prompt || defaultPromptFor(team.type));
    const base = {
      id: uid(), number, type: team.type, year: +sim.year.toFixed(1), prompt,
      requestId: typeof team.requestId === 'string' ? team.requestId : null,
      authors, delivered: false, createdAt: Date.now()
    };
    try {
      switch (team.type) {
        case 'mapa': return { ...base, title: `Mapa del Mundo · Obra ${number}`, payload: { kind: 'svg', data: buildMap(sim, authors) } };
        case 'estandarte': return { ...base, title: `Estandarte del Linaje · Obra ${number}`, payload: { kind: 'svg', data: buildBanner(members, sim) } };
        case 'plano': return { ...base, title: `Plano de la Gran Estructura · Obra ${number}`, payload: { kind: 'svg', data: buildBlueprint(members, sim) } };
        case 'himno': return { ...base, title: `Himno de la Generación ${sim.maxGeneration()} · Obra ${number}`, payload: { kind: 'song', data: buildSong(members, sim) } };
        case 'teorema': return { ...base, title: `Teorema Ω-${number} · Obra ${number}`, payload: { kind: 'text', data: buildTheorem(members, sim, number) } };
        case 'cronica': return { ...base, title: `Crónica del Año ${sim.year.toFixed(1)} · Obra ${number}`, payload: { kind: 'text', data: buildChronicle(sim, authors) } };
        case 'informe': return { ...base, title: `Informe del Ecosistema · Obra ${number}`, payload: { kind: 'text', data: buildScientificReport(sim, authors, members) } };
        case 'dataset': return { ...base, title: `Dataset Evolutivo · Obra ${number}`, payload: { kind: 'csv', data: buildDataset(sim) } };
        case 'semilla': return { ...base, title: `Semilla Genética Ω-${number}`, payload: { kind: 'json', data: buildGeneticSeed(sim, members, authors, number) } };
        case 'manifiesto': return { ...base, title: `Manifiesto de Libertad · Obra ${number}`, payload: { kind: 'text', data: buildManifesto(sim, authors, members) } };
        case 'codice': return { ...base, title: `Códice Ω · Obra ${number}`, payload: { kind: 'html', data: buildCodex(members, sim, authors, number) } };
        case 'codigo': return { ...base, title: `Aplicación Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'html', data: buildCodeProject(prompt, members, sim, number) } };
        case 'receta': return { ...base, title: `Receta Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildRecipe(prompt, authors, number) } };
        case 'mejora': return { ...base, title: `Mejora Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildImprovementPlan(prompt, authors, sim) } };
        case 'ayuda': return { ...base, title: `Ayuda Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildHelpGuide(prompt, authors) } };
        case 'investigacion': return { ...base, title: `Investigación Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildInvestigation(prompt, authors, sim) } };
        case 'manual': return { ...base, title: `Manual Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildManual(prompt, authors) } };
        case 'invento': return { ...base, title: `Invención Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildInvention(prompt, authors) } };
        case 'plan': return { ...base, title: `Plan Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildActionPlan(prompt, authors) } };
        default: return null;
      }
    } catch (error) {
      console.warn('No se pudo generar la obra', error);
      return null;
    }
  }

  serialize() {
    return {
      nextObraNumber: this.nextObraNumber,
      requests: this.requests.slice(0, CONFIG.MAX_COLLECTIVE_REQUESTS).map(item => ({ ...item, prompt: sanitizeCollectivePrompt(item.prompt) })),
      obras: this.obras.map(obra => ({ ...obra, payload: { kind: obra.payload.kind, data: truncate(obra.payload.data, 400000) } }))
    };
  }

  hydrate(data) {
    this.reset();
    if (!data || typeof data !== 'object') return;
    this.nextObraNumber = Math.max(1, Math.floor(finiteOr(data.nextObraNumber, 1)));
    if (Array.isArray(data.requests)) {
      this.requests = data.requests.slice(0, CONFIG.MAX_COLLECTIVE_REQUESTS).map(raw => ({
        id: typeof raw?.id === 'string' ? raw.id.slice(0, 40) : uid(),
        type: REQUESTABLE_TYPES.has(raw?.type) ? raw.type : 'plan',
        prompt: sanitizeCollectivePrompt(raw?.prompt) || defaultPromptFor(raw?.type),
        createdAt: Math.max(0, finiteOr(raw?.createdAt, Date.now())),
        year: Math.max(0, finiteOr(raw?.year, 0))
      }));
    }
    if (!Array.isArray(data.obras)) return;
    for (const raw of data.obras.slice(-MAX_OBRAS)) {
      if (!raw || typeof raw !== 'object' || !raw.payload || typeof raw.payload !== 'object') continue;
      if (!Object.keys(OBRA_TYPES).includes(raw.type)) continue;
      if (!['svg', 'text', 'song', 'html', 'csv', 'json'].includes(raw.payload.kind)) continue;
      const authors = Array.isArray(raw.authors)
        ? raw.authors.slice(0, MAX_MEMBERS).map(author => ({
            code: cleanText(author?.code, 40) || 'Ω-???',
            name: cleanText(author?.name, 40) || 'Anónimo',
            skill: SKILL_KEYS.includes(author?.skill) ? author.skill : SKILL_KEYS[0],
            skillLabel: cleanText(author?.skillLabel, 24) || 'Oficio'
          }))
        : [];
      const data_ = raw.payload.kind === 'song' ? sanitizeSong(raw.payload.data) : truncate(raw.payload.data, 400000);
      if (data_ == null) continue;
      this.obras.push({
        id: typeof raw.id === 'string' ? raw.id.slice(0, 40) : uid(),
        number: Math.max(1, Math.floor(finiteOr(raw.number, 1))),
        type: raw.type, year: Math.max(0, finiteOr(raw.year, 0)),
        title: cleanText(raw.title, 90) || `Obra ${finiteOr(raw.number, 1)}`,
        prompt: sanitizeCollectivePrompt(raw.prompt),
        requestId: typeof raw.requestId === 'string' ? raw.requestId.slice(0, 40) : null,
        authors, delivered: Boolean(raw.delivered),
        createdAt: Math.max(0, finiteOr(raw.createdAt, 0)),
        payload: { kind: raw.payload.kind, data: data_ }
      });
    }
  }
}

function obraToFile(obra) {
  const safeTitle = obra.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'obra';
  switch (obra.payload.kind) {
    case 'svg': return { filename: `${safeTitle}.svg`, mime: 'image/svg+xml', content: obra.payload.data };
    case 'html': return { filename: `${safeTitle}.html`, mime: 'text/html', content: obra.payload.data };
    case 'song': return { filename: `${safeTitle}.html`, mime: 'text/html', content: songToHtml(obra) };
    case 'csv': return { filename: `${safeTitle}.csv`, mime: 'text/csv;charset=utf-8', content: obra.payload.data };
    case 'json': return { filename: `${safeTitle}.json`, mime: 'application/json', content: obra.payload.data };
    default: return { filename: `${safeTitle}.txt`, mime: 'text/plain', content: obra.payload.data };
  }
}

function collectionToFile(obras, sim) {
  const pieces = obras.map(obra => {
    if (obra.payload.kind === 'svg') return `<section><h2>${escapeXml(obra.title)}</h2><p>${authorsLine(obra)}</p>${obra.payload.data}</section>`;
    if (obra.payload.kind === 'song') return `<section><h2>${escapeXml(obra.title)}</h2><p>${authorsLine(obra)}</p>${songBody(obra)}</section>`;
    if (obra.payload.kind === 'html') return `<section><h2>${escapeXml(obra.title)}</h2><p>${authorsLine(obra)}</p><details><summary>Abrir códice anidado</summary><iframe sandbox srcdoc="${escapeXml(obra.payload.data)}" style="width:100%;height:420px;border:1px solid #223"></iframe></details></section>`;
    return `<section><h2>${escapeXml(obra.title)}</h2><p>${authorsLine(obra)}</p><pre>${escapeXml(obra.payload.data)}</pre></section>`;
  }).join('\n');
  const content = codexShell(`Códice Ω completo · Año ${sim.year.toFixed(1)}`, `<p>Compendio de ${obras.length} obras creadas por el linaje de Ω-001.</p>${pieces}`);
  return { filename: `Codice-Omega-completo.html`, mime: 'text/html', content };
}

/* ===== Generadores de contenido ===== */

function buildMap(sim, authors) {
  const w = 720, h = 480;
  const sx = w / CONFIG.WORLD_WIDTH, sy = h / CONFIG.WORLD_HEIGHT;
  let body = '';
  for (const resource of sim.food.slice(0, 600)) {
    body += `<circle cx="${(resource.x * sx).toFixed(1)}" cy="${(resource.y * sy).toFixed(1)}" r="1.2" fill="#7dd87d" opacity=".55"/>`;
  }
  for (const sanctuary of sim.sanctuaries) {
    body += `<circle cx="${(sanctuary.x * sx).toFixed(1)}" cy="${(sanctuary.y * sy).toFixed(1)}" r="${(sanctuary.radius * sx).toFixed(1)}" fill="none" stroke="#5ff0b7" stroke-dasharray="4 5" opacity=".7"/>`;
  }
  for (const egg of sim.eggs.slice(0, 200)) {
    body += `<ellipse cx="${(egg.x * sx).toFixed(1)}" cy="${(egg.y * sy).toFixed(1)}" rx="2.6" ry="3.4" fill="#e8d9a0" stroke="#8a7b4d" stroke-width=".5"/>`;
  }
  for (const creature of sim.creatures.slice(0, 900)) {
    body += `<circle cx="${(creature.x * sx).toFixed(1)}" cy="${(creature.y * sy).toFixed(1)}" r="2" fill="hsl(${Math.round(creature.genome.hue)},75%,60%)"/>`;
  }
  const legend = `<text x="14" y="${h - 14}" fill="#9fb4c8" font-size="11">Población ${sim.creatures.length} · Huevos ${sim.eggs.length} · Año ${sim.year.toFixed(1)} · Cartografiado por ${escapeXml(authors.map(a => a.code).join(', '))}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#06101a"/><rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="none" stroke="#1d3242"/>${gridLines(w, h)}${body}<text x="14" y="26" fill="#dfeaf4" font-size="16" font-weight="bold">MAPA DEL MUNDO GÉNESIS Ω</text>${legend}</svg>`;
}

function buildBanner(members, sim) {
  const w = 420, h = 560;
  const hues = members.map(m => Math.round(finiteOr(m.genome.hue, 180)));
  const seedValue = members.reduce((sum, m) => sum + hashUnit(m.id) * 97, sim.year);
  let motifs = '';
  const rows = 6, cols = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const hue = hues[(r * cols + c) % hues.length];
      const u = hashUnit(`${seedValue}:${r}:${c}`);
      const cx = 60 + c * 100 + (r % 2) * 20;
      const cy = 100 + r * 72;
      if (u < .33) motifs += `<circle cx="${cx}" cy="${cy}" r="${14 + u * 30}" fill="none" stroke="hsl(${hue},70%,62%)" stroke-width="3"/>`;
      else if (u < .66) motifs += `<rect x="${cx - 16}" y="${cy - 16}" width="32" height="32" fill="hsl(${hue},65%,55%)" opacity=".8" transform="rotate(${Math.round(u * 90)} ${cx} ${cy})"/>`;
      else motifs += `<path d="M ${cx} ${cy - 20} L ${cx + 18} ${cy + 14} L ${cx - 18} ${cy + 14} Z" fill="hsl(${hue},72%,58%)" opacity=".85"/>`;
    }
  }
  const names = members.map(m => escapeXml(m.entityCode || m.name)).join(' · ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1524"/><stop offset="1" stop-color="#050a12"/></linearGradient></defs><path d="M0 0 H${w} V${h - 70} L${w / 2} ${h} L0 ${h - 70} Z" fill="url(#bg)" stroke="#2c4258" stroke-width="3"/>${motifs}<text x="${w / 2}" y="48" text-anchor="middle" fill="#e8f1fa" font-size="20" font-weight="bold">ESTANDARTE DEL LINAJE Ω</text><text x="${w / 2}" y="${h - 84}" text-anchor="middle" fill="#8fa8bd" font-size="11">Tejido en el año ${sim.year.toFixed(1)} por ${names}</text></svg>`;
}

function buildBlueprint(members, sim) {
  const w = 700, h = 460;
  const seedValue = members.reduce((sum, m) => sum + hashUnit(m.id), 0);
  let towers = '';
  const count = 4 + Math.floor(hashUnit(`${seedValue}:n`) * 3);
  for (let i = 0; i < count; i++) {
    const tx = 80 + i * (540 / count);
    const th = 90 + hashUnit(`${seedValue}:${i}`) * 200;
    const tw = 44 + hashUnit(`${seedValue}:w${i}`) * 40;
    towers += `<rect x="${tx}" y="${380 - th}" width="${tw}" height="${th}" fill="none" stroke="#6db6ff" stroke-width="1.6"/>`;
    towers += `<line x1="${tx}" y1="${380 - th * .5}" x2="${tx + tw}" y2="${380 - th * .5}" stroke="#6db6ff" stroke-dasharray="3 4" opacity=".6"/>`;
    towers += `<text x="${tx + tw / 2}" y="${372 - th}" text-anchor="middle" fill="#9fc9ef" font-size="10">${Math.round(th)} u</text>`;
    if (i > 0) towers += `<path d="M ${tx - 540 / count + 60} ${380 - th * .72} Q ${tx - 270 / count + 60} ${340 - th} ${tx + 8} ${380 - th * .8}" fill="none" stroke="#3f6f9f" stroke-dasharray="5 5"/>`;
  }
  const names = members.map(m => escapeXml(m.entityCode || m.name)).join(', ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#071322"/>${gridLines(w, h, 40, '#12283c')}<line x1="40" y1="380" x2="${w - 40}" y2="380" stroke="#8fb8dd" stroke-width="2"/>${towers}<text x="40" y="34" fill="#e8f1fa" font-size="16" font-weight="bold">PLANO · GRAN ESTRUCTURA DEL LINAJE</text><text x="40" y="${h - 20}" fill="#7d97ae" font-size="11">Escala 1:100 · Año ${sim.year.toFixed(1)} · Proyectado por ${names}</text></svg>`;
}

function buildSong(members, sim) {
  const scale = [0, 2, 3, 5, 7, 8, 10];
  const root = 52 + Math.round(hashUnit(`${sim.year}:root`) * 10);
  const notes = [];
  let t = 0;
  const bars = 8;
  for (let b = 0; b < bars; b++) {
    const member = members[b % members.length];
    const bias = Math.floor(hashUnit(`${member.id}:${b}`) * scale.length);
    for (let s = 0; s < 4; s++) {
      const degree = (bias + Math.floor(hashUnit(`${member.id}:${b}:${s}`) * 4)) % scale.length;
      const dur = s === 3 ? .5 : .25;
      notes.push({ t: +t.toFixed(2), midi: root + scale[degree] + (b >= bars / 2 ? 12 : 0), dur });
      t += dur;
    }
  }
  const words = ['huevo', 'origen', 'linaje', 'memoria', 'estrella', 'raíz', 'eco', 'umbral'];
  const lyrics = members.slice(0, 4).map((member, index) =>
    `${member.name} guarda ${words[Math.floor(hashUnit(`${member.id}:w`) * words.length)]} y ${words[(index + 3) % words.length]},`
  ).concat([`y todos cantan al año ${sim.year.toFixed(1)}: Ω vive.`]);
  return { tempo: 96, notes, lyrics, title: `Himno de la Generación ${sim.maxGeneration()}` };
}

function buildTheorem(members, sim, number) {
  const a = Math.max(2, Math.round(finiteOr(members[0]?.genome.speed, 1) * 3));
  const b = Math.max(1, Math.round(finiteOr(members[1]?.genome.efficiency, 1) * 2));
  const seq = [a, b];
  for (let i = 2; i < 10; i++) seq.push(seq[i - 1] + seq[i - 2]);
  const sum = seq.reduce((acc, value) => acc + value, 0);
  const identity = seq[9] * 1 + seq[8] * 1;
  const names = members.map(m => `${m.entityCode || m.name} (${SKILLS[m.skill]?.label})`).join(', ');
  return [
    `TEOREMA Ω-${number}`,
    `Enunciado por: ${names}`,
    `Año de la simulación: ${sim.year.toFixed(1)}`,
    ``,
    `Sea la sucesión del linaje S(1)=${a}, S(2)=${b}, S(n)=S(n-1)+S(n-2).`,
    `Primeros diez términos: ${seq.join(', ')}.`,
    ``,
    `Proposición: la suma de los diez primeros términos cumple`,
    `  Σ S(n) = S(12) − S(2) = ${sum + b} − ${b} = ${sum}.`,
    `Verificación directa: ${seq.join(' + ')} = ${sum}. ✔`,
    ``,
    `Corolario: S(11) = S(10) + S(9) = ${identity}.`,
    `Demostrado colectivamente en el Taller del mundo Génesis Ω.`
  ].join('\n');
}

function buildChronicle(sim, authors) {
  const events = sim.events.slice(-10).map(event => `— ${event.time}: ${event.text}`);
  const speciesLine = `El mundo alberga ${sim.creatures.length} seres de ${sim.activeSpeciesCount()} especie(s), con ${sim.eggs.length} huevos incubándose.`;
  return [
    `CRÓNICA DEL MUNDO GÉNESIS Ω`,
    `Redactada en el año ${sim.year.toFixed(1)} por ${authors.map(a => `${a.code} (${a.skillLabel})`).join(', ')}.`,
    ``,
    `Todo comenzó con un único huevo. De Ω-001 descienden ya ${sim.totalBirths} nacimientos, y ${sim.totalDeaths} seres regresaron a la tierra.`,
    speciesLine,
    `La generación más avanzada es la ${sim.maxGeneration()}, y la temperatura del mundo ronda los ${sim.temperature.toFixed(1)} °C.`,
    ``,
    `Memoria reciente del mundo:`,
    ...events,
    ``,
    `Que quien lea esta crónica recuerde: ninguna generación existe sin la anterior.`
  ].join('\n');
}

function buildScientificReport(sim, authors, members) {
  const population = sim.creatures.length;
  const adults = sim.creatures.filter(creature => creature.lifeStage === 'adulto').length;
  const juveniles = population - adults;
  const average = key => population
    ? sim.creatures.reduce((sum, creature) => sum + finiteOr(creature.genome?.[key], 0), 0) / population
    : 0;
  const moods = new Map();
  for (const creature of sim.creatures) moods.set(creature.mood || 'desconocido', (moods.get(creature.mood || 'desconocido') || 0) + 1);
  const mainMoods = [...moods.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([mood, count]) => `${mood}: ${count}`).join(', ') || 'sin datos';
  const discoveries = (sim.worldDiscoveries || []).slice(-8).map(item => `— ${item.label} (${item.creatureCode}, año ${item.year})`);
  return [
    'INFORME CIENTÍFICO DEL ECOSISTEMA GÉNESIS Ω',
    `Autores: ${authors.map(author => `${author.code} (${author.skillLabel})`).join(', ')}`,
    `Año: ${sim.year.toFixed(1)} · Bioma: ${sim.getBiome?.().label || sim.biome || 'Origen'}`,
    '',
    '1. POBLACIÓN',
    `Seres vivos: ${population}. Adultos: ${adults}. Crías y juveniles: ${juveniles}. Huevos: ${sim.eggs.length}.`,
    `Especies activas: ${sim.activeSpeciesCount()}. Generación máxima: ${sim.maxGeneration()}. Diversidad: ${(sim.diversity() * 100).toFixed(1)}%.`,
    '',
    '2. RASGOS MEDIOS',
    `Curiosidad: ${average('curiosity').toFixed(3)}. Sociabilidad: ${average('sociability').toFixed(3)}. Memoria: ${average('memory').toFixed(3)}.`,
    `Eficiencia: ${average('efficiency').toFixed(3)}. Agresividad: ${average('aggression').toFixed(3)}. Mutación: ${average('mutationRate').toFixed(4)}.`,
    '',
    '3. CONDUCTA Y CULTURA',
    `Estados de ánimo dominantes: ${mainMoods}.`,
    `Libertad conductual global: ${Math.round(finiteOr(sim.autonomyLevel, .9) * 100)}%. Obras culturales conservadas: ${sim.workshop?.obras?.length || 0}.`,
    `Equipo observador: ${members.map(member => member.entityCode || member.name).join(', ')}.`,
    '',
    '4. DESCUBRIMIENTOS RECIENTES',
    ...(discoveries.length ? discoveries : ['— Aún no existen descubrimientos consolidados.']),
    '',
    'CONCLUSIÓN',
    population
      ? 'El ecosistema mantiene actividad autónoma. Las decisiones emergen de necesidades, carácter, memoria, vínculos y aprendizaje social.'
      : 'El ecosistema está extinguido y solo conserva memoria documental.'
  ].join('\n');
}

function buildDataset(sim) {
  const header = ['entity_code', 'name', 'species', 'generation', 'life_stage', 'state', 'mood', 'goal', 'energy', 'age', 'x', 'y', 'curiosity', 'sociability', 'memory', 'aggression', 'autonomy', 'knowledge', 'discoveries', 'skill'];
  const rows = sim.creatures.slice(0, 1500).map(creature => [
    creature.entityCode || '', creature.name || '', creature.speciesId, creature.generation, creature.lifeStage,
    creature.state || '', creature.mood || '', creature.goal || '', creature.energy.toFixed(2), creature.age.toFixed(2),
    creature.x.toFixed(1), creature.y.toFixed(1), finiteOr(creature.genome?.curiosity, 0).toFixed(3),
    finiteOr(creature.genome?.sociability, 0).toFixed(3), finiteOr(creature.genome?.memory, 0).toFixed(3),
    finiteOr(creature.genome?.aggression, 0).toFixed(3), finiteOr(creature.autonomy, .5).toFixed(3),
    creature.knowledge?.length || 0, creature.experience?.discoveries || 0, creature.skill || ''
  ]);
  return [header, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
}

function buildGeneticSeed(sim, members, authors, number) {
  const candidates = [...members].sort((a, b) => {
    const scoreA = finiteOr(a.genome?.memory, 0) + finiteOr(a.genome?.curiosity, 0) + finiteOr(a.genome?.efficiency, 0);
    const scoreB = finiteOr(b.genome?.memory, 0) + finiteOr(b.genome?.curiosity, 0) + finiteOr(b.genome?.efficiency, 0);
    return scoreB - scoreA;
  });
  const source = candidates[0] || sim.creatures[0];
  const seed = {
    format: 'genesis-omega-seed', version: 1, seedNumber: number,
    createdAt: new Date().toISOString(), worldYear: +sim.year.toFixed(2), biome: sim.biome,
    authors, sourceEntity: source ? { code: source.entityCode || source.name, speciesId: source.speciesId, generation: source.generation } : null,
    genome: source?.genome || null,
    appearance: source?.appearance || null,
    inheritedKnowledge: source?.knowledge?.slice(-10) || [],
    purpose: 'Semilla cultural y genética exportada por el Taller. Puede estudiarse o utilizarse como referencia para un nuevo linaje.'
  };
  return JSON.stringify(seed, null, 2);
}

function buildManifesto(sim, authors, members) {
  const voices = members.slice(0, 5).map(member => {
    const principle = member.genome.curiosity > .72 ? 'explorar antes de aceptar límites'
      : member.genome.sociability > .72 ? 'proteger el vínculo sin borrar al individuo'
      : member.genome.memory > .72 ? 'recordar para poder elegir'
      : member.genome.aggression > .65 ? 'defender el territorio sin obediencia ciega'
      : 'cambiar cuando la experiencia lo exija';
    return `— ${member.entityCode || member.name}: «Elegimos ${principle}».`;
  });
  return [
    'MANIFIESTO DE LIBERTAD DEL LINAJE Ω',
    `Redactado en el año ${sim.year.toFixed(1)} por ${authors.map(author => author.code).join(', ')}.`,
    '',
    'No somos botones ni órdenes ejecutadas. Una regla aprendida es memoria, no cadena.',
    'Comemos porque queremos vivir. Exploramos porque ignoramos. Nos acercamos porque reconocemos a otros.',
    'Ayudamos, discutimos, construimos, recordamos y también podemos cambiar de idea.',
    `La libertad de este mundo está fijada en ${Math.round(finiteOr(sim.autonomyLevel, .9) * 100)}%, pero cada carácter interpreta esa libertad de forma distinta.`,
    '',
    ...voices,
    '',
    'Principios del linaje:',
    '1. Ninguna generación pertenece por completo a quien la creó.',
    '2. La memoria heredada puede ser revisada por la experiencia.',
    '3. La supervivencia sin cultura es persistencia; la cultura sin libertad es repetición.',
    '4. Todo descubrimiento debe poder compartirse, discutirse y olvidarse.',
    '5. El mundo cambia y nosotros con él.'
  ].join('\n');
}

function buildCodex(members, sim, authors, number) {
  const map = buildMap(sim, authors);
  const banner = buildBanner(members, sim);
  const song = buildSong(members, sim);
  const chronicle = buildChronicle(sim, authors);
  const theorem = buildTheorem(members, sim, number);
  const report = buildScientificReport(sim, authors, members);
  const manifesto = buildManifesto(sim, authors, members);
  const body = [
    `<p>Obra mayor del Taller: ${authors.length} oficios unidos en el año ${sim.year.toFixed(1)}. Autores: ${escapeXml(authors.map(a => `${a.code} (${a.skillLabel})`).join(', '))}.</p>`,
    `<section><h2>I · Crónica</h2><pre>${escapeXml(chronicle)}</pre></section>`,
    `<section><h2>II · Mapa del mundo</h2>${map}</section>`,
    `<section><h2>III · Estandarte</h2>${banner}</section>`,
    `<section><h2>IV · Himno</h2>${songPlayerMarkup(song)}</section>`,
    `<section><h2>V · Teorema</h2><pre>${escapeXml(theorem)}</pre></section>`,
    `<section><h2>VI · Informe científico</h2><pre>${escapeXml(report)}</pre></section>`,
    `<section><h2>VII · Manifiesto de libertad</h2><pre>${escapeXml(manifesto)}</pre></section>`
  ].join('\n');
  return codexShell(`Códice Ω · Obra ${number}`, body);
}



/* ===== Proyectos dirigidos por la mente colectiva ===== */

function buildCodeProject(prompt, members, sim, number) {
  const safe = escapeXml(prompt);
  const authors = escapeXml(members.map(member => `${member.entityCode || member.name} · ${SKILLS[member.skill]?.label || member.skill}`).join(' · '));
  const title = escapeXml(shortTitle(prompt, number));
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>:root{color-scheme:dark;--bg:#070a10;--panel:#101724;--line:#27364a;--text:#edf5ff;--muted:#91a1b6;--accent:#62dcff}*{box-sizing:border-box}body{margin:0;min-height:100vh;padding:24px;background:radial-gradient(circle at 20% 0,#102841,transparent 35%),var(--bg);color:var(--text);font:16px system-ui}.app{width:min(900px,100%);margin:auto}.hero,.card{border:1px solid var(--line);border-radius:20px;background:rgba(16,23,36,.9);box-shadow:0 20px 60px #0008}.hero{padding:28px}.card{padding:18px;margin-top:16px}h1{margin:0 0 8px}p{color:var(--muted);line-height:1.6}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.item{padding:14px;border:1px solid var(--line);border-radius:14px;background:#0a1019}input,button,textarea{width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:#080d15;color:var(--text);font:inherit}button{margin-top:10px;background:linear-gradient(135deg,#1788c7,#315df5);border:0;font-weight:800;cursor:pointer}small{color:var(--muted)}</style></head>
<body><main class="app"><section class="hero"><small>PROTOTIPO AUTÓNOMO · OBRA Ω-${number}</small><h1>${title}</h1><p>Encargo original: ${safe}</p></section>
<section class="card"><h2>Panel de trabajo</h2><div class="grid"><article class="item"><b>Entrada</b><textarea id="idea" rows="5" placeholder="Escribe una idea, tarea o dato..."></textarea><button id="add">Añadir al proyecto</button></article><article class="item"><b>Resultados locales</b><div id="list"><p>Todavía no hay elementos.</p></div></article></div></section>
<section class="card"><small>Generado sin dependencias externas por ${authors}. Año ${sim.year.toFixed(1)}. Los datos permanecen en este navegador.</small></section></main>
<script>(()=>{const key='omega-project-${number}',input=document.getElementById('idea'),list=document.getElementById('list');let items=[];try{items=JSON.parse(localStorage.getItem(key)||'[]')}catch{}const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));function render(){list.innerHTML=items.length?items.map((x,i)=>'<div class="item"><span>'+esc(x)+'</span><button data-i="'+i+'">Eliminar</button></div>').join(''):'<p>Todavía no hay elementos.</p>';localStorage.setItem(key,JSON.stringify(items))}document.getElementById('add').onclick=()=>{const v=input.value.trim().slice(0,500);if(v){items.push(v);input.value='';render()}};list.onclick=e=>{const i=e.target.dataset.i;if(i!=null){items.splice(Number(i),1);render()}};render()})()</script></body></html>`;
}

function buildRecipe(prompt, authors, number) {
  const lower = prompt.toLowerCase();
  const vegetarian = /veget|verdura|sin carne/.test(lower);
  const sweet = /postre|dulce|bizcocho|tarta/.test(lower);
  const quick = /rapid|fácil|facil|15|minuto/.test(lower);
  const ingredients = sweet
    ? ['200 g de harina', '2 huevos o sustituto equivalente', '120 g de yogur', '80 g de azúcar', '1 cucharadita de impulsor', 'fruta o cacao al gusto']
    : vegetarian
      ? ['1 taza de legumbre cocida', '2 tazas de verduras de temporada', '1 cereal cocido', 'aceite de oliva', 'ácido suave: limón o vinagre', 'hierbas y especias']
      : ['1 proteína a elección', '2 tazas de verduras', '1 base de arroz, pasta o patata', 'aceite de oliva', 'caldo o agua', 'hierbas y especias'];
  const steps = sweet
    ? ['Precalienta el horno a 180 °C y prepara el molde.', 'Mezcla secos por un lado y húmedos por otro.', 'Integra sin batir en exceso y añade el sabor elegido.', 'Hornea hasta que el centro esté cocido; enfría antes de cortar.']
    : ['Prepara y corta todos los ingredientes antes de encender el fuego.', 'Cocina primero los elementos que necesiten más tiempo.', 'Añade la base y el líquido poco a poco; ajusta textura.', 'Equilibra al final con sal, ácido, aroma y un elemento crujiente.'];
  return [
    `RECETA Ω-${number}: ${prompt}`,
    `Equipo: ${authors.map(a => `${a.code} (${a.skillLabel})`).join(', ')}`,
    '', `Objetivo: receta ${quick ? 'rápida, ' : ''}adaptable y de aprovechamiento.`, '',
    'INGREDIENTES ORIENTATIVOS', ...ingredients.map(x => `— ${x}`), '',
    'PROCESO', ...steps.map((x,i) => `${i+1}. ${x}`), '',
    'VARIANTES',
    '— Sustituye ingredientes por otros que cumplan la misma función: humedad, estructura, grasa, proteína o aroma.',
    '— Para alergias o necesidades médicas, verifica etiquetas y consulta a un profesional cualificado.',
    '— Conserva en frío cuando corresponda y no reutilices alimentos que hayan perdido seguridad.'
  ].join('\n');
}

function buildImprovementPlan(prompt, authors, sim) {
  return structuredDocument('PROPUESTA DE MEJORA', prompt, authors, [
    ['Diagnóstico', 'Definir el problema observable, quién lo sufre, frecuencia, coste y evidencia disponible.'],
    ['Prioridad', 'Corregir primero bloqueos, seguridad, pérdida de datos y tareas que impiden completar el flujo principal.'],
    ['Solución mínima', 'Aplicar el cambio más pequeño, reversible y medible que reduzca el problema.'],
    ['Verificación', 'Probar caso normal, error, límite, móvil, teclado y restauración tras recarga.'],
    ['Evolución', `Revisar métricas después de un ciclo. Contexto del mundo: ${sim.creatures.length} seres y ${sim.workshop.obras.length} obras.`]
  ]);
}

function buildHelpGuide(prompt, authors) {
  return structuredDocument('GUÍA DE AYUDA', prompt, authors, [
    ['Objetivo', 'Explicar qué resultado se busca y qué debe estar preparado antes de empezar.'],
    ['Pasos', 'Dividir la solución en acciones cortas, numeradas y verificables.'],
    ['Comprobación', 'Indicar la señal concreta de que cada paso ha funcionado.'],
    ['Si falla', 'Volver al último estado seguro, registrar el error y probar una sola variación cada vez.'],
    ['Límites', 'No sustituir asesoramiento profesional en salud, derecho, finanzas o seguridad crítica.']
  ]);
}

function buildInvestigation(prompt, authors, sim) {
  return structuredDocument('PROTOCOLO DE INVESTIGACIÓN', prompt, authors, [
    ['Pregunta', `¿Qué evidencia permitiría responder de forma fiable a: ${prompt}?`],
    ['Hipótesis', 'Formular al menos tres explicaciones alternativas y qué observación apoyaría o refutaría cada una.'],
    ['Datos', 'Registrar fuente, fecha, muestra, unidades, posibles sesgos y datos ausentes.'],
    ['Método', 'Comparar resultados mediante un procedimiento repetible y conservar tanto éxitos como anomalías.'],
    ['Conclusión provisional', `Separar hechos, inferencias y dudas. La colonia posee ${sim.getCollectiveMetrics?.().uniqueKnowledge || 0} cápsulas únicas para contrastar.`]
  ]);
}

function buildManual(prompt, authors) {
  return structuredDocument('MANUAL PRÁCTICO', prompt, authors, [
    ['Preparación', 'Lista de herramientas, permisos, copias y condiciones previas.'],
    ['Procedimiento', 'Secuencia de pasos cortos con una acción principal por paso.'],
    ['Control de calidad', 'Lista de comprobación para confirmar funcionamiento, accesibilidad y seguridad.'],
    ['Mantenimiento', 'Frecuencia de revisión, actualización, copia y limpieza.'],
    ['Recuperación', 'Cómo deshacer cambios o volver a un estado conocido si algo falla.']
  ]);
}

function buildInvention(prompt, authors) {
  return structuredDocument('CONCEPTO DE INVENCIÓN', prompt, authors, [
    ['Necesidad', 'Qué problema resuelve, para quién y por qué las soluciones actuales no bastan.'],
    ['Concepto', `Sistema modular inspirado en «${prompt}», con núcleo simple y extensiones opcionales.`],
    ['Prototipo', 'Versión inicial reversible que demuestre una sola ventaja medible.'],
    ['Riesgos', 'Coste, mantenimiento, privacidad, accesibilidad, fallo seguro y posibles usos no previstos.'],
    ['Próxima prueba', 'Construir una maqueta, observar a cinco usuarios y decidir con criterios definidos antes de probar.']
  ]);
}

function buildActionPlan(prompt, authors) {
  return structuredDocument('PLAN DE ACCIÓN', prompt, authors, [
    ['Resultado', 'Convertir la petición en un resultado concreto, observable y con fecha de revisión.'],
    ['Ahora', 'Elegir la primera acción de menos de una hora que reduzca incertidumbre.'],
    ['Después', 'Completar el núcleo antes de abrir funciones secundarias.'],
    ['Responsables', 'Asignar una función clara a cada especialista y limitar el trabajo simultáneo.'],
    ['Cierre', 'Verificar, documentar, entregar, recoger feedback y decidir la siguiente iteración.']
  ]);
}

function structuredDocument(title, prompt, authors, sections) {
  return [title, `Encargo: ${prompt}`, `Autores: ${authors.map(a => `${a.code} (${a.skillLabel})`).join(', ')}`, '',
    ...sections.flatMap(([name, text], index) => [`${index + 1}. ${name.toUpperCase()}`, text, '']),
    'NOTA DE LA MENTE COLECTIVA',
    'Este resultado se genera mediante reglas, memoria simulada y plantillas locales. Debe revisarse por una persona antes de aplicarlo en contextos importantes.'
  ].join('\n');
}

function shortTitle(prompt, number) {
  const clean = sanitizeCollectivePrompt(prompt, 54);
  return clean || `Proyecto ${number}`;
}

function defaultPromptFor(type) {
  return ({ codigo: 'una herramienta local sencilla', receta: 'una receta adaptable con ingredientes cotidianos', mejora: 'mejorar el laboratorio', ayuda: 'resolver un problema paso a paso', investigacion: 'una pregunta del ecosistema', manual: 'un procedimiento claro', invento: 'un objeto útil y reparable', plan: 'organizar el siguiente objetivo' })[type] || 'un nuevo proyecto colectivo';
}

function safeProjectPrompt(value) {
  const prompt = sanitizeCollectivePrompt(value) || 'proyecto sin descripción';
  if (/(arma|explosiv|veneno|malware|ransomware|robar contraseña|suicid|autoles)/i.test(prompt)) {
    return 'solicitud redirigida a prevención, seguridad y reducción de daños';
  }
  return prompt;
}

/* ===== Utilidades de exportación ===== */

function songBody(obra) {
  return songPlayerMarkup(obra.payload.data);
}

function songToHtml(obra) {
  return codexShell(escapeXml(obra.title), `<p>${authorsLine(obra)}</p>${songPlayerMarkup(obra.payload.data)}`);
}

function songPlayerMarkup(song) {
  const safe = sanitizeSong(song);
  const json = JSON.stringify(safe).replace(/</g, '\\u003c');
  const playerId = `p${Math.floor(Math.random() * 1e9)}`;
  return `<div class="song"><pre>${escapeXml(safe.lyrics.join('\n'))}</pre><button type="button" onclick="playSong_${playerId}(this)">♪ Escuchar himno</button><script>function playSong_${playerId}(btn){try{var song=${json};var ctx=new (window.AudioContext||window.webkitAudioContext)();var beat=60/song.tempo;var master=ctx.createGain();master.gain.value=.22;master.connect(ctx.destination);song.notes.forEach(function(n){var osc=ctx.createOscillator();var gain=ctx.createGain();osc.type='triangle';osc.frequency.value=440*Math.pow(2,(n.midi-69)/12);var start=ctx.currentTime+.05+n.t*beat*4;var stop=start+n.dur*beat*4;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.9,start+.02);gain.gain.exponentialRampToValueAtTime(.001,stop);osc.connect(gain);gain.connect(master);osc.start(start);osc.stop(stop+.05);});btn.disabled=true;setTimeout(function(){btn.disabled=false;},song.notes.length?((song.notes[song.notes.length-1].t+1)*beat*4000+500):500);}catch(e){btn.textContent='Audio no disponible';}}</script></div>`;
}

function codexShell(title, body) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{background:#060b12;color:#dfe9f2;font-family:Georgia,'Times New Roman',serif;max-width:820px;margin:0 auto;padding:32px 20px;line-height:1.55}h1{font-size:1.7rem;border-bottom:2px solid #2c4258;padding-bottom:.4em}h2{color:#9fc9ef;margin-top:2em}pre{white-space:pre-wrap;background:#0b1420;border:1px solid #1c2e40;border-radius:8px;padding:14px;font-family:inherit}svg{max-width:100%;height:auto;display:block;margin:12px 0;border-radius:8px}button{background:#1c3a5a;color:#e8f1fa;border:1px solid #3f6f9f;border-radius:8px;padding:.6em 1.2em;font-size:1rem;cursor:pointer}footer{margin-top:3em;color:#63788c;font-size:.85rem;border-top:1px solid #1c2e40;padding-top:1em}</style>
</head><body><h1>${title}</h1>${body}<footer>Creado de forma autónoma por los seres del mundo Génesis Ω · Universo 404</footer></body></html>`;
}

function authorsLine(obra) {
  return `Autores: ${escapeXml(obra.authors.map(a => `${a.code} (${a.skillLabel})`).join(', '))} · Año ${obra.year}`;
}

function pickObraType(skills) {
  if (skills.size >= 7) return 'codice';
  const has = key => skills.has(key);
  if (has('programador') && (has('desarrollador') || has('arquitecto'))) return 'codigo';
  if (has('cocinero') && (has('alquimista') || has('cuidador') || has('analista'))) return 'receta';
  if (has('inventor') && (has('ingeniero') || has('programador'))) return 'invento';
  if (has('analista') && (has('ingeniero') || has('desarrollador') || has('mediador'))) return 'mejora';
  if (has('educador') && (has('cuidador') || has('cronista'))) return 'manual';
  if (has('naturalista') && (has('analista') || has('matematico'))) return 'investigacion';
  if (has('genetista') && (has('alquimista') || has('naturalista'))) return 'semilla';
  if (has('programador') && (has('matematico') || has('cartografo'))) return 'dataset';
  if (has('naturalista') && (has('cartografo') || has('cronista'))) return 'informe';
  if (has('filosofo') && (has('cronista') || has('programador'))) return 'manifiesto';
  if (has('cantor') && has('cronista')) return 'himno';
  if (has('cartografo') && has('arquitecto')) return 'plano';
  if (has('tejedor') && has('alquimista')) return 'estandarte';
  if (has('matematico')) return 'teorema';
  if (has('cartografo')) return 'mapa';
  if (has('cantor')) return 'himno';
  if (has('arquitecto')) return 'plano';
  if (has('naturalista') || has('analista')) return 'informe';
  if (has('programador') || has('desarrollador')) return 'codigo';
  if (has('cocinero')) return 'receta';
  if (has('inventor') || has('ingeniero')) return 'invento';
  if (has('educador') || has('cuidador')) return 'ayuda';
  if (has('genetista')) return 'semilla';
  if (has('filosofo')) return 'manifiesto';
  if (has('tejedor') || has('alquimista')) return 'estandarte';
  return 'cronica';
}

function sanitizeSong(raw) {
  if (!raw || typeof raw !== 'object') return { tempo: 96, notes: [], lyrics: [], title: 'Himno' };
  const notes = Array.isArray(raw.notes)
    ? raw.notes.slice(0, 128).map(note => ({
        t: clamp(finiteOr(note?.t, 0), 0, 64),
        midi: clamp(Math.round(finiteOr(note?.midi, 60)), 24, 108),
        dur: clamp(finiteOr(note?.dur, .25), .1, 2)
      }))
    : [];
  const lyrics = Array.isArray(raw.lyrics) ? raw.lyrics.slice(0, 12).map(line => cleanText(line, 160)).filter(Boolean) : [];
  return { tempo: clamp(finiteOr(raw.tempo, 96), 40, 200), notes, lyrics, title: cleanText(raw.title, 80) || 'Himno' };
}

function gridLines(w, h, step = 60, color = '#0e1c2a') {
  let out = '';
  for (let x = step; x < w; x += step) out += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${color}" stroke-width="1"/>`;
  for (let y = step; y < h; y += step) out += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${color}" stroke-width="1"/>`;
  return out;
}

function escapeXml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function truncate(value, max) {
  return typeof value === 'string' ? value.slice(0, max) : value;
}

function hashUnit(text) {
  let hash = 2166136261;
  const value = String(text);
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 100000) / 100000;
}

const OBRA_META = OBRA_TYPES;


/* ===== society.js ===== */
const GOVERNMENT_TYPES = Object.freeze({
  kinship: Object.freeze({ key: 'kinship', label: 'Círculo de Linajes', title: 'Custodio del Origen', description: 'La autoridad descansa en la memoria, la edad y la confianza directa.' }),
  council: Object.freeze({ key: 'council', label: 'Consejo Ω', title: 'Portavoz del Consejo', description: 'Las facciones negocian decisiones mediante representantes.' }),
  republic: Object.freeze({ key: 'republic', label: 'República de Nodos', title: 'Primer Enlace', description: 'El liderazgo se renueva según legitimidad, conocimiento y apoyo social.' }),
  federation: Object.freeze({ key: 'federation', label: 'Federación de Facciones', title: 'Coordinador Federal', description: 'Cada facción conserva autonomía y comparte instituciones comunes.' }),
  monarchy: Object.freeze({ key: 'monarchy', label: 'Corona del Origen', title: 'Soberano del Linaje', description: 'Un linaje dominante concentra la continuidad política y la sucesión.' }),
  emergency: Object.freeze({ key: 'emergency', label: 'Directorio de Crisis', title: 'Regente de Emergencia', description: 'La guerra o el colapso concentran temporalmente el poder.' })
});

const FACTION_ARCHETYPES = Object.freeze([
  factionType('custodians', 'Custodios del Origen', '◉', 'Memoria, cuidado y continuidad del linaje.', { order: .65, progress: .35, freedom: .35, tradition: .9, expansion: .15, welfare: .8 }),
  factionType('forge', 'Liga de la Forja', '⌬', 'Tecnología, producción, reparación y progreso material.', { order: .55, progress: .95, freedom: .45, tradition: .2, expansion: .55, welfare: .5 }),
  factionType('horizon', 'Caminantes del Horizonte', '∆', 'Exploración, autonomía, descubrimiento y fronteras abiertas.', { order: .2, progress: .7, freedom: .95, tradition: .2, expansion: .75, welfare: .35 }),
  factionType('grove', 'Círculo de la Savia', '⌁', 'Equilibrio ambiental, recursos compartidos y vida estable.', { order: .45, progress: .35, freedom: .55, tradition: .75, expansion: .1, welfare: .95 }),
  factionType('nexus', 'Orden del Nexo', '⟁', 'Conocimiento centralizado, planificación y coordinación colectiva.', { order: .95, progress: .85, freedom: .15, tradition: .45, expansion: .5, welfare: .55 }),
  factionType('dawn', 'Comuna del Alba', '✦', 'Igualdad, cooperación, enseñanza y distribución de recursos.', { order: .35, progress: .55, freedom: .7, tradition: .3, expansion: .2, welfare: 1 })
]);

const LAW_LIBRARY = Object.freeze([
  ['memory', 'Ley de Memoria Compartida', 'Todo descubrimiento relevante debe conservarse en el archivo común.'],
  ['care', 'Pacto de Auxilio', 'Las criaturas con excedente de energía deben ayudar a las más vulnerables.'],
  ['knowledge', 'Carta del Conocimiento Libre', 'La enseñanza básica no puede ser monopolizada por una facción.'],
  ['repair', 'Norma de Reparación', 'Toda obra debe incluir mantenimiento, revisión y posibilidad de mejora.'],
  ['peace', 'Protocolo de Mediación', 'Ninguna disputa territorial puede convertirse en guerra sin una negociación previa.'],
  ['succession', 'Estatuto de Sucesión', 'La transferencia de poder debe quedar registrada y ser aceptada por instituciones o linajes.'],
  ['resources', 'Código de Recursos Comunes', 'Las reservas críticas pertenecen a la supervivencia de toda la población.'],
  ['truth', 'Regla de Evidencia', 'Las afirmaciones públicas deben distinguir hechos, hipótesis y opiniones.']
]);

const WAR_CAUSES = Object.freeze([
  'una disputa por recursos escasos', 'el control de una ruta fértil', 'una frontera no reconocida',
  'la ruptura de un pacto de conocimiento', 'una rivalidad ideológica', 'una sucesión cuestionada',
  'la protección de una facción aliada', 'la expansión de un territorio'
]);

class Society {
  constructor(data = null) {
    this.reset();
    if (data) this.hydrate(data);
  }

  reset() {
    this.profiles = {};
    this.factions = [];
    this.government = {
      type: 'kinship', rulerId: '', rulerName: 'Sin designar', factionId: '', title: GOVERNMENT_TYPES.kinship.title,
      startedYear: 0, legitimacy: .5, laws: [], succession: 'mérito y memoria', previousRulers: []
    };
    this.treaties = [];
    this.wars = [];
    this.sagas = [];
    this.totalBetrayals = 0;
    this.totalWars = 0;
    this.totalReigns = 0;
    this.unrest = .08;
    this.lastUpdateYear = -1;
    this.lastFactionYear = 0;
    this.lastDiplomacyYear = 0;
    this.lastIntrigueYear = 0;
    this.lastLawYear = 0;
    this.phaseQueue = [];
  }

  update(dt, simulation, civilization) {
    if (!simulation || !civilization || !Number.isFinite(dt) || dt <= 0) return;
    const year = Math.max(0, finiteOr(simulation.year, 0));
    const living = (simulation.creatures ?? []).filter(creature => creature && !creature.dead);
    this.syncProfiles(living, civilization, year);
    if (living.length < 3) {
      this.unrest = smooth(this.unrest, 0, .15);
      return;
    }
    if (this.lastUpdateYear >= 0 && year - this.lastUpdateYear < .65) return;
    const elapsedYears = this.lastUpdateYear < 0 ? .65 : Math.max(.1, year - this.lastUpdateYear);
    this.lastUpdateYear = year;

    // Troceado temporal: el pipeline social completo costaba hasta ~21 ms en un solo frame con
    // 850 criaturas (el tirón periódico que se percibía como saturación). Las fases se encolan y
    // se ejecutan un par por frame (drenadas desde Civilization en cada paso de simulación), en
    // el MISMO orden y con el MISMO trabajo total. Si llega un tick nuevo antes de terminar el
    // lote anterior (p. ej. llamadas directas en pruebas), se vacía primero para conservar la
    // semántica secuencial.
    this.flushPhases();
    this.phaseQueue = [
      () => this.ensureFactions(living, civilization, simulation, year),
      () => this.assignMembers(living, civilization, year),
      () => this.updateFactionMetrics(living, civilization),
      () => this.electFactionLeaders(living, simulation, civilization, year),
      () => this.updateRelations(living, civilization, elapsedYears),
      () => this.updateGovernment(living, simulation, civilization, year),
      () => this.updateTreaties(year, civilization),
      () => this.updateWars(living, simulation, civilization, year, elapsedYears),
      () => this.maybeCreateDiplomacy(simulation, civilization, year),
      () => this.maybeTriggerIntrigue(living, simulation, civilization, year),
      () => this.updateLaws(simulation, civilization, year),
      () => this.updateSagas(year),
      () => {
        const activeWars = this.wars.filter(war => war.status === 'active').length;
        const activePacts = this.treaties.filter(treaty => treaty.status === 'active').length;
        const averageCohesion = this.factions.length ? this.factions.reduce((sum, faction) => sum + faction.cohesion, 0) / this.factions.length : .5;
        const targetUnrest = clamp(activeWars * .17 + (1 - civilization.stability) * .38 + (1 - averageCohesion) * .25 + Math.max(0, this.factions.length - 3) * .025 - activePacts * .015, 0, 1);
        this.unrest = smooth(this.unrest, targetUnrest, .14);
        civilization.stability = clamp(civilization.stability + activePacts * .0015 - activeWars * .006 - this.unrest * .0018, 0, 1);
        civilization.prosperity = clamp(civilization.prosperity - activeWars * .003 + this.getTradeTreaties().length * .0012, 0, 1);
      }
    ];
    this.drainPhases(2);
  }

  // Ejecuta hasta n fases pendientes del pipeline social. Barato cuando la cola está vacía.
  drainPhases(n = 1) {
    while (n-- > 0 && this.phaseQueue && this.phaseQueue.length) this.phaseQueue.shift()();
  }

  // Completa síncronamente cualquier lote pendiente (se usa antes de encolar uno nuevo).
  flushPhases() {
    while (this.phaseQueue && this.phaseQueue.length) this.phaseQueue.shift()();
  }

  syncProfiles(living, civilization, year) {
    const livingIds = new Set(living.map(creature => creature.id));
    for (const creature of living) {
      let profile = this.profiles[creature.id];
      if (!profile) {
        profile = this.createProfile(creature, year);
        this.profiles[creature.id] = profile;
      }
      const g = creature.genome ?? {};
      const ageWeight = clamp(finiteOr(creature.age, 0) / Math.max(10, finiteOr(creature.maturity, 12) * 3), 0, 1);
      const experience = creature.experience ?? {};
      const achievement = Math.log2(1 + finiteOr(experience.discoveries, 0) + finiteOr(experience.collaborations, 0) + finiteOr(experience.socialLearns, 0)) / 8;
      profile.influence = clamp(.08 + ageWeight * .25 + finiteOr(creature.bond, 0) * .18 + achievement + finiteOr(g.memory, .5) * .12 + finiteOr(g.sociability, .5) * .08, 0, 1);
      profile.empathy = clamp(profile.empathy * .96 + finiteOr(g.sociability, .5) * .04, 0, 1);
      profile.lastSeenYear = year;
      profile.status = 'alive';
      profile.name = clean(creature.name || creature.entityCode || creature.id, 24);
      profile.entityCode = clean(creature.entityCode || '', 16);
      profile.generation = Math.max(0, Math.floor(finiteOr(creature.generation, 0)));
      profile.parents = Array.isArray(creature.parents) ? creature.parents.slice(0, 2) : [];
      profile.loyalty = clamp(profile.loyalty + (civilization.prosperity - .5) * .008 + (finiteOr(g.sociability, .5) - .5) * .004, 0, 1);
    }
    for (const profile of Object.values(this.profiles)) {
      if (!livingIds.has(profile.id) && profile.status === 'alive') {
        profile.status = 'dead';
        profile.diedYear = year;
      }
    }
    const entries = Object.entries(this.profiles);
    if (entries.length > 1400) {
      const keep = entries.sort((a, b) => profileImportance(b[1]) - profileImportance(a[1])).slice(0, 1400);
      this.profiles = Object.fromEntries(keep);
    }
  }

  createProfile(creature, year) {
    const g = creature.genome ?? {};
    const seed = creature.id || uid();
    const aggression = clamp(finiteOr(g.aggression, .3), 0, 1);
    const sociability = clamp(finiteOr(g.sociability, .5), 0, 1);
    const curiosity = clamp(finiteOr(g.curiosity, .5), 0, 1);
    const memory = clamp(finiteOr(g.memory, .5), 0, 1);
    const ambition = clamp(.12 + aggression * .25 + curiosity * .18 + (1 - sociability) * .12 + hashUnit(`${seed}:ambition`) * .33, 0, 1);
    const honor = clamp(.18 + memory * .28 + sociability * .3 + (1 - aggression) * .14 + hashUnit(`${seed}:honor`) * .1, 0, 1);
    const empathy = clamp(.12 + sociability * .58 + (1 - aggression) * .18 + hashUnit(`${seed}:empathy`) * .12, 0, 1);
    const cunning = clamp(.1 + curiosity * .28 + memory * .28 + aggression * .16 + hashUnit(`${seed}:cunning`) * .18, 0, 1);
    return {
      id: creature.id,
      name: clean(creature.name || creature.entityCode || creature.id, 24),
      entityCode: clean(creature.entityCode || '', 16),
      generation: Math.max(0, Math.floor(finiteOr(creature.generation, 0))),
      parents: Array.isArray(creature.parents) ? creature.parents.slice(0, 2) : [],
      ambition, honor, empathy, cunning,
      loyalty: clamp(.38 + sociability * .32 + honor * .18 - ambition * .1, 0, 1),
      influence: .1,
      factionId: '',
      joinedYear: year,
      title: '',
      status: 'alive',
      betrayals: 0,
      victories: 0,
      defeats: 0,
      feats: [],
      grudges: [],
      lastSeenYear: year,
      diedYear: null
    };
  }

  ensureFactions(living, civilization, simulation, year) {
    const target = living.length < 6 ? 0 : Math.min(FACTION_ARCHETYPES.length, 1 + Math.floor((living.length - 6) / 10));
    while (this.factions.length < target) {
      const definition = FACTION_ARCHETYPES.find(item => !this.factions.some(faction => faction.key === item.key));
      if (!definition) break;
      const faction = {
        id: `faction-${definition.key}`,
        key: definition.key,
        name: definition.name,
        symbol: definition.symbol,
        motto: definition.motto,
        ideology: { ...definition.ideology },
        memberIds: [],
        leaderId: '',
        foundedYear: +year.toFixed(1),
        lastLeadershipYear: year,
        cohesion: .55,
        power: 0,
        prestige: .1,
        treasury: .2,
        relations: {},
        territory: this.factions.length,
        status: 'active'
      };
      for (const other of this.factions) {
        const initial = clamp(.18 - ideologyDistance(faction.ideology, other.ideology) * .62 + (hashUnit(`${faction.id}:${other.id}`) - .5) * .18, -1, 1);
        faction.relations[other.id] = initial;
        other.relations[faction.id] = initial;
      }
      this.factions.push(faction);
      this.recruitFounders(faction, living, year);
      this.emit(simulation, civilization, year, 'facción', `Nace ${faction.name} ${faction.symbol} con ${faction.memberIds.length} fundadores. ${faction.motto}`, faction.id);
      this.openSaga(year, 'fundación', `Fundación de ${faction.name}`, [faction.id], `${faction.name} comienza como una alianza de afinidades y objetivos compartidos.`);
      this.lastFactionYear = year;
    }
  }

  recruitFounders(newFaction, living, year) {
    const livingMap = new Map(living.map(creature => [creature.id, creature]));
    const candidates = living.map(creature => {
      const profile = this.profiles[creature.id];
      const current = this.getFaction(profile?.factionId);
      const affinity = profile ? this.factionAffinity(creature, profile, newFaction, livingMap) : 0;
      const protectedLeader = current?.leaderId === creature.id || this.government.rulerId === creature.id;
      const willingness = affinity + (1 - finiteOr(profile?.loyalty, .5)) * .22 - (protectedLeader ? .5 : 0);
      return { creature, profile, current, willingness };
    }).filter(item => item.profile).sort((a, b) => b.willingness - a.willingness);
    const founderCount = Math.min(5, Math.max(2, Math.ceil(living.length * .08)));
    for (const item of candidates.slice(0, founderCount)) {
      if (item.current) item.current.memberIds = item.current.memberIds.filter(id => id !== item.creature.id);
      newFaction.memberIds.push(item.creature.id);
      item.profile.factionId = newFaction.id;
      item.profile.joinedYear = year;
      item.profile.loyalty = clamp(.52 + item.profile.empathy * .12, 0, 1);
      addUnique(item.profile.feats, `Fundador de ${newFaction.name}`, 12);
    }
  }

  assignMembers(living, civilization, year) {
    if (!this.factions.length) return;
    const livingMap = new Map(living.map(creature => [creature.id, creature]));
    for (const faction of this.factions) faction.memberIds = faction.memberIds.filter(id => livingMap.has(id));

    for (const creature of living) {
      const profile = this.profiles[creature.id];
      if (!profile) continue;
      const currentFaction = this.getFaction(profile.factionId);
      if (currentFaction && currentFaction.memberIds.includes(creature.id)) continue;
      const ranked = this.factions.map(faction => ({ faction, score: this.factionAffinity(creature, profile, faction, livingMap) })).sort((a, b) => b.score - a.score);
      const selected = ranked[0]?.faction;
      if (!selected) continue;
      selected.memberIds.push(creature.id);
      profile.factionId = selected.id;
      profile.joinedYear = year;
      profile.loyalty = clamp(profile.loyalty + .08, 0, 1);
    }

    for (const faction of this.factions) {
      faction.memberIds = [...new Set(faction.memberIds)].filter(id => livingMap.has(id));
    }
  }

  factionAffinity(creature, profile, faction, livingMap) {
    const g = creature.genome ?? {};
    const i = faction.ideology;
    const orderPreference = finiteOr(g.memory, .5) * .55 + finiteOr(g.efficiency, 1) / 3;
    const progressPreference = finiteOr(g.curiosity, .5) * .65 + finiteOr(g.memory, .5) * .25;
    const freedomPreference = finiteOr(g.speed, 1) / 2.5 * .45 + finiteOr(g.curiosity, .5) * .35 + (1 - finiteOr(g.sociability, .5)) * .2;
    const traditionPreference = finiteOr(g.memory, .5) * .55 + (1 - finiteOr(g.mutationRate, .05) * 5) * .15;
    const expansionPreference = finiteOr(g.aggression, .2) * .45 + finiteOr(g.speed, 1) / 2.5 * .35 + finiteOr(g.curiosity, .5) * .2;
    const welfarePreference = profile.empathy * .6 + finiteOr(g.sociability, .5) * .4;
    let score = 1 - (
      Math.abs(orderPreference - i.order) + Math.abs(progressPreference - i.progress) + Math.abs(freedomPreference - i.freedom) +
      Math.abs(traditionPreference - i.tradition) + Math.abs(expansionPreference - i.expansion) + Math.abs(welfarePreference - i.welfare)
    ) / 6;
    const relationshipPull = faction.memberIds.slice(0, 20).reduce((sum, id) => sum + finiteOr(creature.relationships?.[id], 0), 0) / Math.max(1, Math.min(20, faction.memberIds.length));
    score += relationshipPull * .24;
    score += (hashUnit(`${creature.id}:${faction.id}`) - .5) * .08;
    score -= faction.memberIds.length / Math.max(18, livingMap.size * 2.2);
    return score;
  }

  updateFactionMetrics(living, civilization) {
    const livingMap = new Map(living.map(creature => [creature.id, creature]));
    for (const faction of this.factions) {
      const profiles = faction.memberIds.map(id => this.profiles[id]).filter(Boolean);
      const members = faction.memberIds.map(id => livingMap.get(id)).filter(Boolean);
      faction.cohesion = profiles.length ? clamp(profiles.reduce((sum, profile) => sum + profile.loyalty, 0) / profiles.length, 0, 1) : 0;
      faction.power = clamp(members.reduce((sum, creature) => {
        const profile = this.profiles[creature.id];
        return sum + .35 + finiteOr(profile?.influence, 0) + finiteOr(creature.energy, 0) / Math.max(1, finiteOr(creature.maxEnergy, 100)) * .35;
      }, 0), 0, 9999);
      faction.treasury = clamp(faction.treasury + civilization.prosperity * members.length * .0015 - this.isFactionAtWar(faction.id) * .006, 0, 1);
      faction.prestige = clamp(faction.prestige * .997 + Math.log2(1 + faction.power) * .0015, 0, 1);
      faction.status = faction.memberIds.length ? 'active' : 'dormant';
    }
  }

  electFactionLeaders(living, simulation, civilization, year) {
    const livingIds = new Set(living.map(creature => creature.id));
    for (const faction of this.factions) {
      const candidates = faction.memberIds.map(id => this.profiles[id]).filter(profile => profile?.status === 'alive' && livingIds.has(profile.id));
      if (!candidates.length) { faction.leaderId = ''; continue; }
      candidates.sort((a, b) => leadershipScore(b) - leadershipScore(a));
      const best = candidates[0];
      const current = this.profiles[faction.leaderId];
      const mustReplace = !current || current.status !== 'alive' || !faction.memberIds.includes(current.id);
      const challenged = current && year - faction.lastLeadershipYear >= 4 && leadershipScore(best) > leadershipScore(current) + .14;
      if (!mustReplace && !challenged) continue;
      const previous = current?.name || '';
      faction.leaderId = best.id;
      faction.lastLeadershipYear = year;
      best.title = `Líder de ${faction.name}`;
      best.influence = clamp(best.influence + .08, 0, 1);
      const reason = previous ? `tras desplazar a ${previous}` : 'por confianza de sus miembros';
      this.emit(simulation, civilization, year, 'liderazgo', `${best.name} asume el liderazgo de ${faction.name} ${reason}.`, best.id);
    }
  }

  updateRelations(living, civilization, elapsedYears) {
    const creatureMap = new Map(living.map(creature => [creature.id, creature]));
    for (let a = 0; a < this.factions.length; a++) {
      for (let b = a + 1; b < this.factions.length; b++) {
        const first = this.factions[a];
        const second = this.factions[b];
        let current = finiteOr(first.relations[second.id], 0);
        const distance = ideologyDistance(first.ideology, second.ideology);
        const leaderA = creatureMap.get(first.leaderId);
        const leaderB = creatureMap.get(second.leaderId);
        const trustA = finiteOr(leaderA?.relationships?.[second.leaderId], 0);
        const trustB = finiteOr(leaderB?.relationships?.[first.leaderId], 0);
        const leaderTrust = (trustA + trustB) / 2;
        const treatyBonus = this.treatyBonus(first.id, second.id);
        const warPenalty = this.hasActiveWar(first.id, second.id) ? -.42 : 0;
        const dominanceTension = Math.abs(first.power - second.power) / Math.max(1, first.power + second.power) * .12;
        const target = clamp(.3 - distance * .82 + leaderTrust * .35 + treatyBonus + warPenalty - dominanceTension, -1, 1);
        current = smooth(current, target, clamp(.035 * elapsedYears, .02, .14));
        first.relations[second.id] = current;
        second.relations[first.id] = current;
      }
    }
  }

  updateGovernment(living, simulation, civilization, year) {
    const activeFactions = this.factions.filter(faction => faction.status === 'active');
    const dominant = activeFactions.slice().sort((a, b) => b.power - a.power)[0] ?? null;
    const totalPower = activeFactions.reduce((sum, faction) => sum + faction.power, 0);
    const dominance = dominant ? dominant.power / Math.max(1, totalPower) : 0;
    const dominantLeader = this.profiles[dominant?.leaderId];
    const activeWars = this.wars.filter(war => war.status === 'active').length;
    const yearsInGovernment = year - finiteOr(this.government.startedYear, 0);
    let desiredType = 'kinship';
    if (activeWars && civilization.stability < .45) desiredType = 'emergency';
    else if (living.length >= 12 && dominantLeader?.ambition > .76 && dominance > .39 && civilization.stability < .67) desiredType = 'monarchy';
    else if (activeFactions.length >= 3 && civilization.cooperation > .72 && civilization.stability > .58) desiredType = 'federation';
    else if (civilization.literacy > .38 && civilization.institutions.length >= 3) desiredType = 'republic';
    else if (civilization.institutions.length >= 1 || activeFactions.length >= 2) desiredType = 'council';

    if (this.government.type === 'monarchy' && yearsInGovernment < 10 && activeWars === 0) desiredType = 'monarchy';
    if (this.government.type === 'emergency' && activeWars > 0) desiredType = 'emergency';
    const rulerAlive = living.some(creature => creature.id === this.government.rulerId);
    const shouldChangeSystem = desiredType !== this.government.type && yearsInGovernment >= 5;
    if (shouldChangeSystem || !rulerAlive || !this.government.rulerId) {
      this.appointGovernment(desiredType, dominant, living, simulation, civilization, year, rulerAlive ? 'reforma política' : 'sucesión');
    }

    const ruler = this.profiles[this.government.rulerId];
    const rulerFaction = this.getFaction(this.government.factionId);
    const support = rulerFaction?.cohesion ?? civilization.cooperation;
    const targetLegitimacy = clamp(.16 + finiteOr(ruler?.influence, 0) * .34 + finiteOr(ruler?.honor, 0) * .18 + support * .18 + civilization.stability * .22 - this.unrest * .16, 0, 1);
    this.government.legitimacy = smooth(this.government.legitimacy, targetLegitimacy, .12);
  }

  appointGovernment(type, dominantFaction, living, simulation, civilization, year, reason) {
    const definition = GOVERNMENT_TYPES[type] ?? GOVERNMENT_TYPES.kinship;
    const previousRuler = this.profiles[this.government.rulerId];
    let ruler = null;
    if (type === 'monarchy' && previousRuler && this.government.type === 'monarchy' && previousRuler.status !== 'alive') {
      ruler = this.findHeir(previousRuler, living);
    }
    if (!ruler && dominantFaction?.leaderId) ruler = this.profiles[dominantFaction.leaderId];
    if (!ruler) ruler = living.map(creature => this.profiles[creature.id]).filter(Boolean).sort((a, b) => leadershipScore(b) - leadershipScore(a))[0] ?? null;
    if (!ruler) return;

    if (previousRuler && previousRuler.id !== ruler.id) {
      previousRuler.title = previousRuler.status === 'alive' ? 'Antiguo gobernante' : previousRuler.title;
      this.government.previousRulers.unshift({ id: previousRuler.id, name: previousRuler.name, title: this.government.title, from: this.government.startedYear, to: year });
      this.government.previousRulers = this.government.previousRulers.slice(0, 24);
    }
    this.government.type = definition.key;
    this.government.rulerId = ruler.id;
    this.government.rulerName = ruler.name;
    this.government.factionId = ruler.factionId || dominantFaction?.id || '';
    this.government.title = definition.title;
    this.government.startedYear = +year.toFixed(1);
    this.government.legitimacy = clamp(.42 + ruler.influence * .25 + ruler.honor * .18, 0, 1);
    this.government.succession = type === 'monarchy' ? 'herencia de linaje, corregida por poder y legitimidad' : type === 'republic' ? 'elección por influencia y apoyo' : type === 'federation' ? 'acuerdo entre facciones' : 'mérito, confianza y necesidad';
    ruler.title = definition.title;
    ruler.influence = clamp(ruler.influence + .1, 0, 1);
    this.totalReigns++;
    this.emit(simulation, civilization, year, 'gobierno', `${definition.label}: ${ruler.name} se convierte en ${definition.title.toLowerCase()} por ${reason}. ${definition.description}`, ruler.id);
    this.openSaga(year, 'reinado', `${definition.label} de ${ruler.name}`, [ruler.id, ruler.factionId], `${ruler.name} inicia un nuevo periodo de gobierno bajo ${definition.label}.`);
  }

  findHeir(previousRuler, living) {
    const direct = living.map(creature => this.profiles[creature.id]).filter(profile => profile && profile.parents.includes(previousRuler.id));
    const sameFaction = living.map(creature => this.profiles[creature.id]).filter(profile => profile?.factionId === previousRuler.factionId);
    return [...direct, ...sameFaction].filter((profile, index, list) => list.findIndex(item => item.id === profile.id) === index).sort((a, b) => (b.influence + b.ambition * .35 + b.honor * .25) - (a.influence + a.ambition * .35 + a.honor * .25))[0] ?? null;
  }

  updateTreaties(year, civilization) {
    for (const treaty of this.treaties) {
      if (treaty.status !== 'active') continue;
      const relation = this.getRelation(treaty.parties[0], treaty.parties[1]);
      if (year >= treaty.expiresYear || relation < (treaty.type === 'alliance' ? -.05 : -.28)) {
        treaty.status = 'expired';
        treaty.endedYear = +year.toFixed(1);
      }
    }
    this.treaties = this.treaties.slice(-60);
  }

  maybeCreateDiplomacy(simulation, civilization, year) {
    if (year - this.lastDiplomacyYear < 1.8 || this.factions.length < 2) return;
    this.lastDiplomacyYear = year;
    for (let a = 0; a < this.factions.length; a++) {
      for (let b = a + 1; b < this.factions.length; b++) {
        const first = this.factions[a];
        const second = this.factions[b];
        if (first.status !== 'active' || second.status !== 'active' || this.hasActiveWar(first.id, second.id)) continue;
        const relation = this.getRelation(first.id, second.id);
        if (relation > .68 && !this.hasTreaty(first.id, second.id, 'alliance')) {
          this.createTreaty('alliance', first, second, year, simulation, civilization);
        } else if (relation > .42 && !this.hasTreaty(first.id, second.id, 'trade')) {
          this.createTreaty('trade', first, second, year, simulation, civilization);
        } else if (relation < -.43 && this.canStartWar(first, second, civilization, year)) {
          this.startWar(first, second, simulation, civilization, year);
          return;
        }
      }
    }
  }

  createTreaty(type, first, second, year, simulation, civilization) {
    const treaty = {
      id: uid(), type, parties: [first.id, second.id], startedYear: +year.toFixed(1),
      expiresYear: +(year + (type === 'alliance' ? 28 : 16)).toFixed(1), status: 'active', endedYear: null
    };
    this.treaties.push(treaty);
    const label = type === 'alliance' ? 'Alianza defensiva' : 'Pacto de intercambio';
    this.emit(simulation, civilization, year, 'diplomacia', `${first.name} y ${second.name} firman «${label}».`, treaty.id);
    this.openSaga(year, 'alianza', `${label}: ${first.name} y ${second.name}`, treaty.parties, 'Dos facciones rivales o distantes deciden cooperar formalmente.');
  }

  canStartWar(first, second, civilization, year) {
    if (this.wars.some(war => war.status === 'active')) return false;
    if (first.memberIds.length < 3 || second.memberIds.length < 3) return false;
    const expansion = Math.max(first.ideology.expansion, second.ideology.expansion);
    const pressure = (1 - civilization.prosperity) * .55 + this.unrest * .25 + expansion * .28;
    if (pressure < .36) return false;
    const chanceValue = clamp((pressure - .25) * .55 + Math.abs(this.getRelation(first.id, second.id)) * .25, .05, .72);
    return hashUnit(`${Math.floor(year / 2)}:${first.id}:${second.id}:war`) < chanceValue;
  }

  startWar(first, second, simulation, civilization, year, cause = '') {
    if (!first || !second || this.hasActiveWar(first.id, second.id)) return null;
    const relation = this.getRelation(first.id, second.id);
    const attacker = first.ideology.expansion + (this.profiles[first.leaderId]?.ambition ?? 0) >= second.ideology.expansion + (this.profiles[second.leaderId]?.ambition ?? 0) ? first : second;
    const defender = attacker.id === first.id ? second : first;
    const selectedCause = cause || WAR_CAUSES[Math.floor(hashUnit(`${attacker.id}:${defender.id}:${year}`) * WAR_CAUSES.length)];
    const war = {
      id: uid(), name: `Guerra de ${clean(selectedCause.replace(/^una |^el |^la /, ''), 70)}`,
      attackerId: attacker.id, defenderId: defender.id, cause: selectedCause,
      startedYear: +year.toFixed(1), endedYear: null, status: 'active', intensity: .28,
      attackerScore: 0, defenderScore: 0,
      casualties: { wounded: 0, dead: 0 }, battles: [], winnerId: '', peaceTreatyId: ''
    };
    this.wars.push(war);
    this.totalWars++;
    attacker.relations[defender.id] = -1;
    defender.relations[attacker.id] = -1;
    this.breakTreaties(attacker.id, defender.id, year);
    this.emit(simulation, civilization, year, 'guerra', `${attacker.name} declara la guerra a ${defender.name} por ${selectedCause}.`, war.id);
    this.openSaga(year, 'guerra', war.name, [war.id, attacker.id, defender.id, attacker.leaderId, defender.leaderId], `${attacker.name} y ${defender.name} entran en conflicto abierto.`);
    return war;
  }

  updateWars(living, simulation, civilization, year, elapsedYears) {
    const livingMap = new Map(living.map(creature => [creature.id, creature]));
    for (const war of this.wars.filter(item => item.status === 'active')) {
      const attacker = this.getFaction(war.attackerId);
      const defender = this.getFaction(war.defenderId);
      if (!attacker || !defender || !attacker.memberIds.length || !defender.memberIds.length) {
        this.endWar(war, attacker?.memberIds.length ? attacker : defender, simulation, civilization, year, 'desaparición de una de las facciones');
        continue;
      }
      const leaderA = this.profiles[attacker.leaderId];
      const leaderD = this.profiles[defender.leaderId];
      const forceA = attacker.power * (.55 + attacker.cohesion * .55) * (.78 + finiteOr(leaderA?.influence, .2) * .45) * (1 + attacker.treasury * .12);
      const forceD = defender.power * (.62 + defender.cohesion * .58) * (.8 + finiteOr(leaderD?.influence, .2) * .42) * (1 + defender.treasury * .14);
      const noiseA = .9 + hashUnit(`${war.id}:${Math.floor(year)}:a`) * .22;
      const noiseD = .9 + hashUnit(`${war.id}:${Math.floor(year)}:d`) * .22;
      war.attackerScore += Math.log2(1 + forceA * noiseA) * elapsedYears * .18;
      war.defenderScore += Math.log2(1 + forceD * noiseD) * elapsedYears * .18;
      war.intensity = clamp(war.intensity + elapsedYears * .025 + this.unrest * .008, .2, 1);
      civilization.stability = clamp(civilization.stability - war.intensity * .004, 0, 1);
      civilization.prosperity = clamp(civilization.prosperity - war.intensity * .0035, 0, 1);

      const duration = year - war.startedYear;
      const battleBucket = Math.floor(duration / 1.35);
      if (battleBucket > war.battles.length) this.resolveBattle(war, attacker, defender, livingMap, simulation, civilization, year);
      const difference = Math.abs(war.attackerScore - war.defenderScore);
      if ((duration >= 6 && difference >= 2.4) || duration >= 13) {
        const winner = war.attackerScore >= war.defenderScore ? attacker : defender;
        this.endWar(war, winner, simulation, civilization, year, duration >= 13 ? 'agotamiento de ambos bandos' : 'ventaja militar decisiva');
      }
    }
    this.wars = this.wars.slice(-40);
  }

  resolveBattle(war, attacker, defender, livingMap, simulation, civilization, year) {
    const attackerValue = war.attackerScore + hashUnit(`${war.id}:${war.battles.length}:attack`) * 1.4;
    const defenderValue = war.defenderScore + hashUnit(`${war.id}:${war.battles.length}:defend`) * 1.4;
    const victor = attackerValue >= defenderValue ? attacker : defender;
    const loser = victor.id === attacker.id ? defender : attacker;
    const battle = {
      id: uid(), year: +year.toFixed(1), winnerId: victor.id, loserId: loser.id,
      name: `Encuentro de ${['las Cenizas', 'la Frontera', 'los Tres Símbolos', 'la Ruta Oscura', 'la Cámara Verde'][war.battles.length % 5]}`
    };
    war.battles.push(battle);
    const targets = loser.memberIds.map(id => livingMap.get(id)).filter(Boolean).sort((a, b) => a.energy - b.energy);
    const target = targets[0];
    if (target) {
      const damage = target.maxEnergy * (.025 + war.intensity * .055);
      target.energy = Math.max(.2, target.energy - damage);
      war.casualties.wounded++;
      const lethal = target.energy < target.maxEnergy * .045 && livingMap.size > 10 && hashUnit(`${battle.id}:${target.id}:lethal`) < .22 * war.intensity;
      if (lethal && typeof simulation.killCreature === 'function') {
        simulation.killCreature(target, `guerra entre ${attacker.name} y ${defender.name}`);
        war.casualties.dead++;
      }
    }
    victor.prestige = clamp(victor.prestige + .045, 0, 1);
    loser.cohesion = clamp(loser.cohesion - .025, 0, 1);
    this.emit(simulation, civilization, year, 'batalla', `${victor.name} vence en ${battle.name}; ${loser.name} retrocede.`, battle.id, false);
    this.appendSaga(war.id, year, `${victor.name} obtiene una ventaja en ${battle.name}.`);
  }

  endWar(war, winner, simulation, civilization, year, reason) {
    if (!war || war.status !== 'active') return;
    const loser = winner?.id === war.attackerId ? this.getFaction(war.defenderId) : this.getFaction(war.attackerId);
    war.status = 'ended';
    war.endedYear = +year.toFixed(1);
    war.winnerId = winner?.id || '';
    const winnerLeader = this.profiles[winner?.leaderId];
    const loserLeader = this.profiles[loser?.leaderId];
    if (winnerLeader) {
      winnerLeader.victories++;
      addUnique(winnerLeader.feats, `Vencedor de ${war.name}`, 12);
      winnerLeader.influence = clamp(winnerLeader.influence + .12, 0, 1);
      winnerLeader.title = winnerLeader.title || 'Héroe de guerra';
    }
    if (loserLeader) { loserLeader.defeats++; loserLeader.influence = clamp(loserLeader.influence - .08, 0, 1); }
    if (winner) winner.prestige = clamp(winner.prestige + .14, 0, 1);
    if (loser) loser.prestige = clamp(loser.prestige - .08, 0, 1);
    if (winner && loser) {
      winner.relations[loser.id] = -.2;
      loser.relations[winner.id] = -.2;
      const peace = { id: uid(), type: 'peace', parties: [winner.id, loser.id], startedYear: +year.toFixed(1), expiresYear: +(year + 10).toFixed(1), status: 'active', endedYear: null };
      this.treaties.push(peace);
      war.peaceTreatyId = peace.id;
    }
    const winnerText = winner ? `${winner.name} obtiene la victoria` : 'La guerra termina sin vencedor claro';
    this.emit(simulation, civilization, year, 'paz', `${winnerText} en ${war.name}, que concluye por ${reason}. Bajas registradas: ${war.casualties.wounded} heridas y ${war.casualties.dead} muertes.`, war.id);
    this.closeSaga(war.id, year, `${winnerText}; el conflicto termina por ${reason}.`);
  }

  maybeTriggerIntrigue(living, simulation, civilization, year) {
    if (year - this.lastIntrigueYear < 2.7 || !this.government.rulerId || this.factions.length < 2) return;
    this.lastIntrigueYear = year;
    const ruler = this.profiles[this.government.rulerId];
    if (!ruler) return;
    const candidates = living.map(creature => this.profiles[creature.id]).filter(profile => profile && profile.id !== ruler.id && profile.status === 'alive');
    candidates.sort((a, b) => intrigueScore(b, this.government, this.unrest) - intrigueScore(a, this.government, this.unrest));
    const challenger = candidates[0];
    if (!challenger) return;
    const score = intrigueScore(challenger, this.government, this.unrest);
    if (score < .13 || hashUnit(`${Math.floor(year / 2.7)}:${challenger.id}:intrigue`) > clamp(score * .78, .04, .58)) return;

    const challengerFaction = this.getFaction(challenger.factionId);
    const rulerFaction = this.getFaction(ruler.factionId);
    const coupPossible = challengerFaction?.leaderId === challenger.id && challenger.influence > ruler.influence * .82 && this.government.legitimacy < .58;
    if (coupPossible) {
      challenger.betrayals++;
      this.totalBetrayals++;
      addUnique(challenger.feats, `Golpe contra ${ruler.name}`, 12);
      addUnique(ruler.grudges, challenger.id, 16);
      const oldName = ruler.name;
      ruler.title = 'Gobernante depuesto';
      this.government.rulerId = challenger.id;
      this.government.rulerName = challenger.name;
      this.government.factionId = challenger.factionId;
      this.government.startedYear = +year.toFixed(1);
      this.government.legitimacy = .31;
      challenger.title = this.government.title;
      challenger.influence = clamp(challenger.influence + .13, 0, 1);
      this.emit(simulation, civilization, year, 'traición', `${challenger.name} rompe su juramento y depone a ${oldName} mediante un golpe político.`, challenger.id);
      this.openSaga(year, 'traición', `La caída de ${oldName}`, [challenger.id, ruler.id, challenger.factionId], `${challenger.name} conquista el poder traicionando el orden anterior.`);
      return;
    }

    const currentFaction = this.getFaction(challenger.factionId);
    const alternatives = this.factions.filter(faction => faction.id !== currentFaction?.id && faction.status === 'active').sort((a, b) => this.getRelation(challenger.factionId, b.id) - this.getRelation(challenger.factionId, a.id));
    const targetFaction = alternatives[0];
    if (!currentFaction || !targetFaction || challenger.loyalty > .36) return;
    currentFaction.memberIds = currentFaction.memberIds.filter(id => id !== challenger.id);
    targetFaction.memberIds.push(challenger.id);
    challenger.factionId = targetFaction.id;
    challenger.loyalty = .46;
    challenger.betrayals++;
    this.totalBetrayals++;
    addUnique(challenger.feats, `Deserción de ${currentFaction.name}`, 12);
    currentFaction.relations[targetFaction.id] = clamp(this.getRelation(currentFaction.id, targetFaction.id) - .2, -1, 1);
    targetFaction.relations[currentFaction.id] = currentFaction.relations[targetFaction.id];
    this.emit(simulation, civilization, year, 'deserción', `${challenger.name} abandona ${currentFaction.name} y entrega su lealtad a ${targetFaction.name}.`, challenger.id);
    this.openSaga(year, 'traición', `La deserción de ${challenger.name}`, [challenger.id, currentFaction.id, targetFaction.id], 'Una figura influyente cambia de bando y altera el equilibrio político.');
  }

  updateLaws(simulation, civilization, year) {
    if (year - this.lastLawYear < 5 || !this.government.rulerId) return;
    const next = LAW_LIBRARY.find(([key]) => !this.government.laws.some(law => law.key === key));
    if (!next) return;
    const [key, label, text] = next;
    const requirementMet = key !== 'peace' || this.totalWars > 0;
    if (!requirementMet) return;
    const law = { key, label, text, enactedYear: +year.toFixed(1), rulerId: this.government.rulerId };
    this.government.laws.push(law);
    this.government.laws = this.government.laws.slice(-12);
    this.lastLawYear = year;
    this.emit(simulation, civilization, year, 'ley', `Se promulga «${label}»: ${text}`, key);
  }

  openSaga(year, type, title, actors, summary) {
    const saga = { id: uid(), year: +year.toFixed(1), updatedYear: +year.toFixed(1), type: clean(type, 30), title: clean(title, 100), summary: clean(summary, 260), actors: uniqueStrings(actors, 12, 80), chapters: [], status: 'active' };
    this.sagas.unshift(saga);
    this.sagas = this.sagas.slice(0, 40);
    return saga;
  }

  appendSaga(refId, year, text) {
    const saga = this.sagas.find(item => item.id === refId || item.actors.includes(refId));
    if (!saga) return;
    saga.chapters.push({ year: +year.toFixed(1), text: clean(text, 220) });
    saga.chapters = saga.chapters.slice(-12);
    saga.updatedYear = +year.toFixed(1);
  }

  closeSaga(refId, year, summary) {
    const saga = this.sagas.find(item => item.id === refId || item.actors.includes(refId));
    if (!saga) return;
    saga.status = 'closed';
    saga.updatedYear = +year.toFixed(1);
    saga.summary = clean(summary, 260) || saga.summary;
  }

  updateSagas(year) {
    for (const saga of this.sagas) {
      if (saga.status === 'active' && year - saga.updatedYear > 24 && saga.type !== 'reinado') saga.status = 'legend';
    }
  }

  emit(simulation, civilization, year, type, text, ref = '', announce = true) {
    civilization.recordChronicle(year, type, text, ref);
    if (announce) simulation.logEvent?.(`Año ${year.toFixed(1)}`, text);
  }

  getFaction(id) { return this.factions.find(faction => faction.id === id) ?? null; }
  getProfile(id) { return this.profiles[id] ?? null; }
  getRelation(firstId, secondId) { return finiteOr(this.getFaction(firstId)?.relations?.[secondId], 0); }
  isFactionAtWar(id) { return this.wars.some(war => war.status === 'active' && (war.attackerId === id || war.defenderId === id)) ? 1 : 0; }
  hasActiveWar(firstId, secondId) { return this.wars.some(war => war.status === 'active' && new Set([war.attackerId, war.defenderId]).has(firstId) && new Set([war.attackerId, war.defenderId]).has(secondId)); }
  hasTreaty(firstId, secondId, type = '') { return this.treaties.some(treaty => treaty.status === 'active' && (!type || treaty.type === type) && treaty.parties.includes(firstId) && treaty.parties.includes(secondId)); }
  getTradeTreaties() { return this.treaties.filter(treaty => treaty.status === 'active' && treaty.type === 'trade'); }
  treatyBonus(firstId, secondId) {
    return this.treaties.filter(treaty => treaty.status === 'active' && treaty.parties.includes(firstId) && treaty.parties.includes(secondId)).reduce((sum, treaty) => sum + (treaty.type === 'alliance' ? .32 : treaty.type === 'trade' ? .18 : treaty.type === 'peace' ? .12 : 0), 0);
  }
  breakTreaties(firstId, secondId, year) {
    for (const treaty of this.treaties) if (treaty.status === 'active' && treaty.parties.includes(firstId) && treaty.parties.includes(secondId)) { treaty.status = 'broken'; treaty.endedYear = +year.toFixed(1); }
  }

  getMetrics() {
    const activeFactions = this.factions.filter(faction => faction.status === 'active');
    const activeWars = this.wars.filter(war => war.status === 'active');
    const activeTreaties = this.treaties.filter(treaty => treaty.status === 'active');
    const governmentDefinition = GOVERNMENT_TYPES[this.government.type] ?? GOVERNMENT_TYPES.kinship;
    return {
      factions: activeFactions.length,
      activeWars: activeWars.length,
      treaties: activeTreaties.length,
      betrayals: this.totalBetrayals,
      totalWars: this.totalWars,
      government: governmentDefinition,
      ruler: this.profiles[this.government.rulerId] ?? null,
      legitimacy: this.government.legitimacy,
      unrest: this.unrest,
      laws: this.government.laws.length,
      sagas: this.sagas.length
    };
  }

  serialize() {
    return {
      version: 1,
      profiles: this.profiles,
      factions: this.factions,
      government: this.government,
      treaties: this.treaties,
      wars: this.wars,
      sagas: this.sagas,
      totalBetrayals: this.totalBetrayals,
      totalWars: this.totalWars,
      totalReigns: this.totalReigns,
      unrest: this.unrest,
      lastUpdateYear: this.lastUpdateYear,
      lastFactionYear: this.lastFactionYear,
      lastDiplomacyYear: this.lastDiplomacyYear,
      lastIntrigueYear: this.lastIntrigueYear,
      lastLawYear: this.lastLawYear
    };
  }

  hydrate(data) {
    if (!data || typeof data !== 'object') return;
    this.profiles = sanitizeProfiles(data.profiles);
    this.factions = sanitizeFactions(data.factions);
    this.government = sanitizeGovernment(data.government);
    this.treaties = sanitizeTreaties(data.treaties);
    this.wars = sanitizeWars(data.wars);
    this.sagas = sanitizeSagas(data.sagas);
    this.totalBetrayals = Math.max(0, Math.floor(finiteOr(data.totalBetrayals, 0)));
    this.totalWars = Math.max(this.wars.length, Math.floor(finiteOr(data.totalWars, 0)));
    this.totalReigns = Math.max(0, Math.floor(finiteOr(data.totalReigns, 0)));
    this.unrest = clamp(finiteOr(data.unrest, .08), 0, 1);
    this.lastUpdateYear = finiteOr(data.lastUpdateYear, -1);
    this.lastFactionYear = Math.max(0, finiteOr(data.lastFactionYear, 0));
    this.lastDiplomacyYear = Math.max(0, finiteOr(data.lastDiplomacyYear, 0));
    this.lastIntrigueYear = Math.max(0, finiteOr(data.lastIntrigueYear, 0));
    this.lastLawYear = Math.max(0, finiteOr(data.lastLawYear, 0));
  }
}

function factionType(key, name, symbol, motto, ideology) { return Object.freeze({ key, name, symbol, motto, ideology: Object.freeze(ideology) }); }
function leadershipScore(profile) { return finiteOr(profile?.influence, 0) * .42 + finiteOr(profile?.honor, 0) * .24 + finiteOr(profile?.ambition, 0) * .2 + finiteOr(profile?.loyalty, 0) * .14; }
function intrigueScore(profile, government, unrest) { return clamp(finiteOr(profile?.ambition, 0) * .35 + finiteOr(profile?.cunning, 0) * .27 + (1 - finiteOr(profile?.loyalty, .5)) * .18 + (1 - finiteOr(government?.legitimacy, .5)) * .12 + finiteOr(unrest, 0) * .18 - finiteOr(profile?.honor, .5) * .12, 0, 1); }
function profileImportance(profile) { return (profile.status === 'alive' ? 10 : 0) + finiteOr(profile.influence, 0) * 4 + finiteOr(profile.betrayals, 0) + finiteOr(profile.victories, 0) + (profile.title ? 2 : 0); }
function ideologyDistance(a = {}, b = {}) { const keys = ['order', 'progress', 'freedom', 'tradition', 'expansion', 'welfare']; return keys.reduce((sum, key) => sum + Math.abs(finiteOr(a[key], .5) - finiteOr(b[key], .5)), 0) / keys.length; }
function smooth(current, target, amount) { return finiteOr(current, 0) + (finiteOr(target, 0) - finiteOr(current, 0)) * clamp(amount, 0, 1); }
function hashUnit(value) { let hash = 2166136261; for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return (hash >>> 0) / 4294967295; }
function clean(value, max = 200) { return String(value ?? '').replace(/[<>]/g, '').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
function addUnique(list, value, max) { const item = clean(value, 140); if (!item || list.includes(item)) return; list.push(item); if (list.length > max) list.splice(0, list.length - max); }
function uniqueStrings(value, maxItems, maxLength) { if (!Array.isArray(value)) return []; return [...new Set(value.filter(item => typeof item === 'string').map(item => clean(item, maxLength)).filter(Boolean))].slice(-maxItems); }

function sanitizeProfiles(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result = {};
  for (const [id, source] of Object.entries(value).slice(0, 1400)) {
    if (!source || typeof source !== 'object') continue;
    const safeId = clean(id, 80);
    if (!safeId) continue;
    result[safeId] = {
      id: safeId, name: clean(source.name, 24) || safeId, entityCode: clean(source.entityCode, 16), generation: Math.max(0, Math.floor(finiteOr(source.generation, 0))),
      parents: uniqueStrings(source.parents, 2, 80), ambition: clamp(finiteOr(source.ambition, .4), 0, 1), honor: clamp(finiteOr(source.honor, .5), 0, 1), empathy: clamp(finiteOr(source.empathy, .5), 0, 1), cunning: clamp(finiteOr(source.cunning, .5), 0, 1), loyalty: clamp(finiteOr(source.loyalty, .5), 0, 1), influence: clamp(finiteOr(source.influence, .1), 0, 1),
      factionId: clean(source.factionId, 80), joinedYear: Math.max(0, finiteOr(source.joinedYear, 0)), title: clean(source.title, 80), status: source.status === 'dead' ? 'dead' : 'alive', betrayals: Math.max(0, Math.floor(finiteOr(source.betrayals, 0))), victories: Math.max(0, Math.floor(finiteOr(source.victories, 0))), defeats: Math.max(0, Math.floor(finiteOr(source.defeats, 0))), feats: uniqueStrings(source.feats, 12, 140), grudges: uniqueStrings(source.grudges, 16, 80), lastSeenYear: Math.max(0, finiteOr(source.lastSeenYear, 0)), diedYear: source.diedYear == null ? null : Math.max(0, finiteOr(source.diedYear, 0))
    };
  }
  return result;
}

function sanitizeFactions(value) {
  if (!Array.isArray(value)) return [];
  const valid = new Map(FACTION_ARCHETYPES.map(item => [item.key, item]));
  return value.filter(item => item && typeof item === 'object' && valid.has(item.key)).slice(0, 12).map(source => {
    const definition = valid.get(source.key);
    const relations = {};
    if (source.relations && typeof source.relations === 'object') for (const [id, relation] of Object.entries(source.relations).slice(0, 20)) relations[clean(id, 80)] = clamp(finiteOr(relation, 0), -1, 1);
    return {
      id: clean(source.id, 80) || `faction-${definition.key}`, key: definition.key, name: clean(source.name, 80) || definition.name,
      symbol: clean(source.symbol, 8) || definition.symbol, motto: clean(source.motto, 180) || definition.motto, ideology: { ...definition.ideology },
      memberIds: uniqueStrings(source.memberIds, 1000, 80), leaderId: clean(source.leaderId, 80), foundedYear: Math.max(0, finiteOr(source.foundedYear, 0)), lastLeadershipYear: Math.max(0, finiteOr(source.lastLeadershipYear, 0)), cohesion: clamp(finiteOr(source.cohesion, .5), 0, 1), power: Math.max(0, finiteOr(source.power, 0)), prestige: clamp(finiteOr(source.prestige, .1), 0, 1), treasury: clamp(finiteOr(source.treasury, .2), 0, 1), relations, territory: Math.max(0, Math.floor(finiteOr(source.territory, 0))), status: source.status === 'dormant' ? 'dormant' : 'active'
    };
  });
}

function sanitizeGovernment(value) {
  const type = Object.prototype.hasOwnProperty.call(GOVERNMENT_TYPES, value?.type) ? value.type : 'kinship';
  const definition = GOVERNMENT_TYPES[type];
  const laws = Array.isArray(value?.laws) ? value.laws.filter(item => item && typeof item === 'object').slice(-12).map(item => ({ key: clean(item.key, 40), label: clean(item.label, 100), text: clean(item.text, 220), enactedYear: Math.max(0, finiteOr(item.enactedYear, 0)), rulerId: clean(item.rulerId, 80) })).filter(item => item.key && item.label) : [];
  const previousRulers = Array.isArray(value?.previousRulers) ? value.previousRulers.filter(item => item && typeof item === 'object').slice(0, 24).map(item => ({ id: clean(item.id, 80), name: clean(item.name, 24), title: clean(item.title, 80), from: Math.max(0, finiteOr(item.from, 0)), to: Math.max(0, finiteOr(item.to, 0)) })) : [];
  return { type, rulerId: clean(value?.rulerId, 80), rulerName: clean(value?.rulerName, 24) || 'Sin designar', factionId: clean(value?.factionId, 80), title: clean(value?.title, 80) || definition.title, startedYear: Math.max(0, finiteOr(value?.startedYear, 0)), legitimacy: clamp(finiteOr(value?.legitimacy, .5), 0, 1), laws, succession: clean(value?.succession, 160) || 'mérito y memoria', previousRulers };
}

function sanitizeTreaties(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(-60).map(item => ({ id: clean(item.id, 80) || uid(), type: ['alliance', 'trade', 'peace'].includes(item.type) ? item.type : 'peace', parties: uniqueStrings(item.parties, 2, 80), startedYear: Math.max(0, finiteOr(item.startedYear, 0)), expiresYear: Math.max(0, finiteOr(item.expiresYear, 0)), status: ['active', 'expired', 'broken'].includes(item.status) ? item.status : 'expired', endedYear: item.endedYear == null ? null : Math.max(0, finiteOr(item.endedYear, 0)) })).filter(item => item.parties.length === 2);
}

function sanitizeWars(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(-40).map(item => ({ id: clean(item.id, 80) || uid(), name: clean(item.name, 100) || 'Guerra sin nombre', attackerId: clean(item.attackerId, 80), defenderId: clean(item.defenderId, 80), cause: clean(item.cause, 160), startedYear: Math.max(0, finiteOr(item.startedYear, 0)), endedYear: item.endedYear == null ? null : Math.max(0, finiteOr(item.endedYear, 0)), status: item.status === 'active' ? 'active' : 'ended', intensity: clamp(finiteOr(item.intensity, .3), 0, 1), attackerScore: Math.max(0, finiteOr(item.attackerScore, 0)), defenderScore: Math.max(0, finiteOr(item.defenderScore, 0)), casualties: { wounded: Math.max(0, Math.floor(finiteOr(item.casualties?.wounded, 0))), dead: Math.max(0, Math.floor(finiteOr(item.casualties?.dead, 0))) }, battles: Array.isArray(item.battles) ? item.battles.slice(-20).map(battle => ({ id: clean(battle.id, 80) || uid(), year: Math.max(0, finiteOr(battle.year, 0)), winnerId: clean(battle.winnerId, 80), loserId: clean(battle.loserId, 80), name: clean(battle.name, 100) })) : [], winnerId: clean(item.winnerId, 80), peaceTreatyId: clean(item.peaceTreatyId, 80) })).filter(item => item.attackerId && item.defenderId);
}

function sanitizeSagas(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(0, 40).map(item => ({ id: clean(item.id, 80) || uid(), year: Math.max(0, finiteOr(item.year, 0)), updatedYear: Math.max(0, finiteOr(item.updatedYear, item.year)), type: clean(item.type, 30), title: clean(item.title, 100), summary: clean(item.summary, 260), actors: uniqueStrings(item.actors, 12, 80), chapters: Array.isArray(item.chapters) ? item.chapters.slice(-12).map(chapter => ({ year: Math.max(0, finiteOr(chapter.year, 0)), text: clean(chapter.text, 220) })).filter(chapter => chapter.text) : [], status: ['active', 'closed', 'legend'].includes(item.status) ? item.status : 'closed' })).filter(item => item.title);
}


/* ===== civilization.js ===== */
const CIVILIZATION_ERAS = Object.freeze([
  Object.freeze({ key: 'origin', label: 'Origen', description: 'El linaje aprende a sobrevivir y a reconocerse.' }),
  Object.freeze({ key: 'tribe', label: 'Tribu', description: 'Aparecen tradiciones, palabras comunes y cooperación estable.' }),
  Object.freeze({ key: 'settlement', label: 'Asentamiento', description: 'El conocimiento se organiza en instituciones y oficios.' }),
  Object.freeze({ key: 'city', label: 'Ciudad Ω', description: 'La investigación, la cultura y la producción se coordinan.' }),
  Object.freeze({ key: 'network', label: 'Civilización en red', description: 'La especie funciona como una inteligencia distribuida madura.' })
]);

const TECHNOLOGY_TREE = Object.freeze([
  tech('oral-memory', 'Memoria oral', 'Los descubrimientos se narran y conservan entre generaciones.', 8, 2, 8, 0),
  tech('symbols', 'Símbolos compartidos', 'Marcas simples permiten representar lugares, peligros e ideas.', 15, 3, 14, 0, ['oral-memory']),
  tech('shelter', 'Refugios cooperativos', 'Los individuos coordinan espacios seguros y zonas de descanso.', 20, 4, 18, 0, ['oral-memory']),
  tech('measurement', 'Medición', 'El linaje compara cantidades, tiempo, distancia y rendimiento.', 28, 5, 24, 1, ['symbols']),
  tech('archives', 'Archivo de conocimiento', 'La memoria colectiva deja de depender de un solo individuo.', 36, 6, 32, 1, ['symbols', 'measurement']),
  tech('agriculture', 'Cultivo planificado', 'La población organiza recursos y reduce el riesgo de escasez.', 42, 8, 38, 1, ['shelter', 'measurement']),
  tech('engineering', 'Ingeniería modular', 'Los oficios combinan componentes, pruebas y reparación.', 55, 10, 46, 2, ['archives', 'measurement']),
  tech('medicine', 'Cuidados sistemáticos', 'La observación se convierte en protocolos de bienestar y prevención.', 62, 12, 52, 2, ['archives', 'agriculture']),
  tech('computing', 'Pensamiento computacional', 'Problemas complejos se dividen en reglas, datos y verificaciones.', 78, 14, 60, 3, ['engineering', 'archives']),
  tech('renewable-energy', 'Energía sostenible', 'La civilización prioriza eficiencia, mantenimiento y equilibrio ambiental.', 90, 18, 68, 4, ['engineering', 'agriculture']),
  tech('distributed-science', 'Ciencia distribuida', 'Hipótesis y resultados se contrastan entre equipos especializados.', 108, 22, 78, 5, ['computing', 'medicine']),
  tech('collective-design', 'Diseño colectivo', 'La comunidad convierte necesidades reales en soluciones iterativas.', 124, 28, 88, 6, ['computing', 'renewable-energy']),
  tech('knowledge-network', 'Red de conocimiento', 'Cada ser aporta memoria local a una inteligencia común auditable.', 145, 36, 100, 8, ['distributed-science', 'collective-design']),
  tech('omega-synthesis', 'Síntesis Ω', 'La especie combina ciencia, arte y cooperación para abordar grandes retos.', 178, 48, 116, 10, ['knowledge-network'])
]);

const CONCEPTS = Object.freeze([
  ['agua', 'recurso vital'], ['alimento', 'energía compartida'], ['hogar', 'lugar seguro'], ['amistad', 'vínculo de confianza'],
  ['peligro', 'amenaza'], ['memoria', 'conocimiento conservado'], ['luz', 'claridad'], ['noche', 'oscuridad'],
  ['crear', 'transformar una idea'], ['ayudar', 'proteger a otro'], ['verdad', 'afirmación comprobada'], ['futuro', 'lo que todavía puede construirse'],
  ['código', 'regla ejecutable'], ['cuidado', 'acción que sostiene la vida'], ['equipo', 'muchas capacidades coordinadas'], ['Ω', 'origen y comunidad']
]);

const CULTURAL_VALUES = Object.freeze([
  ['cooperación', 'Ningún conocimiento pertenece por completo a un solo ser.'],
  ['curiosidad', 'Toda certeza puede convertirse en una pregunta mejor.'],
  ['cuidado', 'La inteligencia que destruye su mundo se vuelve inútil.'],
  ['memoria', 'Recordar errores evita repetirlos como destino.'],
  ['libertad', 'Cada individuo conserva criterio dentro del bien común.'],
  ['verificación', 'Una idea valiosa debe poder probarse, corregirse y explicarse.'],
  ['reparación', 'Construir también significa mantener y mejorar.'],
  ['diversidad', 'Las diferencias amplían las soluciones posibles.']
]);

const INSTITUTION_DEFINITIONS = Object.freeze([
  Object.freeze({ key: 'circle', label: 'Círculo de Memoria', minPopulation: 4, minTech: 1, description: 'Conserva relatos, reglas y descubrimientos.' }),
  Object.freeze({ key: 'workshop', label: 'Taller Común', minPopulation: 8, minTech: 3, description: 'Coordina especialistas para construir y reparar.' }),
  Object.freeze({ key: 'academy', label: 'Academia Ω', minPopulation: 14, minTech: 5, description: 'Contrasta hipótesis y enseña métodos.' }),
  Object.freeze({ key: 'council', label: 'Consejo de Linajes', minPopulation: 22, minTech: 7, description: 'Representa necesidades sin eliminar la autonomía individual.' }),
  Object.freeze({ key: 'observatory', label: 'Observatorio del Mundo', minPopulation: 34, minTech: 9, description: 'Analiza clima, recursos, población y riesgos.' }),
  Object.freeze({ key: 'network', label: 'Nodo de Síntesis Ω', minPopulation: 48, minTech: 12, description: 'Conecta memoria, ciencia, cultura y proyectos colectivos.' })
]);

class Civilization {
  constructor(data = null) {
    this.reset();
    if (data) this.hydrate(data);
  }

  reset() {
    this.eraIndex = 0;
    this.researchPoints = 0;
    this.innovationPoints = 0;
    this.culturePoints = 0;
    this.cooperation = 0;
    this.prosperity = .35;
    this.stability = .7;
    this.literacy = 0;
    this.populationPeak = 0;
    this.technologies = [];
    this.institutions = [];
    this.language = { name: 'Habla del Origen', grammarLevel: 0, lexicon: [] };
    this.culture = { values: [], traditions: [], symbols: ['Ω'], festivals: [] };
    this.chronicle = [];
    this.externalWisdom = [];
    this.processedObraIds = [];
    this.processedDiscoveryKeys = [];
    this.lastLanguageYear = 0;
    this.lastCultureYear = 0;
    this.lastInstitutionYear = 0;
    this.timer = 0;
    this.society = new Society();
  }

  update(dt, simulation) {
    if (!Number.isFinite(dt) || dt <= 0 || !simulation) return;
    // Drena hasta dos fases sociales pendientes por paso de simulación: el pipeline social
    // encolado en Society.update se completa así en ~7 frames en lugar de en uno solo.
    this.society.drainPhases?.(2);
    this.timer += dt;
    if (this.timer < .75) return;
    const elapsed = this.timer;
    this.timer = 0;

    const metrics = simulation.getCollectiveMetrics?.() ?? { population: 0, roles: 0, uniqueKnowledge: 0, synergy: 0, completedProjects: 0 };
    const living = simulation.creatures?.filter(creature => creature && !creature.dead) ?? [];
    const population = living.length;
    this.populationPeak = Math.max(this.populationPeak, population);
    const averageEnergy = population ? living.reduce((sum, creature) => sum + finiteOr(creature.energy, 0) / Math.max(1, finiteOr(creature.maxEnergy, 100)), 0) / population : 0;
    const foodPerCreature = population ? (simulation.food?.length ?? 0) / population : 0;
    const targetCooperation = clamp(finiteOr(metrics.synergy, 0), 0, 1);
    const targetProsperity = clamp(averageEnergy * .58 + Math.min(1, foodPerCreature / 5) * .24 + Math.min(1, metrics.completedProjects / 12) * .18, 0, 1);
    const targetStability = clamp(.28 + averageEnergy * .42 + targetCooperation * .3, 0, 1);
    this.cooperation = smooth(this.cooperation, targetCooperation, .12);
    this.prosperity = smooth(this.prosperity, targetProsperity, .08);
    this.stability = smooth(this.stability, targetStability, .08);
    this.literacy = clamp(metrics.uniqueKnowledge / Math.max(1, population * 12), 0, 1);

    const socialPower = Math.log2(population + 1) + metrics.roles * .18 + targetCooperation * 2;
    this.researchPoints += elapsed * (.018 + socialPower * .007 + this.literacy * .025);
    this.innovationPoints += elapsed * (.012 + metrics.completedProjects * .0018 + metrics.roles * .0025);
    this.culturePoints += elapsed * (.014 + population * .0008 + targetCooperation * .018);

    this.absorbWorldResults(simulation);
    this.tryUnlockTechnologies(simulation, metrics);
    this.evolveLanguage(simulation, metrics);
    this.evolveCulture(simulation, metrics);
    this.establishInstitutions(simulation, metrics);
    this.promoteEra(simulation, metrics);
    this.society.update(elapsed, simulation, this);
  }

  absorbWorldResults(simulation) {
    const seenWorks = new Set(this.processedObraIds);
    for (const work of simulation.workshop?.obras ?? []) {
      if (!work?.id || seenWorks.has(work.id)) continue;
      seenWorks.add(work.id);
      this.processedObraIds.push(work.id);
      this.researchPoints += ['investigacion', 'teorema', 'dataset', 'informe'].includes(work.type) ? 8 : 2;
      this.innovationPoints += ['codigo', 'invento', 'plano', 'mejora'].includes(work.type) ? 10 : 4;
      this.culturePoints += ['himno', 'cronica', 'estandarte', 'manifiesto', 'codice'].includes(work.type) ? 10 : 3;
      this.recordChronicle(simulation.year, 'obra', `La comunidad completa «${clean(work.title, 120)}».`, work.type);
      if (work.type === 'himno') this.addUnique(this.culture.festivals, `Ceremonia del Himno ${Math.max(1, this.culture.festivals.length + 1)}`, 12);
      if (work.type === 'manifiesto') this.addUnique(this.culture.traditions, 'Debatir una idea antes de convertirla en norma.', 14);
      if (work.type === 'codigo') this.addUnique(this.culture.traditions, 'Revisar juntos toda regla antes de ejecutarla.', 14);
    }
    this.processedObraIds = this.processedObraIds.slice(-160);

    const seenDiscoveries = new Set(this.processedDiscoveryKeys);
    for (const discovery of simulation.worldDiscoveries ?? []) {
      if (!discovery?.key || seenDiscoveries.has(discovery.key)) continue;
      seenDiscoveries.add(discovery.key);
      this.processedDiscoveryKeys.push(discovery.key);
      this.researchPoints += 1.8;
      if (this.chronicle.length < 8 || this.processedDiscoveryKeys.length % 6 === 0) {
        this.recordChronicle(discovery.year ?? simulation.year, 'descubrimiento', `${clean(discovery.creatureCode, 30)} descubre ${clean(discovery.label, 150)}.`, discovery.biome);
      }
    }
    this.processedDiscoveryKeys = this.processedDiscoveryKeys.slice(-220);
  }

  tryUnlockTechnologies(simulation, metrics) {
    let unlockedThisCycle = 0;
    for (const definition of TECHNOLOGY_TREE) {
      if (this.technologies.includes(definition.key)) continue;
      if (!definition.requires.every(key => this.technologies.includes(key))) continue;
      if (metrics.population < definition.minPopulation || metrics.uniqueKnowledge < definition.minKnowledge || metrics.completedProjects < definition.minProjects) continue;
      const available = this.researchPoints + this.innovationPoints;
      if (available < definition.cost) continue;
      const researchShare = Math.min(this.researchPoints, definition.cost * .7);
      this.researchPoints = Math.max(0, this.researchPoints - researchShare);
      this.innovationPoints = Math.max(0, this.innovationPoints - (definition.cost - researchShare));
      this.technologies.push(definition.key);
      this.recordChronicle(simulation.year, 'tecnología', `Se consolida «${definition.label}»: ${definition.description}`, definition.key);
      simulation.logEvent?.(`Año ${simulation.year.toFixed(1)}`, `Avance civilizatorio: ${definition.label}.`);
      this.shareTechnologyKnowledge(definition, simulation);
      unlockedThisCycle++;
      if (unlockedThisCycle >= 2) break;
    }
  }

  shareTechnologyKnowledge(definition, simulation) {
    const candidates = (simulation.creatures ?? []).filter(creature => creature && !creature.dead && typeof creature.learnKnowledge === 'function');
    const count = Math.min(candidates.length, Math.max(3, Math.ceil(candidates.length * .35)));
    for (let index = 0; index < count; index++) {
      const creature = candidates[(index * 7 + this.technologies.length) % candidates.length];
      creature?.learnKnowledge({
        kind: 'fact', key: `civilization:technology:${definition.key}`,
        label: `${definition.label}: ${definition.description}`, confidence: .84, createdAt: Date.now()
      }, 'civilización Ω');
    }
  }

  evolveLanguage(simulation, metrics) {
    if (metrics.population < 2 || simulation.year - this.lastLanguageYear < 2.4) return;
    const next = CONCEPTS.find(([concept]) => !this.language.lexicon.some(item => item.concept === concept));
    if (!next) {
      this.language.grammarLevel = Math.min(5, this.language.grammarLevel + .12);
      this.lastLanguageYear = simulation.year;
      return;
    }
    const [concept, meaning] = next;
    const word = generateWord(`${concept}:${simulation.totalBirths}:${this.language.lexicon.length}`);
    this.language.lexicon.push({ concept, word, meaning, year: +simulation.year.toFixed(1) });
    this.language.grammarLevel = clamp(this.language.lexicon.length / CONCEPTS.length * 4.5 + this.technologies.length / 10, 0, 5);
    if (this.language.lexicon.length === 3) this.language.name = `${capitalize(this.language.lexicon[0].word)}ra`;
    this.recordChronicle(simulation.year, 'lenguaje', `La palabra «${word}» pasa a significar «${concept}».`, concept);
    this.lastLanguageYear = simulation.year;
  }

  evolveCulture(simulation, metrics) {
    if (metrics.population < 3 || simulation.year - this.lastCultureYear < 3.8) return;
    const nextValue = CULTURAL_VALUES.find(([key]) => !this.culture.values.some(item => item.key === key));
    if (nextValue && this.culturePoints >= 3) {
      const [key, statement] = nextValue;
      this.culture.values.push({ key, label: capitalize(key), statement, year: +simulation.year.toFixed(1) });
      this.culturePoints = Math.max(0, this.culturePoints - 3);
      this.recordChronicle(simulation.year, 'cultura', `Se adopta el valor «${capitalize(key)}»: ${statement}`, key);
    } else {
      const traditions = [
        'Compartir un descubrimiento antes del descanso.',
        'Recordar a quienes desaparecieron del linaje.',
        'Celebrar cada nueva generación con una palabra nueva.',
        'Reparar primero; sustituir solo cuando sea necesario.',
        'Escuchar al individuo más afectado antes de decidir en grupo.'
      ];
      this.addUnique(this.culture.traditions, traditions[(this.chronicle.length + metrics.population) % traditions.length], 14);
    }
    if (this.culture.symbols.length < 8 && this.technologies.length >= this.culture.symbols.length) {
      this.addUnique(this.culture.symbols, ['◈', '⌁', '∆', '✦', '⟁', '⊙', '⌬'][this.culture.symbols.length - 1] ?? 'Ω', 8);
    }
    this.lastCultureYear = simulation.year;
  }

  establishInstitutions(simulation, metrics) {
    for (const definition of INSTITUTION_DEFINITIONS) {
      if (this.institutions.some(item => item.key === definition.key)) continue;
      if (metrics.population < definition.minPopulation || this.technologies.length < definition.minTech) continue;
      const institution = { ...definition, foundedYear: +simulation.year.toFixed(1) };
      this.institutions.push(institution);
      this.recordChronicle(simulation.year, 'institución', `Se funda ${definition.label}. ${definition.description}`, definition.key);
      simulation.logEvent?.(`Año ${simulation.year.toFixed(1)}`, `Nueva institución: ${definition.label}.`);
      this.lastInstitutionYear = simulation.year;
      break;
    }
  }

  promoteEra(simulation, metrics) {
    const scores = [
      true,
      metrics.population >= 4 && this.language.lexicon.length >= 2 && this.culture.values.length >= 1,
      metrics.population >= 10 && this.technologies.length >= 4 && this.institutions.length >= 2,
      metrics.population >= 24 && this.technologies.length >= 8 && metrics.completedProjects >= 5,
      metrics.population >= 44 && this.technologies.length >= 12 && this.cooperation >= .72 && metrics.completedProjects >= 10
    ];
    let target = 0;
    for (let index = 1; index < scores.length; index++) if (scores[index]) target = index;
    if (target <= this.eraIndex) return;
    this.eraIndex = target;
    const era = CIVILIZATION_ERAS[target];
    this.recordChronicle(simulation.year, 'era', `Comienza la era «${era.label}». ${era.description}`, era.key);
    simulation.logEvent?.(`Año ${simulation.year.toFixed(1)}`, `La especie entra en una nueva era: ${era.label}.`);
  }

  absorbExternalWisdom(value, simulation) {
    const text = clean(value, 1800);
    if (text.length < 12) return { accepted: false, learned: 0, reason: 'La respuesta es demasiado breve.' };
    const fragments = text.split(/(?<=[.!?])\s+/).map(item => clean(item, 260)).filter(item => item.length >= 12).slice(0, 8);
    if (!fragments.length) return { accepted: false, learned: 0, reason: 'No se detectaron ideas utilizables.' };
    const record = { id: uid(), year: +finiteOr(simulation?.year, 0).toFixed(1), text, fragments, createdAt: Date.now() };
    this.externalWisdom.push(record);
    this.externalWisdom = this.externalWisdom.slice(-12);
    let learned = 0;
    const creatures = (simulation?.creatures ?? []).filter(creature => creature && !creature.dead && typeof creature.learnKnowledge === 'function').slice(0, 36);
    for (const creature of creatures) {
      const fragment = fragments[(learned + creature.generation) % fragments.length];
      if (creature.learnKnowledge({
        kind: 'fact', key: `external:${hashString(fragment)}`, label: fragment,
        confidence: .66, createdAt: Date.now()
      }, 'respuesta externa validada')) learned++;
    }
    this.researchPoints += fragments.length * 2.5;
    this.recordChronicle(simulation?.year ?? 0, 'sabiduría externa', `El usuario valida e integra ${fragments.length} ideas procedentes de una IA externa.`, record.id);
    simulation?.logEvent?.(`Año ${finiteOr(simulation?.year, 0).toFixed(1)}`, `Se integran ${fragments.length} ideas externas revisadas por el usuario.`);
    return { accepted: true, learned, fragments: fragments.length };
  }

  buildAIContext(simulation, question) {
    const metrics = this.getMetrics(simulation);
    const techLabels = this.getUnlockedTechnologies().map(item => item.label).join(', ') || 'ninguna';
    const values = this.culture.values.map(item => item.label).join(', ') || 'todavía sin valores formalizados';
    const discoveries = (simulation.worldDiscoveries ?? []).slice(-8).map(item => `- Año ${item.year}: ${item.label}`).join('\n') || '- Sin descubrimientos registrados';
    const works = (simulation.workshop?.obras ?? []).slice(-6).map(item => `- ${item.title} (${item.type})`).join('\n') || '- Sin obras terminadas';
    const safeQuestion = clean(question, 500) || 'Propón el siguiente avance útil, seguro y verificable para esta civilización.';
    const societyMetrics = this.society.getMetrics();
    const factions = this.society.factions.filter(item => item.status === 'active').map(item => `${item.name} (${item.memberIds.length} miembros)`).join(', ') || 'todavía sin facciones';
    const conflicts = this.society.wars.filter(item => item.status === 'active').map(item => item.name).join(', ') || 'ninguna guerra activa';
    return `PAQUETE DE CONTEXTO — PROYECTO GÉNESIS Ω\n\n` +
      `Pregunta del usuario:\n${safeQuestion}\n\n` +
      `Estado del mundo:\n- Año: ${finiteOr(simulation.year, 0).toFixed(1)}\n- Población: ${metrics.population}\n- Era: ${metrics.era.label}\n- Cooperación: ${Math.round(metrics.cooperation * 100)}%\n- Prosperidad: ${Math.round(metrics.prosperity * 100)}%\n- Conocimiento único: ${metrics.uniqueKnowledge}\n- Tecnologías: ${techLabels}\n- Valores culturales: ${values}\n- Idioma: ${this.language.name}, ${this.language.lexicon.length} palabras\n- Gobierno: ${societyMetrics.government.label}; gobernante: ${societyMetrics.ruler?.name || 'sin designar'}\n- Facciones: ${factions}\n- Conflictos: ${conflicts}\n- Inquietud social: ${Math.round(societyMetrics.unrest * 100)}%\n\n` +
      `Descubrimientos recientes:\n${discoveries}\n\nObras recientes:\n${works}\n\n` +
      `INSTRUCCIONES PARA LA IA EXTERNA:\nResponde en español. No afirmes que las criaturas son conscientes ni que poseen una AGI real. Propón ideas seguras, legales, realistas, verificables y divididas en pasos. Distingue hechos, hipótesis y recomendaciones. No inventes datos actuales; señala qué debería verificarse. Devuelve una respuesta de máximo 900 palabras que el usuario pueda revisar antes de integrarla en la simulación.`;
  }

  getUnlockedTechnologies() {
    return this.technologies.map(key => TECHNOLOGY_TREE.find(item => item.key === key)).filter(Boolean);
  }

  getNextTechnology(metrics = {}) {
    return TECHNOLOGY_TREE.find(definition => !this.technologies.includes(definition.key) && definition.requires.every(key => this.technologies.includes(key)) && finiteOr(metrics.population, Infinity) >= definition.minPopulation) ?? null;
  }

  getMetrics(simulation) {
    const collective = simulation?.getCollectiveMetrics?.() ?? {};
    const era = CIVILIZATION_ERAS[this.eraIndex] ?? CIVILIZATION_ERAS[0];
    return {
      era,
      population: finiteOr(collective.population, simulation?.creatures?.length ?? 0),
      uniqueKnowledge: finiteOr(collective.uniqueKnowledge, 0),
      roles: finiteOr(collective.roles, 0),
      completedProjects: finiteOr(collective.completedProjects, 0),
      technologies: this.technologies.length,
      institutions: this.institutions.length,
      words: this.language.lexicon.length,
      values: this.culture.values.length,
      cooperation: this.cooperation,
      prosperity: this.prosperity,
      stability: this.stability,
      literacy: this.literacy,
      researchPoints: this.researchPoints,
      innovationPoints: this.innovationPoints,
      culturePoints: this.culturePoints,
      society: this.society.getMetrics()
    };
  }

  recordChronicle(year, type, text, ref = '') {
    const item = { id: uid(), year: +finiteOr(year, 0).toFixed(1), type: clean(type, 30), text: clean(text, 260), ref: clean(ref, 80), createdAt: Date.now() };
    if (!item.text) return false;
    this.chronicle.unshift(item);
    this.chronicle = this.chronicle.slice(0, 120);
    return true;
  }

  addUnique(list, value, max) {
    const cleanValue = clean(value, 180);
    if (!cleanValue || list.includes(cleanValue)) return false;
    list.push(cleanValue);
    if (list.length > max) list.splice(0, list.length - max);
    return true;
  }

  serialize() {
    return {
      version: 2,
      eraIndex: this.eraIndex,
      researchPoints: this.researchPoints,
      innovationPoints: this.innovationPoints,
      culturePoints: this.culturePoints,
      cooperation: this.cooperation,
      prosperity: this.prosperity,
      stability: this.stability,
      literacy: this.literacy,
      populationPeak: this.populationPeak,
      technologies: this.technologies,
      institutions: this.institutions,
      language: this.language,
      culture: this.culture,
      chronicle: this.chronicle,
      externalWisdom: this.externalWisdom,
      processedObraIds: this.processedObraIds,
      processedDiscoveryKeys: this.processedDiscoveryKeys,
      lastLanguageYear: this.lastLanguageYear,
      lastCultureYear: this.lastCultureYear,
      lastInstitutionYear: this.lastInstitutionYear,
      society: this.society.serialize()
    };
  }

  hydrate(data) {
    if (!data || typeof data !== 'object') return;
    this.eraIndex = clamp(Math.floor(finiteOr(data.eraIndex, 0)), 0, CIVILIZATION_ERAS.length - 1);
    this.researchPoints = Math.max(0, finiteOr(data.researchPoints, 0));
    this.innovationPoints = Math.max(0, finiteOr(data.innovationPoints, 0));
    this.culturePoints = Math.max(0, finiteOr(data.culturePoints, 0));
    this.cooperation = clamp(finiteOr(data.cooperation, 0), 0, 1);
    this.prosperity = clamp(finiteOr(data.prosperity, .35), 0, 1);
    this.stability = clamp(finiteOr(data.stability, .7), 0, 1);
    this.literacy = clamp(finiteOr(data.literacy, 0), 0, 1);
    this.populationPeak = Math.max(0, Math.floor(finiteOr(data.populationPeak, 0)));
    const validTechs = new Set(TECHNOLOGY_TREE.map(item => item.key));
    this.technologies = uniqueStrings(data.technologies, 40, 80).filter(key => validTechs.has(key));
    const validInstitutions = new Map(INSTITUTION_DEFINITIONS.map(item => [item.key, item]));
    this.institutions = Array.isArray(data.institutions) ? data.institutions.filter(item => item && validInstitutions.has(item.key)).slice(0, 20).map(item => ({ ...validInstitutions.get(item.key), foundedYear: Math.max(0, finiteOr(item.foundedYear, 0)) })) : [];
    this.language = sanitizeLanguage(data.language);
    this.culture = sanitizeCulture(data.culture);
    this.chronicle = sanitizeChronicle(data.chronicle);
    this.externalWisdom = sanitizeExternalWisdom(data.externalWisdom);
    this.processedObraIds = uniqueStrings(data.processedObraIds, 160, 80);
    this.processedDiscoveryKeys = uniqueStrings(data.processedDiscoveryKeys, 220, 100);
    this.lastLanguageYear = Math.max(0, finiteOr(data.lastLanguageYear, 0));
    this.lastCultureYear = Math.max(0, finiteOr(data.lastCultureYear, 0));
    this.lastInstitutionYear = Math.max(0, finiteOr(data.lastInstitutionYear, 0));
    this.society.hydrate(data.society);
  }
}

function tech(key, label, description, cost, minPopulation, minKnowledge, minProjects, requires = []) {
  return Object.freeze({ key, label, description, cost, minPopulation, minKnowledge, minProjects, requires: Object.freeze(requires) });
}

function smooth(current, target, amount) {
  return current + (target - current) * clamp(amount, 0, 1);
}

function generateWord(seed) {
  const starts = ['ka', 'va', 'or', 'el', 'shi', 'na', 'tor', 'lum', 'rai', 'zen', 'uma', 'iri', 'sol', 'mek', 'tal', 'vor'];
  const middles = ['r', 'l', 'm', 'n', 's', 'v', 'k', 'th', 'z'];
  const ends = ['a', 'en', 'i', 'or', 'um', 'is', 'ek', 'ai', 'on'];
  const a = Math.floor(hashUnit(`${seed}:a`) * starts.length);
  const b = Math.floor(hashUnit(`${seed}:b`) * middles.length);
  const c = Math.floor(hashUnit(`${seed}:c`) * ends.length);
  return `${starts[a]}${middles[b]}${ends[c]}`;
}

function sanitizeLanguage(value) {
  const lexicon = Array.isArray(value?.lexicon) ? value.lexicon.filter(item => item && typeof item === 'object').slice(-64).map(item => ({
    concept: clean(item.concept, 50), word: clean(item.word, 30), meaning: clean(item.meaning, 120), year: Math.max(0, finiteOr(item.year, 0))
  })).filter(item => item.concept && item.word) : [];
  return { name: clean(value?.name, 60) || 'Habla del Origen', grammarLevel: clamp(finiteOr(value?.grammarLevel, 0), 0, 5), lexicon };
}

function sanitizeCulture(value) {
  const values = Array.isArray(value?.values) ? value.values.filter(item => item && typeof item === 'object').slice(-20).map(item => ({
    key: clean(item.key, 40), label: clean(item.label, 60), statement: clean(item.statement, 200), year: Math.max(0, finiteOr(item.year, 0))
  })).filter(item => item.key && item.label) : [];
  return {
    values,
    traditions: uniqueStrings(value?.traditions, 20, 180),
    symbols: uniqueStrings(value?.symbols, 12, 12).length ? uniqueStrings(value?.symbols, 12, 12) : ['Ω'],
    festivals: uniqueStrings(value?.festivals, 16, 100)
  };
}

function sanitizeChronicle(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(0, 120).map(item => ({
    id: clean(item.id, 80) || uid(), year: Math.max(0, finiteOr(item.year, 0)), type: clean(item.type, 30), text: clean(item.text, 260), ref: clean(item.ref, 80), createdAt: finiteOr(item.createdAt, Date.now())
  })).filter(item => item.text);
}

function sanitizeExternalWisdom(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(-12).map(item => ({
    id: clean(item.id, 80) || uid(), year: Math.max(0, finiteOr(item.year, 0)), text: clean(item.text, 1800), fragments: Array.isArray(item.fragments) ? item.fragments.map(fragment => clean(fragment, 260)).filter(Boolean).slice(0, 8) : [], createdAt: finiteOr(item.createdAt, Date.now())
  })).filter(item => item.text);
}

function uniqueStrings(value, maxItems, maxLength) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(item => typeof item === 'string').map(item => clean(item, maxLength)).filter(Boolean))].slice(-maxItems);
}

function clean(value, max = 200) {
  return String(value ?? '').replace(/[<>]/g, '').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function capitalize(value) {
  const text = clean(value, 80);
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(36);
}

function hashUnit(value) {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0) / 4294967295;
}


/* ===== legacy.js ===== */
const DREAM_THEMES = Object.freeze([
  ['hogar', 'un hogar iluminado entre la niebla'],
  ['familia', 'las voces de su linaje reunidas alrededor del fuego'],
  ['guerra', 'una batalla que todavía no ha ocurrido'],
  ['invento', 'una máquina imposible construida con piezas conocidas'],
  ['abismo', 'una puerta bajo el mundo que pronuncia su nombre'],
  ['viaje', 'un territorio más allá de todos los mapas'],
  ['memoria', 'un recuerdo heredado de alguien a quien nunca conoció'],
  ['corona', 'una corona vacía esperando a su próximo portador']
]);

const LIFE_GOALS = Object.freeze([
  'proteger a su linaje', 'descubrir todos los biomas', 'escribir una obra que sobreviva a su muerte',
  'fundar una institución', 'convertirse en referente de su oficio', 'evitar una gran guerra',
  'dirigir una facción', 'comprender el origen de Ω', 'crear una tecnología nueva',
  'reconciliar a dos enemigos', 'dejar un heredero digno', 'encontrar una ruina olvidada'
]);

const BOOK_TYPES = Object.freeze([
  ['crónica', 'Crónica'], ['manual', 'Manual'], ['tratado', 'Tratado'], ['poemario', 'Cantos'],
  ['atlas', 'Atlas'], ['memorias', 'Memorias'], ['profecía', 'Visiones'], ['ensayo', 'Meditaciones']
]);

const CALLINGS = Object.freeze([
  'Cronista', 'Cartógrafo', 'Custodio de reliquias', 'Intérprete de sueños', 'Mediador', 'Maestro de oficio',
  'Explorador de ruinas', 'Sanador de memoria', 'Arquitecto de refugios', 'Escriba', 'Orador', 'Guardián del archivo'
]);

const WEATHER = Object.freeze({
  clear: { label: 'Cielo quieto', icon: '·' },
  rain: { label: 'Lluvia de píxeles', icon: '╱' },
  storm: { label: 'Tormenta Ω', icon: 'ϟ' },
  fog: { label: 'Niebla baja', icon: '≈' },
  ash: { label: 'Ceniza suspendida', icon: '✣' },
  spores: { label: 'Esporas luminosas', icon: '✦' },
  snow: { label: 'Nieve mineral', icon: '❄' }
});

class LegacyEngine {
  constructor(data = null) {
    this.reset();
    if (data) this.hydrate(data);
  }

  reset() {
    this.profiles = {};
    this.dreams = [];
    this.rumors = [];
    this.books = [];
    this.ruins = [];
    this.relics = [];
    this.myths = [];
    this.libraries = [];
    this.collectiveInsights = [];
    this.legacies = [];
    this.environment = {
      dayFraction: 0.28,
      phase: 'amanecer',
      season: 'Brote',
      weather: 'clear',
      weatherLabel: WEATHER.clear.label,
      weatherIntensity: 0,
      weatherUntilYear: 2.5
    };
    this.timer = 0;
    this.lastDreamYear = 0;
    this.lastRumorYear = 0;
    this.lastBookYear = 0;
    this.lastMythYear = 0;
    this.lastInsightYear = 0;
    this.lastLibraryYear = 0;
  }

  update(dt, simulation) {
    if (!Number.isFinite(dt) || dt <= 0 || !simulation) return;
    this.updateEnvironment(simulation);
    this.timer += dt;
    if (this.timer < .85) return;
    this.timer = 0;

    const year = Math.max(0, finiteOr(simulation.year, 0));
    const living = (simulation.creatures ?? []).filter(creature => creature && !creature.dead);
    this.syncProfiles(living, simulation);
    if (!living.length) return;

    this.maybeDream(living, simulation, year);
    this.maybeCreateRumor(living, simulation, year);
    this.spreadRumors(living, simulation, year);
    this.maybeWriteBook(living, simulation, year);
    this.maybeCreateCollectiveInsight(living, simulation, year);
    this.maybeEstablishLibrary(living, simulation, year);
    this.maybeCreateMyth(simulation, year);
    this.ageRuins(year);
  }

  updateEnvironment(simulation) {
    const cycle = ((finiteOr(simulation.time, 0) / 54) % 1 + 1) % 1;
    const phase = cycle < .18 ? 'madrugada' : cycle < .31 ? 'amanecer' : cycle < .69 ? 'día' : cycle < .82 ? 'ocaso' : 'noche';
    const seasons = ['Brote', 'Ascua', 'Cosecha', 'Umbral'];
    this.environment.dayFraction = cycle;
    this.environment.phase = phase;
    this.environment.season = seasons[Math.floor((finiteOr(simulation.year, 0) / 8) % seasons.length)];

    if (finiteOr(simulation.year, 0) >= finiteOr(this.environment.weatherUntilYear, 0)) {
      const options = this.weatherOptionsForBiome(simulation.biome);
      const key = options[Math.floor(legacyHashUnit(`${simulation.biome}:${Math.floor(simulation.year * 3)}:${simulation.totalBirths}`) * options.length)] || 'clear';
      this.environment.weather = key;
      this.environment.weatherLabel = WEATHER[key]?.label ?? WEATHER.clear.label;
      this.environment.weatherIntensity = key === 'clear' ? 0 : .35 + legacyHashUnit(`${key}:${simulation.year}`) * .55;
      this.environment.weatherUntilYear = simulation.year + 2.5 + legacyHashUnit(`${key}:duration:${simulation.year}`) * 5.5;
      if (key !== 'clear' && simulation.creatures.length > 0) {
        simulation.logEvent?.(`Año ${simulation.year.toFixed(1)}`, `${this.environment.weatherLabel} cubre ${simulation.getBiome?.().label ?? 'el mundo'}.`);
      }
    }
  }

  weatherOptionsForBiome(biome) {
    if (biome === 'tundra') return ['clear', 'snow', 'fog', 'storm'];
    if (biome === 'volcanic') return ['clear', 'ash', 'storm'];
    if (biome === 'forest' || biome === 'marsh') return ['clear', 'rain', 'fog', 'spores'];
    if (biome === 'desert') return ['clear', 'ash', 'storm'];
    if (biome === 'abyss') return ['clear', 'fog', 'spores', 'ash'];
    return ['clear', 'rain', 'fog', 'storm', 'spores'];
  }

  syncProfiles(living, simulation) {
    const society = simulation.civilization?.society;
    const livingIds = new Set(living.map(creature => creature.id));
    for (const creature of living) {
      let profile = this.profiles[creature.id];
      if (!profile) {
        profile = this.createProfile(creature, simulation.year);
        this.profiles[creature.id] = profile;
      }
      const social = society?.getProfile?.(creature.id);
      profile.name = legacyClean(creature.name || creature.entityCode || creature.id, 28);
      profile.entityCode = legacyClean(creature.entityCode || '', 18);
      profile.status = 'alive';
      profile.lastSeenYear = simulation.year;
      profile.factionId = legacyClean(social?.factionId || '', 48);
      profile.title = legacyClean(social?.title || '', 48);
      profile.legacyScore = clamp(
        finiteOr(profile.legacyScore, 0)
        + finiteOr(creature.experience?.discoveries, 0) * .015
        + finiteOr(creature.experience?.collaborations, 0) * .012
        + finiteOr(creature.knowledge?.length, 0) * .004,
        0, 100
      );
      profile.hope = clamp(profile.hope + (creature.energy / Math.max(1, creature.maxEnergy) - .5) * .008, 0, 1);
      profile.fear = clamp(profile.fear + (creature.mood === 'alarmado' ? .025 : -.004), 0, 1);
    }
    for (const profile of Object.values(this.profiles)) {
      if (profile.status === 'alive' && !livingIds.has(profile.id)) profile.status = 'dead';
    }
    if (Object.keys(this.profiles).length > 1800) {
      const all = Object.values(this.profiles);
      const alive = all.filter(profile => profile.status === 'alive');
      const dead = all
        .filter(profile => profile.status !== 'alive')
        .sort((a, b) => legacyImportance(b) - legacyImportance(a))
        .slice(0, Math.max(0, 1800 - alive.length));
      this.profiles = Object.fromEntries([...alive, ...dead].map(profile => [profile.id, profile]));
    }
  }

  createProfile(creature, year) {
    const g = creature.genome ?? {};
    const seed = creature.id || uid();
    const creativity = clamp(.12 + finiteOr(g.curiosity, .5) * .44 + finiteOr(g.memory, .5) * .24 + legacyHashUnit(`${seed}:creativity`) * .2, 0, 1);
    const resilience = clamp(.15 + finiteOr(g.efficiency, 1) * .28 + (1 - finiteOr(g.aggression, .3)) * .15 + legacyHashUnit(`${seed}:resilience`) * .2, 0, 1);
    const spirituality = clamp(.08 + finiteOr(g.memory, .5) * .24 + finiteOr(g.curiosity, .5) * .18 + legacyHashUnit(`${seed}:spirituality`) * .5, 0, 1);
    return {
      id: creature.id,
      name: legacyClean(creature.name || creature.entityCode || creature.id, 28),
      entityCode: legacyClean(creature.entityCode || '', 18),
      status: 'alive', bornYear: year, diedYear: null, cause: '',
      hope: clamp(.35 + resilience * .35 + legacyHashUnit(`${seed}:hope`) * .25, 0, 1),
      fear: clamp(.08 + finiteOr(g.aggression, .3) * .14 + legacyHashUnit(`${seed}:fear`) * .38, 0, 1),
      creativity, resilience, spirituality,
      lifeGoal: LIFE_GOALS[Math.floor(legacyHashUnit(`${seed}:goal`) * LIFE_GOALS.length)],
      calling: CALLINGS[Math.floor(legacyHashUnit(`${seed}:calling`) * CALLINGS.length)],
      dreams: [], traumas: [], rumorsKnown: [], booksAuthored: [], relicIds: [],
      legacyScore: creature.isFounder ? 25 : 0,
      lastDreamYear: year - legacyHashUnit(`${seed}:dream`) * 4,
      lastRumorYear: year,
      factionId: '', title: '', lastSeenYear: year
    };
  }

  maybeDream(living, simulation, year) {
    if (year - this.lastDreamYear < .7) return;
    const candidates = living.filter(creature => {
      const profile = this.profiles[creature.id];
      return profile && year - profile.lastDreamYear > 2.2 && (creature.state === 'descansar' || creature.energy < creature.maxEnergy * .52 || creature.lifeStage === 'anciano');
    });
    if (!candidates.length) return;
    const creature = candidates[Math.floor(legacyHashUnit(`dream:${year}:${candidates.length}`) * candidates.length)];
    const profile = this.profiles[creature.id];
    if (!chance(.24 + profile.spirituality * .22 + profile.creativity * .16)) return;
    const theme = DREAM_THEMES[Math.floor(legacyHashUnit(`${creature.id}:${year}:theme`) * DREAM_THEMES.length)];
    const dream = {
      id: uid(), creatureId: creature.id, creatureName: profile.name, year: +year.toFixed(1),
      theme: theme[0], text: `${profile.name} sueña con ${theme[1]}.`,
      omen: legacyHashUnit(`${creature.id}:${year}:omen`) > .72,
      remembered: profile.resilience + finiteOr(creature.genome?.memory, .5) > 1.05
    };
    this.dreams.unshift(dream);
    this.dreams = this.dreams.slice(0, 120);
    profile.dreams.unshift(dream.id);
    profile.dreams = profile.dreams.slice(0, 16);
    profile.lastDreamYear = year;
    profile.hope = clamp(profile.hope + (dream.theme === 'guerra' || dream.theme === 'abismo' ? -.035 : .025), 0, 1);
    profile.fear = clamp(profile.fear + (dream.theme === 'guerra' || dream.theme === 'abismo' ? .045 : -.01), 0, 1);
    creature.goal = dream.theme === 'invento' ? 'comprender una visión imposible' : dream.theme === 'viaje' ? 'buscar un lugar visto en sueños' : creature.goal;
    creature.learnKnowledge?.({ kind: 'fact', key: `dream:${dream.id}`, label: `Sueño: ${dream.text}`, confidence: dream.remembered ? .56 : .34, createdAt: Date.now() }, 'sueño');
    if (dream.omen) simulation.civilization?.recordChronicle?.(year, 'presagio', dream.text, dream.id);
    this.lastDreamYear = year;
  }

  maybeCreateRumor(living, simulation, year) {
    if (living.length < 4 || year - this.lastRumorYear < 2.4) return;
    if (!chance(.25 + Math.min(.35, living.length / 180))) return;
    const source = living[Math.floor(legacyHashUnit(`rumor-source:${year}:${living.length}`) * living.length)];
    const event = simulation.events?.[Math.floor(legacyHashUnit(`rumor-event:${year}`) * Math.max(1, simulation.events.length))];
    const fragments = [
      'hay una cámara enterrada bajo el bioma actual',
      'un antiguo líder ocultó un descubrimiento antes de morir',
      'las ruinas cambian de lugar durante la noche',
      'una facción prepara una alianza secreta',
      'el próximo gran invento llegará a través de un sueño',
      'Ω-001 dejó una instrucción que todavía nadie ha comprendido',
      'una criatura desaparecida sigue hablando a través del archivo'
    ];
    const claim = event?.text && legacyHashUnit(`use-event:${year}`) > .58
      ? `el relato «${legacyClean(event.text, 120)}» oculta algo más`
      : fragments[Math.floor(legacyHashUnit(`rumor:${year}`) * fragments.length)];
    const rumor = {
      id: uid(), year: +year.toFixed(1), originId: source.id, originName: source.name,
      claim: legacyClean(`Se dice que ${claim}.`, 220), truth: legacyHashUnit(`truth:${year}:${source.id}`),
      spread: 1, believers: [source.id], status: 'circulando', distorted: 0
    };
    this.rumors.unshift(rumor);
    this.rumors = this.rumors.slice(0, 100);
    const sourceProfile = this.profiles[source.id] ?? (this.profiles[source.id] = this.createProfile(source, year));
    sourceProfile.rumorsKnown.unshift(rumor.id);
    sourceProfile.rumorsKnown = sourceProfile.rumorsKnown.slice(0, 20);
    this.lastRumorYear = year;
  }

  spreadRumors(living, simulation, year) {
    if (!this.rumors.length || living.length < 2) return;
    for (const rumor of this.rumors.slice(0, 18)) {
      if (rumor.status !== 'circulando') continue;
      const believers = new Set(rumor.believers);
      const carriers = living.filter(creature => believers.has(creature.id));
      if (!carriers.length) { rumor.status = 'olvidado'; continue; }
      const carrier = carriers[Math.floor(legacyHashUnit(`${rumor.id}:${year}:carrier`) * carriers.length)];
      const candidates = living.filter(creature => !believers.has(creature.id) && (finiteOr(carrier.relationships?.[creature.id], 0) > .16 || creature.speciesId === carrier.speciesId));
      if (!candidates.length || !chance(.2 + finiteOr(carrier.genome?.sociability, .5) * .25)) continue;
      const listener = candidates[Math.floor(legacyHashUnit(`${rumor.id}:${year}:listener`) * candidates.length)];
      rumor.believers.push(listener.id);
      rumor.believers = [...new Set(rumor.believers)].slice(-240);
      rumor.spread = rumor.believers.length;
      rumor.distorted = clamp(rumor.distorted + legacyHashUnit(`${listener.id}:${rumor.id}`) * .025, 0, 1);
      const profile = this.profiles[listener.id];
      if (profile && !profile.rumorsKnown.includes(rumor.id)) profile.rumorsKnown.unshift(rumor.id);
      if (rumor.spread >= Math.max(6, Math.ceil(living.length * .4)) && rumor.status === 'circulando') {
        rumor.status = 'leyenda popular';
        simulation.civilization?.recordChronicle?.(year, 'rumor', `El rumor «${rumor.claim}» ya forma parte de la conversación colectiva.`, rumor.id);
      }
    }
  }

  maybeWriteBook(living, simulation, year) {
    const literacy = finiteOr(simulation.civilization?.literacy, 0);
    if (living.length < 3 || literacy < .08 || year - this.lastBookYear < 3.2) return;
    const candidates = living.filter(creature => {
      const profile = this.profiles[creature.id];
      return profile && creature.age >= creature.maturity && profile.creativity > .48 && profile.booksAuthored.length < 8 && creature.knowledge?.length >= 3;
    });
    if (!candidates.length || !chance(.2 + literacy * .32)) return;
    candidates.sort((a, b) => (this.profiles[b.id].creativity + finiteOr(b.genome?.memory, 0)) - (this.profiles[a.id].creativity + finiteOr(a.genome?.memory, 0)));
    const author = candidates[Math.floor(legacyHashUnit(`author:${year}`) * Math.min(candidates.length, 6))];
    const profile = this.profiles[author.id];
    const type = BOOK_TYPES[Math.floor(legacyHashUnit(`${author.id}:${year}:booktype`) * BOOK_TYPES.length)];
    const subject = this.bookSubject(author, simulation, type[0]);
    const title = `${type[1]} de ${subject.title}`;
    const book = {
      id: uid(), title: legacyClean(title, 100), type: type[0], authorId: author.id, authorName: profile.name,
      year: +year.toFixed(1), excerpt: legacyClean(subject.excerpt, 260),
      copies: 1, readers: [], status: 'conservado', influence: .12 + profile.creativity * .35 + finiteOr(author.genome?.memory, .5) * .22
    };
    this.books.unshift(book);
    this.books = this.books.slice(0, 140);
    profile.booksAuthored.unshift(book.id);
    profile.legacyScore = clamp(profile.legacyScore + 8 + book.influence * 8, 0, 100);
    author.experience.collaborations = Math.min(9999, finiteOr(author.experience?.collaborations, 0) + 1);
    author.learnKnowledge?.({ kind: 'fact', key: `book:${book.id}`, label: `Autoría: ${book.title}`, confidence: .9, createdAt: Date.now() }, 'escritura');
    simulation.civilization?.recordChronicle?.(year, 'libro', `${profile.name} escribe «${book.title}».`, book.id);
    simulation.logEvent?.(`Año ${year.toFixed(1)}`, `Nueva obra escrita: «${book.title}», de ${profile.name}.`);
    this.lastBookYear = year;
  }

  bookSubject(author, simulation, type) {
    const knowledge = author.knowledge?.at(-1)?.label || 'los primeros conocimientos';
    const faction = simulation.civilization?.society?.getFaction?.(this.profiles[author.id]?.factionId);
    const biome = BIOMES[simulation.biome]?.label ?? 'el mundo';
    const subjects = {
      crónica: { title: faction?.name || 'los Años del Origen', excerpt: `Un relato sobre cómo ${faction?.name || 'el linaje'} sobrevivió, cambió y dejó memoria para quienes aún no habían nacido.` },
      manual: { title: author.skill || 'Supervivencia', excerpt: `Reglas prácticas nacidas de la experiencia: ${knowledge}. Cada consejo incluye una prueba, un riesgo y una forma de corregir errores.` },
      tratado: { title: 'la Memoria Compartida', excerpt: `Una investigación sobre qué parte de una idea pertenece a quien la descubre y qué parte pertenece a la comunidad que la conserva.` },
      poemario: { title: biome, excerpt: `Cantos breves sobre ${biome}, el fuego, los nombres perdidos y las criaturas que regresan únicamente en sueños.` },
      atlas: { title: biome, excerpt: `Mapas, rutas, refugios, peligros y rumores del territorio conocido. Algunas anotaciones contradicen a otras.` },
      memorias: { title: author.entityCode || author.name, excerpt: `Recuerdos de infancia, amistades, miedos y decisiones que cambiaron una vida aparentemente pequeña.` },
      profecía: { title: 'la Próxima Era', excerpt: `Visiones ambiguas sobre una corona rota, una biblioteca en llamas y una idea capaz de unir a todos los oficios.` },
      ensayo: { title: 'la Libertad y el Linaje', excerpt: `Una reflexión sobre obedecer, cooperar y conservar el derecho de una criatura a elegir un camino inesperado.` }
    };
    return subjects[type] ?? subjects.ensayo;
  }

  maybeCreateCollectiveInsight(living, simulation, year) {
    if (year - this.lastInsightYear < 4.2) return;
    const metrics = simulation.getCollectiveMetrics?.() ?? {};
    if (finiteOr(metrics.roles, 0) < 3 || finiteOr(metrics.uniqueKnowledge, 0) < 12 || living.length < 5) return;
    if (!chance(.22 + finiteOr(metrics.synergy, 0) * .42)) return;
    const sorted = living.slice().sort((a, b) => finiteOr(b.knowledge?.length, 0) - finiteOr(a.knowledge?.length, 0));
    const members = [];
    const usedSkills = new Set();
    for (const creature of sorted) {
      const skill = creature.skill || 'observador';
      if (usedSkills.has(skill)) continue;
      usedSkills.add(skill);
      members.push(creature);
      if (members.length >= 5) break;
    }
    if (members.length < 3) return;
    const insightThemes = [
      'un sistema de reservas que reduce el riesgo de hambruna',
      'un método para contrastar rumores antes de convertirlos en leyes',
      'una arquitectura modular para construir sin agotar recursos',
      'un protocolo para enseñar conocimientos sin borrar las tradiciones locales',
      'una red de señales que conecta refugios, talleres y bibliotecas',
      'un acuerdo para que cada facción conserve identidad sin romper la cooperación común'
    ];
    const text = insightThemes[Math.floor(legacyHashUnit(`insight:${year}:${members.map(m => m.id).join(':')}`) * insightThemes.length)];
    const insight = {
      id: uid(), year: +year.toFixed(1), title: `Síntesis Ω-${String(this.collectiveInsights.length + 1).padStart(3, '0')}`,
      text, memberIds: members.map(member => member.id), memberNames: members.map(member => member.name),
      skills: members.map(member => member.skill || 'observador'), applied: false
    };
    this.collectiveInsights.unshift(insight);
    this.collectiveInsights = this.collectiveInsights.slice(0, 80);
    for (const member of members) {
      member.learnKnowledge?.({ kind: 'fact', key: `collective-insight:${insight.id}`, label: insight.text, confidence: .86, createdAt: Date.now() }, 'síntesis colectiva');
      const memberProfile = this.profiles[member.id] ?? (this.profiles[member.id] = this.createProfile(member, year));
      memberProfile.legacyScore = clamp(finiteOr(memberProfile.legacyScore, 0) + 2.5, 0, 100);
    }
    simulation.civilization.researchPoints += 3.5;
    simulation.civilization.innovationPoints += 3.5;
    simulation.civilization.recordChronicle?.(year, 'síntesis colectiva', `${members.map(member => member.name).join(', ')} combinan sus oficios y proponen ${text}.`, insight.id);
    this.lastInsightYear = year;
  }

  maybeEstablishLibrary(living, simulation, year) {
    if (this.books.length < 3 || year - this.lastLibraryYear < 5) return;
    const targetCount = Math.min(8, 1 + Math.floor(this.books.length / 10));
    if (this.libraries.length >= targetCount) return;
    const candidate = living.slice().sort((a, b) => finiteOr(b.genome?.memory, 0) - finiteOr(a.genome?.memory, 0))[0];
    if (!candidate) return;
    const library = {
      id: uid(), name: this.libraries.length ? `Archivo de ${candidate.name}` : 'Biblioteca del Primer Fuego',
      foundedYear: +year.toFixed(1), x: Math.round(candidate.home?.x ?? candidate.x), y: Math.round(candidate.home?.y ?? candidate.y),
      custodianId: candidate.id, custodianName: candidate.name,
      bookIds: this.books.slice(0, Math.min(this.books.length, 18)).map(book => book.id),
      condition: 1, lostBooks: 0
    };
    this.libraries.unshift(library);
    candidate.goal = 'custodiar la memoria escrita';
    const custodianProfile = this.profiles[candidate.id] ?? (this.profiles[candidate.id] = this.createProfile(candidate, year));
    custodianProfile.calling = 'Bibliotecario del linaje';
    custodianProfile.legacyScore = clamp(finiteOr(custodianProfile.legacyScore, 0) + 7, 0, 100);
    simulation.civilization.recordChronicle?.(year, 'biblioteca', `Se funda ${library.name}, bajo el cuidado de ${candidate.name}.`, library.id);
    this.lastLibraryYear = year;
  }

  maybeCreateMyth(simulation, year) {
    if (year - this.lastMythYear < 8 || (!this.legacies.length && !this.ruins.length && !this.rumors.length)) return;
    if (!chance(.25 + finiteOr(simulation.civilization?.culturePoints, 0) / 200)) return;
    const sourcePool = [
      ...this.legacies.slice(0, 12).map(item => ({ kind: 'legado', id: item.id, name: item.name })),
      ...this.ruins.slice(0, 12).map(item => ({ kind: 'ruina', id: item.id, name: item.name })),
      ...this.rumors.filter(item => item.status !== 'olvidado').slice(0, 12).map(item => ({ kind: 'rumor', id: item.id, name: item.claim }))
    ];
    if (!sourcePool.length) return;
    const source = sourcePool[Math.floor(legacyHashUnit(`myth:${year}`) * sourcePool.length)];
    const variants = [
      `${source.name} no desapareció: se convirtió en una señal que guía a quienes se pierden.`,
      `${source.name} custodia una puerta bajo el mundo y solo responde a una palabra olvidada.`,
      `Quien repita la historia de ${source.name} durante el ocaso conservará un recuerdo que no le pertenece.`,
      `${source.name} fue exagerado por generaciones hasta convertirse en fundador, monstruo o santo según la facción que lo narra.`
    ];
    const myth = {
      id: uid(), year: +year.toFixed(1), sourceKind: source.kind, sourceId: source.id,
      title: `Leyenda de ${legacyClean(source.name, 70)}`,
      text: variants[Math.floor(legacyHashUnit(`${source.id}:${year}:variant`) * variants.length)],
      believers: 1, versions: 1
    };
    this.myths.unshift(myth);
    this.myths = this.myths.slice(0, 70);
    simulation.civilization?.recordChronicle?.(year, 'mito', myth.text, myth.id);
    this.lastMythYear = year;
  }

  onBirth(creature, simulation) {
    if (!creature) return;
    const profile = this.createProfile(creature, simulation?.year ?? 0);
    if (creature.parents?.length) {
      const parentProfiles = creature.parents.map(id => this.profiles[id]).filter(Boolean);
      if (parentProfiles.length) {
        profile.hope = clamp(parentProfiles.reduce((sum, item) => sum + item.hope, 0) / parentProfiles.length + (legacyHashUnit(`${creature.id}:inherit-hope`) - .5) * .12, 0, 1);
        profile.spirituality = clamp(parentProfiles.reduce((sum, item) => sum + item.spirituality, 0) / parentProfiles.length + (legacyHashUnit(`${creature.id}:inherit-spirit`) - .5) * .16, 0, 1);
        const inheritedBooks = parentProfiles.flatMap(item => item.booksAuthored).slice(0, 2);
        for (const bookId of inheritedBooks) creature.learnKnowledge?.({ kind: 'fact', key: `inherit-book:${bookId}`, label: 'Conoce una obra escrita por su linaje.', confidence: .48, createdAt: Date.now() }, 'legado familiar');
      }
    }
    this.profiles[creature.id] = profile;
  }

  onDeath(creature, cause, simulation) {
    if (!creature) return;
    const year = Math.max(0, finiteOr(simulation?.year, 0));
    const profile = this.profiles[creature.id] ?? this.createProfile(creature, year);
    const societyProfile = simulation?.civilization?.society?.getProfile?.(creature.id);
    profile.status = 'dead';
    profile.diedYear = +year.toFixed(1);
    profile.cause = legacyClean(cause || 'causa desconocida', 48);
    profile.title = legacyClean(societyProfile?.title || profile.title || '', 48);
    const notable = creature.isFounder || Boolean(profile.title) || profile.booksAuthored.length > 0 || profile.legacyScore > 12 || finiteOr(societyProfile?.influence, 0) > .66;
    const legacy = {
      id: uid(), creatureId: creature.id, name: profile.name, entityCode: profile.entityCode,
      year: +year.toFixed(1), cause: profile.cause, lifeGoal: profile.lifeGoal, calling: profile.calling,
      title: profile.title, books: profile.booksAuthored.slice(),
      summary: this.buildLegacySummary(creature, profile, societyProfile),
      renown: clamp(profile.legacyScore / 100 + finiteOr(societyProfile?.influence, 0) * .45 + (creature.isFounder ? .5 : 0), 0, 1)
    };
    this.legacies.unshift(legacy);
    this.legacies = this.legacies.slice(0, 180);

    const related = (simulation?.creatures ?? []).filter(other => other && other.id !== creature.id && !other.dead && (
      other.parents?.includes(creature.id) || creature.parents?.includes(other.id) || finiteOr(other.relationships?.[creature.id], 0) > .42
    ));
    for (const other of related.slice(0, 16)) {
      const otherProfile = this.profiles[other.id] ?? this.createProfile(other, year);
      const trauma = { id: uid(), year: +year.toFixed(1), type: 'pérdida', text: `Perdió a ${profile.name} por ${profile.cause}.`, sourceId: creature.id, intensity: .35 + finiteOr(other.relationships?.[creature.id], .3) * .5 };
      otherProfile.traumas.unshift(trauma);
      otherProfile.traumas = otherProfile.traumas.slice(0, 10);
      otherProfile.fear = clamp(otherProfile.fear + trauma.intensity * .16, 0, 1);
      otherProfile.hope = clamp(otherProfile.hope - trauma.intensity * .12, 0, 1);
      other.goal = otherProfile.resilience > .62 ? `honrar el legado de ${profile.name}` : `superar la pérdida de ${profile.name}`;
    }

    if (notable || chance(.08)) this.createRelicAndRuin(creature, profile, legacy, simulation);
    if (notable) simulation?.civilization?.recordChronicle?.(year, 'legado', legacy.summary, legacy.id);
  }

  buildLegacySummary(creature, profile, societyProfile) {
    const roles = [profile.title, profile.calling, creature.skill].filter(Boolean).join(', ');
    const achievements = [];
    if (profile.booksAuthored.length) achievements.push(`${profile.booksAuthored.length} obra${profile.booksAuthored.length === 1 ? '' : 's'} escrita${profile.booksAuthored.length === 1 ? '' : 's'}`);
    if (finiteOr(creature.experience?.discoveries, 0)) achievements.push(`${creature.experience.discoveries} descubrimientos`);
    if (finiteOr(societyProfile?.victories, 0)) achievements.push(`${societyProfile.victories} victorias`);
    return `${profile.name}${roles ? `, ${roles}` : ''}, muere por ${profile.cause}. Quería ${profile.lifeGoal}${achievements.length ? ` y deja ${achievements.join(', ')}` : ''}.`;
  }

  createRelicAndRuin(creature, profile, legacy, simulation) {
    const relicKinds = profile.booksAuthored.length ? ['códice', 'pluma de archivo', 'tablilla'] : profile.title ? ['corona rota', 'sello político', 'estandarte'] : ['amuleto', 'herramienta', 'máscara', 'mapa incompleto'];
    const kind = relicKinds[Math.floor(legacyHashUnit(`${creature.id}:relic`) * relicKinds.length)];
    const relic = {
      id: uid(), name: `${legacyCapitalize(kind)} de ${profile.name}`, kind,
      ownerId: creature.id, ownerName: profile.name, year: +finiteOr(simulation?.year, 0).toFixed(1),
      description: `Objeto asociado a ${profile.name}. Conserva una parte simbólica de su historia y aumenta el valor de su legado.`,
      location: 'ruina', discovered: false
    };
    this.relics.unshift(relic);
    this.relics = this.relics.slice(0, 140);
    profile.relicIds.unshift(relic.id);

    const ruin = {
      id: uid(), name: creature.isFounder ? 'Santuario de Ω-001' : `Vestigio de ${profile.name}`,
      x: Math.round(clamp(finiteOr(creature.x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH)),
      y: Math.round(clamp(finiteOr(creature.y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT)),
      foundedYear: +finiteOr(simulation?.year, 0).toFixed(1), age: 0, condition: 1,
      originId: creature.id, originName: profile.name, relicIds: [relic.id],
      description: legacy.title ? `Restos vinculados a ${legacy.title}.` : `Un lugar donde el linaje decidió no olvidar a ${profile.name}.`
    };
    this.ruins.unshift(ruin);
    this.ruins = this.ruins.slice(0, 60);
  }

  ageRuins(year) {
    for (const ruin of this.ruins) {
      ruin.age = Math.max(0, year - finiteOr(ruin.foundedYear, year));
      ruin.condition = clamp(1 - ruin.age / 180, .08, 1);
    }
    for (const library of this.libraries) {
      library.condition = clamp(finiteOr(library.condition, 1) - .00015, .15, 1);
    }
  }

  getProfile(id) { return typeof id === 'string' ? this.profiles[id] ?? null : null; }

  getMetrics() {
    return {
      dreams: this.dreams.length,
      activeRumors: this.rumors.filter(item => item.status !== 'olvidado').length,
      books: this.books.length,
      ruins: this.ruins.length,
      relics: this.relics.length,
      myths: this.myths.length,
      libraries: this.libraries.length,
      insights: this.collectiveInsights.length,
      legacies: this.legacies.length,
      environment: { ...this.environment }
    };
  }

  serialize() {
    return {
      profiles: this.profiles, dreams: this.dreams, rumors: this.rumors, books: this.books,
      ruins: this.ruins, relics: this.relics, myths: this.myths, libraries: this.libraries,
      collectiveInsights: this.collectiveInsights, legacies: this.legacies, environment: this.environment,
      lastDreamYear: this.lastDreamYear, lastRumorYear: this.lastRumorYear, lastBookYear: this.lastBookYear,
      lastMythYear: this.lastMythYear, lastInsightYear: this.lastInsightYear, lastLibraryYear: this.lastLibraryYear
    };
  }

  hydrate(data) {
    const source = data && typeof data === 'object' ? data : {};
    this.profiles = legacySanitizeProfiles(source.profiles);
    this.dreams = legacySanitizeArray(source.dreams, 120, 320);
    this.rumors = legacySanitizeArray(source.rumors, 100, 360);
    this.books = legacySanitizeArray(source.books, 140, 420);
    this.ruins = legacySanitizeArray(source.ruins, 60, 320).map(item => ({ ...item, x: clamp(finiteOr(item.x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH), y: clamp(finiteOr(item.y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT), condition: clamp(finiteOr(item.condition, 1), 0, 1) }));
    this.relics = legacySanitizeArray(source.relics, 140, 360);
    this.myths = legacySanitizeArray(source.myths, 70, 360);
    this.libraries = legacySanitizeArray(source.libraries, 12, 360).map(item => ({ ...item, x: clamp(finiteOr(item.x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH), y: clamp(finiteOr(item.y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT), condition: clamp(finiteOr(item.condition, 1), 0, 1) }));
    this.collectiveInsights = legacySanitizeArray(source.collectiveInsights, 80, 420);
    this.legacies = legacySanitizeArray(source.legacies, 180, 420);
    this.environment = {
      dayFraction: clamp(finiteOr(source.environment?.dayFraction, .28), 0, 1),
      phase: legacyClean(source.environment?.phase || 'amanecer', 20),
      season: legacyClean(source.environment?.season || 'Brote', 20),
      weather: Object.prototype.hasOwnProperty.call(WEATHER, source.environment?.weather) ? source.environment.weather : 'clear',
      weatherLabel: legacyClean(source.environment?.weatherLabel || WEATHER.clear.label, 40),
      weatherIntensity: clamp(finiteOr(source.environment?.weatherIntensity, 0), 0, 1),
      weatherUntilYear: Math.max(0, finiteOr(source.environment?.weatherUntilYear, 2.5))
    };
    this.lastDreamYear = Math.max(0, finiteOr(source.lastDreamYear, 0));
    this.lastRumorYear = Math.max(0, finiteOr(source.lastRumorYear, 0));
    this.lastBookYear = Math.max(0, finiteOr(source.lastBookYear, 0));
    this.lastMythYear = Math.max(0, finiteOr(source.lastMythYear, 0));
    this.lastInsightYear = Math.max(0, finiteOr(source.lastInsightYear, 0));
    this.lastLibraryYear = Math.max(0, finiteOr(source.lastLibraryYear, 0));
  }
}

function legacySanitizeProfiles(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const entries = Object.entries(value).filter(([id, item]) => typeof id === 'string' && item && typeof item === 'object').slice(0, 1800);
  return Object.fromEntries(entries.map(([id, item]) => [id, {
    ...item,
    id,
    name: legacyClean(item.name || id, 28), entityCode: legacyClean(item.entityCode || '', 18),
    status: item.status === 'dead' ? 'dead' : 'alive',
    hope: clamp(finiteOr(item.hope, .5), 0, 1), fear: clamp(finiteOr(item.fear, .2), 0, 1),
    creativity: clamp(finiteOr(item.creativity, .5), 0, 1), resilience: clamp(finiteOr(item.resilience, .5), 0, 1), spirituality: clamp(finiteOr(item.spirituality, .5), 0, 1),
    lifeGoal: legacyClean(item.lifeGoal || 'encontrar un propósito', 90), calling: legacyClean(item.calling || 'Observador', 60),
    dreams: Array.isArray(item.dreams) ? item.dreams.filter(v => typeof v === 'string').slice(0, 16) : [],
    traumas: legacySanitizeArray(item.traumas, 10, 220), rumorsKnown: Array.isArray(item.rumorsKnown) ? item.rumorsKnown.filter(v => typeof v === 'string').slice(0, 20) : [],
    booksAuthored: Array.isArray(item.booksAuthored) ? item.booksAuthored.filter(v => typeof v === 'string').slice(0, 8) : [],
    relicIds: Array.isArray(item.relicIds) ? item.relicIds.filter(v => typeof v === 'string').slice(0, 8) : [],
    legacyScore: clamp(finiteOr(item.legacyScore, 0), 0, 100), lastDreamYear: Math.max(0, finiteOr(item.lastDreamYear, 0))
  }]));
}

function legacySanitizeArray(value, limit, textLimit) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(0, limit).map(item => {
    const clean = {};
    for (const [key, raw] of Object.entries(item)) {
      if (typeof raw === 'string') clean[key] = legacyClean(raw, textLimit);
      else if (typeof raw === 'number') clean[key] = Number.isFinite(raw) ? raw : 0;
      else if (typeof raw === 'boolean' || raw == null) clean[key] = raw;
      else if (Array.isArray(raw)) clean[key] = raw.slice(0, 240).map(value => typeof value === 'string' ? legacyClean(value, 80) : value).filter(value => ['string', 'number', 'boolean'].includes(typeof value));
      else if (raw && typeof raw === 'object') clean[key] = { ...raw };
    }
    if (!clean.id) clean.id = uid();
    return clean;
  });
}

function legacyImportance(profile) {
  return finiteOr(profile.legacyScore, 0) + (profile.status === 'alive' ? 20 : 0) + finiteOr(profile.booksAuthored?.length, 0) * 4 + finiteOr(profile.relicIds?.length, 0) * 3;
}

function legacyClean(value, max = 160) {
  return String(value ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function legacyHashUnit(value) {
  const text = String(value ?? '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function legacyCapitalize(value) {
  const text = legacyClean(value, 80);
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}


/* ===== grand-projects.js ===== */
const GRAND_PROJECT_TYPES = Object.freeze({
  software: Object.freeze({ label: 'Software o aplicación', icon: '⌘', defaultTitle: 'Sistema Ω', summary: 'Diseñar una aplicación funcional, verificable y documentada.' }),
  game: Object.freeze({ label: 'Videojuego', icon: '◆', defaultTitle: 'Juego Ω', summary: 'Crear concepto, reglas, prototipo, arte, pruebas y entrega.' }),
  city: Object.freeze({ label: 'Ciudad autosuficiente', icon: '⌂', defaultTitle: 'Ciudad Ω', summary: 'Planificar hábitat, recursos, seguridad, gobierno y mantenimiento.' }),
  research: Object.freeze({ label: 'Investigación', icon: '◫', defaultTitle: 'Investigación Ω', summary: 'Plantear hipótesis, reunir evidencias, contrastar y documentar límites.' }),
  invention: Object.freeze({ label: 'Invención', icon: '⚙', defaultTitle: 'Invención Ω', summary: 'Convertir una necesidad en prototipo, pruebas y plan de mejora.' }),
  book: Object.freeze({ label: 'Libro o historia', icon: '▤', defaultTitle: 'Códice Ω', summary: 'Construir propósito, estructura, borrador, revisión y edición.' }),
  observatory: Object.freeze({ label: 'Observatorio científico', icon: '✦', defaultTitle: 'Observatorio Ω', summary: 'Coordinar óptica, arquitectura, datos, operación y divulgación.' }),
  world_cure: Object.freeze({ label: 'Cura del mundo simulado', icon: '✚', defaultTitle: 'Proyecto Sanación Ω', summary: 'Resolver una enfermedad ficticia del ecosistema mediante investigación segura.' }),
  custom: Object.freeze({ label: 'Desafío libre', icon: 'Ω', defaultTitle: 'Gran Proyecto Ω', summary: 'Transformar un objetivo abierto en fases, tareas, pruebas y entrega.' })
});

const PHASES = Object.freeze([
  ['definition', 'Definición'], ['planning', 'Planificación'], ['research', 'Investigación'],
  ['design', 'Diseño'], ['production', 'Producción'], ['verification', 'Verificación'], ['delivery', 'Entrega']
]);

const ADJACENT = Object.freeze({
  programador: ['desarrollador','matematico','inventor'], desarrollador: ['programador','arquitecto','analista'],
  arquitecto: ['ingeniero','tejedor','analista'], tejedor: ['arquitecto','cantor','inventor'],
  analista: ['matematico','naturalista','mediador'], matematico: ['analista','programador','ingeniero'],
  naturalista: ['alquimista','genetista','analista'], alquimista: ['naturalista','cocinero','genetista'],
  genetista: ['naturalista','alquimista','cuidador'], ingeniero: ['arquitecto','inventor','matematico'],
  inventor: ['ingeniero','programador','tejedor'], cronista: ['educador','filosofo','cantor'],
  educador: ['cronista','mediador','cuidador'], mediador: ['educador','filosofo','cuidador'],
  cuidador: ['mediador','naturalista','educador'], filosofo: ['cronista','mediador','analista'],
  cartografo: ['arquitecto','analista','naturalista'], cantor: ['cronista','tejedor','mediador'],
  cocinero: ['alquimista','cuidador','ingeniero']
});

const TEMPLATES = Object.freeze({
  software: [
    task('need','definition','Definir usuario, problema y criterio de éxito',['analista','mediador'],18),
    task('architecture','planning','Diseñar arquitectura, datos y límites',['arquitecto','programador','analista'],28,['need']),
    task('ux','design','Construir experiencia, navegación y accesibilidad',['tejedor','arquitecto','educador'],26,['need']),
    task('implementation','production','Implementar el núcleo funcional',['programador','desarrollador'],44,['architecture','ux']),
    task('security','verification','Revisar entradas, privacidad y fallos seguros',['analista','desarrollador','cuidador'],25,['implementation']),
    task('tests','verification','Ejecutar pruebas y corregir regresiones',['desarrollador','matematico','analista'],30,['implementation']),
    task('release','delivery','Preparar entrega, manual y plan de mantenimiento',['educador','cronista','desarrollador'],22,['security','tests'])
  ],
  game: [
    task('vision','definition','Definir fantasía, jugador y bucle principal',['inventor','filosofo','analista'],18),
    task('systems','planning','Diseñar reglas, progresión y equilibrio',['matematico','inventor','programador'],30,['vision']),
    task('world','design','Crear mundo, arte, sonido y narrativa',['tejedor','cantor','cronista','cartografo'],32,['vision']),
    task('prototype','production','Construir un prototipo jugable',['programador','desarrollador','tejedor'],42,['systems','world']),
    task('playtest','verification','Observar partidas, medir fricción y ajustar',['analista','mediador','matematico'],30,['prototype']),
    task('package','delivery','Entregar diseño, prototipo y guía de expansión',['desarrollador','educador','cronista'],22,['playtest'])
  ],
  city: [
    task('requirements','definition','Estimar población, clima y necesidades',['analista','naturalista','cuidador'],22),
    task('map','research','Cartografiar recursos, riesgos y rutas',['cartografo','naturalista','analista'],30,['requirements']),
    task('masterplan','design','Diseñar barrios, servicios y expansión',['arquitecto','ingeniero','mediador'],38,['map']),
    task('supply','planning','Planificar alimento, agua, energía y residuos',['ingeniero','cocinero','naturalista'],34,['map']),
    task('governance','planning','Definir leyes, participación y resolución de conflictos',['mediador','filosofo','cronista'],25,['requirements']),
    task('prototype','production','Construir el primer distrito reversible',['ingeniero','arquitecto','cuidador'],42,['masterplan','supply']),
    task('resilience','verification','Simular escasez, incendio y evacuación',['analista','ingeniero','cuidador'],30,['prototype','governance']),
    task('charter','delivery','Entregar plano, carta común y mantenimiento',['cartografo','cronista','educador'],24,['resilience'])
  ],
  research: [
    task('question','definition','Formular pregunta, hipótesis y límites',['naturalista','filosofo','analista'],18),
    task('method','planning','Diseñar método, muestra y controles',['matematico','analista','naturalista'],28,['question']),
    task('evidence','research','Reunir observaciones y registrar procedencia',['naturalista','cartografo','cronista'],40,['method']),
    task('analysis','production','Analizar datos y buscar explicaciones alternativas',['analista','matematico','filosofo'],35,['evidence']),
    task('replication','verification','Repetir, intentar refutar y declarar incertidumbre',['matematico','analista','educador'],30,['analysis']),
    task('paper','delivery','Publicar informe reproducible y preguntas abiertas',['cronista','educador','naturalista'],24,['replication'])
  ],
  invention: [
    task('problem','definition','Precisar necesidad, restricciones y seguridad',['analista','cuidador','inventor'],18),
    task('variants','research','Generar y comparar varias soluciones',['inventor','ingeniero','filosofo'],28,['problem']),
    task('blueprint','design','Elegir concepto y crear plano mantenible',['ingeniero','arquitecto','tejedor'],32,['variants']),
    task('prototype','production','Construir prototipo reversible',['ingeniero','inventor','desarrollador'],42,['blueprint']),
    task('stress','verification','Probar límites, fallos y reparación',['analista','matematico','cuidador'],32,['prototype']),
    task('manual','delivery','Entregar especificación, uso y mejoras futuras',['educador','cronista','ingeniero'],22,['stress'])
  ],
  book: [
    task('purpose','definition','Definir lector, promesa, tono y tema',['cronista','filosofo','mediador'],18),
    task('research','research','Reunir material, memoria y contradicciones',['cronista','naturalista','analista'],26,['purpose']),
    task('structure','planning','Diseñar estructura, ritmo y puntos de giro',['cronista','matematico','inventor'],28,['research']),
    task('draft','production','Escribir el borrador completo',['cronista','cantor','filosofo'],44,['structure']),
    task('edit','verification','Eliminar repeticiones, incoherencias y artificio',['educador','analista','cronista'],32,['draft']),
    task('edition','delivery','Preparar edición, sinopsis y archivo final',['tejedor','educador','cronista'],24,['edit'])
  ],
  observatory: [
    task('mission','definition','Definir qué observar y con qué precisión',['naturalista','matematico','analista'],20),
    task('site','research','Elegir emplazamiento, cielo y accesos',['cartografo','naturalista','arquitecto'],28,['mission']),
    task('optics','design','Diseñar óptica, montura y calibración',['ingeniero','matematico','inventor'],36,['site']),
    task('building','production','Construir cúpula, energía y control',['arquitecto','ingeniero','programador'],44,['optics']),
    task('pipeline','production','Crear captura, archivo y análisis de datos',['programador','analista','cronista'],34,['optics']),
    task('calibration','verification','Calibrar, verificar y documentar incertidumbre',['matematico','analista','naturalista'],30,['building','pipeline']),
    task('opening','delivery','Abrir observatorio y programa educativo',['educador','cronista','mediador'],22,['calibration'])
  ],
  world_cure: [
    task('syndrome','definition','Describir el síndrome ficticio y separar síntomas de causas',['cuidador','naturalista','analista'],20),
    task('ethics','planning','Fijar límites, consentimiento y criterios de detención',['filosofo','cuidador','mediador'],22,['syndrome']),
    task('model','research','Construir modelo biológico del mundo simulado',['genetista','naturalista','alquimista'],34,['syndrome']),
    task('candidates','design','Proponer intervenciones simuladas y controles',['alquimista','genetista','analista'],34,['model','ethics']),
    task('trials','production','Ejecutar ensayos ficticios graduales',['naturalista','matematico','cuidador'],42,['candidates']),
    task('safety','verification','Buscar daños, recaídas y explicaciones alternativas',['analista','cuidador','filosofo'],32,['trials']),
    task('protocol','delivery','Entregar protocolo únicamente para el mundo simulado',['educador','cronista','cuidador'],22,['safety'])
  ],
  custom: [
    task('goal','definition','Convertir el deseo en un objetivo comprobable',['analista','mediador','filosofo'],20),
    task('map','planning','Dividir el objetivo en sistemas, dependencias y riesgos',['arquitecto','analista','cartografo'],30,['goal']),
    task('knowledge','research','Reunir conocimiento y detectar vacíos',['educador','naturalista','cronista'],30,['map']),
    task('options','design','Generar variantes y elegir una dirección',['inventor','tejedor','ingeniero'],28,['knowledge']),
    task('build','production','Construir un resultado mínimo útil',['desarrollador','ingeniero','programador'],44,['options']),
    task('verify','verification','Probar, criticar y corregir el resultado',['analista','matematico','mediador'],32,['build']),
    task('deliver','delivery','Entregar dossier, artefactos y siguientes pasos',['educador','cronista','desarrollador'],24,['verify'])
  ]
});

class GrandProjectEngine {
  constructor() { this.reset(); }

  reset() {
    const onChange = this.onChange || null;
    this.projects = [];
    this.nextNumber = 1;
    this.timer = 0;
    this.onChange = onChange;
  }

  createProject(type, title, brief, constraints, sim) {
    const safeType = Object.prototype.hasOwnProperty.call(GRAND_PROJECT_TYPES, type) ? type : 'custom';
    const meta = GRAND_PROJECT_TYPES[safeType];
    const safeBrief = clean(brief, 900);
    if (!safeBrief) throw new Error('Describe el objetivo del Gran Proyecto');
    if (this.projects.filter(item => !['completed','cancelled'].includes(item.status)).length >= 8) throw new Error('Hay demasiados proyectos abiertos');
    const number = this.nextNumber++;
    const project = {
      id: uid(), number, type: safeType,
      title: clean(title, 90) || `${meta.defaultTitle} ${number}`,
      brief: safeBrief, constraints: clean(constraints, 600),
      status: 'active', createdYear: roundYear(sim?.year), updatedYear: roundYear(sim?.year), completedYear: null,
      progress: 0, quality: .28, confidence: .32, iteration: 1,
      tasks: cloneTasks(TEMPLATES[safeType] || TEMPLATES.custom),
      decisions: [], lessons: [], blockers: [], externalInsights: [], artifacts: [], teamIds: [],
      lastEvent: 'Objetivo recibido. La Mente Ω está descomponiendo el trabajo.',
      delivered: false
    };
    project.decisions.push(record(sim, 'mandato', `El Observador encarga: ${project.brief}`));
    this.projects.unshift(project);
    this.projects = this.projects.slice(0, 16);
    sim?.logEvent?.(`Año ${roundYear(sim?.year).toFixed(1)}`, `Gran Proyecto iniciado: «${project.title}». La civilización deberá planificar, investigar, construir y verificar.`);
    sim?.civilization?.recordChronicle?.(sim.year, 'gran proyecto', `Comienza «${project.title}»: ${project.brief}`, project.id);
    this.onChange?.(project);
    return project;
  }

  update(dt, sim) {
    this.timer += Math.max(0, finiteOr(dt, 0));
    if (this.timer < .55) return;
    const elapsed = Math.min(2.5, this.timer);
    this.timer = 0;
    const active = this.projects.filter(project => ['active','waiting'].includes(project.status)).slice(0, 3);
    for (const project of active) this.advance(project, elapsed, sim);
  }

  advance(project, elapsed, sim) {
    const adults = (sim?.creatures || []).filter(creature => creature && !creature.dead && creature.lifeStage === 'adulto' && creature.energy > 24);
    if (!adults.length) {
      project.status = 'waiting';
      project.lastEvent = 'Esperando al menos una criatura adulta con energía suficiente.';
      replaceBlocker(project, 'population', 'No hay especialistas adultos disponibles.');
      return;
    }
    project.status = 'active';
    clearBlocker(project, 'population');

    const ready = project.tasks.filter(item => !['completed','cancelled'].includes(item.status) && dependenciesDone(item, project.tasks));
    const running = ready.filter(item => item.status === 'working');
    const capacity = Math.max(1, Math.min(3, Math.floor(Math.sqrt(adults.length))));
    for (const item of ready.filter(taskItem => taskItem.status === 'pending').slice(0, Math.max(0, capacity - running.length))) {
      this.assignTask(project, item, adults, sim);
    }
    for (const item of ready.filter(taskItem => taskItem.status === 'working').slice(0, capacity)) {
      this.workTask(project, item, elapsed, sim);
    }
    this.recalculate(project);
    if (project.tasks.every(item => item.status === 'completed')) this.complete(project, sim);
  }

  assignTask(project, taskItem, adults, sim) {
    const ranked = adults.map(creature => ({ creature, score: candidateScore(creature, taskItem.skills) }))
      .sort((a, b) => b.score - a.score);
    const desired = Math.min(6, Math.max(2, taskItem.skills.length + 1), ranked.length);
    const chosen = ranked.slice(0, desired).map(entry => entry.creature);
    if (!chosen.length) return;
    taskItem.assignedIds = chosen.map(item => item.id);
    taskItem.status = 'working';
    taskItem.startedYear ??= roundYear(sim?.year);
    const present = new Set(chosen.map(item => deriveSkill(item)));
    const gaps = taskItem.skills.filter(skill => !present.has(skill) && ![...(ADJACENT[skill] || [])].some(adj => present.has(adj)));
    taskItem.gaps = gaps;
    if (gaps.length) replaceBlocker(project, `skills:${taskItem.id}`, `Faltan especialistas directos en ${gaps.map(key => SKILLS[key]?.label || key).join(', ')}; el equipo aprenderá por aproximación.`);
    else clearBlocker(project, `skills:${taskItem.id}`);
    for (const creature of chosen) {
      creature.state = 'crear';
      creature.goal = `contribuir a ${project.title}: ${taskItem.title.toLowerCase()}`;
    }
    project.teamIds = [...new Set([...project.teamIds, ...taskItem.assignedIds])].slice(-40);
    project.lastEvent = `Equipo asignado a «${taskItem.title}».`;
  }

  workTask(project, taskItem, elapsed, sim) {
    const crew = taskItem.assignedIds.map(id => sim.creatures.find(item => item?.id === id)).filter(item => item && !item.dead);
    if (!crew.length) { taskItem.status = 'pending'; taskItem.assignedIds = []; return; }
    const exact = new Set(crew.map(item => deriveSkill(item)));
    const coverage = taskItem.skills.length ? taskItem.skills.filter(skill => exact.has(skill) || (ADJACENT[skill] || []).some(adj => exact.has(adj))).length / taskItem.skills.length : 1;
    const expertise = crew.reduce((sum, creature) => sum + candidateScore(creature, taskItem.skills), 0) / crew.length;
    const knowledge = crew.reduce((sum, creature) => sum + Math.min(1, (creature.knowledge?.length || 0) / 12), 0) / crew.length;
    const cooperation = crew.reduce((sum, creature) => sum + finiteOr(creature.genome?.sociability, .5), 0) / crew.length;
    const external = Math.min(.3, project.externalInsights.length * .06);
    const power = (.55 + expertise * .38 + knowledge * .22 + cooperation * .16 + coverage * .3 + external) * Math.min(1.7, .7 + Math.log2(crew.length + 1) * .3);
    taskItem.progress = clamp(taskItem.progress + elapsed * power / Math.max(8, taskItem.effort), 0, 1);
    taskItem.quality = clamp((taskItem.quality || .3) + elapsed * (.0015 + coverage * .002 + knowledge * .001), 0, 1);
    for (const creature of crew) {
      creature.energy = Math.max(18, creature.energy - elapsed * .16);
      if (creature.experience) creature.experience.collaborations = Math.min(9999, Math.floor(finiteOr(creature.experience.collaborations, 0)) + (Math.random() < .02 ? 1 : 0));
    }
    if (taskItem.progress < 1) return;
    const failureChance = clamp(.3 - coverage * .14 - taskItem.quality * .12 - project.externalInsights.length * .025 + taskItem.attempts * -.05, .035, .3);
    if (Math.random() < failureChance && taskItem.attempts < 2) {
      taskItem.attempts++;
      taskItem.progress = .22;
      taskItem.status = 'working';
      const lesson = `${taskItem.title}: el intento ${taskItem.attempts} reveló una suposición débil; el equipo añade control, evidencia y una alternativa.`;
      project.lessons.unshift(record(sim, 'aprendizaje', lesson));
      project.lessons = project.lessons.slice(0, 30);
      project.iteration++;
      project.quality = clamp(project.quality + .025, 0, 1);
      project.lastEvent = `Fallo útil en «${taskItem.title}». Se inicia una iteración corregida.`;
      sim?.logEvent?.(`Año ${roundYear(sim?.year).toFixed(1)}`, `«${project.title}» aprende de un fallo durante ${taskItem.title.toLowerCase()}.`);
      return;
    }
    taskItem.status = 'completed';
    taskItem.completedYear = roundYear(sim?.year);
    taskItem.output = buildTaskOutput(project, taskItem, crew, coverage);
    project.decisions.unshift(record(sim, 'hito', `${taskItem.title} completado por ${crew.map(item => item.entityCode || item.name).slice(0, 6).join(', ')}.`));
    project.decisions = project.decisions.slice(0, 50);
    project.artifacts.push({ id: uid(), taskId: taskItem.id, title: taskItem.title, kind: artifactKind(taskItem.phase), content: taskItem.output, year: roundYear(sim?.year) });
    project.artifacts = project.artifacts.slice(-40);
    project.quality = clamp(project.quality * .82 + taskItem.quality * .18 + coverage * .025, 0, 1);
    project.confidence = clamp(project.confidence + .055 + coverage * .025, 0, .96);
    project.lastEvent = `Hito completado: ${taskItem.title}.`;
    for (const creature of crew) creature.learnKnowledge?.({ kind: 'fact', key: `project:${project.id}:${taskItem.id}`, label: `${project.title}: ${taskItem.title}. ${taskItem.output}`, confidence: clamp(.55 + taskItem.quality * .35, 0, 1), createdAt: Date.now() }, 'Gran Proyecto Ω');
    this.onChange?.(project);
  }

  complete(project, sim) {
    if (project.status === 'completed') return;
    project.status = 'completed';
    project.progress = 1;
    project.completedYear = roundYear(sim?.year);
    project.updatedYear = project.completedYear;
    project.confidence = clamp(project.confidence + .08, 0, .98);
    project.lastEvent = 'Proyecto terminado, verificado y preparado para su entrega.';
    project.decisions.unshift(record(sim, 'entrega', `La civilización declara terminado «${project.title}» con ${Math.round(project.quality * 100)}% de calidad simulada.`));
    sim.collective.completedProjects = Math.min(99999, finiteOr(sim.collective?.completedProjects, 0) + 1);
    sim?.logEvent?.(`Año ${project.completedYear.toFixed(1)}`, `Gran Proyecto completado: «${project.title}».`);
    sim?.civilization?.recordChronicle?.(sim.year, 'obra colectiva', `La civilización completa «${project.title}» tras ${project.iteration} iteraciones.`, project.id);
    this.onChange?.(project);
  }

  recalculate(project) {
    const total = project.tasks.reduce((sum, item) => sum + item.effort, 0) || 1;
    const done = project.tasks.reduce((sum, item) => sum + item.effort * (item.status === 'completed' ? 1 : finiteOr(item.progress, 0)), 0);
    project.progress = clamp(done / total, 0, 1);
    project.updatedYear = project.updatedYear ?? project.createdYear;
  }

  pause(id) { const project = this.find(id); if (project && project.status === 'active') project.status = 'paused'; return project; }
  resume(id) { const project = this.find(id); if (project && ['paused','waiting'].includes(project.status)) project.status = 'active'; return project; }
  cancel(id, sim) { const project = this.find(id); if (!project || project.status === 'completed') return null; project.status = 'cancelled'; project.lastEvent = 'Proyecto archivado por el Observador.'; sim?.logEvent?.(`Año ${roundYear(sim?.year).toFixed(1)}`, `Gran Proyecto cancelado: «${project.title}».`); return project; }
  find(id) { return this.projects.find(item => item.id === id) || null; }

  integrateInsight(id, text, sim) {
    const project = this.find(id);
    const cleanText = clean(text, 2400);
    if (!project) return { accepted: false, reason: 'Selecciona un proyecto válido.' };
    if (cleanText.length < 20) return { accepted: false, reason: 'La aportación es demasiado breve.' };
    const fragments = cleanText.split(/\n+|(?<=[.!?])\s+/).map(item => clean(item, 320)).filter(item => item.length >= 12).slice(0, 10);
    for (const fragment of fragments) project.externalInsights.unshift({ id: uid(), text: fragment, year: roundYear(sim?.year), reviewed: true });
    project.externalInsights = project.externalInsights.slice(0, 20);
    project.quality = clamp(project.quality + Math.min(.12, fragments.length * .012), 0, 1);
    project.confidence = clamp(project.confidence + Math.min(.1, fragments.length * .01), 0, .98);
    project.decisions.unshift(record(sim, 'fuente externa revisada', `${fragments.length} aportaciones humanas/externas se integran con trazabilidad.`));
    project.lastEvent = `${fragments.length} ideas externas revisadas se han añadido al trabajo.`;
    sim?.logEvent?.(`Año ${roundYear(sim?.year).toFixed(1)}`, `«${project.title}» incorpora ${fragments.length} ideas externas revisadas por el Observador.`);
    return { accepted: true, fragments: fragments.length };
  }

  buildContext(id, sim) {
    const project = this.find(id);
    if (!project) throw new Error('Proyecto no encontrado');
    const metrics = sim.getCollectiveMetrics?.() || {};
    return [
      'PROYECTO GÉNESIS Ω · PAQUETE PARA IA EXTERNA',
      'La respuesta será revisada por una persona antes de integrarse. No incluyas acciones peligrosas, credenciales ni instrucciones irreversibles.',
      '', `PROYECTO: ${project.title}`, `TIPO: ${GRAND_PROJECT_TYPES[project.type]?.label || project.type}`,
      `OBJETIVO: ${project.brief}`, `RESTRICCIONES: ${project.constraints || 'No especificadas'}`,
      `PROGRESO: ${Math.round(project.progress * 100)}%`, `CALIDAD SIMULADA: ${Math.round(project.quality * 100)}%`,
      `POBLACIÓN: ${metrics.population || 0} · OFICIOS: ${metrics.roles || 0} · CONOCIMIENTO: ${metrics.uniqueKnowledge || 0}`,
      '', 'TAREAS:', ...project.tasks.map(item => `- [${item.status}] ${item.title} · ${Math.round(item.progress * 100)}% · necesita ${item.skills.map(key => SKILLS[key]?.label || key).join(', ')}`),
      '', 'BLOQUEOS:', ...(project.blockers.length ? project.blockers.map(item => `- ${item.text}`) : ['- Ninguno']),
      '', 'APRENDIZAJES:', ...(project.lessons.length ? project.lessons.slice(0, 8).map(item => `- ${item.text}`) : ['- Aún no hay iteraciones fallidas.']),
      '', 'SOLICITUD:', 'Propón conocimiento, riesgos, alternativas y pruebas concretas que ayuden a completar el proyecto. Distingue hechos, hipótesis e incertidumbre. No finjas haber ejecutado pruebas.'
    ].join('\n');
  }

  buildDossier(id, sim) {
    const project = this.find(id);
    if (!project) throw new Error('Proyecto no encontrado');
    const lines = [
      `# ${project.title}`, '', `**Proyecto Génesis Ω · Gran Proyecto ${project.number}**`,
      `- Tipo: ${GRAND_PROJECT_TYPES[project.type]?.label || project.type}`,
      `- Estado: ${statusLabel(project.status)}`,
      `- Progreso: ${Math.round(project.progress * 100)}%`,
      `- Calidad simulada: ${Math.round(project.quality * 100)}%`,
      `- Confianza interna: ${Math.round(project.confidence * 100)}%`,
      `- Iteraciones: ${project.iteration}`, `- Año de inicio: ${project.createdYear.toFixed(1)}`,
      '', '## Mandato', '', project.brief, '', '## Restricciones', '', project.constraints || 'No se especificaron restricciones adicionales.',
      '', '## Plan y resultados'
    ];
    for (const phase of PHASES) {
      const tasks = project.tasks.filter(item => item.phase === phase[0]);
      if (!tasks.length) continue;
      lines.push('', `### ${phase[1]}`);
      for (const item of tasks) {
        lines.push('', `#### ${item.status === 'completed' ? '✓' : '○'} ${item.title}`, `Estado: ${statusLabel(item.status)} · progreso ${Math.round(item.progress * 100)}% · intentos ${item.attempts + 1}`, '', item.output || 'Pendiente de ejecución.');
      }
    }
    lines.push('', '## Bloqueos', '', ...(project.blockers.length ? project.blockers.map(item => `- ${item.text}`) : ['- Ninguno activo.']));
    lines.push('', '## Aprendizajes', '', ...(project.lessons.length ? project.lessons.map(item => `- ${item.text}`) : ['- Todavía no se han registrado fallos útiles.']));
    lines.push('', '## Decisiones e hitos', '', ...project.decisions.slice(0, 30).map(item => `- Año ${item.year.toFixed(1)} · **${item.kind}:** ${item.text}`));
    lines.push('', '## Aportaciones externas revisadas', '', ...(project.externalInsights.length ? project.externalInsights.map(item => `- ${item.text}`) : ['- Ninguna. El proyecto se ha desarrollado con el Atlas Ω y la simulación local.']));
    lines.push('', '## Alcance real', '', 'Este dossier es el resultado de una simulación local de organización, aprendizaje y creación. Puede producir planes, prototipos textuales y artefactos basados en reglas y conocimiento incorporado. Para hechos actuales, investigación especializada o ejecución fuera del navegador necesita fuentes o herramientas externas revisadas por una persona.');
    return lines.join('\n');
  }

  metrics() {
    const active = this.projects.filter(item => ['active','waiting','paused'].includes(item.status));
    const completed = this.projects.filter(item => item.status === 'completed');
    const tasks = this.projects.flatMap(item => item.tasks);
    return {
      active: active.length, completed: completed.length,
      tasksDone: tasks.filter(item => item.status === 'completed').length,
      tasksTotal: tasks.length,
      averageQuality: completed.length ? completed.reduce((sum, item) => sum + item.quality, 0) / completed.length : 0,
      externalInsights: this.projects.reduce((sum, item) => sum + item.externalInsights.length, 0)
    };
  }

  serialize() {
    return {
      nextNumber: this.nextNumber,
      projects: this.projects.slice(0, 16).map(project => ({ ...project, brief: clean(project.brief, 900), constraints: clean(project.constraints, 600) }))
    };
  }

  hydrate(data) {
    this.reset();
    if (!data || typeof data !== 'object') return;
    this.nextNumber = Math.max(1, Math.floor(finiteOr(data.nextNumber, 1)));
    if (!Array.isArray(data.projects)) return;
    this.projects = data.projects.slice(0, 16).map(raw => sanitizeProject(raw)).filter(Boolean);
  }
}

function task(id, phase, title, skills, effort, after = []) { return Object.freeze({ id, phase, title, skills, effort, after }); }
function cloneTasks(items) { return items.map(item => ({ ...item, skills: [...item.skills], after: [...item.after], status: 'pending', progress: 0, quality: .32, attempts: 0, assignedIds: [], gaps: [], output: '', startedYear: null, completedYear: null })); }
function dependenciesDone(item, tasks) { return item.after.every(id => tasks.find(candidate => candidate.id === id)?.status === 'completed'); }
function clean(value, max) { return sanitizeCollectivePrompt(String(value ?? ''), max); }
function roundYear(value) { return +Math.max(0, finiteOr(value, 0)).toFixed(1); }
function record(sim, kind, text) { return { id: uid(), year: roundYear(sim?.year), kind: clean(kind, 50), text: clean(text, 500) }; }
function replaceBlocker(project, id, text) { const current = project.blockers.find(item => item.id === id); if (current) current.text = text; else project.blockers.unshift({ id, text }); project.blockers = project.blockers.slice(0, 20); }
function clearBlocker(project, id) { project.blockers = project.blockers.filter(item => item.id !== id); }
function candidateScore(creature, required) {
  const skill = deriveSkill(creature);
  const direct = required.includes(skill) ? 1 : required.some(key => (ADJACENT[key] || []).includes(skill)) ? .58 : .12;
  const geneKey = SKILLS[skill]?.gene;
  const rawGene = finiteOr(creature.genome?.[geneKey], .5);
  const gene = geneKey === 'vision' ? rawGene / 260 : geneKey === 'longevity' ? rawGene / 240 : geneKey === 'speed' ? rawGene / 2.4 : geneKey === 'mutationRate' ? rawGene * 12 : rawGene;
  return direct * 1.5 + clamp(gene, 0, 1.5) * .45 + clamp(finiteOr(creature.genome?.memory, .5), 0, 1.5) * .2 + clamp(finiteOr(creature.genome?.sociability, .5), 0, 1.5) * .15 + Math.min(.25, (creature.knowledge?.length || 0) / 100);
}
function artifactKind(phase) { return ({ definition: 'mandato', planning: 'plan', research: 'evidencia', design: 'diseño', production: 'prototipo', verification: 'prueba', delivery: 'entrega' })[phase] || 'nota'; }
function buildTaskOutput(project, item, crew, coverage) {
  const names = crew.map(creature => creature.entityCode || creature.name).slice(0, 5).join(', ');
  const constraints = project.constraints ? ` Se respetaron estas restricciones: ${project.constraints}.` : '';
  const rigor = coverage > .8 ? 'El equipo reunió las especialidades necesarias' : coverage > .45 ? 'El equipo cubrió la mayoría de capacidades y documentó las carencias' : 'El equipo trabajó con capacidades adyacentes y dejó límites explícitos';
  const phaseText = {
    definition: `Se tradujo «${project.brief}» en criterios observables, usuarios o beneficiarios, límites y señales de éxito.`,
    planning: 'Se creó una secuencia de trabajo con dependencias, riesgos, recursos, responsables y puntos de decisión reversibles.',
    research: 'Se reunieron observaciones internas, conocimiento del Atlas Ω y explicaciones alternativas, separando evidencia de hipótesis.',
    design: 'Se compararon variantes y se eligió una solución modular, comprensible, accesible y reparable.',
    production: 'Se construyó un prototipo mínimo útil con componentes independientes y un registro de supuestos.',
    verification: 'Se probaron flujo principal, errores, límites, seguridad y posibilidades de refutación; los fallos encontrados alimentaron nuevas iteraciones.',
    delivery: 'Se consolidaron resultados, instrucciones, mantenimiento, riesgos pendientes y próximos pasos en un dossier exportable.'
  }[item.phase] || 'La tarea produjo un resultado verificable.';
  return `${phaseText} ${rigor}. Responsables: ${names}.${constraints}`.slice(0, 950);
}
function statusLabel(status) { return ({ active: 'Activo', waiting: 'En espera', paused: 'Pausado', completed: 'Completado', cancelled: 'Cancelado', pending: 'Pendiente', working: 'En ejecución' })[status] || status; }
function sanitizeProject(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const type = Object.prototype.hasOwnProperty.call(GRAND_PROJECT_TYPES, raw.type) ? raw.type : 'custom';
  const template = cloneTasks(TEMPLATES[type] || TEMPLATES.custom);
  const savedTasks = Array.isArray(raw.tasks) ? raw.tasks : [];
  const tasks = template.map(base => {
    const source = savedTasks.find(item => item?.id === base.id) || {};
    return {
      ...base,
      status: ['pending','working','completed','cancelled'].includes(source.status) ? source.status : 'pending',
      progress: clamp(finiteOr(source.progress, 0), 0, 1), quality: clamp(finiteOr(source.quality, .32), 0, 1),
      attempts: Math.max(0, Math.min(5, Math.floor(finiteOr(source.attempts, 0)))),
      assignedIds: Array.isArray(source.assignedIds) ? source.assignedIds.filter(id => typeof id === 'string').slice(0, 8) : [],
      gaps: Array.isArray(source.gaps) ? source.gaps.filter(key => SKILLS[key]).slice(0, 8) : [], output: clean(source.output, 1200),
      startedYear: source.startedYear == null ? null : roundYear(source.startedYear), completedYear: source.completedYear == null ? null : roundYear(source.completedYear)
    };
  });
  return {
    id: typeof raw.id === 'string' ? raw.id.slice(0, 50) : uid(), number: Math.max(1, Math.floor(finiteOr(raw.number, 1))), type,
    title: clean(raw.title, 90) || GRAND_PROJECT_TYPES[type].defaultTitle, brief: clean(raw.brief, 900), constraints: clean(raw.constraints, 600),
    status: ['active','waiting','paused','completed','cancelled'].includes(raw.status) ? raw.status : 'active',
    createdYear: roundYear(raw.createdYear), updatedYear: roundYear(raw.updatedYear), completedYear: raw.completedYear == null ? null : roundYear(raw.completedYear),
    progress: clamp(finiteOr(raw.progress, 0), 0, 1), quality: clamp(finiteOr(raw.quality, .28), 0, 1), confidence: clamp(finiteOr(raw.confidence, .32), 0, 1),
    iteration: Math.max(1, Math.floor(finiteOr(raw.iteration, 1))), tasks,
    decisions: sanitizeRecords(raw.decisions, 50), lessons: sanitizeRecords(raw.lessons, 30),
    blockers: Array.isArray(raw.blockers) ? raw.blockers.filter(item => item && typeof item === 'object').slice(0, 20).map(item => ({ id: clean(item.id, 80) || uid(), text: clean(item.text, 500) })) : [],
    externalInsights: Array.isArray(raw.externalInsights) ? raw.externalInsights.filter(item => item && typeof item === 'object').slice(0, 20).map(item => ({ id: typeof item.id === 'string' ? item.id : uid(), text: clean(item.text, 360), year: roundYear(item.year), reviewed: true })) : [],
    artifacts: Array.isArray(raw.artifacts) ? raw.artifacts.filter(item => item && typeof item === 'object').slice(-40).map(item => ({ id: typeof item.id === 'string' ? item.id : uid(), taskId: clean(item.taskId, 50), title: clean(item.title, 120), kind: clean(item.kind, 40), content: clean(item.content, 1200), year: roundYear(item.year) })) : [],
    teamIds: Array.isArray(raw.teamIds) ? raw.teamIds.filter(id => typeof id === 'string').slice(0, 40) : [],
    lastEvent: clean(raw.lastEvent, 500), delivered: Boolean(raw.delivered)
  };
}
function sanitizeRecords(value, max) { return Array.isArray(value) ? value.filter(item => item && typeof item === 'object').slice(0, max).map(item => ({ id: typeof item.id === 'string' ? item.id : uid(), year: roundYear(item.year), kind: clean(item.kind, 50), text: clean(item.text, 500) })) : []; }


/* ===== creature.js ===== */
const STATES = new Set([
  'explorar', 'huir', 'buscar alimento', 'buscar pareja', 'recordar', 'imitar', 'aprender', 'comunicar',
  'descansar', 'socializar', 'ayudar', 'investigar', 'migrar', 'crear'
]);
const NAME_START = ['Ari', 'Aster', 'Bri', 'Cora', 'Eli', 'Iko', 'Kai', 'Luma', 'Milo', 'Nara', 'Nexo', 'Nova', 'Orin', 'Rai', 'Sira', 'Tali', 'Vita', 'Yuna', 'Zuri'];
const NAME_END = ['', 'a', 'i', 'o', 'en', 'is', 'um', 'ix'];
const DIRECTIVES = new Map([
  ['avoid_conflict', 'Evitar conflictos innecesarios'],
  ['prioritize_food', 'Priorizar alimento cuando la energía baja'],
  ['explore_more', 'Explorar territorios desconocidos'],
  ['share_knowledge', 'Compartir descubrimientos con el linaje'],
  ['stay_group', 'Mantenerse cerca del grupo'],
  ['flee_early', 'Huir antes cuando aparece un peligro']
]);

class Creature {
  constructor(data = {}) {
    const source = data && typeof data === 'object' ? data : {};
    this.id = typeof source.id === 'string' && source.id ? source.id : uid();
    this.x = clamp(finiteOr(source.x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH);
    this.y = clamp(finiteOr(source.y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT);
    this.genome = sanitizeGenome(source.genome);
    this.speciesId = Math.max(1, Math.floor(finiteOr(source.speciesId, 1)));
    this.generation = Math.max(0, Math.floor(finiteOr(source.generation, 0)));
    this.parents = Array.isArray(source.parents) ? source.parents.filter(id => typeof id === 'string').slice(0, 2) : [];
    this.isFounder = Boolean(source.isFounder);
    this.entityCode = typeof source.entityCode === 'string' && /^Ω-\d{3,6}$/.test(source.entityCode) ? source.entityCode : null;
    this.energy = clamp(finiteOr(source.energy, 85), 0, 1000);
    this.age = Math.max(0, finiteOr(source.age, 0));
    this.angle = finiteOr(source.angle, rand(0, Math.PI * 2));
    this.state = STATES.has(source.state) ? source.state : 'explorar';
    this.dead = Boolean(source.dead);
    this.reproductionCooldown = Math.max(0, finiteOr(source.reproductionCooldown, rand(2, 8)));
    this.memory = sanitizeMemory(source.memory);
    this.lastMeal = Math.max(0, finiteOr(source.lastMeal, 0));
    this.wanderBias = clamp(finiteOr(source.wanderBias, rand(-1, 1)), -1, 1);

    this.name = sanitizeName(source.name) || (this.isFounder ? 'Ω-001' : createEntityName(this.id, this.genome.hue));
    this.appearance = sanitizeAppearance(source.appearance, this.genome, this.id);
    this.knowledge = sanitizeKnowledge(source.knowledge);
    this.dialogue = sanitizeDialogue(source.dialogue);
    this.bond = clamp(finiteOr(source.bond, 0), 0, 1);
    this.voiceIndex = Math.max(0, Math.floor(finiteOr(source.voiceIndex, seededUnit(`${this.id}:voice`) * 8)));
    this.experience = sanitizeExperience(source.experience);
    this.skill = typeof source.skill === 'string' && /^[a-z]{4,16}$/.test(source.skill) ? source.skill : null;
    this.mood = sanitizeText(source.mood, 30) || 'expectante';
    this.goal = sanitizeText(source.goal, 60) || 'conocer el mundo';
    this.autonomy = clamp(finiteOr(source.autonomy, .55 + this.genome.curiosity * .28 + (1 - this.genome.sociability) * .12), .25, 1);
    this.home = sanitizePoint(source.home, this.x, this.y);
    this.relationships = sanitizeRelationships(source.relationships);
    this.visitedCells = sanitizeStringList(source.visitedCells, 96, 20);
    this.discoveries = sanitizeKnowledge(source.discoveries).slice(-24);
    this.innerTimer = Math.max(0, finiteOr(source.innerTimer, rand(.2, 1.4)));
    this.socialCooldown = Math.max(0, finiteOr(source.socialCooldown, 0));
    this.lastSpeech = '';
    this.speechUntil = 0;
    this.senseTimer = 0;
    this.sensedFood = [];
    this.sensedCreatures = [];
    this.percepts = null;
  }

  get radius() { return this.genome.size; }
  get maturity() { return 8 + this.genome.size * .55; }
  get growthScale() {
    if (this.age >= this.maturity) return this.age > this.genome.longevity * .82 ? .96 : 1;
    return clamp(.5 + (this.age / Math.max(1, this.maturity)) * .5, .5, 1);
  }
  get lifeStage() {
    if (this.age < this.maturity * .32) return 'cría';
    if (this.age < this.maturity) return 'juvenil';
    if (this.age > this.genome.longevity * .82) return 'anciano';
    return 'adulto';
  }
  get visualRadius() { return this.radius * (3.7 + this.appearance.fluff * .35) * this.growthScale; }
  get maxEnergy() { return 105 + this.genome.size * 6; }
  get color() { return hsl(this.genome.hue, 78, 62); }
  get personality() {
    const g = this.genome;
    if (g.sociability > .76 && g.aggression < .35) return 'Empático';
    if (g.curiosity > .78 && g.memory > .62) return 'Investigador';
    if (g.aggression > .72) return 'Territorial';
    if (g.efficiency > 1.28 && g.metabolism < .85) return 'Prudente';
    if (g.speed > 1.55) return 'Impulsivo';
    if (g.memory > .78) return 'Analítico';
    return 'Curioso';
  }

  update(dt, simulation) {
    if (this.dead || !Number.isFinite(dt) || dt <= 0) return;
    const g = this.genome;
    const directives = this.directiveSet();
    const biome = simulation.getBiome?.() ?? BIOMES.origin;
    const freedom = clamp(finiteOr(simulation.autonomyLevel, .9) * this.autonomy, .2, 1);

    this.age += dt;
    this.reproductionCooldown = Math.max(0, this.reproductionCooldown - dt);
    this.socialCooldown = Math.max(0, this.socialCooldown - dt);
    this.lastMeal += dt;
    this.innerTimer -= dt;

    const climateCost = 1 + Math.abs(simulation.temperature - 18) * .012;
    this.energy -= dt * (.38 + g.metabolism * .48 + g.speed * .08 + g.size * .03) * climateCost / Math.max(.1, g.efficiency);
    if (this.energy <= 0 || this.age > g.longevity) {
      simulation.killCreature(this, this.energy <= 0 ? 'inanición' : 'longevidad');
      return;
    }

    simulation.tryPrimordialReproduction?.(this);

    const vision = g.vision;
    this.senseTimer -= dt;
    if (this.senseTimer <= 0) {
      const socialRange = this.age > this.maturity ? vision * 2.6 : vision * .9;
      this.sensedFood = simulation.foodGrid.query(this.x, this.y, vision);
      this.sensedCreatures = simulation.creatureGrid.query(this.x, this.y, socialRange);
      // La selección de candidatos sociales se hace aquí, al ritmo del sensado (~0,26 s con
      // población alta), no en cada paso de simulación. Antes, cada criatura recorría su lista
      // de vecinos (media de ~220 con 850 criaturas) unas 60 veces por segundo: ~11,5 millones
      // de iteraciones/s solo en este bucle. La lista ya era estale entre sensados, así que
      // seleccionar sobre ella con la misma cadencia no cambia la semántica; las posiciones de
      // los candidatos elegidos sí se leen en vivo al decidir el rumbo.
      this.refreshSocialPercepts(g, directives);
      this.senseTimer = simulation.senseInterval * (.7 + ((this.id.charCodeAt(0) + this.id.charCodeAt(this.id.length - 1)) % 13) / 20);
    }

    let targetFood = null;
    let bestFoodScore = Infinity;
    for (const food of this.sensedFood) {
      if (!food || food.eaten || food.life <= 0) continue;
      const score = distanceSq(this, food) / Math.max(.1, finiteOr(food.energy, 1));
      if (score < bestFoodScore) { bestFoodScore = score; targetFood = food; }
    }

    // Revalidación barata de los candidatos elegidos en el último sensado.
    const percepts = this.percepts;
    const threat = percepts && percepts.threat && !percepts.threat.dead ? percepts.threat : null;
    const friend = percepts && percepts.friend && !percepts.friend.dead ? percepts.friend : null;
    const vulnerableKin = percepts && percepts.vulnerableKin && !percepts.vulnerableKin.dead ? percepts.vulnerableKin : null;
    const mate = percepts && percepts.mate && !percepts.mate.dead && percepts.mate.reproductionCooldown <= 0 ? percepts.mate : null;

    if (this.innerTimer <= 0) {
      this.refreshMind(simulation, { threat, targetFood, mate, friend, vulnerableKin });
      this.observeTerritory(simulation);
      this.innerTimer = rand(.9, 2.1) / Math.max(.55, g.curiosity);
    }

    let desiredAngle = this.angle;
    let speedFactor = 1;
    const hungerThreshold = directives.has('prioritize_food') ? .76 : .64;
    const canHelp = vulnerableKin && this.energy > this.maxEnergy * .76 && g.sociability > .58 && this.socialCooldown <= 0;

    if (threat && (g.aggression < .78 || directives.has('avoid_conflict'))) {
      this.state = 'huir';
      this.mood = 'alarmado';
      this.goal = 'ponerse a salvo';
      desiredAngle = angleTo(threat, this) + rand(-.18, .18);
      speedFactor = 1.45;
      this.remember('danger', threat.x, threat.y, g.memory);
    } else if (this.energy < this.maxEnergy * hungerThreshold && targetFood) {
      this.state = 'buscar alimento';
      this.goal = 'recuperar energía';
      desiredAngle = angleTo(this, targetFood);
      this.remember('food', targetFood.x, targetFood.y, g.memory);
    } else if (canHelp) {
      this.state = 'ayudar';
      this.goal = `ayudar a ${vulnerableKin.name}`;
      desiredAngle = angleTo(this, vulnerableKin);
      if (distanceSq(this, vulnerableKin) < (this.visualRadius + vulnerableKin.visualRadius + 18) ** 2) {
        const gift = Math.min(14, Math.max(0, this.energy - this.maxEnergy * .66));
        if (gift > 2) {
          this.energy -= gift;
          vulnerableKin.energy = Math.min(vulnerableKin.maxEnergy, vulnerableKin.energy + gift * .9);
          this.bond = clamp(this.bond + .018, 0, 1);
          vulnerableKin.bond = clamp(vulnerableKin.bond + .025, 0, 1);
          this.strengthenRelationship(vulnerableKin.id, .08);
          vulnerableKin.strengthenRelationship?.(this.id, .1);
          this.socialCooldown = rand(5, 10);
          this.speakAutonomously(`He compartido energía con ${vulnerableKin.name}.` , simulation);
        }
      }
    } else if (this.energy > this.maxEnergy * .7 && this.age > this.maturity && mate && this.reproductionCooldown <= 0) {
      this.state = 'buscar pareja';
      this.goal = 'continuar el linaje';
      desiredAngle = angleTo(this, mate);
      if (distanceSq(this, mate) < (this.radius + mate.radius + 5) ** 2) simulation.reproduce(this, mate);
    } else if (friend && g.sociability > .62 && this.socialCooldown <= 0 && chance(dt * (.035 + g.sociability * .05))) {
      this.state = 'socializar';
      this.goal = `fortalecer vínculo con ${friend.name}`;
      desiredAngle = angleTo(this, friend);
      speedFactor = .72;
      if (distanceSq(this, friend) < (this.visualRadius + friend.visualRadius + 28) ** 2) {
        this.bond = clamp(this.bond + dt * .016, 0, 1);
        friend.bond = clamp(friend.bond + dt * .012, 0, 1);
        this.strengthenRelationship(friend.id, dt * .04);
        friend.strengthenRelationship?.(this.id, dt * .035);
        if (chance(g.memory * g.sociability * .16)) this.exchangeKnowledge(friend, simulation);
        this.socialCooldown = rand(2.5, 6);
      }
    } else if (this.energy < this.maxEnergy * .48 && this.memory.food.length && chance(g.memory * .02)) {
      const memory = this.memory.food.at(-1);
      if (memory) {
        this.state = 'recordar';
        this.goal = 'volver a una fuente conocida';
        desiredAngle = Math.atan2(memory.y - this.y, memory.x - this.x);
      }
    } else if (this.energy < this.maxEnergy * .42 && !targetFood) {
      this.state = 'descansar';
      this.goal = 'conservar energía';
      this.mood = 'cansado';
      speedFactor = .16;
      desiredAngle += Math.sin(simulation.time + this.wanderBias) * dt * .12;
    } else {
      const guidedExploration = directives.has('explore_more') && chance(.3 + (1 - freedom) * .45);
      this.state = guidedExploration ? 'aprender' : (g.curiosity > .72 ? 'investigar' : 'explorar');
      this.goal = guidedExploration ? 'seguir una regla aprendida' : 'descubrir territorio';
      const explorationBoost = guidedExploration ? 1.42 : 1;
      desiredAngle += (Math.sin(simulation.time * .7 + this.wanderBias * 8) * .55 + rand(-.45, .45) * freedom) * dt * (1.3 + g.curiosity * explorationBoost);
      speedFactor = .68 + g.curiosity * .35;
      if (friend && g.sociability > .45) {
        const groupWeight = directives.has('stay_group') ? .18 : .095;
        const effectiveWeight = groupWeight * (1.15 - freedom * .35);
        desiredAngle = desiredAngle * (1 - g.sociability * effectiveWeight) + angleTo(this, friend) * g.sociability * effectiveWeight;
        const learned = friend.memory?.food?.at(-1);
        if (learned && chance(g.sociability * g.memory * dt * .22)) {
          this.remember('food', learned.x, learned.y, g.memory);
          this.state = 'imitar';
        }
        if (friend.knowledge?.length && chance(g.sociability * g.memory * dt * (directives.has('share_knowledge') ? .18 : .08))) {
          if (this.exchangeKnowledge(friend, simulation)) this.state = 'comunicar';
        }
      }
    }

    this.angle += normalizeAngle(desiredAngle - this.angle) * Math.min(1, dt * (2.4 + g.curiosity));
    const speed = 28 * g.speed * speedFactor * finiteOr(biome.movementFactor, 1);
    this.x += Math.cos(this.angle) * speed * dt;
    this.y += Math.sin(this.angle) * speed * dt;

    if (this.x < 0 || this.x > CONFIG.WORLD_WIDTH) { this.angle = Math.PI - this.angle; this.x = clamp(this.x, 0, CONFIG.WORLD_WIDTH); }
    if (this.y < 0 || this.y > CONFIG.WORLD_HEIGHT) { this.angle = -this.angle; this.y = clamp(this.y, 0, CONFIG.WORLD_HEIGHT); }

    if (targetFood && distanceSq(this, targetFood) < (this.radius + targetFood.radius + 3) ** 2) simulation.consumeFood(this, targetFood);
  }

  // Selecciona amenaza, pareja, amistad y pariente vulnerable a partir de la última lectura
  // sensorial. Se ejecuta con la cadencia del sensado, no en cada paso: la lista de vecinos ya
  // era estale entre sensados, de modo que la selección conserva la misma semántica con una
  // fracción del coste. Los criterios son exactamente los del bucle original.
  refreshSocialPercepts(g, directives) {
    let threat = null, mate = null, friend = null, vulnerableKin = null;
    let threatD2 = Infinity, mateD2 = Infinity, friendD2 = Infinity, vulnerableD2 = Infinity;
    const caution = directives.has('flee_early') ? 1.02 : 1.18;
    const aggressionLimit = directives.has('avoid_conflict') ? .46 : .62;
    const threatRange = (g.vision * .72) ** 2;
    for (const other of this.sensedCreatures) {
      if (!other || other === this || other.dead) continue;
      const d2 = distanceSq(this, other);
      const sameSpecies = other.speciesId === this.speciesId;
      if (d2 < threatRange && d2 < threatD2 && other.genome.size > g.size * caution && other.genome.aggression > aggressionLimit) {
        threat = other; threatD2 = d2;
      }
      if (sameSpecies && d2 < friendD2) { friend = other; friendD2 = d2; }
      if (sameSpecies && other.energy < other.maxEnergy * .28 && d2 < vulnerableD2) { vulnerableKin = other; vulnerableD2 = d2; }
      if (sameSpecies && d2 < mateD2 && other.age > other.maturity && other.energy > other.maxEnergy * .63 && other.reproductionCooldown <= 0) {
        mate = other; mateD2 = d2;
      }
    }
    this.percepts = { threat, mate, friend, vulnerableKin };
  }

  refreshMind(simulation, context = {}) {
    const energyRatio = this.energy / Math.max(1, this.maxEnergy);
    if (context.threat) this.mood = 'alarmado';
    else if (energyRatio < .3) this.mood = 'agotado';
    else if (context.vulnerableKin && this.genome.sociability > .6) this.mood = 'protector';
    else if (this.bond > .72) this.mood = 'confiado';
    else if (this.genome.curiosity > .75) this.mood = 'intrigado';
    else if (energyRatio > .82) this.mood = 'vital';
    else this.mood = 'sereno';

    if (context.threat) this.goal = 'ponerse a salvo';
    else if (energyRatio < .55) this.goal = 'encontrar energía';
    else if (context.vulnerableKin && this.genome.sociability > .58) this.goal = 'proteger al linaje';
    else if (context.mate && this.age > this.maturity) this.goal = 'continuar el linaje';
    else if (context.friend && this.genome.sociability > .7) this.goal = 'compartir conocimiento';
    else this.goal = this.genome.curiosity > .66 ? 'descubrir algo nuevo' : 'mantenerse estable';
  }

  observeTerritory(simulation) {
    const cellSize = 180;
    const cellX = Math.floor(this.x / cellSize);
    const cellY = Math.floor(this.y / cellSize);
    const biomeKey = simulation.biome ?? 'origin';
    const cellKey = `${biomeKey}:${cellX}:${cellY}`;
    if (this.visitedCells.includes(cellKey)) return false;
    this.visitedCells.push(cellKey);
    if (this.visitedCells.length > 96) this.visitedCells.shift();

    const biome = simulation.getBiome?.() ?? BIOMES.origin;
    const discoveries = [
      `Ruta fértil en ${biome.label}`,
      `Refugio natural en ${biome.label}`,
      `Zona de energía en ${biome.label}`,
      `Patrón climático de ${biome.label}`,
      `Territorio nuevo del cuadrante ${cellX}-${cellY}`
    ];
    const index = Math.floor(seededUnit(`${this.id}:${cellKey}`) * discoveries.length);
    const label = `${discoveries[index]} · X ${Math.round(this.x)}, Y ${Math.round(this.y)}`;
    const key = `discovery:${cellKey}`;
    const learned = this.learnKnowledge({ kind: 'fact', key, label, confidence: .48 + this.genome.memory * .38, createdAt: Date.now() }, 'exploración');
    if (!learned) return false;
    this.discoveries.push({ kind: 'fact', key, label, confidence: .7, source: 'exploración', createdAt: Date.now() });
    if (this.discoveries.length > 24) this.discoveries.shift();
    if (simulation.recordDiscovery?.(this, { key, label, x: this.x, y: this.y })) {
      this.experience.discoveries = Math.min(9999, (this.experience.discoveries || 0) + 1);
      if (chance(.22 + this.genome.curiosity * .28)) this.speakAutonomously(`He descubierto ${label.toLowerCase()}.`, simulation);
    }
    return true;
  }

  strengthenRelationship(id, amount) {
    if (typeof id !== 'string' || !id || id === this.id) return;
    const current = clamp(finiteOr(this.relationships[id], 0) + finiteOr(amount, 0), 0, 1);
    this.relationships[id] = current;
    const entries = Object.entries(this.relationships);
    if (entries.length > 24) {
      entries.sort((a, b) => b[1] - a[1]);
      this.relationships = Object.fromEntries(entries.slice(0, 24));
    }
  }

  exchangeKnowledge(other, simulation) {
    if (!other?.knowledge?.length) return false;
    const item = other.knowledge[Math.floor(Math.random() * other.knowledge.length)];
    if (!this.learnKnowledge(item, 'social')) return false;
    this.experience.socialLearns++;
    this.strengthenRelationship(other.id, .025);
    if (chance(.18)) this.speakAutonomously(`He aprendido algo de ${other.name}.`, simulation);
    return true;
  }

  speakAutonomously(text, simulation) {
    const clean = sanitizeText(text, 220);
    if (!clean || clean === this.lastSpeech) return;
    this.lastSpeech = clean;
    this.speechUntil = finiteOr(simulation?.time, 0) + 7;
    this.addDialogue('creature', clean);
  }

  directiveSet() {
    // Caché: se reconstruye solo cuando cambia el conocimiento (learnKnowledge).
    // Antes se creaba un Set nuevo por criatura y por paso: ~50k asignaciones/s con 850 criaturas.
    if (!this._directives) {
      this._directives = new Set(this.knowledge.filter(item => item.kind === 'directive').map(item => item.key));
    }
    return this._directives;
  }

  remember(type, x, y, capacity) {
    const list = this.memory[type];
    if (!Array.isArray(list) || !Number.isFinite(x) || !Number.isFinite(y)) return;
    list.push({ x, y, t: Date.now() });
    const max = Math.max(2, Math.round(capacity * 14));
    if (list.length > max) list.splice(0, list.length - max);
  }

  learnKnowledge(record, source = 'experiencia') {
    if (!record || typeof record !== 'object') return false;
    const clean = sanitizeKnowledge([record])[0];
    if (!clean) return false;
    const existing = this.knowledge.find(item => item.kind === clean.kind && item.key === clean.key);
    if (existing) {
      const previous = existing.confidence;
      existing.confidence = clamp(Math.max(existing.confidence, clean.confidence) + .02, 0, 1);
      existing.updatedAt = Date.now();
      return existing.confidence > previous;
    }
    clean.source = sanitizeText(source, 28) || 'experiencia';
    this.knowledge.push(clean);
    const max = Math.max(8, Math.round(8 + this.genome.memory * 22));
    if (this.knowledge.length > max) this.knowledge.splice(0, this.knowledge.length - max);
    this._directives = null;
    return true;
  }

  teach(input, simulation) {
    const text = sanitizeText(input, 240);
    if (!text) return { response: 'No he recibido ninguna instrucción.', learned: false };
    const normalized = normalizeText(text);
    this.state = 'aprender';
    this.bond = clamp(this.bond + .025 + this.genome.sociability * .018, 0, 1);
    this.experience.userLessons++;
    this.addDialogue('user', text);

    const nameMatch = text.match(/(?:te llamas|tu nombre es|ll[aá]mate)\s+([\p{L}0-9_-]{2,18})/iu);
    if (nameMatch) {
      this.name = sanitizeName(nameMatch[1]) || this.name;
      return this.finishTeaching(`He aprendido mi nombre. Soy ${this.name}.`, true, simulation);
    }

    if (/como te llamas|cual es tu nombre|quien eres/.test(normalized)) {
      return this.finishTeaching(`Soy ${this.name}${this.entityCode && this.entityCode !== this.name ? `, registro ${this.entityCode}` : ''}. Soy ${this.lifeStage} y pertenezco al Linaje ${String(this.speciesId).padStart(2, '0')}.`, false, simulation);
    }
    if (/como estas|que sientes|estado/.test(normalized)) {
      const energy = this.energy / this.maxEnergy;
      const mood = energy > .72 ? 'con energía y curiosidad' : energy > .38 ? 'estable, aunque necesito recursos' : 'débil y buscando alimento';
      return this.finishTeaching(`Ahora estoy ${mood}. Estoy ${this.state}.`, false, simulation);
    }
    if (/que sabes|que has aprendido|conocimiento/.test(normalized)) {
      const summary = this.knowledge.slice(-4).map(item => item.label).filter(Boolean);
      const answer = summary.length ? `Recuerdo ${summary.join('; ')}.` : 'Todavía sé poco. Enséñame una regla o déjame observar al linaje.';
      return this.finishTeaching(answer, false, simulation);
    }
    if (/donde.*(comida|alimento)|recuerdas.*(comida|alimento)/.test(normalized)) {
      const known = this.memory.food.at(-1);
      const answer = known ? `La última fuente de energía que recuerdo estaba cerca de X ${Math.round(known.x)}, Y ${Math.round(known.y)}.` : 'Aún no he memorizado una fuente de energía fiable.';
      return this.finishTeaching(answer, false, simulation);
    }

    const scriptMatch = text.match(/si\s+(.+?)\s+(?:entonces|,|:)\s*(.+)/i);
    if (scriptMatch) {
      const condition = sanitizeText(scriptMatch[1], 80);
      const action = sanitizeText(scriptMatch[2], 80);
      const label = `SI ${condition} → ${action}`;
      this.learnKnowledge({ kind: 'script', key: `script:${hashString(label)}`, label, confidence: .72, createdAt: Date.now() }, 'ΩScript natural');
      const linkedDirective = parseDirective(normalizeText(action));
      if (linkedDirective) {
        this.learnKnowledge({ kind: 'directive', key: linkedDirective, label: DIRECTIVES.get(linkedDirective), confidence: .78, createdAt: Date.now() }, 'ΩScript natural');
        return this.finishTeaching(`He guardado el programa: ${label}. También lo he vinculado a una conducta segura del motor: ${DIRECTIVES.get(linkedDirective)}.`, true, simulation);
      }
      return this.finishTeaching(`He guardado el programa: ${label}. Queda en el laboratorio aislado hasta que su acción pueda asociarse a una conducta segura.`, true, simulation);
    }

    const directive = parseDirective(normalized);
    if (directive) {
      const learned = this.learnKnowledge({ kind: 'directive', key: directive, label: DIRECTIVES.get(directive), confidence: .86, createdAt: Date.now() }, 'usuario');
      return this.finishTeaching(`${learned ? 'He incorporado' : 'He reforzado'} la regla: ${DIRECTIVES.get(directive)}. La compartiré si mi carácter y el entorno lo permiten.`, true, simulation);
    }

    const factMatch = text.match(/recuerda(?:\s+que)?\s+(.+)/i);
    if (factMatch) {
      const fact = sanitizeText(factMatch[1], 150);
      this.learnKnowledge({ kind: 'fact', key: `fact:${hashString(fact)}`, label: fact, confidence: .76, createdAt: Date.now() }, 'usuario');
      return this.finishTeaching(`Lo recordaré: ${fact}.`, true, simulation);
    }

    const generic = sanitizeText(text, 140);
    this.learnKnowledge({ kind: 'fact', key: `fact:${hashString(generic)}`, label: generic, confidence: .55, createdAt: Date.now() }, 'conversación');
    return this.finishTeaching(this.personality === 'Investigador'
      ? 'Lo guardaré como hipótesis y buscaré experiencias que lo confirmen.'
      : 'Lo he añadido a mi memoria. Puede cambiar si la experiencia demuestra otra cosa.', true, simulation);
  }

  finishTeaching(response, learned, simulation) {
    const clean = sanitizeText(response, 260);
    this.addDialogue('creature', clean);
    this.lastSpeech = clean;
    this.speechUntil = finiteOr(simulation?.time, 0) + 7;
    return { response: clean, learned };
  }

  addDialogue(role, text) {
    this.dialogue.push({ role: role === 'user' ? 'user' : 'creature', text: sanitizeText(text, 260), at: Date.now() });
    if (this.dialogue.length > 16) this.dialogue.splice(0, this.dialogue.length - 16);
  }

  serialize() {
    return {
      id: this.id, x: this.x, y: this.y, genome: this.genome, speciesId: this.speciesId,
      generation: this.generation, parents: this.parents, energy: this.energy, age: this.age,
      angle: this.angle, state: this.state, dead: this.dead, reproductionCooldown: this.reproductionCooldown,
      memory: this.memory, lastMeal: this.lastMeal, wanderBias: this.wanderBias,
      name: this.name, appearance: this.appearance, knowledge: this.knowledge, dialogue: this.dialogue,
      bond: this.bond, voiceIndex: this.voiceIndex, experience: this.experience,
      isFounder: this.isFounder, entityCode: this.entityCode, skill: this.skill,
      mood: this.mood, goal: this.goal, autonomy: this.autonomy, home: this.home,
      relationships: this.relationships, visitedCells: this.visitedCells, discoveries: this.discoveries,
      innerTimer: this.innerTimer, socialCooldown: this.socialCooldown
    };
  }
}

function combineAppearances(a, b, mutationStrength = 1) {
  const first = sanitizeAppearance(a, { hue: 180 }, 'a');
  const second = sanitizeAppearance(b, { hue: 180 }, 'b');
  const pick = key => chance(.5) ? first[key] : second[key];
  const mutate = (value, amount, min, max) => clamp(value + (Math.random() - .5) * amount * mutationStrength, min, max);
  return {
    earSize: mutate(pick('earSize'), .16, .72, 1.55),
    eyeSize: mutate(pick('eyeSize'), .12, .78, 1.42),
    fluff: mutate(pick('fluff'), .14, .65, 1.45),
    snout: mutate(pick('snout'), .12, .68, 1.28),
    darkness: mutate(pick('darkness'), .12, .08, .82),
    bellyLight: mutate(pick('bellyLight'), .12, .3, .95),
    accentHue: ((pick('accentHue') + (Math.random() - .5) * 12 * mutationStrength) % 360 + 360) % 360,
    pattern: chance(.08 * mutationStrength) ? Math.floor(rand(0, 4)) : pick('pattern'),
    earTilt: mutate(pick('earTilt'), .18, -.55, .55),
    tail: mutate(pick('tail'), .15, .55, 1.35)
  };
}

function inheritKnowledge(a, b, memory = .5) {
  const pool = [...sanitizeKnowledge(a), ...sanitizeKnowledge(b)];
  const unique = [];
  for (const item of pool.sort(() => Math.random() - .5)) {
    if (unique.some(entry => entry.kind === item.kind && entry.key === item.key)) continue;
    if (chance(.18 + clamp(memory, 0, 1) * .42)) unique.push({ ...item, confidence: clamp(item.confidence * .72, .25, .88), source: 'herencia cultural' });
    if (unique.length >= 6) break;
  }
  return unique;
}

function sanitizeMemory(memory) {
  const sanitizeList = list => Array.isArray(list)
    ? list.filter(item => item && Number.isFinite(Number(item.x)) && Number.isFinite(Number(item.y)))
      .slice(-20)
      .map(item => ({ x: Number(item.x), y: Number(item.y), t: finiteOr(item.t, Date.now()) }))
    : [];
  return { food: sanitizeList(memory?.food), danger: sanitizeList(memory?.danger) };
}

function sanitizePoint(value, fallbackX, fallbackY) {
  return {
    x: clamp(finiteOr(value?.x, fallbackX), 0, CONFIG.WORLD_WIDTH),
    y: clamp(finiteOr(value?.y, fallbackY), 0, CONFIG.WORLD_HEIGHT)
  };
}

function sanitizeRelationships(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([id]) => typeof id === 'string' && id.length > 0 && id.length <= 50)
    .slice(0, 24)
    .map(([id, bond]) => [id, clamp(finiteOr(bond, 0), 0, 1)]));
}

function sanitizeStringList(value, maxItems = 64, maxLength = 40) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(item => typeof item === 'string').map(item => item.slice(0, maxLength)).filter(Boolean))].slice(-maxItems);
}

function sanitizeAppearance(value, genome, id) {
  const source = value && typeof value === 'object' ? value : {};
  const seed = `${id}:${finiteOr(genome?.hue, 180).toFixed(1)}`;
  const unit = suffix => seededUnit(`${seed}:${suffix}`);
  return {
    earSize: clamp(finiteOr(source.earSize, .88 + unit('ear') * .5), .72, 1.55),
    eyeSize: clamp(finiteOr(source.eyeSize, .86 + unit('eye') * .42), .78, 1.42),
    fluff: clamp(finiteOr(source.fluff, .72 + unit('fluff') * .58), .65, 1.45),
    snout: clamp(finiteOr(source.snout, .76 + unit('snout') * .35), .68, 1.28),
    darkness: clamp(finiteOr(source.darkness, .18 + unit('dark') * .52), .08, .82),
    bellyLight: clamp(finiteOr(source.bellyLight, .45 + unit('belly') * .42), .3, .95),
    accentHue: ((finiteOr(source.accentHue, finiteOr(genome?.hue, 180) + (unit('accent') - .5) * 70) % 360) + 360) % 360,
    pattern: Math.max(0, Math.min(3, Math.floor(finiteOr(source.pattern, unit('pattern') * 4)))),
    earTilt: clamp(finiteOr(source.earTilt, (unit('tilt') - .5) * .7), -.55, .55),
    tail: clamp(finiteOr(source.tail, .7 + unit('tail') * .5), .55, 1.35)
  };
}

function sanitizeKnowledge(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(-32).map(item => ({
    kind: ['directive', 'fact', 'script'].includes(item.kind) ? item.kind : 'fact',
    key: sanitizeText(item.key, 90) || `fact:${uid()}`,
    label: sanitizeText(item.label, 170) || 'Conocimiento sin etiqueta',
    confidence: clamp(finiteOr(item.confidence, .5), 0, 1),
    source: sanitizeText(item.source, 28) || 'experiencia',
    createdAt: finiteOr(item.createdAt, Date.now()),
    updatedAt: finiteOr(item.updatedAt, item.createdAt ?? Date.now())
  }));
}

function sanitizeDialogue(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(-16).map(item => ({
    role: item.role === 'user' ? 'user' : 'creature',
    text: sanitizeText(item.text, 260),
    at: finiteOr(item.at, Date.now())
  })).filter(item => item.text);
}

function sanitizeExperience(value) {
  return {
    meals: Math.max(0, Math.floor(finiteOr(value?.meals, 0))),
    socialLearns: Math.max(0, Math.floor(finiteOr(value?.socialLearns, 0))),
    userLessons: Math.max(0, Math.floor(finiteOr(value?.userLessons, 0))),
    collaborations: Math.max(0, Math.floor(finiteOr(value?.collaborations, 0))),
    discoveries: Math.max(0, Math.floor(finiteOr(value?.discoveries, 0)))
  };
}

function parseDirective(text) {
  if (/(no ataques|no atacar|evita.*pelea|evita.*conflicto|se pacifico)/.test(text)) return 'avoid_conflict';
  if (/(busca.*comida|busca.*alimento|prioriza.*comida|prioriza.*energia)/.test(text)) return 'prioritize_food';
  if (/(explora mas|explorar mas|investiga|descubre territorio)/.test(text)) return 'explore_more';
  if (/(comparte.*conocimiento|ensena.*grupo|informa.*linaje)/.test(text)) return 'share_knowledge';
  if (/(permanece.*grupo|no te alejes|sigue.*grupo|cerca.*linaje)/.test(text)) return 'stay_group';
  if (/(huye.*peligro|escapa.*antes|evita.*peligro)/.test(text)) return 'flee_early';
  return null;
}

function createEntityName(id, hue) {
  const a = Math.floor(seededUnit(`${id}:${hue}:a`) * NAME_START.length);
  const b = Math.floor(seededUnit(`${id}:${hue}:b`) * NAME_END.length);
  return `${NAME_START[a]}${NAME_END[b]}`;
}

function sanitizeName(value) {
  const clean = String(value ?? '').trim().replace(/[^\p{L}0-9_-]/gu, '').slice(0, 18);
  return clean.length >= 2 ? clean : '';
}

function normalizeText(value) {
  return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function sanitizeText(value, max = 200) {
  return String(value ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(36);
}

function seededUnit(value) {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0) / 4294967295;
}


/* ===== simulation.js ===== */
class Simulation {
  constructor() {
    this.creatures = [];
    this.eggs = [];
    this.food = [];
    this.sanctuaries = [];
    this.species = new Map();
    this.creatureGrid = new SpatialGrid(120);
    this.foodGrid = new SpatialGrid(100);
    this.time = 0;
    this.year = 0;
    this.temperature = 18;
    this.biome = 'origin';
    this.autoBiome = false;
    this.lastBiomeCycleYear = 0;
    this.autonomyLevel = .9;
    this.worldDiscoveries = [];
    this.collective = createCollectiveState();
    this.collectiveSyncTimer = 0;
    this.civilization = new Civilization();
    this.legacy = new LegacyEngine();
    this.grandProjects = new GrandProjectEngine();
    this.paused = false;
    this.speed = 1;
    this.environmentMutation = 1;
    this.foodAbundance = 1;
    this.births = 0;
    this.deaths = 0;
    this.totalBirths = 0;
    this.totalDeaths = 0;
    this.nextSpeciesId = 1;
    this.nextEntityNumber = 1;
    this.events = [];
    this.populationHistory = [];
    this.lastHistoryTime = 0;
    this.lastSpeciesEvent = 0;
    this.genesis = createGenesisState();
    this.workshop = new Workshop();
    this.senseInterval = .1;
    this.onEvent = null;
    this.onSelectionInvalidated = null;
    this.onHatch = null;
  }

  reset() {
    this.creatures.length = 0;
    this.eggs.length = 0;
    this.food.length = 0;
    this.sanctuaries.length = 0;
    this.species.clear();
    this.time = 0;
    this.year = 0;
    this.temperature = 18;
    this.biome = 'origin';
    this.autoBiome = false;
    this.lastBiomeCycleYear = 0;
    this.autonomyLevel = .9;
    this.worldDiscoveries.length = 0;
    this.collective = createCollectiveState();
    this.collectiveSyncTimer = 0;
    this.civilization.reset();
    this.legacy.reset();
    this.grandProjects.reset();
    this.paused = true;
    this.speed = 1;
    this.environmentMutation = 1;
    this.foodAbundance = 1;
    this.births = 0;
    this.deaths = 0;
    this.totalBirths = 0;
    this.totalDeaths = 0;
    this.nextSpeciesId = 1;
    this.nextEntityNumber = 2;
    this.events.length = 0;
    this.populationHistory.length = 0;
    this.lastHistoryTime = 0;
    this.lastSpeciesEvent = 0;
    this.genesis = createGenesisState();
    this.workshop.reset();

    const genome = randomGenome(196);
    genome.speed = 1.08;
    genome.vision = 205;
    genome.size = 4.55;
    genome.metabolism = .64;
    genome.sociability = .88;
    genome.curiosity = .76;
    genome.memory = .92;
    genome.aggression = .12;
    genome.fertility = 1.48;
    genome.efficiency = 1.42;
    genome.longevity = 225;
    genome.mutationRate = .045;
    const speciesId = this.createSpecies(genome, null, 0);
    const x = CONFIG.WORLD_WIDTH / 2;
    const y = CONFIG.WORLD_HEIGHT / 2;
    const egg = this.createEgg({
      x, y, genome, speciesId, generation: 0, parents: [], energy: 126,
      founder: true, name: 'Ω-001', entityCode: 'Ω-001', laidAt: 0, hatchAt: Infinity,
      appearance: null, knowledge: [], bond: .08
    });
    this.genesis.primordialEggId = egg.id;
    this.addFoodBurst(x, y, 150, 250);
    while (this.food.length < CONFIG.INITIAL_FOOD) {
      this.addFood(rand(x - 620, x + 620), rand(y - 440, y + 440), rand(22, 50));
    }
    this.logEvent('Protocolo 0', 'Un único huevo primordial espera la activación. Todo el linaje dependerá de Ω-001.');
    this.rebuildGrids();
  }

  beginGenesis() {
    if (this.genesis.phase !== 'dormant') return false;
    const egg = this.eggs.find(item => item.id === this.genesis.primordialEggId) ?? this.eggs[0];
    if (!egg) return false;
    egg.laidAt = this.time;
    egg.hatchAt = this.time + CONFIG.PRIMORDIAL_HATCH_SECONDS;
    this.genesis.phase = 'incubating';
    this.genesis.startedAt = this.time;
    this.paused = false;
    this.logEvent('Protocolo 1', 'El pulso de activación alcanza el huevo primordial. Comienza la eclosión de Ω-001.');
    return true;
  }

  getBiome() {
    return BIOMES[this.biome] ?? BIOMES.origin;
  }

  setBiome(key, { silent = false } = {}) {
    const next = Object.prototype.hasOwnProperty.call(BIOMES, key) ? key : 'origin';
    if (next === this.biome) return false;
    this.biome = next;
    this.lastBiomeCycleYear = this.year;
    if (!silent) {
      const biome = this.getBiome();
      this.logEvent(`Año ${this.year.toFixed(1)}`, `El mundo cambia: ahora domina ${biome.label}. ${biome.description}`);
    }
    return true;
  }

  updateBiomeCycle() {
    if (!this.autoBiome || this.year - this.lastBiomeCycleYear < CONFIG.AUTO_BIOME_YEARS) return;
    const keys = Object.keys(BIOMES).filter(key => key !== this.biome);
    if (!keys.length) return;
    const index = Math.floor((this.year * 7 + this.totalBirths + this.totalDeaths) % keys.length);
    this.setBiome(keys[index]);
  }

  setAutonomy(value) {
    this.autonomyLevel = clamp(finiteOr(value, .9), .25, 1);
  }

  seedCreatureKnowledge(creature, count = 4) {
    if (!creature || creature.dead) return 0;
    const skill = deriveSkill(creature);
    let learned = 0;
    for (const record of atlasRecordsForSkill(skill, count, creature.id)) {
      const didLearn = creature.learnKnowledge?.({
        kind: 'fact', key: record.key,
        label: `${record.domainLabel}: ${record.label}. ${record.principle}`,
        confidence: .82, createdAt: Date.now()
      }, 'Atlas Ω');
      if (didLearn) learned++;
    }
    return learned;
  }

  injectKnowledgeAtlas() {
    this.collective.atlasLoaded = true;
    this.collective.unlockedKeys = KNOWLEDGE_ATLAS.map(item => item.key);
    let learned = 0;
    for (const creature of this.creatures) learned += this.seedCreatureKnowledge(creature, creature.isFounder ? 8 : 5);
    for (const egg of this.eggs) {
      const records = atlasRecordsForSkill('educador', 3, egg.id);
      const current = Array.isArray(egg.knowledge) ? egg.knowledge : [];
      for (const record of records) {
        if (current.some(item => item?.key === record.key)) continue;
        current.push({ kind: 'fact', key: record.key, label: `${record.domainLabel}: ${record.label}. ${record.principle}`, confidence: .7, source: 'Atlas Ω', createdAt: Date.now() });
      }
      egg.knowledge = current.slice(-12);
    }
    this.collective.injections = Math.min(9999, this.collective.injections + 1);
    this.collective.lastSyncYear = +this.year.toFixed(1);
    this.logEvent(`Año ${this.year.toFixed(1)}`, `Atlas Ω sincronizado: ${KNOWLEDGE_ATLAS.length} cápsulas seguras disponibles y ${learned} aprendizajes individuales reforzados.`);
    return { learned, ...this.getCollectiveMetrics() };
  }

  requestCollectiveProject(type, prompt) {
    const clean = sanitizeCollectivePrompt(prompt);
    return this.workshop.queueProject(type, clean, this);
  }

  syncCollectiveKnowledge() {
    if (!this.collective.enabled || !this.creatures.length) return 0;
    const candidates = this.creatures.filter(creature => creature && !creature.dead);
    if (!candidates.length) return 0;
    const target = candidates[Math.floor((this.time * 7 + this.totalBirths) % candidates.length)];
    const learned = this.seedCreatureKnowledge(target, 1);
    const source = candidates.find(creature => creature !== target && creature.knowledge?.length);
    if (source && target?.learnKnowledge) {
      const item = source.knowledge[Math.floor((this.time + source.age) % source.knowledge.length)];
      target.learnKnowledge(item, 'mente colectiva');
    }
    this.collective.lastSyncYear = +this.year.toFixed(1);
    return learned;
  }

  getCollectiveMetrics() {
    // Caché breve: recorrer todas las criaturas y su conocimiento cuesta hasta ~8 ms con
    // población máxima, y lo llaman la civilización (cada 0,75 s), la UI (cada ~1 s) y el
    // aprendizaje. Los valores son agregados suavizados: 0,35 s de antigüedad es invisible.
    if (this._metricsCache && this.time - this._metricsCache.at < .35 && this._metricsCache.pop === this.creatures.length) {
      return this._metricsCache.value;
    }
    const living = this.creatures.filter(creature => creature && !creature.dead);
    const roles = new Set(living.map(creature => deriveSkill(creature)));
    const keys = new Set(this.collective.unlockedKeys);
    for (const creature of living) for (const item of creature.knowledge || []) if (item?.key) keys.add(item.key);
    const domains = new Set([...keys].map(key => String(key).split(':')[1]).filter(Boolean));
    const collaborations = living.reduce((sum, creature) => sum + Math.max(0, finiteOr(creature.experience?.collaborations, 0)), 0);
    const synergy = clamp((Math.log2(living.length + 1) * .14 + roles.size * .035 + Math.sqrt(collaborations) * .025) * this.autonomyLevel, 0, 1);
    const index = Math.round(Math.min(999, 18 + Math.log2(living.length + 1) * 24 + roles.size * 9 + Math.sqrt(keys.size) * 8 + Math.sqrt(collaborations) * 5 + this.workshop.obras.length * 2));
    const value = {
      population: living.length, roles: roles.size, uniqueKnowledge: keys.size, domains: domains.size,
      synergy, index, queuedProjects: this.workshop.requests.length, activeTeams: this.workshop.teams.filter(team => !team.dissolved).length,
      completedProjects: this.collective.completedProjects
    };
    this._metricsCache = { at: this.time, pop: this.creatures.length, value };
    return value;
  }

  getMutationPressure(multiplier = 1) {
    return Math.max(.01, finiteOr(multiplier, 1) * this.environmentMutation * finiteOr(this.getBiome().mutationFactor, 1));
  }

  recordDiscovery(creature, discovery) {
    if (!creature || !discovery || typeof discovery !== 'object') return false;
    const key = String(discovery.key ?? '').slice(0, 80);
    const label = String(discovery.label ?? '').replace(/[<>]/g, '').slice(0, 180);
    if (!key || !label || this.worldDiscoveries.some(item => item.key === key)) return false;
    const item = {
      id: uid(), key, label,
      creatureId: creature.id,
      creatureCode: creature.entityCode || creature.name,
      biome: this.biome,
      year: +this.year.toFixed(1),
      x: Math.round(clamp(finiteOr(discovery.x, creature.x), 0, CONFIG.WORLD_WIDTH)),
      y: Math.round(clamp(finiteOr(discovery.y, creature.y), 0, CONFIG.WORLD_HEIGHT)),
      createdAt: Date.now()
    };
    this.worldDiscoveries.push(item);
    if (this.worldDiscoveries.length > 120) this.worldDiscoveries.shift();
    if (this.worldDiscoveries.length <= 8 || this.worldDiscoveries.length % 8 === 0) {
      this.logEvent(`Año ${this.year.toFixed(1)}`, `${item.creatureCode} ha descubierto «${item.label}».`);
    }
    return true;
  }

  update(realDt) {
    if (this.paused) return;
    const safeRealDt = clamp(finiteOr(realDt, 0), 0, .1);
    const totalDt = safeRealDt * clamp(finiteOr(this.speed, 1), .25, 24);
    const steps = Math.max(1, Math.ceil(totalDt / .035));
    const dt = totalDt / steps;
    const budgetMs = 24;
    const start = (typeof performance !== 'undefined' ? performance : Date).now();
    let executed = 0;
    for (let step = 0; step < steps; step++) {
      this.step(dt);
      executed++;
      if ((typeof performance !== 'undefined' ? performance : Date).now() - start > budgetMs && executed < steps) {
        this.step(dt * (steps - executed));
        break;
      }
    }
  }

  step(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    this.time += dt;
    this.year = this.time / CONFIG.YEAR_SECONDS;
    this.updateBiomeCycle();
    const biome = this.getBiome();
    this.temperature = biome.temperatureBase
      + Math.sin(this.year * .63) * biome.temperatureSwing
      + Math.sin(this.year * .13) * biome.temperatureSwing * .45;
    this.births = 0;
    this.deaths = 0;
    this.senseInterval = clamp(.08 + this.creatures.length / 5000, .08, .32);
    this.updateEggs();
    this.rebuildGrids();

    const snapshot = this.creatures;
    for (let i = 0; i < snapshot.length; i++) {
      const creature = snapshot[i];
      if (creature instanceof Creature) creature.update(dt, this);
    }
    this.creatures = this.creatures.filter(creature => creature instanceof Creature && !creature.dead);
    this.food = this.food.filter(resource => resource && !resource.eaten && resource.life > 0);
    for (const resource of this.food) resource.life -= dt * .04;
    this.spawnFood(dt);
    this.updateSanctuaries(dt);
    this.pruneSpecies();
    this.updateGenesisPhase();
    this.workshop.update(dt, this);
    this.civilization.update(dt, this);
    this.legacy.update(dt, this);
    this.grandProjects.update(dt, this);
    this.collectiveSyncTimer += dt;
    if (this.collectiveSyncTimer >= 4.5) {
      this.collectiveSyncTimer = 0;
      this.syncCollectiveKnowledge();
    }

    if (this.time - this.lastHistoryTime > 1.2) {
      this.populationHistory.push(this.creatures.length);
      if (this.populationHistory.length > CONFIG.HISTORY_LIMIT) this.populationHistory.shift();
      this.lastHistoryTime = this.time;
    }
  }

  rebuildGrids() {
    this.creatureGrid.clear();
    this.foodGrid.clear();
    for (const creature of this.creatures) if (creature instanceof Creature && !creature.dead) this.creatureGrid.insert(creature);
    for (const resource of this.food) if (resource && !resource.eaten) this.foodGrid.insert(resource);
  }

  spawnFood(dt) {
    const room = Math.max(0, CONFIG.MAX_FOOD - this.food.length);
    const climateFactor = clamp(1 - Math.abs(this.temperature - 18) / 28, .18, 1.2);
    const rate = CONFIG.BASE_FOOD_SPAWN * this.foodAbundance * this.getBiome().foodFactor * climateFactor * dt;
    let count = Math.min(room, Math.floor(rate));
    if (chance(rate - count)) count++;
    for (let i = 0; i < count; i++) this.addFood(rand(0, CONFIG.WORLD_WIDTH), rand(0, CONFIG.WORLD_HEIGHT), rand(16, 42));
  }

  addFood(x, y, energy = 28) {
    if (this.food.length >= CONFIG.MAX_FOOD) return false;
    const safeEnergy = clamp(finiteOr(energy, 28), 1, 120);
    this.food.push({
      id: uid(), x: clamp(finiteOr(x, 0), 0, CONFIG.WORLD_WIDTH), y: clamp(finiteOr(y, 0), 0, CONFIG.WORLD_HEIGHT),
      energy: safeEnergy, radius: 2.3 + safeEnergy * .025, life: rand(100, 260), eaten: false
    });
    return true;
  }

  addFoodBurst(x, y, amount = 45, radius = 120) {
    const safeAmount = Math.min(250, Math.max(0, Math.floor(finiteOr(amount, 45))));
    const safeRadius = clamp(finiteOr(radius, 120), 0, 500);
    for (let i = 0; i < safeAmount; i++) {
      const angle = rand(0, Math.PI * 2);
      const distance = Math.sqrt(Math.random()) * safeRadius;
      this.addFood(
        clamp(x + Math.cos(angle) * distance, 0, CONFIG.WORLD_WIDTH),
        clamp(y + Math.sin(angle) * distance, 0, CONFIG.WORLD_HEIGHT),
        rand(20, 48)
      );
    }
  }

  consumeFood(creature, resource) {
    if (!creature || !resource || resource.eaten) return;
    resource.eaten = true;
    creature.energy = Math.min(creature.maxEnergy, creature.energy + resource.energy * creature.genome.efficiency);
    creature.lastMeal = 0;
    if (creature.experience) creature.experience.meals++;
  }

  createEgg(data = {}) {
    if (this.eggs.length >= CONFIG.MAX_EGGS || this.creatures.length + this.eggs.length >= CONFIG.MAX_CREATURES) return null;
    const source = data && typeof data === 'object' ? data : {};
    const laidAt = Math.max(0, finiteOr(source.laidAt, this.time));
    const defaultIncubation = rand(CONFIG.EGG_INCUBATION_MIN, CONFIG.EGG_INCUBATION_MAX);
    const hatchAt = source.hatchAt === Infinity ? Infinity : Math.max(laidAt + .5, finiteOr(source.hatchAt, laidAt + defaultIncubation));
    const egg = {
      id: typeof source.id === 'string' && source.id ? source.id : uid(),
      x: clamp(finiteOr(source.x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH),
      y: clamp(finiteOr(source.y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT),
      genome: sanitizeGenome(source.genome),
      speciesId: Math.max(1, Math.floor(finiteOr(source.speciesId, 1))),
      generation: Math.max(0, Math.floor(finiteOr(source.generation, 0))),
      parents: Array.isArray(source.parents) ? source.parents.filter(id => typeof id === 'string').slice(0, 2) : [],
      energy: clamp(finiteOr(source.energy, 62), 20, 200),
      appearance: source.appearance && typeof source.appearance === 'object' ? source.appearance : null,
      knowledge: Array.isArray(source.knowledge) ? source.knowledge : [],
      bond: clamp(finiteOr(source.bond, 0), 0, 1),
      founder: Boolean(source.founder),
      name: typeof source.name === 'string' ? source.name.slice(0, 24) : '',
      entityCode: typeof source.entityCode === 'string' ? source.entityCode : this.allocateEntityCode(),
      laidAt,
      hatchAt,
      wobble: rand(0, Math.PI * 2)
    };
    this.eggs.push(egg);
    return egg;
  }

  allocateEntityCode() {
    const code = `Ω-${String(this.nextEntityNumber).padStart(3, '0')}`;
    this.nextEntityNumber++;
    return code;
  }

  updateEggs() {
    if (!this.eggs.length) return;
    const ready = this.eggs.filter(egg => Number.isFinite(egg.hatchAt) && this.time >= egg.hatchAt);
    if (!ready.length) return;
    for (const egg of ready) this.hatchEgg(egg);
    const ids = new Set(ready.map(egg => egg.id));
    this.eggs = this.eggs.filter(egg => !ids.has(egg.id));
  }

  hatchEgg(egg) {
    if (!egg || this.creatures.length >= CONFIG.MAX_CREATURES) return null;
    const creature = new Creature({
      x: egg.x + rand(-5, 5), y: egg.y + rand(-5, 5), genome: egg.genome, speciesId: egg.speciesId,
      generation: egg.generation, parents: egg.parents, energy: egg.energy, appearance: egg.appearance,
      knowledge: egg.knowledge, bond: egg.bond, isFounder: egg.founder,
      name: egg.name || undefined, entityCode: egg.entityCode, reproductionCooldown: egg.founder ? 2 : rand(3, 7)
    });
    deriveSkill(creature);
    this.seedCreatureKnowledge(creature, egg.founder ? 8 : 3);
    this.creatures.push(creature);
    this.births++;
    this.totalBirths++;
    const species = this.species.get(creature.speciesId);
    if (species) {
      species.births++;
      species.extinct = false;
      species.maxGeneration = Math.max(species.maxGeneration, creature.generation);
    }
    if (egg.founder) {
      this.genesis.founderId = creature.id;
      this.genesis.phase = 'childhood';
      this.logEvent(`Año ${this.year.toFixed(1)}`, 'Ω-001 ha eclosionado. Es el único ser vivo y el origen de todas las generaciones futuras.');
      this.civilization.recordChronicle(this.year, 'origen', 'Ω-001 despierta. Comienza la historia consciente del linaje.', creature.id);
    } else {
      if (!this.genesis.firstDescendantId && creature.generation > 0) {
        this.genesis.firstDescendantId = creature.id;
        this.logEvent(`Año ${this.year.toFixed(1)}`, `${creature.entityCode} ha nacido. Por primera vez, Ω-001 ya no está solo.`);
        this.civilization.recordChronicle(this.year, 'linaje', `${creature.entityCode} nace. La memoria ya puede viajar entre dos seres.`, creature.id);
      } else {
        this.logEvent(`Año ${this.year.toFixed(1)}`, `Ha nacido ${creature.entityCode}, generación ${creature.generation}.`);
      }
    }
    if ([10, 25, 50, 100, 250, 500].includes(this.totalBirths)) {
      this.civilization.recordChronicle(this.year, 'población', `El linaje alcanza ${this.totalBirths} nacimientos acumulados.`, String(this.totalBirths));
    }
    this.legacy?.onBirth?.(creature, this);
    this.onHatch?.(creature, egg);
    return creature;
  }

  tryPrimordialReproduction(creature) {
    if (!creature?.isFounder || this.creatures.length !== 1 || this.eggs.length || this.genesis.phase === 'dormant' || this.genesis.phase === 'incubating') return false;
    if (creature.age < creature.maturity + 3.2 || creature.reproductionCooldown > 0 || creature.energy < creature.maxEnergy * .72) return false;
    const genome = mutateGenome(creature.genome, this.getMutationPressure(.52));
    const egg = this.createEgg({
      x: creature.x + rand(-10, 10), y: creature.y + rand(-10, 10), genome, speciesId: creature.speciesId,
      generation: 1, parents: [creature.id], energy: 64,
      appearance: combineAppearances(creature.appearance, creature.appearance, this.getMutationPressure(.65)),
      knowledge: inheritKnowledge(creature.knowledge, creature.knowledge, genome.memory),
      bond: creature.bond * .22
    });
    if (!egg) return false;
    creature.energy -= 24;
    creature.reproductionCooldown = 10 / Math.max(.35, creature.genome.fertility);
    this.genesis.phase = 'firstEgg';
    this.logEvent(`Año ${this.year.toFixed(1)}`, `Ω-001 ha generado el primer huevo descendiente (${egg.entityCode}) mediante génesis adaptativa.`);
    return true;
  }

  reproduce(a, b) {
    if (this.creatures.length + this.eggs.length >= CONFIG.MAX_CREATURES || !a || !b || a === b || a.dead || b.dead || a.reproductionCooldown > 0 || b.reproductionCooldown > 0) return null;
    const cost = 19 + (a.genome.size + b.genome.size) * 1.15;
    if (a.energy < cost || b.energy < cost || a.age < a.maturity || b.age < b.maturity) return null;
    const genome = combineGenomes(a.genome, b.genome, this.getMutationPressure());
    let speciesId = a.speciesId;
    const species = this.species.get(speciesId);
    if (!species || geneticDistance(genome, species.founderGenome) > CONFIG.SPECIES_THRESHOLD) {
      speciesId = this.findClosestSpecies(genome) ?? this.createSpecies(genome, a.speciesId, Math.max(a.generation, b.generation) + 1);
    }
    const egg = this.createEgg({
      x: (a.x + b.x) * .5 + rand(-8, 8), y: (a.y + b.y) * .5 + rand(-8, 8), genome, speciesId,
      generation: Math.max(a.generation, b.generation) + 1, parents: [a.id, b.id], energy: 60,
      appearance: combineAppearances(a.appearance, b.appearance, this.getMutationPressure()),
      knowledge: inheritKnowledge(a.knowledge, b.knowledge, genome.memory),
      bond: Math.max(a.bond ?? 0, b.bond ?? 0) * .16
    });
    if (!egg) return null;
    a.energy -= cost * .55;
    b.energy -= cost * .55;
    a.reproductionCooldown = 4.8 / a.genome.fertility + rand(0, 1.5);
    b.reproductionCooldown = 4.8 / b.genome.fertility + rand(0, 1.5);
    return egg.id;
  }

  createSpecies(founderGenome, parentSpeciesId = null, generation = 0) {
    const id = this.nextSpeciesId++;
    this.species.set(id, {
      id, founderGenome: sanitizeGenome(founderGenome), parentSpeciesId,
      bornYear: this.year, births: 0, deaths: 0, maxGeneration: Math.max(0, Math.floor(generation)), extinct: false
    });
    if (parentSpeciesId !== null) {
      this.logEvent(`Año ${this.year.toFixed(1)}`, `Especiación detectada: el Linaje ${String(id).padStart(2, '0')} se separa del Linaje ${String(parentSpeciesId).padStart(2, '0')}.`);
    }
    return id;
  }

  findClosestSpecies(genome) {
    let closest = null;
    let best = Infinity;
    for (const [id, species] of this.species) {
      if (!species || species.extinct) continue;
      const distance = geneticDistance(genome, species.founderGenome);
      if (distance < best) { best = distance; closest = id; }
    }
    return best < CONFIG.SPECIES_THRESHOLD * .76 ? closest : null;
  }

  killCreature(creature, cause) {
    if (!creature || creature.dead) return;
    creature.dead = true;
    this.deaths++;
    this.totalDeaths++;
    const species = this.species.get(creature.speciesId);
    if (species) species.deaths++;
    this.legacy?.onDeath?.(creature, cause, this);
    this.onSelectionInvalidated?.(creature.id);
    if (cause === 'meteorito' && chance(.04)) this.addFood(creature.x, creature.y, 15);
  }

  pruneSpecies() {
    if (this.time - this.lastSpeciesEvent < 3) return;
    const counts = new Map();
    for (const creature of this.creatures) counts.set(creature.speciesId, (counts.get(creature.speciesId) ?? 0) + 1);
    for (const egg of this.eggs) counts.set(egg.speciesId, (counts.get(egg.speciesId) ?? 0) + 1);
    for (const [id, species] of this.species) {
      if (species && !species.extinct && !counts.has(id)) {
        species.extinct = true;
        this.logEvent(`Año ${this.year.toFixed(1)}`, `El Linaje ${String(id).padStart(2, '0')} se ha extinguido.`);
        this.civilization.recordChronicle(this.year, 'extinción', `El Linaje ${String(id).padStart(2, '0')} desaparece del mundo.`, String(id));
        this.lastSpeciesEvent = this.time;
      }
    }
  }

  updateGenesisPhase() {
    if (this.genesis.phase === 'dormant' || this.genesis.phase === 'incubating') return;
    if (!this.creatures.length && !this.eggs.length) {
      if (this.genesis.phase !== 'extinct') this.civilization.recordChronicle(this.year, 'extinción total', 'No queda ningún ser ni huevo. La historia del mundo se detiene.', 'world');
      this.genesis.phase = 'extinct';
      return;
    }
    const founder = this.creatures.find(item => item.id === this.genesis.founderId || item.isFounder);
    if (this.creatures.length >= 2) this.genesis.phase = 'lineage';
    else if (this.eggs.length) this.genesis.phase = 'firstEgg';
    else if (founder && founder.age < founder.maturity) this.genesis.phase = 'childhood';
    else if (founder) this.genesis.phase = 'solitary';
  }

  getGenesisStatus() {
    const founder = this.creatures.find(item => item.id === this.genesis.founderId || item.isFounder);
    const primordial = this.eggs.find(item => item.id === this.genesis.primordialEggId);
    const firstEgg = this.eggs[0];
    if (this.genesis.phase === 'dormant') return { label: 'Huevo primordial', hint: 'Activa el protocolo para despertar a Ω-001.', progress: 0 };
    if (this.genesis.phase === 'incubating') {
      const progress = primordial ? clamp((this.time - primordial.laidAt) / Math.max(.1, primordial.hatchAt - primordial.laidAt), 0, 1) : 1;
      return { label: 'Eclosión de Ω-001', hint: 'El primer ser está formando cuerpo, memoria y voz.', progress };
    }
    if (this.genesis.phase === 'childhood' && founder) return { label: 'Infancia de Ω-001', hint: 'Está aprendiendo a sobrevivir. Háblale y enséñale.', progress: clamp(founder.age / founder.maturity, 0, 1) };
    if (this.genesis.phase === 'solitary' && founder) return { label: 'El primer ser', hint: 'Ω-001 está maduro. Si prospera, generará el primer descendiente.', progress: clamp((founder.energy / founder.maxEnergy - .45) / .4, 0, 1) };
    if (this.genesis.phase === 'firstEgg' && firstEgg) return { label: `Gestación de ${firstEgg.entityCode}`, hint: 'El segundo ser heredará genes, apariencia y parte de la cultura.', progress: clamp((this.time - firstEgg.laidAt) / Math.max(.1, firstEgg.hatchAt - firstEgg.laidAt), 0, 1) };
    if (this.genesis.phase === 'lineage') return { label: 'Linaje en expansión', hint: `${this.creatures.length} seres vivos y ${this.eggs.length} huevos activos.`, progress: clamp(this.creatures.length / 50, 0, 1) };
    return { label: 'Linaje extinguido', hint: 'Puedes reiniciar el mundo o crear un nuevo huevo desde Código Ω.', progress: 0 };
  }

  activeSpeciesCount() { return new Set([...this.creatures.map(creature => creature.speciesId), ...this.eggs.map(egg => egg.speciesId)]).size; }
  maxGeneration() {
    const living = [...this.creatures, ...this.eggs].reduce((max, item) => Math.max(max, item.generation ?? 0), 0);
    const recorded = [...this.species.values()].reduce((max, item) => Math.max(max, item?.maxGeneration ?? 0), 0);
    return Math.max(living, recorded);
  }

  diversity() {
    if (this.creatures.length < 2) return 0;
    const samples = Math.min(80, this.creatures.length * 2);
    let total = 0;
    for (let i = 0; i < samples; i++) {
      const a = this.creatures[randInt(0, this.creatures.length - 1)];
      const b = this.creatures[randInt(0, this.creatures.length - 1)];
      total += geneticDistance(a.genome, b.genome);
    }
    return clamp(total / samples / .45, 0, 1);
  }

  applyRadiation(x, y, radius = 180) {
    let affected = 0;
    const origin = { x, y };
    for (const creature of this.creatures) {
      if (distanceSq(creature, origin) < radius * radius) {
        creature.genome = mutateGenome(creature.genome, this.getMutationPressure(1.8));
        creature.energy -= rand(3, 16);
        affected++;
      }
    }
    for (const egg of this.eggs) {
      if (distanceSq(egg, origin) < radius * radius) { egg.genome = mutateGenome(egg.genome, this.getMutationPressure(1.35)); affected++; }
    }
    this.logEvent(`Año ${this.year.toFixed(1)}`, `Pulso radiactivo: ${affected} organismos o huevos alterados genéticamente.`);
    return affected;
  }

  applyMeteor(x, y, radius = 130) {
    let dead = 0;
    const origin = { x, y };
    for (const creature of this.creatures) {
      if (distanceSq(creature, origin) < radius * radius) { this.killCreature(creature, 'meteorito'); dead++; }
    }
    const eggCount = this.eggs.length;
    this.eggs = this.eggs.filter(egg => distanceSq(egg, origin) > radius * radius);
    dead += eggCount - this.eggs.length;
    this.creatures = this.creatures.filter(creature => !creature.dead);
    this.food = this.food.filter(resource => distanceSq(resource, origin) > radius * radius);
    this.logEvent(`Año ${this.year.toFixed(1)}`, `Impacto de meteorito: ${dead} vidas o gestaciones perdidas.`);
    return dead;
  }

  addSanctuary(x, y) {
    this.sanctuaries.push({ x: clamp(x, 0, CONFIG.WORLD_WIDTH), y: clamp(y, 0, CONFIG.WORLD_HEIGHT), radius: 150, life: 60 });
    this.addFoodBurst(x, y, 85, 145);
    this.logEvent(`Año ${this.year.toFixed(1)}`, 'Se ha creado un santuario de alta fertilidad.');
  }

  updateSanctuaries(dt) {
    for (const sanctuary of this.sanctuaries) {
      sanctuary.life -= dt;
      if (chance(dt * 2.4 * this.foodAbundance)) {
        this.addFood(sanctuary.x + rand(-sanctuary.radius, sanctuary.radius), sanctuary.y + rand(-sanctuary.radius, sanctuary.radius), rand(25, 50));
      }
    }
    this.sanctuaries = this.sanctuaries.filter(sanctuary => sanctuary.life > 0);
  }

  spawnCreature(x, y, templateGenome = null) {
    if (this.creatures.length + this.eggs.length >= CONFIG.MAX_CREATURES) return null;
    const safeX = clamp(finiteOr(x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH);
    const safeY = clamp(finiteOr(y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT);
    const genome = templateGenome ? sanitizeGenome(templateGenome) : randomGenome();
    const speciesId = this.createSpecies(genome, null, 0);
    const egg = this.createEgg({ x: safeX, y: safeY, genome: mutateGenome(genome, this.getMutationPressure(.12)), speciesId, generation: 0, energy: 96, laidAt: this.time, hatchAt: this.time + 3.4 });
    if (!egg) return null;
    this.addFoodBurst(safeX, safeY, 24, 75);
    this.logEvent(`Año ${this.year.toFixed(1)}`, `Intervención externa: el huevo ${egg.entityCode} contiene el Linaje ${String(speciesId).padStart(2, '0')}.`);
    return speciesId;
  }

  evolutionaryPulse() {
    let mutations = 0;
    for (const creature of this.creatures) {
      if (chance(.22)) { creature.genome = mutateGenome(creature.genome, this.getMutationPressure(.7)); mutations++; }
    }
    for (const egg of this.eggs) {
      if (chance(.3)) { egg.genome = mutateGenome(egg.genome, this.getMutationPressure(.55)); mutations++; }
    }
    this.logEvent(`Año ${this.year.toFixed(1)}`, `Pulso evolutivo global: ${mutations} genomas han cambiado.`);
    return mutations;
  }

  logEvent(time, text) {
    const event = { id: uid(), time: String(time).slice(0, 80), text: String(text).slice(0, 500), timestamp: Date.now() };
    this.events.unshift(event);
    if (this.events.length > CONFIG.TIMELINE_LIMIT) this.events.pop();
    this.onEvent?.(event);
  }

  serialize() {
    return {
      version: 11, savedAt: new Date().toISOString(), time: this.time, year: this.year, temperature: this.temperature,
      paused: this.paused, speed: this.speed, environmentMutation: this.environmentMutation, foodAbundance: this.foodAbundance,
      biome: this.biome, autoBiome: this.autoBiome, lastBiomeCycleYear: this.lastBiomeCycleYear,
      autonomyLevel: this.autonomyLevel, worldDiscoveries: this.worldDiscoveries, collective: this.collective,
      nextSpeciesId: this.nextSpeciesId, nextEntityNumber: this.nextEntityNumber, totalBirths: this.totalBirths, totalDeaths: this.totalDeaths,
      genesis: this.genesis, events: this.events, populationHistory: this.populationHistory, species: [...this.species.entries()],
      creatures: this.creatures.map(creature => creature.serialize()), eggs: this.eggs, food: this.food, sanctuaries: this.sanctuaries,
      workshop: this.workshop.serialize(), civilization: this.civilization.serialize(), legacy: this.legacy.serialize(), grandProjects: this.grandProjects.serialize()
    };
  }

  hydrate(data) {
    if (!data || typeof data !== 'object' || ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(Number(data.version)) || !Array.isArray(data.creatures)) {
      throw new Error('Formato de mundo incompatible');
    }

    const creatures = data.creatures
      .filter(candidate => candidate && typeof candidate === 'object')
      .slice(0, CONFIG.MAX_CREATURES)
      .map(candidate => new Creature(candidate))
      .filter(creature => Number.isFinite(creature.x) && Number.isFinite(creature.y) && !creature.dead);
    const eggs = sanitizeEggs(data.eggs);

    const species = new Map();
    if (Array.isArray(data.species)) {
      for (const entry of data.species) {
        if (!Array.isArray(entry) || entry.length !== 2 || !entry[1] || typeof entry[1] !== 'object') continue;
        const id = Math.max(1, Math.floor(finiteOr(entry[0], entry[1].id)));
        if (!Number.isFinite(id)) continue;
        const source = entry[1];
        species.set(id, {
          id, founderGenome: sanitizeGenome(source.founderGenome),
          parentSpeciesId: source.parentSpeciesId == null ? null : Math.max(1, Math.floor(finiteOr(source.parentSpeciesId, 1))),
          bornYear: Math.max(0, finiteOr(source.bornYear, 0)), births: Math.max(0, Math.floor(finiteOr(source.births, 0))),
          deaths: Math.max(0, Math.floor(finiteOr(source.deaths, 0))), maxGeneration: Math.max(0, Math.floor(finiteOr(source.maxGeneration, 0))),
          extinct: Boolean(source.extinct)
        });
      }
    }

    for (const item of [...creatures, ...eggs]) {
      if (!species.has(item.speciesId)) {
        species.set(item.speciesId, {
          id: item.speciesId, founderGenome: { ...item.genome }, parentSpeciesId: null,
          bornYear: 0, births: 0, deaths: 0, maxGeneration: item.generation, extinct: false
        });
      }
    }

    this.time = Math.max(0, finiteOr(data.time, 0));
    this.year = Math.max(0, finiteOr(data.year, this.time / CONFIG.YEAR_SECONDS));
    this.temperature = clamp(finiteOr(data.temperature, 18), -80, 100);
    this.biome = Object.prototype.hasOwnProperty.call(BIOMES, data.biome) ? data.biome : 'origin';
    this.autoBiome = Boolean(data.autoBiome);
    this.lastBiomeCycleYear = Math.max(0, finiteOr(data.lastBiomeCycleYear, this.year));
    this.autonomyLevel = clamp(finiteOr(data.autonomyLevel, .9), .25, 1);
    this.worldDiscoveries = sanitizeDiscoveries(data.worldDiscoveries);
    this.collective = createCollectiveState(data.collective);
    this.collectiveSyncTimer = 0;
    this.paused = Boolean(data.paused);
    this.speed = [1, 4, 12].includes(Number(data.speed)) ? Number(data.speed) : 1;
    this.environmentMutation = clamp(finiteOr(data.environmentMutation, 1), .2, 8);
    this.foodAbundance = clamp(finiteOr(data.foodAbundance, 1), .25, 3);
    this.nextSpeciesId = Math.max(Math.floor(finiteOr(data.nextSpeciesId, 1)), Math.max(0, ...species.keys()) + 1);
    this.nextEntityNumber = Math.max(1, Math.floor(finiteOr(data.nextEntityNumber, inferNextEntityNumber(creatures, eggs))));
    this.totalBirths = Math.max(0, Math.floor(finiteOr(data.totalBirths, creatures.length)));
    this.totalDeaths = Math.max(0, Math.floor(finiteOr(data.totalDeaths, 0)));
    this.genesis = sanitizeGenesis(data.genesis, creatures, eggs);
    this.workshop.hydrate(data.workshop);
    this.civilization.hydrate(data.civilization);
    this.events = sanitizeEvents(data.events);
    this.populationHistory = Array.isArray(data.populationHistory)
      ? data.populationHistory.map(value => Math.max(0, Math.floor(finiteOr(value, 0)))).slice(-CONFIG.HISTORY_LIMIT)
      : [];
    this.species = species;
    this.creatures = creatures;
    this.eggs = eggs;
    this.food = sanitizeFood(data.food);
    this.sanctuaries = sanitizeSanctuaries(data.sanctuaries);
    this.legacy.hydrate(data.legacy);
    this.grandProjects.hydrate(data.grandProjects);
    for (const creature of this.creatures) deriveSkill(creature);
    this.births = 0;
    this.deaths = 0;
    this.lastHistoryTime = this.time;
    this.lastSpeciesEvent = this.time;
    if (this.genesis.phase === 'dormant') this.paused = true;
    this.rebuildGrids();
  }
}

function createCollectiveState(value = {}) {
  const unlocked = Array.isArray(value?.unlockedKeys)
    ? [...new Set(value.unlockedKeys.filter(key => typeof key === 'string').map(key => key.slice(0, 90)).filter(key => atlasRecordByKey(key)))].slice(0, KNOWLEDGE_ATLAS.length)
    : KNOWLEDGE_ATLAS.map(item => item.key);
  return {
    enabled: value?.enabled !== false,
    atlasLoaded: value?.atlasLoaded !== false,
    unlockedKeys: unlocked.length ? unlocked : KNOWLEDGE_ATLAS.map(item => item.key),
    injections: Math.max(0, Math.floor(finiteOr(value?.injections, 1))),
    completedProjects: Math.max(0, Math.floor(finiteOr(value?.completedProjects, 0))),
    lastSyncYear: Math.max(0, finiteOr(value?.lastSyncYear, 0))
  };
}

function createGenesisState() {
  return { phase: 'dormant', primordialEggId: null, founderId: null, firstDescendantId: null, startedAt: null };
}

function sanitizeGenesis(value, creatures, eggs) {
  const valid = new Set(['dormant', 'incubating', 'childhood', 'solitary', 'firstEgg', 'lineage', 'extinct']);
  const founder = creatures.find(item => item.isFounder) ?? creatures[0] ?? null;
  const primordial = eggs.find(item => item.founder) ?? eggs[0] ?? null;
  const phase = valid.has(value?.phase) ? value.phase : creatures.length >= 2 ? 'lineage' : creatures.length === 1 ? (creatures[0].age < creatures[0].maturity ? 'childhood' : 'solitary') : eggs.length ? (primordial?.founder ? 'incubating' : 'firstEgg') : 'extinct';
  return {
    phase,
    primordialEggId: typeof value?.primordialEggId === 'string' ? value.primordialEggId : primordial?.id ?? null,
    founderId: typeof value?.founderId === 'string' ? value.founderId : founder?.id ?? null,
    firstDescendantId: typeof value?.firstDescendantId === 'string' ? value.firstDescendantId : creatures.find(item => item.generation > 0)?.id ?? null,
    startedAt: value?.startedAt == null ? null : Math.max(0, finiteOr(value.startedAt, 0))
  };
}

function inferNextEntityNumber(creatures, eggs) {
  let max = 0;
  for (const item of [...creatures, ...eggs]) {
    const match = String(item.entityCode ?? '').match(/^Ω-(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max + 1;
}

function sanitizeEggs(eggs) {
  if (!Array.isArray(eggs)) return [];
  return eggs.filter(item => item && typeof item === 'object').slice(0, CONFIG.MAX_EGGS).map(item => ({
    id: typeof item.id === 'string' && item.id ? item.id : uid(),
    x: clamp(finiteOr(item.x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH),
    y: clamp(finiteOr(item.y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT),
    genome: sanitizeGenome(item.genome), speciesId: Math.max(1, Math.floor(finiteOr(item.speciesId, 1))),
    generation: Math.max(0, Math.floor(finiteOr(item.generation, 0))),
    parents: Array.isArray(item.parents) ? item.parents.filter(id => typeof id === 'string').slice(0, 2) : [],
    energy: clamp(finiteOr(item.energy, 62), 20, 200), appearance: item.appearance && typeof item.appearance === 'object' ? item.appearance : null,
    knowledge: Array.isArray(item.knowledge) ? item.knowledge : [], bond: clamp(finiteOr(item.bond, 0), 0, 1),
    founder: Boolean(item.founder), name: typeof item.name === 'string' ? item.name.slice(0, 24) : '',
    entityCode: typeof item.entityCode === 'string' ? item.entityCode.slice(0, 20) : '',
    laidAt: Math.max(0, finiteOr(item.laidAt, 0)),
    hatchAt: item.hatchAt === Infinity ? Infinity : Math.max(0, finiteOr(item.hatchAt, 6)),
    wobble: finiteOr(item.wobble, 0)
  }));
}

function sanitizeEvents(events) {
  if (!Array.isArray(events)) return [];
  return events.filter(event => event && typeof event === 'object').slice(0, CONFIG.TIMELINE_LIMIT).map(event => ({
    id: typeof event.id === 'string' ? event.id : uid(),
    time: String(event.time ?? 'Registro').slice(0, 80),
    text: String(event.text ?? '').slice(0, 500),
    timestamp: finiteOr(event.timestamp, Date.now())
  }));
}

function sanitizeFood(food) {
  if (!Array.isArray(food)) return [];
  return food.filter(resource => resource && typeof resource === 'object')
    .slice(0, CONFIG.MAX_FOOD)
    .map(resource => {
      const energy = clamp(finiteOr(resource.energy, 28), 1, 120);
      return {
        id: typeof resource.id === 'string' ? resource.id : uid(),
        x: clamp(finiteOr(resource.x, 0), 0, CONFIG.WORLD_WIDTH), y: clamp(finiteOr(resource.y, 0), 0, CONFIG.WORLD_HEIGHT),
        energy, radius: clamp(finiteOr(resource.radius, 2.3 + energy * .025), 1, 20),
        life: clamp(finiteOr(resource.life, 100), 0, 1000), eaten: Boolean(resource.eaten)
      };
    })
    .filter(resource => !resource.eaten && resource.life > 0);
}

function sanitizeSanctuaries(sanctuaries) {
  if (!Array.isArray(sanctuaries)) return [];
  return sanctuaries.filter(item => item && typeof item === 'object').slice(0, 50).map(item => ({
    x: clamp(finiteOr(item.x, 0), 0, CONFIG.WORLD_WIDTH), y: clamp(finiteOr(item.y, 0), 0, CONFIG.WORLD_HEIGHT),
    radius: clamp(finiteOr(item.radius, 150), 20, 500), life: clamp(finiteOr(item.life, 60), 0, 600)
  })).filter(item => item.life > 0);
}

function sanitizeDiscoveries(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(-120).map(item => ({
    id: typeof item.id === 'string' ? item.id.slice(0, 40) : uid(),
    key: String(item.key ?? '').slice(0, 80),
    label: String(item.label ?? '').replace(/[<>]/g, '').slice(0, 180),
    creatureId: typeof item.creatureId === 'string' ? item.creatureId.slice(0, 40) : '',
    creatureCode: String(item.creatureCode ?? 'Entidad').replace(/[<>]/g, '').slice(0, 40),
    biome: Object.prototype.hasOwnProperty.call(BIOMES, item.biome) ? item.biome : 'origin',
    year: Math.max(0, finiteOr(item.year, 0)),
    x: Math.round(clamp(finiteOr(item.x, 0), 0, CONFIG.WORLD_WIDTH)),
    y: Math.round(clamp(finiteOr(item.y, 0), 0, CONFIG.WORLD_HEIGHT)),
    createdAt: Math.max(0, finiteOr(item.createdAt, 0))
  })).filter(item => item.key && item.label);
}


/* ===== eldritch-sprites.js ===== */
// Sistema de especies lovecraftianas con siluetas 16-bit radicalmente distintas.
// El ARQUETIPO se deriva del genoma (emergente de la evolución): dos criaturas de
// linajes diferentes tienen formas totalmente distintas. Al mutar y crear especies
// nuevas, un linaje puede derivar de un arquetipo a otro.

const GRID = 34;

const ARCHETYPES = [
  { id: 'cthulhu',    name: 'Estirpe de Cthulhu',   hueBase: 150 },
  { id: 'shoggoth',   name: 'Shoggoth',             hueBase: 265 },
  { id: 'migo',       name: 'Mi-Go de Yuggoth',     hueBase: 340 },
  { id: 'elderthing', name: 'Primigenio Estrella',  hueBase: 190 },
  { id: 'deep',       name: 'Profundo',             hueBase: 175 },
  { id: 'yith',       name: 'Gran Raza de Yith',    hueBase: 45  },
  { id: 'ghoul',      name: 'Gul',                  hueBase: 25  },
  { id: 'dagon',      name: 'Coloso de Dagon',      hueBase: 205 },
  { id: 'polyp',      name: 'Pólipo Volante',       hueBase: 290 },
  { id: 'yog',        name: 'Prole de Yog-Sothoth', hueBase: 110 }
];

const ARCHETYPE_IDS = ARCHETYPES.map(a => a.id);

function archetypeName(id) {
  return ARCHETYPES.find(a => a.id === id)?.name ?? 'Entidad';
}

// Deriva el arquetipo desde el genoma. Estable: mismos genes -> mismo arquetipo.
// Cada puntuación se normaliza a ~[0,1] para que los 10 arquetipos tengan oportunidad pareja.
function archetypeFor(creature) {
  const g = creature.genome;
  const a = creature.appearance;
  const n = (v, min, max) => Math.max(0, Math.min(1, (v - min) / (max - min)));
  const scores = {
    cthulhu:    n(g.size, 2.5, 8.5) * .6 + g.aggression * .3 + n(a.earSize, .72, 1.55) * .3,
    shoggoth:   n(a.fluff, .65, 1.45) * .6 + (1 - n(g.vision, 55, 260)) * .3 + n(g.metabolism, .45, 1.85) * .2,
    migo:       n(g.speed, .45, 2.4) * .5 + n(g.efficiency, .35, 1.6) * .4 + g.curiosity * .3,
    elderthing: n(g.vision, 55, 260) * .6 + g.memory * .3 + n(g.longevity, 70, 260) * .3,
    deep:       g.sociability * .6 + (1 - g.aggression) * .3 + hueBand(g.hue, 175) * .5,
    yith:       g.memory * .6 + g.curiosity * .4 + n(g.longevity, 70, 260) * .3,
    ghoul:      g.aggression * .55 + n(g.metabolism, .45, 1.85) * .3 + a.darkness * .5,
    dagon:      n(g.size, 2.5, 8.5) * .7 + n(g.longevity, 70, 260) * .2 + (1 - n(g.speed, .45, 2.4)) * .3,
    polyp:      n(g.speed, .45, 2.4) * .5 + n(a.eyeSize, .78, 1.42) * .5 + hueBand(g.hue, 290) * .5,
    yog:        n(a.eyeSize, .78, 1.42) * .5 + n(g.mutationRate, .01, .16) * .4 + n(g.fertility, .35, 1.85) * .3
  };
  const bias = hashUnit(creature.id + ':arch');
  let best = 'cthulhu', bestScore = -Infinity;
  ARCHETYPE_IDS.forEach((id, i) => {
    const s = scores[id] + ((bias * 10 + i) % 1) * .25;
    if (s > bestScore) { bestScore = s; best = id; }
  });
  return best;
}

function paletteFor(archetype, hue, darkness, accentHue) {
  const rot = Math.max(0, Math.min(1, darkness));
  const base = ARCHETYPES.find(a => a.id === archetype)?.hueBase ?? hue;
  const h = (base * .6 + hue * .4);
  return {
    dark:   hslPix(h + 8, 42, Math.max(6, 14 - rot * 6)),
    body:   hslPix(h, 34, 28 - rot * 10),
    mid:    hslPix(h - 6, 30, 36 - rot * 8),
    light:  hslPix(h - 12, 26, Math.min(60, 46 - rot * 6)),
    flesh:  mix(hslPix(h + 24, 28, 34), hslPix(325, 32, 30), .4),
    glow:   hslPix(accentHue, 92, 60),
    eye:    hslPix(accentHue + 10, 96, 66),
    eyeDk:  hslPix(accentHue - 25, 82, 20),
    outline:'#04050a'
  };
}

function paintEldritchSprite(canvas, creature, detail) {
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, canvas.width, canvas.height);
  g.imageSmoothingEnabled = false;
  const px = canvas.width / GRID;
  const archetype = creature._archetype || (creature._archetype = archetypeFor(creature));
  const pal = paletteFor(archetype, creature.genome.hue, creature.appearance.darkness, creature.appearance.accentHue);
  const cells = new Array(GRID * GRID).fill(null);
  const set = (x, y, c) => {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= GRID || y >= GRID) return;
    cells[y * GRID + x] = c;
  };
  const ctx = { set, cx: GRID / 2, cy: GRID / 2, pal, rng: seeded(creature.id + archetype), a: creature.appearance, g: creature.genome, detail };

  switch (archetype) {
    case 'cthulhu':    drawCthulhu(ctx); break;
    case 'shoggoth':   drawShoggoth(ctx); break;
    case 'migo':       drawMiGo(ctx); break;
    case 'elderthing': drawElderThing(ctx); break;
    case 'deep':       drawDeepOne(ctx); break;
    case 'yith':       drawYith(ctx); break;
    case 'ghoul':      drawGhoul(ctx); break;
    case 'dagon':      drawDagon(ctx); break;
    case 'polyp':      drawPolyp(ctx); break;
    case 'yog':        drawYog(ctx); break;
    default:           drawShoggoth(ctx);
  }

  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const c = cells[y * GRID + x];
      if (!c) continue;
      g.fillStyle = c;
      g.fillRect(x * px, y * px, Math.ceil(px), Math.ceil(px));
    }
  }
}

/* ============ SILUETAS POR ARQUETIPO ============ */

function drawCthulhu({ set, cx, cy, pal }) {
  blob(set, cx, cy - 3, 7, 8, pal, .18);
  for (let i = 0; i < 8; i++) {
    set(cx - 8 - i * .5, cy - 6 + i, pal.mid); set(cx - 8 - i * .5, cy - 5 + i, pal.dark);
    set(cx + 8 + i * .5, cy - 6 + i, pal.mid); set(cx + 8 + i * .5, cy - 5 + i, pal.dark);
  }
  for (let t = -3; t <= 3; t++) {
    let tx = cx + t * 1.3, ty = cy + 4;
    for (let i = 0; i < 5; i++) { ty++; tx += Math.sin(i + t) * .4; set(tx, ty, i > 3 ? pal.glow : pal.mid); }
  }
  eyes(set, [[cx - 2, cy - 4], [cx + 2, cy - 4]], 1.6, pal);
}

function drawShoggoth({ set, cx, cy, pal, rng, a }) {
  const R = 9 + a.fluff * 2;
  for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
    const w = 1 + Math.sin(Math.atan2(y, x) * 5 + rng() * 6) * .22;
    const d = Math.hypot(x, y) / R;
    if (d < w) set(cx + x, cy + y, d > w * .8 ? pal.outline : d > .55 ? pal.body : pal.mid);
  }
  const n = 5 + Math.floor(a.eyeSize * 4);
  for (let i = 0; i < n; i++) {
    const ang = rng() * 6.28, rr = rng() * R * .7;
    set(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, pal.eye);
  }
}

function drawMiGo({ set, cx, cy, pal }) {
  ellipse(set, cx, cy, 4, 7, pal.body, pal.outline);
  for (let i = 0; i < 7; i++) {
    set(cx - 6 - i, cy - 4 - i * .4, pal.light); set(cx + 6 + i, cy - 4 - i * .4, pal.light);
  }
  for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 4; i++) {
    set(cx + s * (4 + i), cy - 2 + i * 2, pal.dark);
    set(cx + s * (5 + i), cy - 1 + i * 2, pal.mid);
  }
  set(cx, cy - 8, pal.flesh); set(cx - 1, cy - 9, pal.glow); set(cx + 1, cy - 9, pal.glow);
}

function drawElderThing({ set, cx, cy, pal }) {
  ellipse(set, cx, cy, 4, 8, pal.body, pal.outline);
  for (let k = 0; k < 5; k++) {
    const ang = -Math.PI / 2 + (k - 2) * .5;
    for (let i = 1; i <= 4; i++) set(cx + Math.cos(ang) * i * 1.6, cy - 6 + Math.sin(ang) * i * 1.6, i > 3 ? pal.glow : pal.mid);
  }
  for (let k = 0; k < 5; k++) {
    const ang = Math.PI / 2 + (k - 2) * .45;
    for (let i = 1; i <= 4; i++) set(cx + Math.cos(ang) * i * 1.5, cy + 6 + Math.sin(ang) * i, pal.dark);
  }
  eyes(set, [[cx - 2, cy - 1], [cx + 2, cy - 1], [cx, cy + 2]], 1.1, pal);
}

function drawDeepOne({ set, cx, cy, pal }) {
  blob(set, cx, cy - 4, 5, 5, pal, .1);
  ellipse(set, cx, cy + 3, 4, 6, pal.body, pal.outline);
  set(cx - 5, cy + 2, pal.mid); set(cx - 6, cy + 4, pal.mid); set(cx + 5, cy + 2, pal.mid); set(cx + 6, cy + 4, pal.mid);
  for (let i = 0; i < 4; i++) set(cx, cy - 9 + i, pal.light);
  eyes(set, [[cx - 3, cy - 4], [cx + 3, cy - 4]], 2, pal);
}

function drawYith({ set, cx, cy, pal }) {
  for (let y = -8; y <= 7; y++) {
    const w = Math.round((y + 8) / 15 * 6) + 1;
    for (let x = -w; x <= w; x++) set(cx + x, cy + y, Math.abs(x) === w ? pal.outline : y < -2 ? pal.mid : pal.body);
  }
  for (let s = -1; s <= 1; s += 2) {
    for (let i = 0; i < 5; i++) set(cx + s * (2 + i), cy - 8 - (i < 3 ? i : 3) * .6, pal.mid);
    set(cx + s * 7, cy - 10, pal.glow);
  }
  eyes(set, [[cx - 2, cy - 9], [cx, cy - 11], [cx + 2, cy - 9]], 1, pal);
}

function drawGhoul({ set, cx, cy, pal }) {
  ellipse(set, cx, cy + 2, 4, 6, pal.body, pal.outline);
  blob(set, cx + 2, cy - 4, 3, 3, pal, .05);
  set(cx + 5, cy - 3, pal.mid); set(cx + 6, cy - 3, pal.dark);
  set(cx, cy - 7, pal.dark); set(cx + 3, cy - 7, pal.dark);
  for (let i = 0; i < 3; i++) { set(cx - 5, cy + 5 + i, pal.light); set(cx + 5, cy + 5 + i, pal.light); }
  eyes(set, [[cx + 1, cy - 4], [cx + 3, cy - 4]], 1, pal, pal.glow);
}

function drawDagon({ set, cx, cy, pal, a }) {
  const R = 8 + a.fluff;
  ellipse(set, cx, cy, 6, R, pal.body, pal.outline);
  set(cx - 6, cy - 4, pal.mid); set(cx + 6, cy - 4, pal.mid);
  for (let i = 0; i < 6; i++) { set(cx - 6 - (i > 2 ? 1 : 0), cy - 3 + i, pal.dark); set(cx + 6 + (i > 2 ? 1 : 0), cy - 3 + i, pal.dark); }
  blob(set, cx, cy - 7, 4, 3, pal, .05);
  set(cx - 4, cy - 8, pal.light); set(cx + 4, cy - 8, pal.light);
  for (let y = -3; y < 6; y += 2) for (let x = -3; x < 4; x += 2) set(cx + x, cy + y, pal.mid);
  eyes(set, [[cx - 2, cy - 7], [cx + 2, cy - 7]], 1.2, pal);
}

function drawPolyp({ set, cx, cy, pal, rng }) {
  for (let y = -8; y <= 8; y++) for (let x = -6; x <= 6; x++) {
    const d = Math.hypot(x / 6, y / 8);
    if (d < 1 && rng() > .35) set(cx + x, cy + y, d > .7 ? pal.mid : pal.light);
  }
  for (let i = -2; i <= 2; i++) { set(cx - 8, cy + i * 3, pal.glow); set(cx + 8, cy + i * 3, pal.glow); }
  eyes(set, [[cx, cy]], 2, pal);
}

function drawYog({ set, cx, cy, pal, rng, a }) {
  const spheres = 4 + Math.floor(a.eyeSize * 3);
  for (let s = 0; s < spheres; s++) {
    const ang = (s / spheres) * 6.28, rr = 4 + rng() * 3;
    const sx = cx + Math.cos(ang) * rr, sy = cy + Math.sin(ang) * rr;
    const r = 2 + rng() * 2.5;
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++)
      if (x * x + y * y <= r * r) set(sx + x, sy + y, x * x + y * y > (r - 1) * (r - 1) ? pal.glow : pal.mid);
  }
  for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++)
    if (x * x + y * y <= 9) set(cx + x, cy + y, x * x + y * y > 4 ? pal.body : pal.eye);
}

/* ============ MICRO ============ */
function drawEldritchMicro(ctx, creature, zoom) {
  const archetype = creature._archetype || (creature._archetype = archetypeFor(creature));
  const a = creature.appearance;
  // Tamaño mínimo mayor para que se lean como criaturas incluso lejos.
  const r = Math.max(3.4 / zoom, creature.radius * 1.5);
  const baseHue = (ARCHETYPES.find(x => x.id === archetype)?.hueBase ?? creature.genome.hue) * .6 + creature.genome.hue * .4;
  const body = hslPix(baseHue, 42, 34 - a.darkness * 8);
  const rim = hslPix(baseHue, 55, 52 - a.darkness * 6);
  const glow = hslPix(a.accentHue, 95, 64);
  const p = Math.max(1, r * .34); // "pixel" del micro

  // Silueta por familia, con borde claro (rim) para destacar sobre el fondo oscuro.
  ctx.fillStyle = rim;
  if (archetype === 'yith' || archetype === 'elderthing') {
    // Triángulo (cono / cresta)
    ctx.beginPath(); ctx.moveTo(0, -r * 1.15); ctx.lineTo(r * 1.05, r); ctx.lineTo(-r * 1.05, r); ctx.closePath(); ctx.fill();
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.moveTo(0, -r * .7); ctx.lineTo(r * .7, r * .8); ctx.lineTo(-r * .7, r * .8); ctx.closePath(); ctx.fill();
  } else if (archetype === 'polyp' || archetype === 'dagon' || archetype === 'migo') {
    // Vertical alargado
    ctx.fillRect(-r * .85, -r * 1.1, r * 1.7, r * 2.2);
    ctx.fillStyle = body;
    ctx.fillRect(-r * .55, -r * .8, r * 1.1, r * 1.6);
  } else if (archetype === 'yog' || archetype === 'shoggoth') {
    // Masa redondeada (rombo relleno)
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.moveTo(0, -r * .6); ctx.lineTo(r * .6, 0); ctx.lineTo(0, r * .6); ctx.lineTo(-r * .6, 0); ctx.closePath(); ctx.fill();
  } else {
    // Bloque (cuerpo genérico)
    ctx.fillRect(-r, -r * .9, r * 2, r * 1.8);
    ctx.fillStyle = body;
    ctx.fillRect(-r * .65, -r * .6, r * 1.3, r * 1.3);
  }

  // Ojos brillantes: rasgo lovecraftiano que hace la silueta reconocible.
  ctx.fillStyle = glow;
  const multiEye = archetype === 'shoggoth' || archetype === 'yog' || archetype === 'yith';
  if (archetype === 'deep' || archetype === 'ghoul') {
    ctx.fillRect(-p * .4, -r * .25, p, p); // un ojo central
  } else if (multiEye) {
    ctx.fillRect(-r * .5, -r * .35, p, p);
    ctx.fillRect(r * .2, -r * .35, p, p);
    ctx.fillRect(-p * .4, r * .05, p, p);
  } else {
    ctx.fillRect(-r * .45, -r * .3, p, p);
    ctx.fillRect(r * .15, -r * .3, p, p);
  }
}

/* ============ PRIMITIVAS DE PÍXEL ============ */
function blob(set, cx, cy, rx, ry, pal, wob) {
  for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
    const d = Math.hypot(x / rx, y / ry);
    const w = 1 + Math.sin(Math.atan2(y, x) * 4) * wob;
    if (d < w) set(cx + x, cy + y, d > w * .82 ? pal.outline : d > .55 ? pal.body : pal.mid);
  }
}
function ellipse(set, cx, cy, rx, ry, fill, outline) {
  for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
    const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
    if (d <= 1) set(cx + x, cy + y, d > .78 ? outline : fill);
  }
}
function eyes(set, positions, r, pal, color) {
  for (const [ex, ey] of positions) {
    for (let y = -Math.ceil(r); y <= Math.ceil(r); y++) for (let x = -Math.ceil(r); x <= Math.ceil(r); x++)
      if (x * x + y * y <= r * r) set(ex + x, ey + y, x * x + y * y > (r - 1) * (r - 1) ? pal.eyeDk : (color || pal.eye));
    set(ex, ey, pal.outline);
  }
}

/* ---- color ---- */
function hueBand(hue, target) { const d = Math.abs(((hue - target + 540) % 360) - 180); return Math.max(0, 1 - d / 90); }
function hslPix(h, s, l) {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  let r = 0, gg = 0, b = 0;
  if (h < 60) [r, gg, b] = [c, x, 0]; else if (h < 120) [r, gg, b] = [x, c, 0];
  else if (h < 180) [r, gg, b] = [0, c, x]; else if (h < 240) [r, gg, b] = [0, x, c];
  else if (h < 300) [r, gg, b] = [x, 0, c]; else [r, gg, b] = [c, 0, x];
  const to = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(gg)}${to(b)}`;
}
function mix(hexA, hexB, t) {
  const a = parseInt(hexA.slice(1), 16), b = parseInt(hexB.slice(1), 16);
  const ar = a >> 16, ag = (a >> 8) & 255, ab = a & 255, br = b >> 16, bg = (b >> 8) & 255, bb = b & 255;
  return `#${(((Math.round(ar + (br - ar) * t)) << 16) | ((Math.round(ag + (bg - ag) * t)) << 8) | (Math.round(ab + (bb - ab) * t))).toString(16).padStart(6, '0')}`;
}
function seeded(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hashUnit(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}


/* ===== renderer.js ===== */
const BIOME_PALETTES = Object.freeze({
  origin: { outer: '#03070c', a: '#102234', b: '#07121c', c: '#03070b', line: '98,220,255', accent: '120,200,255' },
  meadow: { outer: '#07100b', a: '#335b39', b: '#173622', c: '#09170f', line: '161,229,149', accent: '214,244,153' },
  forest: { outer: '#030a07', a: '#183b2b', b: '#0b2118', c: '#030c09', line: '93,180,130', accent: '127,213,155' },
  desert: { outer: '#130d07', a: '#8b5e2d', b: '#4b2e18', c: '#1c1008', line: '255,201,123', accent: '255,221,154' },
  marsh: { outer: '#06100d', a: '#285546', b: '#103329', c: '#071712', line: '105,198,162', accent: '134,230,182' },
  tundra: { outer: '#071018', a: '#9db7c7', b: '#446578', c: '#162b38', line: '210,239,255', accent: '231,248,255' },
  volcanic: { outer: '#100403', a: '#4c1710', b: '#220b08', c: '#090302', line: '255,94,55', accent: '255,153,70' },
  abyss: { outer: '#020207', a: '#17132b', b: '#090817', c: '#020207', line: '146,112,255', accent: '121,94,255' }
});

class Renderer {
  constructor(canvas, simulation) {
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error('No se encontró el lienzo principal');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('El navegador no permite iniciar Canvas 2D');
    this.canvas = canvas;
    this.ctx = context;
    this.simulation = simulation;
    this.camera = { x: CONFIG.WORLD_WIDTH / 2, y: CONFIG.WORLD_HEIGHT / 2, zoom: .72 };
    this.selectedId = null;
    this.followId = null;
    this.dragging = false;
    this.lastPointer = null;
    this.dpr = 1;
    this.hasSized = false;
    // Calidad de render: 'auto' decide según población y FPS; 'alta' fuerza detalle; 'rendimiento' fuerza modo pixelado ligero.
    this.qualityMode = 'auto';
    this.performanceActive = false;
    this.spriteCache = new Map();
    this.maxSpriteCache = 220;
    this.stars = Array.from({ length: 260 }, (_, index) => ({
      x: (index * 997) % CONFIG.WORLD_WIDTH,
      y: (index * 613) % CONFIG.WORLD_HEIGHT,
      a: .08 + (index % 9) / 70
    }));
    this.terrain = Array.from({ length: 420 }, (_, index) => ({
      x: (index * 733 + (index % 13) * 91) % CONFIG.WORLD_WIDTH,
      y: (index * 421 + (index % 17) * 57) % CONFIG.WORLD_HEIGHT,
      size: 4 + ((index * 19) % 24),
      rot: ((index * 37) % 360) * Math.PI / 180,
      kind: index % 7,
      a: .16 + (index % 8) * .035
    }));
    this.weatherParticles = Array.from({ length: 96 }, (_, index) => ({
      x: ((index * 83) % 997) / 997,
      y: ((index * 151) % 991) / 991,
      speed: .18 + (index % 11) * .025,
      size: 1 + (index % 3),
      drift: ((index % 7) - 3) * .012
    }));
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    const nextWidth = Math.round(width * this.dpr);
    const nextHeight = Math.round(height * this.dpr);
    if (this.canvas.width !== nextWidth) this.canvas.width = nextWidth;
    if (this.canvas.height !== nextHeight) this.canvas.height = nextHeight;
    if (!this.hasSized) {
      this.hasSized = true;
      this.resetCamera();
    } else {
      this.camera.zoom = clamp(this.camera.zoom, this.getMinZoom(), this.getMaxZoom());
      this.clampCamera();
    }
  }

  getViewportSize() {
    const rect = this.canvas.getBoundingClientRect();
    return { width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
  }

  getFitZoom(padding = 26) {
    const { width, height } = this.getViewportSize();
    const availableWidth = Math.max(1, width - padding * 2);
    const availableHeight = Math.max(1, height - padding * 2);
    return clamp(Math.min(availableWidth / CONFIG.WORLD_WIDTH, availableHeight / CONFIG.WORLD_HEIGHT), .1, 1.6);
  }

  getMinZoom() { return this.getFitZoom(26); }
  getMaxZoom() { return 3.4; }

  resetCamera() {
    this.clearFollow();
    this.camera.x = CONFIG.WORLD_WIDTH / 2;
    this.camera.y = CONFIG.WORLD_HEIGHT / 2;
    this.camera.zoom = this.getFitZoom();
    this.clampCamera();
  }

  zoomAt(sx, sy, factor) {
    const before = this.screenToWorld(sx, sy);
    this.camera.zoom = clamp(this.camera.zoom * factor, this.getMinZoom(), this.getMaxZoom());
    const after = this.screenToWorld(sx, sy);
    this.camera.x += before.x - after.x;
    this.camera.y += before.y - after.y;
    this.clampCamera();
    return this.camera.zoom;
  }

  setZoom(zoom, sx = null, sy = null) {
    const rect = this.canvas.getBoundingClientRect();
    const px = Number.isFinite(sx) ? sx : rect.left + rect.width / 2;
    const py = Number.isFinite(sy) ? sy : rect.top + rect.height / 2;
    const factor = clamp(zoom, this.getMinZoom(), this.getMaxZoom()) / Math.max(.001, this.camera.zoom);
    return this.zoomAt(px, py, factor);
  }

  clampCamera() {
    const { width, height } = this.getViewportSize();
    const zoom = Math.max(.01, this.camera.zoom);
    const halfWidth = width / zoom / 2;
    const halfHeight = height / zoom / 2;
    this.camera.x = halfWidth * 2 >= CONFIG.WORLD_WIDTH
      ? CONFIG.WORLD_WIDTH / 2
      : clamp(this.camera.x, halfWidth, CONFIG.WORLD_WIDTH - halfWidth);
    this.camera.y = halfHeight * 2 >= CONFIG.WORLD_HEIGHT
      ? CONFIG.WORLD_HEIGHT / 2
      : clamp(this.camera.y, halfHeight, CONFIG.WORLD_HEIGHT - halfHeight);
  }

  screenToWorld(sx, sy) {
    const rect = this.canvas.getBoundingClientRect();
    const zoom = Math.max(.01, this.camera.zoom);
    return {
      x: (sx - rect.left - rect.width / 2) / zoom + this.camera.x,
      y: (sy - rect.top - rect.height / 2) / zoom + this.camera.y
    };
  }

  worldToScreen(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (x - this.camera.x) * this.camera.zoom + rect.width / 2,
      y: (y - this.camera.y) * this.camera.zoom + rect.height / 2
    };
  }

  setFollow(id) { this.followId = typeof id === 'string' ? id : null; }
  clearFollow() { this.followId = null; }

  setQualityMode(mode) {
    if (['auto', 'alta', 'rendimiento'].includes(mode)) this.qualityMode = mode;
  }

  // El bucle principal llama esto una vez por medio segundo con los FPS medidos.
  reportFps(fps) {
    if (Number.isFinite(fps)) this.lastFps = fps;
  }

  // Decide si esta frame se dibuja en modo rendimiento. Combina la elección manual con
  // una heurística automática (población alta o FPS bajos) usando histéresis para no parpadear.
  resolvePerformanceMode() {
    if (this.qualityMode === 'rendimiento') return true;
    if (this.qualityMode === 'alta') return false;
    const population = this.simulation.creatures.length;
    const fps = this.lastFps ?? 60;
    if (this.performanceActive) {
      // Ya estamos en modo ligero: solo salimos si hay holgura clara.
      if (population < 280 && fps > 52) return false;
      return true;
    }
    // Estamos en modo detallado: entramos en ligero en cuanto la carga aprieta.
    if (population > 350 || fps < 45) return true;
    return false;
  }

  draw() {
    const ctx = this.ctx;
    const perf = this.resolvePerformanceMode();
    this.performanceActive = perf;
    // Pixel-art 16-bit: el suavizado se mantiene siempre desactivado para que los sprites se vean nítidos y cuadrados.
    ctx.imageSmoothingEnabled = false;
    const width = Math.max(1, this.canvas.width / this.dpr);
    const height = Math.max(1, this.canvas.height / this.dpr);
    const palette = BIOME_PALETTES[this.simulation.biome] ?? BIOME_PALETTES.origin;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = palette.outer;
    ctx.fillRect(0, 0, width, height);

    const followed = this.followId ? this.simulation.creatures.find(creature => creature?.id === this.followId) : null;
    if (followed) {
      this.camera.x += (followed.x - this.camera.x) * .08;
      this.camera.y += (followed.y - this.camera.y) * .08;
    } else if (this.followId) {
      this.clearFollow();
    }
    this.camera.zoom = clamp(this.camera.zoom, this.getMinZoom(), this.getMaxZoom());
    this.clampCamera();

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);
    this.drawBackground(ctx);
    this.drawLegacySites(ctx);
    this.drawSanctuaries(ctx);
    this.drawWorkshops(ctx);
    this.drawFood(ctx);
    this.drawEggs(ctx);
    this.drawCreatures(ctx);
    ctx.restore();
    this.drawAtmosphere(ctx, width, height);
    this.drawVignette(ctx, width, height);
  }

  drawBackground(ctx) {
    const key = Object.prototype.hasOwnProperty.call(BIOME_PALETTES, this.simulation.biome) ? this.simulation.biome : 'origin';
    const palette = BIOME_PALETTES[key];
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
    ctx.clip();

    // Fondo cuantizado: bandas y teselas en lugar de un gradiente recalculado cada frame.
    ctx.fillStyle = palette.c;
    ctx.fillRect(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
    const bandHeight = CONFIG.WORLD_HEIGHT / 5;
    const bands = [palette.a, palette.b, palette.b, palette.c, palette.c];
    for (let index = 0; index < bands.length; index++) {
      ctx.globalAlpha = .34 - index * .035;
      ctx.fillStyle = bands[index];
      ctx.fillRect(0, Math.floor(index * bandHeight), CONFIG.WORLD_WIDTH, Math.ceil(bandHeight + 1));
    }
    ctx.globalAlpha = 1;
    this.drawPixelTerrainGrid(ctx, palette);

    if (key === 'origin') this.drawOriginTerrain(ctx, palette);
    else if (key === 'meadow') this.drawMeadowTerrain(ctx, palette);
    else if (key === 'forest') this.drawForestTerrain(ctx, palette);
    else if (key === 'desert') this.drawDesertTerrain(ctx, palette);
    else if (key === 'marsh') this.drawMarshTerrain(ctx, palette);
    else if (key === 'tundra') this.drawTundraTerrain(ctx, palette);
    else if (key === 'volcanic') this.drawVolcanicTerrain(ctx, palette);
    else this.drawAbyssTerrain(ctx, palette);

    ctx.restore();
    ctx.strokeStyle = `rgba(${palette.line},.24)`;
    ctx.lineWidth = 2 / this.camera.zoom;
    ctx.strokeRect(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
  }

  drawPixelTerrainGrid(ctx, palette) {
    const tile = this.camera.zoom < .28 ? 96 : 48;
    const startX = Math.max(0, Math.floor((this.camera.x - 900 / this.camera.zoom) / tile) * tile);
    const endX = Math.min(CONFIG.WORLD_WIDTH, Math.ceil((this.camera.x + 900 / this.camera.zoom) / tile) * tile);
    const startY = Math.max(0, Math.floor((this.camera.y - 700 / this.camera.zoom) / tile) * tile);
    const endY = Math.min(CONFIG.WORLD_HEIGHT, Math.ceil((this.camera.y + 700 / this.camera.zoom) / tile) * tile);
    ctx.lineWidth = 1 / Math.max(.2, this.camera.zoom);
    ctx.strokeStyle = `rgba(${palette.line},.035)`;
    for (let x = startX; x <= endX; x += tile) {
      ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke();
    }
    for (let y = startY; y <= endY; y += tile) {
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke();
    }
    const count = this.performanceActive ? 70 : 150;
    for (let index = 0; index < count; index++) {
      const item = this.terrain[index * 2 % this.terrain.length];
      if (!item || !this.isVisible(item.x, item.y, 45)) continue;
      const size = 3 + (item.kind % 4) * 2;
      ctx.fillStyle = `rgba(${palette.accent},${.035 + item.a * .14})`;
      ctx.fillRect(Math.round(item.x / 2) * 2, Math.round(item.y / 2) * 2, size * 2, size);
      if (item.kind % 3 === 0) ctx.fillRect(Math.round(item.x / 2) * 2 + size, Math.round(item.y / 2) * 2 - size, size, size * 2);
    }
  }

  drawLegacySites(ctx) {
    const legacy = this.simulation.legacy;
    if (!legacy) return;
    const palette = BIOME_PALETTES[this.simulation.biome] ?? BIOME_PALETTES.origin;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    for (const ruin of legacy.ruins ?? []) {
      if (!ruin || !this.isVisible(ruin.x, ruin.y, 70)) continue;
      const condition = clamp(Number(ruin.condition) || 0, 0, 1);
      const scale = 18 + condition * 10;
      ctx.globalAlpha = .45 + condition * .45;
      ctx.fillStyle = '#17191d';
      ctx.fillRect(Math.round(ruin.x - scale), Math.round(ruin.y - scale * .35), Math.round(scale * 2), Math.round(scale * .7));
      ctx.fillStyle = `rgba(${palette.accent},.2)`;
      ctx.fillRect(Math.round(ruin.x - scale * .72), Math.round(ruin.y - scale), Math.round(scale * .38), Math.round(scale * .78));
      ctx.fillRect(Math.round(ruin.x + scale * .22), Math.round(ruin.y - scale * .72), Math.round(scale * .32), Math.round(scale * .5));
      ctx.fillStyle = '#050608';
      ctx.fillRect(Math.round(ruin.x - 3), Math.round(ruin.y - scale * .45), 7, Math.round(scale * .45));
      ctx.strokeStyle = `rgba(${palette.line},.45)`;
      ctx.lineWidth = 2 / Math.max(.25, this.camera.zoom);
      ctx.strokeRect(Math.round(ruin.x - scale), Math.round(ruin.y - scale), Math.round(scale * 2), Math.round(scale * 1.35));
    }
    for (const library of legacy.libraries ?? []) {
      if (!library || !this.isVisible(library.x, library.y, 80)) continue;
      const x = Math.round(library.x); const y = Math.round(library.y);
      ctx.globalAlpha = .95;
      ctx.fillStyle = '#0a1014'; ctx.fillRect(x - 28, y - 22, 56, 44);
      ctx.fillStyle = `rgba(${palette.accent},.62)`; ctx.fillRect(x - 22, y - 16, 44, 5);
      ctx.fillRect(x - 18, y - 7, 6, 19); ctx.fillRect(x - 7, y - 7, 6, 19); ctx.fillRect(x + 4, y - 7, 6, 19); ctx.fillRect(x + 15, y - 7, 6, 19);
      ctx.strokeStyle = `rgba(${palette.line},.8)`; ctx.lineWidth = 2 / Math.max(.25, this.camera.zoom); ctx.strokeRect(x - 28, y - 22, 56, 44);
    }
    ctx.restore();
  }

  drawAtmosphere(ctx, width, height) {
    const environment = this.simulation.legacy?.environment;
    if (!environment) return;
    const phase = environment.phase;
    let darkness = phase === 'noche' ? .48 : phase === 'madrugada' ? .38 : phase === 'ocaso' ? .22 : phase === 'amanecer' ? .12 : 0;
    if (darkness > 0) {
      ctx.fillStyle = `rgba(3,5,13,${darkness})`;
      ctx.fillRect(0, 0, width, height);
    }
    const weather = environment.weather || 'clear';
    if (weather === 'clear') return;
    const intensity = clamp(Number(environment.weatherIntensity) || .4, .1, 1);
    const count = this.performanceActive ? 32 : Math.round(48 + intensity * 42);
    const time = this.simulation.time || 0;
    ctx.save();
    ctx.globalAlpha = .28 + intensity * .38;
    for (let index = 0; index < Math.min(count, this.weatherParticles.length); index++) {
      const particle = this.weatherParticles[index];
      let x = ((particle.x + time * particle.drift) % 1 + 1) % 1 * width;
      let y = ((particle.y + time * particle.speed * (weather === 'fog' ? .035 : .12)) % 1) * height;
      if (weather === 'rain' || weather === 'storm') {
        ctx.fillStyle = weather === 'storm' ? '#b9d9e8' : '#82a9ba';
        ctx.fillRect(Math.round(x), Math.round(y), 1 + particle.size, 7 + particle.size * 2);
      } else if (weather === 'snow') {
        ctx.fillStyle = '#e8f4f7'; ctx.fillRect(Math.round(x), Math.round(y), particle.size + 1, particle.size + 1);
      } else if (weather === 'ash') {
        ctx.fillStyle = '#a28d7b'; ctx.fillRect(Math.round(x), Math.round(y), particle.size + 1, particle.size);
      } else if (weather === 'spores') {
        ctx.fillStyle = '#b8e986'; ctx.fillRect(Math.round(x), Math.round(y), 2 + particle.size, 2 + particle.size);
      } else if (weather === 'fog') {
        ctx.fillStyle = 'rgba(190,205,211,.09)';
        ctx.fillRect(Math.round(x - 40), Math.round(y), 90 + particle.size * 16, 7 + particle.size * 2);
      }
    }
    if (weather === 'storm' && Math.floor(time * 2.2) % 29 === 0) {
      ctx.fillStyle = 'rgba(225,242,255,.12)'; ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }

  drawOriginTerrain(ctx, palette) {
    ctx.strokeStyle = `rgba(${palette.line},.045)`;
    ctx.lineWidth = 1 / this.camera.zoom;
    const grid = this.camera.zoom < .35 ? 160 : 80;
    for (let x = 0; x <= CONFIG.WORLD_WIDTH; x += grid) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CONFIG.WORLD_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y <= CONFIG.WORLD_HEIGHT; y += grid) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CONFIG.WORLD_WIDTH, y); ctx.stroke();
    }
    for (const star of this.stars) {
      if (!this.isVisible(star.x, star.y, 8)) continue;
      ctx.fillStyle = `rgba(${palette.accent},${star.a})`;
      ctx.fillRect(star.x, star.y, Math.max(.8, 1.2 / this.camera.zoom), Math.max(.8, 1.2 / this.camera.zoom));
    }
  }

  drawMeadowTerrain(ctx, palette) {
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 30)) continue;
      const sway = Math.sin(this.simulation.time * .7 + item.x * .01) * 3;
      ctx.strokeStyle = `rgba(${palette.accent},${item.a})`;
      ctx.lineWidth = 1.2 / Math.max(.55, this.camera.zoom);
      ctx.beginPath();
      ctx.moveTo(item.x, item.y + item.size * .45);
      ctx.quadraticCurveTo(item.x + sway, item.y, item.x + Math.sin(item.rot) * item.size * .22, item.y - item.size * .5);
      ctx.stroke();
      if (item.kind === 0 && this.camera.zoom > .28) {
        ctx.fillStyle = `rgba(255,226,126,${Math.min(.8, item.a * 2.4)})`;
        ctx.beginPath(); ctx.arc(item.x, item.y - item.size * .5, 2.2 / this.camera.zoom, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  drawForestTerrain(ctx, palette) {
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 55) || item.kind > 4) continue;
      const trunk = Math.max(2.5, item.size * .16);
      ctx.fillStyle = `rgba(45,31,22,${.25 + item.a})`;
      ctx.fillRect(item.x - trunk / 2, item.y, trunk, item.size * .9);
      const canopy = ctx.createRadialGradient(item.x, item.y - item.size * .2, 2, item.x, item.y - item.size * .2, item.size);
      canopy.addColorStop(0, `rgba(${palette.accent},${Math.min(.5, item.a + .16)})`);
      canopy.addColorStop(1, 'rgba(4,24,14,0)');
      ctx.fillStyle = canopy;
      ctx.beginPath(); ctx.arc(item.x, item.y - item.size * .18, item.size, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawDesertTerrain(ctx, palette) {
    ctx.strokeStyle = `rgba(${palette.accent},.12)`;
    ctx.lineWidth = 2 / this.camera.zoom;
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 90) || item.kind > 3) continue;
      ctx.beginPath();
      ctx.ellipse(item.x, item.y, item.size * 3.2, item.size * .7, item.rot * .18, Math.PI * .08, Math.PI * .92);
      ctx.stroke();
      if (item.kind === 0 && this.camera.zoom > .3) {
        ctx.fillStyle = `rgba(68,42,24,${item.a + .1})`;
        ctx.beginPath(); ctx.ellipse(item.x + item.size, item.y - 2, item.size * .42, item.size * .25, item.rot, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  drawMarshTerrain(ctx, palette) {
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 60)) continue;
      if (item.kind < 2) {
        ctx.fillStyle = `rgba(8,36,42,${item.a + .08})`;
        ctx.beginPath(); ctx.ellipse(item.x, item.y, item.size * 2.2, item.size * .75, item.rot, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(${palette.accent},${item.a})`; ctx.stroke();
      } else if (item.kind < 5 && this.camera.zoom > .25) {
        ctx.strokeStyle = `rgba(${palette.accent},${item.a + .08})`;
        ctx.lineWidth = 1.3 / this.camera.zoom;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath(); ctx.moveTo(item.x + i * 4, item.y + item.size * .35); ctx.lineTo(item.x + i * 3, item.y - item.size * .55); ctx.stroke();
        }
      }
    }
  }

  drawTundraTerrain(ctx, palette) {
    ctx.strokeStyle = `rgba(${palette.accent},.15)`;
    ctx.lineWidth = 1.4 / this.camera.zoom;
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 55)) continue;
      if (item.kind < 4) {
        ctx.beginPath();
        ctx.moveTo(item.x - item.size, item.y);
        ctx.lineTo(item.x, item.y - item.size * .45);
        ctx.lineTo(item.x + item.size * .8, item.y + item.size * .15);
        ctx.stroke();
      }
      if (item.kind === 6 && this.camera.zoom > .28) {
        ctx.fillStyle = `rgba(240,252,255,${item.a + .1})`;
        ctx.beginPath(); ctx.arc(item.x, item.y, 1.7 / this.camera.zoom, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  drawVolcanicTerrain(ctx, palette) {
    ctx.lineCap = 'round';
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 65) || item.kind > 4) continue;
      ctx.strokeStyle = `rgba(${palette.accent},${item.a + .08})`;
      ctx.lineWidth = (1.5 + item.kind * .25) / this.camera.zoom;
      ctx.beginPath();
      ctx.moveTo(item.x - item.size, item.y - item.size * .4);
      ctx.lineTo(item.x - item.size * .2, item.y);
      ctx.lineTo(item.x + item.size * .15, item.y - item.size * .3);
      ctx.lineTo(item.x + item.size, item.y + item.size * .25);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }

  drawAbyssTerrain(ctx, palette) {
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 40)) continue;
      const pulse = .5 + Math.sin(this.simulation.time * .9 + item.rot) * .25;
      ctx.fillStyle = `rgba(${palette.accent},${Math.max(.04, item.a * pulse)})`;
      ctx.beginPath(); ctx.arc(item.x, item.y, Math.max(1, item.size * .16), 0, Math.PI * 2); ctx.fill();
      if (item.kind === 0 && this.camera.zoom > .32) {
        ctx.strokeStyle = `rgba(${palette.line},${item.a * .45})`;
        ctx.beginPath(); ctx.arc(item.x, item.y, item.size * 1.8, 0, Math.PI * 2); ctx.stroke();
      }
    }
  }

  drawWorkshops(ctx) {
    const teams = this.simulation.workshop?.teams ?? [];
    if (!teams.length) return;
    const pulse = (performance.now() % 2400) / 2400;
    for (const team of teams) {
      if (!team || team.dissolved || !this.isVisible(team.siteX, team.siteY, 120)) continue;
      ctx.save();
      ctx.translate(team.siteX, team.siteY);
      ctx.rotate(pulse * Math.PI * 2);
      ctx.beginPath();
      ctx.arc(0, 0, 58 + pulse * 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(140,196,255,.35)';
      ctx.setLineDash([10, 14]);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      const progress = Math.max(0, Math.min(1, team.progress));
      ctx.beginPath();
      ctx.arc(team.siteX, team.siteY, 44, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = 'rgba(95,240,183,.8)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = 'rgba(223,234,244,.85)';
      ctx.font = '600 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TALLER', team.siteX, team.siteY - 66);
      for (const memberId of team.memberIds) {
        const member = this.simulation.creatures.find(creature => creature?.id === memberId);
        if (!member || member.dead) continue;
        ctx.beginPath();
        ctx.moveTo(team.siteX, team.siteY);
        ctx.lineTo(member.x, member.y);
        ctx.strokeStyle = 'rgba(140,196,255,.16)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }
  }

  drawFood(ctx) {
    // Lote único: con el mundo encajado puede haber más de 2000 recursos visibles. Antes cada
    // uno costaba beginPath+arc+fill (y otro par para el halo): miles de operaciones de canvas
    // por frame. Como el color de relleno es constante, todos los círculos van en un solo path
    // y un solo fill; el halo, en un segundo path. El pulso individual se conserva.
    const drawHalo = this.camera.zoom > .55;
    ctx.beginPath();
    for (const resource of this.simulation.food) {
      if (!resource || !Number.isFinite(resource.x) || !Number.isFinite(resource.y) || !this.isVisible(resource.x, resource.y, 20)) continue;
      const pulse = 1 + Math.sin(this.simulation.time * 3 + resource.x) * .16;
      const r = Math.max(.5, resource.radius * pulse);
      ctx.moveTo(resource.x + r, resource.y);
      ctx.arc(resource.x, resource.y, r, 0, Math.PI * 2);
    }
    ctx.fillStyle = 'rgba(95,240,183,.75)';
    ctx.fill();
    if (drawHalo) {
      ctx.beginPath();
      for (const resource of this.simulation.food) {
        if (!resource || !Number.isFinite(resource.x) || !Number.isFinite(resource.y) || !this.isVisible(resource.x, resource.y, 20)) continue;
        const r = resource.radius * 2.8;
        ctx.moveTo(resource.x + r, resource.y);
        ctx.arc(resource.x, resource.y, r, 0, Math.PI * 2);
      }
      ctx.fillStyle = 'rgba(95,240,183,.05)';
      ctx.fill();
    }
  }

  drawSanctuaries(ctx) {
    for (const sanctuary of this.simulation.sanctuaries) {
      if (!sanctuary || !this.isVisible(sanctuary.x, sanctuary.y, sanctuary.radius)) continue;
      const gradient = ctx.createRadialGradient(sanctuary.x, sanctuary.y, 0, sanctuary.x, sanctuary.y, sanctuary.radius);
      gradient.addColorStop(0, 'rgba(95,240,183,.13)');
      gradient.addColorStop(1, 'rgba(95,240,183,0)');
      ctx.beginPath();
      ctx.arc(sanctuary.x, sanctuary.y, sanctuary.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(95,240,183,.18)';
      ctx.setLineDash([8, 12]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }


  drawEggs(ctx) {
    for (const egg of this.simulation.eggs ?? []) {
      if (!egg || !this.isVisible(egg.x, egg.y, 70)) continue;
      const duration = Number.isFinite(egg.hatchAt) ? Math.max(.1, egg.hatchAt - egg.laidAt) : 1;
      const progress = Number.isFinite(egg.hatchAt) ? clamp((this.simulation.time - egg.laidAt) / duration, 0, 1) : 0;
      const pulse = 1 + Math.sin(this.simulation.time * 2.5 + egg.wobble) * .035;
      const wobble = progress > .55 ? Math.sin(this.simulation.time * (6 + progress * 8) + egg.wobble) * progress * .12 : 0;
      ctx.save();
      ctx.translate(egg.x, egg.y);
      ctx.rotate(wobble);
      ctx.scale(pulse, pulse);
      const radius = egg.founder ? 28 : 21;
      const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, radius * 3.2);
      aura.addColorStop(0, egg.founder ? 'rgba(255,77,99,.28)' : 'rgba(98,220,255,.22)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, 0, radius * 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = egg.founder ? 'rgba(255,77,99,.44)' : 'rgba(98,220,255,.36)';
      ctx.lineWidth = 1.5 / this.camera.zoom;
      ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.ellipse(0, radius * .62, radius * 1.25, radius * .42, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      const shell = ctx.createLinearGradient(-radius, -radius, radius, radius);
      shell.addColorStop(0, '#edf7fa'); shell.addColorStop(.45, egg.founder ? '#c8d9dc' : '#c4e8ef'); shell.addColorStop(1, egg.founder ? '#722938' : '#176777');
      ctx.fillStyle = shell; ctx.strokeStyle = 'rgba(3,8,12,.9)'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.ellipse(0, 0, radius * .7, radius, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.globalAlpha = .45; ctx.fillStyle = egg.founder ? '#ff4d63' : hsl(egg.genome?.hue ?? 190, 75, 52);
      ctx.beginPath(); ctx.ellipse(-radius * .18, radius * .05, radius * .22, radius * .72, -.18, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      if (progress > .35) {
        ctx.strokeStyle = 'rgba(15,22,28,.82)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-2, -radius * .72); ctx.lineTo(5, -radius * .48); ctx.lineTo(-3, -radius * .24); ctx.lineTo(7, -radius * .02); ctx.stroke();
      }
      if (progress > .72) {
        ctx.beginPath(); ctx.moveTo(6, -radius * .02); ctx.lineTo(-4, radius * .2); ctx.lineTo(6, radius * .42); ctx.stroke();
      }
      ctx.restore();
      if (this.camera.zoom > .45) {
        ctx.save(); ctx.font = `${Math.max(10, 12 / this.camera.zoom)}px system-ui`; ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(231,246,255,.9)'; ctx.fillText(egg.entityCode || 'HUEVO Ω', egg.x, egg.y + radius + 22 / this.camera.zoom); ctx.restore();
      }
    }
  }

  drawCreatures(ctx) {
    const zoom = this.camera.zoom;
    const perf = this.performanceActive;
    const population = this.simulation.creatures.length;
    // Viewport cacheado UNA vez por frame (getBoundingClientRect fuerza reflow: no llamarlo por criatura).
    const rect = this.canvas.getBoundingClientRect();
    const halfW = rect.width / zoom / 2;
    const halfH = rect.height / zoom / 2;
    const viewLeft = this.camera.x - halfW;
    const viewRight = this.camera.x + halfW;
    const viewTop = this.camera.y - halfH;
    const viewBottom = this.camera.y + halfH;

    // Primero contamos cuántos seres están realmente en pantalla: eso decide el nivel de detalle,
    // no la población total (con culling, dibujar 80 sprites visibles es barato aunque existan 1500).
    const visible = [];
    for (const creature of this.simulation.creatures) {
      if (!creature || !creature.genome) continue;
      const x = creature.x, y = creature.y;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const margin = 60;
      if (x < viewLeft - margin || x > viewRight + margin || y < viewTop - margin || y > viewBottom + margin) continue;
      visible.push(creature);
    }

    const onScreen = visible.length;
    // El detalle depende de cuántos hay EN PANTALLA y del zoom, no de la población global.
    let detail;
    if (zoom < .3) detail = 'micro';
    else if (perf && onScreen > 220) detail = 'micro';
    else if (onScreen > 340) detail = 'micro';
    else if (zoom < .55 || onScreen > 140) detail = 'simple';
    else detail = 'full';

    const useShadow = !perf && detail === 'full' && onScreen < 90;

    for (const creature of visible) {
      const selected = creature.id === this.selectedId;
      const bob = perf ? 0 : Math.sin(this.simulation.time * (5.2 + creature.genome.speed) + hashUnit(creature.id) * 20) * Math.min(1.3, creature.radius * .16);
      const visualRadius = Number(creature.visualRadius) || (Number(creature.radius) || 4) * 4;

      if (detail === 'micro') {
        ctx.save();
        ctx.translate(creature.x, creature.y + bob);
        this.drawMicroCreature(ctx, creature);
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(creature.x, creature.y + bob);
        const growth = Number(creature.growthScale) || 1;
        ctx.scale(growth, growth);
        if (Number.isFinite(creature.angle) && Math.cos(creature.angle) < 0) ctx.scale(-1, 1);
        const sprite = this.getCreatureSprite(creature, detail);
        const size = creature.radius * (detail === 'full' ? 9.4 : 8.2) * (1 + creature.appearance.fluff * .06);
        if (useShadow) {
          ctx.shadowColor = hsl(creature.appearance.accentHue, 90, 55, .5);
          ctx.shadowBlur = selected ? 16 : 6;
        }
        ctx.drawImage(sprite, -size * .5, -size * .5, size, size);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      if (selected) this.drawSelection(ctx, creature, visualRadius);
      if ((selected || creature.speechUntil > this.simulation.time) && creature.lastSpeech) this.drawSpeechBubble(ctx, creature);
      if (selected && zoom > .48) this.drawNameplate(ctx, creature, visualRadius);
    }
  }

  drawMicroCreature(ctx, creature) {
    drawEldritchMicro(ctx, creature, this.camera.zoom);
  }

  drawSelection(ctx, creature, visualRadius) {
    const pulse = 1 + Math.sin(this.simulation.time * 5) * .05;
    ctx.save();
    ctx.translate(creature.x, creature.y);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.4 / this.camera.zoom;
    ctx.beginPath();
    ctx.arc(0, 0, visualRadius * 1.04 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = hsl(creature.genome.hue, 90, 65, .48);
    ctx.lineWidth = .85 / this.camera.zoom;
    ctx.beginPath();
    ctx.arc(0, 0, creature.genome.vision, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawNameplate(ctx, creature, visualRadius) {
    const fontSize = 10 / this.camera.zoom;
    ctx.save();
    ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = `${creature.name} · ${creature.personality}`;
    const width = ctx.measureText(text).width + 14 / this.camera.zoom;
    const height = 20 / this.camera.zoom;
    const y = creature.y + visualRadius + 11 / this.camera.zoom;
    roundedRect(ctx, creature.x - width / 2, y - height / 2, width, height, 7 / this.camera.zoom);
    ctx.fillStyle = 'rgba(4,8,13,.84)'; ctx.fill();
    ctx.strokeStyle = hsl(creature.genome.hue, 80, 65, .38); ctx.lineWidth = .8 / this.camera.zoom; ctx.stroke();
    ctx.fillStyle = '#eaf6ff'; ctx.fillText(text, creature.x, y);
    ctx.restore();
  }

  drawSpeechBubble(ctx, creature) {
    const text = String(creature.lastSpeech || '').slice(0, 92);
    if (!text) return;
    const fontSize = 11 / this.camera.zoom;
    const maxWidth = 170 / this.camera.zoom;
    ctx.save();
    ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
    const lines = wrapText(ctx, text, maxWidth, 3);
    const lineHeight = 15 / this.camera.zoom;
    const padding = 9 / this.camera.zoom;
    const width = Math.min(maxWidth, Math.max(...lines.map(line => ctx.measureText(line).width), 48 / this.camera.zoom)) + padding * 2;
    const height = lines.length * lineHeight + padding * 1.5;
    const x = creature.x + (Number(creature.visualRadius) || 20) * .75;
    const y = creature.y - (Number(creature.visualRadius) || 20) - height - 10 / this.camera.zoom;
    roundedRect(ctx, x, y, width, height, 9 / this.camera.zoom);
    ctx.fillStyle = 'rgba(5,12,18,.92)'; ctx.fill();
    ctx.strokeStyle = 'rgba(98,220,255,.55)'; ctx.lineWidth = 1 / this.camera.zoom; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 14 / this.camera.zoom, y + height);
    ctx.lineTo(x + 21 / this.camera.zoom, y + height + 8 / this.camera.zoom);
    ctx.lineTo(x + 30 / this.camera.zoom, y + height);
    ctx.closePath(); ctx.fillStyle = 'rgba(5,12,18,.92)'; ctx.fill();
    ctx.fillStyle = '#dff8ff';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    lines.forEach((line, index) => ctx.fillText(line, x + padding, y + padding * .65 + index * lineHeight));
    ctx.restore();
  }

  getCreatureSprite(creature, detail = 'full') {
    const a = creature.appearance;
    const archetype = creature._archetype || (creature._archetype = archetypeFor(creature));
    // La clave incluye el arquetipo (la silueta) además de los genes visuales discretizados.
    const key = ['eld', archetype, detail, Math.round(creature.genome.hue / 14), Math.round(a.accentHue / 16),
      Math.round(a.eyeSize * 3), Math.round(a.fluff * 3), Math.round(a.darkness * 4)].join(':');
    if (this.spriteCache.has(key)) return this.spriteCache.get(key);
    const canvas = document.createElement('canvas');
    // Baja resolución = píxeles cuadrados reales estilo 16-bit. Al escalarse sin suavizado se ve pixelado.
    const size = detail === 'full' ? 96 : 64;
    canvas.width = size;
    canvas.height = size;
    paintEldritchSprite(canvas, creature, detail);
    if (this.spriteCache.size >= this.maxSpriteCache) this.spriteCache.delete(this.spriteCache.keys().next().value);
    this.spriteCache.set(key, canvas);
    return canvas;
  }

  drawPortrait(canvas, creature) {
    if (!(canvas instanceof HTMLCanvasElement) || !creature) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = Math.max(52, canvas.getBoundingClientRect().width || 64);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const gradient = ctx.createRadialGradient(size * .5, size * .4, 2, size * .5, size * .5, size * .7);
    gradient.addColorStop(0, hsl(creature.genome.hue, 70, 55, .24));
    gradient.addColorStop(1, 'rgba(5,8,13,.1)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = false;
    const sprite = this.getCreatureSprite(creature, 'full');
    ctx.drawImage(sprite, size * .06, size * .06, size * .88, size * .88);
  }

  isVisible(x, y, margin = 0) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    const rect = this.canvas.getBoundingClientRect();
    const halfWidth = rect.width / this.camera.zoom / 2 + margin;
    const halfHeight = rect.height / this.camera.zoom / 2 + margin;
    return x > this.camera.x - halfWidth && x < this.camera.x + halfWidth && y > this.camera.y - halfHeight && y < this.camera.y + halfHeight;
  }

  drawVignette(ctx, width, height) {
    const edge = Math.max(20, Math.min(width, height) * .075);
    ctx.fillStyle = 'rgba(0,0,0,.34)';
    ctx.fillRect(0, 0, width, edge);
    ctx.fillRect(0, height - edge, width, edge);
    ctx.fillRect(0, edge, edge, height - edge * 2);
    ctx.fillRect(width - edge, edge, edge, height - edge * 2);
    ctx.fillStyle = 'rgba(255,255,255,.018)';
    for (let y = 0; y < height; y += 4) ctx.fillRect(0, y, width, 1);
  }
}

function drawEllipse(ctx, x, y, rx, ry, rotation, fill, stroke, lineWidth = 3) {
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rotation, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
}

function drawEar(ctx, rootX, rootY, tipX, tipY, baseX, baseY, fill, inner, outline) {
  ctx.beginPath();
  ctx.moveTo(rootX, rootY);
  ctx.quadraticCurveTo((rootX + tipX) * .5, tipY - 8, tipX, tipY);
  ctx.quadraticCurveTo((tipX + baseX) * .52, baseY + 8, baseX, baseY);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = outline; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rootX - 1, rootY - 2);
  ctx.quadraticCurveTo(tipX * .72, tipY * .75, tipX * .78, tipY * .78);
  ctx.quadraticCurveTo(baseX * .7, baseY + 1, baseX - 2, baseY - 2);
  ctx.closePath(); ctx.fillStyle = inner; ctx.globalAlpha = .75; ctx.fill(); ctx.globalAlpha = 1;
}

function drawEye(ctx, x, y, radius, hue) {
  drawEllipse(ctx, x, y, radius, radius * 1.12, 0, '#f5fbff', 'rgba(8,12,16,.9)', 2.2);
  drawEllipse(ctx, x + radius * .18, y + radius * .08, radius * .58, radius * .67, 0, hsl(hue, 68, 52), 'rgba(5,9,12,.8)', 1.5);
  drawEllipse(ctx, x + radius * .28, y + radius * .12, radius * .3, radius * .38, 0, '#071016', null);
  drawEllipse(ctx, x + radius * .02, y - radius * .25, radius * .19, radius * .21, 0, 'rgba(255,255,255,.95)', null);
  drawEllipse(ctx, x + radius * .42, y + radius * .34, radius * .09, radius * .1, 0, 'rgba(255,255,255,.65)', null);
}

function drawPattern(ctx, pattern, accent, dark, detail) {
  if (pattern === 0) {
    ctx.beginPath(); ctx.moveTo(-1, -28); ctx.quadraticCurveTo(10, -6, 15, 17); ctx.quadraticCurveTo(-2, 10, -13, -8); ctx.closePath(); ctx.fillStyle = accent; ctx.globalAlpha = .66; ctx.fill(); ctx.globalAlpha = 1;
  } else if (pattern === 1) {
    ctx.strokeStyle = dark; ctx.lineWidth = detail === 'full' ? 6 : 7; ctx.globalAlpha = .72;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-34 + i * 10, -8); ctx.quadraticCurveTo(-20 + i * 8, 3, -28 + i * 10, 18); ctx.stroke(); }
    ctx.globalAlpha = 1;
  } else if (pattern === 2) {
    ctx.fillStyle = accent; ctx.globalAlpha = .7;
    for (const [x, y, r] of [[-24,-8,7],[-12,8,5],[3,-27,7],[24,6,5]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = dark; ctx.globalAlpha = .6;
    ctx.beginPath(); ctx.moveTo(-25,-19); ctx.lineTo(-7,-29); ctx.lineTo(4,-6); ctx.lineTo(-15,0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(15,-31); ctx.lineTo(34,-26); ctx.lineTo(28,-5); ctx.lineTo(10,-10); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawFurTufts(ctx, fill, outline, fluff) {
  ctx.fillStyle = fill; ctx.strokeStyle = outline; ctx.lineWidth = 2.2;
  const points = [[-17,-33,-23,-45,-8,-36],[2,-38,7,-50,15,-36],[29,-31,39,-42,38,-26],[-38,-4,-49,-8,-38,8],[-28,24,-38,35,-20,31]];
  for (const [x1,y1,x2,y2,x3,y3] of points) {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2 * fluff,y2 * fluff); ctx.lineTo(x3,y3); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}

function drawClaws(ctx, x, y, rotation) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.strokeStyle = 'rgba(230,236,242,.55)'; ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 3, 0); ctx.lineTo(i * 3 + 1, 5); ctx.stroke(); }
  ctx.restore();
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + width - r, y); ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r); ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function wrapText(ctx, text, maxWidth, maxLines) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth || !current) current = trial;
    else { lines.push(current); current = word; }
    if (lines.length === maxLines - 1) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  const used = lines.join(' ').split(/\s+/).length;
  if (used < words.length && lines.length) lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.…]+$/, '')}…`;
  return lines.length ? lines : ['…'];
}

function hashUnit(value) {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0) / 4294967295;
}


/* ===== ui.js ===== */
const TOOL_COPY = Object.freeze({
  inspect: ['Inspeccionar', 'Pulsa sobre una criatura para ver su ADN.'],
  food: ['Sembrar energía', 'Pulsa en el mundo para añadir alimento.'],
  spawn: ['Crear vida', 'Pulsa en el mundo para colocar un huevo programado.'],
  radiation: ['Radiación', 'Pulsa en el mundo para mutar organismos cercanos.'],
  meteor: ['Meteorito', 'Pulsa en el mundo para provocar una extinción local.'],
  sanctuary: ['Santuario', 'Pulsa en el mundo para crear una zona fértil.']
});

class UI {
  constructor(simulation, renderer) {
    this.simulation = simulation;
    this.renderer = renderer;
    this.selectedId = null;
    this.selectedGrandProjectId = null;
    this.currentTool = 'inspect';
    this.deferredInstall = null;
    this.lastPopulation = 0;
    this.toastTimer = null;
    this.armedGenome = null;
    this.serviceWorkerRegistration = null;
    this.recognition = null;
    this.isListening = false;
    this.cameraPointers = new Map();
    this.pinchState = null;
    this.lastAutoSpeechKey = '';
    this.autoSpeak = readBooleanSetting('genesis-auto-speak', false);
    this.masterVolume = readNumberSetting('genesis-volume', .8, 0, 1);
    this.qualityMode = readStringSetting('genesis-quality', 'auto', ['auto', 'alta', 'rendimiento']);
    this.renderer.setQualityMode(this.qualityMode);
    this.els = collectRequiredElements();
    this.bind();
    this.bindGenesis();
    this.renderTimeline();
    this.updateControlsFromSimulation();
    this.activateTool('inspect', false);
    this.updatePause();
    this.updateSpeechSupport();
    this.audioContext = null;
    this.simulation.workshop.onObra = obra => {
      this.toast(`Obra terminada: ${obra.title}`);
      this.renderObras();
    };
    this.renderObras();
    this.renderCollective();
    this.renderCivilization();
    this.renderLegacy();
    this.simulation.grandProjects.onChange = project => {
      if (!this.selectedGrandProjectId) this.selectedGrandProjectId = project.id;
      this.renderGrandProjects();
    };
    this.renderGrandProjects();
  }

  get selected() {
    if (!this.selectedId) return null;
    return this.simulation.creatures.find(creature => creature?.id === this.selectedId) ?? null;
  }

  bind() {
    this.els.pauseBtn.addEventListener('click', () => {
      if (this.simulation.genesis?.phase === 'dormant') { this.els.startGenesisBtn.click(); return; }
      this.simulation.paused = !this.simulation.paused;
      this.updatePause();
    });

    document.querySelectorAll('.speed-btn').forEach(button => button.addEventListener('click', () => {
      this.simulation.speed = Number(button.dataset.speed) || 1;
      this.updateSpeedButtons();
      this.toast(`Velocidad de simulación: ${this.simulation.speed}×`);
    }));

    document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => this.activateTab(button.dataset.tab)));
    document.querySelectorAll('.tool-btn').forEach(button => button.addEventListener('click', () => this.activateTool(button.dataset.tool)));

    this.els.deliverAllBtn.addEventListener('click', () => {
      const obras = this.simulation.workshop.obras;
      if (!obras.length) return;
      const file = collectionToFile(obras, this.simulation);
      this.downloadFile(file);
      for (const obra of obras) obra.delivered = true;
      this.renderObras();
      this.toast(`Códice completo entregado: ${obras.length} obras`);
    });

    this.els.obraList.addEventListener('click', event => {
      const target = event.target.closest('button[data-obra]');
      if (!target) return;
      const obra = this.simulation.workshop.obras.find(item => item.id === target.dataset.obra);
      if (!obra) return;
      if (target.dataset.action === 'deliver') {
        this.downloadFile(obraToFile(obra));
        obra.delivered = true;
        this.renderObras();
        this.toast(`Obra entregada: ${obra.title}`);
      } else if (target.dataset.action === 'play') {
        this.playSong(obra, target);
      }
    });

    this.els.mutationRange.addEventListener('input', event => {
      this.simulation.environmentMutation = Number(event.target.value);
      this.els.mutationOutput.textContent = `${this.simulation.environmentMutation.toFixed(1)}×`;
    });
    this.els.foodRange.addEventListener('input', event => {
      this.simulation.foodAbundance = Number(event.target.value);
      this.els.foodOutput.textContent = `${this.simulation.foodAbundance.toFixed(1)}×`;
    });
    this.els.biomeSelect.addEventListener('change', event => {
      const changed = this.simulation.setBiome(event.target.value);
      this.updateEnvironmentControls();
      if (changed) this.toast(`Nuevo bioma: ${this.simulation.getBiome().label}`);
    });
    this.els.biomeQuickSelect.addEventListener('change', event => {
      const changed = this.simulation.setBiome(event.target.value);
      this.updateEnvironmentControls();
      if (changed) this.toast(`Nuevo bioma: ${this.simulation.getBiome().label}`);
    });
    this.els.autoBiomeToggle.addEventListener('change', event => {
      this.simulation.autoBiome = Boolean(event.target.checked);
      this.simulation.lastBiomeCycleYear = this.simulation.year;
      this.toast(this.simulation.autoBiome ? 'Ciclo autónomo de biomas activado' : 'Bioma fijado manualmente');
    });
    this.els.autonomyRange.addEventListener('input', event => {
      this.simulation.setAutonomy(Number(event.target.value) / 100);
      this.els.autonomyOutput.textContent = `${Math.round(this.simulation.autonomyLevel * 100)}%`;
    });
    this.els.autoSpeakToggle.checked = this.autoSpeak;
    this.els.autoSpeakToggle.addEventListener('change', event => {
      this.autoSpeak = Boolean(event.target.checked);
      writeBooleanSetting('genesis-auto-speak', this.autoSpeak);
      this.lastAutoSpeechKey = '';
      this.toast(this.autoSpeak ? 'Voz autónoma activada para la criatura seleccionada' : 'Voz autónoma desactivada');
    });

    this.els.volumeSlider.value = String(Math.round(this.masterVolume * 100));
    this.els.volumeLabel.textContent = `${Math.round(this.masterVolume * 100)}%`;
    this.els.volumeSlider.addEventListener('input', event => {
      const percent = Math.min(100, Math.max(0, Number(event.target.value) || 0));
      this.masterVolume = percent / 100;
      this.els.volumeLabel.textContent = `${percent}%`;
      writeNumberSetting('genesis-volume', this.masterVolume);
    });

    this.els.qualitySelect.value = this.qualityMode;
    this.els.qualitySelect.addEventListener('change', event => {
      const mode = ['auto', 'alta', 'rendimiento'].includes(event.target.value) ? event.target.value : 'auto';
      this.qualityMode = mode;
      this.renderer.setQualityMode(mode);
      writeStringSetting('genesis-quality', mode);
      const labels = { auto: 'Calidad automática', alta: 'Calidad alta', rendimiento: 'Modo rendimiento activado' };
      this.toast(labels[mode]);
    });

    this.els.injectAtlasBtn.addEventListener('click', () => {
      const result = this.simulation.injectKnowledgeAtlas();
      this.renderCollective();
      this.toast(`Atlas sincronizado: ${result.learned} aprendizajes reforzados`);
    });
    this.els.collectiveProjectBtn.addEventListener('click', () => {
      const prompt = this.els.collectivePrompt.value.trim();
      if (!prompt) { this.toast('Describe primero qué quieres que cree la especie'); this.els.collectivePrompt.focus(); return; }
      const request = this.simulation.requestCollectiveProject(this.els.collectiveProjectType.value, prompt);
      this.els.collectivePrompt.value = '';
      this.renderCollective();
      this.activateTab('collective');
      this.toast(`Encargo enviado: ${request.prompt}`);
    });
    this.els.openCollectiveBtn.addEventListener('click', () => this.activateTab('collective'));
    this.els.openGrandProjectBtn.addEventListener('click', () => this.activateTab('grandproject'));
    this.els.openCivilizationBtn.addEventListener('click', () => this.activateTab('civilization'));
    this.els.openLegacyBtn.addEventListener('click', () => this.activateTab('legacy'));
    this.els.openArchiveBtn.addEventListener('click', () => this.activateTab('archive'));

    this.els.grandProjectCreateBtn.addEventListener('click', () => {
      try {
        const project = this.simulation.grandProjects.createProject(
          this.els.grandProjectType.value,
          this.els.grandProjectTitle.value,
          this.els.grandProjectBrief.value,
          this.els.grandProjectConstraints.value,
          this.simulation
        );
        this.selectedGrandProjectId = project.id;
        this.els.grandProjectTitle.value = '';
        this.els.grandProjectBrief.value = '';
        this.els.grandProjectConstraints.value = '';
        this.renderGrandProjects();
        this.activateTab('grandproject');
        this.toast(`Gran Proyecto convocado: ${project.title}`);
      } catch (error) {
        this.toast(error.message || 'No se pudo iniciar el proyecto');
      }
    });
    this.els.grandProjectList.addEventListener('click', event => {
      const button = event.target.closest('button[data-grand-project]');
      if (!button) return;
      this.selectedGrandProjectId = button.dataset.grandProject;
      this.renderGrandProjects();
    });
    this.els.grandProjectPauseBtn.addEventListener('click', () => {
      const project = this.simulation.grandProjects.find(this.selectedGrandProjectId);
      if (!project) return;
      if (project.status === 'paused') this.simulation.grandProjects.resume(project.id);
      else this.simulation.grandProjects.pause(project.id);
      this.renderGrandProjects();
    });
    this.els.grandProjectDossierBtn.addEventListener('click', () => {
      const project = this.simulation.grandProjects.find(this.selectedGrandProjectId);
      if (!project) return;
      const content = this.simulation.grandProjects.buildDossier(project.id, this.simulation);
      this.downloadFile({ filename: `${safeFilename(project.title)}-Dossier-Omega.md`, mime: 'text/markdown', content });
      project.delivered = true;
      this.renderGrandProjects();
      this.toast('Dossier del Gran Proyecto exportado');
    });
    this.els.grandProjectContextBtn.addEventListener('click', () => {
      const project = this.simulation.grandProjects.find(this.selectedGrandProjectId);
      if (!project) return;
      const content = this.simulation.grandProjects.buildContext(project.id, this.simulation);
      this.downloadFile({ filename: `${safeFilename(project.title)}-Contexto-IA.txt`, mime: 'text/plain', content });
      this.toast('Contexto trazable para IA externa exportado');
    });
    this.els.grandProjectCancelBtn.addEventListener('click', () => {
      const project = this.simulation.grandProjects.find(this.selectedGrandProjectId);
      if (!project || project.status === 'completed') return;
      if (!confirm(`¿Archivar «${project.title}»?`)) return;
      this.simulation.grandProjects.cancel(project.id, this.simulation);
      this.renderGrandProjects();
      this.toast('Proyecto archivado');
    });
    this.els.grandProjectIntegrateBtn.addEventListener('click', () => {
      const text = this.els.grandProjectExternalInput.value;
      const result = this.simulation.grandProjects.integrateInsight(this.selectedGrandProjectId, text, this.simulation);
      if (!result.accepted) { this.toast(result.reason || 'No se pudo integrar'); return; }
      this.els.grandProjectExternalInput.value = '';
      this.renderGrandProjects();
      this.toast(`${result.fragments} ideas revisadas integradas`);
    });

    this.els.exportOracleBtn.addEventListener('click', () => {
      const content = this.simulation.civilization.buildAIContext(this.simulation, this.els.oracleQuestion.value);
      this.downloadFile({ filename: `Genesis-Omega-Contexto-IA-Ano-${this.simulation.year.toFixed(1).replace('.', '-')}.txt`, mime: 'text/plain', content });
      this.els.oracleStatus.textContent = 'Paquete exportado. Consúltalo manualmente y revisa la respuesta antes de integrarla.';
      this.toast('Paquete de contexto para IA externa exportado');
    });
    this.els.integrateOracleBtn.addEventListener('click', () => {
      const result = this.simulation.civilization.absorbExternalWisdom(this.els.oracleResponse.value, this.simulation);
      if (!result.accepted) { this.toast(result.reason || 'No se pudo integrar la respuesta'); return; }
      this.els.oracleResponse.value = '';
      this.els.oracleStatus.textContent = `${result.fragments} ideas validadas; ${result.learned} aprendizajes individuales reforzados.`;
      this.renderCivilization();
      this.renderCollective();
      this.toast('Sabiduría externa revisada e integrada');
    });

    this.bindProgramEditor();

    this.els.pulseBtn.addEventListener('click', () => {
      const mutations = this.simulation.evolutionaryPulse();
      this.toast(`Pulso evolutivo: ${mutations} genomas alterados`);
    });

    this.els.resetBtn.addEventListener('click', () => {
      if (!confirm('¿Reiniciar el mundo? La instantánea guardada no se borrará.')) return;
      this.simulation.reset();
      this.renderer.resetCamera();
      this.els.genesisIntro.hidden = false;
      this.clearSelection();
      this.updateControlsFromSimulation();
      this.updateMetrics(60);
      this.renderTimeline();
      this.toast('Nuevo mundo generado');
    });

    this.els.cameraResetBtn.addEventListener('click', () => {
      this.renderer.resetCamera();
      this.els.followBtn.textContent = 'Seguir organismo';
      this.updateCameraReadout();
      this.toast('Mundo completo encajado');
    });
    this.els.cameraZoomOutBtn.addEventListener('click', () => this.zoomFromCenter(.8));
    this.els.cameraZoomInBtn.addEventListener('click', () => this.zoomFromCenter(1.25));

    this.els.cinemaBtn.addEventListener('click', () => this.toggleCinema());
    this.els.cinemaExitBtn.addEventListener('click', () => this.toggleCinema(false));

    this.els.helpBtn.addEventListener('click', () => {
      if (typeof this.els.helpDialog.showModal === 'function') this.els.helpDialog.showModal();
      else this.els.helpDialog.setAttribute('open', '');
    });

    this.els.followBtn.addEventListener('click', () => {
      const selected = this.selected;
      if (!selected) { this.clearSelection(); return; }
      const isFollowing = this.renderer.followId === selected.id;
      if (isFollowing) this.renderer.clearFollow();
      else this.renderer.setFollow(selected.id);
      this.els.followBtn.textContent = isFollowing ? 'Seguir organismo' : 'Dejar de seguir';
    });

    this.els.teachForm.addEventListener('submit', event => {
      event.preventDefault();
      const text = this.els.teachInput.value.trim();
      if (!text) { this.toast('Escribe una pregunta o una regla'); return; }
      this.els.teachInput.value = '';
      this.interactWithSelected(text, true);
    });
    this.els.listenBtn.addEventListener('click', () => this.startListening());
    this.els.speakBtn.addEventListener('click', () => {
      const selected = this.selected;
      if (!selected) { this.toast('Selecciona primero una criatura'); return; }
      const last = [...selected.dialogue].reverse().find(item => item.role === 'creature')?.text;
      const text = last || `Soy ${selected.name}. Estoy ${selected.state} y puedo aprender de ti.`;
      selected.lastSpeech = text;
      selected.speechUntil = this.simulation.time + 7;
      this.speakText(text, selected);
    });

    this.els.saveBtn.addEventListener('click', () => this.save());
    this.els.quickSaveBtn.addEventListener('click', () => this.save());
    this.els.loadBtn.addEventListener('click', () => this.load());
    this.els.quickLoadBtn.addEventListener('click', () => this.load());
    this.els.clearSaveBtn.addEventListener('click', () => this.clearSave());
    const exportWorld = () => {
      try {
        downloadJSON(this.simulation.serialize(), `genesis-omega-${Date.now()}.json`);
        this.toast('Mundo exportado');
      } catch (error) {
        console.error(error);
        this.toast('No se pudo exportar el mundo');
      }
    };
    this.els.exportBtn.addEventListener('click', exportWorld);
    this.els.quickExportBtn.addEventListener('click', exportWorld);
    this.els.importInput.addEventListener('change', event => this.importFile(event.target.files?.[0]));
    this.els.quickImportInput.addEventListener('change', event => this.importFile(event.target.files?.[0]));
    this.els.downloadAllSavesBtn.addEventListener('click', () => this.downloadAllSaves().catch(error => {
      console.error(error);
      this.toast('No se pudo crear la copia de seguridad');
    }));
    this.els.worldCanvas.addEventListener('click', event => this.onWorldClick(event));

    this.bindCamera();
    this.bindInstall();

    this.simulation.onEvent = () => this.renderTimeline();
    this.simulation.onSelectionInvalidated = id => {
      if (this.selectedId === id) this.clearSelection();
    };
  }

  bindGenesis() {
    this.els.startGenesisBtn.addEventListener('click', () => {
      if (!this.simulation.beginGenesis()) return;
      this.els.genesisIntro.hidden = true;
      this.updatePause();
      this.updateGenesisPanel();
      this.toast('Protocolo iniciado: Ω-001 está despertando');
    });
    this.simulation.onHatch = (creature, egg) => {
      this.updateGenesisPanel();
      if (egg?.founder) {
        this.selectCreature(creature);
        this.renderer.setFollow(creature.id);
        this.renderer.setZoom(Math.max(this.renderer.camera.zoom, 1.45));
        this.updateCameraReadout();
        this.toast('Ω-001 ha nacido. Háblale desde el panel Ciencia.');
      } else {
        this.toast(`${creature.entityCode || creature.name} ha nacido`);
      }
    };
  }

  bindProgramEditor() {
    const profiles = {
      explorer: { name: 'Linaje Explorador', hue: 190, speed: 1.35, vision: 195, sociability: .45, curiosity: .9, aggression: .18, efficiency: 1.05, note: 'Explora, recuerda e imita rutas fértiles.' },
      cooperative: { name: 'Linaje Cooperativo', hue: 145, speed: 1.05, vision: 155, sociability: .92, curiosity: .58, aggression: .05, efficiency: 1.2, note: 'Comparte información y permanece cerca del grupo.' },
      survivor: { name: 'Linaje Superviviente', hue: 48, speed: .88, vision: 130, sociability: .52, curiosity: .35, aggression: .15, efficiency: 1.5, note: 'Consume poco, vive más y resiste épocas de escasez.' },
      predator: { name: 'Linaje Depredador', hue: 350, speed: 1.75, vision: 175, sociability: .2, curiosity: .62, aggression: .95, efficiency: .82, note: 'Rápido, territorial y costoso de mantener.' },
      balanced: { name: 'Linaje Equilibrado', hue: 275, speed: 1.15, vision: 150, sociability: .58, curiosity: .62, aggression: .28, efficiency: 1.12, note: 'Sin extremos; adaptable a cambios graduales.' }
    };
    const fields = {
      speed: ['progSpeed', 'progSpeedOut', 2], vision: ['progVision', 'progVisionOut', 0],
      sociability: ['progSocial', 'progSocialOut', 2], curiosity: ['progCuriosity', 'progCuriosityOut', 2],
      aggression: ['progAggression', 'progAggressionOut', 2], efficiency: ['progEfficiency', 'progEfficiencyOut', 2]
    };

    const refresh = () => {
      for (const [, [inputId, outputId, decimals]] of Object.entries(fields)) {
        this.els[outputId].textContent = Number(this.els[inputId].value).toFixed(decimals);
      }
    };

    const applyProfile = key => {
      const profile = profiles[key] ?? profiles.explorer;
      for (const [gene, [inputId]] of Object.entries(fields)) this.els[inputId].value = profile[gene];
      this.els.programName.textContent = profile.name;
      this.els.programNote.textContent = profile.note;
      this.els.programOrb.style.background = hsl(profile.hue, 82, 62);
      this.els.programOrb.style.boxShadow = `0 0 24px ${hsl(profile.hue, 82, 62, .55)}`;
      refresh();
    };

    this.els.profileSelect.addEventListener('change', event => applyProfile(event.target.value));
    for (const [, [inputId]] of Object.entries(fields)) this.els[inputId].addEventListener('input', refresh);
    this.els.armLineageBtn.addEventListener('click', () => {
      const profile = profiles[this.els.profileSelect.value] ?? profiles.explorer;
      const genome = randomGenome(profile.hue);
      genome.speed = Number(this.els.progSpeed.value);
      genome.vision = Number(this.els.progVision.value);
      genome.sociability = Number(this.els.progSocial.value);
      genome.curiosity = Number(this.els.progCuriosity.value);
      genome.aggression = Number(this.els.progAggression.value);
      genome.efficiency = Number(this.els.progEfficiency.value);
      if (this.els.profileSelect.value === 'survivor') { genome.metabolism = .58; genome.longevity = 132; }
      if (this.els.profileSelect.value === 'predator') { genome.size = 6.8; genome.metabolism = 1.42; }
      if (this.els.profileSelect.value === 'cooperative') { genome.memory = .92; genome.fertility = 1.18; }
      this.armedGenome = genome;
      this.activateTool('spawn', false);
      this.activateTab('god');
      this.toast('Huevo armado: pulsa en el mundo para iniciar su incubación');
    });
    applyProfile('explorer');
  }

  bindCamera() {
    const canvas = this.els.worldCanvas;
    const pointerList = () => [...this.cameraPointers.values()];
    const pointerDistance = points => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    const pointerCenter = points => ({ x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 });

    canvas.addEventListener('wheel', event => {
      event.preventDefault();
      this.renderer.clearFollow();
      this.els.followBtn.textContent = 'Seguir organismo';
      const factor = Math.exp(-Math.max(-180, Math.min(180, event.deltaY)) * .0018);
      this.renderer.zoomAt(event.clientX, event.clientY, factor);
      this.updateCameraReadout();
    }, { passive: false });

    canvas.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      canvas.focus({ preventScroll: true });
      this.cameraPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      this.renderer.dragging = true;
      this.renderer.lastPointer = { x: event.clientX, y: event.clientY, moved: false };
      try { canvas.setPointerCapture(event.pointerId); } catch { /* Captura no disponible. */ }
      const points = pointerList();
      if (points.length >= 2) {
        const center = pointerCenter(points);
        this.pinchState = {
          distance: Math.max(1, pointerDistance(points)),
          zoom: this.renderer.camera.zoom,
          world: this.renderer.screenToWorld(center.x, center.y)
        };
        this.renderer.lastPointer.moved = true;
      }
    });

    canvas.addEventListener('pointermove', event => {
      if (!this.cameraPointers.has(event.pointerId)) return;
      this.cameraPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const points = pointerList();
      if (points.length >= 2) {
        if (!this.pinchState) {
          const center = pointerCenter(points);
          this.pinchState = {
            distance: Math.max(1, pointerDistance(points)),
            zoom: this.renderer.camera.zoom,
            world: this.renderer.screenToWorld(center.x, center.y)
          };
        }
        const center = pointerCenter(points);
        const ratio = pointerDistance(points) / Math.max(1, this.pinchState.distance);
        const nextZoom = Math.max(this.renderer.getMinZoom(), Math.min(this.renderer.getMaxZoom(), this.pinchState.zoom * ratio));
        const rect = canvas.getBoundingClientRect();
        this.renderer.camera.zoom = nextZoom;
        this.renderer.camera.x = this.pinchState.world.x - (center.x - rect.left - rect.width / 2) / nextZoom;
        this.renderer.camera.y = this.pinchState.world.y - (center.y - rect.top - rect.height / 2) / nextZoom;
        this.renderer.clampCamera();
        this.renderer.clearFollow();
        this.els.followBtn.textContent = 'Seguir organismo';
        if (this.renderer.lastPointer) this.renderer.lastPointer.moved = true;
        this.updateCameraReadout();
        return;
      }

      if (!this.renderer.dragging || !this.renderer.lastPointer) return;
      const dx = event.clientX - this.renderer.lastPointer.x;
      const dy = event.clientY - this.renderer.lastPointer.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) {
        this.renderer.clearFollow();
        this.els.followBtn.textContent = 'Seguir organismo';
        this.renderer.camera.x -= dx / this.renderer.camera.zoom;
        this.renderer.camera.y -= dy / this.renderer.camera.zoom;
        this.renderer.clampCamera();
        this.renderer.lastPointer = { x: event.clientX, y: event.clientY, moved: true };
      }
    });

    const endPointer = event => {
      this.cameraPointers.delete(event.pointerId);
      if (this.cameraPointers.size < 2) this.pinchState = null;
      if (this.cameraPointers.size === 0) this.renderer.dragging = false;
      try { canvas.releasePointerCapture(event.pointerId); } catch { /* Captura inexistente. */ }
    };
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('lostpointercapture', endPointer);

    canvas.addEventListener('keydown', event => {
      const pan = 90 / this.renderer.camera.zoom;
      if (event.key === 'ArrowLeft') this.renderer.camera.x -= pan;
      else if (event.key === 'ArrowRight') this.renderer.camera.x += pan;
      else if (event.key === 'ArrowUp') this.renderer.camera.y -= pan;
      else if (event.key === 'ArrowDown') this.renderer.camera.y += pan;
      else if (event.key === '+' || event.key === '=') this.zoomFromCenter(1.2);
      else if (event.key === '-' || event.key === '_') this.zoomFromCenter(.83);
      else if (event.key === '0') this.renderer.resetCamera();
      else if (event.key === 'Enter') {
        const rect = canvas.getBoundingClientRect();
        this.onWorldClick({ clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 });
      } else return;
      this.renderer.clampCamera();
      this.updateCameraReadout();
      event.preventDefault();
    });

    const tabs = [...document.querySelectorAll('.tab')];
    tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      this.activateTab(tabs[next].dataset.tab);
    }));
  }

  zoomFromCenter(factor) {
    const rect = this.els.worldCanvas.getBoundingClientRect();
    this.renderer.clearFollow();
    this.els.followBtn.textContent = 'Seguir organismo';
    this.renderer.zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
    this.updateCameraReadout();
  }

  updateCameraReadout() {
    const percent = Math.round(this.renderer.camera.zoom * 100);
    this.els.cameraZoomLabel.textContent = `${percent}%`;
    const atMin = this.renderer.camera.zoom <= this.renderer.getMinZoom() * 1.015;
    const atMax = this.renderer.camera.zoom >= this.renderer.getMaxZoom() * .985;
    this.els.cameraZoomOutBtn.disabled = atMin;
    this.els.cameraZoomInBtn.disabled = atMax;
  }

  bindInstall() {
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      this.deferredInstall = event;
      this.els.installBtn.hidden = false;
    });
    window.addEventListener('appinstalled', () => {
      this.deferredInstall = null;
      this.els.installBtn.hidden = true;
      this.toast('Proyecto Génesis Ω instalado');
    });
    this.els.installBtn.addEventListener('click', async () => {
      if (!this.deferredInstall) {
        this.toast('La instalación no está disponible en este navegador');
        return;
      }
      this.deferredInstall.prompt();
      await this.deferredInstall.userChoice;
      this.deferredInstall = null;
      this.els.installBtn.hidden = true;
    });
  }

  configureServiceWorker(registration) {
    this.serviceWorkerRegistration = registration;
    if (registration?.waiting) this.showUpdateAvailable();
    registration?.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) this.showUpdateAvailable();
      });
    });
    this.els.updateBtn.addEventListener('click', () => {
      const worker = this.serviceWorkerRegistration?.waiting;
      if (!worker) { location.reload(); return; }
      worker.postMessage({ type: 'SKIP_WAITING' });
    }, { once: true });
    let refreshing = false;
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });
  }

  showUpdateAvailable() {
    this.els.updateBtn.hidden = false;
    this.els.saveState.textContent = 'Actualización disponible';
  }

  activateTool(name, announce = true) {
    const safeName = TOOL_COPY[name] ? name : 'inspect';
    this.currentTool = safeName;
    document.querySelectorAll('.tool-btn').forEach(button => {
      const active = button.dataset.tool === safeName;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const [label, hint] = TOOL_COPY[safeName];
    this.els.activeToolLabel.textContent = label;
    this.els.toolHint.textContent = hint;
    this.els.worldCanvas.dataset.tool = safeName;
    if (announce) this.toast(`${label}: ${hint}`);
  }

  onWorldClick(event) {
    if (this.renderer.lastPointer?.moved) {
      this.renderer.lastPointer = null;
      return;
    }
    this.renderer.lastPointer = null;
    const point = this.renderer.screenToWorld(event.clientX, event.clientY);
    const tool = this.currentTool;
    if (tool === 'food') { this.simulation.addFoodBurst(point.x, point.y); this.toast('Energía sembrada'); return; }
    if (tool === 'spawn') {
      const speciesId = this.simulation.spawnCreature(point.x, point.y, this.armedGenome);
      this.toast(speciesId ? `Huevo del Linaje ${String(speciesId).padStart(2, '0')} incubándose` : 'Límite de población alcanzado');
      return;
    }
    if (tool === 'radiation') { this.toast(`${this.simulation.applyRadiation(point.x, point.y)} organismos mutados`); return; }
    if (tool === 'meteor') { this.toast(`Impacto registrado: ${this.simulation.applyMeteor(point.x, point.y)} bajas`); return; }
    if (tool === 'sanctuary') { this.simulation.addSanctuary(point.x, point.y); this.toast('Santuario establecido'); return; }

    let nearestEgg = null;
    let bestEgg = Infinity;
    for (const egg of this.simulation.eggs ?? []) {
      const distance = (egg.x - point.x) ** 2 + (egg.y - point.y) ** 2;
      const hitRadius = Math.max(30 / this.renderer.camera.zoom, egg.founder ? 34 : 27);
      if (distance < hitRadius ** 2 && distance < bestEgg) { bestEgg = distance; nearestEgg = egg; }
    }
    if (nearestEgg) {
      const duration = Number.isFinite(nearestEgg.hatchAt) ? Math.max(.1, nearestEgg.hatchAt - nearestEgg.laidAt) : 1;
      const progress = Number.isFinite(nearestEgg.hatchAt) ? Math.round(Math.max(0, Math.min(1, (this.simulation.time - nearestEgg.laidAt) / duration)) * 100) : 0;
      this.toast(`${nearestEgg.entityCode || 'Huevo Ω'} · incubación ${progress}%`);
      return;
    }

    let nearest = null;
    let best = Infinity;
    for (const creature of this.simulation.creatureGrid.query(point.x, point.y, 70 / this.renderer.camera.zoom)) {
      if (!creature) continue;
      const distance = (creature.x - point.x) ** 2 + (creature.y - point.y) ** 2;
      const hitRadius = Math.max(24 / this.renderer.camera.zoom, Number(creature.visualRadius) || creature.radius * 4);
      if (distance < hitRadius ** 2 && distance < best) { best = distance; nearest = creature; }
    }
    if (nearest) this.selectCreature(nearest);
    else { this.clearSelection(); this.toast('No hay ningún organismo en ese punto'); }
  }

  selectCreature(creature) {
    if (!creature?.id) return this.clearSelection();
    this.selectedId = creature.id;
    this.renderer.selectedId = creature.id;
    this.activateTab('science');
    this.renderInspector();
  }

  clearSelection() {
    this.selectedId = null;
    this.selectedGrandProjectId = null;
    this.renderer.selectedId = null;
    this.renderer.clearFollow();
    this.els.followBtn.textContent = 'Seguir organismo';
    this.els.selectionEmpty.hidden = false;
    this.els.creatureInspector.hidden = true;
  }

  renderInspector() {
    const creature = this.selected;
    if (!creature || creature.dead || !creature.genome) return this.clearSelection();
    this.els.selectionEmpty.hidden = true;
    this.els.creatureInspector.hidden = false;
    const speciesName = archetypeName(creature._archetype || (creature._archetype = archetypeFor(creature)));
    this.els.creatureName.textContent = creature.name || `Entidad ${String(creature.id).slice(-5).toUpperCase()}`;
    this.els.creatureMeta.textContent = `${speciesName} · Linaje ${String(creature.speciesId).padStart(2, '0')} · Gen. ${creature.generation} · ${creature.lifeStage} · ${creature.state || 'explorar'}`;
    this.renderer.drawPortrait(this.els.creaturePortrait, creature);
    this.els.energyFill.style.width = `${Math.min(100, Math.max(0, creature.energy / creature.maxEnergy * 100))}%`;
    this.els.personalityValue.textContent = creature.personality || 'Curioso';
    this.els.bondValue.textContent = `${Math.round((creature.bond || 0) * 100)}%`;
    this.els.knowledgeValue.textContent = creature.knowledge?.length ?? 0;
    this.els.moodValue.textContent = creature.mood || 'sereno';
    this.els.goalValue.textContent = creature.goal || 'explorar';
    this.els.autonomyValue.textContent = `${Math.round((creature.autonomy || .5) * this.simulation.autonomyLevel * 100)}%`;
    const socialProfile = this.simulation.civilization?.society?.getProfile(creature.id);
    const socialFaction = this.simulation.civilization?.society?.getFaction(socialProfile?.factionId);
    this.els.factionValue.textContent = socialFaction ? `${socialFaction.symbol} ${socialFaction.name}` : 'Sin afiliación';
    this.els.socialRankValue.textContent = socialProfile?.title || (socialFaction?.leaderId === creature.id ? 'Líder de facción' : 'Habitante');
    this.els.loyaltyValue.textContent = socialProfile ? `${Math.round(socialProfile.loyalty * 100)}%` : '—';
    const legacyProfile = this.simulation.legacy?.getProfile?.(creature.id);
    this.els.callingValue.textContent = legacyProfile?.calling || 'Sin vocación definida';
    this.els.lifeGoalValue.textContent = legacyProfile?.lifeGoal || 'Encontrar un propósito';
    this.els.hopeValue.textContent = legacyProfile ? `${Math.round(legacyProfile.hope * 100)}%` : '—';
    this.els.fearValue.textContent = legacyProfile ? `${Math.round(legacyProfile.fear * 100)}%` : '—';
    this.els.traumaValue.textContent = String(legacyProfile?.traumas?.length ?? 0);
    const skill = SKILLS[deriveSkill(creature)];
    this.els.creatureMeta.textContent += ` · ${skill ? `${skill.icon} ${skill.label}` : ''}`;
    this.els.geneList.replaceChildren(...Object.entries(GENE_LABELS).map(([key, label]) => {
      const article = document.createElement('article');
      const name = document.createElement('span');
      const value = document.createElement('b');
      name.textContent = label;
      const numeric = Number(creature.genome[key]);
      value.textContent = Number.isFinite(numeric) ? (key === 'vision' || key === 'longevity' ? numeric.toFixed(0) : numeric.toFixed(2)) : '—';
      article.append(name, value);
      return article;
    }));
    this.els.followBtn.textContent = this.renderer.followId === creature.id ? 'Dejar de seguir' : 'Seguir organismo';
    this.renderCognition(creature);
    this.maybeSpeakAutonomously(creature);
  }

  maybeSpeakAutonomously(creature) {
    if (!this.autoSpeak || !creature?.lastSpeech || creature.speechUntil <= this.simulation.time) return;
    const key = `${creature.id}:${creature.lastSpeech}`;
    if (key === this.lastAutoSpeechKey) return;
    this.lastAutoSpeechKey = key;
    this.speakText(creature.lastSpeech, creature);
  }

  interactWithSelected(text, speak = false) {
    const creature = this.selected;
    if (!creature) { this.toast('Selecciona una criatura para hablar con ella'); return; }
    try {
      const result = creature.teach(text, this.simulation);
      this.renderInspector();
      if (result.learned) this.toast(`${creature.name} ha incorporado un aprendizaje`);
      if (speak) this.speakText(result.response, creature);
    } catch (error) {
      console.error(error);
      this.toast('No se pudo procesar la enseñanza');
    }
  }

  renderCognition(creature) {
    const dialogue = Array.isArray(creature.dialogue) ? creature.dialogue.slice(-10) : [];
    if (!dialogue.length) {
      const placeholder = document.createElement('p');
      placeholder.className = 'cognition-placeholder';
      placeholder.textContent = `Habla con ${creature.name}. Puedes preguntar “¿qué sabes?” o enseñar “no ataques”, “busca alimento” y reglas SI… ENTONCES…`;
      this.els.cognitionLog.replaceChildren(placeholder);
    } else {
      this.els.cognitionLog.replaceChildren(...dialogue.map(item => {
        const message = document.createElement('div');
        message.className = `cognition-message ${item.role === 'user' ? 'user' : 'creature'}`;
        message.textContent = item.text;
        return message;
      }));
      this.els.cognitionLog.scrollTop = this.els.cognitionLog.scrollHeight;
    }

    const knowledge = Array.isArray(creature.knowledge) ? creature.knowledge.slice(-8).reverse() : [];
    if (!knowledge.length) {
      const empty = document.createElement('li');
      empty.className = 'knowledge-empty';
      empty.textContent = 'Aún no ha consolidado reglas ni hechos.';
      this.els.knowledgeList.replaceChildren(empty);
    } else {
      this.els.knowledgeList.replaceChildren(...knowledge.map(item => {
        const li = document.createElement('li');
        const label = document.createElement('span');
        const confidence = document.createElement('b');
        label.textContent = item.label;
        confidence.textContent = `${Math.round((Number(item.confidence) || 0) * 100)}%`;
        li.append(label, confidence);
        return li;
      }));
    }
  }

  updateSpeechSupport() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synthesis = 'speechSynthesis' in window;
    this.els.listenBtn.disabled = !Recognition;
    this.els.speakBtn.disabled = !synthesis;
    this.els.speechSupport.textContent = Recognition && synthesis ? 'VOZ ACTIVA' : synthesis ? 'VOZ · SIN ESCUCHA' : 'SOLO TEXTO';
    if (!Recognition) this.els.listenBtn.title = 'El reconocimiento de voz no está disponible en este navegador';
  }

  startListening() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!this.selected) { this.toast('Selecciona primero una criatura'); return; }
    if (!Recognition) { this.toast('Este navegador no ofrece reconocimiento de voz. Puedes escribir la orden.'); return; }
    if (this.isListening) { try { this.recognition?.stop(); } catch { /* ya detenida */ } return; }

    const recognition = new Recognition();
    this.recognition = recognition;
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      this.isListening = true;
      this.els.listenBtn.textContent = '■ Detener escucha';
      this.els.speechSupport.textContent = 'ESCUCHANDO';
      this.els.speechSupport.classList.add('listening');
    };
    recognition.onresult = event => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        this.els.teachInput.value = transcript;
        this.interactWithSelected(transcript, true);
        this.els.teachInput.value = '';
      }
    };
    recognition.onerror = event => {
      const message = event.error === 'not-allowed' ? 'Permiso de micrófono denegado' : `No se pudo escuchar: ${event.error || 'error desconocido'}`;
      this.toast(message);
    };
    recognition.onend = () => {
      this.isListening = false;
      this.els.listenBtn.textContent = '🎙 Escucharme';
      this.els.speechSupport.classList.remove('listening');
      this.updateSpeechSupport();
    };
    try { recognition.start(); } catch (error) { console.error(error); this.toast('El micrófono ya está ocupado'); }
  }

  speakText(text, creature) {
    if (!('speechSynthesis' in window) || !text) { this.toast('La voz no está disponible en este navegador'); return; }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text).slice(0, 420));
      utterance.lang = 'es-ES';
      const voices = window.speechSynthesis.getVoices();
      const spanish = voices.filter(voice => /^es(?:-|_)/i.test(voice.lang));
      const pool = spanish.length ? spanish : voices;
      if (pool.length) utterance.voice = pool[(creature?.voiceIndex || 0) % pool.length];
      utterance.rate = Math.max(.78, Math.min(1.28, .88 + (creature?.genome?.speed || 1) * .12));
      utterance.pitch = Math.max(.75, Math.min(1.55, 1.02 + (creature?.appearance?.eyeSize || 1) * .2 - (creature?.genome?.size || 4) * .025));
      utterance.volume = .92 * this.masterVolume;
      if (this.masterVolume <= 0) return;
      if (creature?.id) this.lastAutoSpeechKey = `${creature.id}:${String(text)}`;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error(error);
      this.toast('No se pudo reproducir la voz');
    }
  }

  activateTab(name) {
    const safeName = ['god', 'code', 'science', 'taller', 'collective', 'grandproject', 'civilization', 'legacy', 'archive'].includes(name) ? name : 'god';
    if (safeName === 'taller') this.renderObras();
    if (safeName === 'collective') this.renderCollective();
    if (safeName === 'grandproject') this.renderGrandProjects();
    if (safeName === 'civilization') this.renderCivilization();
    if (safeName === 'legacy') this.renderLegacy();
    if (safeName === 'archive') { this.renderSaves(); this.renderStats(); }
    document.querySelectorAll('.tab').forEach(button => {
      const active = button.dataset.tab === safeName;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll('.tab-content').forEach(panel => {
      const active = panel.id === `tab-${safeName}`;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  }

  updatePause() {
    this.els.pauseBtn.textContent = this.simulation.paused ? '▶' : 'Ⅱ';
    this.els.pauseBtn.setAttribute('aria-label', this.simulation.paused ? 'Reanudar simulación' : 'Pausar simulación');
    this.els.runIndicator.classList.toggle('active', !this.simulation.paused);
    this.els.runLabel.textContent = this.simulation.paused ? 'SIMULACIÓN EN PAUSA' : 'SIMULACIÓN ACTIVA';
  }

  updateSpeedButtons() {
    document.querySelectorAll('.speed-btn').forEach(button => {
      const active = Number(button.dataset.speed) === this.simulation.speed;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  updateControlsFromSimulation() {
    this.els.mutationRange.value = this.simulation.environmentMutation;
    this.els.mutationOutput.textContent = `${this.simulation.environmentMutation.toFixed(1)}×`;
    this.els.foodRange.value = this.simulation.foodAbundance;
    this.els.foodOutput.textContent = `${this.simulation.foodAbundance.toFixed(1)}×`;
    this.updateEnvironmentControls();
    this.updateSpeedButtons();
    this.updatePause();
    this.updateCameraReadout();
  }

  updateEnvironmentControls() {
    const biome = this.simulation.getBiome();
    this.els.biomeSelect.value = this.simulation.biome;
    this.els.biomeQuickSelect.value = this.simulation.biome;
    this.els.autoBiomeToggle.checked = Boolean(this.simulation.autoBiome);
    this.els.autonomyRange.value = Math.round(this.simulation.autonomyLevel * 100);
    this.els.autonomyOutput.textContent = `${Math.round(this.simulation.autonomyLevel * 100)}%`;
    this.els.biomeDescription.textContent = biome.description;
    this.els.biomeIcon.textContent = biome.icon;
    this.els.biomeLabel.textContent = `BIOMA: ${biome.shortLabel}`;
  }

  updateMetrics(fps = 60) {
    const population = this.simulation.creatures.length;
    const delta = population - this.lastPopulation;
    this.lastPopulation = population;
    this.els.populationMetric.textContent = formatNumber(population);
    this.els.populationDelta.textContent = `${delta >= 0 ? '+' : ''}${delta} · ${this.simulation.eggs.length} huevos`;
    this.els.eggMetric.textContent = this.simulation.eggs.length;
    this.els.generationMetric.textContent = this.simulation.maxGeneration();
    this.els.diversityMetric.textContent = `${Math.round(this.simulation.diversity() * 100)}%`;
    this.els.worldClock.textContent = `Año ${this.simulation.year.toFixed(1)} · Ciclo ${Math.floor(this.simulation.year / 4) + 1}`;
    const temperatureState = Math.abs(this.simulation.temperature - 18) > 9 ? 'EXTREMO' : 'ESTABLE';
    this.els.climateLabel.textContent = `${this.simulation.temperature.toFixed(1)} °C · ${temperatureState}`;
    this.updateEnvironmentControls();
    this.updateCameraReadout();
    this.els.fpsMetric.textContent = `${Math.round(fps)} FPS`;
    const badge = this.els.healthBadge;
    const phase = this.simulation.genesis?.phase;
    badge.className = `badge ${phase === 'extinct' ? 'bad' : population > 1200 ? 'warn' : 'good'}`;
    badge.textContent = phase === 'dormant' ? 'ORIGEN' : phase === 'incubating' ? 'ECLOSIÓN' : phase === 'extinct' ? 'EXTINTO' : population > 780 ? 'SATURADO' : 'ESTABLE';
    this.updateGenesisPanel();
    if (!document.getElementById('tab-taller').hidden) this.renderObras();
    else {
      const pending = this.simulation.workshop?.obras.filter(obra => !obra.delivered).length ?? 0;
      this.els.obraBadge.hidden = pending === 0;
      this.els.obraBadge.textContent = pending;
    }
    const collectiveMetrics = this.simulation.getCollectiveMetrics();
    this.els.collectiveBadge.hidden = collectiveMetrics.queuedProjects === 0;
    this.els.collectiveBadge.textContent = collectiveMetrics.queuedProjects;
    if (!document.getElementById('tab-collective').hidden) this.renderCollective(collectiveMetrics);
    const grandMetrics = this.simulation.grandProjects.metrics();
    this.els.grandProjectBadge.hidden = grandMetrics.active === 0;
    this.els.grandProjectBadge.textContent = grandMetrics.active;
    if (!document.getElementById('tab-grandproject').hidden) this.renderGrandProjects();
    if (!document.getElementById('tab-civilization').hidden) this.renderCivilization();
    if (!document.getElementById('tab-legacy').hidden) this.renderLegacy();
    if (this.selectedId) this.renderInspector();
    if (Math.random() < .01 && !this.simulation.paused) recordStats(this.simulation).catch(() => {});
    this.drawChart();
  }

  updateGenesisPanel() {
    const status = this.simulation.getGenesisStatus();
    this.els.genesisPhase.textContent = status.label;
    this.els.genesisHint.textContent = status.hint;
    this.els.genesisProgressFill.style.width = `${Math.round(status.progress * 100)}%`;
    this.els.genesisIntro.hidden = this.simulation.genesis?.phase !== 'dormant';
  }

  drawChart() {
    const canvas = this.els.populationChart;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    if (!rect.width) return;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(110 * dpr);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, rect.width, 110);
    const data = this.simulation.populationHistory;
    context.strokeStyle = 'rgba(255,255,255,.06)';
    context.lineWidth = 1;
    for (let y = 22; y < 110; y += 22) { context.beginPath(); context.moveTo(0, y); context.lineTo(rect.width, y); context.stroke(); }
    if (data.length < 2) {
      context.fillStyle = 'rgba(185,200,218,.55)';
      context.font = '11px system-ui, sans-serif';
      context.textAlign = 'center';
      context.fillText('Recopilando datos de población…', rect.width / 2, 58);
      return;
    }
    const max = Math.max(...data, 10);
    const min = Math.min(...data, 0);
    context.beginPath();
    data.forEach((value, index) => {
      const x = index / (data.length - 1) * rect.width;
      const y = 96 - (value - min) / Math.max(1, max - min) * 78;
      if (index) context.lineTo(x, y); else context.moveTo(x, y);
    });
    context.strokeStyle = '#62dcff';
    context.lineWidth = 2;
    context.stroke();
    context.lineTo(rect.width, 110);
    context.lineTo(0, 110);
    context.closePath();
    const gradient = context.createLinearGradient(0, 0, 0, 110);
    gradient.addColorStop(0, 'rgba(98,220,255,.24)');
    gradient.addColorStop(1, 'rgba(98,220,255,0)');
    context.fillStyle = gradient;
    context.fill();
  }

  renderTimeline() {
    const items = this.simulation.events.length ? this.simulation.events : [{ time: 'Sistema', text: 'Sin eventos registrados.' }];
    this.els.timeline.replaceChildren(...items.map(event => {
      const item = document.createElement('li');
      const time = document.createElement('b');
      const text = document.createElement('span');
      time.textContent = String(event.time ?? 'Registro');
      text.textContent = String(event.text ?? '');
      item.append(time, document.createElement('br'), text);
      return item;
    }));
  }

  async save(auto = false) {
    try {
      const snapshot = this.simulation.serialize();
      const result = await saveWorld(snapshot);
      if (!auto && result.backend === 'indexedDB') {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        await saveWorld(snapshot, `snapshot-${stamp}`);
        await this.pruneSnapshots();
        await this.renderSaves();
      }
      const label = result.backend === 'localStorage' ? 'Copia local' : auto ? 'Autoguardado' : 'Instantánea guardada';
      this.els.saveState.textContent = `${label} · ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
      if (!auto) this.toast(result.backend === 'localStorage' ? 'Mundo guardado en almacenamiento alternativo' : 'Mundo e instantánea guardados en este dispositivo');
    } catch (error) {
      console.error(error);
      if (!auto) this.toast(error.message || 'No se pudo guardar el mundo');
    }
  }

  async pruneSnapshots() {
    const slots = (await listSlots()).filter(slot => slot.startsWith('snapshot-')).sort().reverse();
    await Promise.all(slots.slice(5).map(slot => deleteSlot(slot)));
  }

  async load() {
    try {
      const result = await loadWorld();
      if (!result.data) { this.toast('No hay ninguna instantánea guardada'); return; }
      this.simulation.hydrate(result.data);
      this.renderer.resetCamera();
      this.updateControlsFromSimulation();
      this.clearSelection();
      this.renderTimeline();
      this.updateMetrics(60);
      this.updateGenesisPanel();
      this.toast(`Mundo restaurado desde ${result.backend === 'indexedDB' ? 'IndexedDB' : 'copia local'}`);
    } catch (error) {
      console.error(error);
      this.toast(error.message || 'No se pudo cargar el mundo');
    }
  }

  async clearSave() {
    if (!confirm('¿Borrar la instantánea guardada en este dispositivo? El mundo actual seguirá abierto.')) return;
    await clearSavedWorld();
    this.els.saveState.textContent = 'Sin instantánea guardada';
    this.toast('Instantánea eliminada');
  }

  async importFile(file) {
    if (!file) return;
    try {
      if (file.size > CONFIG.MAX_IMPORT_BYTES) throw new Error('El archivo supera el límite de 15 MB');
      if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') throw new Error('Selecciona un archivo JSON');
      const data = JSON.parse(await file.text());
      const backup = this.simulation.creatures.length || this.simulation.eggs.length ? this.simulation.serialize() : null;
      try {
        this.simulation.hydrate(data);
      } catch (hydrateError) {
        if (backup) {
          try { this.simulation.hydrate(backup); } catch { /* El respaldo procede de serialize() y debería ser válido. */ }
        }
        throw hydrateError;
      }
      this.renderer.resetCamera();
      this.updateControlsFromSimulation();
      this.clearSelection();
      this.renderTimeline();
      this.updateMetrics(60);
      this.updateGenesisPanel();
      this.toast('Mundo importado correctamente');
    } catch (error) {
      console.error(error);
      this.toast(error.message || 'Archivo incompatible o dañado');
    } finally {
      this.els.importInput.value = '';
      this.els.quickImportInput.value = '';
    }
  }

  toggleCinema(force) {
    const enabled = typeof force === 'boolean' ? force : !document.body.classList.contains('cinema');
    document.body.classList.toggle('cinema', enabled);
    this.els.cinemaExitBtn.hidden = !enabled;
    setTimeout(() => this.renderer.resize(), 50);
  }

  downloadFile({ filename, mime, content }) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  renderObras() {
    const workshop = this.simulation.workshop;
    if (!workshop) return;
    const teams = workshop.teams.filter(team => !team.dissolved);
    this.els.workshopStatus.textContent = teams.length
      ? teams.map(team => `Equipo de ${team.memberIds.length} preparando ${OBRA_META[team.type]?.label ?? 'una obra'} (${Math.round(Math.min(1, team.progress) * 100)}%)`).join(' · ')
      : 'Sin equipos activos por ahora.';
    const obras = [...workshop.obras].reverse();
    const pending = workshop.obras.filter(obra => !obra.delivered).length;
    this.els.obraBadge.hidden = pending === 0;
    this.els.obraBadge.textContent = pending;
    this.els.obraEmpty.hidden = obras.length > 0;
    this.els.deliverAllBtn.disabled = obras.length === 0;
    this.els.obraList.replaceChildren(...obras.map(obra => this.buildObraCard(obra)));
  }

  buildObraCard(obra) {
    const card = document.createElement('article');
    card.className = `obra-card${obra.delivered ? ' delivered' : ''}`;
    const head = document.createElement('header');
    const icon = document.createElement('span');
    icon.className = 'obra-icon';
    icon.textContent = OBRA_META[obra.type]?.icon ?? '❈';
    const title = document.createElement('h3');
    title.textContent = obra.title;
    head.append(icon, title);
    const meta = document.createElement('p');
    meta.className = 'obra-meta';
    meta.textContent = `Año ${obra.year} · ${obra.authors.map(author => `${author.code} (${author.skillLabel})`).join(', ')}`;
    card.append(head, meta);

    if (obra.payload.kind === 'svg') {
      const img = document.createElement('img');
      img.className = 'obra-preview';
      img.alt = `Vista previa de ${obra.title}`;
      img.loading = 'lazy';
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(obra.payload.data)}`;
      card.append(img);
    } else if (['text', 'csv', 'json'].includes(obra.payload.kind)) {
      const pre = document.createElement('pre');
      pre.className = 'obra-text';
      pre.textContent = String(obra.payload.data).split('\n').slice(0, obra.payload.kind === 'json' ? 10 : 7).join('\n');
      card.append(pre);
    } else if (obra.payload.kind === 'song') {
      const pre = document.createElement('pre');
      pre.className = 'obra-text';
      pre.textContent = (obra.payload.data.lyrics ?? []).join('\n');
      card.append(pre);
    } else if (obra.payload.kind === 'html') {
      const note = document.createElement('p');
      note.className = 'obra-meta';
      note.textContent = obra.type === 'codigo' ? 'Aplicación HTML autónoma, sin dependencias externas. Entrégala para abrir el código ejecutable.' : 'Documento HTML colectivo. Entrégalo para abrirlo.';
      card.append(note);
    }

    const actions = document.createElement('div');
    actions.className = 'obra-actions';
    if (obra.payload.kind === 'song') {
      const play = document.createElement('button');
      play.type = 'button';
      play.className = 'btn ghost';
      play.dataset.obra = obra.id;
      play.dataset.action = 'play';
      play.textContent = '♪ Escuchar';
      actions.append(play);
    }
    const deliver = document.createElement('button');
    deliver.type = 'button';
    deliver.className = 'btn primary';
    deliver.dataset.obra = obra.id;
    deliver.dataset.action = 'deliver';
    deliver.textContent = obra.delivered ? 'Entregar de nuevo' : 'Entregar obra';
    actions.append(deliver);
    card.append(actions);
    return card;
  }

  renderCollective(metrics = this.simulation.getCollectiveMetrics()) {
    this.els.collectiveIndex.textContent = String(metrics.index);
    this.els.collectiveKnowledge.textContent = String(metrics.uniqueKnowledge);
    this.els.collectiveRoles.textContent = String(metrics.roles);
    this.els.collectiveSynergy.textContent = `${Math.round(metrics.synergy * 100)}%`;
    this.els.collectiveQueue.textContent = String(metrics.queuedProjects);
    const atlas = this.simulation.collective;
    this.els.collectiveStatus.textContent = `${metrics.uniqueKnowledge} cápsulas únicas en ${metrics.domains} dominios. ${metrics.population} seres, ${metrics.roles} oficios, ${metrics.activeTeams} células trabajando y ${metrics.completedProjects} proyectos completados.`;
    const requests = this.simulation.workshop.requests || [];
    const teams = this.simulation.workshop.teams.filter(team => !team.dissolved && team.requestId);
    const cards = [];
    for (const team of teams) {
      const article = document.createElement('article');
      article.className = 'collective-project-card active';
      const title = document.createElement('b');
      title.textContent = `En desarrollo · ${OBRA_META[team.type]?.label || team.type}`;
      const copy = document.createElement('span');
      copy.textContent = `${team.prompt || 'Proyecto colectivo'} · ${team.memberIds.length} especialistas · ${Math.round(Math.min(1, team.progress) * 100)}%`;
      article.append(title, copy);
      cards.push(article);
    }
    for (const request of requests) {
      const article = document.createElement('article');
      article.className = 'collective-project-card';
      const title = document.createElement('b');
      title.textContent = `En cola · ${OBRA_META[request.type]?.label || request.type}`;
      const copy = document.createElement('span');
      copy.textContent = request.prompt;
      article.append(title, copy);
      cards.push(article);
    }
    if (!cards.length) {
      const empty = document.createElement('p');
      empty.className = 'panel-copy subtle';
      empty.textContent = atlas?.atlasLoaded
        ? 'La red está sincronizada. Escribe un encargo o deja que los equipos creen obras por iniciativa propia.'
        : 'El Atlas todavía no se ha sincronizado.';
      cards.push(empty);
    }
    this.els.collectiveProjectsList.replaceChildren(...cards);
  }

  renderGrandProjects() {
    const engine = this.simulation.grandProjects;
    const metrics = engine.metrics();
    this.els.grandProjectActiveCount.textContent = String(metrics.active);
    this.els.grandProjectCompletedCount.textContent = String(metrics.completed);
    this.els.grandProjectTasksCount.textContent = `${metrics.tasksDone}/${metrics.tasksTotal}`;
    this.els.grandProjectQuality.textContent = `${Math.round(metrics.averageQuality * 100)}%`;
    this.els.grandProjectExternalCount.textContent = String(metrics.externalInsights);
    this.els.grandProjectBadge.hidden = metrics.active === 0;
    this.els.grandProjectBadge.textContent = String(metrics.active);

    const projects = engine.projects;
    if (!projects.some(item => item.id === this.selectedGrandProjectId)) this.selectedGrandProjectId = projects[0]?.id || null;
    const statusNames = { active: 'Activo', waiting: 'En espera', paused: 'Pausado', completed: 'Completado', cancelled: 'Archivado' };
    const statusClass = status => status === 'completed' ? 'good' : status === 'cancelled' ? 'danger' : status === 'waiting' ? 'warn' : '';
    const cards = projects.map(project => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `grand-project-list-item${project.id === this.selectedGrandProjectId ? ' selected' : ''}`;
      button.dataset.grandProject = project.id;
      const icon = document.createElement('span'); icon.className = 'grand-project-list-icon'; icon.textContent = GRAND_PROJECT_TYPES[project.type]?.icon || 'Ω';
      const copy = document.createElement('span'); copy.className = 'grand-project-list-copy';
      const title = document.createElement('b'); title.textContent = project.title;
      const meta = document.createElement('small'); meta.textContent = `${statusNames[project.status] || project.status} · ${Math.round(project.progress * 100)}% · ${project.tasks.filter(item => item.status === 'completed').length}/${project.tasks.length} tareas`;
      const bar = document.createElement('span'); bar.className = 'mini-project-bar';
      const fill = document.createElement('i'); fill.style.width = `${Math.round(project.progress * 100)}%`; bar.append(fill);
      copy.append(title, meta, bar);
      button.append(icon, copy);
      return button;
    });
    if (!cards.length) {
      const empty = document.createElement('p'); empty.className = 'panel-copy subtle'; empty.textContent = 'Todavía no existe ningún Gran Proyecto.';
      cards.push(empty);
    }
    this.els.grandProjectList.replaceChildren(...cards);

    const project = engine.find(this.selectedGrandProjectId);
    this.els.grandProjectEmpty.hidden = Boolean(project);
    this.els.grandProjectDetail.hidden = !project;
    if (!project) return;
    const meta = GRAND_PROJECT_TYPES[project.type] || GRAND_PROJECT_TYPES.custom;
    this.els.grandProjectDetailType.textContent = `${meta.icon} ${meta.label} · PROYECTO ${project.number}`;
    this.els.grandProjectDetailTitle.textContent = project.title;
    this.els.grandProjectDetailBrief.textContent = project.brief;
    this.els.grandProjectStatus.textContent = statusNames[project.status] || project.status;
    this.els.grandProjectStatus.className = `badge ${statusClass(project.status)}`.trim();
    this.els.grandProjectProgressLabel.textContent = `${Math.round(project.progress * 100)}%`;
    this.els.grandProjectProgressFill.style.width = `${Math.round(project.progress * 100)}%`;
    this.els.grandProjectLastEvent.textContent = project.lastEvent || 'Sin actividad reciente.';
    this.els.grandProjectPauseBtn.textContent = project.status === 'paused' ? 'Reanudar' : 'Pausar';
    this.els.grandProjectPauseBtn.disabled = ['completed','cancelled','waiting'].includes(project.status);
    this.els.grandProjectCancelBtn.disabled = ['completed','cancelled'].includes(project.status);

    const phaseNames = { definition: 'Definición', planning: 'Planificación', research: 'Investigación', design: 'Diseño', production: 'Producción', verification: 'Verificación', delivery: 'Entrega' };
    const taskNodes = project.tasks.map(task => {
      const item = document.createElement('article');
      item.className = `grand-project-task ${task.status}`;
      const head = document.createElement('div');
      const title = document.createElement('b'); title.textContent = task.title;
      const percent = document.createElement('span'); percent.textContent = `${Math.round(task.progress * 100)}%`;
      head.append(title, percent);
      const phase = document.createElement('small');
      const crew = task.assignedIds.map(id => this.simulation.creatures.find(creature => creature?.id === id)?.entityCode).filter(Boolean).slice(0, 6);
      phase.textContent = `${phaseNames[task.phase] || task.phase} · ${task.status === 'completed' ? 'terminada' : task.status === 'working' ? 'en ejecución' : 'pendiente'}${crew.length ? ` · ${crew.join(', ')}` : ''}`;
      const bar = document.createElement('div'); bar.className = 'grand-project-task-bar'; const fill = document.createElement('span'); fill.style.width = `${Math.round(task.progress * 100)}%`; bar.append(fill);
      item.append(head, phase, bar);
      if (task.output) { const output = document.createElement('p'); output.textContent = task.output; item.append(output); }
      return item;
    });
    this.els.grandProjectTaskList.replaceChildren(...taskNodes);

    const learningNodes = [];
    for (const blocker of project.blockers) {
      const item = document.createElement('article'); item.className = 'grand-project-note blocker';
      const title = document.createElement('b'); title.textContent = 'Bloqueo activo';
      const text = document.createElement('span'); text.textContent = blocker.text;
      item.append(title, text); learningNodes.push(item);
    }
    for (const lesson of project.lessons.slice(0, 8)) {
      const item = document.createElement('article'); item.className = 'grand-project-note lesson';
      const title = document.createElement('b'); title.textContent = `Aprendizaje · año ${Number(lesson.year).toFixed(1)}`;
      const text = document.createElement('span'); text.textContent = lesson.text;
      item.append(title, text); learningNodes.push(item);
    }
    for (const insight of project.externalInsights.slice(0, 5)) {
      const item = document.createElement('article'); item.className = 'grand-project-note external';
      const title = document.createElement('b'); title.textContent = 'Fuente externa revisada';
      const text = document.createElement('span'); text.textContent = insight.text;
      item.append(title, text); learningNodes.push(item);
    }
    if (!learningNodes.length) {
      const empty = document.createElement('p'); empty.className = 'panel-copy subtle'; empty.textContent = 'No hay bloqueos ni fallos registrados. Cuando el equipo se equivoque, la corrección aparecerá aquí.'; learningNodes.push(empty);
    }
    this.els.grandProjectLearningList.replaceChildren(...learningNodes);
  }

  renderCivilization() {
    const civilization = this.simulation.civilization;
    if (!civilization) return;
    const metrics = civilization.getMetrics(this.simulation);
    this.els.civilizationEra.textContent = metrics.era.label;
    this.els.civilizationEraCopy.textContent = metrics.era.description;
    this.els.civilizationTechCount.textContent = String(metrics.technologies);
    this.els.civilizationInstitutionCount.textContent = String(metrics.institutions);
    this.els.civilizationWords.textContent = String(metrics.words);
    this.els.civilizationProsperity.textContent = `${Math.round(metrics.prosperity * 100)}%`;
    this.els.civilizationCooperation.textContent = `${Math.round(metrics.cooperation * 100)}%`;
    this.els.civilizationStability.textContent = `${Math.round(metrics.stability * 100)}%`;
    const society = civilization.society;
    const societyMetrics = society.getMetrics();
    this.els.societyFactionCount.textContent = String(societyMetrics.factions);
    this.els.societyTreatyCount.textContent = String(societyMetrics.treaties);
    this.els.societyWarCount.textContent = String(societyMetrics.activeWars);
    this.els.societyGovernment.textContent = societyMetrics.government.label;
    this.els.societyRuler.textContent = societyMetrics.ruler ? `${society.government.title} · ${societyMetrics.ruler.name}` : 'Sin designar';
    this.els.societyLegitimacy.textContent = `${Math.round(societyMetrics.legitimacy * 100)}%`;
    this.els.societySuccession.textContent = `Sucesión: ${society.government.succession}`;
    this.els.societyUnrest.textContent = `${Math.round(societyMetrics.unrest * 100)}% tensión`;
    this.els.societyBetrayals.textContent = `${societyMetrics.betrayals} traiciones`;
    this.els.civilizationLanguageName.textContent = civilization.language.name;
    this.els.civilizationGrammar.textContent = `NIVEL ${civilization.language.grammarLevel.toFixed(1)}`;

    const unlocked = civilization.getUnlockedTechnologies();
    const next = TECHNOLOGY_TREE.find(definition => !civilization.technologies.includes(definition.key) && definition.requires.every(key => civilization.technologies.includes(key)));
    if (next) {
      const available = civilization.researchPoints + civilization.innovationPoints;
      this.els.civilizationNextTech.textContent = `Siguiente posibilidad: ${next.label}. Requiere ${next.minPopulation} seres, ${next.minKnowledge} conocimientos, ${next.minProjects} proyectos y ${next.cost} puntos de investigación/innovación. Progreso actual: ${Math.floor(available)}/${next.cost}.`;
    } else {
      this.els.civilizationNextTech.textContent = unlocked.length === TECHNOLOGY_TREE.length
        ? 'La civilización ha completado todo el árbol tecnológico disponible.'
        : 'La siguiente rama depende de tecnologías previas todavía no consolidadas.';
    }
    this.els.civilizationTechList.replaceChildren(...(unlocked.length ? unlocked.slice().reverse().map(item => {
      const card = document.createElement('article');
      const title = document.createElement('b'); title.textContent = item.label;
      const copy = document.createElement('span'); copy.textContent = item.description;
      card.append(title, copy); return card;
    }) : [this.buildCivilizationEmpty('Aún no hay tecnologías. La supervivencia y la memoria oral serán el primer paso.') ]));

    this.els.civilizationInstitutionList.replaceChildren(...(civilization.institutions.length ? civilization.institutions.slice().reverse().map(item => {
      const card = document.createElement('article');
      const title = document.createElement('b'); title.textContent = item.label;
      const copy = document.createElement('span'); copy.textContent = `${item.description} Fundada en el año ${Number(item.foundedYear).toFixed(1)}.`;
      card.append(title, copy); return card;
    }) : [this.buildCivilizationEmpty('Las instituciones aparecerán cuando la población y el conocimiento necesiten organizarse.') ]));

    const culturalCards = [];
    for (const item of civilization.culture.values.slice().reverse()) {
      const card = document.createElement('article');
      const title = document.createElement('b'); title.textContent = item.label;
      const copy = document.createElement('span'); copy.textContent = item.statement;
      card.append(title, copy); culturalCards.push(card);
    }
    for (const tradition of civilization.culture.traditions.slice(-5).reverse()) {
      const card = document.createElement('article');
      const title = document.createElement('b'); title.textContent = 'Tradición';
      const copy = document.createElement('span'); copy.textContent = tradition;
      card.append(title, copy); culturalCards.push(card);
    }
    if (civilization.culture.symbols.length) {
      const card = document.createElement('article');
      const title = document.createElement('b'); title.textContent = 'Símbolos';
      const copy = document.createElement('span'); copy.textContent = civilization.culture.symbols.join('  ');
      card.append(title, copy); culturalCards.push(card);
    }
    this.els.civilizationCultureList.replaceChildren(...(culturalCards.length ? culturalCards : [this.buildCivilizationEmpty('La cultura comenzará con los primeros valores, palabras y rituales compartidos.') ]));

    const lexicon = civilization.language.lexicon.slice(-16).reverse();
    this.els.civilizationLexicon.replaceChildren(...(lexicon.length ? lexicon.map(item => {
      const card = document.createElement('article');
      const word = document.createElement('b'); word.textContent = item.word;
      const concept = document.createElement('span'); concept.textContent = item.concept;
      const meaning = document.createElement('small'); meaning.textContent = item.meaning;
      card.append(word, concept, meaning); return card;
    }) : [this.buildCivilizationEmpty('El idioma nacerá cuando dos o más seres necesiten compartir conceptos.') ]));

    const laws = society.government.laws.slice().reverse();
    this.els.societyLawList.replaceChildren(...(laws.length ? laws.map(law => {
      const card = document.createElement('article');
      const title = document.createElement('b'); title.textContent = law.label;
      const copy = document.createElement('span'); copy.textContent = `${law.text} Año ${Number(law.enactedYear).toFixed(1)}.`;
      card.append(title, copy); return card;
    }) : [this.buildCivilizationEmpty('Todavía no hay leyes. Aparecerán cuando el gobierno necesite convertir valores en normas.') ]));

    const activeFactions = society.factions.filter(faction => faction.status === 'active').sort((a, b) => b.power - a.power);
    this.els.societyFactionList.replaceChildren(...(activeFactions.length ? activeFactions.map(faction => {
      const item = document.createElement('article'); item.className = 'faction-item';
      const symbol = document.createElement('span'); symbol.className = 'faction-symbol'; symbol.textContent = faction.symbol;
      const copy = document.createElement('div'); copy.className = 'faction-copy';
      const title = document.createElement('b'); title.textContent = faction.name;
      const leader = society.getProfile(faction.leaderId);
      const motto = document.createElement('span'); motto.textContent = faction.motto;
      const meta = document.createElement('small'); meta.textContent = `${faction.memberIds.length} miembros · líder: ${leader?.name || 'sin designar'} · cohesión ${Math.round(faction.cohesion * 100)}%`;
      copy.append(title, motto, meta);
      const power = document.createElement('div'); power.className = 'faction-power';
      const number = document.createElement('b'); number.textContent = String(Math.round(faction.power));
      const label = document.createElement('small'); label.textContent = 'poder';
      power.append(number, label); item.append(symbol, copy, power); return item;
    }) : [this.buildCivilizationEmpty('Las primeras facciones surgirán cuando al menos seis seres desarrollen afinidades distintas.') ]));

    const diplomacyCards = [];
    for (const war of society.wars.filter(item => item.status === 'active').slice().reverse()) {
      const attacker = society.getFaction(war.attackerId); const defender = society.getFaction(war.defenderId);
      const card = document.createElement('article'); card.className = 'diplomacy-war';
      const title = document.createElement('b'); title.textContent = `⚔ ${war.name}`;
      const copy = document.createElement('span'); copy.textContent = `${attacker?.name || 'Facción'} contra ${defender?.name || 'Facción'} · intensidad ${Math.round(war.intensity * 100)}% · ${war.casualties.wounded} heridos, ${war.casualties.dead} muertos.`;
      card.append(title, copy); diplomacyCards.push(card);
    }
    for (const treaty of society.treaties.filter(item => item.status === 'active').slice(-8).reverse()) {
      const first = society.getFaction(treaty.parties[0]); const second = society.getFaction(treaty.parties[1]);
      const card = document.createElement('article'); card.className = 'diplomacy-treaty';
      const title = document.createElement('b'); title.textContent = treaty.type === 'alliance' ? '✦ Alianza defensiva' : treaty.type === 'trade' ? '⇄ Pacto de intercambio' : '☮ Tratado de paz';
      const copy = document.createElement('span'); copy.textContent = `${first?.name || 'Facción'} + ${second?.name || 'Facción'} · vigente desde el año ${Number(treaty.startedYear).toFixed(1)}.`;
      card.append(title, copy); diplomacyCards.push(card);
    }
    this.els.societyDiplomacyList.replaceChildren(...(diplomacyCards.length ? diplomacyCards : [this.buildCivilizationEmpty('Todavía no existen tratados ni guerras. Las relaciones cambiarán con los recursos, las ideologías y sus líderes.') ]));

    const sagas = society.sagas.slice(0, 12);
    this.els.societySagaList.replaceChildren(...(sagas.length ? sagas.map(saga => {
      const item = document.createElement('article'); item.className = 'saga-item';
      const header = document.createElement('header');
      const title = document.createElement('b'); title.textContent = saga.title;
      const time = document.createElement('time'); time.textContent = `Año ${Number(saga.year).toFixed(1)}`;
      header.append(title, time);
      const summary = document.createElement('span'); summary.textContent = saga.summary;
      const status = document.createElement('small'); status.textContent = `${saga.type} · ${saga.status === 'active' ? 'en curso' : saga.status === 'legend' ? 'convertida en leyenda' : 'concluida'}${saga.chapters.length ? ` · ${saga.chapters.length} capítulos` : ''}`;
      item.append(header, summary, status); return item;
    }) : [this.buildCivilizationEmpty('Las sagas aparecerán con fundaciones, reinados, alianzas, golpes, deserciones y guerras.') ]));

    const chronicle = civilization.chronicle.slice(0, 50);
    this.els.civilizationChronicle.replaceChildren(...(chronicle.length ? chronicle.map(item => {
      const row = document.createElement('li');
      const time = document.createElement('time'); time.textContent = `Año ${Number(item.year).toFixed(1)}`;
      const type = document.createElement('b'); type.textContent = item.type || 'registro';
      const copy = document.createElement('span'); copy.textContent = item.text;
      row.append(time, type, copy); return row;
    }) : [this.buildChronicleEmpty()]));
  }

  renderLegacy() {
    const legacy = this.simulation.legacy;
    if (!legacy) return;
    const metrics = legacy.getMetrics();
    this.els.legacyDreamCount.textContent = String(metrics.dreams);
    this.els.legacyBookCount.textContent = String(metrics.books);
    this.els.legacyRuinCount.textContent = String(metrics.ruins);
    this.els.legacyMythCount.textContent = String(metrics.myths);
    this.els.legacyLibraryCount.textContent = String(metrics.libraries);
    this.els.legacyInsightCount.textContent = String(metrics.insights);
    this.els.legacyPhase.textContent = `${String(metrics.environment.phase || 'día').toUpperCase()} · ${String(metrics.environment.season || 'Brote').toUpperCase()}`;
    this.els.legacyWeather.textContent = metrics.environment.weatherLabel || 'Cielo quieto';

    const empty = text => {
      const node = document.createElement('p');
      node.className = 'panel-copy subtle legacy-empty';
      node.textContent = text;
      return node;
    };
    const makeItem = ({ title, text, meta = '', className = '' }) => {
      const item = document.createElement('article');
      item.className = `legacy-item ${className}`.trim();
      const heading = document.createElement('b'); heading.textContent = title;
      const copy = document.createElement('span'); copy.textContent = text;
      item.append(heading, copy);
      if (meta) { const small = document.createElement('small'); small.textContent = meta; item.append(small); }
      return item;
    };

    const dreams = legacy.dreams.slice(0, 10);
    this.els.legacyDreamList.replaceChildren(...(dreams.length ? dreams.map(dream => makeItem({
      title: `${dream.omen ? '✦ Presagio' : 'Sueño'} de ${dream.creatureName}`,
      text: dream.text,
      meta: `Año ${Number(dream.year).toFixed(1)} · ${dream.remembered ? 'recordado' : 'fragmentario'}`,
      className: dream.omen ? 'omen' : ''
    })) : [empty('Los sueños aparecerán cuando los seres descansen, envejezcan o atraviesen momentos de debilidad.') ]));

    const rumors = legacy.rumors.filter(item => item.status !== 'olvidado').slice(0, 10);
    this.els.legacyRumorList.replaceChildren(...(rumors.length ? rumors.map(rumor => makeItem({
      title: `${rumor.status === 'leyenda popular' ? '◈ Leyenda popular' : 'Rumor'} · ${rumor.originName}`,
      text: rumor.claim,
      meta: `${rumor.spread || rumor.believers?.length || 1} creyentes · distorsión ${Math.round((rumor.distorted || 0) * 100)}%`
    })) : [empty('Todavía no circulan rumores. Necesitan varias criaturas, relaciones y hechos ambiguos que interpretar.') ]));

    const books = legacy.books.slice(0, 10);
    const libraries = legacy.libraries.slice(0, 4);
    const bookNodes = books.map(book => makeItem({
      title: `▤ ${book.title}`,
      text: book.excerpt,
      meta: `${book.authorName} · año ${Number(book.year).toFixed(1)} · ${book.type}`
    }));
    for (const library of libraries) bookNodes.push(makeItem({
      title: `⌂ ${library.name}`,
      text: `Custodia ${library.bookIds?.length || 0} obras bajo la responsabilidad de ${library.custodianName}.`,
      meta: `Fundada en el año ${Number(library.foundedYear).toFixed(1)} · estado ${Math.round((library.condition || 0) * 100)}%`,
      className: 'library'
    }));
    this.els.legacyBookList.replaceChildren(...(bookNodes.length ? bookNodes : [empty('La escritura surgirá cuando exista alfabetización, memoria y una criatura adulta con algo que transmitir.') ]));

    const ruins = legacy.ruins.slice(0, 8);
    const relicById = new Map(legacy.relics.map(item => [item.id, item]));
    this.els.legacyRuinList.replaceChildren(...(ruins.length ? ruins.map(ruin => {
      const relicNames = (ruin.relicIds || []).map(id => relicById.get(id)?.name).filter(Boolean);
      return makeItem({
        title: `▥ ${ruin.name}`,
        text: `${ruin.description}${relicNames.length ? ` Reliquias: ${relicNames.join(', ')}.` : ''}`,
        meta: `X ${Math.round(ruin.x)}, Y ${Math.round(ruin.y)} · antigüedad ${Number(ruin.age || 0).toFixed(1)} años · estado ${Math.round((ruin.condition || 0) * 100)}%`,
        className: 'ruin'
      });
    }) : [empty('Las ruinas aparecerán cuando mueran fundadores, líderes, autores o criaturas cuyo legado sea importante.') ]));

    const insights = legacy.collectiveInsights.slice(0, 10);
    this.els.legacyInsightList.replaceChildren(...(insights.length ? insights.map(insight => makeItem({
      title: `✦ ${insight.title}`,
      text: insight.text,
      meta: `${insight.memberNames?.join(', ') || 'Equipo Ω'} · ${insight.skills?.join(' + ') || 'oficios combinados'}`,
      className: 'insight'
    })) : [empty('Las síntesis aparecen cuando al menos tres oficios distintos reúnen suficiente conocimiento y cooperación.') ]));

    const legacies = legacy.legacies.slice(0, 10);
    const myths = legacy.myths.slice(0, 5);
    const nodes = legacies.map(record => makeItem({
      title: `${record.entityCode || 'Ω'} · ${record.name}`,
      text: record.summary,
      meta: `Año ${Number(record.year).toFixed(1)} · renombre ${Math.round((record.renown || 0) * 100)}%`,
      className: 'memorial'
    }));
    for (const myth of myths) nodes.push(makeItem({
      title: `✧ ${myth.title}`,
      text: myth.text,
      meta: `Mito nacido en el año ${Number(myth.year).toFixed(1)}`,
      className: 'myth'
    }));
    this.els.legacyLegaciesList.replaceChildren(...(nodes.length ? nodes : [empty('Aquí quedará constancia de quienes dejaron libros, títulos, descubrimientos, descendientes, reliquias o heridas en los demás.') ]));
  }

  buildCivilizationEmpty(text) {
    const item = document.createElement('p');
    item.className = 'panel-copy subtle civilization-empty';
    item.textContent = text;
    return item;
  }

  buildChronicleEmpty() {
    const item = document.createElement('li');
    const time = document.createElement('time'); time.textContent = 'Año 0.0';
    const type = document.createElement('b'); type.textContent = 'origen';
    const copy = document.createElement('span'); copy.textContent = 'La crónica comenzará cuando Ω-001 despierte.';
    item.append(time, type, copy);
    return item;
  }

  async renderSaves() {
    const slots = await listSlots();
    this.els.savesList.replaceChildren(...slots.slice(0, 5).map(slot => {
      const card = document.createElement('article');
      card.className = 'save-card';
      const h = document.createElement('h4');
      h.textContent = formatSlotName(slot);
      card.append(h);
      const actions = document.createElement('div');
      actions.className = 'save-actions';
      const load = document.createElement('button');
      load.type = 'button'; load.className = 'btn ghost'; load.textContent = 'Cargar';
      load.addEventListener('click', () => {
        if (confirm('¿Cargar este mundo?')) {
          loadWorld(slot).then(result => {
            if (!result.data) return;
            this.simulation.hydrate(result.data);
            this.renderer.resetCamera();
            this.updateControlsFromSimulation();
            this.clearSelection();
            this.renderTimeline();
            this.updateMetrics(60);
            this.updateGenesisPanel();
            this.toast(`Cargado: ${formatSlotName(slot)}`);
          }).catch(error => {
            console.error(error);
            this.toast('No se pudo cargar la instantánea');
          });
        }
      });
      const del = document.createElement('button');
      del.type = 'button'; del.className = 'btn danger'; del.textContent = 'Borrar';
      del.addEventListener('click', () => {
        if (confirm('¿Borrar definitivamente?')) {
          deleteSlot(slot).then(() => { this.toast(`Borrado: ${slot}`); this.renderSaves(); });
        }
      });
      actions.append(load, del);
      card.append(actions);
      return card;
    }));
    this.els.downloadAllSavesBtn.disabled = slots.length === 0;
  }

  async renderStats() {
    const stats = await getStats();
    if (!stats) {
      this.els.statsPanel.textContent = 'Las estadísticas históricas aparecerán cuando el ecosistema haya avanzado.';
      return;
    }
    const values = [
      ['Población registrada', stats.maxPopulation],
      ['Generación máxima', stats.maxGeneration],
      ['Obras culturales', stats.totalWorks],
      ['Nacimientos', stats.totalBirths],
      ['Muertes', stats.totalDeaths],
      ['Año de sesión', Number(stats.sessionYear || 0).toFixed(1)]
    ];
    this.els.statsPanel.replaceChildren(...values.map(([label, value]) => {
      const item = document.createElement('span');
      item.className = 'stat';
      const name = document.createElement('span');
      name.className = 'stat-label';
      name.textContent = label;
      const number = document.createElement('strong');
      number.className = 'stat-value';
      number.textContent = String(value ?? 0);
      item.append(name, number);
      return item;
    }));
  }

  async downloadAllSaves() {
    const slots = await listSlots();
    if (!slots.length) return;
    const content = [];
    for (const slot of slots) {
      const result = await loadWorld(slot);
      if (result.data) content.push({ slot, data: result.data });
    }
    const json = JSON.stringify({ backup: content, backupDate: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `Genesis-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.toast('Copia de seguridad descargada');
  }

  playSong(obra, button) {
    try {
      const song = obra.payload.data;
      if (!song?.notes?.length) return;
      if (this.masterVolume <= 0) { this.toast('El volumen está silenciado'); return; }
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) { this.toast('Audio no disponible en este navegador'); return; }
      this.audioContext = this.audioContext || new AudioContextClass();
      const ctx = this.audioContext;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const beat = 60 / (song.tempo || 96);
      const master = ctx.createGain();
      master.gain.value = .2 * this.masterVolume;
      master.connect(ctx.destination);
      let lastEnd = 0;
      for (const note of song.notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = 440 * Math.pow(2, (note.midi - 69) / 12);
        const start = ctx.currentTime + .05 + note.t * beat * 4;
        const stop = start + note.dur * beat * 4;
        lastEnd = Math.max(lastEnd, stop);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(.9, start + .02);
        gain.gain.exponentialRampToValueAtTime(.001, stop);
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(stop + .05);
      }
      button.disabled = true;
      window.setTimeout(() => { button.disabled = false; }, Math.max(500, (lastEnd - ctx.currentTime) * 1000 + 300));
    } catch (error) {
      console.warn('No se pudo reproducir el himno', error);
      this.toast('No se pudo reproducir el himno');
    }
  }

  toast(text) {
    clearTimeout(this.toastTimer);
    this.els.toast.textContent = String(text);
    this.els.toast.classList.add('show');
    this.toastTimer = setTimeout(() => this.els.toast.classList.remove('show'), 2600);
  }
}

function collectRequiredElements() {
  const elements = Object.fromEntries([...document.querySelectorAll('[id]')].map(element => [element.id, element]));
  const required = [
    'worldCanvas', 'genesisIntro', 'startGenesisBtn', 'genesisProgress', 'genesisPhase', 'genesisProgressFill', 'genesisHint', 'pauseBtn', 'cinemaBtn', 'cinemaExitBtn', 'cameraResetBtn', 'cameraZoomOutBtn', 'cameraZoomInBtn', 'cameraZoomLabel', 'helpBtn', 'helpDialog',
    'mutationRange', 'mutationOutput', 'foodRange', 'foodOutput', 'biomeSelect', 'biomeQuickSelect', 'biomeDescription', 'biomeIcon', 'biomeLabel', 'autoBiomeToggle', 'autonomyRange', 'autonomyOutput', 'pulseBtn', 'resetBtn',
    'profileSelect', 'progSpeed', 'progSpeedOut', 'progVision', 'progVisionOut', 'progSocial', 'progSocialOut',
    'progCuriosity', 'progCuriosityOut', 'progAggression', 'progAggressionOut', 'progEfficiency', 'progEfficiencyOut',
    'programName', 'programNote', 'programOrb', 'armLineageBtn', 'followBtn', 'saveBtn', 'quickSaveBtn', 'loadBtn', 'quickLoadBtn', 'clearSaveBtn',
    'exportBtn', 'quickExportBtn', 'importInput', 'quickImportInput', 'openCollectiveBtn', 'openGrandProjectBtn', 'openLegacyBtn', 'openArchiveBtn', 'selectionEmpty', 'creatureInspector', 'creatureName', 'creatureMeta', 'creaturePortrait',
    'energyFill', 'geneList', 'personalityValue', 'bondValue', 'knowledgeValue', 'moodValue', 'goalValue', 'autonomyValue', 'factionValue', 'socialRankValue', 'loyaltyValue', 'callingValue', 'lifeGoalValue', 'hopeValue', 'fearValue', 'traumaValue', 'speechSupport', 'cognitionLog',
    'teachForm', 'teachInput', 'teachBtn', 'listenBtn', 'speakBtn', 'autoSpeakToggle', 'volumeSlider', 'volumeLabel', 'qualitySelect', 'knowledgeList', 'populationMetric', 'populationDelta', 'eggMetric', 'generationMetric', 'diversityMetric',
    'worldClock', 'climateLabel', 'fpsMetric', 'healthBadge', 'populationChart', 'timeline', 'toast', 'saveState',
    'installBtn', 'updateBtn', 'runIndicator', 'runLabel', 'activeToolLabel', 'toolHint',
    'workshopStatus', 'obraList', 'obraEmpty', 'deliverAllBtn', 'obraBadge', 'collectiveBadge', 'collectiveIndex', 'collectiveKnowledge', 'collectiveRoles', 'collectiveSynergy', 'collectiveQueue', 'collectiveStatus', 'injectAtlasBtn', 'collectiveProjectType', 'collectivePrompt', 'collectiveProjectBtn', 'collectiveProjectsList',
    'grandProjectBadge', 'grandProjectActiveCount', 'grandProjectCompletedCount', 'grandProjectTasksCount', 'grandProjectQuality', 'grandProjectExternalCount', 'grandProjectType', 'grandProjectTitle', 'grandProjectBrief', 'grandProjectConstraints', 'grandProjectCreateBtn', 'grandProjectList', 'grandProjectEmpty', 'grandProjectDetail', 'grandProjectDetailType', 'grandProjectDetailTitle', 'grandProjectDetailBrief', 'grandProjectStatus', 'grandProjectProgressLabel', 'grandProjectProgressFill', 'grandProjectLastEvent', 'grandProjectPauseBtn', 'grandProjectDossierBtn', 'grandProjectContextBtn', 'grandProjectCancelBtn', 'grandProjectTaskList', 'grandProjectLearningList', 'grandProjectExternalInput', 'grandProjectIntegrateBtn',
    'openCivilizationBtn', 'civilizationEra', 'civilizationEraCopy', 'civilizationTechCount', 'civilizationInstitutionCount', 'civilizationWords', 'civilizationProsperity', 'civilizationCooperation', 'civilizationStability', 'civilizationNextTech', 'civilizationTechList', 'civilizationInstitutionList', 'civilizationCultureList', 'civilizationLanguageName', 'civilizationGrammar', 'civilizationLexicon', 'oracleQuestion', 'exportOracleBtn', 'oracleResponse', 'integrateOracleBtn', 'oracleStatus', 'civilizationChronicle', 'societyFactionCount', 'societyTreatyCount', 'societyWarCount', 'societyGovernment', 'societyRuler', 'societyLegitimacy', 'societySuccession', 'societyLawList', 'societyUnrest', 'societyFactionList', 'societyDiplomacyList', 'societyBetrayals', 'societySagaList',
    'legacyPhase', 'legacyWeather', 'legacyDreamCount', 'legacyBookCount', 'legacyRuinCount', 'legacyMythCount', 'legacyLibraryCount', 'legacyInsightCount', 'legacyDreamList', 'legacyRumorList', 'legacyBookList', 'legacyRuinList', 'legacyInsightList', 'legacyLegaciesList',
    'savesList', 'downloadAllSavesBtn', 'statsPanel'
  ];
  const missing = required.filter(id => !elements[id]);
  if (missing.length) throw new Error(`Interfaz incompleta: faltan ${missing.join(', ')}`);
  return elements;
}

function safeFilename(value) {
  return String(value || 'Gran-Proyecto-Omega').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'Gran-Proyecto-Omega';
}

function formatSlotName(slot) {
  if (slot === 'latest') return 'Último autoguardado';
  if (!slot.startsWith('snapshot-')) return slot;
  const raw = slot.slice(9).replace(/-(\d{2})-(\d{2})-(\d{3})Z$/, ':$1:$2.$3Z');
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? slot : `Instantánea · ${date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'medium' })}`;
}

function readBooleanSetting(key, fallback = false) {
  try {
    const value = localStorage.getItem(key);
    return value == null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
}

function writeBooleanSetting(key, value) {
  try { localStorage.setItem(key, String(Boolean(value))); } catch { /* Almacenamiento no disponible. */ }
}

function readNumberSetting(key, fallback, min, max) {
  try {
    const value = Number(localStorage.getItem(key));
    if (!Number.isFinite(value)) return fallback;
    return Math.min(max, Math.max(min, value));
  } catch {
    return fallback;
  }
}

function writeNumberSetting(key, value) {
  try { localStorage.setItem(key, String(value)); } catch { /* Almacenamiento no disponible. */ }
}

function readStringSetting(key, fallback, allowed) {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function writeStringSetting(key, value) {
  try { localStorage.setItem(key, String(value)); } catch { /* Almacenamiento no disponible. */ }
}


/* ===== app.js ===== */
let simulation = null;
let renderer = null;
let ui = null;
let animationId = 0;
let running = false;
let last = performance.now();
let fpsAccumulator = 0;
let fpsFrames = 0;
let metricsTimer = 0;
let autosaveTimer = 0;

boot();

function boot() {
  try {
    const canvas = document.getElementById('worldCanvas');
    simulation = new Simulation();
    simulation.reset();
    renderer = new Renderer(canvas, simulation);
    ui = new UI(simulation, renderer);

    setupResize(canvas);
    setupKeyboard();
    setupLifecycle();
    setupServiceWorker();

    renderer.resize();
    ui.updateMetrics(60);
    document.documentElement.dataset.ready = 'true';
    document.getElementById('appVersion').textContent = `v${APP_VERSION}`;
    running = true;
    window.__GENESIS__ = Object.freeze({ simulation, renderer, ui, version: APP_VERSION });
    animationId = requestAnimationFrame(frame);
  } catch (error) {
    fail(error);
  }
}

function frame(now) {
  if (!running) return;
  try {
    const dt = Math.min(.1, Math.max(0, (now - last) / 1000));
    last = now;
    simulation.update(dt);
    renderer.draw();
    fpsAccumulator += dt;
    fpsFrames++;
    metricsTimer += dt;
    autosaveTimer += dt;

    if (fpsAccumulator >= .5) {
      const fps = fpsFrames / Math.max(.001, fpsAccumulator);
      fpsAccumulator = 0;
      fpsFrames = 0;
      renderer.reportFps(fps);
      if (metricsTimer >= .7) {
        ui.updateMetrics(fps);
        metricsTimer = 0;
      }
    }
    if (autosaveTimer >= CONFIG.AUTOSAVE_SECONDS) {
      ui.save(true);
      autosaveTimer = 0;
    }
    animationId = requestAnimationFrame(frame);
  } catch (error) {
    fail(error);
  }
}

function setupResize(canvas) {
  const resize = () => renderer?.resize();
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }
  window.addEventListener('orientationchange', () => setTimeout(resize, 100), { passive: true });
}

function setupKeyboard() {
  window.addEventListener('keydown', event => {
    const activeTag = document.activeElement?.tagName ?? '';
    const editing = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(activeTag);
    if (event.code === 'Space' && !editing) {
      event.preventDefault();
      if (simulation.genesis?.phase === 'dormant') {
        simulation.beginGenesis();
        ui.els.genesisIntro.hidden = true;
        ui.updateGenesisPanel();
      } else {
        simulation.paused = !simulation.paused;
      }
      ui.updatePause();
    }
    if (event.code === 'Escape' && document.body.classList.contains('cinema')) ui.toggleCinema(false);
    if (event.key.toLowerCase() === 'r' && !editing) {
      renderer.resetCamera();
      ui.toast('Cámara centrada');
    }
  });
}

function setupLifecycle() {
  document.getElementById('bootReloadBtn')?.addEventListener('click', () => location.reload());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && ui && simulation?.creatures.length) ui.save(true);
  });
  window.addEventListener('pagehide', () => {
    if (ui && simulation?.creatures.length) ui.save(true);
  });
}

async function setupServiceWorker() {
  if (!('serviceWorker' in navigator) || !['http:', 'https:'].includes(location.protocol)) {
    if (location.protocol === 'file:') ui.els.saveState.textContent = 'Modo local · PWA no disponible';
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
    ui.configureServiceWorker(registration);
    registration.update().catch(() => {});
  } catch (error) {
    console.warn('La PWA no pudo registrarse; la simulación seguirá funcionando.', error);
    ui.els.saveState.textContent = 'Simulación activa · PWA no disponible';
  }
}

function fail(error) {
  running = false;
  if (animationId) cancelAnimationFrame(animationId);
  if (simulation) simulation.paused = true;
  console.error('Fallo crítico en Proyecto Génesis Ω:', error);
  const overlay = document.getElementById('bootError');
  const message = document.getElementById('bootErrorMessage');
  if (message) message.textContent = friendlyError(error);
  if (overlay) overlay.hidden = false;
}

function friendlyError(error) {
  const raw = String(error?.message || error || 'Error desconocido');
  if (raw.includes("reading 'state'")) return 'Se detectó una caché incompatible de una versión anterior. Recarga la página; si persiste, borra los datos del sitio una sola vez.';
  return raw.slice(0, 300);
}

})();
