import { BIOMES, CONFIG } from './config.js?v=6.0.1';
import { chance, clamp, finiteOr, uid } from './utils.js?v=6.0.1';

const DREAM_THEMES = Object.freeze([
  ['hogar', 'un hogar iluminado entre la niebla'],
  ['familia', 'las voces de su linaje reunidas alrededor del fuego'],
  ['guerra', 'una batalla que todavía no ha ocurrido'],
  ['invento', 'una máquina imposible construida con piezas conocidas'],
  ['abismo', 'una puerta bajo el mundo que pronuncia su nombre'],
  ['viaje', 'un territorio más allá de todos los mapas'],
  ['memoria', 'un recuerdo heredado de alguien a quien nunca conoció'],
  ['corona', 'una corona vacía esperando a su próximo portador']
]);

const LIFE_GOALS = Object.freeze([
  'proteger a su linaje', 'descubrir todos los biomas', 'escribir una obra que sobreviva a su muerte',
  'fundar una institución', 'convertirse en referente de su oficio', 'evitar una gran guerra',
  'dirigir una facción', 'comprender el origen de Ω', 'crear una tecnología nueva',
  'reconciliar a dos enemigos', 'dejar un heredero digno', 'encontrar una ruina olvidada'
]);

const BOOK_TYPES = Object.freeze([
  ['crónica', 'Crónica'], ['manual', 'Manual'], ['tratado', 'Tratado'], ['poemario', 'Cantos'],
  ['atlas', 'Atlas'], ['memorias', 'Memorias'], ['profecía', 'Visiones'], ['ensayo', 'Meditaciones']
]);

const CALLINGS = Object.freeze([
  'Cronista', 'Cartógrafo', 'Custodio de reliquias', 'Intérprete de sueños', 'Mediador', 'Maestro de oficio',
  'Explorador de ruinas', 'Sanador de memoria', 'Arquitecto de refugios', 'Escriba', 'Orador', 'Guardián del archivo'
]);

const WEATHER = Object.freeze({
  clear: { label: 'Cielo quieto', icon: '·' },
  rain: { label: 'Lluvia de píxeles', icon: '╱' },
  storm: { label: 'Tormenta Ω', icon: 'ϟ' },
  fog: { label: 'Niebla baja', icon: '≈' },
  ash: { label: 'Ceniza suspendida', icon: '✣' },
  spores: { label: 'Esporas luminosas', icon: '✦' },
  snow: { label: 'Nieve mineral', icon: '❄' }
});

export class LegacyEngine {
  constructor(data = null) {
    this.reset();
    if (data) this.hydrate(data);
  }

  reset() {
    this.profiles = {};
    this.dreams = [];
    this.rumors = [];
    this.books = [];
    this.ruins = [];
    this.relics = [];
    this.myths = [];
    this.libraries = [];
    this.collectiveInsights = [];
    this.legacies = [];
    this.environment = {
      dayFraction: 0.28,
      phase: 'amanecer',
      season: 'Brote',
      weather: 'clear',
      weatherLabel: WEATHER.clear.label,
      weatherIntensity: 0,
      weatherUntilYear: 2.5
    };
    this.timer = 0;
    this.lastDreamYear = 0;
    this.lastRumorYear = 0;
    this.lastBookYear = 0;
    this.lastMythYear = 0;
    this.lastInsightYear = 0;
    this.lastLibraryYear = 0;
  }

  update(dt, simulation) {
    if (!Number.isFinite(dt) || dt <= 0 || !simulation) return;
    this.updateEnvironment(simulation);
    this.timer += dt;
    if (this.timer < .85) return;
    this.timer = 0;

    const year = Math.max(0, finiteOr(simulation.year, 0));
    const living = (simulation.creatures ?? []).filter(creature => creature && !creature.dead);
    this.syncProfiles(living, simulation);
    if (!living.length) return;

    this.maybeDream(living, simulation, year);
    this.maybeCreateRumor(living, simulation, year);
    this.spreadRumors(living, simulation, year);
    this.maybeWriteBook(living, simulation, year);
    this.maybeCreateCollectiveInsight(living, simulation, year);
    this.maybeEstablishLibrary(living, simulation, year);
    this.maybeCreateMyth(simulation, year);
    this.ageRuins(year);
  }

