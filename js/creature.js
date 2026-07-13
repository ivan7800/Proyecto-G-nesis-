import { BIOMES, CONFIG } from './config.js?v=6.0.1';
import { sanitizeGenome } from './genetics.js?v=6.0.1';
import { angleTo, chance, clamp, distanceSq, finiteOr, hsl, normalizeAngle, rand, uid } from './utils.js?v=6.0.1';

const STATES = new Set([
  'explorar', 'huir', 'buscar alimento', 'buscar pareja', 'recordar', 'imitar', 'aprender', 'comunicar',
  'descansar', 'socializar', 'ayudar', 'investigar', 'migrar', 'crear'
]);
const NAME_START = ['Ari', 'Aster', 'Bri', 'Cora', 'Eli', 'Iko', 'Kai', 'Luma', 'Milo', 'Nara', 'Nexo', 'Nova', 'Orin', 'Rai', 'Sira', 'Tali', 'Vita', 'Yuna', 'Zuri'];
const NAME_END = ['', 'a', 'i', 'o', 'en', 'is', 'um', 'ix'];
const DIRECTIVES = new Map([
  ['avoid_conflict', 'Evitar conflictos innecesarios'],
  ['prioritize_food', 'Priorizar alimento cuando la energía baja'],
  ['explore_more', 'Explorar territorios desconocidos'],
  ['share_knowledge', 'Compartir descubrimientos con el linaje'],
  ['stay_group', 'Mantenerse cerca del grupo'],
  ['flee_early', 'Huir antes cuando aparece un peligro']
]);

export class Creature {
  constructor(data = {}) {
    const source = data && typeof data === 'object' ? data : {};
    this.id = typeof source.id === 'string' && source.id ? source.id : uid();
    this.x = clamp(finiteOr(source.x, CONFIG.WORLD_WIDTH / 2), 0, CONFIG.WORLD_WIDTH);
    this.y = clamp(finiteOr(source.y, CONFIG.WORLD_HEIGHT / 2), 0, CONFIG.WORLD_HEIGHT);
    this.genome = sanitizeGenome(source.genome);
    this.speciesId = Math.max(1, Math.floor(finiteOr(source.speciesId, 1)));
    this.generation = Math.max(0, Math.floor(finiteOr(source.generation, 0)));
    this.parents = Array.isArray(source.parents) ? source.parents.filter(id => typeof id === 'string').slice(0, 2) : [];
    this.isFounder = Boolean(source.isFounder);
    this.entityCode = typeof source.entityCode === 'string' && /^Ω-\d{3,6}$/.test(source.entityCode) ? source.entityCode : null;
    this.energy = clamp(finiteOr(source.energy, 85), 0, 1000);
    this.age = Math.max(0, finiteOr(source.age, 0));
    this.angle = finiteOr(source.angle, rand(0, Math.PI * 2));
    this.state = STATES.has(source.state) ? source.state : 'explorar';
    this.dead = Boolean(source.dead);
    this.reproductionCooldown = Math.max(0, finiteOr(source.reproductionCooldown, rand(2, 8)));
    this.memory = sanitizeMemory(source.memory);
    this.lastMeal = Math.max(0, finiteOr(source.lastMeal, 0));
    this.wanderBias = clamp(finiteOr(source.wanderBias, rand(-1, 1)), -1, 1);

    this.name = sanitizeName(source.name) || (this.isFounder ? 'Ω-001' : createEntityName(this.id, this.genome.hue));
    this.appearance = sanitizeAppearance(source.appearance, this.genome, this.id);
    this.knowledge = sanitizeKnowledge(source.knowledge);
    this.dialogue = sanitizeDialogue(source.dialogue);
    this.bond = clamp(finiteOr(source.bond, 0), 0, 1);
    this.voiceIndex = Math.max(0, Math.floor(finiteOr(source.voiceIndex, seededUnit(`${this.id}:voice`) * 8)));
    this.experience = sanitizeExperience(source.experience);
    this.skill = typeof source.skill === 'string' && /^[a-z]{4,16}$/.test(source.skill) ? source.skill : null;
    this.mood = sanitizeText(source.mood, 30) || 'expectante';
    this.goal = sanitizeText(source.goal, 60) || 'conocer el mundo';
    this.autonomy = clamp(finiteOr(source.autonomy, .55 + this.genome.curiosity * .28 + (1 - this.genome.sociability) * .12), .25, 1);
    this.home = sanitizePoint(source.home, this.x, this.y);
    this.relationships = sanitizeRelationships(source.relationships);
    this.visitedCells = sanitizeStringList(source.visitedCells, 96, 20);
    this.discoveries = sanitizeKnowledge(source.discoveries).slice(-24);
    this.innerTimer = Math.max(0, finiteOr(source.innerTimer, rand(.2, 1.4)));
    this.socialCooldown = Math.max(0, finiteOr(source.socialCooldown, 0));
    this.lastSpeech = '';
    this.speechUntil = 0;
    this.senseTimer = 0;
    this.sensedFood = [];
    this.sensedCreatures = [];
  }

