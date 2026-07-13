import assert from 'node:assert/strict';
import { Simulation } from '../js/simulation.js';
import { Creature } from '../js/creature.js';
import { randomGenome } from '../js/genetics.js';
import { SKILL_KEYS } from '../js/workshop.js';

const simulation = new Simulation();
simulation.reset();
simulation.beginGenesis();
for (let i = 0; i < 500; i++) simulation.step(.025);
const founder = simulation.creatures[0];
founder.age = founder.maturity * 2;
founder.energy = 180;
founder.skill = 'analista';

const skills = [...SKILL_KEYS];
for (let i = 0; i < 20; i++) {
  const genome = randomGenome(210 + i);
  genome.sociability = .95;
  genome.memory = .95;
  genome.efficiency = 1.35;
  const creature = new Creature({
    id: `gp-${i}`, entityCode: `Ω-GP-${String(i + 1).padStart(2, '0')}`, name: `GP-${i}`,
    x: 1200 + (i % 5) * 8, y: 800 + Math.floor(i / 5) * 8,
    genome, speciesId: founder.speciesId, generation: 2, age: 80, energy: 180,
    skill: skills[i % skills.length]
  });
  creature.age = creature.maturity * 2;
  simulation.creatures.push(creature);
}

const project = simulation.grandProjects.createProject(
  'software',
  'Archivo Vivo 404',
  'crear una aplicación local para organizar una biblioteca con búsqueda, etiquetas, exportación y accesibilidad',
  'offline, ligera, segura, móvil y sin dependencias externas',
  simulation
);
assert.equal(project.tasks.length, 7, 'El software debe dividirse en siete tareas trazables');
assert.equal(project.status, 'active');

for (let i = 0; i < 2400 && project.status !== 'completed'; i++) {
  simulation.grandProjects.update(1, simulation);
}
assert.equal(project.status, 'completed', 'La civilización debe poder completar el Gran Proyecto');
assert.equal(project.progress, 1, 'El proyecto terminado debe alcanzar el 100%');
assert.ok(project.tasks.every(task => task.status === 'completed'), 'Todas las fases deben completarse');
assert.ok(project.artifacts.length >= project.tasks.length, 'Cada hito debe dejar un artefacto o evidencia');
assert.ok(project.teamIds.length >= 2, 'El trabajo debe ser colectivo');
assert.ok(project.quality > .3 && project.confidence > .5, 'Debe acumular calidad y confianza internas');

const insight = simulation.grandProjects.integrateInsight(project.id, 'Revisar navegación por teclado. Añadir recuperación ante errores y pruebas de importación con archivos dañados.', simulation);
assert.equal(insight.accepted, true, 'Debe aceptar aportaciones revisadas');
assert.ok(project.externalInsights.length >= 2, 'Las aportaciones deben conservar trazabilidad');

const dossier = simulation.grandProjects.buildDossier(project.id, simulation);
assert.match(dossier, /# Archivo Vivo 404/);
assert.match(dossier, /Alcance real/);
assert.match(dossier, /Plan y resultados/);
const context = simulation.grandProjects.buildContext(project.id, simulation);
assert.match(context, /PAQUETE PARA IA EXTERNA/);
assert.match(context, /No finjas haber ejecutado pruebas/);

const snapshot = simulation.serialize();
assert.equal(snapshot.version, 11, 'El formato actual debe ser v11');
assert.equal(snapshot.grandProjects.projects.length, 1, 'El proyecto debe persistir');
const restored = new Simulation();
restored.hydrate(JSON.parse(JSON.stringify(snapshot)));
assert.equal(restored.grandProjects.projects[0].title, project.title, 'Debe restaurar el proyecto');
assert.equal(restored.grandProjects.projects[0].status, 'completed', 'Debe conservar la entrega');

const legacy = JSON.parse(JSON.stringify(snapshot));
legacy.version = 10;
delete legacy.grandProjects;
const compatible = new Simulation();
compatible.hydrate(legacy);
assert.equal(compatible.grandProjects.projects.length, 0, 'Los mundos v10 deben abrirse con el módulo vacío');

console.log('Grandes Proyectos superados', {
  project: project.title,
  tasks: project.tasks.length,
  quality: Math.round(project.quality * 100),
  insights: project.externalInsights.length
});