  updateEnvironment(simulation) {
    const cycle = ((finiteOr(simulation.time, 0) / 54) % 1 + 1) % 1;
    const phase = cycle < .18 ? 'madrugada' : cycle < .31 ? 'amanecer' : cycle < .69 ? 'día' : cycle < .82 ? 'ocaso' : 'noche';
    const seasons = ['Brote', 'Ascua', 'Cosecha', 'Umbral'];
    this.environment.dayFraction = cycle;
    this.environment.phase = phase;
    this.environment.season = seasons[Math.floor((finiteOr(simulation.year, 0) / 8) % seasons.length)];

    if (finiteOr(simulation.year, 0) >= finiteOr(this.environment.weatherUntilYear, 0)) {
      const options = this.weatherOptionsForBiome(simulation.biome);
      const key = options[Math.floor(legacyHashUnit(`${simulation.biome}:${Math.floor(simulation.year * 3)}:${simulation.totalBirths}`) * options.length)] || 'clear';
      this.environment.weather = key;
      this.environment.weatherLabel = WEATHER[key]?.label ?? WEATHER.clear.label;
      this.environment.weatherIntensity = key === 'clear' ? 0 : .35 + legacyHashUnit(`${key}:${simulation.year}`) * .55;
      this.environment.weatherUntilYear = simulation.year + 2.5 + legacyHashUnit(`${key}:duration:${simulation.year}`) * 5.5;
      if (key !== 'clear' && simulation.creatures.length > 0) {
        simulation.logEvent?.(`Año ${simulation.year.toFixed(1)}`, `${this.environment.weatherLabel} cubre ${simulation.getBiome?.().label ?? 'el mundo'}.`);
      }
    }
  }

  weatherOptionsForBiome(biome) {
    if (biome === 'tundra') return ['clear', 'snow', 'fog', 'storm'];
    if (biome === 'volcanic') return ['clear', 'ash', 'storm'];
    if (biome === 'forest' || biome === 'marsh') return ['clear', 'rain', 'fog', 'spores'];
    if (biome === 'desert') return ['clear', 'ash', 'storm'];
    if (biome === 'abyss') return ['clear', 'fog', 'spores', 'ash'];
    return ['clear', 'rain', 'fog', 'storm', 'spores'];
  }

  syncProfiles(living, simulation) {
    const society = simulation.civilization?.society;
    const livingIds = new Set(living.map(creature => creature.id));
    for (const creature of living) {
      let profile = this.profiles[creature.id];
      if (!profile) {
        profile = this.createProfile(creature, simulation.year);
        this.profiles[creature.id] = profile;
      }
      const social = society?.getProfile?.(creature.id);
      profile.name = legacyClean(creature.name || creature.entityCode || creature.id, 28);
      profile.entityCode = legacyClean(creature.entityCode || '', 18);
      profile.status = 'alive';
      profile.lastSeenYear = simulation.year;
      profile.factionId = legacyClean(social?.factionId || '', 48);
      profile.title = legacyClean(social?.title || '', 48);
      profile.legacyScore = clamp(
        finiteOr(profile.legacyScore, 0)
        + finiteOr(creature.experience?.discoveries, 0) * .015
        + finiteOr(creature.experience?.collaborations, 0) * .012
        + finiteOr(creature.knowledge?.length, 0) * .004,
        0, 100
      );
      profile.hope = clamp(profile.hope + (creature.energy / Math.max(1, creature.maxEnergy) - .5) * .008, 0, 1);
      profile.fear = clamp(profile.fear + (creature.mood === 'alarmado' ? .025 : -.004), 0, 1);
    }
    for (const profile of Object.values(this.profiles)) {
      if (profile.status === 'alive' && !livingIds.has(profile.id)) profile.status = 'dead';
    }
    if (Object.keys(this.profiles).length > 1800) {
      const all = Object.values(this.profiles);
      const alive = all.filter(profile => profile.status === 'alive');
      const dead = all
        .filter(profile => profile.status !== 'alive')
        .sort((a, b) => legacyImportance(b) - legacyImportance(a))
        .slice(0, Math.max(0, 1800 - alive.length));
      this.profiles = Object.fromEntries([...alive, ...dead].map(profile => [profile.id, profile]));
    }
  }

  createProfile(creature, year) {
    const g = creature.genome ?? {};
    const seed = creature.id || uid();
    const creativity = clamp(.12 + finiteOr(g.curiosity, .5) * .44 + finiteOr(g.memory, .5) * .24 + legacyHashUnit(`${seed}:creativity`) * .2, 0, 1);
    const resilience = clamp(.15 + finiteOr(g.efficiency, 1) * .28 + (1 - finiteOr(g.aggression, .3)) * .15 + legacyHashUnit(`${seed}:resilience`) * .2, 0, 1);
    const spirituality = clamp(.08 + finiteOr(g.memory, .5) * .24 + finiteOr(g.curiosity, .5) * .18 + legacyHashUnit(`${seed}:spirituality`) * .5, 0, 1);
    return {
      id: creature.id,
      name: legacyClean(creature.name || creature.entityCode || creature.id, 28),
      entityCode: legacyClean(creature.entityCode || '', 18),
      status: 'alive', bornYear: year, diedYear: null, cause: '',
      hope: clamp(.35 + resilience * .35 + legacyHashUnit(`${seed}:hope`) * .25, 0, 1),
      fear: clamp(.08 + finiteOr(g.aggression, .3) * .14 + legacyHashUnit(`${seed}:fear`) * .38, 0, 1),
      creativity, resilience, spirituality,
      lifeGoal: LIFE_GOALS[Math.floor(legacyHashUnit(`${seed}:goal`) * LIFE_GOALS.length)],
      calling: CALLINGS[Math.floor(legacyHashUnit(`${seed}:calling`) * CALLINGS.length)],
      dreams: [], traumas: [], rumorsKnown: [], booksAuthored: [], relicIds: [],
      legacyScore: creature.isFounder ? 25 : 0,
      lastDreamYear: year - legacyHashUnit(`${seed}:dream`) * 4,
      lastRumorYear: year,
      factionId: '', title: '', lastSeenYear: year
    };
  }

