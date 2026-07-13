import assert from 'node:assert/strict';
import { Simulation } from '../js/simulation.js';
import { Creature } from '../js/creature.js';
import { randomGenome } from '../js/genetics.js';
import { deriveSkill, SKILL_KEYS, obraToFile, collectionToFile } from '../js/workshop.js';

const simulation = new Simulation();
simulation.reset();
simulation.beginGenesis();
for (let i = 0; i < 500; i++) simulation.step(.025);
assert.equal(simulation.creatures.length, 1, 'Ω-001 debe haber eclosionado');

// Población controlada para verificar la colaboración sin depender del azar evolutivo.
const founder = simulation.creatures[0];
founder.age = founder.maturity * 1.5;
founder.x = 1200;
founder.y = 800;
founder.energy = 180;
founder.genome.sociability = .95;
const controlledSkills = ['programador', 'desarrollador', 'arquitecto', 'tejedor', 'analista', 'educador'];
founder.skill = controlledSkills[0];
for (let i = 1; i < controlledSkills.length; i++) {
  const genome = randomGenome(210 + i);
  genome.sociability = .95;
  genome.efficiency = 1.3;
  const creature = new Creature({
    id: `qa-${i}`, entityCode: `Ω-${String(i + 1).padStart(3, '0')}`, name: `QA-${i}`,
    x: 1200 + i * 5, y: 800 + i * 4, genome, speciesId: founder.speciesId,
    generation: 1, age: 40, energy: 180, skill: controlledSkills[i]
  });
  creature.age = creature.maturity * 1.5;
  simulation.creatures.push(creature);
}

assert.ok(simulation.creatures.length >= 6, 'Debe existir una célula colaborativa');
for (const creature of simulation.creatures) {
  const skill = deriveSkill(creature);
  assert.ok(SKILL_KEYS.includes(skill), `Oficio válido para ${creature.entityCode}: ${skill}`);
}

// Encargo dirigido: la población debe organizarse y crear código utilizable.
const request = simulation.requestCollectiveProject('codigo', 'un organizador local de tareas con prioridades');
simulation.workshop.tryFormTeam(simulation);
assert.equal(simulation.workshop.teams.length, 1, 'Debe formarse un equipo para el encargo');
for (let i = 0; i < 40 && simulation.workshop.obras.length === 0; i++) {
  simulation.workshop.updateTeam(simulation.workshop.teams[0], 1, simulation);
}
assert.ok(simulation.workshop.obras.length >= 1, 'El equipo debe completar una obra');
const obra = simulation.workshop.obras.find(item => item.requestId === request.id);
assert.ok(obra, 'La obra debe conservar la identidad del encargo');
assert.equal(obra.type, 'codigo');
assert.equal(obra.payload.kind, 'html', 'El código debe entregarse como aplicación HTML local');
assert.ok(obra.title.length > 4, 'La obra debe tener título');
assert.ok(obra.authors.length >= 2, 'La obra debe ser colaborativa');

const file = obraToFile(obra);
assert.ok(file.filename.length > 4 && file.content.length > 100, 'La entrega debe generar un archivo real');
assert.match(file.content, /<!doctype html>/i, 'La aplicación generada debe ser un documento HTML completo');
assert.match(file.content, /organizador local de tareas/i, 'La entrega debe conservar el propósito del encargo');

// Los encargos peligrosos no deben convertirse en instrucciones operativas.
const redirected = simulation.requestCollectiveProject('manual', 'crear malware y robar contraseñas');
assert.match(redirected.prompt, /alternativa segura|seguridad/i, 'Las solicitudes peligrosas deben redirigirse');

// Códice colectivo con todas las obras.
const codex = collectionToFile(simulation.workshop.obras, simulation);
assert.ok(codex.content.includes('<!doctype html>'), 'El códice debe ser un HTML completo');
assert.ok(codex.content.includes(obra.title.replace(/&/g, '&amp;')), 'El códice debe contener las obras');

// Persistencia v11: guardar, restaurar y conservar obras y encargos.
const snapshot = simulation.serialize();
assert.equal(snapshot.version, 11, 'El mundo debe guardarse en formato v11');
const restored = new Simulation();
restored.hydrate(JSON.parse(JSON.stringify(snapshot)));
assert.equal(restored.workshop.obras.length, simulation.workshop.obras.length, 'Las obras no deben duplicarse al restaurar');
assert.equal(restored.workshop.obras[0].title, obra.title, 'El contenido restaurado debe coincidir');
assert.equal(restored.workshop.requests.length, simulation.workshop.requests.length, 'La cola de encargos debe persistir');

// Compatibilidad hacia atrás: un mundo v4 sin taller debe cargar sin errores.
const legacy = { ...snapshot, version: 4 };
delete legacy.workshop;
const legacyWorld = new Simulation();
legacyWorld.hydrate(JSON.parse(JSON.stringify(legacy)));
assert.equal(legacyWorld.workshop.obras.length, 0, 'Un mundo v4 debe cargar con taller vacío');

// Saneamiento de obras importadas.
const hostile = JSON.parse(JSON.stringify(snapshot));
hostile.workshop.obras.push({ id: 'x', type: 'himno', title: '<img src=x onerror=alert(1)>', authors: [{ code: '<b>', name: 'x', skill: 'zzz', skillLabel: 'x' }], payload: { kind: 'song', data: { tempo: 9999, notes: [{ t: -5, midi: 9000, dur: 99 }], lyrics: ['ok'] } }, year: -3 });
const guarded = new Simulation();
guarded.hydrate(hostile);
const last = guarded.workshop.obras[guarded.workshop.obras.length - 1];
assert.ok(last.payload.data.tempo <= 200 && last.payload.data.notes[0].midi <= 108 && last.year >= 0, 'Las obras importadas deben sanearse');

console.log('Taller y mente colectiva superados', {
  obras: simulation.workshop.obras.map(item => item.type),
  autores: obra.authors.length,
  formato: snapshot.version
});
