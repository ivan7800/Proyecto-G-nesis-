import assert from 'node:assert/strict';
import { Simulation } from '../js/simulation.js';

/*
 * Regresión v6.0.2 — mecánicas introducidas por la optimización de rendimiento.
 * La app se saturaba con población alta: ~9,6 ms/frame de media solo en simulación
 * y tirones de hasta 66 ms por el pipeline social. Las correcciones deben conservar
 * la semántica: este test verifica los contratos, no números de FPS (frágiles en CI).
 */

const sim = new Simulation();
sim.reset();
sim.beginGenesis();
sim.speed = 12;
const t0 = Date.now();
while (sim.creatures.length < 120 && Date.now() - t0 < 90000) sim.update(0.1);
sim.speed = 1;
assert.ok(sim.creatures.length >= 40, `Población insuficiente para la prueba (${sim.creatures.length})`);
for (let s = 0; s < 60; s++) sim.update(1 / 60);

// 1) Caché de directivas: refleja el aprendizaje inmediatamente (invalidación correcta).
const learner = sim.creatures.find(creature => !creature.dead);
const before = learner.directiveSet();
assert.ok(before instanceof Set, 'directiveSet debe devolver un Set');
assert.strictEqual(learner.directiveSet(), before, 'Sin cambios de conocimiento, el Set debe ser el mismo objeto (caché)');
const learned = learner.learnKnowledge({ kind: 'directive', key: 'explore_more', label: 'Explora más', confidence: .9, createdAt: Date.now() }, 'prueba');
assert.ok(learned, 'La criatura debe poder aprender la directiva');
const after = learner.directiveSet();
assert.notStrictEqual(after, before, 'Aprender debe invalidar la caché de directivas');
assert.ok(after.has('explore_more'), 'La directiva aprendida debe estar en el Set reconstruido');

// 2) Perceptos: se calculan al sensar y los candidatos muertos se descartan al usarlos.
const perceiver = sim.creatures.find(creature => !creature.dead && creature.percepts && (creature.percepts.friend || creature.percepts.mate));
assert.ok(perceiver, 'Con decenas de criaturas debe existir alguna con perceptos sociales');
const candidate = perceiver.percepts.friend || perceiver.percepts.mate;
candidate.dead = true;
for (let s = 0; s < 3; s++) perceiver.update(1 / 60, sim);
assert.ok(!['ayudar', 'socializar'].includes(perceiver.state) || perceiver.goal.indexOf(candidate.name) === -1,
  'Una criatura no debe perseguir a un candidato muerto entre sensados');
candidate.dead = false;

// 3) Métricas colectivas: caché TTL coherente.
const m1 = sim.getCollectiveMetrics();
const m2 = sim.getCollectiveMetrics();
assert.strictEqual(m1, m2, 'Dentro del TTL debe devolverse el mismo objeto');
for (let s = 0; s < 30; s++) sim.update(1 / 60); // > 0,35 s simulados
const m3 = sim.getCollectiveMetrics();
assert.notStrictEqual(m1, m3, 'Pasado el TTL debe recalcularse');
assert.equal(typeof m3.population, 'number');

// 4) Pipeline social troceado: las fases encoladas se drenan por completo desde la civilización
// y un tick nuevo con lote pendiente lo vacía antes (flushPhases), conservando el orden.
const society = sim.civilization.society;
society.lastUpdateYear = -1; // fuerza el tick en la próxima actualización
society.update(1, sim, sim.civilization);
const queuedAfterTick = society.phaseQueue.length;
assert.ok(queuedAfterTick > 0, 'El tick social debe dejar fases encoladas');
for (let s = 0; s < 20 && society.phaseQueue.length; s++) sim.update(1 / 60);
assert.equal(society.phaseQueue.length, 0, 'La civilización debe drenar todas las fases en pocos frames');
society.lastUpdateYear = -1;
society.phaseQueue = [() => { society._flushed = true; }];
society.update(1, sim, sim.civilization);
assert.ok(society._flushed, 'Un tick nuevo debe vaciar (flush) el lote pendiente antes de encolar');
delete society._flushed;

// 5) Cota de cordura (muy laxa para evitar falsos rojos en CI): a población media,
// la media de sim.update no debe dispararse a niveles pre-optimización.
let total = 0;
const FRAMES = 240;
for (let i = 0; i < FRAMES; i++) { const a = performance.now(); sim.update(1 / 60); total += performance.now() - a; }
const average = total / FRAMES;
assert.ok(average < 25, `Media de sim.update sospechosamente alta: ${average.toFixed(2)} ms/frame`);

console.log('Regresión de rendimiento superada', {
  poblacion: sim.creatures.length,
  mediaMsFrame: +average.toFixed(2),
  fasesEncoladasEnTick: queuedAfterTick
});
