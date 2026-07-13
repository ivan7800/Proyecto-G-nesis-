import { CONFIG } from './config.js?v=6.0.2';
import { SKILLS, deriveSkill } from './workshop.js?v=6.0.2';
import { clamp, finiteOr, uid } from './utils.js?v=6.0.2';
import { sanitizeCollectivePrompt } from './knowledge.js?v=6.0.2';

export const GRAND_PROJECT_TYPES = Object.freeze({
  software: Object.freeze({ label: 'Software o aplicación', icon: '⌘', defaultTitle: 'Sistema Ω', summary: 'Diseñar una aplicación funcional, verificable y documentada.' }),
  game: Object.freeze({ label: 'Videojuego', icon: '◆', defaultTitle: 'Juego Ω', summary: 'Crear concepto, reglas, prototipo, arte, pruebas y entrega.' }),
  city: Object.freeze({ label: 'Ciudad autosuficiente', icon: '⌂', defaultTitle: 'Ciudad Ω', summary: 'Planificar hábitat, recursos, seguridad, gobierno y mantenimiento.' }),
  research: Object.freeze({ label: 'Investigación', icon: '◫', defaultTitle: 'Investigación Ω', summary: 'Plantear hipótesis, reunir evidencias, contrastar y documentar límites.' }),
  invention: Object.freeze({ label: 'Invención', icon: '⚙', defaultTitle: 'Invención Ω', summary: 'Convertir una necesidad en prototipo, pruebas y plan de mejora.' }),
  book: Object.freeze({ label: 'Libro o historia', icon: '▤', defaultTitle: 'Códice Ω', summary: 'Construir propósito, estructura, borrador, revisión y edición.' }),
  observatory: Object.freeze({ label: 'Observatorio científico', icon: '✦', defaultTitle: 'Observatorio Ω', summary: 'Coordinar óptica, arquitectura, datos, operación y divulgación.' }),
  world_cure: Object.freeze({ label: 'Cura del mundo simulado', icon: '✚', defaultTitle: 'Proyecto Sanación Ω', summary: 'Resolver una enfermedad ficticia del ecosistema mediante investigación segura.' }),
  custom: Object.freeze({ label: 'Desafío libre', icon: 'Ω', defaultTitle: 'Gran Proyecto Ω', summary: 'Transformar un objetivo abierto en fases, tareas, pruebas y entrega.' })
});

const PHASES = Object.freeze([
  ['definition', 'Definición'], ['planning', 'Planificación'], ['research', 'Investigación'],
  ['design', 'Diseño'], ['production', 'Producción'], ['verification', 'Verificación'], ['delivery', 'Entrega']
]);

const ADJACENT = Object.freeze({
  programador: ['desarrollador','matematico','inventor'], desarrollador: ['programador','arquitecto','analista'],
  arquitecto: ['ingeniero','tejedor','analista'], tejedor: ['arquitecto','cantor','inventor'],
  analista: ['matematico','naturalista','mediador'], matematico: ['analista','programador','ingeniero'],
  naturalista: ['alquimista','genetista','analista'], alquimista: ['naturalista','cocinero','genetista'],
  genetista: ['naturalista','alquimista','cuidador'], ingeniero: ['arquitecto','inventor','matematico'],
  inventor: ['ingeniero','programador','tejedor'], cronista: ['educador','filosofo','cantor'],
  educador: ['cronista','mediador','cuidador'], mediador: ['educador','filosofo','cuidador'],
  cuidador: ['mediador','naturalista','educador'], filosofo: ['cronista','mediador','analista'],
  cartografo: ['arquitecto','analista','naturalista'], cantor: ['cronista','tejedor','mediador'],
  cocinero: ['alquimista','cuidador','ingeniero']
});