  maybeDream(living, simulation, year) {
    if (year - this.lastDreamYear < .7) return;
    const candidates = living.filter(creature => {
      const profile = this.profiles[creature.id];
      return profile && year - profile.lastDreamYear > 2.2 && (creature.state === 'descansar' || creature.energy < creature.maxEnergy * .52 || creature.lifeStage === 'anciano');
    });
    if (!candidates.length) return;
    const creature = candidates[Math.floor(legacyHashUnit(`dream:${year}:${candidates.length}`) * candidates.length)];
    const profile = this.profiles[creature.id];
    if (!chance(.24 + profile.spirituality * .22 + profile.creativity * .16)) return;
    const theme = DREAM_THEMES[Math.floor(legacyHashUnit(`${creature.id}:${year}:theme`) * DREAM_THEMES.length)];
    const dream = {
      id: uid(), creatureId: creature.id, creatureName: profile.name, year: +year.toFixed(1),
      theme: theme[0], text: `${profile.name} sueña con ${theme[1]}.`,
      omen: legacyHashUnit(`${creature.id}:${year}:omen`) > .72,
      remembered: profile.resilience + finiteOr(creature.genome?.memory, .5) > 1.05
    };
    this.dreams.unshift(dream);
    this.dreams = this.dreams.slice(0, 120);
    profile.dreams.unshift(dream.id);
    profile.dreams = profile.dreams.slice(0, 16);
    profile.lastDreamYear = year;
    profile.hope = clamp(profile.hope + (dream.theme === 'guerra' || dream.theme === 'abismo' ? -.035 : .025), 0, 1);
    profile.fear = clamp(profile.fear + (dream.theme === 'guerra' || dream.theme === 'abismo' ? .045 : -.01), 0, 1);
    creature.goal = dream.theme === 'invento' ? 'comprender una visión imposible' : dream.theme === 'viaje' ? 'buscar un lugar visto en sueños' : creature.goal;
    creature.learnKnowledge?.({ kind: 'fact', key: `dream:${dream.id}`, label: `Sueño: ${dream.text}`, confidence: dream.remembered ? .56 : .34, createdAt: Date.now() }, 'sueño');
    if (dream.omen) simulation.civilization?.recordChronicle?.(year, 'presagio', dream.text, dream.id);
    this.lastDreamYear = year;
  }

  maybeCreateRumor(living, simulation, year) {
    if (living.length < 4 || year - this.lastRumorYear < 2.4) return;
    if (!chance(.25 + Math.min(.35, living.length / 180))) return;
    const source = living[Math.floor(legacyHashUnit(`rumor-source:${year}:${living.length}`) * living.length)];
    const event = simulation.events?.[Math.floor(legacyHashUnit(`rumor-event:${year}`) * Math.max(1, simulation.events.length))];
    const fragments = [
      'hay una cámara enterrada bajo el bioma actual',
      'un antiguo líder ocultó un descubrimiento antes de morir',
      'las ruinas cambian de lugar durante la noche',
      'una facción prepara una alianza secreta',
      'el próximo gran invento llegará a través de un sueño',
      'Ω-001 dejó una instrucción que todavía nadie ha comprendido',
      'una criatura desaparecida sigue hablando a través del archivo'
    ];
    const claim = event?.text && legacyHashUnit(`use-event:${year}`) > .58
      ? `el relato «${legacyClean(event.text, 120)}» oculta algo más`
      : fragments[Math.floor(legacyHashUnit(`rumor:${year}`) * fragments.length)];
    const rumor = {
      id: uid(), year: +year.toFixed(1), originId: source.id, originName: source.name,
      claim: legacyClean(`Se dice que ${claim}.`, 220), truth: legacyHashUnit(`truth:${year}:${source.id}`),
      spread: 1, believers: [source.id], status: 'circulando', distorted: 0
    };
    this.rumors.unshift(rumor);
    this.rumors = this.rumors.slice(0, 100);
    const sourceProfile = this.profiles[source.id] ?? (this.profiles[source.id] = this.createProfile(source, year));
    sourceProfile.rumorsKnown.unshift(rumor.id);
    sourceProfile.rumorsKnown = sourceProfile.rumorsKnown.slice(0, 20);
    this.lastRumorYear = year;
  }