  get radius() { return this.genome.size; }
  get maturity() { return 8 + this.genome.size * .55; }
  get growthScale() {
    if (this.age >= this.maturity) return this.age > this.genome.longevity * .82 ? .96 : 1;
    return clamp(.5 + (this.age / Math.max(1, this.maturity)) * .5, .5, 1);
  }
  get lifeStage() {
    if (this.age < this.maturity * .32) return 'cría';
    if (this.age < this.maturity) return 'juvenil';
    if (this.age > this.genome.longevity * .82) return 'anciano';
    return 'adulto';
  }
  get visualRadius() { return this.radius * (3.7 + this.appearance.fluff * .35) * this.growthScale; }
  get maxEnergy() { return 105 + this.genome.size * 6; }
  get color() { return hsl(this.genome.hue, 78, 62); }
  get personality() {
    const g = this.genome;
    if (g.sociability > .76 && g.aggression < .35) return 'Empático';
    if (g.curiosity > .78 && g.memory > .62) return 'Investigador';
    if (g.aggression > .72) return 'Territorial';
    if (g.efficiency > 1.28 && g.metabolism < .85) return 'Prudente';
    if (g.speed > 1.55) return 'Impulsivo';
    if (g.memory > .78) return 'Analítico';
    return 'Curioso';
  }

