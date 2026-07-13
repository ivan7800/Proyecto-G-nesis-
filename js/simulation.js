import { BIOMES, CONFIG } from './config.js?v=6.0.2';
import { Creature, combineAppearances, inheritKnowledge } from './creature.js?v=6.0.2';
import { combineGenomes, geneticDistance, mutateGenome, randomGenome, sanitizeGenome } from './genetics.js?v=6.0.2';
import { SpatialGrid } from './spatial-grid.js?v=6.0.2';
import { Workshop, deriveSkill } from './workshop.js?v=6.0.2';
import { KNOWLEDGE_ATLAS, atlasRecordByKey, atlasRecordsForSkill, sanitizeCollectivePrompt } from './knowledge.js?v=6.0.2';
import { Civilization } from './civilization.js?v=6.0.2';
import { LegacyEngine } from './legacy.js?v=6.0.2';
import { GrandProjectEngine } from './grand-projects.js?v=6.0.2';
import { chance, clamp, distanceSq, finiteOr, rand, randInt, uid } from './utils.js?v=6.0.2';

export class Simulation {
  constructor() {
    this.creatures = [];
    this.eggs = [];
    this.food = [];
    this.sanctuaries = [];
    this.species = new Map();
    this.creatureGrid = new SpatialGrid(120);
    this.foodGrid = new SpatialGrid(100);
    this.time = 0;
    this.year = 0;
    this.temperature = 18;
    this.biome = 'origin';
    this.autoBiome = false;
    this.lastBiomeCycleYear = 0;
    this.autonomyLevel = .9;
    this.worldDiscoveries = [];
    this.collective = createCollectiveState();
    this.collectiveSyncTimer = 0;
    this.civilization = new Civilization();
    this.legacy = new LegacyEngine();
    this.grandProjects = new GrandProjectEngine();
    this.paused = false;
    this.speed = 1;
    this.environmentMutation = 1;
    this.foodAbundance = 1;
    this.births = 0;
    this.deaths = 0;
    this.totalBirths = 0;
    this.totalDeaths = 0;
    this.nextSpeciesId = 1;
    this.nextEntityNumber = 1;
    this.events = [];
    this.populationHistory = [];
    this.lastHistoryTime = 0;
    this.lastSpeciesEvent = 0;
    this.genesis = createGenesisState();
    this.workshop = new Workshop();
    this.senseInterval = .1;
    this.onEvent = null;
    this.onSelectionInvalidated = null;
    this.onHatch = null;
  }

  reset() {
    this.creatures.length = 0;
    this.eggs.length = 0;
    this.food.length = 0;
    this.sanctuaries.length = 0;
    this.species.clear();
    this.time = 0;
    this.year = 0;
    this.temperature = 18;
    this.biome = 'origin';
    this.autoBiome = false;
    this.lastBiomeCycleYear = 0;
    this.autonomyLevel = .9;
    this.worldDiscoveries.length = 0;
    this.collective = createCollectiveState();
    this.collectiveSyncTimer = 0;
    this.civilization.reset();
    this.legacy.reset();
    this.grandProjects.reset();
    this.paused = true;
    this.speed = 1;
    this.environmentMutation = 1;
    this.foodAbundance = 1;
    this.births = 0;
    this.deaths = 0;
    this.totalBirths = 0;
    this.totalDeaths = 0;
    this.nextSpeciesId = 1;
    this.nextEntityNumber = 2;
    this.events.length = 0;
    this.populationHistory.length = 0;
    this.lastHistoryTime = 0;
    this.lastSpeciesEvent = 0;
    this.genesis = createGenesisState();
    this.workshop.reset();

    const genome = randomGenome(196);
    genome.speed = 1.08;
    genome.vision = 205;
    genome.size = 4.55;
    genome.metabolism = .64;
    genome.sociability = .88;
    genome.curiosity = .76;
    genome.memory = .92;
    genome.aggression = .12;
    genome.fertility = 1.48;
    genome.efficiency = 1.42;
    genome.longevity = 225;
    genome.mutationRate = .045;
    const speciesId = this.createSpecies(genome, null, 0);
    const x = CONFIG.WORLD_WIDTH / 2;
    const y = CONFIG.WORLD_HEIGHT / 2;
    const egg = this.createEgg({
      x, y, genome, speciesId, generation: 0, parents: [], energy: 126,
      founder: true, name: 'Ω-001', entityCode: 'Ω-001', laidAt: 0, hatchAt: Infinity,
      appearance: null, knowledge: [], bond: .08
    });
    this.genesis.primordialEggId = egg.id;
    this.addFoodBurst(x, y, 150, 250);
    while (this.food.length < CONFIG.INITIAL_FOOD) {
      this.addFood(rand(x - 620, x + 620), rand(y - 440, y + 440), rand(22, 50));
    }
    this.logEvent('Protocolo 0', 'Un único huevo primordial espera la activación. Todo el linaje dependerá de Ω-001.');
    this.rebuildGrids();
  }

  beginGenesis() {
    if (this.genesis.phase !== 'dormant') return false;
    const egg = this.eggs.find(item => item.id === this.genesis.primordialEggId) ?? this.eggs[0];
    if (!egg) return false;
    egg.laidAt = this.time;
    egg.hatchAt = this.time + CONFIG.PRIMORDIAL_HATCH_SECONDS;
    this.genesis.phase = 'incubating';
    this.genesis.startedAt = this.time;
    this.paused = false;
    this.logEvent('Protocolo 1', 'El pulso de activación alcanza el huevo primordial. Comienza la eclosión de Ω-001.');
    return true;
  }

  getBiome() {
    return BIOMES[this.biome] ?? BIOMES.origin;
  }

  setBiome(key, { silent = false } = {}) {
    const next = Object.prototype.hasOwnProperty.call(BIOMES, key) ? key : 'origin';
    if (next === this.biome) return false;
    this.biome = next;
    this.lastBiomeCycleYear = this.year;
    if (!silent) {
      const biome = this.getBiome();
      this.logEvent(`Año ${this.year.toFixed(1)}`, `El mundo cambia: ahora domina ${biome.label}. ${biome.description}`);
    }
    return true;
  }