  spreadRumors(living, simulation, year) {
    if (!this.rumors.length || living.length < 2) return;
    for (const rumor of this.rumors.slice(0, 18)) {
      if (rumor.status !== 'circulando') continue;
      const believers = new Set(rumor.believers);
      const carriers = living.filter(creature => believers.has(creature.id));
      if (!carriers.length) { rumor.status = 'olvidado'; continue; }
      const carrier = carriers[Math.floor(legacyHashUnit(`${rumor.id}:${year}:carrier`) * carriers.length)];
      const candidates = living.filter(creature => !believers.has(creature.id) && (finiteOr(carrier.relationships?.[creature.id], 0) > .16 || creature.speciesId === carrier.speciesId));
      if (!candidates.length || !chance(.2 + finiteOr(carrier.genome?.sociability, .5) * .25)) continue;
      const listener = candidates[Math.floor(legacyHashUnit(`${rumor.id}:${year}:listener`) * candidates.length)];
      rumor.believers.push(listener.id);
      rumor.believers = [...new Set(rumor.believers)].slice(-240);
      rumor.spread = rumor.believers.length;
      rumor.distorted = clamp(rumor.distorted + legacyHashUnit(`${listener.id}:${rumor.id}`) * .025, 0, 1);
      const profile = this.profiles[listener.id];
      if (profile && !profile.rumorsKnown.includes(rumor.id)) profile.rumorsKnown.unshift(rumor.id);
      if (rumor.spread >= Math.max(6, Math.ceil(living.length * .4)) && rumor.status === 'circulando') {
        rumor.status = 'leyenda popular';
        simulation.civilization?.recordChronicle?.(year, 'rumor', `El rumor «${rumor.claim}» ya forma parte de la conversación colectiva.`, rumor.id);
      }
    }
  }

  maybeWriteBook(living, simulation, year) {
    const literacy = finiteOr(simulation.civilization?.literacy, 0);
    if (living.length < 3 || literacy < .08 || year - this.lastBookYear < 3.2) return;
    const candidates = living.filter(creature => {
      const profile = this.profiles[creature.id];
      return profile && creature.age >= creature.maturity && profile.creativity > .48 && profile.booksAuthored.length < 8 && creature.knowledge?.length >= 3;
    });
    if (!candidates.length || !chance(.2 + literacy * .32)) return;
    candidates.sort((a, b) => (this.profiles[b.id].creativity + finiteOr(b.genome?.memory, 0)) - (this.profiles[a.id].creativity + finiteOr(a.genome?.memory, 0)));
    const author = candidates[Math.floor(legacyHashUnit(`author:${year}`) * Math.min(candidates.length, 6))];
    const profile = this.profiles[author.id];
    const type = BOOK_TYPES[Math.floor(legacyHashUnit(`${author.id}:${year}:booktype`) * BOOK_TYPES.length)];
    const subject = this.bookSubject(author, simulation, type[0]);
    const title = `${type[1]} de ${subject.title}`;
    const book = {
      id: uid(), title: legacyClean(title, 100), type: type[0], authorId: author.id, authorName: profile.name,
      year: +year.toFixed(1), excerpt: legacyClean(subject.excerpt, 260),
      copies: 1, readers: [], status: 'conservado', influence: .12 + profile.creativity * .35 + finiteOr(author.genome?.memory, .5) * .22
    };
    this.books.unshift(book);
    this.books = this.books.slice(0, 140);
    profile.booksAuthored.unshift(book.id);
    profile.legacyScore = clamp(profile.legacyScore + 8 + book.influence * 8, 0, 100);
    author.experience.collaborations = Math.min(9999, finiteOr(author.experience?.collaborations, 0) + 1);
    author.learnKnowledge?.({ kind: 'fact', key: `book:${book.id}`, label: `Autoría: ${book.title}`, confidence: .9, createdAt: Date.now() }, 'escritura');
    simulation.civilization?.recordChronicle?.(year, 'libro', `${profile.name} escribe «${book.title}».`, book.id);
    simulation.logEvent?.(`Año ${year.toFixed(1)}`, `Nueva obra escrita: «${book.title}», de ${profile.name}.`);
    this.lastBookYear = year;
  }

  bookSubject(author, simulation, type) {
    const knowledge = author.knowledge?.at(-1)?.label || 'los primeros conocimientos';
    const faction = simulation.civilization?.society?.getFaction?.(this.profiles[author.id]?.factionId);
    const biome = BIOMES[simulation.biome]?.label ?? 'el mundo';
    const subjects = {
      crónica: { title: faction?.name || 'los Años del Origen', excerpt: `Un relato sobre cómo ${faction?.name || 'el linaje'} sobrevivió, cambió y dejó memoria para quienes aún no habían nacido.` },
      manual: { title: author.skill || 'Supervivencia', excerpt: `Reglas prácticas nacidas de la experiencia: ${knowledge}. Cada consejo incluye una prueba, un riesgo y una forma de corregir errores.` },
      tratado: { title: 'la Memoria Compartida', excerpt: `Una investigación sobre qué parte de una idea pertenece a quien la descubre y qué parte pertenece a la comunidad que la conserva.` },
      poemario: { title: biome, excerpt: `Cantos breves sobre ${biome}, el fuego, los nombres perdidos y las criaturas que regresan únicamente en sueños.` },
      atlas: { title: biome, excerpt: `Mapas, rutas, refugios, peligros y rumores del territorio conocido. Algunas anotaciones contradicen a otras.` },
      memorias: { title: author.entityCode || author.name, excerpt: `Recuerdos de infancia, amistades, miedos y decisiones que cambiaron una vida aparentemente pequeña.` },
      profecía: { title: 'la Próxima Era', excerpt: `Visiones ambiguas sobre una corona rota, una biblioteca en llamas y una idea capaz de unir a todos los oficios.` },
      ensayo: { title: 'la Libertad y el Linaje', excerpt: `Una reflexión sobre obedecer, cooperar y conservar el derecho de una criatura a elegir un camino inesperado.` }
    };
    return subjects[type] ?? subjects.ensayo;
  }