  update(dt, simulation) {
    if (this.dead || !Number.isFinite(dt) || dt <= 0) return;
    const g = this.genome;
    const directives = this.directiveSet();
    const biome = simulation.getBiome?.() ?? BIOMES.origin;
    const freedom = clamp(finiteOr(simulation.autonomyLevel, .9) * this.autonomy, .2, 1);

    this.age += dt;
    this.reproductionCooldown = Math.max(0, this.reproductionCooldown - dt);
    this.socialCooldown = Math.max(0, this.socialCooldown - dt);
    this.lastMeal += dt;
    this.innerTimer -= dt;

    const climateCost = 1 + Math.abs(simulation.temperature - 18) * .012;
    this.energy -= dt * (.38 + g.metabolism * .48 + g.speed * .08 + g.size * .03) * climateCost / Math.max(.1, g.efficiency);
    if (this.energy <= 0 || this.age > g.longevity) {
      simulation.killCreature(this, this.energy <= 0 ? 'inanición' : 'longevidad');
      return;
    }

    simulation.tryPrimordialReproduction?.(this);

    const vision = g.vision;
    this.senseTimer -= dt;
    if (this.senseTimer <= 0) {
      const socialRange = this.age > this.maturity ? vision * 2.6 : vision * .9;
      this.sensedFood = simulation.foodGrid.query(this.x, this.y, vision);
      this.sensedCreatures = simulation.creatureGrid.query(this.x, this.y, socialRange);
      this.senseTimer = simulation.senseInterval * (.7 + ((this.id.charCodeAt(0) + this.id.charCodeAt(this.id.length - 1)) % 13) / 20);
    }

    let targetFood = null;
    let bestFoodScore = Infinity;
    for (const food of this.sensedFood) {
      if (!food || food.eaten || food.life <= 0) continue;
      const score = distanceSq(this, food) / Math.max(.1, finiteOr(food.energy, 1));
      if (score < bestFoodScore) { bestFoodScore = score; targetFood = food; }
    }

    let threat = null;
    let mate = null;
    let friend = null;
    let vulnerableKin = null;
    let threatD2 = Infinity;
    let mateD2 = Infinity;
    let friendD2 = Infinity;
    let vulnerableD2 = Infinity;
    const caution = directives.has('flee_early') ? 1.02 : 1.18;
    const aggressionLimit = directives.has('avoid_conflict') ? .46 : .62;
    const threatRange = (vision * .72) ** 2;
    for (const other of this.sensedCreatures) {
      if (!other || other === this || other.dead) continue;
      const d2 = distanceSq(this, other);
      const sameSpecies = other.speciesId === this.speciesId;
      if (d2 < threatRange && d2 < threatD2 && other.genome.size > g.size * caution && other.genome.aggression > aggressionLimit) {
        threat = other; threatD2 = d2;
      }
      if (sameSpecies && d2 < friendD2) { friend = other; friendD2 = d2; }
      if (sameSpecies && other.energy < other.maxEnergy * .28 && d2 < vulnerableD2) { vulnerableKin = other; vulnerableD2 = d2; }
      if (sameSpecies && d2 < mateD2 && other.age > other.maturity && other.energy > other.maxEnergy * .63 && other.reproductionCooldown <= 0) {
        mate = other; mateD2 = d2;
      }
    }

    if (this.innerTimer <= 0) {
      this.refreshMind(simulation, { threat, targetFood, mate, friend, vulnerableKin });
      this.observeTerritory(simulation);
      this.innerTimer = rand(.9, 2.1) / Math.max(.55, g.curiosity);
    }

    let desiredAngle = this.angle;
    let speedFactor = 1;
    const hungerThreshold = directives.has('prioritize_food') ? .76 : .64;
    const canHelp = vulnerableKin && this.energy > this.maxEnergy * .76 && g.sociability > .58 && this.socialCooldown <= 0;

    if (threat && (g.aggression < .78 || directives.has('avoid_conflict'))) {
      this.state = 'huir';
      this.mood = 'alarmado';
      this.goal = 'ponerse a salvo';
      desiredAngle = angleTo(threat, this) + rand(-.18, .18);
      speedFactor = 1.45;
      this.remember('danger', threat.x, threat.y, g.memory);
    } else if (this.energy < this.maxEnergy * hungerThreshold && targetFood) {
      this.state = 'buscar alimento';
      this.goal = 'recuperar energía';
      desiredAngle = angleTo(this, targetFood);
      this.remember('food', targetFood.x, targetFood.y, g.memory);
    } else if (canHelp) {
      this.state = 'ayudar';
      this.goal = `ayudar a ${vulnerableKin.name}`;
      desiredAngle = angleTo(this, vulnerableKin);
      if (vulnerableD2 < (this.visualRadius + vulnerableKin.visualRadius + 18) ** 2) {
        const gift = Math.min(14, Math.max(0, this.energy - this.maxEnergy * .66));
        if (gift > 2) {
          this.energy -= gift;
          vulnerableKin.energy = Math.min(vulnerableKin.maxEnergy, vulnerableKin.energy + gift * .9);
          this.bond = clamp(this.bond + .018, 0, 1);
          vulnerableKin.bond = clamp(vulnerableKin.bond + .025, 0, 1);
          this.strengthenRelationship(vulnerableKin.id, .08);
          vulnerableKin.strengthenRelationship?.(this.id, .1);
          this.socialCooldown = rand(5, 10);
          this.speakAutonomously(`He compartido energía con ${vulnerableKin.name}.` , simulation);
        }
      }
    } else if (this.energy > this.maxEnergy * .7 && this.age > this.maturity && mate && this.reproductionCooldown <= 0) {
      this.state = 'buscar pareja';
      this.goal = 'continuar el linaje';
      desiredAngle = angleTo(this, mate);
      if (distanceSq(this, mate) < (this.radius + mate.radius + 5) ** 2) simulation.reproduce(this, mate);
    } else if (friend && g.sociability > .62 && this.socialCooldown <= 0 && chance(dt * (.035 + g.sociability * .05))) {
      this.state = 'socializar';
      this.goal = `fortalecer vínculo con ${friend.name}`;
      desiredAngle = angleTo(this, friend);
      speedFactor = .72;
      if (friendD2 < (this.visualRadius + friend.visualRadius + 28) ** 2) {
        this.bond = clamp(this.bond + dt * .016, 0, 1);
        friend.bond = clamp(friend.bond + dt * .012, 0, 1);
        this.strengthenRelationship(friend.id, dt * .04);
        friend.strengthenRelationship?.(this.id, dt * .035);
        if (chance(g.memory * g.sociability * .16)) this.exchangeKnowledge(friend, simulation);
        this.socialCooldown = rand(2.5, 6);
      }
    } else if (this.energy < this.maxEnergy * .48 && this.memory.food.length && chance(g.memory * .02)) {
      const memory = this.memory.food.at(-1);
      if (memory) {
        this.state = 'recordar';
        this.goal = 'volver a una fuente conocida';
        desiredAngle = Math.atan2(memory.y - this.y, memory.x - this.x);
      }
    } else if (this.energy < this.maxEnergy * .42 && !targetFood) {
      this.state = 'descansar';
      this.goal = 'conservar energía';
      this.mood = 'cansado';
      speedFactor = .16;
      desiredAngle += Math.sin(simulation.time + this.wanderBias) * dt * .12;
    } else {
      const guidedExploration = directives.has('explore_more') && chance(.3 + (1 - freedom) * .45);
      this.state = guidedExploration ? 'aprender' : (g.curiosity > .72 ? 'investigar' : 'explorar');
      this.goal = guidedExploration ? 'seguir una regla aprendida' : 'descubrir territorio';
      const explorationBoost = guidedExploration ? 1.42 : 1;
      desiredAngle += (Math.sin(simulation.time * .7 + this.wanderBias * 8) * .55 + rand(-.45, .45) * freedom) * dt * (1.3 + g.curiosity * explorationBoost);
      speedFactor = .68 + g.curiosity * .35;
      if (friend && g.sociability > .45) {
        const groupWeight = directives.has('stay_group') ? .18 : .095;
        const effectiveWeight = groupWeight * (1.15 - freedom * .35);
        desiredAngle = desiredAngle * (1 - g.sociability * effectiveWeight) + angleTo(this, friend) * g.sociability * effectiveWeight;
        const learned = friend.memory?.food?.at(-1);
        if (learned && chance(g.sociability * g.memory * dt * .22)) {
          this.remember('food', learned.x, learned.y, g.memory);
          this.state = 'imitar';
        }
        if (friend.knowledge?.length && chance(g.sociability * g.memory * dt * (directives.has('share_knowledge') ? .18 : .08))) {
          if (this.exchangeKnowledge(friend, simulation)) this.state = 'comunicar';
        }
      }
    }

    this.angle += normalizeAngle(desiredAngle - this.angle) * Math.min(1, dt * (2.4 + g.curiosity));
    const speed = 28 * g.speed * speedFactor * finiteOr(biome.movementFactor, 1);
    this.x += Math.cos(this.angle) * speed * dt;
    this.y += Math.sin(this.angle) * speed * dt;

    if (this.x < 0 || this.x > CONFIG.WORLD_WIDTH) { this.angle = Math.PI - this.angle; this.x = clamp(this.x, 0, CONFIG.WORLD_WIDTH); }
    if (this.y < 0 || this.y > CONFIG.WORLD_HEIGHT) { this.angle = -this.angle; this.y = clamp(this.y, 0, CONFIG.WORLD_HEIGHT); }

    if (targetFood && distanceSq(this, targetFood) < (this.radius + targetFood.radius + 3) ** 2) simulation.consumeFood(this, targetFood);
  }

