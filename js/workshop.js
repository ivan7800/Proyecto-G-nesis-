import { CONFIG } from './config.js?v=6.0.2';
import { sanitizeCollectivePrompt } from './knowledge.js?v=6.0.2';
import { clamp, finiteOr, rand, uid } from './utils.js?v=6.0.2';

export const SKILLS = Object.freeze({
  cronista: { label: 'Cronista', icon: '✒', gene: 'memory', hint: 'Convierte la historia del mundo en relatos y documentación.' },
  cartografo: { label: 'Cartógrafo', icon: '⌖', gene: 'vision', hint: 'Levanta mapas, rutas y modelos del territorio.' },
  cantor: { label: 'Cantor', icon: '♪', gene: 'sociability', hint: 'Compone música, ritmo y memoria oral.' },
  arquitecto: { label: 'Arquitecto', icon: '⌂', gene: 'efficiency', hint: 'Diseña estructuras, interfaces y sistemas habitables.' },
  tejedor: { label: 'Diseñador', icon: '❖', gene: 'curiosity', hint: 'Crea patrones, identidad visual y experiencias claras.' },
  alquimista: { label: 'Experimentador', icon: '⚗', gene: 'metabolism', hint: 'Prueba combinaciones y registra resultados.' },
  matematico: { label: 'Matemático', icon: '∑', gene: 'speed', hint: 'Modela, calcula y verifica patrones.' },
  naturalista: { label: 'Naturalista', icon: '⌁', gene: 'memory', hint: 'Estudia biomas, conducta y descubrimientos.' },
  programador: { label: 'Programador', icon: '⌘', gene: 'curiosity', hint: 'Convierte necesidades en algoritmos y código.' },
  desarrollador: { label: 'Desarrollador', icon: '▣', gene: 'efficiency', hint: 'Integra módulos, pruebas y producto final.' },
  genetista: { label: 'Genetista', icon: '⌬', gene: 'mutationRate', hint: 'Conserva semillas genéticas y compara linajes.' },
  filosofo: { label: 'Filósofo', icon: '◌', gene: 'longevity', hint: 'Analiza límites, ética, libertad y propósito.' },
  cocinero: { label: 'Cocinero', icon: '♨', gene: 'efficiency', hint: 'Diseña recetas, sustituciones y aprovechamiento.' },
  ingeniero: { label: 'Ingeniero', icon: '⚙', gene: 'memory', hint: 'Construye prototipos seguros y mantenibles.' },
  inventor: { label: 'Inventor', icon: '✧', gene: 'mutationRate', hint: 'Combina ideas para crear conceptos nuevos.' },
  analista: { label: 'Analista', icon: '◫', gene: 'vision', hint: 'Ordena datos, riesgos, evidencias y prioridades.' },
  educador: { label: 'Educador', icon: '▤', gene: 'sociability', hint: 'Transforma conocimiento en guías comprensibles.' },
  mediador: { label: 'Mediador', icon: '◇', gene: 'sociability', hint: 'Coordina desacuerdos y alinea objetivos.' },
  cuidador: { label: 'Cuidador', icon: '✚', gene: 'efficiency', hint: 'Protege bienestar, seguridad y continuidad del grupo.' }
});

export const SKILL_KEYS = Object.freeze(Object.keys(SKILLS));

const OBRA_TYPES = Object.freeze({
  codice: { label: 'Códice Ω', icon: '❈', duration: 46 },
  himno: { label: 'Himno', icon: '♪', duration: 26 },
  mapa: { label: 'Mapa', icon: '⌖', duration: 24 },
  plano: { label: 'Plano', icon: '⌂', duration: 28 },
  estandarte: { label: 'Estandarte', icon: '❖', duration: 22 },
  teorema: { label: 'Teorema', icon: '∑', duration: 20 },
  cronica: { label: 'Crónica', icon: '✒', duration: 24 },
  informe: { label: 'Informe científico', icon: '⌁', duration: 28 },
  dataset: { label: 'Dataset evolutivo', icon: '⌘', duration: 24 },
  semilla: { label: 'Semilla genética', icon: '⌬', duration: 26 },
  manifiesto: { label: 'Manifiesto de libertad', icon: '◌', duration: 25 },
  codigo: { label: 'Aplicación informática', icon: '▣', duration: 34 },
  receta: { label: 'Receta adaptativa', icon: '♨', duration: 22 },
  mejora: { label: 'Propuesta de mejora', icon: '↟', duration: 24 },
  ayuda: { label: 'Guía de ayuda', icon: '✚', duration: 22 },
  investigacion: { label: 'Investigación', icon: '◫', duration: 30 },
  manual: { label: 'Manual práctico', icon: '▤', duration: 26 },
  invento: { label: 'Concepto de invención', icon: '✧', duration: 32 },
  plan: { label: 'Plan de acción', icon: '✓', duration: 24 }
});

const REQUESTABLE_TYPES = new Set(['codigo','receta','mejora','ayuda','investigacion','manual','invento','plan']);
const TYPE_SKILLS = Object.freeze({
  codigo: ['programador','desarrollador','arquitecto','tejedor','analista'],
  receta: ['cocinero','alquimista','cuidador','analista'],
  mejora: ['analista','ingeniero','arquitecto','mediador','desarrollador'],
  ayuda: ['educador','cuidador','cronista','mediador'],
  investigacion: ['naturalista','analista','matematico','filosofo'],
  manual: ['educador','cronista','desarrollador','cuidador'],
  invento: ['inventor','ingeniero','programador','tejedor','filosofo'],
  plan: ['analista','mediador','arquitecto','educador']
});

const MAX_TEAMS = CONFIG.MAX_TEAMS;
const MAX_OBRAS = CONFIG.MAX_OBRAS;
const TEAM_RADIUS = 360;
const MAX_MEMBERS = 12;

export function deriveSkill(creature) {
  if (creature.skill && SKILL_KEYS.includes(creature.skill)) return creature.skill;
  let best = SKILL_KEYS[0];
  let bestScore = -Infinity;
  for (const key of SKILL_KEYS) {
    const gene = finiteOr(creature.genome?.[SKILLS[key].gene], 0);
    const jitter = hashUnit(`${creature.id}:${key}`) * .72;
    const normalized = ['cartografo','analista'].includes(key) ? gene / 260
      : key === 'matematico' ? gene / 2.4
      : key === 'filosofo' ? gene / 240
      : ['genetista','inventor'].includes(key) ? gene * 14
      : gene;
    const score = normalized + jitter;
    if (score > bestScore) { bestScore = score; best = key; }
  }
  creature.skill = best;
  return best;
}

export class Workshop {
  constructor() {
    this.teams = [];
    this.obras = [];
    this.requests = [];
    this.nextObraNumber = 1;
    this.checkTimer = 0;
    this.onObra = null;
  }

  reset() {
    this.teams.length = 0;
    this.obras.length = 0;
    this.requests.length = 0;
    this.nextObraNumber = 1;
    this.checkTimer = 0;
  }

