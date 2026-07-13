import { clamp, finiteOr, uid } from './utils.js?v=6.0.1';

export const GOVERNMENT_TYPES = Object.freeze({
  kinship: Object.freeze({ key: 'kinship', label: 'Círculo de Linajes', title: 'Custodio del Origen', description: 'La autoridad descansa en la memoria, la edad y la confianza directa.' }),
  council: Object.freeze({ key: 'council', label: 'Consejo Ω', title: 'Portavoz del Consejo', description: 'Las facciones negocian decisiones mediante representantes.' }),
  republic: Object.freeze({ key: 'republic', label: 'República de Nodos', title: 'Primer Enlace', description: 'El liderazgo se renueva según legitimidad, conocimiento y apoyo social.' }),
  federation: Object.freeze({ key: 'federation', label: 'Federación de Facciones', title: 'Coordinador Federal', description: 'Cada facción conserva autonomía y comparte instituciones comunes.' }),
  monarchy: Object.freeze({ key: 'monarchy', label: 'Corona del Origen', title: 'Soberano del Linaje', description: 'Un linaje dominante concentra la continuidad política y la sucesión.' }),
  emergency: Object.freeze({ key: 'emergency', label: 'Directorio de Crisis', title: 'Regente de Emergencia', description: 'La guerra o el colapso concentran temporalmente el poder.' })
});

const FACTION_ARCHETYPES = Object.freeze([
  factionType('custodians', 'Custodios del Origen', '◉', 'Memoria, cuidado y continuidad del linaje.', { order: .65, progress: .35, freedom: .35, tradition: .9, expansion: .15, welfare: .8 }),
  factionType('forge', 'Liga de la Forja', '⌬', 'Tecnología, producción, reparación y progreso material.', { order: .55, progress: .95, freedom: .45, tradition: .2, expansion: .55, welfare: .5 }),
  factionType('horizon', 'Caminantes del Horizonte', '∆', 'Exploración, autonomía, descubrimiento y fronteras abiertas.', { order: .2, progress: .7, freedom: .95, tradition: .2, expansion: .75, welfare: .35 }),
  factionType('grove', 'Círculo de la Savia', '⌁', 'Equilibrio ambiental, recursos compartidos y vida estable.', { order: .45, progress: .35, freedom: .55, tradition: .75, expansion: .1, welfare: .95 }),
  factionType('nexus', 'Orden del Nexo', '⟁', 'Conocimiento centralizado, planificación y coordinación colectiva.', { order: .95, progress: .85, freedom: .15, tradition: .45, expansion: .5, welfare: .55 }),
  factionType('dawn', 'Comuna del Alba', '✦', 'Igualdad, cooperación, enseñanza y distribución de recursos.', { order: .35, progress: .55, freedom: .7, tradition: .3, expansion: .2, welfare: 1 })
]);

const LAW_LIBRARY = Object.freeze([
  ['memory', 'Ley de Memoria Compartida', 'Todo descubrimiento relevante debe conservarse en el archivo común.'],
  ['care', 'Pacto de Auxilio', 'Las criaturas con excedente de energía deben ayudar a las más vulnerables.'],
  ['knowledge', 'Carta del Conocimiento Libre', 'La enseñanza básica no puede ser monopolizada por una facción.'],
  ['repair', 'Norma de Reparación', 'Toda obra debe incluir mantenimiento, revisión y posibilidad de mejora.'],
  ['peace', 'Protocolo de Mediación', 'Ninguna disputa territorial puede convertirse en guerra sin una negociación previa.'],
  ['succession', 'Estatuto de Sucesión', 'La transferencia de poder debe quedar registrada y ser aceptada por instituciones o linajes.'],
  ['resources', 'Código de Recursos Comunes', 'Las reservas críticas pertenecen a la supervivencia de toda la población.'],
  ['truth', 'Regla de Evidencia', 'Las afirmaciones públicas deben distinguir hechos, hipótesis y opiniones.']
]);

const WAR_CAUSES = Object.freeze([
  'una disputa por recursos escasos', 'el control de una ruta fértil', 'una frontera no reconocida',
  'la ruptura de un pacto de conocimiento', 'una rivalidad ideológica', 'una sucesión cuestionada',
  'la protección de una facción aliada', 'la expansión de un territorio'
]);

export class Society {
  constructor(data = null) {
    this.reset();
    if (data) this.hydrate(data);
  }

  reset() {
    this.profiles = {};
    this.factions = [];
    this.government = {
      type: 'kinship', rulerId: '', rulerName: 'Sin designar', factionId: '', title: GOVERNMENT_TYPES.kinship.title,
      startedYear: 0, legitimacy: .5, laws: [], succession: 'mérito y memoria', previousRulers: []
    };
    this.treaties = [];
    this.wars = [];
    this.sagas = [];
    this.totalBetrayals = 0;
    this.totalWars = 0;
    this.totalReigns = 0;
    this.unrest = .08;
    this.lastUpdateYear = -1;
    this.lastFactionYear = 0;
    this.lastDiplomacyYear = 0;
    this.lastIntrigueYear = 0;
    this.lastLawYear = 0;
  }

  update(dt, simulation, civilization) {
    if (!simulation || !civilization || !Number.isFinite(dt) || dt <= 0) return;
    const year = Math.max(0, finiteOr(simulation.year, 0));
    const living = (simulation.creatures ?? []).filter(creature => creature && !creature.dead);
    this.syncProfiles(living, civilization, year);
    if (living.length < 3) {
      this.unrest = smooth(this.unrest, 0, .15);
      return;
    }
    if (this.lastUpdateYear >= 0 && year - this.lastUpdateYear < .65) return;
    const elapsedYears = this.lastUpdateYear < 0 ? .65 : Math.max(.1, year - this.lastUpdateYear);
    this.lastUpdateYear = year;

    this.ensureFactions(living, civilization, simulation, year);
    this.assignMembers(living, civilization, year);
    this.updateFactionMetrics(living, civilization);
    this.electFactionLeaders(living, simulation, civilization, year);
    this.updateRelations(living, civilization, elapsedYears);
    this.updateGovernment(living, simulation, civilization, year);
    this.updateTreaties(year, civilization);
    this.updateWars(living, simulation, civilization, year, elapsedYears);
    this.maybeCreateDiplomacy(simulation, civilization, year);
    this.maybeTriggerIntrigue(living, simulation, civilization, year);
    this.updateLaws(simulation, civilization, year);
    this.updateSagas(year);

    const activeWars = this.wars.filter(war => war.status === 'active').length;
    const activePacts = this.treaties.filter(treaty => treaty.status === 'active').length;
    const averageCohesion = this.factions.length ? this.factions.reduce((sum, faction) => sum + faction.cohesion, 0) / this.factions.length : .5;
    const targetUnrest = clamp(activeWars * .17 + (1 - civilization.stability) * .38 + (1 - averageCohesion) * .25 + Math.max(0, this.factions.length - 3) * .025 - activePacts * .015, 0, 1);
    this.unrest = smooth(this.unrest, targetUnrest, .14);
    civilization.stability = clamp(civilization.stability + activePacts * .0015 - activeWars * .006 - this.unrest * .0018, 0, 1);
    civilization.prosperity = clamp(civilization.prosperity - activeWars * .003 + this.getTradeTreaties().length * .0012, 0, 1);
  }

