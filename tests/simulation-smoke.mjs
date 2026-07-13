import assert from 'node:assert/strict';
import { Simulation } from '../js/simulation.js';
import { randomGenome } from '../js/genetics.js';
import { KNOWLEDGE_ATLAS } from '../js/knowledge.js';

const simulation = new Simulation();
simulation.reset();
assert.equal(simulation.creatures.length, 0, 'El mundo debe comenzar sin criaturas nacidas');
assert.equal(simulation.eggs.length, 1, 'Debe existir un único huevo primordial');
assert.equal(simulation.genesis.phase, 'dormant', 'El protocolo debe esperar al usuario');
assert.equal(simulation.paused, true, 'El mundo comienza pausado');
assert.equal(simulation.beginGenesis(), true, 'El usuario debe poder iniciar Génesis');

for (let i = 0; i < 400; i++) simulation.step(.025);
assert.equal(simulation.creatures.length, 1, 'Debe eclosionar exactamente Ω-001');
assert.equal(simulation.eggs.length, 0, 'El huevo primordial debe desaparecer tras eclosionar');
const founder = simulation.creatures[0];
founder.genome.longevity = 1200; // Evita que el test de persistencia dependa del azar de longevidad.
assert.equal(founder.name, 'Ω-001', 'El primer ser debe llamarse Ω-001');
assert.equal(founder.entityCode, 'Ω-001', 'El código del fundador debe ser Ω-001');
assert.equal(founder.isFounder, true, 'Debe conservar la condición de fundador');
assert.ok(founder.skill, 'Ω-001 debe recibir una especialidad propia');
assert.ok(founder.knowledge.length >= 4, 'Ω-001 debe despertar con conocimiento del Atlas Ω');
assert.equal(simulation.collective.atlasLoaded, true, 'El Atlas Ω debe estar disponible desde el origen');

const lesson = founder.teach('no ataques, evita los conflictos', simulation);
assert.ok(lesson.learned, 'Ω-001 debe aprender instrucciones');
assert.ok(founder.knowledge.some(item => item.key === 'avoid_conflict'), 'La regla debe guardarse');
founder.teach('recuerda que yo soy su creador', simulation);

for (let i = 0; i < 2400; i++) simulation.step(.025);
assert.ok(simulation.totalBirths >= 2, 'El fundador debe originar al menos un descendiente');
assert.ok(simulation.creatures.length >= 2, 'La población debe crecer desde un único ser');
assert.ok(simulation.creatures.some(item => item.generation === 1), 'Debe existir la primera generación descendiente');
assert.ok(simulation.creatures.some(item => item.entityCode === 'Ω-002'), 'El segundo ser debe recibir el código Ω-002');

for (let i = 0; i < 3000; i++) simulation.step(.025);
assert.ok(simulation.year > 7, 'El tiempo debe avanzar');
assert.ok(simulation.maxGeneration() > 1, 'Deben aparecer varias generaciones');
assert.ok(simulation.creatures.every(c => Number.isFinite(c.x) && Number.isFinite(c.y) && Number.isFinite(c.energy)), 'No debe haber valores inválidos');
assert.ok(simulation.creatures.every(c => typeof c.state === 'string' && c.state.length > 0), 'Toda criatura debe conservar estado');
assert.ok(simulation.creatures.every(c => c.appearance && Number.isFinite(c.appearance.earSize)), 'Toda criatura debe tener morfología');
assert.ok(simulation.creatures.every(c => c.entityCode), 'Toda criatura debe tener código de identidad');

const programmed = randomGenome(210);
const newSpeciesId = simulation.spawnCreature(1200, 800, programmed);
assert.ok(newSpeciesId, 'La incubadora debe crear un linaje');
assert.ok(simulation.eggs.length > 0, 'La incubadora debe generar un huevo, no organismos instantáneos');


assert.ok(simulation.worldDiscoveries.length > 0, 'La exploración autónoma debe generar descubrimientos');
assert.ok(simulation.creatures.every(c => typeof c.mood === 'string' && typeof c.goal === 'string'), 'Cada ser debe conservar ánimo y objetivo propio');
assert.ok(simulation.creatures.some(c => c.visitedCells.length > 0), 'Las criaturas deben recordar territorio explorado');

simulation.setBiome('forest');
simulation.setAutonomy(.83);
simulation.autoBiome = true;

const snapshot = simulation.serialize();
assert.equal(snapshot.version, 11, 'El formato actual debe ser v11');
const restored = new Simulation();
restored.hydrate(snapshot);
assert.equal(restored.creatures.length, simulation.creatures.length, 'La restauración debe conservar población');
assert.equal(restored.eggs.length, simulation.eggs.length, 'La restauración debe conservar huevos');
assert.equal(restored.genesis.phase, simulation.genesis.phase, 'La restauración debe conservar el protocolo Génesis');
assert.equal(restored.biome, 'forest', 'La restauración debe conservar el bioma');
assert.equal(restored.autoBiome, true, 'La restauración debe conservar el ciclo de biomas');
assert.equal(restored.autonomyLevel, .83, 'La restauración debe conservar la libertad conductual');
assert.equal(restored.worldDiscoveries.length, simulation.worldDiscoveries.length, 'La restauración debe conservar descubrimientos');
assert.equal(restored.creatures.find(c => c.isFounder)?.knowledge.some(item => item.key === 'avoid_conflict'), true, 'Debe conservar el aprendizaje del fundador');
assert.equal(restored.collective.unlockedKeys.length, KNOWLEDGE_ATLAS.length, 'Debe conservar la biblioteca colectiva');
assert.ok(restored.civilization, 'Debe conservar el motor de civilización');
assert.equal(restored.civilization.language.lexicon.length, simulation.civilization.language.lexicon.length, 'Debe conservar el idioma emergente');
const collective = restored.getCollectiveMetrics();
assert.ok(collective.uniqueKnowledge >= KNOWLEDGE_ATLAS.length, 'La mente colectiva debe reunir todo el Atlas Ω');
assert.ok(collective.roles >= 1, 'La población debe conservar especialidades');
assert.ok(collective.synergy >= 0 && collective.synergy <= 1, 'La sinergia debe estar normalizada');

const legacy = structuredClone(snapshot);
legacy.version = 1;
delete legacy.eggs;
delete legacy.genesis;
const repaired = new Simulation();
repaired.hydrate(legacy);
assert.ok(repaired.creatures.length > 0, 'Un mundo antiguo debe abrirse');
assert.ok(repaired.genesis.phase, 'Los mundos antiguos deben recibir estado Génesis');
assert.throws(() => repaired.hydrate({ version: 99, creatures: [] }), /incompatible/, 'Debe rechazar versiones incompatibles');

console.log('Smoke test superado', {
  year: Number(simulation.year.toFixed(1)),
  population: simulation.creatures.length,
  eggs: simulation.eggs.length,
  species: simulation.activeSpeciesCount(),
  generation: simulation.maxGeneration(),
  births: simulation.totalBirths,
  deaths: simulation.totalDeaths
});