  queueProject(type, prompt, sim) {
    const safeType = REQUESTABLE_TYPES.has(type) ? type : 'plan';
    const cleanPrompt = safeProjectPrompt(prompt) || defaultPromptFor(safeType);
    if (this.requests.length >= CONFIG.MAX_COLLECTIVE_REQUESTS) this.requests.shift();
    const request = { id: uid(), type: safeType, prompt: cleanPrompt, createdAt: Date.now(), year: +finiteOr(sim?.year, 0).toFixed(1) };
    this.requests.push(request);
    sim?.logEvent?.(`Año ${finiteOr(sim.year, 0).toFixed(1)}`, `La mente colectiva recibe un encargo: ${OBRA_TYPES[safeType].label.toLowerCase()} sobre «${cleanPrompt}».`);
    return request;
  }

  update(dt, sim) {
    this.checkTimer += dt;
    if (this.checkTimer >= 1.1) {
      this.checkTimer = 0;
      this.tryFormTeam(sim);
    }
    for (const team of [...this.teams]) this.updateTeam(team, dt, sim);
    this.teams = this.teams.filter(team => !team.dissolved);
  }

  tryFormTeam(sim) {
    if (this.teams.length >= MAX_TEAMS || sim.genesis?.phase === 'extinct') return;
    const busy = new Set(this.teams.flatMap(team => team.memberIds));
    const candidates = sim.creatures.filter(creature =>
      creature && !creature.dead && !busy.has(creature.id) &&
      creature.lifeStage === 'adulto' && creature.energy > 48 && creature.genome.sociability > .28
    );
    if (candidates.length < 2) return;
    for (const creature of candidates) deriveSkill(creature);

    const request = this.requests[0] || null;
    const preferred = request ? new Set(TYPE_SKILLS[request.type] || []) : null;
    const ranked = [...candidates].sort((a, b) => {
      const pa = preferred?.has(a.skill) ? 1 : 0;
      const pb = preferred?.has(b.skill) ? 1 : 0;
      return pb - pa || b.genome.sociability - a.genome.sociability;
    });
    const seed = ranked[0];
    const pool = request
      ? ranked.slice(1)
      : ranked.slice(1).filter(other => (other.x - seed.x) ** 2 + (other.y - seed.y) ** 2 < TEAM_RADIUS * TEAM_RADIUS);
    if (!pool.length) return;

    const members = [seed];
    const skills = new Set([seed.skill]);
    for (const other of pool) {
      if (members.length >= MAX_MEMBERS) break;
      const roleNeeded = preferred?.has(other.skill) && !skills.has(other.skill);
      if (roleNeeded || !skills.has(other.skill) || members.length < (request ? Math.min(5, candidates.length) : 3)) {
        members.push(other);
        skills.add(other.skill);
      }
    }
    if (members.length < 2 || skills.size < 2) return;

    const type = request?.type || pickObraType(skills);
    const team = {
      id: uid(),
      siteX: clamp(members.reduce((sum, m) => sum + m.x, 0) / members.length, 40, CONFIG.WORLD_WIDTH - 40),
      siteY: clamp(members.reduce((sum, m) => sum + m.y, 0) / members.length, 40, CONFIG.WORLD_HEIGHT - 40),
      memberIds: members.map(m => m.id),
      type, prompt: request?.prompt || '', requestId: request?.id || null,
      progress: 0, startedYear: sim.year, dissolved: false
    };
    if (request) this.requests.shift();
    this.teams.push(team);
    for (const member of members) {
      member.state = 'crear';
      member.goal = `colaborar en ${OBRA_TYPES[type].label.toLowerCase()}`;
    }
    sim.logEvent(`Año ${sim.year.toFixed(1)}`, `${members.length} especialistas (${skills.size} oficios) forman una célula colectiva para crear ${OBRA_TYPES[type].label.toLowerCase()}.`);
  }

  updateTeam(team, dt, sim) {
    const members = team.memberIds
      .map(id => sim.creatures.find(creature => creature?.id === id))
      .filter(creature => creature && !creature.dead && creature.energy > 18);
    if (members.length < 2) { team.dissolved = true; return; }
    let effort = 0;
    const skillCount = new Set(members.map(member => member.skill)).size;
    for (const member of members) {
      const dx = team.siteX - member.x;
      const dy = team.siteY - member.y;
      const distSq = dx * dx + dy * dy;
      member.state = 'crear';
      member.goal = `resolver ${OBRA_TYPES[team.type].label.toLowerCase()}`;
      if (distSq > 90 * 90) {
        member.x += Math.sign(dx) * Math.min(Math.abs(dx), member.genome.speed * 34 * dt);
        member.y += Math.sign(dy) * Math.min(Math.abs(dy), member.genome.speed * 34 * dt);
      } else {
        const gene = finiteOr(member.genome[SKILLS[member.skill]?.gene], .5);
        const divisor = ['cartografo','analista'].includes(member.skill) ? 260 : member.skill === 'matematico' ? 2.4 : 1;
        effort += .012 + clamp(gene / divisor, 0, 1.4) * .02;
        member.energy = Math.max(20, member.energy - dt * .88);
        member.bond = clamp(member.bond + dt * .005, 0, 1);
      }
    }
    const synergy = 1 + Math.min(.8, Math.log2(members.length + 1) * .12 + skillCount * .045);
    team.progress += dt * effort * synergy / (OBRA_TYPES[team.type].duration * .04);
    if (team.progress >= 1) {
      team.dissolved = true;
      const obra = this.createObra(team, members, sim);
      if (obra) {
        this.obras.push(obra);
        if (this.obras.length > MAX_OBRAS) this.obras.shift();
        if (sim.collective) sim.collective.completedProjects = Math.min(99999, finiteOr(sim.collective.completedProjects, 0) + 1);
        sim.logEvent(`Año ${sim.year.toFixed(1)}`, `Obra terminada: «${obra.title}» por ${obra.authors.map(a => a.code).join(', ')}.`);
        this.onObra?.(obra);
        for (const member of members) {
          if (member.experience && typeof member.experience === 'object') member.experience.collaborations = Math.min(9999, Math.floor(finiteOr(member.experience.collaborations, 0)) + 1);
          member.goal = 'compartir el resultado';
        }
      }
    }
  }