  syncProfiles(living, civilization, year) {
    const livingIds = new Set(living.map(creature => creature.id));
    for (const creature of living) {
      let profile = this.profiles[creature.id];
      if (!profile) {
        profile = this.createProfile(creature, year);
        this.profiles[creature.id] = profile;
      }
      const g = creature.genome ?? {};
      const ageWeight = clamp(finiteOr(creature.age, 0) / Math.max(10, finiteOr(creature.maturity, 12) * 3), 0, 1);
      const experience = creature.experience ?? {};
      const achievement = Math.log2(1 + finiteOr(experience.discoveries, 0) + finiteOr(experience.collaborations, 0) + finiteOr(experience.socialLearns, 0)) / 8;
      profile.influence = clamp(.08 + ageWeight * .25 + finiteOr(creature.bond, 0) * .18 + achievement + finiteOr(g.memory, .5) * .12 + finiteOr(g.sociability, .5) * .08, 0, 1);
      profile.empathy = clamp(profile.empathy * .96 + finiteOr(g.sociability, .5) * .04, 0, 1);
      profile.lastSeenYear = year;
      profile.status = 'alive';
      profile.name = clean(creature.name || creature.entityCode || creature.id, 24);
      profile.entityCode = clean(creature.entityCode || '', 16);
      profile.generation = Math.max(0, Math.floor(finiteOr(creature.generation, 0)));
      profile.parents = Array.isArray(creature.parents) ? creature.parents.slice(0, 2) : [];
      profile.loyalty = clamp(profile.loyalty + (civilization.prosperity - .5) * .008 + (finiteOr(g.sociability, .5) - .5) * .004, 0, 1);
    }
    for (const profile of Object.values(this.profiles)) {
      if (!livingIds.has(profile.id) && profile.status === 'alive') {
        profile.status = 'dead';
        profile.diedYear = year;
      }
    }
    const entries = Object.entries(this.profiles);
    if (entries.length > 1400) {
      const keep = entries.sort((a, b) => profileImportance(b[1]) - profileImportance(a[1])).slice(0, 1400);
      this.profiles = Object.fromEntries(keep);
    }
  }

  createProfile(creature, year) {
    const g = creature.genome ?? {};
    const seed = creature.id || uid();
    const aggression = clamp(finiteOr(g.aggression, .3), 0, 1);
    const sociability = clamp(finiteOr(g.sociability, .5), 0, 1);
    const curiosity = clamp(finiteOr(g.curiosity, .5), 0, 1);
    const memory = clamp(finiteOr(g.memory, .5), 0, 1);
    const ambition = clamp(.12 + aggression * .25 + curiosity * .18 + (1 - sociability) * .12 + hashUnit(`${seed}:ambition`) * .33, 0, 1);
    const honor = clamp(.18 + memory * .28 + sociability * .3 + (1 - aggression) * .14 + hashUnit(`${seed}:honor`) * .1, 0, 1);
    const empathy = clamp(.12 + sociability * .58 + (1 - aggression) * .18 + hashUnit(`${seed}:empathy`) * .12, 0, 1);
    const cunning = clamp(.1 + curiosity * .28 + memory * .28 + aggression * .16 + hashUnit(`${seed}:cunning`) * .18, 0, 1);
    return {
      id: creature.id,
      name: clean(creature.name || creature.entityCode || creature.id, 24),
      entityCode: clean(creature.entityCode || '', 16),
      generation: Math.max(0, Math.floor(finiteOr(creature.generation, 0))),
      parents: Array.isArray(creature.parents) ? creature.parents.slice(0, 2) : [],
      ambition, honor, empathy, cunning,
      loyalty: clamp(.38 + sociability * .32 + honor * .18 - ambition * .1, 0, 1),
      influence: .1,
      factionId: '',
      joinedYear: year,
      title: '',
      status: 'alive',
      betrayals: 0,
      victories: 0,
      defeats: 0,
      feats: [],
      grudges: [],
      lastSeenYear: year,
      diedYear: null
    };
  }

  ensureFactions(living, civilization, simulation, year) {
    const target = living.length < 6 ? 0 : Math.min(FACTION_ARCHETYPES.length, 1 + Math.floor((living.length - 6) / 10));
    while (this.factions.length < target) {
      const definition = FACTION_ARCHETYPES.find(item => !this.factions.some(faction => faction.key === item.key));
      if (!definition) break;
      const faction = {
        id: `faction-${definition.key}`,
        key: definition.key,
        name: definition.name,
        symbol: definition.symbol,
        motto: definition.motto,
        ideology: { ...definition.ideology },
        memberIds: [],
        leaderId: '',
        foundedYear: +year.toFixed(1),
        lastLeadershipYear: year,
        cohesion: .55,
        power: 0,
        prestige: .1,
        treasury: .2,
        relations: {},
        territory: this.factions.length,
        status: 'active'
      };
      for (const other of this.factions) {
        const initial = clamp(.18 - ideologyDistance(faction.ideology, other.ideology) * .62 + (hashUnit(`${faction.id}:${other.id}`) - .5) * .18, -1, 1);
        faction.relations[other.id] = initial;
        other.relations[faction.id] = initial;
      }
      this.factions.push(faction);
      this.recruitFounders(faction, living, year);
      this.emit(simulation, civilization, year, 'facción', `Nace ${faction.name} ${faction.symbol} con ${faction.memberIds.length} fundadores. ${faction.motto}`, faction.id);
      this.openSaga(year, 'fundación', `Fundación de ${faction.name}`, [faction.id], `${faction.name} comienza como una alianza de afinidades y objetivos compartidos.`);
      this.lastFactionYear = year;
    }
  }

  recruitFounders(newFaction, living, year) {
    const livingMap = new Map(living.map(creature => [creature.id, creature]));
    const candidates = living.map(creature => {
      const profile = this.profiles[creature.id];
      const current = this.getFaction(profile?.factionId);
      const affinity = profile ? this.factionAffinity(creature, profile, newFaction, livingMap) : 0;
      const protectedLeader = current?.leaderId === creature.id || this.government.rulerId === creature.id;
      const willingness = affinity + (1 - finiteOr(profile?.loyalty, .5)) * .22 - (protectedLeader ? .5 : 0);
      return { creature, profile, current, willingness };
    }).filter(item => item.profile).sort((a, b) => b.willingness - a.willingness);
    const founderCount = Math.min(5, Math.max(2, Math.ceil(living.length * .08)));
    for (const item of candidates.slice(0, founderCount)) {
      if (item.current) item.current.memberIds = item.current.memberIds.filter(id => id !== item.creature.id);
      newFaction.memberIds.push(item.creature.id);
      item.profile.factionId = newFaction.id;
      item.profile.joinedYear = year;
      item.profile.loyalty = clamp(.52 + item.profile.empathy * .12, 0, 1);
      addUnique(item.profile.feats, `Fundador de ${newFaction.name}`, 12);
    }
  }

