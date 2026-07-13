// Verifica la lógica de rendimiento, el volumen y el sistema visual 16-bit eldritch
// sin depender de un DOM (para entornos sin jsdom).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFileSync(resolve(root, f), 'utf8');
const renderer = read('js/renderer.js');
const ui = read('js/ui.js');
const html = read('index.html');
const eldritch = read('js/eldritch-sprites.js');

// --- Pixel-art 16-bit ---
assert.ok(/imageSmoothingEnabled = false/.test(renderer), 'El suavizado se desactiva para el look pixelado');
assert.ok(/paintEldritchSprite/.test(renderer), 'El renderer usa sprites eldritch');
assert.ok(/drawEldritchMicro/.test(renderer), 'El renderer usa micro eldritch');
assert.ok(/paintEldritchSprite\(canvas, creature, detail\)/.test(eldritch), 'El módulo exporta el pintor de sprites');
assert.ok(/function drawCthulhu[\s\S]*for \(let t = -3; t <= 3; t\+\+\)/.test(eldritch), 'La silueta Cthulhu debe dibujar apéndices cefálicos');
assert.ok(/function eyes\(/.test(eldritch) && /drawShoggoth[\s\S]*const n = 5/.test(eldritch), 'Los sprites deben incluir ojos múltiples');
// Resolución base baja = píxeles cuadrados reales
assert.ok(/GRID = 34/.test(eldritch), 'Resolución base de 34px para pixel-art');

// --- Los sprites no se rotan (orientación fija eldritch) ---
assert.ok(!/ctx\.rotate\(Number\.isFinite\(creature\.angle\)/.test(renderer), 'Los sprites ya no giran con el movimiento');
assert.ok(/onScreen > 220/.test(renderer) && /onScreen > 340/.test(renderer), 'Con enjambres visibles se fuerza el nivel micro');

// --- Umbrales de rendimiento más agresivos ---
assert.ok(/population > 350 \|\| fps < 45/.test(renderer), 'Entra en modo ligero antes (350 seres / 45 fps)');

// --- Heurística ---
function decide({ mode, population, fps, active }) {
  if (mode === 'rendimiento') return true;
  if (mode === 'alta') return false;
  if (active) { if (population < 280 && fps > 52) return false; return true; }
  if (population > 350 || fps < 45) return true;
  return false;
}
assert.equal(decide({ mode: 'auto', population: 400, fps: 60, active: false }), true, 'auto entra con 400 seres');
assert.equal(decide({ mode: 'auto', population: 200, fps: 60, active: false }), false, 'auto detallado con pocos seres');
assert.equal(decide({ mode: 'rendimiento', population: 1, fps: 60, active: false }), true, 'rendimiento forzado');
assert.equal(decide({ mode: 'alta', population: 9999, fps: 5, active: false }), false, 'alta nunca cede');

// --- Volumen ---
assert.ok(/this\.masterVolume = readNumberSetting\('genesis-volume'/.test(ui), 'volumen persistido');
assert.ok(/utterance\.volume = \.92 \* this\.masterVolume/.test(ui), 'voz respeta volumen');
assert.ok(/master\.gain\.value = \.2 \* this\.masterVolume/.test(ui), 'himno respeta volumen');

// --- Controles en HTML ---
assert.ok(/id="volumeSlider"/.test(html) && /id="qualitySelect"/.test(html), 'controles presentes');

console.log('Visual 16-bit eldritch + rendimiento + audio: todo verificado ✔');