const TEMPLATES = Object.freeze({
  software: [
    task('need','definition','Definir usuario, problema y criterio de éxito',['analista','mediador'],18),
    task('architecture','planning','Diseñar arquitectura, datos y límites',['arquitecto','programador','analista'],28,['need']),
    task('ux','design','Construir experiencia, navegación y accesibilidad',['tejedor','arquitecto','educador'],26,['need']),
    task('implementation','production','Implementar el núcleo funcional',['programador','desarrollador'],44,['architecture','ux']),
    task('security','verification','Revisar entradas, privacidad y fallos seguros',['analista','desarrollador','cuidador'],25,['implementation']),
    task('tests','verification','Ejecutar pruebas y corregir regresiones',['desarrollador','matematico','analista'],30,['implementation']),
    task('release','delivery','Preparar entrega, manual y plan de mantenimiento',['educador','cronista','desarrollador'],22,['security','tests'])
  ],
  game: [
    task('vision','definition','Definir fantasía, jugador y bucle principal',['inventor','filosofo','analista'],18),
    task('systems','planning','Diseñar reglas, progresión y equilibrio',['matematico','inventor','programador'],30,['vision']),
    task('world','design','Crear mundo, arte, sonido y narrativa',['tejedor','cantor','cronista','cartografo'],32,['vision']),
    task('prototype','production','Construir un prototipo jugable',['programador','desarrollador','tejedor'],42,['systems','world']),
    task('playtest','verification','Observar partidas, medir fricción y ajustar',['analista','mediador','matematico'],30,['prototype']),
    task('package','delivery','Entregar diseño, prototipo y guía de expansión',['desarrollador','educador','cronista'],22,['playtest'])
  ],
  city: [
    task('requirements','definition','Estimar población, clima y necesidades',['analista','naturalista','cuidador'],22),
    task('map','research','Cartografiar recursos, riesgos y rutas',['cartografo','naturalista','analista'],30,['requirements']),
    task('masterplan','design','Diseñar barrios, servicios y expansión',['arquitecto','ingeniero','mediador'],38,['map']),
    task('supply','planning','Planificar alimento, agua, energía y residuos',['ingeniero','cocinero','naturalista'],34,['map']),
    task('governance','planning','Definir leyes, participación y resolución de conflictos',['mediador','filosofo','cronista'],25,['requirements']),
    task('prototype','production','Construir el primer distrito reversible',['ingeniero','arquitecto','cuidador'],42,['masterplan','supply']),
    task('resilience','verification','Simular escasez, incendio y evacuación',['analista','ingeniero','cuidador'],30,['prototype','governance']),
    task('charter','delivery','Entregar plano, carta común y mantenimiento',['cartografo','cronista','educador'],24,['resilience'])
  ],
  research: [
    task('question','definition','Formular pregunta, hipótesis y límites',['naturalista','filosofo','analista'],18),
    task('method','planning','Diseñar método, muestra y controles',['matematico','analista','naturalista'],28,['question']),
    task('evidence','research','Reunir observaciones y registrar procedencia',['naturalista','cartografo','cronista'],40,['method']),
    task('analysis','production','Analizar datos y buscar explicaciones alternativas',['analista','matematico','filosofo'],35,['evidence']),
    task('replication','verification','Repetir, intentar refutar y declarar incertidumbre',['matematico','analista','educador'],30,['analysis']),
    task('paper','delivery','Publicar informe reproducible y preguntas abiertas',['cronista','educador','naturalista'],24,['replication'])
  ],
  invention: [
    task('problem','definition','Precisar necesidad, restricciones y seguridad',['analista','cuidador','inventor'],18),
    task('variants','research','Generar y comparar varias soluciones',['inventor','ingeniero','filosofo'],28,['problem']),
    task('blueprint','design','Elegir concepto y crear plano mantenible',['ingeniero','arquitecto','tejedor'],32,['variants']),
    task('prototype','production','Construir prototipo reversible',['ingeniero','inventor','desarrollador'],42,['blueprint']),
    task('stress','verification','Probar límites, fallos y reparación',['analista','matematico','cuidador'],32,['prototype']),
    task('manual','delivery','Entregar especificación, uso y mejoras futuras',['educador','cronista','ingeniero'],22,['stress'])
  ],
  book: [
    task('purpose','definition','Definir lector, promesa, tono y tema',['cronista','filosofo','mediador'],18),
    task('research','research','Reunir material, memoria y contradicciones',['cronista','naturalista','analista'],26,['purpose']),
    task('structure','planning','Diseñar estructura, ritmo y puntos de giro',['cronista','matematico','inventor'],28,['research']),
    task('draft','production','Escribir el borrador completo',['cronista','cantor','filosofo'],44,['structure']),
    task('edit','verification','Eliminar repeticiones, incoherencias y artificio',['educador','analista','cronista'],32,['draft']),
    task('edition','delivery','Preparar edición, sinopsis y archivo final',['tejedor','educador','cronista'],24,['edit'])
  ],
  observatory: [
    task('mission','definition','Definir qué observar y con qué precisión',['naturalista','matematico','analista'],20),
    task('site','research','Elegir emplazamiento, cielo y accesos',['cartografo','naturalista','arquitecto'],28,['mission']),
    task('optics','design','Diseñar óptica, montura y calibración',['ingeniero','matematico','inventor'],36,['site']),
    task('building','production','Construir cúpula, energía y control',['arquitecto','ingeniero','programador'],44,['optics']),
    task('pipeline','production','Crear captura, archivo y análisis de datos',['programador','analista','cronista'],34,['optics']),
    task('calibration','verification','Calibrar, verificar y documentar incertidumbre',['matematico','analista','naturalista'],30,['building','pipeline']),
    task('opening','delivery','Abrir observatorio y programa educativo',['educador','cronista','mediador'],22,['calibration'])
  ],
  world_cure: [
    task('syndrome','definition','Describir el síndrome ficticio y separar síntomas de causas',['cuidador','naturalista','analista'],20),
    task('ethics','planning','Fijar límites, consentimiento y criterios de detención',['filosofo','cuidador','mediador'],22,['syndrome']),
    task('model','research','Construir modelo biológico del mundo simulado',['genetista','naturalista','alquimista'],34,['syndrome']),
    task('candidates','design','Proponer intervenciones simuladas y controles',['alquimista','genetista','analista'],34,['model','ethics']),
    task('trials','production','Ejecutar ensayos ficticios graduales',['naturalista','matematico','cuidador'],42,['candidates']),
    task('safety','verification','Buscar daños, recaídas y explicaciones alternativas',['analista','cuidador','filosofo'],32,['trials']),
    task('protocol','delivery','Entregar protocolo únicamente para el mundo simulado',['educador','cronista','cuidador'],22,['safety'])
  ],
  custom: [
    task('goal','definition','Convertir el deseo en un objetivo comprobable',['analista','mediador','filosofo'],20),
    task('map','planning','Dividir el objetivo en sistemas, dependencias y riesgos',['arquitecto','analista','cartografo'],30,['goal']),
    task('knowledge','research','Reunir conocimiento y detectar vacíos',['educador','naturalista','cronista'],30,['map']),
    task('options','design','Generar variantes y elegir una dirección',['inventor','tejedor','ingeniero'],28,['knowledge']),
    task('build','production','Construir un resultado mínimo útil',['desarrollador','ingeniero','programador'],44,['options']),
    task('verify','verification','Probar, criticar y corregir el resultado',['analista','matematico','mediador'],32,['build']),
    task('deliver','delivery','Entregar dossier, artefactos y siguientes pasos',['educador','cronista','desarrollador'],24,['verify'])
  ]
});