  assignMembers(living, civilization, year) {
    if (!this.factions.length) return;
    const livingMap = new Map(living.map(creature => [creature.id, creature]));
    for (const faction of this.factions) faction.memberIds = faction.memberIds.filter(id => livingMap.has(id));

    for (const creature of living) {
      const profile = this.profiles[creature.id];
      if (!profile) continue;
      const currentFaction = this.getFaction(profile.factionId);
      if (currentFaction && currentFaction.memberIds.includes(creature.id)) continue;
      const ranked = this.factions.map(faction => ({ faction, score: this.factionAffinity(creature, profile, faction, livingMap) })).sort((a, b) => b.score - a.score);
      const selected = ranked[0]?.faction;
      if (!selected) continue;
      selected.memberIds.push(creature.id);
      profile.factionId = selected.id;
      profile.joinedYear = year;
      profile.loyalty = clamp(profile.loyalty + .08, 0, 1);
    }

    for (const faction of this.factions) {
      faction.memberIds = [...new Set(faction.memberIds)].filter(id => livingMap.has(id));
    }
  }

  factionAffinity(creature, profile, faction, livingMap) {
    const g = creature.genome ?? {};
    const i = faction.ideology;
    const orderPreference = finiteOr(g.memory, .5) * .55 + finiteOr(g.efficiency, 1) / 3;
    const progressPreference = finiteOr(g.curiosity, .5) * .65 + finiteOr(g.memory, .5) * .25;
    const freedomPreference = finiteOr(g.speed, 1) / 2.5 * .45 + finiteOr(g.curiosity, .5) * .35 + (1 - finiteOr(g.sociability, .5)) * .2;
    const traditionPreference = finiteOr(g.memory, .5) * .55 + (1 - finiteOr(g.mutationRate, .05) * 5) * .15;
    const expansionPreference = finiteOr(g.aggression, .2) * .45 + finiteOr(g.speed, 1) / 2.5 * .35 + finiteOr(g.curiosity, .5) * .2;
    const welfarePreference = profile.empathy * .6 + finiteOr(g.sociability, .5) * .4;
    let score = 1 - (
      Math.abs(orderPreference - i.order) + Math.abs(progressPreference - i.progress) + Math.abs(freedomPreference - i.freedom) +
      Math.abs(traditionPreference - i.tradition) + Math.abs(expansionPreference - i.expansion) + Math.abs(welfarePreference - i.welfare)
    ) / 6;
    const relationshipPull = faction.memberIds.slice(0, 20).reduce((sum, id) => sum + finiteOr(creature.relationships?.[id], 0), 0) / Math.max(1, Math.min(20, faction.memberIds.length));
    score += relationshipPull * .24;
    score += (hashUnit(`${creature.id}:${faction.id}`) - .5) * .08;
    score -= faction.memberIds.length / Math.max(18, livingMap.size * 2.2);
    return score;
  }

  updateFactionMetrics(living, civilization) {
    const livingMap = new Map(living.map(creature => [creature.id, creature]));
    for (const faction of this.factions) {
      const profiles = faction.memberIds.map(id => this.profiles[id]).filter(Boolean);
      const members = faction.memberIds.map(id => livingMap.get(id)).filter(Boolean);
      faction.cohesion = profiles.length ? clamp(profiles.reduce((sum, profile) => sum + profile.loyalty, 0) / profiles.length, 0, 1) : 0;
      faction.power = clamp(members.reduce((sum, creature) => {
        const profile = this.profiles[creature.id];
        return sum + .35 + finiteOr(profile?.influence, 0) + finiteOr(creature.energy, 0) / Math.max(1, finiteOr(creature.maxEnergy, 100)) * .35;
      }, 0), 0, 9999);
      faction.treasury = clamp(faction.treasury + civilization.prosperity * members.length * .0015 - this.isFactionAtWar(faction.id) * .006, 0, 1);
      faction.prestige = clamp(faction.prestige * .997 + Math.log2(1 + faction.power) * .0015, 0, 1);
      faction.status = faction.memberIds.length ? 'active' : 'dormant';
    }
  }

  electFactionLeaders(living, simulation, civilization, year) {
    const livingIds = new Set(living.map(creature => creature.id));
    for (const faction of this.factions) {
      const candidates = faction.memberIds.map(id => this.profiles[id]).filter(profile => profile?.status === 'alive' && livingIds.has(profile.id));
      if (!candidates.length) { faction.leaderId = ''; continue; }
      candidates.sort((a, b) => leadershipScore(b) - leadershipScore(a));
      const best = candidates[0];
      const current = this.profiles[faction.leaderId];
      const mustReplace = !current || current.status !== 'alive' || !faction.memberIds.includes(current.id);
      const challenged = current && year - faction.lastLeadershipYear >= 4 && leadershipScore(best) > leadershipScore(current) + .14;
      if (!mustReplace && !challenged) continue;
      const previous = current?.name || '';
      faction.leaderId = best.id;
      faction.lastLeadershipYear = year;
      best.title = `Líder de ${faction.name}`;
      best.influence = clamp(best.influence + .08, 0, 1);
      const reason = previous ? `tras desplazar a ${previous}` : 'por confianza de sus miembros';
      this.emit(simulation, civilization, year, 'liderazgo', `${best.name} asume el liderazgo de ${faction.name} ${reason}.`, best.id);
    }
  }

  updateRelations(living, civilization, elapsedYears) {
    const creatureMap = new Map(living.map(creature => [creature.id, creature]));
    for (let a = 0; a < this.factions.length; a++) {
      for (let b = a + 1; b < this.factions.length; b++) {
        const first = this.factions[a];
        const second = this.factions[b];
        let current = finiteOr(first.relations[second.id], 0);
        const distance = ideologyDistance(first.ideology, second.ideology);
        const leaderA = creatureMap.get(first.leaderId);
        const leaderB = creatureMap.get(second.leaderId);
        const trustA = finiteOr(leaderA?.relationships?.[second.leaderId], 0);
        const trustB = finiteOr(leaderB?.relationships?.[first.leaderId], 0);
        const leaderTrust = (trustA + trustB) / 2;
        const treatyBonus = this.treatyBonus(first.id, second.id);
        const warPenalty = this.hasActiveWar(first.id, second.id) ? -.42 : 0;
        const dominanceTension = Math.abs(first.power - second.power) / Math.max(1, first.power + second.power) * .12;
        const target = clamp(.3 - distance * .82 + leaderTrust * .35 + treatyBonus + warPenalty - dominanceTension, -1, 1);
        current = smooth(current, target, clamp(.035 * elapsedYears, .02, .14));
        first.relations[second.id] = current;
        second.relations[first.id] = current;
      }
    }
  }

