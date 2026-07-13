import { clamp, finiteOr, uid } from './utils.js?v=6.0.1';
import { Society } from './society.js?v=6.0.1';

export const CIVILIZATION_ERAS = Object.freeze([
  Object.freeze({ key: 'origin', label: 'Origen', description: 'El linaje aprende a sobrevivir y a reconocerse.' }),
  Object.freeze({ key: 'tribe', label: 'Tribu', description: 'Aparecen tradiciones, palabras comunes y cooperación estable.' }),
  Object.freeze({ key: 'settlement', label: 'Asentamiento', description: 'El conocimiento se organiza en instituciones y oficios.' }),
  Object.freeze({ key: 'city', label: 'Ciudad Ω', description: 'La investigación, la cultura y la producción se coordinan.' }),
  Object.freeze({ key: 'network', label: 'Civilización en red', description: 'La especie funciona como una inteligencia distribuida madura.' })
]);

export const TECHNOLOGY_TREE = Object.freeze([
  tech('oral-memory', 'Memoria oral', 'Los descubrimientos se narran y conservan entre generaciones.', 8, 2, 8, 0),
  tech('symbols', 'Símbolos compartidos', 'Marcas simples permiten representar lugares, peligros e ideas.', 15, 3, 14, 0, ['oral-memory']),
  tech('shelter', 'Refugios cooperativos', 'Los individuos coordinan espacios seguros y zonas de descanso.', 20, 4, 18, 0, ['oral-memory']),
  tech('measurement', 'Medición', 'El linaje compara cantidades, tiempo, distancia y rendimiento.', 28, 5, 24, 1, ['symbols']),
  tech('archives', 'Archivo de conocimiento', 'La memoria colectiva deja de depender de un solo individuo.', 36, 6, 32, 1, ['symbols', 'measurement']),
  tech('agriculture', 'Cultivo planificado', 'La población organiza recursos y reduce el riesgo de escasez.', 42, 8, 38, 1, ['shelter', 'measurement']),
  tech('engineering', 'Ingeniería modular', 'Los oficios combinan componentes, pruebas y reparación.', 55, 10, 46, 2, ['archives', 'measurement']),
  tech('medicine', 'Cuidados sistemáticos', 'La observación se convierte en protocolos de bienestar y prevención.', 62, 12, 52, 2, ['archives', 'agriculture']),
  tech('computing', 'Pensamiento computacional', 'Problemas complejos se dividen en reglas, datos y verificaciones.', 78, 14, 60, 3, ['engineering', 'archives']),
  tech('renewable-energy', 'Energía sostenible', 'La civilización prioriza eficiencia, mantenimiento y equilibrio ambiental.', 90, 18, 68, 4, ['engineering', 'agriculture']),
  tech('distributed-science', 'Ciencia distribuida', 'Hipótesis y resultados se contrastan entre equipos especializados.', 108, 22, 78, 5, ['computing', 'medicine']),
  tech('collective-design', 'Diseño colectivo', 'La comunidad convierte necesidades reales en soluciones iterativas.', 124, 28, 88, 6, ['computing', 'renewable-energy']),
  tech('knowledge-network', 'Red de conocimiento', 'Cada ser aporta memoria local a una inteligencia común auditable.', 145, 36, 100, 8, ['distributed-science', 'collective-design']),
  tech('omega-synthesis', 'Síntesis Ω', 'La especie combina ciencia, arte y cooperación para abordar grandes retos.', 178, 48, 116, 10, ['knowledge-network'])
]);

const CONCEPTS = Object.freeze([
  ['agua', 'recurso vital'], ['alimento', 'energía compartida'], ['hogar', 'lugar seguro'], ['amistad', 'vínculo de confianza'],
  ['peligro', 'amenaza'], ['memoria', 'conocimiento conservado'], ['luz', 'claridad'], ['noche', 'oscuridad'],
  ['crear', 'transformar una idea'], ['ayudar', 'proteger a otro'], ['verdad', 'afirmación comprobada'], ['futuro', 'lo que todavía puede construirse'],
  ['código', 'regla ejecutable'], ['cuidado', 'acción que sostiene la vida'], ['equipo', 'muchas capacidades coordinadas'], ['Ω', 'origen y comunidad']
]);