export class GrandProjectEngine {
  constructor() { this.reset(); }

  reset() {
    const onChange = this.onChange || null;
    this.projects = [];
    this.nextNumber = 1;
    this.timer = 0;
    this.onChange = onChange;
  }

  createProject(type, title, brief, constraints, sim) {
    const safeType = Object.prototype.hasOwnProperty.call(GRAND_PROJECT_TYPES, type) ? type : 'custom';
    const meta = GRAND_PROJECT_TYPES[safeType];
    const safeBrief = clean(brief, 900);
    if (!safeBrief) throw new Error('Describe el objetivo del Gran Proyecto');
    if (this.projects.filter(item => !['completed','cancelled'].includes(item.status)).length >= 8) throw new Error('Hay demasiados proyectos abiertos');
    const number = this.nextNumber++;
    const project = {
      id: uid(), number, type: safeType,
      title: clean(title, 90) || `${meta.defaultTitle} ${number}`,
      brief: safeBrief, constraints: clean(constraints, 600),
      status: 'active', createdYear: roundYear(sim?.year), updatedYear: roundYear(sim?.year), completedYear: null,
      progress: 0, quality: .28, confidence: .32, iteration: 1,
      tasks: cloneTasks(TEMPLATES[safeType] || TEMPLATES.custom),
      decisions: [], lessons: [], blockers: [], externalInsights: [], artifacts: [], teamIds: [],
      lastEvent: 'Objetivo recibido. La Mente Ω está descomponiendo el trabajo.',
      delivered: false
    };
    project.decisions.push(record(sim, 'mandato', `El Observador encarga: ${project.brief}`));
    this.projects.unshift(project);
    this.projects = this.projects.slice(0, 16);
    sim?.logEvent?.(`Año ${roundYear(sim?.year).toFixed(1)}`, `Gran Proyecto iniciado: «${project.title}». La civilización deberá planificar, investigar, construir y verificar.`);
    sim?.civilization?.recordChronicle?.(sim.year, 'gran proyecto', `Comienza «${project.title}»: ${project.brief}`, project.id);
    this.onChange?.(project);
    return project;
  }

  update(dt, sim) {
    this.timer += Math.max(0, finiteOr(dt, 0));
    if (this.timer < .55) return;
    const elapsed = Math.min(2.5, this.timer);
    this.timer = 0;
    const active = this.projects.filter(project => ['active','waiting'].includes(project.status)).slice(0, 3);
    for (const project of active) this.advance(project, elapsed, sim);
  }