  maybeCreateCollectiveInsight(living, simulation, year) {
    if (year - this.lastInsightYear < 4.2) return;
    const metrics = simulation.getCollectiveMetrics?.() ?? {};
    if (finiteOr(metrics.roles, 0) < 3 || finiteOr(metrics.uniqueKnowledge, 0) < 12 || living.length < 5) return;
    if (!chance(.22 + finiteOr(metrics.synergy, 0) * .42)) return;
    const sorted = living.slice().sort((a, b) => finiteOr(b.knowledge?.length, 0) - finiteOr(a.knowledge?.length, 0));
    const members = [];
    const usedSkills = new Set();
    for (const creature of sorted) {
      const skill = creature.skill || 'observador';
      if (usedSkills.has(skill)) continue;
      usedSkills.add(skill);
      members.push(creature);
      if (members.length >= 5) break;
    }
    if (members.length < 3) return;
    const insightThemes = [
      'un sistema de reservas que reduce el riesgo de hambruna',
      'un método para contrastar rumores antes de convertirlos en leyes',
      'una arquitectura modular para construir sin agotar recursos',
      'un protocolo para enseñar conocimientos sin borrar las tradiciones locales',
      'una red de señales que conecta refugios, talleres y bibliotecas',
      'un acuerdo para que cada facción conserve identidad sin romper la cooperación común'
    ];
    const text = insightThemes[Math.floor(legacyHashUnit(`insight:${year}:${members.map(m => m.id).join(':')}`) * insightThemes.length)];
    const insight = {
      id: uid(), year: +year.toFixed(1), title: `Síntesis Ω-${String(this.collectiveInsights.length + 1).padStart(3, '0')}`,
      text, memberIds: members.map(member => member.id), memberNames: members.map(member => member.name),
      skills: members.map(member => member.skill || 'observador'), applied: false
    };
    this.collectiveInsights.unshift(insight);
    this.collectiveInsights = this.collectiveInsights.slice(0, 80);
    for (const member of members) {
      member.learnKnowledge?.({ kind: 'fact', key: `collective-insight:${insight.id}`, label: insight.text, confidence: .86, createdAt: Date.now() }, 'síntesis colectiva');
      const memberProfile = this.profiles[member.id] ?? (this.profiles[member.id] = this.createProfile(member, year));
      memberProfile.legacyScore = clamp(finiteOr(memberProfile.legacyScore, 0) + 2.5, 0, 100);
    }
    simulation.civilization.researchPoints += 3.5;
    simulation.civilization.innovationPoints += 3.5;
    simulation.civilization.recordChronicle?.(year, 'síntesis colectiva', `${members.map(member => member.name).join(', ')} combinan sus oficios y proponen ${text}.`, insight.id);
    this.lastInsightYear = year;
  }

  maybeEstablishLibrary(living, simulation, year) {
    if (this.books.length < 3 || year - this.lastLibraryYear < 5) return;
    const targetCount = Math.min(8, 1 + Math.floor(this.books.length / 10));
    if (this.libraries.length >= targetCount) return;
    const candidate = living.slice().sort((a, b) => finiteOr(b.genome?.memory, 0) - finiteOr(a.genome?.memory, 0))[0];
    if (!candidate) return;
    const library = {
      id: uid(), name: this.libraries.length ? `Archivo de ${candidate.name}` : 'Biblioteca del Primer Fuego',
      foundedYear: +year.toFixed(1), x: Math.round(candidate.home?.x ?? candidate.x), y: Math.round(candidate.home?.y ?? candidate.y),
      custodianId: candidate.id, custodianName: candidate.name,
      bookIds: this.books.slice(0, Math.min(this.books.length, 18)).map(book => book.id),
      condition: 1, lostBooks: 0
    };
    this.libraries.unshift(library);
    candidate.goal = 'custodiar la memoria escrita';
    const custodianProfile = this.profiles[candidate.id] ?? (this.profiles[candidate.id] = this.createProfile(candidate, year));
    custodianProfile.calling = 'Bibliotecario del linaje';
    custodianProfile.legacyScore = clamp(finiteOr(custodianProfile.legacyScore, 0) + 7, 0, 100);
    simulation.civilization.recordChronicle?.(year, 'biblioteca', `Se funda ${library.name}, bajo el cuidado de ${candidate.name}.`, library.id);
    this.lastLibraryYear = year;
  }