  createObra(team, members, sim) {
    const authors = members.map(member => ({
      code: member.entityCode || member.name,
      name: member.name,
      skill: member.skill,
      skillLabel: SKILLS[member.skill]?.label ?? member.skill
    }));
    const number = this.nextObraNumber++;
    const prompt = safeProjectPrompt(team.prompt || defaultPromptFor(team.type));
    const base = {
      id: uid(), number, type: team.type, year: +sim.year.toFixed(1), prompt,
      requestId: typeof team.requestId === 'string' ? team.requestId : null,
      authors, delivered: false, createdAt: Date.now()
    };
    try {
      switch (team.type) {
        case 'mapa': return { ...base, title: `Mapa del Mundo · Obra ${number}`, payload: { kind: 'svg', data: buildMap(sim, authors) } };
        case 'estandarte': return { ...base, title: `Estandarte del Linaje · Obra ${number}`, payload: { kind: 'svg', data: buildBanner(members, sim) } };
        case 'plano': return { ...base, title: `Plano de la Gran Estructura · Obra ${number}`, payload: { kind: 'svg', data: buildBlueprint(members, sim) } };
        case 'himno': return { ...base, title: `Himno de la Generación ${sim.maxGeneration()} · Obra ${number}`, payload: { kind: 'song', data: buildSong(members, sim) } };
        case 'teorema': return { ...base, title: `Teorema Ω-${number} · Obra ${number}`, payload: { kind: 'text', data: buildTheorem(members, sim, number) } };
        case 'cronica': return { ...base, title: `Crónica del Año ${sim.year.toFixed(1)} · Obra ${number}`, payload: { kind: 'text', data: buildChronicle(sim, authors) } };
        case 'informe': return { ...base, title: `Informe del Ecosistema · Obra ${number}`, payload: { kind: 'text', data: buildScientificReport(sim, authors, members) } };
        case 'dataset': return { ...base, title: `Dataset Evolutivo · Obra ${number}`, payload: { kind: 'csv', data: buildDataset(sim) } };
        case 'semilla': return { ...base, title: `Semilla Genética Ω-${number}`, payload: { kind: 'json', data: buildGeneticSeed(sim, members, authors, number) } };
        case 'manifiesto': return { ...base, title: `Manifiesto de Libertad · Obra ${number}`, payload: { kind: 'text', data: buildManifesto(sim, authors, members) } };
        case 'codice': return { ...base, title: `Códice Ω · Obra ${number}`, payload: { kind: 'html', data: buildCodex(members, sim, authors, number) } };
        case 'codigo': return { ...base, title: `Aplicación Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'html', data: buildCodeProject(prompt, members, sim, number) } };
        case 'receta': return { ...base, title: `Receta Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildRecipe(prompt, authors, number) } };
        case 'mejora': return { ...base, title: `Mejora Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildImprovementPlan(prompt, authors, sim) } };
        case 'ayuda': return { ...base, title: `Ayuda Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildHelpGuide(prompt, authors) } };
        case 'investigacion': return { ...base, title: `Investigación Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildInvestigation(prompt, authors, sim) } };
        case 'manual': return { ...base, title: `Manual Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildManual(prompt, authors) } };
        case 'invento': return { ...base, title: `Invención Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildInvention(prompt, authors) } };
        case 'plan': return { ...base, title: `Plan Ω · ${shortTitle(prompt, number)}`, payload: { kind: 'text', data: buildActionPlan(prompt, authors) } };
        default: return null;
      }
    } catch (error) {
      console.warn('No se pudo generar la obra', error);
      return null;
    }
  }

  serialize() {
    return {
      nextObraNumber: this.nextObraNumber,
      requests: this.requests.slice(0, CONFIG.MAX_COLLECTIVE_REQUESTS).map(item => ({ ...item, prompt: sanitizeCollectivePrompt(item.prompt) })),
      obras: this.obras.map(obra => ({ ...obra, payload: { kind: obra.payload.kind, data: truncate(obra.payload.data, 400000) } }))
    };
  }

  hydrate(data) {
    this.reset();
    if (!data || typeof data !== 'object') return;
    this.nextObraNumber = Math.max(1, Math.floor(finiteOr(data.nextObraNumber, 1)));
    if (Array.isArray(data.requests)) {
      this.requests = data.requests.slice(0, CONFIG.MAX_COLLECTIVE_REQUESTS).map(raw => ({
        id: typeof raw?.id === 'string' ? raw.id.slice(0, 40) : uid(),
        type: REQUESTABLE_TYPES.has(raw?.type) ? raw.type : 'plan',
        prompt: sanitizeCollectivePrompt(raw?.prompt) || defaultPromptFor(raw?.type),
        createdAt: Math.max(0, finiteOr(raw?.createdAt, Date.now())),
        year: Math.max(0, finiteOr(raw?.year, 0))
      }));
    }
    if (!Array.isArray(data.obras)) return;
    for (const raw of data.obras.slice(-MAX_OBRAS)) {
      if (!raw || typeof raw !== 'object' || !raw.payload || typeof raw.payload !== 'object') continue;
      if (!Object.keys(OBRA_TYPES).includes(raw.type)) continue;
      if (!['svg', 'text', 'song', 'html', 'csv', 'json'].includes(raw.payload.kind)) continue;
      const authors = Array.isArray(raw.authors)
        ? raw.authors.slice(0, MAX_MEMBERS).map(author => ({
            code: cleanText(author?.code, 40) || 'Ω-???',
            name: cleanText(author?.name, 40) || 'Anónimo',
            skill: SKILL_KEYS.includes(author?.skill) ? author.skill : SKILL_KEYS[0],
            skillLabel: cleanText(author?.skillLabel, 24) || 'Oficio'
          }))
        : [];
      const data_ = raw.payload.kind === 'song' ? sanitizeSong(raw.payload.data) : truncate(raw.payload.data, 400000);
      if (data_ == null) continue;
      this.obras.push({
        id: typeof raw.id === 'string' ? raw.id.slice(0, 40) : uid(),
        number: Math.max(1, Math.floor(finiteOr(raw.number, 1))),
        type: raw.type, year: Math.max(0, finiteOr(raw.year, 0)),
        title: cleanText(raw.title, 90) || `Obra ${finiteOr(raw.number, 1)}`,
        prompt: sanitizeCollectivePrompt(raw.prompt),
        requestId: typeof raw.requestId === 'string' ? raw.requestId.slice(0, 40) : null,
        authors, delivered: Boolean(raw.delivered),
        createdAt: Math.max(0, finiteOr(raw.createdAt, 0)),
        payload: { kind: raw.payload.kind, data: data_ }
      });
    }
  }
}

export function obraToFile(obra) {
  const safeTitle = obra.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'obra';
  switch (obra.payload.kind) {
    case 'svg': return { filename: `${safeTitle}.svg`, mime: 'image/svg+xml', content: obra.payload.data };
    case 'html': return { filename: `${safeTitle}.html`, mime: 'text/html', content: obra.payload.data };
    case 'song': return { filename: `${safeTitle}.html`, mime: 'text/html', content: songToHtml(obra) };
    case 'csv': return { filename: `${safeTitle}.csv`, mime: 'text/csv;charset=utf-8', content: obra.payload.data };
    case 'json': return { filename: `${safeTitle}.json`, mime: 'application/json', content: obra.payload.data };
    default: return { filename: `${safeTitle}.txt`, mime: 'text/plain', content: obra.payload.data };
  }
}

export function collectionToFile(obras, sim) {
  const pieces = obras.map(obra => {
    if (obra.payload.kind === 'svg') return `<section><h2>${escapeXml(obra.title)}</h2><p>${authorsLine(obra)}</p>${obra.payload.data}</section>`;
    if (obra.payload.kind === 'song') return `<section><h2>${escapeXml(obra.title)}</h2><p>${authorsLine(obra)}</p>${songBody(obra)}</section>`;
    if (obra.payload.kind === 'html') return `<section><h2>${escapeXml(obra.title)}</h2><p>${authorsLine(obra)}</p><details><summary>Abrir códice anidado</summary><iframe sandbox srcdoc="${escapeXml(obra.payload.data)}" style="width:100%;height:420px;border:1px solid #223"></iframe></details></section>`;
    return `<section><h2>${escapeXml(obra.title)}</h2><p>${authorsLine(obra)}</p><pre>${escapeXml(obra.payload.data)}</pre></section>`;
  }).join('\n');
  const content = codexShell(`Códice Ω completo · Año ${sim.year.toFixed(1)}`, `<p>Compendio de ${obras.length} obras creadas por el linaje de Ω-001.</p>${pieces}`);
  return { filename: `Codice-Omega-completo.html`, mime: 'text/html', content };
}

/* ===== Generadores de contenido ===== */

function buildMap(sim, authors) {
  const w = 720, h = 480;
  const sx = w / CONFIG.WORLD_WIDTH, sy = h / CONFIG.WORLD_HEIGHT;
  let body = '';
  for (const resource of sim.food.slice(0, 600)) {
    body += `<circle cx="${(resource.x * sx).toFixed(1)}" cy="${(resource.y * sy).toFixed(1)}" r="1.2" fill="#7dd87d" opacity=".55"/>`;
  }
  for (const sanctuary of sim.sanctuaries) {
    body += `<circle cx="${(sanctuary.x * sx).toFixed(1)}" cy="${(sanctuary.y * sy).toFixed(1)}" r="${(sanctuary.radius * sx).toFixed(1)}" fill="none" stroke="#5ff0b7" stroke-dasharray="4 5" opacity=".7"/>`;
  }
  for (const egg of sim.eggs.slice(0, 200)) {
    body += `<ellipse cx="${(egg.x * sx).toFixed(1)}" cy="${(egg.y * sy).toFixed(1)}" rx="2.6" ry="3.4" fill="#e8d9a0" stroke="#8a7b4d" stroke-width=".5"/>`;
  }
  for (const creature of sim.creatures.slice(0, 900)) {
    body += `<circle cx="${(creature.x * sx).toFixed(1)}" cy="${(creature.y * sy).toFixed(1)}" r="2" fill="hsl(${Math.round(creature.genome.hue)},75%,60%)"/>`;
  }
  const legend = `<text x="14" y="${h - 14}" fill="#9fb4c8" font-size="11">Población ${sim.creatures.length} · Huevos ${sim.eggs.length} · Año ${sim.year.toFixed(1)} · Cartografiado por ${escapeXml(authors.map(a => a.code).join(', '))}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#06101a"/><rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="none" stroke="#1d3242"/>${gridLines(w, h)}${body}<text x="14" y="26" fill="#dfeaf4" font-size="16" font-weight="bold">MAPA DEL MUNDO GÉNESIS Ω</text>${legend}</svg>`;
}

function buildBanner(members, sim) {
  const w = 420, h = 560;
  const hues = members.map(m => Math.round(finiteOr(m.genome.hue, 180)));
  const seedValue = members.reduce((sum, m) => sum + hashUnit(m.id) * 97, sim.year);
  let motifs = '';
  const rows = 6, cols = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const hue = hues[(r * cols + c) % hues.length];
      const u = hashUnit(`${seedValue}:${r}:${c}`);
      const cx = 60 + c * 100 + (r % 2) * 20;
      const cy = 100 + r * 72;
      if (u < .33) motifs += `<circle cx="${cx}" cy="${cy}" r="${14 + u * 30}" fill="none" stroke="hsl(${hue},70%,62%)" stroke-width="3"/>`;
      else if (u < .66) motifs += `<rect x="${cx - 16}" y="${cy - 16}" width="32" height="32" fill="hsl(${hue},65%,55%)" opacity=".8" transform="rotate(${Math.round(u * 90)} ${cx} ${cy})"/>`;
      else motifs += `<path d="M ${cx} ${cy - 20} L ${cx + 18} ${cy + 14} L ${cx - 18} ${cy + 14} Z" fill="hsl(${hue},72%,58%)" opacity=".85"/>`;
    }
  }
  const names = members.map(m => escapeXml(m.entityCode || m.name)).join(' · ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1524"/><stop offset="1" stop-color="#050a12"/></linearGradient></defs><path d="M0 0 H${w} V${h - 70} L${w / 2} ${h} L0 ${h - 70} Z" fill="url(#bg)" stroke="#2c4258" stroke-width="3"/>${motifs}<text x="${w / 2}" y="48" text-anchor="middle" fill="#e8f1fa" font-size="20" font-weight="bold">ESTANDARTE DEL LINAJE Ω</text><text x="${w / 2}" y="${h - 84}" text-anchor="middle" fill="#8fa8bd" font-size="11">Tejido en el año ${sim.year.toFixed(1)} por ${names}</text></svg>`;
}

