import assert from 'node:assert/strict';
import { Simulation } from '../js/simulation.js';

/*
 * Regresión v6.0.1 — La poda de perfiles del LegacyEngine podía eliminar
 * perfiles de criaturas VIVAS cuando existían más de 1800 perfiles y los
 * muertos acumulaban más importancia. Acto seguido, maybeCreateRumor,
 * maybeCreateCollectiveInsight o maybeEstablishLibrary desreferenciaban el
 * perfil ausente y la aplicación caía con
 * "Cannot read properties of undefined (reading 'rumorsKnown')".
 */

const sim = new Simulation();
sim.reset();
sim.beginGenesis();

// Avanza hasta tener una población viva real.
for (let step = 0; step < 4000 && sim.creatures.length < 12; step++) sim.update(0.1);
assert.ok(sim.creatures.length >= 4, `Se necesita población viva para la prueba (hay ${sim.creatures.length})`);

const legacy = sim.legacy;

// Fuerza el peor caso: 2100 perfiles muertos con importancia máxima,
// muy por encima del +20 que reciben los vivos.
for (let index = 0; index < 2100; index++) {
  const id = `dead-legend-${index}`;
  legacy.profiles[id] = {
    id, name: `Leyenda ${index}`, entityCode: `L-${index}`, status: 'dead',
    creativity: 1, resilience: 1, spirituality: 1, hope: .5, fear: .5,
    legacyScore: 100, booksAuthored: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    relicIds: ['r1', 'r2', 'r3'], dreams: [], rumorsKnown: [], calling: '',
    factionId: '', title: '', lastSeenYear: sim.year, lastDreamYear: 0
  };
}

// Fuerza las condiciones de rumor en el siguiente ciclo del motor.
legacy.lastRumorYear = -100;

// Ejecuta muchos ciclos del motor de legado con la población viva.
// Antes de la corrección esto terminaba lanzando la excepción de forma
// probabilística; con la poda corregida los perfiles vivos nunca se eliminan.
let cycles = 0;
for (let step = 0; step < 6000; step++) {
  sim.update(0.1);
  cycles++;
  const living = sim.creatures.filter(creature => creature && !creature.dead);
  for (const creature of living) {
    assert.ok(
      legacy.profiles[creature.id],
      `El perfil de la criatura viva ${creature.id} fue podado en el ciclo ${cycles}`
    );
  }
  if (Object.keys(legacy.profiles).length <= 1800 && step > 200) break;
}

assert.ok(Object.keys(legacy.profiles).length <= 1800, 'La poda debe seguir limitando el total de perfiles');

// Comprobación directa de las rutas que desreferenciaban sin guarda:
// elimina a mano el perfil de una criatura viva y fuerza un rumor.
const living = sim.creatures.filter(creature => creature && !creature.dead);
if (living.length >= 4) {
  const victim = living[0];
  delete legacy.profiles[victim.id];
  legacy.lastRumorYear = -100;
  for (let attempt = 0; attempt < 400; attempt++) {
    legacy.maybeCreateRumor(living, sim, sim.year + attempt * 3);
  }
  // Si la guarda funciona, el perfil se recrea en lugar de provocar un crash.
}

console.log('Regresión de perfiles del legado superada', {
  perfiles: Object.keys(legacy.profiles).length,
  vivos: sim.creatures.length,
  rumores: legacy.rumors.length
});