const CULTURAL_VALUES = Object.freeze([
  ['cooperación', 'Ningún conocimiento pertenece por completo a un solo ser.'],
  ['curiosidad', 'Toda certeza puede convertirse en una pregunta mejor.'],
  ['cuidado', 'La inteligencia que destruye su mundo se vuelve inútil.'],
  ['memoria', 'Recordar errores evita repetirlos como destino.'],
  ['libertad', 'Cada individuo conserva criterio dentro del bien común.'],
  ['verificación', 'Una idea valiosa debe poder probarse, corregirse y explicarse.'],
  ['reparación', 'Construir también significa mantener y mejorar.'],
  ['diversidad', 'Las diferencias amplían las soluciones posibles.']
]);

const INSTITUTION_DEFINITIONS = Object.freeze([
  Object.freeze({ key: 'circle', label: 'Círculo de Memoria', minPopulation: 4, minTech: 1, description: 'Conserva relatos, reglas y descubrimientos.' }),
  Object.freeze({ key: 'workshop', label: 'Taller Común', minPopulation: 8, minTech: 3, description: 'Coordina especialistas para construir y reparar.' }),
  Object.freeze({ key: 'academy', label: 'Academia Ω', minPopulation: 14, minTech: 5, description: 'Contrasta hipótesis y enseña métodos.' }),
  Object.freeze({ key: 'council', label: 'Consejo de Linajes', minPopulation: 22, minTech: 7, description: 'Representa necesidades sin eliminar la autonomía individual.' }),
  Object.freeze({ key: 'observatory', label: 'Observatorio del Mundo', minPopulation: 34, minTech: 9, description: 'Analiza clima, recursos, población y riesgos.' }),
  Object.freeze({ key: 'network', label: 'Nodo de Síntesis Ω', minPopulation: 48, minTech: 12, description: 'Conecta memoria, ciencia, cultura y proyectos colectivos.' })
]);

export class Civilization {
  constructor(data = null) {
    this.reset();
    if (data) this.hydrate(data);
  }

  reset() {
    this.eraIndex = 0;
    this.researchPoints = 0;
    this.innovationPoints = 0;
    this.culturePoints = 0;
    this.cooperation = 0;
    this.prosperity = .35;
    this.stability = .7;
    this.literacy = 0;
    this.populationPeak = 0;
    this.technologies = [];
    this.institutions = [];
    this.language = { name: 'Habla del Origen', grammarLevel: 0, lexicon: [] };
    this.culture = { values: [], traditions: [], symbols: ['Ω'], festivals: [] };
    this.chronicle = [];
    this.externalWisdom = [];
    this.processedObraIds = [];
    this.processedDiscoveryKeys = [];
    this.lastLanguageYear = 0;
    this.lastCultureYear = 0;
    this.lastInstitutionYear = 0;
    this.timer = 0;
    this.society = new Society();
  }