  refreshMind(simulation, context = {}) {
    const energyRatio = this.energy / Math.max(1, this.maxEnergy);
    if (context.threat) this.mood = 'alarmado';
    else if (energyRatio < .3) this.mood = 'agotado';
    else if (context.vulnerableKin && this.genome.sociability > .6) this.mood = 'protector';
    else if (this.bond > .72) this.mood = 'confiado';
    else if (this.genome.curiosity > .75) this.mood = 'intrigado';
    else if (energyRatio > .82) this.mood = 'vital';
    else this.mood = 'sereno';

    if (context.threat) this.goal = 'ponerse a salvo';
    else if (energyRatio < .55) this.goal = 'encontrar energía';
    else if (context.vulnerableKin && this.genome.sociability > .58) this.goal = 'proteger al linaje';
    else if (context.mate && this.age > this.maturity) this.goal = 'continuar el linaje';
    else if (context.friend && this.genome.sociability > .7) this.goal = 'compartir conocimiento';
    else this.goal = this.genome.curiosity > .66 ? 'descubrir algo nuevo' : 'mantenerse estable';
  }

  observeTerritory(simulation) {
    const cellSize = 180;
    const cellX = Math.floor(this.x / cellSize);
    const cellY = Math.floor(this.y / cellSize);
    const biomeKey = simulation.biome ?? 'origin';
    const cellKey = `${biomeKey}:${cellX}:${cellY}`;
    if (this.visitedCells.includes(cellKey)) return false;
    this.visitedCells.push(cellKey);
    if (this.visitedCells.length > 96) this.visitedCells.shift();

    const biome = simulation.getBiome?.() ?? BIOMES.origin;
    const discoveries = [
      `Ruta fértil en ${biome.label}`,
      `Refugio natural en ${biome.label}`,
      `Zona de energía en ${biome.label}`,
      `Patrón climático de ${biome.label}`,
      `Territorio nuevo del cuadrante ${cellX}-${cellY}`
    ];
    const index = Math.floor(seededUnit(`${this.id}:${cellKey}`) * discoveries.length);
    const label = `${discoveries[index]} · X ${Math.round(this.x)}, Y ${Math.round(this.y)}`;
    const key = `discovery:${cellKey}`;
    const learned = this.learnKnowledge({ kind: 'fact', key, label, confidence: .48 + this.genome.memory * .38, createdAt: Date.now() }, 'exploración');
    if (!learned) return false;
    this.discoveries.push({ kind: 'fact', key, label, confidence: .7, source: 'exploración', createdAt: Date.now() });
    if (this.discoveries.length > 24) this.discoveries.shift();
    if (simulation.recordDiscovery?.(this, { key, label, x: this.x, y: this.y })) {
      this.experience.discoveries = Math.min(9999, (this.experience.discoveries || 0) + 1);
      if (chance(.22 + this.genome.curiosity * .28)) this.speakAutonomously(`He descubierto ${label.toLowerCase()}.`, simulation);
    }
    return true;
  }