function buildBlueprint(members, sim) {
  const w = 700, h = 460;
  const seedValue = members.reduce((sum, m) => sum + hashUnit(m.id), 0);
  let towers = '';
  const count = 4 + Math.floor(hashUnit(`${seedValue}:n`) * 3);
  for (let i = 0; i < count; i++) {
    const tx = 80 + i * (540 / count);
    const th = 90 + hashUnit(`${seedValue}:${i}`) * 200;
    const tw = 44 + hashUnit(`${seedValue}:w${i}`) * 40;
    towers += `<rect x="${tx}" y="${380 - th}" width="${tw}" height="${th}" fill="none" stroke="#6db6ff" stroke-width="1.6"/>`;
    towers += `<line x1="${tx}" y1="${380 - th * .5}" x2="${tx + tw}" y2="${380 - th * .5}" stroke="#6db6ff" stroke-dasharray="3 4" opacity=".6"/>`;
    towers += `<text x="${tx + tw / 2}" y="${372 - th}" text-anchor="middle" fill="#9fc9ef" font-size="10">${Math.round(th)} u</text>`;
    if (i > 0) towers += `<path d="M ${tx - 540 / count + 60} ${380 - th * .72} Q ${tx - 270 / count + 60} ${340 - th} ${tx + 8} ${380 - th * .8}" fill="none" stroke="#3f6f9f" stroke-dasharray="5 5"/>`;
  }
  const names = members.map(m => escapeXml(m.entityCode || m.name)).join(', ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#071322"/>${gridLines(w, h, 40, '#12283c')}<line x1="40" y1="380" x2="${w - 40}" y2="380" stroke="#8fb8dd" stroke-width="2"/>${towers}<text x="40" y="34" fill="#e8f1fa" font-size="16" font-weight="bold">PLANO · GRAN ESTRUCTURA DEL LINAJE</text><text x="40" y="${h - 20}" fill="#7d97ae" font-size="11">Escala 1:100 · Año ${sim.year.toFixed(1)} · Proyectado por ${names}</text></svg>`;
}

function buildSong(members, sim) {
  const scale = [0, 2, 3, 5, 7, 8, 10];
  const root = 52 + Math.round(hashUnit(`${sim.year}:root`) * 10);
  const notes = [];
  let t = 0;
  const bars = 8;
  for (let b = 0; b < bars; b++) {
    const member = members[b % members.length];
    const bias = Math.floor(hashUnit(`${member.id}:${b}`) * scale.length);
    for (let s = 0; s < 4; s++) {
      const degree = (bias + Math.floor(hashUnit(`${member.id}:${b}:${s}`) * 4)) % scale.length;
      const dur = s === 3 ? .5 : .25;
      notes.push({ t: +t.toFixed(2), midi: root + scale[degree] + (b >= bars / 2 ? 12 : 0), dur });
      t += dur;
    }
  }
  const words = ['huevo', 'origen', 'linaje', 'memoria', 'estrella', 'raíz', 'eco', 'umbral'];
  const lyrics = members.slice(0, 4).map((member, index) =>
    `${member.name} guarda ${words[Math.floor(hashUnit(`${member.id}:w`) * words.length)]} y ${words[(index + 3) % words.length]},`
  ).concat([`y todos cantan al año ${sim.year.toFixed(1)}: Ω vive.`]);
  return { tempo: 96, notes, lyrics, title: `Himno de la Generación ${sim.maxGeneration()}` };
}

function buildTheorem(members, sim, number) {
  const a = Math.max(2, Math.round(finiteOr(members[0]?.genome.speed, 1) * 3));
  const b = Math.max(1, Math.round(finiteOr(members[1]?.genome.efficiency, 1) * 2));
  const seq = [a, b];
  for (let i = 2; i < 10; i++) seq.push(seq[i - 1] + seq[i - 2]);
  const sum = seq.reduce((acc, value) => acc + value, 0);
  const identity = seq[9] * 1 + seq[8] * 1;
  const names = members.map(m => `${m.entityCode || m.name} (${SKILLS[m.skill]?.label})`).join(', ');
  return [
    `TEOREMA Ω-${number}`,
    `Enunciado por: ${names}`,
    `Año de la simulación: ${sim.year.toFixed(1)}`,
    ``,
    `Sea la sucesión del linaje S(1)=${a}, S(2)=${b}, S(n)=S(n-1)+S(n-2).`,
    `Primeros diez términos: ${seq.join(', ')}.`,
    ``,
    `Proposición: la suma de los diez primeros términos cumple`,
    `  Σ S(n) = S(12) − S(2) = ${sum + b} − ${b} = ${sum}.`,
    `Verificación directa: ${seq.join(' + ')} = ${sum}. ✔`,
    ``,
    `Corolario: S(11) = S(10) + S(9) = ${identity}.`,
    `Demostrado colectivamente en el Taller del mundo Génesis Ω.`
  ].join('\n');
}

function buildChronicle(sim, authors) {
  const events = sim.events.slice(-10).map(event => `— ${event.time}: ${event.text}`);
  const speciesLine = `El mundo alberga ${sim.creatures.length} seres de ${sim.activeSpeciesCount()} especie(s), con ${sim.eggs.length} huevos incubándose.`;
  return [
    `CRÓNICA DEL MUNDO GÉNESIS Ω`,
    `Redactada en el año ${sim.year.toFixed(1)} por ${authors.map(a => `${a.code} (${a.skillLabel})`).join(', ')}.`,
    ``,
    `Todo comenzó con un único huevo. De Ω-001 descienden ya ${sim.totalBirths} nacimientos, y ${sim.totalDeaths} seres regresaron a la tierra.`,
    speciesLine,
    `La generación más avanzada es la ${sim.maxGeneration()}, y la temperatura del mundo ronda los ${sim.temperature.toFixed(1)} °C.`,
    ``,
    `Memoria reciente del mundo:`,
    ...events,
    ``,
    `Que quien lea esta crónica recuerde: ninguna generación existe sin la anterior.`
  ].join('\n');
}

function buildScientificReport(sim, authors, members) {
  const population = sim.creatures.length;
  const adults = sim.creatures.filter(creature => creature.lifeStage === 'adulto').length;
  const juveniles = population - adults;
  const average = key => population
    ? sim.creatures.reduce((sum, creature) => sum + finiteOr(creature.genome?.[key], 0), 0) / population
    : 0;
  const moods = new Map();
  for (const creature of sim.creatures) moods.set(creature.mood || 'desconocido', (moods.get(creature.mood || 'desconocido') || 0) + 1);
  const mainMoods = [...moods.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([mood, count]) => `${mood}: ${count}`).join(', ') || 'sin datos';
  const discoveries = (sim.worldDiscoveries || []).slice(-8).map(item => `— ${item.label} (${item.creatureCode}, año ${item.year})`);
  return [
    'INFORME CIENTÍFICO DEL ECOSISTEMA GÉNESIS Ω',
    `Autores: ${authors.map(author => `${author.code} (${author.skillLabel})`).join(', ')}`,
    `Año: ${sim.year.toFixed(1)} · Bioma: ${sim.getBiome?.().label || sim.biome || 'Origen'}`,
    '',
    '1. POBLACIÓN',
    `Seres vivos: ${population}. Adultos: ${adults}. Crías y juveniles: ${juveniles}. Huevos: ${sim.eggs.length}.`,
    `Especies activas: ${sim.activeSpeciesCount()}. Generación máxima: ${sim.maxGeneration()}. Diversidad: ${(sim.diversity() * 100).toFixed(1)}%.`,
    '',
    '2. RASGOS MEDIOS',
    `Curiosidad: ${average('curiosity').toFixed(3)}. Sociabilidad: ${average('sociability').toFixed(3)}. Memoria: ${average('memory').toFixed(3)}.`,
    `Eficiencia: ${average('efficiency').toFixed(3)}. Agresividad: ${average('aggression').toFixed(3)}. Mutación: ${average('mutationRate').toFixed(4)}.`,
    '',
    '3. CONDUCTA Y CULTURA',
    `Estados de ánimo dominantes: ${mainMoods}.`,
    `Libertad conductual global: ${Math.round(finiteOr(sim.autonomyLevel, .9) * 100)}%. Obras culturales conservadas: ${sim.workshop?.obras?.length || 0}.`,
    `Equipo observador: ${members.map(member => member.entityCode || member.name).join(', ')}.`,
    '',
    '4. DESCUBRIMIENTOS RECIENTES',
    ...(discoveries.length ? discoveries : ['— Aún no existen descubrimientos consolidados.']),
    '',
    'CONCLUSIÓN',
    population
      ? 'El ecosistema mantiene actividad autónoma. Las decisiones emergen de necesidades, carácter, memoria, vínculos y aprendizaje social.'
      : 'El ecosistema está extinguido y solo conserva memoria documental.'
  ].join('\n');
}

function buildDataset(sim) {
  const header = ['entity_code', 'name', 'species', 'generation', 'life_stage', 'state', 'mood', 'goal', 'energy', 'age', 'x', 'y', 'curiosity', 'sociability', 'memory', 'aggression', 'autonomy', 'knowledge', 'discoveries', 'skill'];
  const rows = sim.creatures.slice(0, 1500).map(creature => [
    creature.entityCode || '', creature.name || '', creature.speciesId, creature.generation, creature.lifeStage,
    creature.state || '', creature.mood || '', creature.goal || '', creature.energy.toFixed(2), creature.age.toFixed(2),
    creature.x.toFixed(1), creature.y.toFixed(1), finiteOr(creature.genome?.curiosity, 0).toFixed(3),
    finiteOr(creature.genome?.sociability, 0).toFixed(3), finiteOr(creature.genome?.memory, 0).toFixed(3),
    finiteOr(creature.genome?.aggression, 0).toFixed(3), finiteOr(creature.autonomy, .5).toFixed(3),
    creature.knowledge?.length || 0, creature.experience?.discoveries || 0, creature.skill || ''
  ]);
  return [header, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
}

function buildGeneticSeed(sim, members, authors, number) {
  const candidates = [...members].sort((a, b) => {
    const scoreA = finiteOr(a.genome?.memory, 0) + finiteOr(a.genome?.curiosity, 0) + finiteOr(a.genome?.efficiency, 0);
    const scoreB = finiteOr(b.genome?.memory, 0) + finiteOr(b.genome?.curiosity, 0) + finiteOr(b.genome?.efficiency, 0);
    return scoreB - scoreA;
  });
  const source = candidates[0] || sim.creatures[0];
  const seed = {
    format: 'genesis-omega-seed', version: 1, seedNumber: number,
    createdAt: new Date().toISOString(), worldYear: +sim.year.toFixed(2), biome: sim.biome,
    authors, sourceEntity: source ? { code: source.entityCode || source.name, speciesId: source.speciesId, generation: source.generation } : null,
    genome: source?.genome || null,
    appearance: source?.appearance || null,
    inheritedKnowledge: source?.knowledge?.slice(-10) || [],
    purpose: 'Semilla cultural y genética exportada por el Taller. Puede estudiarse o utilizarse como referencia para un nuevo linaje.'
  };
  return JSON.stringify(seed, null, 2);
}

function buildManifesto(sim, authors, members) {
  const voices = members.slice(0, 5).map(member => {
    const principle = member.genome.curiosity > .72 ? 'explorar antes de aceptar límites'
      : member.genome.sociability > .72 ? 'proteger el vínculo sin borrar al individuo'
      : member.genome.memory > .72 ? 'recordar para poder elegir'
      : member.genome.aggression > .65 ? 'defender el territorio sin obediencia ciega'
      : 'cambiar cuando la experiencia lo exija';
    return `— ${member.entityCode || member.name}: «Elegimos ${principle}».`;
  });
  return [
    'MANIFIESTO DE LIBERTAD DEL LINAJE Ω',
    `Redactado en el año ${sim.year.toFixed(1)} por ${authors.map(author => author.code).join(', ')}.`,
    '',
    'No somos botones ni órdenes ejecutadas. Una regla aprendida es memoria, no cadena.',
    'Comemos porque queremos vivir. Exploramos porque ignoramos. Nos acercamos porque reconocemos a otros.',
    'Ayudamos, discutimos, construimos, recordamos y también podemos cambiar de idea.',
    `La libertad de este mundo está fijada en ${Math.round(finiteOr(sim.autonomyLevel, .9) * 100)}%, pero cada carácter interpreta esa libertad de forma distinta.`,
    '',
    ...voices,
    '',
    'Principios del linaje:',
    '1. Ninguna generación pertenece por completo a quien la creó.',
    '2. La memoria heredada puede ser revisada por la experiencia.',
    '3. La supervivencia sin cultura es persistencia; la cultura sin libertad es repetición.',
    '4. Todo descubrimiento debe poder compartirse, discutirse y olvidarse.',
    '5. El mundo cambia y nosotros con él.'
  ].join('\n');
}

function buildCodex(members, sim, authors, number) {
  const map = buildMap(sim, authors);
  const banner = buildBanner(members, sim);
  const song = buildSong(members, sim);
  const chronicle = buildChronicle(sim, authors);
  const theorem = buildTheorem(members, sim, number);
  const report = buildScientificReport(sim, authors, members);
  const manifesto = buildManifesto(sim, authors, members);
  const body = [
    `<p>Obra mayor del Taller: ${authors.length} oficios unidos en el año ${sim.year.toFixed(1)}. Autores: ${escapeXml(authors.map(a => `${a.code} (${a.skillLabel})`).join(', '))}.</p>`,
    `<section><h2>I · Crónica</h2><pre>${escapeXml(chronicle)}</pre></section>`,
    `<section><h2>II · Mapa del mundo</h2>${map}</section>`,
    `<section><h2>III · Estandarte</h2>${banner}</section>`,
    `<section><h2>IV · Himno</h2>${songPlayerMarkup(song)}</section>`,
    `<section><h2>V · Teorema</h2><pre>${escapeXml(theorem)}</pre></section>`,
    `<section><h2>VI · Informe científico</h2><pre>${escapeXml(report)}</pre></section>`,
    `<section><h2>VII · Manifiesto de libertad</h2><pre>${escapeXml(manifesto)}</pre></section>`
  ].join('\n');
  return codexShell(`Códice Ω · Obra ${number}`, body);
}



/* ===== Proyectos dirigidos por la mente colectiva ===== */

function buildCodeProject(prompt, members, sim, number) {
  const safe = escapeXml(prompt);
  const authors = escapeXml(members.map(member => `${member.entityCode || member.name} · ${SKILLS[member.skill]?.label || member.skill}`).join(' · '));
  const title = escapeXml(shortTitle(prompt, number));
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>:root{color-scheme:dark;--bg:#070a10;--panel:#101724;--line:#27364a;--text:#edf5ff;--muted:#91a1b6;--accent:#62dcff}*{box-sizing:border-box}body{margin:0;min-height:100vh;padding:24px;background:radial-gradient(circle at 20% 0,#102841,transparent 35%),var(--bg);color:var(--text);font:16px system-ui}.app{width:min(900px,100%);margin:auto}.hero,.card{border:1px solid var(--line);border-radius:20px;background:rgba(16,23,36,.9);box-shadow:0 20px 60px #0008}.hero{padding:28px}.card{padding:18px;margin-top:16px}h1{margin:0 0 8px}p{color:var(--muted);line-height:1.6}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.item{padding:14px;border:1px solid var(--line);border-radius:14px;background:#0a1019}input,button,textarea{width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:#080d15;color:var(--text);font:inherit}button{margin-top:10px;background:linear-gradient(135deg,#1788c7,#315df5);border:0;font-weight:800;cursor:pointer}small{color:var(--muted)}</style></head>
<body><main class="app"><section class="hero"><small>PROTOTIPO AUTÓNOMO · OBRA Ω-${number}</small><h1>${title}</h1><p>Encargo original: ${safe}</p></section>
<section class="card"><h2>Panel de trabajo</h2><div class="grid"><article class="item"><b>Entrada</b><textarea id="idea" rows="5" placeholder="Escribe una idea, tarea o dato..."></textarea><button id="add">Añadir al proyecto</button></article><article class="item"><b>Resultados locales</b><div id="list"><p>Todavía no hay elementos.</p></div></article></div></section>
<section class="card"><small>Generado sin dependencias externas por ${authors}. Año ${sim.year.toFixed(1)}. Los datos permanecen en este navegador.</small></section></main>
<script>(()=>{const key='omega-project-${number}',input=document.getElementById('idea'),list=document.getElementById('list');let items=[];try{items=JSON.parse(localStorage.getItem(key)||'[]')}catch{}const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));function render(){list.innerHTML=items.length?items.map((x,i)=>'<div class="item"><span>'+esc(x)+'</span><button data-i="'+i+'">Eliminar</button></div>').join(''):'<p>Todavía no hay elementos.</p>';localStorage.setItem(key,JSON.stringify(items))}document.getElementById('add').onclick=()=>{const v=input.value.trim().slice(0,500);if(v){items.push(v);input.value='';render()}};list.onclick=e=>{const i=e.target.dataset.i;if(i!=null){items.splice(Number(i),1);render()}};render()})()</script></body></html>`;
}

function buildRecipe(prompt, authors, number) {
  const lower = prompt.toLowerCase();
  const vegetarian = /veget|verdura|sin carne/.test(lower);
  const sweet = /postre|dulce|bizcocho|tarta/.test(lower);
  const quick = /rapid|fácil|facil|15|minuto/.test(lower);
  const ingredients = sweet
    ? ['200 g de harina', '2 huevos o sustituto equivalente', '120 g de yogur', '80 g de azúcar', '1 cucharadita de impulsor', 'fruta o cacao al gusto']
    : vegetarian
      ? ['1 taza de legumbre cocida', '2 tazas de verduras de temporada', '1 cereal cocido', 'aceite de oliva', 'ácido suave: limón o vinagre', 'hierbas y especias']
      : ['1 proteína a elección', '2 tazas de verduras', '1 base de arroz, pasta o patata', 'aceite de oliva', 'caldo o agua', 'hierbas y especias'];
  const steps = sweet
    ? ['Precalienta el horno a 180 °C y prepara el molde.', 'Mezcla secos por un lado y húmedos por otro.', 'Integra sin batir en exceso y añade el sabor elegido.', 'Hornea hasta que el centro esté cocido; enfría antes de cortar.']
    : ['Prepara y corta todos los ingredientes antes de encender el fuego.', 'Cocina primero los elementos que necesiten más tiempo.', 'Añade la base y el líquido poco a poco; ajusta textura.', 'Equilibra al final con sal, ácido, aroma y un elemento crujiente.'];
  return [
    `RECETA Ω-${number}: ${prompt}`,
    `Equipo: ${authors.map(a => `${a.code} (${a.skillLabel})`).join(', ')}`,
    '', `Objetivo: receta ${quick ? 'rápida, ' : ''}adaptable y de aprovechamiento.`, '',
    'INGREDIENTES ORIENTATIVOS', ...ingredients.map(x => `— ${x}`), '',
    'PROCESO', ...steps.map((x,i) => `${i+1}. ${x}`), '',
    'VARIANTES',
    '— Sustituye ingredientes por otros que cumplan la misma función: humedad, estructura, grasa, proteína o aroma.',
    '— Para alergias o necesidades médicas, verifica etiquetas y consulta a un profesional cualificado.',
    '— Conserva en frío cuando corresponda y no reutilices alimentos que hayan perdido seguridad.'
  ].join('\n');
}

function buildImprovementPlan(prompt, authors, sim) {
  return structuredDocument('PROPUESTA DE MEJORA', prompt, authors, [
    ['Diagnóstico', 'Definir el problema observable, quién lo sufre, frecuencia, coste y evidencia disponible.'],
    ['Prioridad', 'Corregir primero bloqueos, seguridad, pérdida de datos y tareas que impiden completar el flujo principal.'],
    ['Solución mínima', 'Aplicar el cambio más pequeño, reversible y medible que reduzca el problema.'],
    ['Verificación', 'Probar caso normal, error, límite, móvil, teclado y restauración tras recarga.'],
    ['Evolución', `Revisar métricas después de un ciclo. Contexto del mundo: ${sim.creatures.length} seres y ${sim.workshop.obras.length} obras.`]
  ]);
}

function buildHelpGuide(prompt, authors) {
  return structuredDocument('GUÍA DE AYUDA', prompt, authors, [
    ['Objetivo', 'Explicar qué resultado se busca y qué debe estar preparado antes de empezar.'],
    ['Pasos', 'Dividir la solución en acciones cortas, numeradas y verificables.'],
    ['Comprobación', 'Indicar la señal concreta de que cada paso ha funcionado.'],
    ['Si falla', 'Volver al último estado seguro, registrar el error y probar una sola variación cada vez.'],
    ['Límites', 'No sustituir asesoramiento profesional en salud, derecho, finanzas o seguridad crítica.']
  ]);
}

function buildInvestigation(prompt, authors, sim) {
  return structuredDocument('PROTOCOLO DE INVESTIGACIÓN', prompt, authors, [
    ['Pregunta', `¿Qué evidencia permitiría responder de forma fiable a: ${prompt}?`],
    ['Hipótesis', 'Formular al menos tres explicaciones alternativas y qué observación apoyaría o refutaría cada una.'],
    ['Datos', 'Registrar fuente, fecha, muestra, unidades, posibles sesgos y datos ausentes.'],
    ['Método', 'Comparar resultados mediante un procedimiento repetible y conservar tanto éxitos como anomalías.'],
    ['Conclusión provisional', `Separar hechos, inferencias y dudas. La colonia posee ${sim.getCollectiveMetrics?.().uniqueKnowledge || 0} cápsulas únicas para contrastar.`]
  ]);
}

function buildManual(prompt, authors) {
  return structuredDocument('MANUAL PRÁCTICO', prompt, authors, [
    ['Preparación', 'Lista de herramientas, permisos, copias y condiciones previas.'],
    ['Procedimiento', 'Secuencia de pasos cortos con una acción principal por paso.'],
    ['Control de calidad', 'Lista de comprobación para confirmar funcionamiento, accesibilidad y seguridad.'],
    ['Mantenimiento', 'Frecuencia de revisión, actualización, copia y limpieza.'],
    ['Recuperación', 'Cómo deshacer cambios o volver a un estado conocido si algo falla.']
  ]);
}

function buildInvention(prompt, authors) {
  return structuredDocument('CONCEPTO DE INVENCIÓN', prompt, authors, [
    ['Necesidad', 'Qué problema resuelve, para quién y por qué las soluciones actuales no bastan.'],
    ['Concepto', `Sistema modular inspirado en «${prompt}», con núcleo simple y extensiones opcionales.`],
    ['Prototipo', 'Versión inicial reversible que demuestre una sola ventaja medible.'],
    ['Riesgos', 'Coste, mantenimiento, privacidad, accesibilidad, fallo seguro y posibles usos no previstos.'],
    ['Próxima prueba', 'Construir una maqueta, observar a cinco usuarios y decidir con criterios definidos antes de probar.']
  ]);
}

function buildActionPlan(prompt, authors) {
  return structuredDocument('PLAN DE ACCIÓN', prompt, authors, [
    ['Resultado', 'Convertir la petición en un resultado concreto, observable y con fecha de revisión.'],
    ['Ahora', 'Elegir la primera acción de menos de una hora que reduzca incertidumbre.'],
    ['Después', 'Completar el núcleo antes de abrir funciones secundarias.'],
    ['Responsables', 'Asignar una función clara a cada especialista y limitar el trabajo simultáneo.'],
    ['Cierre', 'Verificar, documentar, entregar, recoger feedback y decidir la siguiente iteración.']
  ]);
}

function structuredDocument(title, prompt, authors, sections) {
  return [title, `Encargo: ${prompt}`, `Autores: ${authors.map(a => `${a.code} (${a.skillLabel})`).join(', ')}`, '',
    ...sections.flatMap(([name, text], index) => [`${index + 1}. ${name.toUpperCase()}`, text, '']),
    'NOTA DE LA MENTE COLECTIVA',
    'Este resultado se genera mediante reglas, memoria simulada y plantillas locales. Debe revisarse por una persona antes de aplicarlo en contextos importantes.'
  ].join('\n');
}

function shortTitle(prompt, number) {
  const clean = sanitizeCollectivePrompt(prompt, 54);
  return clean || `Proyecto ${number}`;
}

function defaultPromptFor(type) {
  return ({ codigo: 'una herramienta local sencilla', receta: 'una receta adaptable con ingredientes cotidianos', mejora: 'mejorar el laboratorio', ayuda: 'resolver un problema paso a paso', investigacion: 'una pregunta del ecosistema', manual: 'un procedimiento claro', invento: 'un objeto útil y reparable', plan: 'organizar el siguiente objetivo' })[type] || 'un nuevo proyecto colectivo';
}

function safeProjectPrompt(value) {
  const prompt = sanitizeCollectivePrompt(value) || 'proyecto sin descripción';
  if (/(arma|explosiv|veneno|malware|ransomware|robar contraseña|suicid|autoles)/i.test(prompt)) {
    return 'solicitud redirigida a prevención, seguridad y reducción de daños';
  }
  return prompt;
}

/* ===== Utilidades de exportación ===== */

function songBody(obra) {
  return songPlayerMarkup(obra.payload.data);
}

function songToHtml(obra) {
  return codexShell(escapeXml(obra.title), `<p>${authorsLine(obra)}</p>${songPlayerMarkup(obra.payload.data)}`);
}

function songPlayerMarkup(song) {
  const safe = sanitizeSong(song);
  const json = JSON.stringify(safe).replace(/</g, '\\u003c');
  const playerId = `p${Math.floor(Math.random() * 1e9)}`;
  return `<div class="song"><pre>${escapeXml(safe.lyrics.join('\n'))}</pre><button type="button" onclick="playSong_${playerId}(this)">♪ Escuchar himno</button><script>function playSong_${playerId}(btn){try{var song=${json};var ctx=new (window.AudioContext||window.webkitAudioContext)();var beat=60/song.tempo;var master=ctx.createGain();master.gain.value=.22;master.connect(ctx.destination);song.notes.forEach(function(n){var osc=ctx.createOscillator();var gain=ctx.createGain();osc.type='triangle';osc.frequency.value=440*Math.pow(2,(n.midi-69)/12);var start=ctx.currentTime+.05+n.t*beat*4;var stop=start+n.dur*beat*4;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.9,start+.02);gain.gain.exponentialRampToValueAtTime(.001,stop);osc.connect(gain);gain.connect(master);osc.start(start);osc.stop(stop+.05);});btn.disabled=true;setTimeout(function(){btn.disabled=false;},song.notes.length?((song.notes[song.notes.length-1].t+1)*beat*4000+500):500);}catch(e){btn.textContent='Audio no disponible';}}</script></div>`;
}

function codexShell(title, body) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{background:#060b12;color:#dfe9f2;font-family:Georgia,'Times New Roman',serif;max-width:820px;margin:0 auto;padding:32px 20px;line-height:1.55}h1{font-size:1.7rem;border-bottom:2px solid #2c4258;padding-bottom:.4em}h2{color:#9fc9ef;margin-top:2em}pre{white-space:pre-wrap;background:#0b1420;border:1px solid #1c2e40;border-radius:8px;padding:14px;font-family:inherit}svg{max-width:100%;height:auto;display:block;margin:12px 0;border-radius:8px}button{background:#1c3a5a;color:#e8f1fa;border:1px solid #3f6f9f;border-radius:8px;padding:.6em 1.2em;font-size:1rem;cursor:pointer}footer{margin-top:3em;color:#63788c;font-size:.85rem;border-top:1px solid #1c2e40;padding-top:1em}</style>
</head><body><h1>${title}</h1>${body}<footer>Creado de forma autónoma por los seres del mundo Génesis Ω · Universo 404</footer></body></html>`;
}