  update(dt, simulation) {
    if (!Number.isFinite(dt) || dt <= 0 || !simulation) return;
    this.timer += dt;
    if (this.timer < .75) return;
    const elapsed = this.timer;
    this.timer = 0;

    const metrics = simulation.getCollectiveMetrics?.() ?? { population: 0, roles: 0, uniqueKnowledge: 0, synergy: 0, completedProjects: 0 };
    const living = simulation.creatures?.filter(creature => creature && !creature.dead) ?? [];
    const population = living.length;
    this.populationPeak = Math.max(this.populationPeak, population);
    const averageEnergy = population ? living.reduce((sum, creature) => sum + finiteOr(creature.energy, 0) / Math.max(1, finiteOr(creature.maxEnergy, 100)), 0) / population : 0;
    const foodPerCreature = population ? (simulation.food?.length ?? 0) / population : 0;
    const targetCooperation = clamp(finiteOr(metrics.synergy, 0), 0, 1);
    const targetProsperity = clamp(averageEnergy * .58 + Math.min(1, foodPerCreature / 5) * .24 + Math.min(1, metrics.completedProjects / 12) * .18, 0, 1);
    const targetStability = clamp(.28 + averageEnergy * .42 + targetCooperation * .3, 0, 1);
    this.cooperation = smooth(this.cooperation, targetCooperation, .12);
    this.prosperity = smooth(this.prosperity, targetProsperity, .08);
    this.stability = smooth(this.stability, targetStability, .08);
    this.literacy = clamp(metrics.uniqueKnowledge / Math.max(1, population * 12), 0, 1);

    const socialPower = Math.log2(population + 1) + metrics.roles * .18 + targetCooperation * 2;
    this.researchPoints += elapsed * (.018 + socialPower * .007 + this.literacy * .025);
    this.innovationPoints += elapsed * (.012 + metrics.completedProjects * .0018 + metrics.roles * .0025);
    this.culturePoints += elapsed * (.014 + population * .0008 + targetCooperation * .018);

    this.absorbWorldResults(simulation);
    this.tryUnlockTechnologies(simulation, metrics);
    this.evolveLanguage(simulation, metrics);
    this.evolveCulture(simulation, metrics);
    this.establishInstitutions(simulation, metrics);
    this.promoteEra(simulation, metrics);
    this.society.update(elapsed, simulation, this);
  }

  absorbWorldResults(simulation) {
    const seenWorks = new Set(this.processedObraIds);
    for (const work of simulation.workshop?.obras ?? []) {
      if (!work?.id || seenWorks.has(work.id)) continue;
      seenWorks.add(work.id);
      this.processedObraIds.push(work.id);
      this.researchPoints += ['investigacion', 'teorema', 'dataset', 'informe'].includes(work.type) ? 8 : 2;
      this.innovationPoints += ['codigo', 'invento', 'plano', 'mejora'].includes(work.type) ? 10 : 4;
      this.culturePoints += ['himno', 'cronica', 'estandarte', 'manifiesto', 'codice'].includes(work.type) ? 10 : 3;
      this.recordChronicle(simulation.year, 'obra', `La comunidad completa «${clean(work.title, 120)}».`, work.type);
      if (work.type === 'himno') this.addUnique(this.culture.festivals, `Ceremonia del Himno ${Math.max(1, this.culture.festivals.length + 1)}`, 12);
      if (work.type === 'manifiesto') this.addUnique(this.culture.traditions, 'Debatir una idea antes de convertirla en norma.', 14);
      if (work.type === 'codigo') this.addUnique(this.culture.traditions, 'Revisar juntos toda regla antes de ejecutarla.', 14);
    }
    this.processedObraIds = this.processedObraIds.slice(-160);

    const seenDiscoveries = new Set(this.processedDiscoveryKeys);
    for (const discovery of simulation.worldDiscoveries ?? []) {
      if (!discovery?.key || seenDiscoveries.has(discovery.key)) continue;
      seenDiscoveries.add(discovery.key);
      this.processedDiscoveryKeys.push(discovery.key);
      this.researchPoints += 1.8;
      if (this.chronicle.length < 8 || this.processedDiscoveryKeys.length % 6 === 0) {
        this.recordChronicle(discovery.year ?? simulation.year, 'descubrimiento', `${clean(discovery.creatureCode, 30)} descubre ${clean(discovery.label, 150)}.`, discovery.biome);
      }
    }
    this.processedDiscoveryKeys = this.processedDiscoveryKeys.slice(-220);
  }