  strengthenRelationship(id, amount) {
    if (typeof id !== 'string' || !id || id === this.id) return;
    const current = clamp(finiteOr(this.relationships[id], 0) + finiteOr(amount, 0), 0, 1);
    this.relationships[id] = current;
    const entries = Object.entries(this.relationships);
    if (entries.length > 24) {
      entries.sort((a, b) => b[1] - a[1]);
      this.relationships = Object.fromEntries(entries.slice(0, 24));
    }
  }

  exchangeKnowledge(other, simulation) {
    if (!other?.knowledge?.length) return false;
    const item = other.knowledge[Math.floor(Math.random() * other.knowledge.length)];
    if (!this.learnKnowledge(item, 'social')) return false;
    this.experience.socialLearns++;
    this.strengthenRelationship(other.id, .025);
    if (chance(.18)) this.speakAutonomously(`He aprendido algo de ${other.name}.`, simulation);
    return true;
  }

  speakAutonomously(text, simulation) {
    const clean = sanitizeText(text, 220);
    if (!clean || clean === this.lastSpeech) return;
    this.lastSpeech = clean;
    this.speechUntil = finiteOr(simulation?.time, 0) + 7;
    this.addDialogue('creature', clean);
  }

  directiveSet() {
    return new Set(this.knowledge.filter(item => item.kind === 'directive').map(item => item.key));
  }

  remember(type, x, y, capacity) {
    const list = this.memory[type];
    if (!Array.isArray(list) || !Number.isFinite(x) || !Number.isFinite(y)) return;
    list.push({ x, y, t: Date.now() });
    const max = Math.max(2, Math.round(capacity * 14));
    if (list.length > max) list.splice(0, list.length - max);
  }

  learnKnowledge(record, source = 'experiencia') {
    if (!record || typeof record !== 'object') return false;
    const clean = sanitizeKnowledge([record])[0];
    if (!clean) return false;
    const existing = this.knowledge.find(item => item.kind === clean.kind && item.key === clean.key);
    if (existing) {
      const previous = existing.confidence;
      existing.confidence = clamp(Math.max(existing.confidence, clean.confidence) + .02, 0, 1);
      existing.updatedAt = Date.now();
      return existing.confidence > previous;
    }
    clean.source = sanitizeText(source, 28) || 'experiencia';
    this.knowledge.push(clean);
    const max = Math.max(8, Math.round(8 + this.genome.memory * 22));
    if (this.knowledge.length > max) this.knowledge.splice(0, this.knowledge.length - max);
    return true;
  }

