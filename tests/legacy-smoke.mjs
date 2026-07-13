import assert from 'node:assert/strict';
import { Simulation } from '../js/simulation.js';
import { Creature } from '../js/creature.js';
import { randomGenome } from '../js/genetics.js';

const simulation = new Simulation();
simulation.reset();
simulation.eggs = [];
simulation.creatures = [];
simulation.paused = false;
simulation.civilization.literacy = .9;
simulation.civilization.cooperation = .9;
simulation.civilization.culturePoints = 80;
simulation.getCollectiveMetrics = () => ({ population: simulation.creatures.length, roles: 6, uniqueKnowledge: 90, synergy: .95, completedProjects: 12, queuedProjects: 0 });

for (let index = 0; index < 12; index++) {
  const genome = randomGenome(index + 40);
  genome.memory = .9;
  genome.curiosity = .9;
  genome.sociability = .82;
  const creature = new Creature({
    id: `legacy-${index}`,
    entityCode: `Ω-${String(index + 1).padStart(3, '0')}`,
    name: `Ser${index}`,
    x: 180 + index * 90,
    y: 240 + (index % 3) * 100,
    genome,
    speciesId: 1,
    generation: 2,
    age: 30,
    energy: 55,
    state: 'descansar',
    knowledge: Array.from({ length: 9 }, (_, key) => ({ kind: 'fact', key: `k-${index}-${key}`, label: `Conocimiento ${key}`, confidence: .8 }))
  });
  creature.skill = ['programador','ingeniero','cronista','explorador','educador','cientifico'][index % 6];
  simulation.creatures.push(creature);
}

for (let tick = 0; tick < 900; tick++) {
  simulation.year = tick * .12;
  simulation.time = simulation.year * 18;
  simulation.legacy.update(1, simulation);
}

const metrics = simulation.legacy.getMetrics();
assert.ok(metrics.dreams > 0, 'Deben generarse sueños');
assert.ok(metrics.activeRumors > 0, 'Deben circular rumores');
assert.ok(metrics.books > 0, 'Deben escribirse libros');
assert.ok(metrics.insights > 0, 'Deben existir síntesis colectivas');
assert.ok(['madrugada','amanecer','día','ocaso','noche'].includes(metrics.environment.phase), 'Debe existir ciclo de día');

const notable = simulation.creatures[0];
simulation.legacy.getProfile(notable.id).legacyScore = 70;
simulation.killCreature(notable, 'longevidad');
assert.ok(simulation.legacy.legacies.some(item => item.creatureId === notable.id), 'La muerte debe crear legado');
assert.ok(simulation.legacy.ruins.length > 0, 'Una vida notable debe dejar una ruina');
assert.ok(simulation.legacy.relics.length > 0, 'Una vida notable debe dejar una reliquia');

const data = simulation.serialize();
assert.equal(data.version, 11, 'El formato debe ser v11');
assert.ok(data.legacy?.books?.length > 0, 'El guardado debe incluir legado');
const restored = new Simulation();
restored.hydrate(data);
assert.equal(restored.legacy.books.length, simulation.legacy.books.length, 'Los libros deben persistir');
assert.equal(restored.legacy.ruins.length, simulation.legacy.ruins.length, 'Las ruinas deben persistir');

console.log('Legado Ω superado', restored.legacy.getMetrics());