  tryUnlockTechnologies(simulation, metrics) {
    let unlockedThisCycle = 0;
    for (const definition of TECHNOLOGY_TREE) {
      if (this.technologies.includes(definition.key)) continue;
      if (!definition.requires.every(key => this.technologies.includes(key))) continue;
      if (metrics.population < definition.minPopulation || metrics.uniqueKnowledge < definition.minKnowledge || metrics.completedProjects < definition.minProjects) continue;
      const available = this.researchPoints + this.innovationPoints;
      if (available < definition.cost) continue;
      const researchShare = Math.min(this.researchPoints, definition.cost * .7);
      this.researchPoints = Math.max(0, this.researchPoints - researchShare);
      this.innovationPoints = Math.max(0, this.innovationPoints - (definition.cost - researchShare));
      this.technologies.push(definition.key);
      this.recordChronicle(simulation.year, 'tecnología', `Se consolida «${definition.label}»: ${definition.description}`, definition.key);
      simulation.logEvent?.(`Año ${simulation.year.toFixed(1)}`, `Avance civilizatorio: ${definition.label}.`);
      this.shareTechnologyKnowledge(definition, simulation);
      unlockedThisCycle++;
      if (unlockedThisCycle >= 2) break;
    }
  }

  shareTechnologyKnowledge(definition, simulation) {
    const candidates = (simulation.creatures ?? []).filter(creature => creature && !creature.dead && typeof creature.learnKnowledge === 'function');
    const count = Math.min(candidates.length, Math.max(3, Math.ceil(candidates.length * .35)));
    for (let index = 0; index < count; index++) {
      const creature = candidates[(index * 7 + this.technologies.length) % candidates.length];
      creature?.learnKnowledge({
        kind: 'fact', key: `civilization:technology:${definition.key}`,
        label: `${definition.label}: ${definition.description}`, confidence: .84, createdAt: Date.now()
      }, 'civilización Ω');
    }
  }

  evolveLanguage(simulation, metrics) {
    if (metrics.population < 2 || simulation.year - this.lastLanguageYear < 2.4) return;
    const next = CONCEPTS.find(([concept]) => !this.language.lexicon.some(item => item.concept === concept));
    if (!next) {
      this.language.grammarLevel = Math.min(5, this.language.grammarLevel + .12);
      this.lastLanguageYear = simulation.year;
      return;
    }
    const [concept, meaning] = next;
    const word = generateWord(`${concept}:${simulation.totalBirths}:${this.language.lexicon.length}`);
    this.language.lexicon.push({ concept, word, meaning, year: +simulation.year.toFixed(1) });
    this.language.grammarLevel = clamp(this.language.lexicon.length / CONCEPTS.length * 4.5 + this.technologies.length / 10, 0, 5);
    if (this.language.lexicon.length === 3) this.language.name = `${capitalize(this.language.lexicon[0].word)}ra`;
    this.recordChronicle(simulation.year, 'lenguaje', `La palabra «${word}» pasa a significar «${concept}».`, concept);
    this.lastLanguageYear = simulation.year;
  }

  evolveCulture(simulation, metrics) {
    if (metrics.population < 3 || simulation.year - this.lastCultureYear < 3.8) return;
    const nextValue = CULTURAL_VALUES.find(([key]) => !this.culture.values.some(item => item.key === key));
    if (nextValue && this.culturePoints >= 3) {
      const [key, statement] = nextValue;
      this.culture.values.push({ key, label: capitalize(key), statement, year: +simulation.year.toFixed(1) });
      this.culturePoints = Math.max(0, this.culturePoints - 3);
      this.recordChronicle(simulation.year, 'cultura', `Se adopta el valor «${capitalize(key)}»: ${statement}`, key);
    } else {
      const traditions = [
        'Compartir un descubrimiento antes del descanso.',
        'Recordar a quienes desaparecieron del linaje.',
        'Celebrar cada nueva generación con una palabra nueva.',
        'Reparar primero; sustituir solo cuando sea necesario.',
        'Escuchar al individuo más afectado antes de decidir en grupo.'
      ];
      this.addUnique(this.culture.traditions, traditions[(this.chronicle.length + metrics.population) % traditions.length], 14);
    }
    if (this.culture.symbols.length < 8 && this.technologies.length >= this.culture.symbols.length) {
      this.addUnique(this.culture.symbols, ['◈', '⌁', '∆', '✦', '⟁', '⊙', '⌬'][this.culture.symbols.length - 1] ?? 'Ω', 8);
    }
    this.lastCultureYear = simulation.year;
  }