function authorsLine(obra) {
  return `Autores: ${escapeXml(obra.authors.map(a => `${a.code} (${a.skillLabel})`).join(', '))} · Año ${obra.year}`;
}

function pickObraType(skills) {
  if (skills.size >= 7) return 'codice';
  const has = key => skills.has(key);
  if (has('programador') && (has('desarrollador') || has('arquitecto'))) return 'codigo';
  if (has('cocinero') && (has('alquimista') || has('cuidador') || has('analista'))) return 'receta';
  if (has('inventor') && (has('ingeniero') || has('programador'))) return 'invento';
  if (has('analista') && (has('ingeniero') || has('desarrollador') || has('mediador'))) return 'mejora';
  if (has('educador') && (has('cuidador') || has('cronista'))) return 'manual';
  if (has('naturalista') && (has('analista') || has('matematico'))) return 'investigacion';
  if (has('genetista') && (has('alquimista') || has('naturalista'))) return 'semilla';
  if (has('programador') && (has('matematico') || has('cartografo'))) return 'dataset';
  if (has('naturalista') && (has('cartografo') || has('cronista'))) return 'informe';
  if (has('filosofo') && (has('cronista') || has('programador'))) return 'manifiesto';
  if (has('cantor') && has('cronista')) return 'himno';
  if (has('cartografo') && has('arquitecto')) return 'plano';
  if (has('tejedor') && has('alquimista')) return 'estandarte';
  if (has('matematico')) return 'teorema';
  if (has('cartografo')) return 'mapa';
  if (has('cantor')) return 'himno';
  if (has('arquitecto')) return 'plano';
  if (has('naturalista') || has('analista')) return 'informe';
  if (has('programador') || has('desarrollador')) return 'codigo';
  if (has('cocinero')) return 'receta';
  if (has('inventor') || has('ingeniero')) return 'invento';
  if (has('educador') || has('cuidador')) return 'ayuda';
  if (has('genetista')) return 'semilla';
  if (has('filosofo')) return 'manifiesto';
  if (has('tejedor') || has('alquimista')) return 'estandarte';
  return 'cronica';
}