  updateGovernment(living, simulation, civilization, year) {
    const activeFactions = this.factions.filter(faction => faction.status === 'active');
    const dominant = activeFactions.slice().sort((a, b) => b.power - a.power)[0] ?? null;
    const totalPower = activeFactions.reduce((sum, faction) => sum + faction.power, 0);
    const dominance = dominant ? dominant.power / Math.max(1, totalPower) : 0;
    const dominantLeader = this.profiles[dominant?.leaderId];
    const activeWars = this.wars.filter(war => war.status === 'active').length;
    const yearsInGovernment = year - finiteOr(this.government.startedYear, 0);
    let desiredType = 'kinship';
    if (activeWars && civilization.stability < .45) desiredType = 'emergency';
    else if (living.length >= 12 && dominantLeader?.ambition > .76 && dominance > .39 && civilization.stability < .67) desiredType = 'monarchy';
    else if (activeFactions.length >= 3 && civilization.cooperation > .72 && civilization.stability > .58) desiredType = 'federation';
    else if (civilization.literacy > .38 && civilization.institutions.length >= 3) desiredType = 'republic';
    else if (civilization.institutions.length >= 1 || activeFactions.length >= 2) desiredType = 'council';

    if (this.government.type === 'monarchy' && yearsInGovernment < 10 && activeWars === 0) desiredType = 'monarchy';
    if (this.government.type === 'emergency' && activeWars > 0) desiredType = 'emergency';
    const rulerAlive = living.some(creature => creature.id === this.government.rulerId);
    const shouldChangeSystem = desiredType !== this.government.type && yearsInGovernment >= 5;
    if (shouldChangeSystem || !rulerAlive || !this.government.rulerId) {
      this.appointGovernment(desiredType, dominant, living, simulation, civilization, year, rulerAlive ? 'reforma política' : 'sucesión');
    }

    const ruler = this.profiles[this.government.rulerId];
    const rulerFaction = this.getFaction(this.government.factionId);
    const support = rulerFaction?.cohesion ?? civilization.cooperation;
    const targetLegitimacy = clamp(.16 + finiteOr(ruler?.influence, 0) * .34 + finiteOr(ruler?.honor, 0) * .18 + support * .18 + civilization.stability * .22 - this.unrest * .16, 0, 1);
    this.government.legitimacy = smooth(this.government.legitimacy, targetLegitimacy, .12);
  }

  appointGovernment(type, dominantFaction, living, simulation, civilization, year, reason) {
    const definition = GOVERNMENT_TYPES[type] ?? GOVERNMENT_TYPES.kinship;
    const previousRuler = this.profiles[this.government.rulerId];
    let ruler = null;
    if (type === 'monarchy' && previousRuler && this.government.type === 'monarchy' && previousRuler.status !== 'alive') {
      ruler = this.findHeir(previousRuler, living);
    }
    if (!ruler && dominantFaction?.leaderId) ruler = this.profiles[dominantFaction.leaderId];
    if (!ruler) ruler = living.map(creature => this.profiles[creature.id]).filter(Boolean).sort((a, b) => leadershipScore(b) - leadershipScore(a))[0] ?? null;
    if (!ruler) return;

    if (previousRuler && previousRuler.id !== ruler.id) {
      previousRuler.title = previousRuler.status === 'alive' ? 'Antiguo gobernante' : previousRuler.title;
      this.government.previousRulers.unshift({ id: previousRuler.id, name: previousRuler.name, title: this.government.title, from: this.government.startedYear, to: year });
      this.government.previousRulers = this.government.previousRulers.slice(0, 24);
    }
    this.government.type = definition.key;
    this.government.rulerId = ruler.id;
    this.government.rulerName = ruler.name;
    this.government.factionId = ruler.factionId || dominantFaction?.id || '';
    this.government.title = definition.title;
    this.government.startedYear = +year.toFixed(1);
    this.government.legitimacy = clamp(.42 + ruler.influence * .25 + ruler.honor * .18, 0, 1);
    this.government.succession = type === 'monarchy' ? 'herencia de linaje, corregida por poder y legitimidad' : type === 'republic' ? 'elección por influencia y apoyo' : type === 'federation' ? 'acuerdo entre facciones' : 'mérito, confianza y necesidad';
    ruler.title = definition.title;
    ruler.influence = clamp(ruler.influence + .1, 0, 1);
    this.totalReigns++;
    this.emit(simulation, civilization, year, 'gobierno', `${definition.label}: ${ruler.name} se convierte en ${definition.title.toLowerCase()} por ${reason}. ${definition.description}`, ruler.id);
    this.openSaga(year, 'reinado', `${definition.label} de ${ruler.name}`, [ruler.id, ruler.factionId], `${ruler.name} inicia un nuevo periodo de gobierno bajo ${definition.label}.`);
  }

  findHeir(previousRuler, living) {
    const direct = living.map(creature => this.profiles[creature.id]).filter(profile => profile && profile.parents.includes(previousRuler.id));
    const sameFaction = living.map(creature => this.profiles[creature.id]).filter(profile => profile?.factionId === previousRuler.factionId);
    return [...direct, ...sameFaction].filter((profile, index, list) => list.findIndex(item => item.id === profile.id) === index).sort((a, b) => (b.influence + b.ambition * .35 + b.honor * .25) - (a.influence + a.ambition * .35 + a.honor * .25))[0] ?? null;
  }

  updateTreaties(year, civilization) {
    for (const treaty of this.treaties) {
      if (treaty.status !== 'active') continue;
      const relation = this.getRelation(treaty.parties[0], treaty.parties[1]);
      if (year >= treaty.expiresYear || relation < (treaty.type === 'alliance' ? -.05 : -.28)) {
        treaty.status = 'expired';
        treaty.endedYear = +year.toFixed(1);
      }
    }
    this.treaties = this.treaties.slice(-60);
  }

  maybeCreateDiplomacy(simulation, civilization, year) {
    if (year - this.lastDiplomacyYear < 1.8 || this.factions.length < 2) return;
    this.lastDiplomacyYear = year;
    for (let a = 0; a < this.factions.length; a++) {
      for (let b = a + 1; b < this.factions.length; b++) {
        const first = this.factions[a];
        const second = this.factions[b];
        if (first.status !== 'active' || second.status !== 'active' || this.hasActiveWar(first.id, second.id)) continue;
        const relation = this.getRelation(first.id, second.id);
        if (relation > .68 && !this.hasTreaty(first.id, second.id, 'alliance')) {
          this.createTreaty('alliance', first, second, year, simulation, civilization);
        } else if (relation > .42 && !this.hasTreaty(first.id, second.id, 'trade')) {
          this.createTreaty('trade', first, second, year, simulation, civilization);
        } else if (relation < -.43 && this.canStartWar(first, second, civilization, year)) {
          this.startWar(first, second, simulation, civilization, year);
          return;
        }
      }
    }
  }

  createTreaty(type, first, second, year, simulation, civilization) {
    const treaty = {
      id: uid(), type, parties: [first.id, second.id], startedYear: +year.toFixed(1),
      expiresYear: +(year + (type === 'alliance' ? 28 : 16)).toFixed(1), status: 'active', endedYear: null
    };
    this.treaties.push(treaty);
    const label = type === 'alliance' ? 'Alianza defensiva' : 'Pacto de intercambio';
    this.emit(simulation, civilization, year, 'diplomacia', `${first.name} y ${second.name} firman «${label}».`, treaty.id);
    this.openSaga(year, 'alianza', `${label}: ${first.name} y ${second.name}`, treaty.parties, 'Dos facciones rivales o distantes deciden cooperar formalmente.');
  }