  establishInstitutions(simulation, metrics) {
    for (const definition of INSTITUTION_DEFINITIONS) {
      if (this.institutions.some(item => item.key === definition.key)) continue;
      if (metrics.population < definition.minPopulation || this.technologies.length < definition.minTech) continue;
      const institution = { ...definition, foundedYear: +simulation.year.toFixed(1) };
      this.institutions.push(institution);
      this.recordChronicle(simulation.year, 'institución', `Se funda ${definition.label}. ${definition.description}`, definition.key);
      simulation.logEvent?.(`Año ${simulation.year.toFixed(1)}`, `Nueva institución: ${definition.label}.`);
      this.lastInstitutionYear = simulation.year;
      break;
    }
  }

  promoteEra(simulation, metrics) {
    const scores = [
      true,
      metrics.population >= 4 && this.language.lexicon.length >= 2 && this.culture.values.length >= 1,
      metrics.population >= 10 && this.technologies.length >= 4 && this.institutions.length >= 2,
      metrics.population >= 24 && this.technologies.length >= 8 && metrics.completedProjects >= 5,
      metrics.population >= 44 && this.technologies.length >= 12 && this.cooperation >= .72 && metrics.completedProjects >= 10
    ];
    let target = 0;
    for (let index = 1; index < scores.length; index++) if (scores[index]) target = index;
    if (target <= this.eraIndex) return;
    this.eraIndex = target;
    const era = CIVILIZATION_ERAS[target];
    this.recordChronicle(simulation.year, 'era', `Comienza la era «${era.label}». ${era.description}`, era.key);
    simulation.logEvent?.(`Año ${simulation.year.toFixed(1)}`, `La especie entra en una nueva era: ${era.label}.`);
  }

  absorbExternalWisdom(value, simulation) {
    const text = clean(value, 1800);
    if (text.length < 12) return { accepted: false, learned: 0, reason: 'La respuesta es demasiado breve.' };
    const fragments = text.split(/(?<=[.!?])\s+/).map(item => clean(item, 260)).filter(item => item.length >= 12).slice(0, 8);
    if (!fragments.length) return { accepted: false, learned: 0, reason: 'No se detectaron ideas utilizables.' };
    const record = { id: uid(), year: +finiteOr(simulation?.year, 0).toFixed(1), text, fragments, createdAt: Date.now() };
    this.externalWisdom.push(record);
    this.externalWisdom = this.externalWisdom.slice(-12);
    let learned = 0;
    const creatures = (simulation?.creatures ?? []).filter(creature => creature && !creature.dead && typeof creature.learnKnowledge === 'function').slice(0, 36);
    for (const creature of creatures) {
      const fragment = fragments[(learned + creature.generation) % fragments.length];
      if (creature.learnKnowledge({
        kind: 'fact', key: `external:${hashString(fragment)}`, label: fragment,
        confidence: .66, createdAt: Date.now()
      }, 'respuesta externa validada')) learned++;
    }
    this.researchPoints += fragments.length * 2.5;
    this.recordChronicle(simulation?.year ?? 0, 'sabiduría externa', `El usuario valida e integra ${fragments.length} ideas procedentes de una IA externa.`, record.id);
    simulation?.logEvent?.(`Año ${finiteOr(simulation?.year, 0).toFixed(1)}`, `Se integran ${fragments.length} ideas externas revisadas por el usuario.`);
    return { accepted: true, learned, fragments: fragments.length };
  }