  teach(input, simulation) {
    const text = sanitizeText(input, 240);
    if (!text) return { response: 'No he recibido ninguna instrucción.', learned: false };
    const normalized = normalizeText(text);
    this.state = 'aprender';
    this.bond = clamp(this.bond + .025 + this.genome.sociability * .018, 0, 1);
    this.experience.userLessons++;
    this.addDialogue('user', text);

    const nameMatch = text.match(/(?:te llamas|tu nombre es|ll[aá]mate)\s+([\p{L}0-9_-]{2,18})/iu);
    if (nameMatch) {
      this.name = sanitizeName(nameMatch[1]) || this.name;
      return this.finishTeaching(`He aprendido mi nombre. Soy ${this.name}.`, true, simulation);
    }

    if (/como te llamas|cual es tu nombre|quien eres/.test(normalized)) {
      return this.finishTeaching(`Soy ${this.name}${this.entityCode && this.entityCode !== this.name ? `, registro ${this.entityCode}` : ''}. Soy ${this.lifeStage} y pertenezco al Linaje ${String(this.speciesId).padStart(2, '0')}.`, false, simulation);
    }
    if (/como estas|que sientes|estado/.test(normalized)) {
      const energy = this.energy / this.maxEnergy;
      const mood = energy > .72 ? 'con energía y curiosidad' : energy > .38 ? 'estable, aunque necesito recursos' : 'débil y buscando alimento';
      return this.finishTeaching(`Ahora estoy ${mood}. Estoy ${this.state}.`, false, simulation);
    }
    if (/que sabes|que has aprendido|conocimiento/.test(normalized)) {
      const summary = this.knowledge.slice(-4).map(item => item.label).filter(Boolean);
      const answer = summary.length ? `Recuerdo ${summary.join('; ')}.` : 'Todavía sé poco. Enséñame una regla o déjame observar al linaje.';
      return this.finishTeaching(answer, false, simulation);
    }
    if (/donde.*(comida|alimento)|recuerdas.*(comida|alimento)/.test(normalized)) {
      const known = this.memory.food.at(-1);
      const answer = known ? `La última fuente de energía que recuerdo estaba cerca de X ${Math.round(known.x)}, Y ${Math.round(known.y)}.` : 'Aún no he memorizado una fuente de energía fiable.';
      return this.finishTeaching(answer, false, simulation);
    }

    const scriptMatch = text.match(/si\s+(.+?)\s+(?:entonces|,|:)\s*(.+)/i);
    if (scriptMatch) {
      const condition = sanitizeText(scriptMatch[1], 80);
      const action = sanitizeText(scriptMatch[2], 80);
      const label = `SI ${condition} → ${action}`;
      this.learnKnowledge({ kind: 'script', key: `script:${hashString(label)}`, label, confidence: .72, createdAt: Date.now() }, 'ΩScript natural');
      const linkedDirective = parseDirective(normalizeText(action));
      if (linkedDirective) {
        this.learnKnowledge({ kind: 'directive', key: linkedDirective, label: DIRECTIVES.get(linkedDirective), confidence: .78, createdAt: Date.now() }, 'ΩScript natural');
        return this.finishTeaching(`He guardado el programa: ${label}. También lo he vinculado a una conducta segura del motor: ${DIRECTIVES.get(linkedDirective)}.`, true, simulation);
      }
      return this.finishTeaching(`He guardado el programa: ${label}. Queda en el laboratorio aislado hasta que su acción pueda asociarse a una conducta segura.`, true, simulation);
    }

    const directive = parseDirective(normalized);
    if (directive) {
      const learned = this.learnKnowledge({ kind: 'directive', key: directive, label: DIRECTIVES.get(directive), confidence: .86, createdAt: Date.now() }, 'usuario');
      return this.finishTeaching(`${learned ? 'He incorporado' : 'He reforzado'} la regla: ${DIRECTIVES.get(directive)}. La compartiré si mi carácter y el entorno lo permiten.`, true, simulation);
    }

    const factMatch = text.match(/recuerda(?:\s+que)?\s+(.+)/i);
    if (factMatch) {
      const fact = sanitizeText(factMatch[1], 150);
      this.learnKnowledge({ kind: 'fact', key: `fact:${hashString(fact)}`, label: fact, confidence: .76, createdAt: Date.now() }, 'usuario');
      return this.finishTeaching(`Lo recordaré: ${fact}.`, true, simulation);
    }

    const generic = sanitizeText(text, 140);
    this.learnKnowledge({ kind: 'fact', key: `fact:${hashString(generic)}`, label: generic, confidence: .55, createdAt: Date.now() }, 'conversación');
    return this.finishTeaching(this.personality === 'Investigador'
      ? 'Lo guardaré como hipótesis y buscaré experiencias que lo confirmen.'
      : 'Lo he añadido a mi memoria. Puede cambiar si la experiencia demuestra otra cosa.', true, simulation);
  }

