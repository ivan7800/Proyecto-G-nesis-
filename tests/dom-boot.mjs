import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8').replace(/<script[^>]*src="js\/app\.bundle\.js[^"]*"[^>]*><\/script>/, '');
const bundle = readFileSync(resolve(root, 'js', 'app.bundle.js'), 'utf8');

const dom = new JSDOM(html, { url: 'https://genesis.local/', pretendToBeVisual: false, runScripts: 'outside-only' });
const { window } = dom;

/* ===== Entorno de navegador mínimo ===== */
const rafQueue = [];
window.requestAnimationFrame = callback => { rafQueue.push(callback); return rafQueue.length; };
window.cancelAnimationFrame = () => {};
let clock = 0;
window.performance.now = () => clock;
function pumpFrames(count, frameMs = 16.7) {
  for (let i = 0; i < count; i++) {
    clock += frameMs;
    const callbacks = rafQueue.splice(0, rafQueue.length);
    for (const callback of callbacks) callback(clock);
  }
}

const context2d = new Proxy({}, {
  get(target, prop) {
    if (prop === 'canvas') return {};
    if (prop === 'measureText') return () => ({ width: 10 });
    if (prop === 'createRadialGradient' || prop === 'createLinearGradient') return () => ({ addColorStop() {} });
    if (prop === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
    if (typeof prop === 'string') return () => {};
    return undefined;
  },
  set() { return true; }
});
window.HTMLCanvasElement.prototype.getContext = function () { return context2d; };
window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));

const downloads = [];
window.URL.createObjectURL = blob => { downloads.push(blob); return `blob:mock-${downloads.length}`; };
window.URL.revokeObjectURL = () => {};
const realCreate = window.document.createElement.bind(window.document);
window.document.createElement = tag => {
  const element = realCreate(tag);
  if (tag === 'a') element.click = () => { element.dataset.clicked = 'true'; window.__lastDownload = { name: element.download, href: element.href }; };
  return element;
};

/* ===== Arranque real del bundle ===== */
window.eval(bundle);
pumpFrames(3);

const doc = window.document;
assert.equal(doc.documentElement.dataset.ready, 'true', 'La aplicación debe arrancar');
assert.equal(doc.getElementById('bootError').hidden, true, 'No debe mostrarse la pantalla de error');
assert.ok(window.__GENESIS__?.simulation, 'El gancho de QA debe estar disponible');
assert.equal(doc.getElementById('appVersion').textContent, `v${window.__GENESIS__.version}`, 'La versión visible debe coincidir');

const { simulation, renderer, ui } = window.__GENESIS__;
assert.equal(simulation.genesis.phase, 'dormant', 'El mundo espera la activación');

/* ===== Cámara adaptativa y biomas ===== */
renderer.resetCamera();
const fitZoom = renderer.getMinZoom();
assert.equal(renderer.camera.zoom, fitZoom, 'El reset debe encajar el mundo completo');
doc.getElementById('cameraZoomInBtn').click();
assert.ok(renderer.camera.zoom > fitZoom, 'El botón de acercar debe aumentar el zoom');
doc.getElementById('cameraResetBtn').click();
assert.equal(renderer.camera.zoom, fitZoom, 'El botón de encaje debe restaurar el zoom mínimo');
doc.getElementById('biomeSelect').value = 'forest';
doc.getElementById('biomeSelect').dispatchEvent(new window.Event('change', { bubbles: true }));
assert.equal(simulation.biome, 'forest', 'El selector debe cambiar el bioma');
assert.match(doc.getElementById('biomeLabel').textContent, /BOSQUE/, 'La interfaz debe reflejar el bioma');
doc.getElementById('autonomyRange').value = '82';
doc.getElementById('autonomyRange').dispatchEvent(new window.Event('input', { bubbles: true }));
assert.equal(simulation.autonomyLevel, .82, 'El control debe ajustar la libertad conductual');
doc.getElementById('biomeQuickSelect').value = 'meadow';
doc.getElementById('biomeQuickSelect').dispatchEvent(new window.Event('change', { bubbles: true }));
assert.equal(simulation.biome, 'meadow', 'El selector premium siempre visible debe cambiar el bioma');

/* ===== Activación del protocolo desde el botón real ===== */
doc.getElementById('startGenesisBtn').click();
assert.equal(simulation.genesis.phase, 'incubating', 'El botón debe iniciar la eclosión');
pumpFrames(120, 120);
assert.ok(simulation.creatures.length >= 1, 'Ω-001 debe eclosionar mediante el bucle real de frames');
assert.equal(doc.getElementById('genesisIntro').hidden, true, 'La introducción debe ocultarse tras activar');

/* ===== Pestañas ===== */
for (const name of ['code', 'science', 'taller', 'collective', 'grandproject', 'civilization', 'legacy', 'archive', 'god']) {
  doc.getElementById(`tabButton-${name}`).click();
  assert.equal(doc.getElementById(`tab-${name}`).hidden, false, `La pestaña ${name} debe activarse`);
}