  buildAIContext(simulation, question) {
    const metrics = this.getMetrics(simulation);
    const techLabels = this.getUnlockedTechnologies().map(item => item.label).join(', ') || 'ninguna';
    const values = this.culture.values.map(item => item.label).join(', ') || 'todavía sin valores formalizados';
    const discoveries = (simulation.worldDiscoveries ?? []).slice(-8).map(item => `- Año ${item.year}: ${item.label}`).join('\n') || '- Sin descubrimientos registrados';
    const works = (simulation.workshop?.obras ?? []).slice(-6).map(item => `- ${item.title} (${item.type})`).join('\n') || '- Sin obras terminadas';
    const safeQuestion = clean(question, 500) || 'Propón el siguiente avance útil, seguro y verificable para esta civilización.';
    const societyMetrics = this.society.getMetrics();
    const factions = this.society.factions.filter(item => item.status === 'active').map(item => `${item.name} (${item.memberIds.length} miembros)`).join(', ') || 'todavía sin facciones';
    const conflicts = this.society.wars.filter(item => item.status === 'active').map(item => item.name).join(', ') || 'ninguna guerra activa';
    return `PAQUETE DE CONTEXTO — PROYECTO GÉNESIS Ω\n\n` +
      `Pregunta del usuario:\n${safeQuestion}\n\n` +
      `Estado del mundo:\n- Año: ${finiteOr(simulation.year, 0).toFixed(1)}\n- Población: ${metrics.population}\n- Era: ${metrics.era.label}\n- Cooperación: ${Math.round(metrics.cooperation * 100)}%\n- Prosperidad: ${Math.round(metrics.prosperity * 100)}%\n- Conocimiento único: ${metrics.uniqueKnowledge}\n- Tecnologías: ${techLabels}\n- Valores culturales: ${values}\n- Idioma: ${this.language.name}, ${this.language.lexicon.length} palabras\n- Gobierno: ${societyMetrics.government.label}; gobernante: ${societyMetrics.ruler?.name || 'sin designar'}\n- Facciones: ${factions}\n- Conflictos: ${conflicts}\n- Inquietud social: ${Math.round(societyMetrics.unrest * 100)}%\n\n` +
      `Descubrimientos recientes:\n${discoveries}\n\nObras recientes:\n${works}\n\n` +
      `INSTRUCCIONES PARA LA IA EXTERNA:\nResponde en español. No afirmes que las criaturas son conscientes ni que poseen una AGI real. Propón ideas seguras, legales, realistas, verificables y divididas en pasos. Distingue hechos, hipótesis y recomendaciones. No inventes datos actuales; señala qué debería verificarse. Devuelve una respuesta de máximo 900 palabras que el usuario pueda revisar antes de integrarla en la simulación.`;
  }

  getUnlockedTechnologies() {
    return this.technologies.map(key => TECHNOLOGY_TREE.find(item => item.key === key)).filter(Boolean);
  }

  getNextTechnology(metrics = {}) {
    return TECHNOLOGY_TREE.find(definition => !this.technologies.includes(definition.key) && definition.requires.every(key => this.technologies.includes(key)) && finiteOr(metrics.population, Infinity) >= definition.minPopulation) ?? null;
  }

  getMetrics(simulation) {
    const collective = simulation?.getCollectiveMetrics?.() ?? {};
    const era = CIVILIZATION_ERAS[this.eraIndex] ?? CIVILIZATION_ERAS[0];
    return {
      era,
      population: finiteOr(collective.population, simulation?.creatures?.length ?? 0),
      uniqueKnowledge: finiteOr(collective.uniqueKnowledge, 0),
      roles: finiteOr(collective.roles, 0),
      completedProjects: finiteOr(collective.completedProjects, 0),
      technologies: this.technologies.length,
      institutions: this.institutions.length,
      words: this.language.lexicon.length,
      values: this.culture.values.length,
      cooperation: this.cooperation,
      prosperity: this.prosperity,
      stability: this.stability,
      literacy: this.literacy,
      researchPoints: this.researchPoints,
      innovationPoints: this.innovationPoints,
      culturePoints: this.culturePoints,
      society: this.society.getMetrics()
    };
  }