  finishTeaching(response, learned, simulation) {
    const clean = sanitizeText(response, 260);
    this.addDialogue('creature', clean);
    this.lastSpeech = clean;
    this.speechUntil = finiteOr(simulation?.time, 0) + 7;
    return { response: clean, learned };
  }

  addDialogue(role, text) {
    this.dialogue.push({ role: role === 'user' ? 'user' : 'creature', text: sanitizeText(text, 260), at: Date.now() });
    if (this.dialogue.length > 16) this.dialogue.splice(0, this.dialogue.length - 16);
  }

  serialize() {
    return {
      id: this.id, x: this.x, y: this.y, genome: this.genome, speciesId: this.speciesId,
      generation: this.generation, parents: this.parents, energy: this.energy, age: this.age,
      angle: this.angle, state: this.state, dead: this.dead, reproductionCooldown: this.reproductionCooldown,
      memory: this.memory, lastMeal: this.lastMeal, wanderBias: this.wanderBias,
      name: this.name, appearance: this.appearance, knowledge: this.knowledge, dialogue: this.dialogue,
      bond: this.bond, voiceIndex: this.voiceIndex, experience: this.experience,
      isFounder: this.isFounder, entityCode: this.entityCode, skill: this.skill,
      mood: this.mood, goal: this.goal, autonomy: this.autonomy, home: this.home,
      relationships: this.relationships, visitedCells: this.visitedCells, discoveries: this.discoveries,
      innerTimer: this.innerTimer, socialCooldown: this.socialCooldown
    };
  }
}

export function combineAppearances(a, b, mutationStrength = 1) {
  const first = sanitizeAppearance(a, { hue: 180 }, 'a');
  const second = sanitizeAppearance(b, { hue: 180 }, 'b');
  const pick = key => chance(.5) ? first[key] : second[key];
  const mutate = (value, amount, min, max) => clamp(value + (Math.random() - .5) * amount * mutationStrength, min, max);
  return {
    earSize: mutate(pick('earSize'), .16, .72, 1.55),
    eyeSize: mutate(pick('eyeSize'), .12, .78, 1.42),
    fluff: mutate(pick('fluff'), .14, .65, 1.45),
    snout: mutate(pick('snout'), .12, .68, 1.28),
    darkness: mutate(pick('darkness'), .12, .08, .82),
    bellyLight: mutate(pick('bellyLight'), .12, .3, .95),
    accentHue: ((pick('accentHue') + (Math.random() - .5) * 12 * mutationStrength) % 360 + 360) % 360,
    pattern: chance(.08 * mutationStrength) ? Math.floor(rand(0, 4)) : pick('pattern'),
    earTilt: mutate(pick('earTilt'), .18, -.55, .55),
    tail: mutate(pick('tail'), .15, .55, 1.35)
  };
}

export function inheritKnowledge(a, b, memory = .5) {
  const pool = [...sanitizeKnowledge(a), ...sanitizeKnowledge(b)];
  const unique = [];
  for (const item of pool.sort(() => Math.random() - .5)) {
    if (unique.some(entry => entry.kind === item.kind && entry.key === item.key)) continue;
    if (chance(.18 + clamp(memory, 0, 1) * .42)) unique.push({ ...item, confidence: clamp(item.confidence * .72, .25, .88), source: 'herencia cultural' });
    if (unique.length >= 6) break;
  }
  return unique;
}

function sanitizeMemory(memory) {
  const sanitizeList = list => Array.isArray(list)
    ? list.filter(item => item && Number.isFinite(Number(item.x)) && Number.isFinite(Number(item.y)))
      .slice(-20)
      .map(item => ({ x: Number(item.x), y: Number(item.y), t: finiteOr(item.t, Date.now()) }))
    : [];
  return { food: sanitizeList(memory?.food), danger: sanitizeList(memory?.danger) };
}

function sanitizePoint(value, fallbackX, fallbackY) {
  return {
    x: clamp(finiteOr(value?.x, fallbackX), 0, CONFIG.WORLD_WIDTH),
    y: clamp(finiteOr(value?.y, fallbackY), 0, CONFIG.WORLD_HEIGHT)
  };
}

function sanitizeRelationships(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([id]) => typeof id === 'string' && id.length > 0 && id.length <= 50)
    .slice(0, 24)
    .map(([id, bond]) => [id, clamp(finiteOr(bond, 0), 0, 1)]));
}

function sanitizeStringList(value, maxItems = 64, maxLength = 40) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(item => typeof item === 'string').map(item => item.slice(0, maxLength)).filter(Boolean))].slice(-maxItems);
}