  advance(project, elapsed, sim) {
    const adults = (sim?.creatures || []).filter(creature => creature && !creature.dead && creature.lifeStage === 'adulto' && creature.energy > 24);
    if (!adults.length) {
      project.status = 'waiting';
      project.lastEvent = 'Esperando al menos una criatura adulta con energía suficiente.';
      replaceBlocker(project, 'population', 'No hay especialistas adultos disponibles.');
      return;
    }
    project.status = 'active';
    clearBlocker(project, 'population');

    const ready = project.tasks.filter(item => !['completed','cancelled'].includes(item.status) && dependenciesDone(item, project.tasks));
    const running = ready.filter(item => item.status === 'working');
    const capacity = Math.max(1, Math.min(3, Math.floor(Math.sqrt(adults.length))));
    for (const item of ready.filter(taskItem => taskItem.status === 'pending').slice(0, Math.max(0, capacity - running.length))) {
      this.assignTask(project, item, adults, sim);
    }
    for (const item of ready.filter(taskItem => taskItem.status === 'working').slice(0, capacity)) {
      this.workTask(project, item, elapsed, sim);
    }
    this.recalculate(project);
    if (project.tasks.every(item => item.status === 'completed')) this.complete(project, sim);
  }

  assignTask(project, taskItem, adults, sim) {
    const ranked = adults.map(creature => ({ creature, score: candidateScore(creature, taskItem.skills) }))
      .sort((a, b) => b.score - a.score);
    const desired = Math.min(6, Math.max(2, taskItem.skills.length + 1), ranked.length);
    const chosen = ranked.slice(0, desired).map(entry => entry.creature);
    if (!chosen.length) return;
    taskItem.assignedIds = chosen.map(item => item.id);
    taskItem.status = 'working';
    taskItem.startedYear ??= roundYear(sim?.year);
    const present = new Set(chosen.map(item => deriveSkill(item)));
    const gaps = taskItem.skills.filter(skill => !present.has(skill) && ![...(ADJACENT[skill] || [])].some(adj => present.has(adj)));
    taskItem.gaps = gaps;
    if (gaps.length) replaceBlocker(project, `skills:${taskItem.id}`, `Faltan especialistas directos en ${gaps.map(key => SKILLS[key]?.label || key).join(', ')}; el equipo aprenderá por aproximación.`);
    else clearBlocker(project, `skills:${taskItem.id}`);
    for (const creature of chosen) {
      creature.state = 'crear';
      creature.goal = `contribuir a ${project.title}: ${taskItem.title.toLowerCase()}`;
    }
    project.teamIds = [...new Set([...project.teamIds, ...taskItem.assignedIds])].slice(-40);
    project.lastEvent = `Equipo asignado a «${taskItem.title}».`;
  }

  workTask(project, taskItem, elapsed, sim) {
    const crew = taskItem.assignedIds.map(id => sim.creatures.find(item => item?.id === id)).filter(item => item && !item.dead);
    if (!crew.length) { taskItem.status = 'pending'; taskItem.assignedIds = []; return; }
    const exact = new Set(crew.map(item => deriveSkill(item)));
    const coverage = taskItem.skills.length ? taskItem.skills.filter(skill => exact.has(skill) || (ADJACENT[skill] || []).some(adj => exact.has(adj))).length / taskItem.skills.length : 1;
    const expertise = crew.reduce((sum, creature) => sum + candidateScore(creature, taskItem.skills), 0) / crew.length;
    const knowledge = crew.reduce((sum, creature) => sum + Math.min(1, (creature.knowledge?.length || 0) / 12), 0) / crew.length;
    const cooperation = crew.reduce((sum, creature) => sum + finiteOr(creature.genome?.sociability, .5), 0) / crew.length;
    const external = Math.min(.3, project.externalInsights.length * .06);
    const power = (.55 + expertise * .38 + knowledge * .22 + cooperation * .16 + coverage * .3 + external) * Math.min(1.7, .7 + Math.log2(crew.length + 1) * .3);
    taskItem.progress = clamp(taskItem.progress + elapsed * power / Math.max(8, taskItem.effort), 0, 1);
    taskItem.quality = clamp((taskItem.quality || .3) + elapsed * (.0015 + coverage * .002 + knowledge * .001), 0, 1);
    for (const creature of crew) {
      creature.energy = Math.max(18, creature.energy - elapsed * .16);
      if (creature.experience) creature.experience.collaborations = Math.min(9999, Math.floor(finiteOr(creature.experience.collaborations, 0)) + (Math.random() < .02 ? 1 : 0));
    }
    if (taskItem.progress < 1) return;
    const failureChance = clamp(.3 - coverage * .14 - taskItem.quality * .12 - project.externalInsights.length * .025 + taskItem.attempts * -.05, .035, .3);
    if (Math.random() < failureChance && taskItem.attempts < 2) {
      taskItem.attempts++;
      taskItem.progress = .22;
      taskItem.status = 'working';
      const lesson = `${taskItem.title}: el intento ${taskItem.attempts} reveló una suposición débil; el equipo añade control, evidencia y una alternativa.`;
      project.lessons.unshift(record(sim, 'aprendizaje', lesson));
      project.lessons = project.lessons.slice(0, 30);
      project.iteration++;
      project.quality = clamp(project.quality + .025, 0, 1);
      project.lastEvent = `Fallo útil en «${taskItem.title}». Se inicia una iteración corregida.`;
      sim?.logEvent?.(`Año ${roundYear(sim?.year).toFixed(1)}`, `«${project.title}» aprende de un fallo durante ${taskItem.title.toLowerCase()}.`);
      return;
    }
    taskItem.status = 'completed';
    taskItem.completedYear = roundYear(sim?.year);
    taskItem.output = buildTaskOutput(project, taskItem, crew, coverage);
    project.decisions.unshift(record(sim, 'hito', `${taskItem.title} completado por ${crew.map(item => item.entityCode || item.name).slice(0, 6).join(', ')}.`));
    project.decisions = project.decisions.slice(0, 50);
    project.artifacts.push({ id: uid(), taskId: taskItem.id, title: taskItem.title, kind: artifactKind(taskItem.phase), content: taskItem.output, year: roundYear(sim?.year) });
    project.artifacts = project.artifacts.slice(-40);
    project.quality = clamp(project.quality * .82 + taskItem.quality * .18 + coverage * .025, 0, 1);
    project.confidence = clamp(project.confidence + .055 + coverage * .025, 0, .96);
    project.lastEvent = `Hito completado: ${taskItem.title}.`;
    for (const creature of crew) creature.learnKnowledge?.({ kind: 'fact', key: `project:${project.id}:${taskItem.id}`, label: `${project.title}: ${taskItem.title}. ${taskItem.output}`, confidence: clamp(.55 + taskItem.quality * .35, 0, 1), createdAt: Date.now() }, 'Gran Proyecto Ω');
    this.onChange?.(project);
  }