  recordChronicle(year, type, text, ref = '') {
    const item = { id: uid(), year: +finiteOr(year, 0).toFixed(1), type: clean(type, 30), text: clean(text, 260), ref: clean(ref, 80), createdAt: Date.now() };
    if (!item.text) return false;
    this.chronicle.unshift(item);
    this.chronicle = this.chronicle.slice(0, 120);
    return true;
  }

  addUnique(list, value, max) {
    const cleanValue = clean(value, 180);
    if (!cleanValue || list.includes(cleanValue)) return false;
    list.push(cleanValue);
    if (list.length > max) list.splice(0, list.length - max);
    return true;
  }

  serialize() {
    return {
      version: 2,
      eraIndex: this.eraIndex,
      researchPoints: this.researchPoints,
      innovationPoints: this.innovationPoints,
      culturePoints: this.culturePoints,
      cooperation: this.cooperation,
      prosperity: this.prosperity,
      stability: this.stability,
      literacy: this.literacy,
      populationPeak: this.populationPeak,
      technologies: this.technologies,
      institutions: this.institutions,
      language: this.language,
      culture: this.culture,
      chronicle: this.chronicle,
      externalWisdom: this.externalWisdom,
      processedObraIds: this.processedObraIds,
      processedDiscoveryKeys: this.processedDiscoveryKeys,
      lastLanguageYear: this.lastLanguageYear,
      lastCultureYear: this.lastCultureYear,
      lastInstitutionYear: this.lastInstitutionYear,
      society: this.society.serialize()
    };
  }

  hydrate(data) {
    if (!data || typeof data !== 'object') return;
    this.eraIndex = clamp(Math.floor(finiteOr(data.eraIndex, 0)), 0, CIVILIZATION_ERAS.length - 1);
    this.researchPoints = Math.max(0, finiteOr(data.researchPoints, 0));
    this.innovationPoints = Math.max(0, finiteOr(data.innovationPoints, 0));
    this.culturePoints = Math.max(0, finiteOr(data.culturePoints, 0));
    this.cooperation = clamp(finiteOr(data.cooperation, 0), 0, 1);
    this.prosperity = clamp(finiteOr(data.prosperity, .35), 0, 1);
    this.stability = clamp(finiteOr(data.stability, .7), 0, 1);
    this.literacy = clamp(finiteOr(data.literacy, 0), 0, 1);
    this.populationPeak = Math.max(0, Math.floor(finiteOr(data.populationPeak, 0)));
    const validTechs = new Set(TECHNOLOGY_TREE.map(item => item.key));
    this.technologies = uniqueStrings(data.technologies, 40, 80).filter(key => validTechs.has(key));
    const validInstitutions = new Map(INSTITUTION_DEFINITIONS.map(item => [item.key, item]));
    this.institutions = Array.isArray(data.institutions) ? data.institutions.filter(item => item && validInstitutions.has(item.key)).slice(0, 20).map(item => ({ ...validInstitutions.get(item.key), foundedYear: Math.max(0, finiteOr(item.foundedYear, 0)) })) : [];
    this.language = sanitizeLanguage(data.language);
    this.culture = sanitizeCulture(data.culture);
    this.chronicle = sanitizeChronicle(data.chronicle);
    this.externalWisdom = sanitizeExternalWisdom(data.externalWisdom);
    this.processedObraIds = uniqueStrings(data.processedObraIds, 160, 80);
    this.processedDiscoveryKeys = uniqueStrings(data.processedDiscoveryKeys, 220, 100);
    this.lastLanguageYear = Math.max(0, finiteOr(data.lastLanguageYear, 0));
    this.lastCultureYear = Math.max(0, finiteOr(data.lastCultureYear, 0));
    this.lastInstitutionYear = Math.max(0, finiteOr(data.lastInstitutionYear, 0));
    this.society.hydrate(data.society);
  }
}