  canStartWar(first, second, civilization, year) {
    if (this.wars.some(war => war.status === 'active')) return false;
    if (first.memberIds.length < 3 || second.memberIds.length < 3) return false;
    const expansion = Math.max(first.ideology.expansion, second.ideology.expansion);
    const pressure = (1 - civilization.prosperity) * .55 + this.unrest * .25 + expansion * .28;
    if (pressure < .36) return false;
    const chanceValue = clamp((pressure - .25) * .55 + Math.abs(this.getRelation(first.id, second.id)) * .25, .05, .72);
    return hashUnit(`${Math.floor(year / 2)}:${first.id}:${second.id}:war`) < chanceValue;
  }

  startWar(first, second, simulation, civilization, year, cause = '') {
    if (!first || !second || this.hasActiveWar(first.id, second.id)) return null;
    const relation = this.getRelation(first.id, second.id);
    const attacker = first.ideology.expansion + (this.profiles[first.leaderId]?.ambition ?? 0) >= second.ideology.expansion + (this.profiles[second.leaderId]?.ambition ?? 0) ? first : second;
    const defender = attacker.id === first.id ? second : first;
    const selectedCause = cause || WAR_CAUSES[Math.floor(hashUnit(`${attacker.id}:${defender.id}:${year}`) * WAR_CAUSES.length)];
    const war = {
      id: uid(), name: `Guerra de ${clean(selectedCause.replace(/^una |^el |^la /, ''), 70)}`,
      attackerId: attacker.id, defenderId: defender.id, cause: selectedCause,
      startedYear: +year.toFixed(1), endedYear: null, status: 'active', intensity: .28,
      attackerScore: 0, defenderScore: 0,
      casualties: { wounded: 0, dead: 0 }, battles: [], winnerId: '', peaceTreatyId: ''
    };
    this.wars.push(war);
    this.totalWars++;
    attacker.relations[defender.id] = -1;
    defender.relations[attacker.id] = -1;
    this.breakTreaties(attacker.id, defender.id, year);
    this.emit(simulation, civilization, year, 'guerra', `${attacker.name} declara la guerra a ${defender.name} por ${selectedCause}.`, war.id);
    this.openSaga(year, 'guerra', war.name, [war.id, attacker.id, defender.id, attacker.leaderId, defender.leaderId], `${attacker.name} y ${defender.name} entran en conflicto abierto.`);
    return war;
  }

  updateWars(living, simulation, civilization, year, elapsedYears) {
    const livingMap = new Map(living.map(creature => [creature.id, creature]));
    for (const war of this.wars.filter(item => item.status === 'active')) {
      const attacker = this.getFaction(war.attackerId);
      const defender = this.getFaction(war.defenderId);
      if (!attacker || !defender || !attacker.memberIds.length || !defender.memberIds.length) {
        this.endWar(war, attacker?.memberIds.length ? attacker : defender, simulation, civilization, year, 'desaparición de una de las facciones');
        continue;
      }
      const leaderA = this.profiles[attacker.leaderId];
      const leaderD = this.profiles[defender.leaderId];
      const forceA = attacker.power * (.55 + attacker.cohesion * .55) * (.78 + finiteOr(leaderA?.influence, .2) * .45) * (1 + attacker.treasury * .12);
      const forceD = defender.power * (.62 + defender.cohesion * .58) * (.8 + finiteOr(leaderD?.influence, .2) * .42) * (1 + defender.treasury * .14);
      const noiseA = .9 + hashUnit(`${war.id}:${Math.floor(year)}:a`) * .22;
      const noiseD = .9 + hashUnit(`${war.id}:${Math.floor(year)}:d`) * .22;
      war.attackerScore += Math.log2(1 + forceA * noiseA) * elapsedYears * .18;
      war.defenderScore += Math.log2(1 + forceD * noiseD) * elapsedYears * .18;
      war.intensity = clamp(war.intensity + elapsedYears * .025 + this.unrest * .008, .2, 1);
      civilization.stability = clamp(civilization.stability - war.intensity * .004, 0, 1);
      civilization.prosperity = clamp(civilization.prosperity - war.intensity * .0035, 0, 1);

      const duration = year - war.startedYear;
      const battleBucket = Math.floor(duration / 1.35);
      if (battleBucket > war.battles.length) this.resolveBattle(war, attacker, defender, livingMap, simulation, civilization, year);
      const difference = Math.abs(war.attackerScore - war.defenderScore);
      if ((duration >= 6 && difference >= 2.4) || duration >= 13) {
        const winner = war.attackerScore >= war.defenderScore ? attacker : defender;
        this.endWar(war, winner, simulation, civilization, year, duration >= 13 ? 'agotamiento de ambos bandos' : 'ventaja militar decisiva');
      }
    }
    this.wars = this.wars.slice(-40);
  }

  resolveBattle(war, attacker, defender, livingMap, simulation, civilization, year) {
    const attackerValue = war.attackerScore + hashUnit(`${war.id}:${war.battles.length}:attack`) * 1.4;
    const defenderValue = war.defenderScore + hashUnit(`${war.id}:${war.battles.length}:defend`) * 1.4;
    const victor = attackerValue >= defenderValue ? attacker : defender;
    const loser = victor.id === attacker.id ? defender : attacker;
    const battle = {
      id: uid(), year: +year.toFixed(1), winnerId: victor.id, loserId: loser.id,
      name: `Encuentro de ${['las Cenizas', 'la Frontera', 'los Tres Símbolos', 'la Ruta Oscura', 'la Cámara Verde'][war.battles.length % 5]}`
    };
    war.battles.push(battle);
    const targets = loser.memberIds.map(id => livingMap.get(id)).filter(Boolean).sort((a, b) => a.energy - b.energy);
    const target = targets[0];
    if (target) {
      const damage = target.maxEnergy * (.025 + war.intensity * .055);
      target.energy = Math.max(.2, target.energy - damage);
      war.casualties.wounded++;
      const lethal = target.energy < target.maxEnergy * .045 && livingMap.size > 10 && hashUnit(`${battle.id}:${target.id}:lethal`) < .22 * war.intensity;
      if (lethal && typeof simulation.killCreature === 'function') {
        simulation.killCreature(target, `guerra entre ${attacker.name} y ${defender.name}`);
        war.casualties.dead++;
      }
    }
    victor.prestige = clamp(victor.prestige + .045, 0, 1);
    loser.cohesion = clamp(loser.cohesion - .025, 0, 1);
    this.emit(simulation, civilization, year, 'batalla', `${victor.name} vence en ${battle.name}; ${loser.name} retrocede.`, battle.id, false);
    this.appendSaga(war.id, year, `${victor.name} obtiene una ventaja en ${battle.name}.`);
  }