  updateBiomeCycle() {
    if (!this.autoBiome || this.year - this.lastBiomeCycleYear < CONFIG.AUTO_BIOME_YEARS) return;
    const keys = Object.keys(BIOMES).filter(key => key !== this.biome);
    if (!keys.length) return;
    const index = Math.floor((this.year * 7 + this.totalBirths + this.totalDeaths) % keys.length);
    this.setBiome(keys[index]);
  }

  setAutonomy(value) {
    this.autonomyLevel = clamp(finiteOr(value, .9), .25, 1);
  }

  seedCreatureKnowledge(creature, count = 4) {
    if (!creature || creature.dead) return 0;
    const skill = deriveSkill(creature);
    let learned = 0;
    for (const record of atlasRecordsForSkill(skill, count, creature.id)) {
      const didLearn = creature.learnKnowledge?.({
        kind: 'fact', key: record.key,
        label: `${record.domainLabel}: ${record.label}. ${record.principle}`,
        confidence: .82, createdAt: Date.now()
      }, 'Atlas Ω');
      if (didLearn) learned++;
    }
    return learned;
  }

  injectKnowledgeAtlas() {
    this.collective.atlasLoaded = true;
    this.collective.unlockedKeys = KNOWLEDGE_ATLAS.map(item => item.key);
    let learned = 0;
    for (const creature of this.creatures) learned += this.seedCreatureKnowledge(creature, creature.isFounder ? 8 : 5);
    for (const egg of this.eggs) {
      const records = atlasRecordsForSkill('educador', 3, egg.id);
      const current = Array.isArray(egg.knowledge) ? egg.knowledge : [];
      for (const record of records) {
        if (current.some(item => item?.key === record.key)) continue;
        current.push({ kind: 'fact', key: record.key, label: `${record.domainLabel}: ${record.label}. ${record.principle}`, confidence: .7, source: 'Atlas Ω', createdAt: Date.now() });
      }
      egg.knowledge = current.slice(-12);
    }
    this.collective.injections = Math.min(9999, this.collective.injections + 1);
    this.collective.lastSyncYear = +this.year.toFixed(1);
    this.logEvent(`Año ${this.year.toFixed(1)}`, `Atlas Ω sincronizado: ${KNOWLEDGE_ATLAS.length} cápsulas seguras disponibles y ${learned} aprendizajes individuales reforzados.`);
    return { learned, ...this.getCollectiveMetrics() };
  }

  requestCollectiveProject(type, prompt) {
    const clean = sanitizeCollectivePrompt(prompt);
    return this.workshop.queueProject(type, clean, this);
  }

  syncCollectiveKnowledge() {
    if (!this.collective.enabled || !this.creatures.length) return 0;
    const candidates = this.creatures.filter(creature => creature && !creature.dead);
    if (!candidates.length) return 0;
    const target = candidates[Math.floor((this.time * 7 + this.totalBirths) % candidates.length)];
    const learned = this.seedCreatureKnowledge(target, 1);
    const source = candidates.find(creature => creature !== target && creature.knowledge?.length);
    if (source && target?.learnKnowledge) {
      const item = source.knowledge[Math.floor((this.time + source.age) % source.knowledge.length)];
      target.learnKnowledge(item, 'mente colectiva');
    }
    this.collective.lastSyncYear = +this.year.toFixed(1);
    return learned;
  }

  getCollectiveMetrics() {
    // Caché breve: recorrer todas las criaturas y su conocimiento cuesta hasta ~8 ms con
    // población máxima, y lo llaman la civilización (cada 0,75 s), la UI (cada ~1 s) y el
    // aprendizaje. Los valores son agregados suavizados: 0,35 s de antigüedad es invisible.
    if (this._metricsCache && this.time - this._metricsCache.at < .35 && this._metricsCache.pop === this.creatures.length) {
      return this._metricsCache.value;
    }
    const living = this.creatures.filter(creature => creature && !creature.dead);
    const roles = new Set(living.map(creature => deriveSkill(creature)));
    const keys = new Set(this.collective.unlockedKeys);
    for (const creature of living) for (const item of creature.knowledge || []) if (item?.key) keys.add(item.key);
    const domains = new Set([...keys].map(key => String(key).split(':')[1]).filter(Boolean));
    const collaborations = living.reduce((sum, creature) => sum + Math.max(0, finiteOr(creature.experience?.collaborations, 0)), 0);
    const synergy = clamp((Math.log2(living.length + 1) * .14 + roles.size * .035 + Math.sqrt(collaborations) * .025) * this.autonomyLevel, 0, 1);
    const index = Math.round(Math.min(999, 18 + Math.log2(living.length + 1) * 24 + roles.size * 9 + Math.sqrt(keys.size) * 8 + Math.sqrt(collaborations) * 5 + this.workshop.obras.length * 2));
    const value = {
      population: living.length, roles: roles.size, uniqueKnowledge: keys.size, domains: domains.size,
      synergy, index, queuedProjects: this.workshop.requests.length, activeTeams: this.workshop.teams.filter(team => !team.dissolved).length,
      completedProjects: this.collective.completedProjects
    };
    this._metricsCache = { at: this.time, pop: this.creatures.length, value };
    return value;
  }

  getMutationPressure(multiplier = 1) {
    return Math.max(.01, finiteOr(multiplier, 1) * this.environmentMutation * finiteOr(this.getBiome().mutationFactor, 1));
  }

  recordDiscovery(creature, discovery) {
    if (!creature || !discovery || typeof discovery !== 'object') return false;
    const key = String(discovery.key ?? '').slice(0, 80);
    const label = String(discovery.label ?? '').replace(/[<>]/g, '').slice(0, 180);
    if (!key || !label || this.worldDiscoveries.some(item => item.key === key)) return false;
    const item = {
      id: uid(), key, label,
      creatureId: creature.id,
      creatureCode: creature.entityCode || creature.name,
      biome: this.biome,
      year: +this.year.toFixed(1),
      x: Math.round(clamp(finiteOr(discovery.x, creature.x), 0, CONFIG.WORLD_WIDTH)),
      y: Math.round(clamp(finiteOr(discovery.y, creature.y), 0, CONFIG.WORLD_HEIGHT)),
      createdAt: Date.now()
    };
    this.worldDiscoveries.push(item);
    if (this.worldDiscoveries.length > 120) this.worldDiscoveries.shift();
    if (this.worldDiscoveries.length <= 8 || this.worldDiscoveries.length % 8 === 0) {
      this.logEvent(`Año ${this.year.toFixed(1)}`, `${item.creatureCode} ha descubierto «${item.label}».`);
    }
    return true;
  }

