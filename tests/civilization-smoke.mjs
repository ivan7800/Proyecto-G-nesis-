import assert from 'node:assert/strict';
import { Civilization, TECHNOLOGY_TREE, CIVILIZATION_ERAS } from '../js/civilization.js';

const learned = [];
const creatures = Array.from({ length: 52 }, (_, index) => ({
  id: `c-${index}`, generation: index % 5, dead: false, energy: 92, maxEnergy: 120,
  learnKnowledge(item, source) { learned.push({ item, source }); return true; }
}));
const works = Array.from({ length: 12 }, (_, index) => ({
  id: `obra-${index}`, title: `Obra ${index + 1}`, type: ['codigo', 'investigacion', 'himno', 'invento'][index % 4]
}));
const discoveries = Array.from({ length: 18 }, (_, index) => ({
  key: `d-${index}`, year: index + 1, creatureCode: `Ω-${String(index + 1).padStart(3, '0')}`,
  label: `patrón ${index + 1}`, biome: 'forest'
}));
const events = [];
const simulation = {
  year: 0, totalBirths: 60, creatures, food: Array.from({ length: 400 }, () => ({})), worldDiscoveries: discoveries,
  workshop: { obras: works },
  getCollectiveMetrics() {
    return { population: creatures.length, roles: 19, uniqueKnowledge: 140, synergy: .92, completedProjects: works.length };
  },
  logEvent(time, text) { events.push({ time, text }); }
};

const civilization = new Civilization();
civilization.researchPoints = 3000;
civilization.innovationPoints = 3000;
civilization.culturePoints = 200;
for (let index = 0; index < 30; index++) {
  simulation.year += 3;
  civilization.update(1, simulation);
}

assert.equal(civilization.technologies.length, TECHNOLOGY_TREE.length, 'Debe poder completar el árbol tecnológico al cumplir todos los requisitos');
assert.ok(civilization.language.lexicon.length >= 10, 'El idioma debe crecer con el tiempo y la población');
assert.ok(civilization.culture.values.length >= 5, 'Deben aparecer valores culturales persistentes');
assert.ok(civilization.institutions.length >= 5, 'Deben fundarse instituciones por hitos');
assert.equal(civilization.eraIndex, CIVILIZATION_ERAS.length - 1, 'La sociedad madura debe alcanzar la era de civilización en red');
assert.ok(civilization.chronicle.length > 20, 'La crónica debe registrar logros, lenguaje, cultura e instituciones');
assert.ok(learned.some(entry => entry.item.key.startsWith('civilization:technology:')), 'Los avances deben convertirse en conocimiento individual compartido');
assert.ok(events.some(entry => /Avance civilizatorio/.test(entry.text)), 'La simulación debe anunciar avances relevantes');

const context = civilization.buildAIContext(simulation, 'mejorar la gestión de recursos');
assert.match(context, /REVISIÓN HUMANA|INSTRUCCIONES PARA LA IA EXTERNA/i, 'El paquete externo debe incluir salvaguardas y contexto');
assert.match(context, /mejorar la gestión de recursos/i, 'Debe conservar la pregunta del usuario');
const integration = civilization.absorbExternalWisdom('Conviene medir el consumo antes de cambiar el sistema. Después se puede probar una mejora pequeña y comparar resultados.', simulation);
assert.equal(integration.accepted, true, 'Debe integrar una respuesta externa validada');
assert.ok(integration.learned > 0, 'La respuesta validada debe alimentar conocimientos individuales');

const restored = new Civilization(civilization.serialize());
assert.deepEqual(restored.technologies, civilization.technologies, 'La persistencia debe conservar tecnologías');
assert.equal(restored.language.lexicon.length, civilization.language.lexicon.length, 'La persistencia debe conservar el idioma');
assert.equal(restored.externalWisdom.length, 1, 'La persistencia debe conservar la sabiduría externa revisada');

console.log('Civilización superada', {
  era: CIVILIZATION_ERAS[civilization.eraIndex].label,
  technologies: civilization.technologies.length,
  institutions: civilization.institutions.length,
  words: civilization.language.lexicon.length,
  chronicle: civilization.chronicle.length
});