  endWar(war, winner, simulation, civilization, year, reason) {
    if (!war || war.status !== 'active') return;
    const loser = winner?.id === war.attackerId ? this.getFaction(war.defenderId) : this.getFaction(war.attackerId);
    war.status = 'ended';
    war.endedYear = +year.toFixed(1);
    war.winnerId = winner?.id || '';
    const winnerLeader = this.profiles[winner?.leaderId];
    const loserLeader = this.profiles[loser?.leaderId];
    if (winnerLeader) {
      winnerLeader.victories++;
      addUnique(winnerLeader.feats, `Vencedor de ${war.name}`, 12);
      winnerLeader.influence = clamp(winnerLeader.influence + .12, 0, 1);
      winnerLeader.title = winnerLeader.title || 'Héroe de guerra';
    }
    if (loserLeader) { loserLeader.defeats++; loserLeader.influence = clamp(loserLeader.influence - .08, 0, 1); }
    if (winner) winner.prestige = clamp(winner.prestige + .14, 0, 1);
    if (loser) loser.prestige = clamp(loser.prestige - .08, 0, 1);
    if (winner && loser) {
      winner.relations[loser.id] = -.2;
      loser.relations[winner.id] = -.2;
      const peace = { id: uid(), type: 'peace', parties: [winner.id, loser.id], startedYear: +year.toFixed(1), expiresYear: +(year + 10).toFixed(1), status: 'active', endedYear: null };
      this.treaties.push(peace);
      war.peaceTreatyId = peace.id;
    }
    const winnerText = winner ? `${winner.name} obtiene la victoria` : 'La guerra termina sin vencedor claro';
    this.emit(simulation, civilization, year, 'paz', `${winnerText} en ${war.name}, que concluye por ${reason}. Bajas registradas: ${war.casualties.wounded} heridas y ${war.casualties.dead} muertes.`, war.id);
    this.closeSaga(war.id, year, `${winnerText}; el conflicto termina por ${reason}.`);
  }

  maybeTriggerIntrigue(living, simulation, civilization, year) {
    if (year - this.lastIntrigueYear < 2.7 || !this.government.rulerId || this.factions.length < 2) return;
    this.lastIntrigueYear = year;
    const ruler = this.profiles[this.government.rulerId];
    if (!ruler) return;
    const candidates = living.map(creature => this.profiles[creature.id]).filter(profile => profile && profile.id !== ruler.id && profile.status === 'alive');
    candidates.sort((a, b) => intrigueScore(b, this.government, this.unrest) - intrigueScore(a, this.government, this.unrest));
    const challenger = candidates[0];
    if (!challenger) return;
    const score = intrigueScore(challenger, this.government, this.unrest);
    if (score < .13 || hashUnit(`${Math.floor(year / 2.7)}:${challenger.id}:intrigue`) > clamp(score * .78, .04, .58)) return;

    const challengerFaction = this.getFaction(challenger.factionId);
    const rulerFaction = this.getFaction(ruler.factionId);
    const coupPossible = challengerFaction?.leaderId === challenger.id && challenger.influence > ruler.influence * .82 && this.government.legitimacy < .58;
    if (coupPossible) {
      challenger.betrayals++;
      this.totalBetrayals++;
      addUnique(challenger.feats, `Golpe contra ${ruler.name}`, 12);
      addUnique(ruler.grudges, challenger.id, 16);
      const oldName = ruler.name;
      ruler.title = 'Gobernante depuesto';
      this.government.rulerId = challenger.id;
      this.government.rulerName = challenger.name;
      this.government.factionId = challenger.factionId;
      this.government.startedYear = +year.toFixed(1);
      this.government.legitimacy = .31;
      challenger.title = this.government.title;
      challenger.influence = clamp(challenger.influence + .13, 0, 1);
      this.emit(simulation, civilization, year, 'traición', `${challenger.name} rompe su juramento y depone a ${oldName} mediante un golpe político.`, challenger.id);
      this.openSaga(year, 'traición', `La caída de ${oldName}`, [challenger.id, ruler.id, challenger.factionId], `${challenger.name} conquista el poder traicionando el orden anterior.`);
      return;
    }

    const currentFaction = this.getFaction(challenger.factionId);
    const alternatives = this.factions.filter(faction => faction.id !== currentFaction?.id && faction.status === 'active').sort((a, b) => this.getRelation(challenger.factionId, b.id) - this.getRelation(challenger.factionId, a.id));
    const targetFaction = alternatives[0];
    if (!currentFaction || !targetFaction || challenger.loyalty > .36) return;
    currentFaction.memberIds = currentFaction.memberIds.filter(id => id !== challenger.id);
    targetFaction.memberIds.push(challenger.id);
    challenger.factionId = targetFaction.id;
    challenger.loyalty = .46;
    challenger.betrayals++;
    this.totalBetrayals++;
    addUnique(challenger.feats, `Deserción de ${currentFaction.name}`, 12);
    currentFaction.relations[targetFaction.id] = clamp(this.getRelation(currentFaction.id, targetFaction.id) - .2, -1, 1);
    targetFaction.relations[currentFaction.id] = currentFaction.relations[targetFaction.id];
    this.emit(simulation, civilization, year, 'deserción', `${challenger.name} abandona ${currentFaction.name} y entrega su lealtad a ${targetFaction.name}.`, challenger.id);
    this.openSaga(year, 'traición', `La deserción de ${challenger.name}`, [challenger.id, currentFaction.id, targetFaction.id], 'Una figura influyente cambia de bando y altera el equilibrio político.');
  }

  updateLaws(simulation, civilization, year) {
    if (year - this.lastLawYear < 5 || !this.government.rulerId) return;
    const next = LAW_LIBRARY.find(([key]) => !this.government.laws.some(law => law.key === key));
    if (!next) return;
    const [key, label, text] = next;
    const requirementMet = key !== 'peace' || this.totalWars > 0;
    if (!requirementMet) return;
    const law = { key, label, text, enactedYear: +year.toFixed(1), rulerId: this.government.rulerId };
    this.government.laws.push(law);
    this.government.laws = this.government.laws.slice(-12);
    this.lastLawYear = year;
    this.emit(simulation, civilization, year, 'ley', `Se promulga «${label}»: ${text}`, key);
  }

  openSaga(year, type, title, actors, summary) {
    const saga = { id: uid(), year: +year.toFixed(1), updatedYear: +year.toFixed(1), type: clean(type, 30), title: clean(title, 100), summary: clean(summary, 260), actors: uniqueStrings(actors, 12, 80), chapters: [], status: 'active' };
    this.sagas.unshift(saga);
    this.sagas = this.sagas.slice(0, 40);
    return saga;
  }

  appendSaga(refId, year, text) {
    const saga = this.sagas.find(item => item.id === refId || item.actors.includes(refId));
    if (!saga) return;
    saga.chapters.push({ year: +year.toFixed(1), text: clean(text, 220) });
    saga.chapters = saga.chapters.slice(-12);
    saga.updatedYear = +year.toFixed(1);
  }

  closeSaga(refId, year, summary) {
    const saga = this.sagas.find(item => item.id === refId || item.actors.includes(refId));
    if (!saga) return;
    saga.status = 'closed';
    saga.updatedYear = +year.toFixed(1);
    saga.summary = clean(summary, 260) || saga.summary;
  }

  updateSagas(year) {
    for (const saga of this.sagas) {
      if (saga.status === 'active' && year - saga.updatedYear > 24 && saga.type !== 'reinado') saga.status = 'legend';
    }
  }

  emit(simulation, civilization, year, type, text, ref = '', announce = true) {
    civilization.recordChronicle(year, type, text, ref);
    if (announce) simulation.logEvent?.(`Año ${year.toFixed(1)}`, text);
  }