  update(realDt) {
    if (this.paused) return;
    const safeRealDt = clamp(finiteOr(realDt, 0), 0, .1);
    const totalDt = safeRealDt * clamp(finiteOr(this.speed, 1), .25, 24);
    const steps = Math.max(1, Math.ceil(totalDt / .035));
    const dt = totalDt / steps;
    const budgetMs = 24;
    const start = (typeof performance !== 'undefined' ? performance : Date).now();
    let executed = 0;
    for (let step = 0; step < steps; step++) {
      this.step(dt);
      executed++;
      if ((typeof performance !== 'undefined' ? performance : Date).now() - start > budgetMs && executed < steps) {
        this.step(dt * (steps - executed));
        break;
      }
    }
  }

  step(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    this.time += dt;
    this.year = this.time / CONFIG.YEAR_SECONDS;
    this.updateBiomeCycle();
    const biome = this.getBiome();
    this.temperature = biome.temperatureBase
      + Math.sin(this.year * .63) * biome.temperatureSwing
      + Math.sin(this.year * .13) * biome.temperatureSwing * .45;
    this.births = 0;
    this.deaths = 0;
    this.senseInterval = clamp(.08 + this.creatures.length / 5000, .08, .32);
    this.updateEggs();
    this.rebuildGrids();

    const snapshot = this.creatures;
    for (let i = 0; i < snapshot.length; i++) {
      const creature = snapshot[i];
      if (creature instanceof Creature) creature.update(dt, this);
    }
    this.creatures = this.creatures.filter(creature => creature instanceof Creature && !creature.dead);
    this.food = this.food.filter(resource => resource && !resource.eaten && resource.life > 0);
    for (const resource of this.food) resource.life -= dt * .04;
    this.spawnFood(dt);
    this.updateSanctuaries(dt);
    this.pruneSpecies();
    this.updateGenesisPhase();
    this.workshop.update(dt, this);
    this.civilization.update(dt, this);
    this.legacy.update(dt, this);
    this.grandProjects.update(dt, this);
    this.collectiveSyncTimer += dt;
    if (this.collectiveSyncTimer >= 4.5) {
      this.collectiveSyncTimer = 0;
      this.syncCollectiveKnowledge();
    }

    if (this.time - this.lastHistoryTime > 1.2) {
      this.populationHistory.push(this.creatures.length);
      if (this.populationHistory.length > CONFIG.HISTORY_LIMIT) this.populationHistory.shift();
      this.lastHistoryTime = this.time;
    }
  }

  rebuildGrids() {
    this.creatureGrid.clear();
    this.foodGrid.clear();
    for (const creature of this.creatures) if (creature instanceof Creature && !creature.dead) this.creatureGrid.insert(creature);
    for (const resource of this.food) if (resource && !resource.eaten) this.foodGrid.insert(resource);
  }

  spawnFood(dt) {
    const room = Math.max(0, CONFIG.MAX_FOOD - this.food.length);
    const climateFactor = clamp(1 - Math.abs(this.temperature - 18) / 28, .18, 1.2);
    const rate = CONFIG.BASE_FOOD_SPAWN * this.foodAbundance * this.getBiome().foodFactor * climateFactor * dt;
    let count = Math.min(room, Math.floor(rate));
    if (chance(rate - count)) count++;
    for (let i = 0; i < count; i++) this.addFood(rand(0, CONFIG.WORLD_WIDTH), rand(0, CONFIG.WORLD_HEIGHT), rand(16, 42));
  }

  addFood(x, y, energy = 28) {
    if (this.food.length >= CONFIG.MAX_FOOD) return false;
    const safeEnergy = clamp(finiteOr(energy, 28), 1, 120);
    this.food.push({
      id: uid(), x: clamp(finiteOr(x, 0), 0, CONFIG.WORLD_WIDTH), y: clamp(finiteOr(y, 0), 0, CONFIG.WORLD_HEIGHT),
      energy: safeEnergy, radius: 2.3 + safeEnergy * .025, life: rand(100, 260), eaten: false
    });
    return true;
  }

  addFoodBurst(x, y, amount = 45, radius = 120) {
    const safeAmount = Math.min(250, Math.max(0, Math.floor(finiteOr(amount, 45))));
    const safeRadius = clamp(finiteOr(radius, 120), 0, 500);
    for (let i = 0; i < safeAmount; i++) {
      const angle = rand(0, Math.PI * 2);
      const distance = Math.sqrt(Math.random()) * safeRadius;
      this.addFood(
        clamp(x + Math.cos(angle) * distance, 0, CONFIG.WORLD_WIDTH),
        clamp(y + Math.sin(angle) * distance, 0, CONFIG.WORLD_HEIGHT),
        rand(20, 48)
      );
    }
  }

  consumeFood(creature, resource) {
    if (!creature || !resource || resource.eaten) return;
    resource.eaten = true;
    creature.energy = Math.min(creature.maxEnergy, creature.energy + resource.energy * creature.genome.efficiency);
    creature.lastMeal = 0;
    if (creature.experience) creature.experience.meals++;
  }