  complete(project, sim) {
    if (project.status === 'completed') return;
    project.status = 'completed';
    project.progress = 1;
    project.completedYear = roundYear(sim?.year);
    project.updatedYear = project.completedYear;
    project.confidence = clamp(project.confidence + .08, 0, .98);
    project.lastEvent = 'Proyecto terminado, verificado y preparado para su entrega.';
    project.decisions.unshift(record(sim, 'entrega', `La civilización declara terminado «${project.title}» con ${Math.round(project.quality * 100)}% de calidad simulada.`));
    sim.collective.completedProjects = Math.min(99999, finiteOr(sim.collective?.completedProjects, 0) + 1);
    sim?.logEvent?.(`Año ${project.completedYear.toFixed(1)}`, `Gran Proyecto completado: «${project.title}».`);
    sim?.civilization?.recordChronicle?.(sim.year, 'obra colectiva', `La civilización completa «${project.title}» tras ${project.iteration} iteraciones.`, project.id);
    this.onChange?.(project);
  }

  recalculate(project) {
    const total = project.tasks.reduce((sum, item) => sum + item.effort, 0) || 1;
    const done = project.tasks.reduce((sum, item) => sum + item.effort * (item.status === 'completed' ? 1 : finiteOr(item.progress, 0)), 0);
    project.progress = clamp(done / total, 0, 1);
    project.updatedYear = project.updatedYear ?? project.createdYear;
  }

  pause(id) { const project = this.find(id); if (project && project.status === 'active') project.status = 'paused'; return project; }
  resume(id) { const project = this.find(id); if (project && ['paused','waiting'].includes(project.status)) project.status = 'active'; return project; }
  cancel(id, sim) { const project = this.find(id); if (!project || project.status === 'completed') return null; project.status = 'cancelled'; project.lastEvent = 'Proyecto archivado por el Observador.'; sim?.logEvent?.(`Año ${roundYear(sim?.year).toFixed(1)}`, `Gran Proyecto cancelado: «${project.title}».`); return project; }
  find(id) { return this.projects.find(item => item.id === id) || null; }

  integrateInsight(id, text, sim) {
    const project = this.find(id);
    const cleanText = clean(text, 2400);
    if (!project) return { accepted: false, reason: 'Selecciona un proyecto válido.' };
    if (cleanText.length < 20) return { accepted: false, reason: 'La aportación es demasiado breve.' };
    const fragments = cleanText.split(/\n+|(?<=[.!?])\s+/).map(item => clean(item, 320)).filter(item => item.length >= 12).slice(0, 10);
    for (const fragment of fragments) project.externalInsights.unshift({ id: uid(), text: fragment, year: roundYear(sim?.year), reviewed: true });
    project.externalInsights = project.externalInsights.slice(0, 20);
    project.quality = clamp(project.quality + Math.min(.12, fragments.length * .012), 0, 1);
    project.confidence = clamp(project.confidence + Math.min(.1, fragments.length * .01), 0, .98);
    project.decisions.unshift(record(sim, 'fuente externa revisada', `${fragments.length} aportaciones humanas/externas se integran con trazabilidad.`));
    project.lastEvent = `${fragments.length} ideas externas revisadas se han añadido al trabajo.`;
    sim?.logEvent?.(`Año ${roundYear(sim?.year).toFixed(1)}`, `«${project.title}» incorpora ${fragments.length} ideas externas revisadas por el Observador.`);
    return { accepted: true, fragments: fragments.length };
  }