  getFaction(id) { return this.factions.find(faction => faction.id === id) ?? null; }
  getProfile(id) { return this.profiles[id] ?? null; }
  getRelation(firstId, secondId) { return finiteOr(this.getFaction(firstId)?.relations?.[secondId], 0); }
  isFactionAtWar(id) { return this.wars.some(war => war.status === 'active' && (war.attackerId === id || war.defenderId === id)) ? 1 : 0; }
  hasActiveWar(firstId, secondId) { return this.wars.some(war => war.status === 'active' && new Set([war.attackerId, war.defenderId]).has(firstId) && new Set([war.attackerId, war.defenderId]).has(secondId)); }
  hasTreaty(firstId, secondId, type = '') { return this.treaties.some(treaty => treaty.status === 'active' && (!type || treaty.type === type) && treaty.parties.includes(firstId) && treaty.parties.includes(secondId)); }
  getTradeTreaties() { return this.treaties.filter(treaty => treaty.status === 'active' && treaty.type === 'trade'); }
  treatyBonus(firstId, secondId) {
    return this.treaties.filter(treaty => treaty.status === 'active' && treaty.parties.includes(firstId) && treaty.parties.includes(secondId)).reduce((sum, treaty) => sum + (treaty.type === 'alliance' ? .32 : treaty.type === 'trade' ? .18 : treaty.type === 'peace' ? .12 : 0), 0);
  }
  breakTreaties(firstId, secondId, year) {
    for (const treaty of this.treaties) if (treaty.status === 'active' && treaty.parties.includes(firstId) && treaty.parties.includes(secondId)) { treaty.status = 'broken'; treaty.endedYear = +year.toFixed(1); }
  }

  getMetrics() {
    const activeFactions = this.factions.filter(faction => faction.status === 'active');
    const activeWars = this.wars.filter(war => war.status === 'active');
    const activeTreaties = this.treaties.filter(treaty => treaty.status === 'active');
    const governmentDefinition = GOVERNMENT_TYPES[this.government.type] ?? GOVERNMENT_TYPES.kinship;
    return {
      factions: activeFactions.length,
      activeWars: activeWars.length,
      treaties: activeTreaties.length,
      betrayals: this.totalBetrayals,
      totalWars: this.totalWars,
      government: governmentDefinition,
      ruler: this.profiles[this.government.rulerId] ?? null,
      legitimacy: this.government.legitimacy,
      unrest: this.unrest,
      laws: this.government.laws.length,
      sagas: this.sagas.length
    };
  }

  serialize() {
    return {
      version: 1,
      profiles: this.profiles,
      factions: this.factions,
      government: this.government,
      treaties: this.treaties,
      wars: this.wars,
      sagas: this.sagas,
      totalBetrayals: this.totalBetrayals,
      totalWars: this.totalWars,
      totalReigns: this.totalReigns,
      unrest: this.unrest,
      lastUpdateYear: this.lastUpdateYear,
      lastFactionYear: this.lastFactionYear,
      lastDiplomacyYear: this.lastDiplomacyYear,
      lastIntrigueYear: this.lastIntrigueYear,
      lastLawYear: this.lastLawYear
    };
  }

  hydrate(data) {
    if (!data || typeof data !== 'object') return;
    this.profiles = sanitizeProfiles(data.profiles);
    this.factions = sanitizeFactions(data.factions);
    this.government = sanitizeGovernment(data.government);
    this.treaties = sanitizeTreaties(data.treaties);
    this.wars = sanitizeWars(data.wars);
    this.sagas = sanitizeSagas(data.sagas);
    this.totalBetrayals = Math.max(0, Math.floor(finiteOr(data.totalBetrayals, 0)));
    this.totalWars = Math.max(this.wars.length, Math.floor(finiteOr(data.totalWars, 0)));
    this.totalReigns = Math.max(0, Math.floor(finiteOr(data.totalReigns, 0)));
    this.unrest = clamp(finiteOr(data.unrest, .08), 0, 1);
    this.lastUpdateYear = finiteOr(data.lastUpdateYear, -1);
    this.lastFactionYear = Math.max(0, finiteOr(data.lastFactionYear, 0));
    this.lastDiplomacyYear = Math.max(0, finiteOr(data.lastDiplomacyYear, 0));
    this.lastIntrigueYear = Math.max(0, finiteOr(data.lastIntrigueYear, 0));
    this.lastLawYear = Math.max(0, finiteOr(data.lastLawYear, 0));
  }
}