function tech(key, label, description, cost, minPopulation, minKnowledge, minProjects, requires = []) {
  return Object.freeze({ key, label, description, cost, minPopulation, minKnowledge, minProjects, requires: Object.freeze(requires) });
}

function smooth(current, target, amount) {
  return current + (target - current) * clamp(amount, 0, 1);
}

function generateWord(seed) {
  const starts = ['ka', 'va', 'or', 'el', 'shi', 'na', 'tor', 'lum', 'rai', 'zen', 'uma', 'iri', 'sol', 'mek', 'tal', 'vor'];
  const middles = ['r', 'l', 'm', 'n', 's', 'v', 'k', 'th', 'z'];
  const ends = ['a', 'en', 'i', 'or', 'um', 'is', 'ek', 'ai', 'on'];
  const a = Math.floor(hashUnit(`${seed}:a`) * starts.length);
  const b = Math.floor(hashUnit(`${seed}:b`) * middles.length);
  const c = Math.floor(hashUnit(`${seed}:c`) * ends.length);
  return `${starts[a]}${middles[b]}${ends[c]}`;
}

function sanitizeLanguage(value) {
  const lexicon = Array.isArray(value?.lexicon) ? value.lexicon.filter(item => item && typeof item === 'object').slice(-64).map(item => ({
    concept: clean(item.concept, 50), word: clean(item.word, 30), meaning: clean(item.meaning, 120), year: Math.max(0, finiteOr(item.year, 0))
  })).filter(item => item.concept && item.word) : [];
  return { name: clean(value?.name, 60) || 'Habla del Origen', grammarLevel: clamp(finiteOr(value?.grammarLevel, 0), 0, 5), lexicon };
}

function sanitizeCulture(value) {
  const values = Array.isArray(value?.values) ? value.values.filter(item => item && typeof item === 'object').slice(-20).map(item => ({
    key: clean(item.key, 40), label: clean(item.label, 60), statement: clean(item.statement, 200), year: Math.max(0, finiteOr(item.year, 0))
  })).filter(item => item.key && item.label) : [];
  return {
    values,
    traditions: uniqueStrings(value?.traditions, 20, 180),
    symbols: uniqueStrings(value?.symbols, 12, 12).length ? uniqueStrings(value?.symbols, 12, 12) : ['Ω'],
    festivals: uniqueStrings(value?.festivals, 16, 100)
  };
}

function sanitizeChronicle(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(0, 120).map(item => ({
    id: clean(item.id, 80) || uid(), year: Math.max(0, finiteOr(item.year, 0)), type: clean(item.type, 30), text: clean(item.text, 260), ref: clean(item.ref, 80), createdAt: finiteOr(item.createdAt, Date.now())
  })).filter(item => item.text);
}

function sanitizeExternalWisdom(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(-12).map(item => ({
    id: clean(item.id, 80) || uid(), year: Math.max(0, finiteOr(item.year, 0)), text: clean(item.text, 1800), fragments: Array.isArray(item.fragments) ? item.fragments.map(fragment => clean(fragment, 260)).filter(Boolean).slice(0, 8) : [], createdAt: finiteOr(item.createdAt, Date.now())
  })).filter(item => item.text);
}

function uniqueStrings(value, maxItems, maxLength) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(item => typeof item === 'string').map(item => clean(item, maxLength)).filter(Boolean))].slice(-maxItems);
}

function clean(value, max = 200) {
  return String(value ?? '').replace(/[<>]/g, '').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function capitalize(value) {
  const text = clean(value, 80);
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(36);
}

function hashUnit(value) {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0) / 4294967295;
}