function sanitizeAppearance(value, genome, id) {
  const source = value && typeof value === 'object' ? value : {};
  const seed = `${id}:${finiteOr(genome?.hue, 180).toFixed(1)}`;
  const unit = suffix => seededUnit(`${seed}:${suffix}`);
  return {
    earSize: clamp(finiteOr(source.earSize, .88 + unit('ear') * .5), .72, 1.55),
    eyeSize: clamp(finiteOr(source.eyeSize, .86 + unit('eye') * .42), .78, 1.42),
    fluff: clamp(finiteOr(source.fluff, .72 + unit('fluff') * .58), .65, 1.45),
    snout: clamp(finiteOr(source.snout, .76 + unit('snout') * .35), .68, 1.28),
    darkness: clamp(finiteOr(source.darkness, .18 + unit('dark') * .52), .08, .82),
    bellyLight: clamp(finiteOr(source.bellyLight, .45 + unit('belly') * .42), .3, .95),
    accentHue: ((finiteOr(source.accentHue, finiteOr(genome?.hue, 180) + (unit('accent') - .5) * 70) % 360) + 360) % 360,
    pattern: Math.max(0, Math.min(3, Math.floor(finiteOr(source.pattern, unit('pattern') * 4)))),
    earTilt: clamp(finiteOr(source.earTilt, (unit('tilt') - .5) * .7), -.55, .55),
    tail: clamp(finiteOr(source.tail, .7 + unit('tail') * .5), .55, 1.35)
  };
}

function sanitizeKnowledge(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(-32).map(item => ({
    kind: ['directive', 'fact', 'script'].includes(item.kind) ? item.kind : 'fact',
    key: sanitizeText(item.key, 90) || `fact:${uid()}`,
    label: sanitizeText(item.label, 170) || 'Conocimiento sin etiqueta',
    confidence: clamp(finiteOr(item.confidence, .5), 0, 1),
    source: sanitizeText(item.source, 28) || 'experiencia',
    createdAt: finiteOr(item.createdAt, Date.now()),
    updatedAt: finiteOr(item.updatedAt, item.createdAt ?? Date.now())
  }));
}

function sanitizeDialogue(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(-16).map(item => ({
    role: item.role === 'user' ? 'user' : 'creature',
    text: sanitizeText(item.text, 260),
    at: finiteOr(item.at, Date.now())
  })).filter(item => item.text);
}

function sanitizeExperience(value) {
  return {
    meals: Math.max(0, Math.floor(finiteOr(value?.meals, 0))),
    socialLearns: Math.max(0, Math.floor(finiteOr(value?.socialLearns, 0))),
    userLessons: Math.max(0, Math.floor(finiteOr(value?.userLessons, 0))),
    collaborations: Math.max(0, Math.floor(finiteOr(value?.collaborations, 0))),
    discoveries: Math.max(0, Math.floor(finiteOr(value?.discoveries, 0)))
  };
}

function parseDirective(text) {
  if (/(no ataques|no atacar|evita.*pelea|evita.*conflicto|se pacifico)/.test(text)) return 'avoid_conflict';
  if (/(busca.*comida|busca.*alimento|prioriza.*comida|prioriza.*energia)/.test(text)) return 'prioritize_food';
  if (/(explora mas|explorar mas|investiga|descubre territorio)/.test(text)) return 'explore_more';
  if (/(comparte.*conocimiento|ensena.*grupo|informa.*linaje)/.test(text)) return 'share_knowledge';
  if (/(permanece.*grupo|no te alejes|sigue.*grupo|cerca.*linaje)/.test(text)) return 'stay_group';
  if (/(huye.*peligro|escapa.*antes|evita.*peligro)/.test(text)) return 'flee_early';
  return null;
}

function createEntityName(id, hue) {
  const a = Math.floor(seededUnit(`${id}:${hue}:a`) * NAME_START.length);
  const b = Math.floor(seededUnit(`${id}:${hue}:b`) * NAME_END.length);
  return `${NAME_START[a]}${NAME_END[b]}`;
}

function sanitizeName(value) {
  const clean = String(value ?? '').trim().replace(/[^\p{L}0-9_-]/gu, '').slice(0, 18);
  return clean.length >= 2 ? clean : '';
}

function normalizeText(value) {
  return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function sanitizeText(value, max = 200) {
  return String(value ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(36);
}

function seededUnit(value) {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0) / 4294967295;
}