  maybeCreateMyth(simulation, year) {
    if (year - this.lastMythYear < 8 || (!this.legacies.length && !this.ruins.length && !this.rumors.length)) return;
    if (!chance(.25 + finiteOr(simulation.civilization?.culturePoints, 0) / 200)) return;
    const sourcePool = [
      ...this.legacies.slice(0, 12).map(item => ({ kind: 'legado', id: item.id, name: item.name })),
      ...this.ruins.slice(0, 12).map(item => ({ kind: 'ruina', id: item.id, name: item.name })),
      ...this.rumors.filter(item => item.status !== 'olvidado').slice(0, 12).map(item => ({ kind: 'rumor', id: item.id, name: item.claim }))
    ];
    if (!sourcePool.length) return;
    const source = sourcePool[Math.floor(legacyHashUnit(`myth:${year}`) * sourcePool.length)];
    const variants = [
      `${source.name} no desapareció: se convirtió en una señal que guía a quienes se pierden.`,
      `${source.name} custodia una puerta bajo el mundo y solo responde a una palabra olvidada.`,
      `Quien repita la historia de ${source.name} durante el ocaso conservará un recuerdo que no le pertenece.`,
      `${source.name} fue exagerado por generaciones hasta convertirse en fundador, monstruo o santo según la facción que lo narra.`
    ];
    const myth = {
      id: uid(), year: +year.toFixed(1), sourceKind: source.kind, sourceId: source.id,
      title: `Leyenda de ${legacyClean(source.name, 70)}`,
      text: variants[Math.floor(legacyHashUnit(`${source.id}:${year}:variant`) * variants.length)],
      believers: 1, versions: 1
    };
    this.myths.unshift(myth);
    this.myths = this.myths.slice(0, 70);
    simulation.civilization?.recordChronicle?.(year, 'mito', myth.text, myth.id);
    this.lastMythYear = year;
  }

  onBirth(creature, simulation) {
    if (!creature) return;
    const profile = this.createProfile(creature, simulation?.year ?? 0);
    if (creature.parents?.length) {
      const parentProfiles = creature.parents.map(id => this.profiles[id]).filter(Boolean);
      if (parentProfiles.length) {
        profile.hope = clamp(parentProfiles.reduce((sum, item) => sum + item.hope, 0) / parentProfiles.length + (legacyHashUnit(`${creature.id}:inherit-hope`) - .5) * .12, 0, 1);
        profile.spirituality = clamp(parentProfiles.reduce((sum, item) => sum + item.spirituality, 0) / parentProfiles.length + (legacyHashUnit(`${creature.id}:inherit-spirit`) - .5) * .16, 0, 1);
        const inheritedBooks = parentProfiles.flatMap(item => item.booksAuthored).slice(0, 2);
        for (const bookId of inheritedBooks) creature.learnKnowledge?.({ kind: 'fact', key: `inherit-book:${bookId}`, label: 'Conoce una obra escrita por su linaje.', confidence: .48, createdAt: Date.now() }, 'legado familiar');
      }
    }
    this.profiles[creature.id] = profile;
  }

  onDeath(creature, cause, simulation) {
    if (!creature) return;
    const year = Math.max(0, finiteOr(simulation?.year, 0));
    const profile = this.profiles[creature.id] ?? this.createProfile(creature, year);
    const societyProfile = simulation?.civilization?.society?.getProfile?.(creature.id);
    profile.status = 'dead';
    profile.diedYear = +year.toFixed(1);
    profile.cause = legacyClean(cause || 'causa desconocida', 48);
    profile.title = legacyClean(societyProfile?.title || profile.title || '', 48);
    const notable = creature.isFounder || Boolean(profile.title) || profile.booksAuthored.length > 0 || profile.legacyScore > 12 || finiteOr(societyProfile?.influence, 0) > .66;
    const legacy = {
      id: uid(), creatureId: creature.id, name: profile.name, entityCode: profile.entityCode,
      year: +year.toFixed(1), cause: profile.cause, lifeGoal: profile.lifeGoal, calling: profile.calling,
      title: profile.title, books: profile.booksAuthored.slice(),
      summary: this.buildLegacySummary(creature, profile, societyProfile),
      renown: clamp(profile.legacyScore / 100 + finiteOr(societyProfile?.influence, 0) * .45 + (creature.isFounder ? .5 : 0), 0, 1)
    };
    this.legacies.unshift(legacy);
    this.legacies = this.legacies.slice(0, 180);

    const related = (simulation?.creatures ?? []).filter(other => other && other.id !== creature.id && !other.dead && (
      other.parents?.includes(creature.id) || creature.parents?.includes(other.id) || finiteOr(other.relationships?.[creature.id], 0) > .42
    ));
    for (const other of related.slice(0, 16)) {
      const otherProfile = this.profiles[other.id] ?? this.createProfile(other, year);
      const trauma = { id: uid(), year: +year.toFixed(1), type: 'pérdida', text: `Perdió a ${profile.name} por ${profile.cause}.`, sourceId: creature.id, intensity: .35 + finiteOr(other.relationships?.[creature.id], .3) * .5 };
      otherProfile.traumas.unshift(trauma);
      otherProfile.traumas = otherProfile.traumas.slice(0, 10);
      otherProfile.fear = clamp(otherProfile.fear + trauma.intensity * .16, 0, 1);
      otherProfile.hope = clamp(otherProfile.hope - trauma.intensity * .12, 0, 1);
      other.goal = otherProfile.resilience > .62 ? `honrar el legado de ${profile.name}` : `superar la pérdida de ${profile.name}`;
    }

    if (notable || chance(.08)) this.createRelicAndRuin(creature, profile, legacy, simulation);
    if (notable) simulation?.civilization?.recordChronicle?.(year, 'legado', legacy.summary, legacy.id);
  }