  buildContext(id, sim) {
    const project = this.find(id);
    if (!project) throw new Error('Proyecto no encontrado');
    const metrics = sim.getCollectiveMetrics?.() || {};
    return [
      'PROYECTO GÉNESIS Ω · PAQUETE PARA IA EXTERNA',
      'La respuesta será revisada por una persona antes de integrarse. No incluyas acciones peligrosas, credenciales ni instrucciones irreversibles.',
      '', `PROYECTO: ${project.title}`, `TIPO: ${GRAND_PROJECT_TYPES[project.type]?.label || project.type}`,
      `OBJETIVO: ${project.brief}`, `RESTRICCIONES: ${project.constraints || 'No especificadas'}`,
      `PROGRESO: ${Math.round(project.progress * 100)}%`, `CALIDAD SIMULADA: ${Math.round(project.quality * 100)}%`,
      `POBLACIÓN: ${metrics.population || 0} · OFICIOS: ${metrics.roles || 0} · CONOCIMIENTO: ${metrics.uniqueKnowledge || 0}`,
      '', 'TAREAS:', ...project.tasks.map(item => `- [${item.status}] ${item.title} · ${Math.round(item.progress * 100)}% · necesita ${item.skills.map(key => SKILLS[key]?.label || key).join(', ')}`),
      '', 'BLOQUEOS:', ...(project.blockers.length ? project.blockers.map(item => `- ${item.text}`) : ['- Ninguno']),
      '', 'APRENDIZAJES:', ...(project.lessons.length ? project.lessons.slice(0, 8).map(item => `- ${item.text}`) : ['- Aún no hay iteraciones fallidas.']),
      '', 'SOLICITUD:', 'Propón conocimiento, riesgos, alternativas y pruebas concretas que ayuden a completar el proyecto. Distingue hechos, hipótesis e incertidumbre. No finjas haber ejecutado pruebas.'
    ].join('\n');
  }

  buildDossier(id, sim) {
    const project = this.find(id);
    if (!project) throw new Error('Proyecto no encontrado');
    const lines = [
      `# ${project.title}`, '', `**Proyecto Génesis Ω · Gran Proyecto ${project.number}**`,
      `- Tipo: ${GRAND_PROJECT_TYPES[project.type]?.label || project.type}`,
      `- Estado: ${statusLabel(project.status)}`,
      `- Progreso: ${Math.round(project.progress * 100)}%`,
      `- Calidad simulada: ${Math.round(project.quality * 100)}%`,
      `- Confianza interna: ${Math.round(project.confidence * 100)}%`,
      `- Iteraciones: ${project.iteration}`, `- Año de inicio: ${project.createdYear.toFixed(1)}`,
      '', '## Mandato', '', project.brief, '', '## Restricciones', '', project.constraints || 'No se especificaron restricciones adicionales.',
      '', '## Plan y resultados'
    ];
    for (const phase of PHASES) {
      const tasks = project.tasks.filter(item => item.phase === phase[0]);
      if (!tasks.length) continue;
      lines.push('', `### ${phase[1]}`);
      for (const item of tasks) {
        lines.push('', `#### ${item.status === 'completed' ? '✓' : '○'} ${item.title}`, `Estado: ${statusLabel(item.status)} · progreso ${Math.round(item.progress * 100)}% · intentos ${item.attempts + 1}`, '', item.output || 'Pendiente de ejecución.');
      }
    }
    lines.push('', '## Bloqueos', '', ...(project.blockers.length ? project.blockers.map(item => `- ${item.text}`) : ['- Ninguno activo.']));
    lines.push('', '## Aprendizajes', '', ...(project.lessons.length ? project.lessons.map(item => `- ${item.text}`) : ['- Todavía no se han registrado fallos útiles.']));
    lines.push('', '## Decisiones e hitos', '', ...project.decisions.slice(0, 30).map(item => `- Año ${item.year.toFixed(1)} · **${item.kind}:** ${item.text}`));
    lines.push('', '## Aportaciones externas revisadas', '', ...(project.externalInsights.length ? project.externalInsights.map(item => `- ${item.text}`) : ['- Ninguna. El proyecto se ha desarrollado con el Atlas Ω y la simulación local.']));
    lines.push('', '## Alcance real', '', 'Este dossier es el resultado de una simulación local de organización, aprendizaje y creación. Puede producir planes, prototipos textuales y artefactos basados en reglas y conocimiento incorporado. Para hechos actuales, investigación especializada o ejecución fuera del navegador necesita fuentes o herramientas externas revisadas por una persona.');
    return lines.join('\n');
  }

