import assert from 'node:assert/strict';
import { Society, GOVERNMENT_TYPES } from '../js/society.js';

const events = [];
const chronicle = [];
const creatures = Array.from({ length: 56 }, (_, index) => ({
  id: `c-${index}`,
  name: `Entidad-${index}`,
  entityCode: `Ω-${String(index + 1).padStart(3, '0')}`,
  generation: index % 7,
  parents: index > 2 ? [`c-${Math.floor(index / 2)}`] : [],
  dead: false,
  age: 18 + index,
  maturity: 10,
  energy: 95,
  maxEnergy: 120,
  bond: .4 + (index % 5) * .1,
  genome: {
    aggression: (index % 8) / 8,
    sociability: ((index * 3) % 10) / 10,
    curiosity: ((index * 7) % 10) / 10,
    memory: .45 + (index % 6) * .08,
    efficiency: .8 + (index % 5) * .12,
    speed: .8 + (index % 7) * .17,
    mutationRate: .05
  },
  experience: { discoveries: index % 9, collaborations: index % 11, socialLearns: index % 7 },
  relationships: {}
}));

const simulation = {
  year: 0,
  creatures,
  logEvent(time, text) { events.push({ time, text }); },
  killCreature(creature, reason) { creature.dead = true; creature.deathReason = reason; }
};
const civilization = {
  stability: .56,
  prosperity: .62,
  cooperation: .82,
  literacy: .7,
  institutions: Array.from({ length: 5 }, (_, index) => ({ key: `i-${index}` })),
  recordChronicle(year, type, text, ref) { chronicle.unshift({ year, type, text, ref }); }
};

const society = new Society();
for (let year = 1; year <= 32; year += 1) {
  simulation.year = year;
  society.update(1, simulation, civilization);
}

assert.ok(society.factions.length >= 5, 'Una población grande debe formar varias facciones');
assert.ok(society.factions.every(faction => faction.memberIds.length > 0), 'Las facciones activas deben tener miembros');
assert.ok(society.factions.some(faction => faction.leaderId), 'Las facciones deben elegir líderes');
assert.ok(society.government.rulerId, 'La sociedad debe designar un gobernante');
assert.ok(GOVERNMENT_TYPES[society.government.type], 'El gobierno debe tener un tipo válido');
assert.ok(society.government.laws.length >= 2, 'El gobierno debe promulgar leyes con el tiempo');
assert.ok(society.sagas.length >= society.factions.length, 'Las fundaciones y reinados deben generar sagas');

// La corona y la sucesión hereditaria deben ser posibilidades reales, no solo etiquetas.
const crownFaction = society.factions.find(faction => faction.memberIds.length >= 2);
society.appointGovernment('monarchy', crownFaction, creatures.filter(item => !item.dead), simulation, civilization, simulation.year, 'aclamación del linaje');
assert.equal(society.government.type, 'monarchy', 'La sociedad debe poder convertirse en monarquía');
assert.match(society.government.title, /Soberano/i, 'La monarquía debe designar un soberano');
const firstMonarch = society.getProfile(society.government.rulerId);
const heirId = crownFaction.memberIds.find(id => id !== firstMonarch.id);
const heir = society.getProfile(heirId);
heir.parents = [firstMonarch.id];
heir.influence = 1; heir.ambition = 1; heir.honor = 1;
const monarchCreature = creatures.find(item => item.id === firstMonarch.id);
monarchCreature.dead = true;
firstMonarch.status = 'dead';
society.appointGovernment('monarchy', crownFaction, creatures.filter(item => !item.dead), simulation, civilization, simulation.year + 1, 'sucesión');
assert.equal(society.government.rulerId, heir.id, 'La corona debe poder pasar a un descendiente con suficiente legitimidad');

const first = society.factions[0];
const second = society.factions[1];
const war = society.startWar(first, second, simulation, civilization, simulation.year, 'una disputa de prueba por la frontera');
assert.ok(war && war.status === 'active', 'Debe poder comenzar una guerra entre facciones');
for (let year = 33; year <= 50; year += 1) {
  simulation.year = year;
  society.update(1, simulation, civilization);
}
assert.equal(war.status, 'ended', 'La guerra debe resolverse por ventaja o agotamiento');
assert.ok(war.battles.length >= 1, 'Las guerras deben contener batallas narradas');
assert.ok(society.treaties.some(treaty => treaty.type === 'peace'), 'Una guerra terminada debe crear un tratado de paz');
assert.ok(chronicle.some(item => item.type === 'guerra'), 'La guerra debe quedar en la crónica');
assert.ok(chronicle.some(item => item.type === 'paz'), 'La paz debe quedar en la crónica');

// Fuerza un contexto político propicio y deja que el motor resuelva la intriga.
const ruler = society.getProfile(society.government.rulerId);
const challengerFaction = society.factions.find(faction => faction.leaderId && faction.leaderId !== ruler.id);
const challenger = society.getProfile(challengerFaction.leaderId);
society.government.legitimacy = .05;
society.unrest = 1;
challenger.ambition = 1;
challenger.cunning = 1;
challenger.loyalty = 0;
challenger.honor = 0;
challenger.influence = 1;
ruler.influence = .1;
for (let year = 53; year <= 140 && society.totalBetrayals === 0; year += 3) {
  simulation.year = year;
  society.maybeTriggerIntrigue(creatures.filter(item => !item.dead), simulation, civilization, year);
}
assert.ok(society.totalBetrayals >= 1, 'La baja legitimidad y la ambición deben poder producir traiciones o golpes');
assert.ok(chronicle.some(item => item.type === 'traición' || item.type === 'deserción'), 'La intriga debe narrarse en la crónica');

const metrics = society.getMetrics();
assert.ok(metrics.factions >= 2);
assert.ok(metrics.totalWars >= 1);
assert.ok(metrics.betrayals >= 1);

const restored = new Society(society.serialize());
assert.equal(restored.factions.length, society.factions.length, 'El guardado debe conservar facciones');
assert.equal(restored.totalWars, society.totalWars, 'El guardado debe conservar guerras');
assert.equal(restored.totalBetrayals, society.totalBetrayals, 'El guardado debe conservar traiciones');
assert.equal(restored.government.rulerId, society.government.rulerId, 'El guardado debe conservar el gobernante');

console.log('Sociedad superada', {
  factions: metrics.factions,
  government: metrics.government.label,
  wars: metrics.totalWars,
  betrayals: metrics.betrayals,
  treaties: metrics.treaties,
  sagas: metrics.sagas
});