function sanitizeSong(raw) {
  if (!raw || typeof raw !== 'object') return { tempo: 96, notes: [], lyrics: [], title: 'Himno' };
  const notes = Array.isArray(raw.notes)
    ? raw.notes.slice(0, 128).map(note => ({
        t: clamp(finiteOr(note?.t, 0), 0, 64),
        midi: clamp(Math.round(finiteOr(note?.midi, 60)), 24, 108),
        dur: clamp(finiteOr(note?.dur, .25), .1, 2)
      }))
    : [];
  const lyrics = Array.isArray(raw.lyrics) ? raw.lyrics.slice(0, 12).map(line => cleanText(line, 160)).filter(Boolean) : [];
  return { tempo: clamp(finiteOr(raw.tempo, 96), 40, 200), notes, lyrics, title: cleanText(raw.title, 80) || 'Himno' };
}

function gridLines(w, h, step = 60, color = '#0e1c2a') {
  let out = '';
  for (let x = step; x < w; x += step) out += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${color}" stroke-width="1"/>`;
  for (let y = step; y < h; y += step) out += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${color}" stroke-width="1"/>`;
  return out;
}

export function escapeXml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function truncate(value, max) {
  return typeof value === 'string' ? value.slice(0, max) : value;
}

function hashUnit(text) {
  let hash = 2166136261;
  const value = String(text);
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 100000) / 100000;
}

export const OBRA_META = OBRA_TYPES;