  metrics() {
    const active = this.projects.filter(item => ['active','waiting','paused'].includes(item.status));
    const completed = this.projects.filter(item => item.status === 'completed');
    const tasks = this.projects.flatMap(item => item.tasks);
    return {
      active: active.length, completed: completed.length,
      tasksDone: tasks.filter(item => item.status === 'completed').length,
      tasksTotal: tasks.length,
      averageQuality: completed.length ? completed.reduce((sum, item) => sum + item.quality, 0) / completed.length : 0,
      externalInsights: this.projects.reduce((sum, item) => sum + item.externalInsights.length, 0)
    };
  }

  serialize() {
    return {
      nextNumber: this.nextNumber,
      projects: this.projects.slice(0, 16).map(project => ({ ...project, brief: clean(project.brief, 900), constraints: clean(project.constraints, 600) }))
    };
  }

  hydrate(data) {
    this.reset();
    if (!data || typeof data !== 'object') return;
    this.nextNumber = Math.max(1, Math.floor(finiteOr(data.nextNumber, 1)));
    if (!Array.isArray(data.projects)) return;
    this.projects = data.projects.slice(0, 16).map(raw => sanitizeProject(raw)).filter(Boolean);
  }
}

function task(id, phase, title, skills, effort, after = []) { return Object.freeze({ id, phase, title, skills, effort, after }); }
function cloneTasks(items) { return items.map(item => ({ ...item, skills: [...item.skills], after: [...item.after], status: 'pending', progress: 0, quality: .32, attempts: 0, assignedIds: [], gaps: [], output: '', startedYear: null, completedYear: null })); }
function dependenciesDone(item, tasks) { return item.after.every(id => tasks.find(candidate => candidate.id === id)?.status === 'completed'); }
function clean(value, max) { return sanitizeCollectivePrompt(String(value ?? ''), max); }
function roundYear(value) { return +Math.max(0, finiteOr(value, 0)).toFixed(1); }
function record(sim, kind, text) { return { id: uid(), year: roundYear(sim?.year), kind: clean(kind, 50), text: clean(text, 500) }; }
function replaceBlocker(project, id, text) { const current = project.blockers.find(item => item.id === id); if (current) current.text = text; else project.blockers.unshift({ id, text }); project.blockers = project.blockers.slice(0, 20); }
function clearBlocker(project, id) { project.blockers = project.blockers.filter(item => item.id !== id); }
function candidateScore(creature, required) {
  const skill = deriveSkill(creature);
  const direct = required.includes(skill) ? 1 : required.some(key => (ADJACENT[key] || []).includes(skill)) ? .58 : .12;
  const geneKey = SKILLS[skill]?.gene;
  const rawGene = finiteOr(creature.genome?.[geneKey], .5);
  const gene = geneKey === 'vision' ? rawGene / 260 : geneKey === 'longevity' ? rawGene / 240 : geneKey === 'speed' ? rawGene / 2.4 : geneKey === 'mutationRate' ? rawGene * 12 : rawGene;
  return direct * 1.5 + clamp(gene, 0, 1.5) * .45 + clamp(finiteOr(creature.genome?.memory, .5), 0, 1.5) * .2 + clamp(finiteOr(creature.genome?.sociability, .5), 0, 1.5) * .15 + Math.min(.25, (creature.knowledge?.length || 0) / 100);
}
function artifactKind(phase) { return ({ definition: 'mandato', planning: 'plan', research: 'evidencia', design: 'diseño', production: 'prototipo', verification: 'prueba', delivery: 'entrega' })[phase] || 'nota'; }
function buildTaskOutput(project, item, crew, coverage) {
  const names = crew.map(creature => creature.entityCode || creature.name).slice(0, 5).join(', ');
  const constraints = project.constraints ? ` Se respetaron estas restricciones: ${project.constraints}.` : '';
  const rigor = coverage > .8 ? 'El equipo reunió las especialidades necesarias' : coverage > .45 ? 'El equipo cubrió la mayoría de capacidades y documentó las carencias' : 'El equipo trabajó con capacidades adyacentes y dejó límites explícitos';
  const phaseText = {
    definition: `Se tradujo «${project.brief}» en criterios observables, usuarios o beneficiarios, límites y señales de éxito.`,
    planning: 'Se creó una secuencia de trabajo con dependencias, riesgos, recursos, responsables y puntos de decisión reversibles.',
    research: 'Se reunieron observaciones internas, conocimiento del Atlas Ω y explicaciones alternativas, separando evidencia de hipótesis.',
    design: 'Se compararon variantes y se eligió una solución modular, comprensible, accesible y reparable.',
    production: 'Se construyó un prototipo mínimo útil con componentes independientes y un registro de supuestos.',
    verification: 'Se probaron flujo principal, errores, límites, seguridad y posibilidades de refutación; los fallos encontrados alimentaron nuevas iteraciones.',
    delivery: 'Se consolidaron resultados, instrucciones, mantenimiento, riesgos pendientes y próximos pasos en un dossier exportable.'
  }[item.phase] || 'La tarea produjo un resultado verificable.';
  return `${phaseText} ${rigor}. Responsables: ${names}.${constraints}`.slice(0, 950);
}
function statusLabel(status) { return ({ active: 'Activo', waiting: 'En espera', paused: 'Pausado', completed: 'Completado', cancelled: 'Cancelado', pending: 'Pendiente', working: 'En ejecución' })[status] || status; }
function sanitizeProject(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const type = Object.prototype.hasOwnProperty.call(GRAND_PROJECT_TYPES, raw.type) ? raw.type : 'custom';
  const template = cloneTasks(TEMPLATES[type] || TEMPLATES.custom);
  const savedTasks = Array.isArray(raw.tasks) ? raw.tasks : [];
  const tasks = template.map(base => {
    const source = savedTasks.find(item => item?.id === base.id) || {};
    return {
      ...base,
      status: ['pending','working','completed','cancelled'].includes(source.status) ? source.status : 'pending',
      progress: clamp(finiteOr(source.progress, 0), 0, 1), quality: clamp(finiteOr(source.quality, .32), 0, 1),
      attempts: Math.max(0, Math.min(5, Math.floor(finiteOr(source.attempts, 0)))),
      assignedIds: Array.isArray(source.assignedIds) ? source.assignedIds.filter(id => typeof id === 'string').slice(0, 8) : [],
      gaps: Array.isArray(source.gaps) ? source.gaps.filter(key => SKILLS[key]).slice(0, 8) : [], output: clean(source.output, 1200),
      startedYear: source.startedYear == null ? null : roundYear(source.startedYear), completedYear: source.completedYear == null ? null : roundYear(source.completedYear)
    };
  });
  return {
    id: typeof raw.id === 'string' ? raw.id.slice(0, 50) : uid(), number: Math.max(1, Math.floor(finiteOr(raw.number, 1))), type,
    title: clean(raw.title, 90) || GRAND_PROJECT_TYPES[type].defaultTitle, brief: clean(raw.brief, 900), constraints: clean(raw.constraints, 600),
    status: ['active','waiting','paused','completed','cancelled'].includes(raw.status) ? raw.status : 'active',
    createdYear: roundYear(raw.createdYear), updatedYear: roundYear(raw.updatedYear), completedYear: raw.completedYear == null ? null : roundYear(raw.completedYear),
    progress: clamp(finiteOr(raw.progress, 0), 0, 1), quality: clamp(finiteOr(raw.quality, .28), 0, 1), confidence: clamp(finiteOr(raw.confidence, .32), 0, 1),
    iteration: Math.max(1, Math.floor(finiteOr(raw.iteration, 1))), tasks,
    decisions: sanitizeRecords(raw.decisions, 50), lessons: sanitizeRecords(raw.lessons, 30),
    blockers: Array.isArray(raw.blockers) ? raw.blockers.filter(item => item && typeof item === 'object').slice(0, 20).map(item => ({ id: clean(item.id, 80) || uid(), text: clean(item.text, 500) })) : [],
    externalInsights: Array.isArray(raw.externalInsights) ? raw.externalInsights.filter(item => item && typeof item === 'object').slice(0, 20).map(item => ({ id: typeof item.id === 'string' ? item.id : uid(), text: clean(item.text, 360), year: roundYear(item.year), reviewed: true })) : [],
    artifacts: Array.isArray(raw.artifacts) ? raw.artifacts.filter(item => item && typeof item === 'object').slice(-40).map(item => ({ id: typeof item.id === 'string' ? item.id : uid(), taskId: clean(item.taskId, 50), title: clean(item.title, 120), kind: clean(item.kind, 40), content: clean(item.content, 1200), year: roundYear(item.year) })) : [],
    teamIds: Array.isArray(raw.teamIds) ? raw.teamIds.filter(id => typeof id === 'string').slice(0, 40) : [],
    lastEvent: clean(raw.lastEvent, 500), delivered: Boolean(raw.delivered)
  };
}
function sanitizeRecords(value, max) { return Array.isArray(value) ? value.filter(item => item && typeof item === 'object').slice(0, max).map(item => ({ id: typeof item.id === 'string' ? item.id : uid(), year: roundYear(item.year), kind: clean(item.kind, 50), text: clean(item.text, 500) })) : []; }