  buildLegacySummary(creature, profile, societyProfile) {
    const roles = [profile.title, profile.calling, creature.skill].filter(Boolean).join(', ');
    const achievements = [];
    if (profile.booksAuthored.length) achievements.push(`${profile.booksAuthored.length} obra${profile.booksAuthored.length === 1 ? '' : 's'} escrita${profile.booksAuthored.length === 1 ? '' : 's'}`);
    if (finiteOr(creature.experience?.discoveries, 0)) achievements.push(`${creature.experience.discoveries} descubrimientos`);
    if (finiteOr(societyProfile?.victories, 0)) achievements.push(`${societyProfile.victories} victorias`);
    return `${profile.name}${roles ? `, ${roles}` : ''}, muere por ${profile.cause}. Quería ${profile.lifeGoal}${achievements.length ? ` y deja ${achievements.join(', ')}` : ''}.`;
  }

  createRelicAndRuin(creature, profile, legacy, simulation) {
    const relicKinds = profile.booksAuthored.length ? ['códice', 'pluma de archivo', 'tablilla'] : profile.title ? ['corona rota', 'sello político', 'estandarte'] : ['amuleto', 'herramienta', 'máscara', 'mapa incompleto'];
    const kind = relicKinds[Math.floor(legacyHashUnit(`${creature.id}:relic`) * relicKinds.length)];
    const relic = {
      id: uid(), name: `${legacyCapitalize(kind)} de ${profile.name}`, kind,
      ownerId: creature.id, ownerName: profile.name, year: +finiteOr(simulation?.year, 0).toFixed(1),
      description: `Objeto asociado a ${profile.name}. Conserva una parte simbólica de su historia y aumenta el valor de su legado.`,
      location: 'ruina', discovered: false
    };
    this.relics.unshift(relic);
    this.relics = this.relics.slice(0, 140);
    profile.relicIds.unshift(relic.id);

    const ruin = {
      id: uid(), name: creature.isFounder ? 'Santuario de Ω-001' : `Vestigio de ${profile.name}`,
      x: Math.round(clamp(finiteOr(creature.x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH)),
      y: Math.round(clamp(finiteOr(creature.y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT)),
      foundedYear: +finiteOr(simulation?.year, 0).toFixed(1), age: 0, condition: 1,
      originId: creature.id, originName: profile.name, relicIds: [relic.id],
      description: legacy.title ? `Restos vinculados a ${legacy.title}.` : `Un lugar donde el linaje decidió no olvidar a ${profile.name}.`
    };
    this.ruins.unshift(ruin);
    this.ruins = this.ruins.slice(0, 60);
  }

  ageRuins(year) {
    for (const ruin of this.ruins) {
      ruin.age = Math.max(0, year - finiteOr(ruin.foundedYear, year));
      ruin.condition = clamp(1 - ruin.age / 180, .08, 1);
    }
    for (const library of this.libraries) {
      library.condition = clamp(finiteOr(library.condition, 1) - .00015, .15, 1);
    }
  }

  getProfile(id) { return typeof id === 'string' ? this.profiles[id] ?? null : null; }

  getMetrics() {
    return {
      dreams: this.dreams.length,
      activeRumors: this.rumors.filter(item => item.status !== 'olvidado').length,
      books: this.books.length,
      ruins: this.ruins.length,
      relics: this.relics.length,
      myths: this.myths.length,
      libraries: this.libraries.length,
      insights: this.collectiveInsights.length,
      legacies: this.legacies.length,
      environment: { ...this.environment }
    };
  }

  serialize() {
    return {
      profiles: this.profiles, dreams: this.dreams, rumors: this.rumors, books: this.books,
      ruins: this.ruins, relics: this.relics, myths: this.myths, libraries: this.libraries,
      collectiveInsights: this.collectiveInsights, legacies: this.legacies, environment: this.environment,
      lastDreamYear: this.lastDreamYear, lastRumorYear: this.lastRumorYear, lastBookYear: this.lastBookYear,
      lastMythYear: this.lastMythYear, lastInsightYear: this.lastInsightYear, lastLibraryYear: this.lastLibraryYear
    };
  }

  hydrate(data) {
    const source = data && typeof data === 'object' ? data : {};
    this.profiles = legacySanitizeProfiles(source.profiles);
    this.dreams = legacySanitizeArray(source.dreams, 120, 320);
    this.rumors = legacySanitizeArray(source.rumors, 100, 360);
    this.books = legacySanitizeArray(source.books, 140, 420);
    this.ruins = legacySanitizeArray(source.ruins, 60, 320).map(item => ({ ...item, x: clamp(finiteOr(item.x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH), y: clamp(finiteOr(item.y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT), condition: clamp(finiteOr(item.condition, 1), 0, 1) }));
    this.relics = legacySanitizeArray(source.relics, 140, 360);
    this.myths = legacySanitizeArray(source.myths, 70, 360);
    this.libraries = legacySanitizeArray(source.libraries, 12, 360).map(item => ({ ...item, x: clamp(finiteOr(item.x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH), y: clamp(finiteOr(item.y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT), condition: clamp(finiteOr(item.condition, 1), 0, 1) }));
    this.collectiveInsights = legacySanitizeArray(source.collectiveInsights, 80, 420);
    this.legacies = legacySanitizeArray(source.legacies, 180, 420);
    this.environment = {
      dayFraction: clamp(finiteOr(source.environment?.dayFraction, .28), 0, 1),
      phase: legacyClean(source.environment?.phase || 'amanecer', 20),
      season: legacyClean(source.environment?.season || 'Brote', 20),
      weather: Object.prototype.hasOwnProperty.call(WEATHER, source.environment?.weather) ? source.environment.weather : 'clear',
      weatherLabel: legacyClean(source.environment?.weatherLabel || WEATHER.clear.label, 40),
      weatherIntensity: clamp(finiteOr(source.environment?.weatherIntensity, 0), 0, 1),
      weatherUntilYear: Math.max(0, finiteOr(source.environment?.weatherUntilYear, 2.5))
    };
    this.lastDreamYear = Math.max(0, finiteOr(source.lastDreamYear, 0));
    this.lastRumorYear = Math.max(0, finiteOr(source.lastRumorYear, 0));
    this.lastBookYear = Math.max(0, finiteOr(source.lastBookYear, 0));
    this.lastMythYear = Math.max(0, finiteOr(source.lastMythYear, 0));
    this.lastInsightYear = Math.max(0, finiteOr(source.lastInsightYear, 0));
    this.lastLibraryYear = Math.max(0, finiteOr(source.lastLibraryYear, 0));
  }
}

function legacySanitizeProfiles(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const entries = Object.entries(value).filter(([id, item]) => typeof id === 'string' && item && typeof item === 'object').slice(0, 1800);
  return Object.fromEntries(entries.map(([id, item]) => [id, {
    ...item,
    id,
    name: legacyClean(item.name || id, 28), entityCode: legacyClean(item.entityCode || '', 18),
    status: item.status === 'dead' ? 'dead' : 'alive',
    hope: clamp(finiteOr(item.hope, .5), 0, 1), fear: clamp(finiteOr(item.fear, .2), 0, 1),
    creativity: clamp(finiteOr(item.creativity, .5), 0, 1), resilience: clamp(finiteOr(item.resilience, .5), 0, 1), spirituality: clamp(finiteOr(item.spirituality, .5), 0, 1),
    lifeGoal: legacyClean(item.lifeGoal || 'encontrar un propósito', 90), calling: legacyClean(item.calling || 'Observador', 60),
    dreams: Array.isArray(item.dreams) ? item.dreams.filter(v => typeof v === 'string').slice(0, 16) : [],
    traumas: legacySanitizeArray(item.traumas, 10, 220), rumorsKnown: Array.isArray(item.rumorsKnown) ? item.rumorsKnown.filter(v => typeof v === 'string').slice(0, 20) : [],
    booksAuthored: Array.isArray(item.booksAuthored) ? item.booksAuthored.filter(v => typeof v === 'string').slice(0, 8) : [],
    relicIds: Array.isArray(item.relicIds) ? item.relicIds.filter(v => typeof v === 'string').slice(0, 8) : [],
    legacyScore: clamp(finiteOr(item.legacyScore, 0), 0, 100), lastDreamYear: Math.max(0, finiteOr(item.lastDreamYear, 0))
  }]));
}

function legacySanitizeArray(value, limit, textLimit) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(0, limit).map(item => {
    const clean = {};
    for (const [key, raw] of Object.entries(item)) {
      if (typeof raw === 'string') clean[key] = legacyClean(raw, textLimit);
      else if (typeof raw === 'number') clean[key] = Number.isFinite(raw) ? raw : 0;
      else if (typeof raw === 'boolean' || raw == null) clean[key] = raw;
      else if (Array.isArray(raw)) clean[key] = raw.slice(0, 240).map(value => typeof value === 'string' ? legacyClean(value, 80) : value).filter(value => ['string', 'number', 'boolean'].includes(typeof value));
      else if (raw && typeof raw === 'object') clean[key] = { ...raw };
    }
    if (!clean.id) clean.id = uid();
    return clean;
  });
}

function legacyImportance(profile) {
  return finiteOr(profile.legacyScore, 0) + (profile.status === 'alive' ? 20 : 0) + finiteOr(profile.booksAuthored?.length, 0) * 4 + finiteOr(profile.relicIds?.length, 0) * 3;
}

function legacyClean(value, max = 160) {
  return String(value ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function legacyHashUnit(value) {
  const text = String(value ?? '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function legacyCapitalize(value) {
  const text = legacyClean(value, 80);
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}