function factionType(key, name, symbol, motto, ideology) { return Object.freeze({ key, name, symbol, motto, ideology: Object.freeze(ideology) }); }
function leadershipScore(profile) { return finiteOr(profile?.influence, 0) * .42 + finiteOr(profile?.honor, 0) * .24 + finiteOr(profile?.ambition, 0) * .2 + finiteOr(profile?.loyalty, 0) * .14; }
function intrigueScore(profile, government, unrest) { return clamp(finiteOr(profile?.ambition, 0) * .35 + finiteOr(profile?.cunning, 0) * .27 + (1 - finiteOr(profile?.loyalty, .5)) * .18 + (1 - finiteOr(government?.legitimacy, .5)) * .12 + finiteOr(unrest, 0) * .18 - finiteOr(profile?.honor, .5) * .12, 0, 1); }
function profileImportance(profile) { return (profile.status === 'alive' ? 10 : 0) + finiteOr(profile.influence, 0) * 4 + finiteOr(profile.betrayals, 0) + finiteOr(profile.victories, 0) + (profile.title ? 2 : 0); }
function ideologyDistance(a = {}, b = {}) { const keys = ['order', 'progress', 'freedom', 'tradition', 'expansion', 'welfare']; return keys.reduce((sum, key) => sum + Math.abs(finiteOr(a[key], .5) - finiteOr(b[key], .5)), 0) / keys.length; }
function smooth(current, target, amount) { return finiteOr(current, 0) + (finiteOr(target, 0) - finiteOr(current, 0)) * clamp(amount, 0, 1); }
function hashUnit(value) { let hash = 2166136261; for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return (hash >>> 0) / 4294967295; }
function clean(value, max = 200) { return String(value ?? '').replace(/[<>]/g, '').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
function addUnique(list, value, max) { const item = clean(value, 140); if (!item || list.includes(item)) return; list.push(item); if (list.length > max) list.splice(0, list.length - max); }
function uniqueStrings(value, maxItems, maxLength) { if (!Array.isArray(value)) return []; return [...new Set(value.filter(item => typeof item === 'string').map(item => clean(item, maxLength)).filter(Boolean))].slice(-maxItems); }

function sanitizeProfiles(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result = {};
  for (const [id, source] of Object.entries(value).slice(0, 1400)) {
    if (!source || typeof source !== 'object') continue;
    const safeId = clean(id, 80);
    if (!safeId) continue;
    result[safeId] = {
      id: safeId, name: clean(source.name, 24) || safeId, entityCode: clean(source.entityCode, 16), generation: Math.max(0, Math.floor(finiteOr(source.generation, 0))),
      parents: uniqueStrings(source.parents, 2, 80), ambition: clamp(finiteOr(source.ambition, .4), 0, 1), honor: clamp(finiteOr(source.honor, .5), 0, 1), empathy: clamp(finiteOr(source.empathy, .5), 0, 1), cunning: clamp(finiteOr(source.cunning, .5), 0, 1), loyalty: clamp(finiteOr(source.loyalty, .5), 0, 1), influence: clamp(finiteOr(source.influence, .1), 0, 1),
      factionId: clean(source.factionId, 80), joinedYear: Math.max(0, finiteOr(source.joinedYear, 0)), title: clean(source.title, 80), status: source.status === 'dead' ? 'dead' : 'alive', betrayals: Math.max(0, Math.floor(finiteOr(source.betrayals, 0))), victories: Math.max(0, Math.floor(finiteOr(source.victories, 0))), defeats: Math.max(0, Math.floor(finiteOr(source.defeats, 0))), feats: uniqueStrings(source.feats, 12, 140), grudges: uniqueStrings(source.grudges, 16, 80), lastSeenYear: Math.max(0, finiteOr(source.lastSeenYear, 0)), diedYear: source.diedYear == null ? null : Math.max(0, finiteOr(source.diedYear, 0))
    };
  }
  return result;
}

function sanitizeFactions(value) {
  if (!Array.isArray(value)) return [];
  const valid = new Map(FACTION_ARCHETYPES.map(item => [item.key, item]));
  return value.filter(item => item && typeof item === 'object' && valid.has(item.key)).slice(0, 12).map(source => {
    const definition = valid.get(source.key);
    const relations = {};
    if (source.relations && typeof source.relations === 'object') for (const [id, relation] of Object.entries(source.relations).slice(0, 20)) relations[clean(id, 80)] = clamp(finiteOr(relation, 0), -1, 1);
    return {
      id: clean(source.id, 80) || `faction-${definition.key}`, key: definition.key, name: clean(source.name, 80) || definition.name,
      symbol: clean(source.symbol, 8) || definition.symbol, motto: clean(source.motto, 180) || definition.motto, ideology: { ...definition.ideology },
      memberIds: uniqueStrings(source.memberIds, 1000, 80), leaderId: clean(source.leaderId, 80), foundedYear: Math.max(0, finiteOr(source.foundedYear, 0)), lastLeadershipYear: Math.max(0, finiteOr(source.lastLeadershipYear, 0)), cohesion: clamp(finiteOr(source.cohesion, .5), 0, 1), power: Math.max(0, finiteOr(source.power, 0)), prestige: clamp(finiteOr(source.prestige, .1), 0, 1), treasury: clamp(finiteOr(source.treasury, .2), 0, 1), relations, territory: Math.max(0, Math.floor(finiteOr(source.territory, 0))), status: source.status === 'dormant' ? 'dormant' : 'active'
    };
  });
}

function sanitizeGovernment(value) {
  const type = Object.prototype.hasOwnProperty.call(GOVERNMENT_TYPES, value?.type) ? value.type : 'kinship';
  const definition = GOVERNMENT_TYPES[type];
  const laws = Array.isArray(value?.laws) ? value.laws.filter(item => item && typeof item === 'object').slice(-12).map(item => ({ key: clean(item.key, 40), label: clean(item.label, 100), text: clean(item.text, 220), enactedYear: Math.max(0, finiteOr(item.enactedYear, 0)), rulerId: clean(item.rulerId, 80) })).filter(item => item.key && item.label) : [];
  const previousRulers = Array.isArray(value?.previousRulers) ? value.previousRulers.filter(item => item && typeof item === 'object').slice(0, 24).map(item => ({ id: clean(item.id, 80), name: clean(item.name, 24), title: clean(item.title, 80), from: Math.max(0, finiteOr(item.from, 0)), to: Math.max(0, finiteOr(item.to, 0)) })) : [];
  return { type, rulerId: clean(value?.rulerId, 80), rulerName: clean(value?.rulerName, 24) || 'Sin designar', factionId: clean(value?.factionId, 80), title: clean(value?.title, 80) || definition.title, startedYear: Math.max(0, finiteOr(value?.startedYear, 0)), legitimacy: clamp(finiteOr(value?.legitimacy, .5), 0, 1), laws, succession: clean(value?.succession, 160) || 'mérito y memoria', previousRulers };
}

function sanitizeTreaties(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(-60).map(item => ({ id: clean(item.id, 80) || uid(), type: ['alliance', 'trade', 'peace'].includes(item.type) ? item.type : 'peace', parties: uniqueStrings(item.parties, 2, 80), startedYear: Math.max(0, finiteOr(item.startedYear, 0)), expiresYear: Math.max(0, finiteOr(item.expiresYear, 0)), status: ['active', 'expired', 'broken'].includes(item.status) ? item.status : 'expired', endedYear: item.endedYear == null ? null : Math.max(0, finiteOr(item.endedYear, 0)) })).filter(item => item.parties.length === 2);
}

function sanitizeWars(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(-40).map(item => ({ id: clean(item.id, 80) || uid(), name: clean(item.name, 100) || 'Guerra sin nombre', attackerId: clean(item.attackerId, 80), defenderId: clean(item.defenderId, 80), cause: clean(item.cause, 160), startedYear: Math.max(0, finiteOr(item.startedYear, 0)), endedYear: item.endedYear == null ? null : Math.max(0, finiteOr(item.endedYear, 0)), status: item.status === 'active' ? 'active' : 'ended', intensity: clamp(finiteOr(item.intensity, .3), 0, 1), attackerScore: Math.max(0, finiteOr(item.attackerScore, 0)), defenderScore: Math.max(0, finiteOr(item.defenderScore, 0)), casualties: { wounded: Math.max(0, Math.floor(finiteOr(item.casualties?.wounded, 0))), dead: Math.max(0, Math.floor(finiteOr(item.casualties?.dead, 0))) }, battles: Array.isArray(item.battles) ? item.battles.slice(-20).map(battle => ({ id: clean(battle.id, 80) || uid(), year: Math.max(0, finiteOr(battle.year, 0)), winnerId: clean(battle.winnerId, 80), loserId: clean(battle.loserId, 80), name: clean(battle.name, 100) })) : [], winnerId: clean(item.winnerId, 80), peaceTreatyId: clean(item.peaceTreatyId, 80) })).filter(item => item.attackerId && item.defenderId);
}

function sanitizeSagas(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').slice(0, 40).map(item => ({ id: clean(item.id, 80) || uid(), year: Math.max(0, finiteOr(item.year, 0)), updatedYear: Math.max(0, finiteOr(item.updatedYear, item.year)), type: clean(item.type, 30), title: clean(item.title, 100), summary: clean(item.summary, 260), actors: uniqueStrings(item.actors, 12, 80), chapters: Array.isArray(item.chapters) ? item.chapters.slice(-12).map(chapter => ({ year: Math.max(0, finiteOr(chapter.year, 0)), text: clean(chapter.text, 220) })).filter(chapter => chapter.text) : [], status: ['active', 'closed', 'legend'].includes(item.status) ? item.status : 'closed' })).filter(item => item.title);
}