/* ===== Mente colectiva y encargo visible ===== */
doc.getElementById('openCollectiveBtn').click();
assert.equal(doc.getElementById('tab-collective').hidden, false, 'El acceso premium debe abrir Mente Ω');
doc.getElementById('injectAtlasBtn').click();
assert.ok(simulation.getCollectiveMetrics().uniqueKnowledge >= 60, 'El Atlas Ω debe alimentar la memoria compartida');
doc.getElementById('collectiveProjectType').value = 'plan';
doc.getElementById('collectivePrompt').value = 'mejorar el cuidado del ecosistema';
doc.getElementById('collectiveProjectBtn').click();
assert.equal(simulation.workshop.requests.at(-1)?.type, 'plan', 'El formulario debe crear un encargo colectivo');
assert.match(doc.getElementById('collectiveProjectsList').textContent, /ecosistema/i, 'El encargo debe mostrarse en el panel');

/* ===== Gran Proyecto: mandato, plan y exportación ===== */
doc.getElementById('openGrandProjectBtn').click();
assert.equal(doc.getElementById('tab-grandproject').hidden, false, 'El acceso premium debe abrir Gran Proyecto');
doc.getElementById('grandProjectType').value = 'software';
doc.getElementById('grandProjectTitle').value = 'Archivo Vivo QA';
doc.getElementById('grandProjectBrief').value = 'crear una biblioteca local con búsqueda, etiquetas y exportación';
doc.getElementById('grandProjectConstraints').value = 'offline, accesible y ligera';
doc.getElementById('grandProjectCreateBtn').click();
assert.equal(simulation.grandProjects.projects.length, 1, 'El formulario debe convocar un Gran Proyecto');
assert.match(doc.getElementById('grandProjectList').textContent, /Archivo Vivo QA/, 'El proyecto debe mostrarse en el consejo');
assert.ok(doc.getElementById('grandProjectTaskList').children.length >= 6, 'La interfaz debe mostrar sus fases y tareas');
doc.getElementById('grandProjectContextBtn').click();
assert.ok(window.__lastDownload?.name?.includes('Contexto-IA'), 'Debe exportar contexto trazable');
doc.getElementById('grandProjectExternalInput').value = 'Añadir navegación por teclado. Probar importación dañada y recuperación ante errores.';
doc.getElementById('grandProjectIntegrateBtn').click();
assert.ok(simulation.grandProjects.projects[0].externalInsights.length >= 2, 'Debe integrar conocimiento externo revisado');
doc.getElementById('grandProjectDossierBtn').click();
assert.ok(window.__lastDownload?.name?.includes('Dossier-Omega'), 'Debe exportar el dossier del proyecto');

/* ===== Civilización y puente externo ===== */
doc.getElementById('openCivilizationBtn').click();
assert.equal(doc.getElementById('tab-civilization').hidden, false, 'El acceso premium debe abrir Civilización');

doc.getElementById('openLegacyBtn').click();
assert.equal(doc.getElementById('tab-legacy').hidden, false, 'El acceso premium debe abrir Legado Ω');
doc.getElementById('oracleQuestion').value = 'proponer un avance seguro';
doc.getElementById('exportOracleBtn').click();
assert.ok(window.__lastDownload?.name?.includes('Contexto-IA'), 'El puente debe exportar un paquete de contexto');
doc.getElementById('oracleResponse').value = 'Primero medid los recursos disponibles. Después probad una mejora pequeña y comparad resultados antes de ampliarla.';
doc.getElementById('integrateOracleBtn').click();
assert.equal(simulation.civilization.externalWisdom.length, 1, 'Debe integrar una respuesta externa revisada');
assert.match(doc.getElementById('oracleStatus').textContent, /ideas validadas/i, 'La interfaz debe confirmar la integración');

/* ===== Enseñanza por el canal cognitivo real ===== */
ui.selectCreature(simulation.creatures[0]);
doc.getElementById('teachInput').value = 'no ataques, evita los conflictos';
doc.getElementById('teachForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
assert.ok(simulation.creatures[0].knowledge.some(item => item.key === 'avoid_conflict'), 'La enseñanza desde el formulario debe funcionar');

/* ===== Taller: obra real y entrega mediante clic ===== */
for (let i = 0; i < 8000 && simulation.workshop.obras.length === 0; i++) simulation.step(.05);
assert.ok(simulation.workshop.obras.length >= 1, 'El taller debe producir obras');
doc.getElementById('tabButton-taller').click();
const deliverButton = doc.querySelector('#obraList button[data-action="deliver"]');
assert.ok(deliverButton, 'Debe existir el botón Entregar obra');
deliverButton.click();
assert.ok(window.__lastDownload?.name?.length > 4, 'La entrega debe generar una descarga real');
assert.ok(downloads.length >= 1, 'Debe crearse un Blob de descarga');
assert.ok(simulation.workshop.obras.some(obra => obra.delivered), 'La obra debe marcarse como entregada');

doc.getElementById('deliverAllBtn').click();
assert.ok(window.__lastDownload.name.includes('Codice'), 'El códice completo debe descargarse');

/* ===== Guardado en almacenamiento alternativo (sin IndexedDB) ===== */
doc.getElementById('saveBtn').click();
await new Promise(resolveWait => setTimeout(resolveWait, 50));
pumpFrames(2);
assert.ok(!doc.getElementById('bootError').hidden === false, 'El guardado no debe romper la aplicación');

console.log('Integración DOM superada', {
  poblacion: simulation.creatures.length,
  obras: simulation.workshop.obras.map(obra => obra.type),
  descargas: downloads.length
});
