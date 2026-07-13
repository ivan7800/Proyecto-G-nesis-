// Verifica que el sistema de especies lovecraftianas emerge del genoma con diversidad.
import assert from 'node:assert/strict';
import { archetypeFor, paintEldritchSprite, ARCHETYPE_IDS, archetypeName } from '../js/eldritch-sprites.js';

assert.equal(ARCHETYPE_IDS.length, 10, 'Deben existir 10 arquetipos del bestiario');

function randCreature(i) {
  let seed = i * 2654435761 >>> 0;
  const r = (min, max) => { seed = (seed * 1103515245 + 12345) >>> 0; return min + (seed / 4294967296) * (max - min); };
  return {
    id: 'X' + i,
    genome: { hue: r(0, 360), speed: r(.45, 2.4), vision: r(55, 260), size: r(2.5, 8.5),
      metabolism: r(.45, 1.85), fertility: r(.35, 1.85), aggression: r(0, 1), sociability: r(0, 1),
      curiosity: r(0, 1), memory: r(.1, 1), longevity: r(70, 260), efficiency: r(.35, 1.6), mutationRate: r(.01, .16) },
    radius: r(2.5, 8.5),
    appearance: { darkness: r(.08, .82), pattern: Math.floor(r(0, 4)), eyeSize: r(.78, 1.42),
      earSize: r(.72, 1.55), fluff: r(.65, 1.45), accentHue: r(0, 360) }
  };
}

// Diversidad: en 2000 criaturas deben emerger al menos 8 de los 10 arquetipos,
// y ninguno debe acaparar más de la mitad.
const counts = {};
for (const id of ARCHETYPE_IDS) counts[id] = 0;
for (let i = 0; i < 2000; i++) counts[archetypeFor(randCreature(i))]++;
const present = ARCHETYPE_IDS.filter(id => counts[id] > 0).length;
assert.ok(present >= 8, `Deben emerger al menos 8 arquetipos (emergieron ${present})`);
const max = Math.max(...Object.values(counts));
assert.ok(max < 1000, `Ningún arquetipo debe acaparar >50% (máximo ${max})`);

// Estabilidad: el mismo ser siempre da el mismo arquetipo.
const c = randCreature(42);
assert.equal(archetypeFor(c), archetypeFor(c), 'El arquetipo debe ser estable');

// Cada arquetipo genera un sprite con contenido.
function makeCanvas(size) {
  let fills = 0;
  const ctx = { fillStyle: '#000', imageSmoothingEnabled: true, clearRect() {}, fillRect() { fills++; } };
  return { width: size, height: size, getContext: () => ctx, get fills() { return fills; } };
}
for (const id of ARCHETYPE_IDS) {
  const canvas = makeCanvas(96);
  const creature = randCreature(1);
  creature._archetype = id;
  paintEldritchSprite(canvas, creature, 'full');
  assert.ok(canvas.fills > 20, `El arquetipo ${id} debe dibujar una silueta`);
  assert.ok(archetypeName(id).length > 2, `El arquetipo ${id} debe tener nombre`);
}

console.log('Especies lovecraftianas verificadas:', present, 'de 10 emergen, siluetas no vacías ✔');