  createEgg(data = {}) {
    if (this.eggs.length >= CONFIG.MAX_EGGS || this.creatures.length + this.eggs.length >= CONFIG.MAX_CREATURES) return null;
    const source = data && typeof data === 'object' ? data : {};
    const laidAt = Math.max(0, finiteOr(source.laidAt, this.time));
    const defaultIncubation = rand(CONFIG.EGG_INCUBATION_MIN, CONFIG.EGG_INCUBATION_MAX);
    const hatchAt = source.hatchAt === Infinity ? Infinity : Math.max(laidAt + .5, finiteOr(source.hatchAt, laidAt + defaultIncubation));
    const egg = {
      id: typeof source.id === 'string' && source.id ? source.id : uid(),
      x: clamp(finiteOr(source.x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH),
      y: clamp(finiteOr(source.y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT),
      genome: sanitizeGenome(source.genome),
      speciesId: Math.max(1, Math.floor(finiteOr(source.speciesId, 1))),
      generation: Math.max(0, Math.floor(finiteOr(source.generation, 0))),
      parents: Array.isArray(source.parents) ? source.parents.filter(id => typeof id === 'string').slice(0, 2) : [],
      energy: clamp(finiteOr(source.energy, 62), 20, 200),
      appearance: source.appearance && typeof source.appearance === 'object' ? source.appearance : null,
      knowledge: Array.isArray(source.knowledge) ? source.knowledge : [],
      bond: clamp(finiteOr(source.bond, 0), 0, 1),
      founder: Boolean(source.founder),
      name: typeof source.name === 'string' ? source.name.slice(0, 24) : '',
      entityCode: typeof source.entityCode === 'string' ? source.entityCode : this.allocateEntityCode(),
      laidAt,
      hatchAt,
      wobble: rand(0, Math.PI * 2)
    };
    this.eggs.push(egg);
    return egg;
  }

  allocateEntityCode() {
    const code = `Ω-${String(this.nextEntityNumber).padStart(3, '0')}`;
    this.nextEntityNumber++;
    return code;
  }

  updateEggs() {
    if (!this.eggs.length) return;
    const ready = this.eggs.filter(egg => Number.isFinite(egg.hatchAt) && this.time >= egg.hatchAt);
    if (!ready.length) return;
    for (const egg of ready) this.hatchEgg(egg);
    const ids = new Set(ready.map(egg => egg.id));
    this.eggs = this.eggs.filter(egg => !ids.has(egg.id));
  }

  hatchEgg(egg) {
    if (!egg || this.creatures.length >= CONFIG.MAX_CREATURES) return null;
    const creature = new Creature({
      x: egg.x + rand(-5, 5), y: egg.y + rand(-5, 5), genome: egg.genome, speciesId: egg.speciesId,
      generation: egg.generation, parents: egg.parents, energy: egg.energy, appearance: egg.appearance,
      knowledge: egg.knowledge, bond: egg.bond, isFounder: egg.founder,
      name: egg.name || undefined, entityCode: egg.entityCode, reproductionCooldown: egg.founder ? 2 : rand(3, 7)
    });
    deriveSkill(creature);
    this.seedCreatureKnowledge(creature, egg.founder ? 8 : 3);
    this.creatures.push(creature);
    this.births++;
    this.totalBirths++;
    const species = this.species.get(creature.speciesId);
    if (species) {
      species.births++;
      species.extinct = false;
      species.maxGeneration = Math.max(species.maxGeneration, creature.generation);
    }
    if (egg.founder) {
      this.genesis.founderId = creature.id;
      this.genesis.phase = 'childhood';
      this.logEvent(`Año ${this.year.toFixed(1)}`, 'Ω-001 ha eclosionado. Es el único ser vivo y el origen de todas las generaciones futuras.');
      this.civilization.recordChronicle(this.year, 'origen', 'Ω-001 despierta. Comienza la historia consciente del linaje.', creature.id);
    } else {
      if (!this.genesis.firstDescendantId && creature.generation > 0) {
        this.genesis.firstDescendantId = creature.id;
        this.logEvent(`Año ${this.year.toFixed(1)}`, `${creature.entityCode} ha nacido. Por primera vez, Ω-001 ya no está solo.`);
        this.civilization.recordChronicle(this.year, 'linaje', `${creature.entityCode} nace. La memoria ya puede viajar entre dos seres.`, creature.id);
      } else {
        this.logEvent(`Año ${this.year.toFixed(1)}`, `Ha nacido ${creature.entityCode}, generación ${creature.generation}.`);
      }
    }
    if ([10, 25, 50, 100, 250, 500].includes(this.totalBirths)) {
      this.civilization.recordChronicle(this.year, 'población', `El linaje alcanza ${this.totalBirths} nacimientos acumulados.`, String(this.totalBirths));
    }
    this.legacy?.onBirth?.(creature, this);
    this.onHatch?.(creature, egg);
    return creature;
  }

  tryPrimordialReproduction(creature) {
    if (!creature?.isFounder || this.creatures.length !== 1 || this.eggs.length || this.genesis.phase === 'dormant' || this.genesis.phase === 'incubating') return false;
    if (creature.age < creature.maturity + 3.2 || creature.reproductionCooldown > 0 || creature.energy < creature.maxEnergy * .72) return false;
    const genome = mutateGenome(creature.genome, this.getMutationPressure(.52));
    const egg = this.createEgg({
      x: creature.x + rand(-10, 10), y: creature.y + rand(-10, 10), genome, speciesId: creature.speciesId,
      generation: 1, parents: [creature.id], energy: 64,
      appearance: combineAppearances(creature.appearance, creature.appearance, this.getMutationPressure(.65)),
      knowledge: inheritKnowledge(creature.knowledge, creature.knowledge, genome.memory),
      bond: creature.bond * .22
    });
    if (!egg) return false;
    creature.energy -= 24;
    creature.reproductionCooldown = 10 / Math.max(.35, creature.genome.fertility);
    this.genesis.phase = 'firstEgg';
    this.logEvent(`Año ${this.year.toFixed(1)}`, `Ω-001 ha generado el primer huevo descendiente (${egg.entityCode}) mediante génesis adaptativa.`);
    return true;
  }

  reproduce(a, b) {
    if (this.creatures.length + this.eggs.length >= CONFIG.MAX_CREATURES || !a || !b || a === b || a.dead || b.dead || a.reproductionCooldown > 0 || b.reproductionCooldown > 0) return null;
    const cost = 19 + (a.genome.size + b.genome.size) * 1.15;
    if (a.energy < cost || b.energy < cost || a.age < a.maturity || b.age < b.maturity) return null;
    const genome = combineGenomes(a.genome, b.genome, this.getMutationPressure());
    let speciesId = a.speciesId;
    const species = this.species.get(speciesId);
    if (!species || geneticDistance(genome, species.founderGenome) > CONFIG.SPECIES_THRESHOLD) {
      speciesId = this.findClosestSpecies(genome) ?? this.createSpecies(genome, a.speciesId, Math.max(a.generation, b.generation) + 1);
    }
    const egg = this.createEgg({
      x: (a.x + b.x) * .5 + rand(-8, 8), y: (a.y + b.y) * .5 + rand(-8, 8), genome, speciesId,
      generation: Math.max(a.generation, b.generation) + 1, parents: [a.id, b.id], energy: 60,
      appearance: combineAppearances(a.appearance, b.appearance, this.getMutationPressure()),
      knowledge: inheritKnowledge(a.knowledge, b.knowledge, genome.memory),
      bond: Math.max(a.bond ?? 0, b.bond ?? 0) * .16
    });
    if (!egg) return null;
    a.energy -= cost * .55;
    b.energy -= cost * .55;
    a.reproductionCooldown = 4.8 / a.genome.fertility + rand(0, 1.5);
    b.reproductionCooldown = 4.8 / b.genome.fertility + rand(0, 1.5);
    return egg.id;
  }

  createSpecies(founderGenome, parentSpeciesId = null, generation = 0) {
    const id = this.nextSpeciesId++;
    this.species.set(id, {
      id, founderGenome: sanitizeGenome(founderGenome), parentSpeciesId,
      bornYear: this.year, births: 0, deaths: 0, maxGeneration: Math.max(0, Math.floor(generation)), extinct: false
    });
    if (parentSpeciesId !== null) {
      this.logEvent(`Año ${this.year.toFixed(1)}`, `Especiación detectada: el Linaje ${String(id).padStart(2, '0')} se separa del Linaje ${String(parentSpeciesId).padStart(2, '0')}.`);
    }
    return id;
  }

  findClosestSpecies(genome) {
    let closest = null;
    let best = Infinity;
    for (const [id, species] of this.species) {
      if (!species || species.extinct) continue;
      const distance = geneticDistance(genome, species.founderGenome);
      if (distance < best) { best = distance; closest = id; }
    }
    return best < CONFIG.SPECIES_THRESHOLD * .76 ? closest : null;
  }

  killCreature(creature, cause) {
    if (!creature || creature.dead) return;
    creature.dead = true;
    this.deaths++;
    this.totalDeaths++;
    const species = this.species.get(creature.speciesId);
    if (species) species.deaths++;
    this.legacy?.onDeath?.(creature, cause, this);
    this.onSelectionInvalidated?.(creature.id);
    if (cause === 'meteorito' && chance(.04)) this.addFood(creature.x, creature.y, 15);
  }

  pruneSpecies() {
    if (this.time - this.lastSpeciesEvent < 3) return;
    const counts = new Map();
    for (const creature of this.creatures) counts.set(creature.speciesId, (counts.get(creature.speciesId) ?? 0) + 1);
    for (const egg of this.eggs) counts.set(egg.speciesId, (counts.get(egg.speciesId) ?? 0) + 1);
    for (const [id, species] of this.species) {
      if (species && !species.extinct && !counts.has(id)) {
        species.extinct = true;
        this.logEvent(`Año ${this.year.toFixed(1)}`, `El Linaje ${String(id).padStart(2, '0')} se ha extinguido.`);
        this.civilization.recordChronicle(this.year, 'extinción', `El Linaje ${String(id).padStart(2, '0')} desaparece del mundo.`, String(id));
        this.lastSpeciesEvent = this.time;
      }
    }
  }

  updateGenesisPhase() {
    if (this.genesis.phase === 'dormant' || this.genesis.phase === 'incubating') return;
    if (!this.creatures.length && !this.eggs.length) {
      if (this.genesis.phase !== 'extinct') this.civilization.recordChronicle(this.year, 'extinción total', 'No queda ningún ser ni huevo. La historia del mundo se detiene.', 'world');
      this.genesis.phase = 'extinct';
      return;
    }
    const founder = this.creatures.find(item => item.id === this.genesis.founderId || item.isFounder);
    if (this.creatures.length >= 2) this.genesis.phase = 'lineage';
    else if (this.eggs.length) this.genesis.phase = 'firstEgg';
    else if (founder && founder.age < founder.maturity) this.genesis.phase = 'childhood';
    else if (founder) this.genesis.phase = 'solitary';
  }

  getGenesisStatus() {
    const founder = this.creatures.find(item => item.id === this.genesis.founderId || item.isFounder);
    const primordial = this.eggs.find(item => item.id === this.genesis.primordialEggId);
    const firstEgg = this.eggs[0];
    if (this.genesis.phase === 'dormant') return { label: 'Huevo primordial', hint: 'Activa el protocolo para despertar a Ω-001.', progress: 0 };
    if (this.genesis.phase === 'incubating') {
      const progress = primordial ? clamp((this.time - primordial.laidAt) / Math.max(.1, primordial.hatchAt - primordial.laidAt), 0, 1) : 1;
      return { label: 'Eclosión de Ω-001', hint: 'El primer ser está formando cuerpo, memoria y voz.', progress };
    }
    if (this.genesis.phase === 'childhood' && founder) return { label: 'Infancia de Ω-001', hint: 'Está aprendiendo a sobrevivir. Háblale y enséñale.', progress: clamp(founder.age / founder.maturity, 0, 1) };
    if (this.genesis.phase === 'solitary' && founder) return { label: 'El primer ser', hint: 'Ω-001 está maduro. Si prospera, generará el primer descendiente.', progress: clamp((founder.energy / founder.maxEnergy - .45) / .4, 0, 1) };
    if (this.genesis.phase === 'firstEgg' && firstEgg) return { label: `Gestación de ${firstEgg.entityCode}`, hint: 'El segundo ser heredará genes, apariencia y parte de la cultura.', progress: clamp((this.time - firstEgg.laidAt) / Math.max(.1, firstEgg.hatchAt - firstEgg.laidAt), 0, 1) };
    if (this.genesis.phase === 'lineage') return { label: 'Linaje en expansión', hint: `${this.creatures.length} seres vivos y ${this.eggs.length} huevos activos.`, progress: clamp(this.creatures.length / 50, 0, 1) };
    return { label: 'Linaje extinguido', hint: 'Puedes reiniciar el mundo o crear un nuevo huevo desde Código Ω.', progress: 0 };
  }

  activeSpeciesCount() { return new Set([...this.creatures.map(creature => creature.speciesId), ...this.eggs.map(egg => egg.speciesId)]).size; }
  maxGeneration() {
    const living = [...this.creatures, ...this.eggs].reduce((max, item) => Math.max(max, item.generation ?? 0), 0);
    const recorded = [...this.species.values()].reduce((max, item) => Math.max(max, item?.maxGeneration ?? 0), 0);
    return Math.max(living, recorded);
  }

  diversity() {
    if (this.creatures.length < 2) return 0;
    const samples = Math.min(80, this.creatures.length * 2);
    let total = 0;
    for (let i = 0; i < samples; i++) {
      const a = this.creatures[randInt(0, this.creatures.length - 1)];
      const b = this.creatures[randInt(0, this.creatures.length - 1)];
      total += geneticDistance(a.genome, b.genome);
    }
    return clamp(total / samples / .45, 0, 1);
  }

  applyRadiation(x, y, radius = 180) {
    let affected = 0;
    const origin = { x, y };
    for (const creature of this.creatures) {
      if (distanceSq(creature, origin) < radius * radius) {
        creature.genome = mutateGenome(creature.genome, this.getMutationPressure(1.8));
        creature.energy -= rand(3, 16);
        affected++;
      }
    }
    for (const egg of this.eggs) {
      if (distanceSq(egg, origin) < radius * radius) { egg.genome = mutateGenome(egg.genome, this.getMutationPressure(1.35)); affected++; }
    }
    this.logEvent(`Año ${this.year.toFixed(1)}`, `Pulso radiactivo: ${affected} organismos o huevos alterados genéticamente.`);
    return affected;
  }

  applyMeteor(x, y, radius = 130) {
    let dead = 0;
    const origin = { x, y };
    for (const creature of this.creatures) {
      if (distanceSq(creature, origin) < radius * radius) { this.killCreature(creature, 'meteorito'); dead++; }
    }
    const eggCount = this.eggs.length;
    this.eggs = this.eggs.filter(egg => distanceSq(egg, origin) > radius * radius);
    dead += eggCount - this.eggs.length;
    this.creatures = this.creatures.filter(creature => !creature.dead);
    this.food = this.food.filter(resource => distanceSq(resource, origin) > radius * radius);
    this.logEvent(`Año ${this.year.toFixed(1)}`, `Impacto de meteorito: ${dead} vidas o gestaciones perdidas.`);
    return dead;
  }

  addSanctuary(x, y) {
    this.sanctuaries.push({ x: clamp(x, 0, CONFIG.WORLD_WIDTH), y: clamp(y, 0, CONFIG.WORLD_HEIGHT), radius: 150, life: 60 });
    this.addFoodBurst(x, y, 85, 145);
    this.logEvent(`Año ${this.year.toFixed(1)}`, 'Se ha creado un santuario de alta fertilidad.');
  }

  updateSanctuaries(dt) {
    for (const sanctuary of this.sanctuaries) {
      sanctuary.life -= dt;
      if (chance(dt * 2.4 * this.foodAbundance)) {
        this.addFood(sanctuary.x + rand(-sanctuary.radius, sanctuary.radius), sanctuary.y + rand(-sanctuary.radius, sanctuary.radius), rand(25, 50));
      }
    }
    this.sanctuaries = this.sanctuaries.filter(sanctuary => sanctuary.life > 0);
  }

  spawnCreature(x, y, templateGenome = null) {
    if (this.creatures.length + this.eggs.length >= CONFIG.MAX_CREATURES) return null;
    const safeX = clamp(finiteOr(x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH);
    const safeY = clamp(finiteOr(y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT);
    const genome = templateGenome ? sanitizeGenome(templateGenome) : randomGenome();
    const speciesId = this.createSpecies(genome, null, 0);
    const egg = this.createEgg({ x: safeX, y: safeY, genome: mutateGenome(genome, this.getMutationPressure(.12)), speciesId, generation: 0, energy: 96, laidAt: this.time, hatchAt: this.time + 3.4 });
    if (!egg) return null;
    this.addFoodBurst(safeX, safeY, 24, 75);
    this.logEvent(`Año ${this.year.toFixed(1)}`, `Intervención externa: el huevo ${egg.entityCode} contiene el Linaje ${String(speciesId).padStart(2, '0')}.`);
    return speciesId;
  }

  evolutionaryPulse() {
    let mutations = 0;
    for (const creature of this.creatures) {
      if (chance(.22)) { creature.genome = mutateGenome(creature.genome, this.getMutationPressure(.7)); mutations++; }
    }
    for (const egg of this.eggs) {
      if (chance(.3)) { egg.genome = mutateGenome(egg.genome, this.getMutationPressure(.55)); mutations++; }
    }
    this.logEvent(`Año ${this.year.toFixed(1)}`, `Pulso evolutivo global: ${mutations} genomas han cambiado.`);
    return mutations;
  }

  logEvent(time, text) {
    const event = { id: uid(), time: String(time).slice(0, 80), text: String(text).slice(0, 500), timestamp: Date.now() };
    this.events.unshift(event);
    if (this.events.length > CONFIG.TIMELINE_LIMIT) this.events.pop();
    this.onEvent?.(event);
  }

  serialize() {
    return {
      version: 11, savedAt: new Date().toISOString(), time: this.time, year: this.year, temperature: this.temperature,
      paused: this.paused, speed: this.speed, environmentMutation: this.environmentMutation, foodAbundance: this.foodAbundance,
      biome: this.biome, autoBiome: this.autoBiome, lastBiomeCycleYear: this.lastBiomeCycleYear,
      autonomyLevel: this.autonomyLevel, worldDiscoveries: this.worldDiscoveries, collective: this.collective,
      nextSpeciesId: this.nextSpeciesId, nextEntityNumber: this.nextEntityNumber, totalBirths: this.totalBirths, totalDeaths: this.totalDeaths,
      genesis: this.genesis, events: this.events, populationHistory: this.populationHistory, species: [...this.species.entries()],
      creatures: this.creatures.map(creature => creature.serialize()), eggs: this.eggs, food: this.food, sanctuaries: this.sanctuaries,
      workshop: this.workshop.serialize(), civilization: this.civilization.serialize(), legacy: this.legacy.serialize(), grandProjects: this.grandProjects.serialize()
    };
  }

  hydrate(data) {
    if (!data || typeof data !== 'object' || ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(Number(data.version)) || !Array.isArray(data.creatures)) {
      throw new Error('Formato de mundo incompatible');
    }

    const creatures = data.creatures
      .filter(candidate => candidate && typeof candidate === 'object')
      .slice(0, CONFIG.MAX_CREATURES)
      .map(candidate => new Creature(candidate))
      .filter(creature => Number.isFinite(creature.x) && Number.isFinite(creature.y) && !creature.dead);
    const eggs = sanitizeEggs(data.eggs);

    const species = new Map();
    if (Array.isArray(data.species)) {
      for (const entry of data.species) {
        if (!Array.isArray(entry) || entry.length !== 2 || !entry[1] || typeof entry[1] !== 'object') continue;
        const id = Math.max(1, Math.floor(finiteOr(entry[0], entry[1].id)));
        if (!Number.isFinite(id)) continue;
        const source = entry[1];
        species.set(id, {
          id, founderGenome: sanitizeGenome(source.founderGenome),
          parentSpeciesId: source.parentSpeciesId == null ? null : Math.max(1, Math.floor(finiteOr(source.parentSpeciesId, 1))),
          bornYear: Math.max(0, finiteOr(source.bornYear, 0)), births: Math.max(0, Math.floor(finiteOr(source.births, 0))),
          deaths: Math.max(0, Math.floor(finiteOr(source.deaths, 0))), maxGeneration: Math.max(0, Math.floor(finiteOr(source.maxGeneration, 0))),
          extinct: Boolean(source.extinct)
        });
      }
    }

    for (const item of [...creatures, ...eggs]) {
      if (!species.has(item.speciesId)) {
        species.set(item.speciesId, {
          id: item.speciesId, founderGenome: { ...item.genome }, parentSpeciesId: null,
          bornYear: 0, births: 0, deaths: 0, maxGeneration: item.generation, extinct: false
        });
      }
    }

    this.time = Math.max(0, finiteOr(data.time, 0));
    this.year = Math.max(0, finiteOr(data.year, this.time / CONFIG.YEAR_SECONDS));
    this.temperature = clamp(finiteOr(data.temperature, 18), -80, 100);
    this.biome = Object.prototype.hasOwnProperty.call(BIOMES, data.biome) ? data.biome : 'origin';
    this.autoBiome = Boolean(data.autoBiome);
    this.lastBiomeCycleYear = Math.max(0, finiteOr(data.lastBiomeCycleYear, this.year));
    this.autonomyLevel = clamp(finiteOr(data.autonomyLevel, .9), .25, 1);
    this.worldDiscoveries = sanitizeDiscoveries(data.worldDiscoveries);
    this.collective = createCollectiveState(data.collective);
    this.collectiveSyncTimer = 0;
    this.paused = Boolean(data.paused);
    this.speed = [1, 4, 12].includes(Number(data.speed)) ? Number(data.speed) : 1;
    this.environmentMutation = clamp(finiteOr(data.environmentMutation, 1), .2, 8);
    this.foodAbundance = clamp(finiteOr(data.foodAbundance, 1), .25, 3);
    this.nextSpeciesId = Math.max(Math.floor(finiteOr(data.nextSpeciesId, 1)), Math.max(0, ...species.keys()) + 1);
    this.nextEntityNumber = Math.max(1, Math.floor(finiteOr(data.nextEntityNumber, inferNextEntityNumber(creatures, eggs))));
    this.totalBirths = Math.max(0, Math.floor(finiteOr(data.totalBirths, creatures.length)));
    this.totalDeaths = Math.max(0, Math.floor(finiteOr(data.totalDeaths, 0)));
    this.genesis = sanitizeGenesis(data.genesis, creatures, eggs);
    this.workshop.hydrate(data.workshop);
    this.civilization.hydrate(data.civilization);
    this.events = sanitizeEvents(data.events);
    this.populationHistory = Array.isArray(data.populationHistory)
      ? data.populationHistory.map(value => Math.max(0, Math.floor(finiteOr(value, 0)))).slice(-CONFIG.HISTORY_LIMIT)
      : [];
    this.species = species;
    this.creatures = creatures;
    this.eggs = eggs;
    this.food = sanitizeFood(data.food);
    this.sanctuaries = sanitizeSanctuaries(data.sanctuaries);
    this.legacy.hydrate(data.legacy);
    this.grandProjects.hydrate(data.grandProjects);
    for (const creature of this.creatures) deriveSkill(creature);
    this.births = 0;
    this.deaths = 0;
    this.lastHistoryTime = this.time;
    this.lastSpeciesEvent = this.time;
    if (this.genesis.phase === 'dormant') this.paused = true;
    this.rebuildGrids();
  }
}

function createCollectiveState(value = {}) {
  const unlocked = Array.isArray(value?.unlockedKeys)
    ? [...new Set(value.unlockedKeys.filter(key => typeof key === 'string').map(key => key.slice(0, 90)).filter(key => atlasRecordByKey(key)))].slice(0, KNOWLEDGE_ATLAS.length)
    : KNOWLEDGE_ATLAS.map(item => item.key);
  return {
    enabled: value?.enabled !== false,
    atlasLoaded: value?.atlasLoaded !== false,
    unlockedKeys: unlocked.length ? unlocked : KNOWLEDGE_ATLAS.map(item => item.key),
    injections: Math.max(0, Math.floor(finiteOr(value?.injections, 1))),
    completedProjects: Math.max(0, Math.floor(finiteOr(value?.completedProjects, 0))),
    lastSyncYear: Math.max(0, finiteOr(value?.lastSyncYear, 0))
  };
}

function createGenesisState() {
  return { phase: 'dormant', primordialEggId: null, founderId: null, firstDescendantId: null, startedAt: null };
}

function sanitizeGenesis(value, creatures, eggs) {
  const valid = new Set(['dormant', 'incubating', 'childhood', 'solitary', 'firstEgg', 'lineage', 'extinct']);
  const founder = creatures.find(item => item.isFounder) ?? creatures[0] ?? null;
  const primordial = eggs.find(item => item.founder) ?? eggs[0] ?? null;
  const phase = valid.has(value?.phase) ? value.phase : creatures.length >= 2 ? 'lineage' : creatures.length === 1 ? (creatures[0].age < creatures[0].maturity ? 'childhood' : 'solitary') : eggs.length ? (primordial?.founder ? 'incubating' : 'firstEgg') : 'extinct';
  return {
    phase,
    primordialEggId: typeof value?.primordialEggId === 'string' ? value.primordialEggId : primordial?.id ?? null,
    founderId: typeof value?.founderId === 'string' ? value.founderId : founder?.id ?? null,
    firstDescendantId: typeof value?.firstDescendantId === 'string' ? value.firstDescendantId : creatures.find(item => item.generation > 0)?.id ?? null,
    startedAt: value?.startedAt == null ? null : Math.max(0, finiteOr(value.startedAt, 0))
  };
}

function inferNextEntityNumber(creatures, eggs) {
  let max = 0;
  for (const item of [...creatures, ...eggs]) {
    const match = String(item.entityCode ?? '').match(/^Ω-(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max + 1;
}

function sanitizeEggs(eggs) {
  if (!Array.isArray(eggs)) return [];
  return eggs.filter(item => item && typeof item === 'object').slice(0, CONFIG.MAX_EGGS).map(item => ({
    id: typeof item.id === 'string' && item.id ? item.id : uid(),
    x: clamp(finiteOr(item.x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH),
    y: clamp(finiteOr(item.y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT),
    genome: sanitizeGenome(item.genome), speciesId: Math.max(1, Math.floor(finiteOr(item.speciesId, 1))),
    generation: Math.max(0, Math.floor(finiteOr(item.generation, 0))),
    parents: Array.isArray(item.parents) ? item.parents.filter(id => typeof id === 'string').slice(0, 2) : [],
    energy: clamp(finiteOr(item.energy, 62), 20, 200), appearance: item.appearance && typeof item.appearance === 'object' ? item.appearance : null,
    knowledge: Array.isArray(item.knowledge) ? item.knowledge : [], bond: clamp(finiteOr(item.bond, 0), 0, 1),
    founder: Boolean(item.founder), name: typeof item.name === 'string' ? item.name.slice(0, 24) : '',
    entityCode: typeof item.entityCode === 'string' ? item.entityCode.slice(0, 20) : '',
    laidAt: Math.max(0, finiteOr(item.laidAt, 0)),
    hatchAt: item.hatchAt === Infinity ? Infinity : Math.max(0, finiteOr(item.hatchAt, 6)),
    wobble: finiteOr(item.wobble, 0)
  }));
}

function sanitizeEvents(events) {
  if (!Array.isArray(events)) return [];
  return events.filter(event => event && typeof event === 'object').slice(0, CONFIG.TIMELINE_LIMIT).map(event => ({
    id: typeof event.id === 'string' ? event.id : uid(),
    time: String(event.time ?? 'Registro').slice(0, 80),
    text: String(event.text ?? '').slice(0, 500),
    timestamp: finiteOr(event.timestamp, Date.now())
  }));
}

function sanitizeFood(food) {
  if (!Array.isArray(food)) return [];
  return food.filter(resource => resource && typeof resource === 'object')
    .slice(0, CONFIG.MAX_FOOD)
    .map(resource => {
      const energy = clamp(finiteOr(resource.energy, 28), 1, 120);
      return {
        id: typeof resource.id === 'string' ? resource.id : uid(),
        x: clamp(finiteOr(resource.x, 0), 0, CONFIG.WORLD_WIDTH), y: clamp(finiteOr(resource.y, 0), 0, CONFIG.WORLD_HEIGHT),
        energy, radius: clamp(finiteOr(resource.radius, 2.3 + energy * .025), 1, 20),
        life: clamp(finiteOr(resource.life, 100), 0, 1000), eaten: Boolean(resource.eaten)
      };
    })
    .filter(resource => !resource.eaten && resource.life > 0);
}

function sanitizeSanctuaries(sanctuaries) {
  if (!Array.isArray(sanctuaries)) return [];
  return sanctuaries.filter(item => item && typeof item === 'object').slice(0, 50).map(item => ({
    x: clamp(finiteOr(item.x, 0), 0, CONFIG.WORLD_WIDTH), y: clamp(finiteOr(item.y, 0), 0, CONFIG.WORLD_HEIGHT),
    radius: clamp(finiteOr(item.radius, 150), 20, 500), life: clamp(finiteOr(item.life, 60), 0, 600)
  })).filter(item => item.life > 0);
}

function sanitizeDiscoveries(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(-120).map(item => ({
    id: typeof item.id === 'string' ? item.id.slice(0, 40) : uid(),
    key: String(item.key ?? '').slice(0, 80),
    label: String(item.label ?? '').replace(/[<>]/g, '').slice(0, 180),
    creatureId: typeof item.creatureId === 'string' ? item.creatureId.slice(0, 40) : '',
    creatureCode: String(item.creatureCode ?? 'Entidad').replace(/[<>]/g, '').slice(0, 40),
    biome: Object.prototype.hasOwnProperty.call(BIOMES, item.biome) ? item.biome : 'origin',
    year: Math.max(0, finiteOr(item.year, 0)),
    x: Math.round(clamp(finiteOr(item.x, 0), 0, CONFIG.WORLD_WIDTH)),
    y: Math.round(clamp(finiteOr(item.y, 0), 0, CONFIG.WORLD_HEIGHT)),
    createdAt: Math.max(0, finiteOr(item.createdAt, 0))
  })).filter(item => item.key && item.label);
}
