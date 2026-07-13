// Sistema de especies lovecraftianas con siluetas 16-bit radicalmente distintas.
// El ARQUETIPO se deriva del genoma (emergente de la evolución): dos criaturas de
// linajes diferentes tienen formas totalmente distintas. Al mutar y crear especies
// nuevas, un linaje puede derivar de un arquetipo a otro.

const GRID = 34;

export const ARCHETYPES = [
  { id: 'cthulhu',    name: 'Estirpe de Cthulhu',   hueBase: 150 },
  { id: 'shoggoth',   name: 'Shoggoth',             hueBase: 265 },
  { id: 'migo',       name: 'Mi-Go de Yuggoth',     hueBase: 340 },
  { id: 'elderthing', name: 'Primigenio Estrella',  hueBase: 190 },
  { id: 'deep',       name: 'Profundo',             hueBase: 175 },
  { id: 'yith',       name: 'Gran Raza de Yith',    hueBase: 45  },
  { id: 'ghoul',      name: 'Gul',                  hueBase: 25  },
  { id: 'dagon',      name: 'Coloso de Dagon',      hueBase: 205 },
  { id: 'polyp',      name: 'Pólipo Volante',       hueBase: 290 },
  { id: 'yog',        name: 'Prole de Yog-Sothoth', hueBase: 110 }
];

export const ARCHETYPE_IDS = ARCHETYPES.map(a => a.id);

export function archetypeName(id) {
  return ARCHETYPES.find(a => a.id === id)?.name ?? 'Entidad';
}

// Deriva el arquetipo desde el genoma. Estable: mismos genes -> mismo arquetipo.
// Cada puntuación se normaliza a ~[0,1] para que los 10 arquetipos tengan oportunidad pareja.
export function archetypeFor(creature) {
  const g = creature.genome;
  const a = creature.appearance;
  const n = (v, min, max) => Math.max(0, Math.min(1, (v - min) / (max - min)));
  const scores = {
    cthulhu:    n(g.size, 2.5, 8.5) * .6 + g.aggression * .3 + n(a.earSize, .72, 1.55) * .3,
    shoggoth:   n(a.fluff, .65, 1.45) * .6 + (1 - n(g.vision, 55, 260)) * .3 + n(g.metabolism, .45, 1.85) * .2,
    migo:       n(g.speed, .45, 2.4) * .5 + n(g.efficiency, .35, 1.6) * .4 + g.curiosity * .3,
    elderthing: n(g.vision, 55, 260) * .6 + g.memory * .3 + n(g.longevity, 70, 260) * .3,
    deep:       g.sociability * .6 + (1 - g.aggression) * .3 + hueBand(g.hue, 175) * .5,
    yith:       g.memory * .6 + g.curiosity * .4 + n(g.longevity, 70, 260) * .3,
    ghoul:      g.aggression * .55 + n(g.metabolism, .45, 1.85) * .3 + a.darkness * .5,
    dagon:      n(g.size, 2.5, 8.5) * .7 + n(g.longevity, 70, 260) * .2 + (1 - n(g.speed, .45, 2.4)) * .3,
    polyp:      n(g.speed, .45, 2.4) * .5 + n(a.eyeSize, .78, 1.42) * .5 + hueBand(g.hue, 290) * .5,
    yog:        n(a.eyeSize, .78, 1.42) * .5 + n(g.mutationRate, .01, .16) * .4 + n(g.fertility, .35, 1.85) * .3
  };
  const bias = hashUnit(creature.id + ':arch');
  let best = 'cthulhu', bestScore = -Infinity;
  ARCHETYPE_IDS.forEach((id, i) => {
    const s = scores[id] + ((bias * 10 + i) % 1) * .25;
    if (s > bestScore) { bestScore = s; best = id; }
  });
  return best;
}

function paletteFor(archetype, hue, darkness, accentHue) {
  const rot = Math.max(0, Math.min(1, darkness));
  const base = ARCHETYPES.find(a => a.id === archetype)?.hueBase ?? hue;
  const h = (base * .6 + hue * .4);
  return {
    dark:   hslPix(h + 8, 42, Math.max(6, 14 - rot * 6)),
    body:   hslPix(h, 34, 28 - rot * 10),
    mid:    hslPix(h - 6, 30, 36 - rot * 8),
    light:  hslPix(h - 12, 26, Math.min(60, 46 - rot * 6)),
    flesh:  mix(hslPix(h + 24, 28, 34), hslPix(325, 32, 30), .4),
    glow:   hslPix(accentHue, 92, 60),
    eye:    hslPix(accentHue + 10, 96, 66),
    eyeDk:  hslPix(accentHue - 25, 82, 20),
    outline:'#04050a'
  };
}

export function paintEldritchSprite(canvas, creature, detail) {
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, canvas.width, canvas.height);
  g.imageSmoothingEnabled = false;
  const px = canvas.width / GRID;
  const archetype = creature._archetype || (creature._archetype = archetypeFor(creature));
  const pal = paletteFor(archetype, creature.genome.hue, creature.appearance.darkness, creature.appearance.accentHue);
  const cells = new Array(GRID * GRID).fill(null);
  const set = (x, y, c) => {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= GRID || y >= GRID) return;
    cells[y * GRID + x] = c;
  };
  const ctx = { set, cx: GRID / 2, cy: GRID / 2, pal, rng: seeded(creature.id + archetype), a: creature.appearance, g: creature.genome, detail };

  switch (archetype) {
    case 'cthulhu':    drawCthulhu(ctx); break;
    case 'shoggoth':   drawShoggoth(ctx); break;
    case 'migo':       drawMiGo(ctx); break;
    case 'elderthing': drawElderThing(ctx); break;
    case 'deep':       drawDeepOne(ctx); break;
    case 'yith':       drawYith(ctx); break;
    case 'ghoul':      drawGhoul(ctx); break;
    case 'dagon':      drawDagon(ctx); break;
    case 'polyp':      drawPolyp(ctx); break;
    case 'yog':        drawYog(ctx); break;
    default:           drawShoggoth(ctx);
  }

  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const c = cells[y * GRID + x];
      if (!c) continue;
      g.fillStyle = c;
      g.fillRect(x * px, y * px, Math.ceil(px), Math.ceil(px));
    }
  }
}

/* ============ SILUETAS POR ARQUETIPO ============ */

function drawCthulhu({ set, cx, cy, pal }) {
  blob(set, cx, cy - 3, 7, 8, pal, .18);
  for (let i = 0; i < 8; i++) {
    set(cx - 8 - i * .5, cy - 6 + i, pal.mid); set(cx - 8 - i * .5, cy - 5 + i, pal.dark);
    set(cx + 8 + i * .5, cy - 6 + i, pal.mid); set(cx + 8 + i * .5, cy - 5 + i, pal.dark);
  }
  for (let t = -3; t <= 3; t++) {
    let tx = cx + t * 1.3, ty = cy + 4;
    for (let i = 0; i < 5; i++) { ty++; tx += Math.sin(i + t) * .4; set(tx, ty, i > 3 ? pal.glow : pal.mid); }
  }
  eyes(set, [[cx - 2, cy - 4], [cx + 2, cy - 4]], 1.6, pal);
}

function drawShoggoth({ set, cx, cy, pal, rng, a }) {
  const R = 9 + a.fluff * 2;
  for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
    const w = 1 + Math.sin(Math.atan2(y, x) * 5 + rng() * 6) * .22;
    const d = Math.hypot(x, y) / R;
    if (d < w) set(cx + x, cy + y, d > w * .8 ? pal.outline : d > .55 ? pal.body : pal.mid);
  }
  const n = 5 + Math.floor(a.eyeSize * 4);
  for (let i = 0; i < n; i++) {
    const ang = rng() * 6.28, rr = rng() * R * .7;
    set(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, pal.eye);
  }
}

function drawMiGo({ set, cx, cy, pal }) {
  ellipse(set, cx, cy, 4, 7, pal.body, pal.outline);
  for (let i = 0; i < 7; i++) {
    set(cx - 6 - i, cy - 4 - i * .4, pal.light); set(cx + 6 + i, cy - 4 - i * .4, pal.light);
  }
  for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 4; i++) {
    set(cx + s * (4 + i), cy - 2 + i * 2, pal.dark);
    set(cx + s * (5 + i), cy - 1 + i * 2, pal.mid);
  }
  set(cx, cy - 8, pal.flesh); set(cx - 1, cy - 9, pal.glow); set(cx + 1, cy - 9, pal.glow);
}

function drawElderThing({ set, cx, cy, pal }) {
  ellipse(set, cx, cy, 4, 8, pal.body, pal.outline);
  for (let k = 0; k < 5; k++) {
    const ang = -Math.PI / 2 + (k - 2) * .5;
    for (let i = 1; i <= 4; i++) set(cx + Math.cos(ang) * i * 1.6, cy - 6 + Math.sin(ang) * i * 1.6, i > 3 ? pal.glow : pal.mid);
  }
  for (let k = 0; k < 5; k++) {
    const ang = Math.PI / 2 + (k - 2) * .45;
    for (let i = 1; i <= 4; i++) set(cx + Math.cos(ang) * i * 1.5, cy + 6 + Math.sin(ang) * i, pal.dark);
  }
  eyes(set, [[cx - 2, cy - 1], [cx + 2, cy - 1], [cx, cy + 2]], 1.1, pal);
}

function drawDeepOne({ set, cx, cy, pal }) {
  blob(set, cx, cy - 4, 5, 5, pal, .1);
  ellipse(set, cx, cy + 3, 4, 6, pal.body, pal.outline);
  set(cx - 5, cy + 2, pal.mid); set(cx - 6, cy + 4, pal.mid); set(cx + 5, cy + 2, pal.mid); set(cx + 6, cy + 4, pal.mid);
  for (let i = 0; i < 4; i++) set(cx, cy - 9 + i, pal.light);
  eyes(set, [[cx - 3, cy - 4], [cx + 3, cy - 4]], 2, pal);
}

function drawYith({ set, cx, cy, pal }) {
  for (let y = -8; y <= 7; y++) {
    const w = Math.round((y + 8) / 15 * 6) + 1;
    for (let x = -w; x <= w; x++) set(cx + x, cy + y, Math.abs(x) === w ? pal.outline : y < -2 ? pal.mid : pal.body);
  }
  for (let s = -1; s <= 1; s += 2) {
    for (let i = 0; i < 5; i++) set(cx + s * (2 + i), cy - 8 - (i < 3 ? i : 3) * .6, pal.mid);
    set(cx + s * 7, cy - 10, pal.glow);
  }
  eyes(set, [[cx - 2, cy - 9], [cx, cy - 11], [cx + 2, cy - 9]], 1, pal);
}

function drawGhoul({ set, cx, cy, pal }) {
  ellipse(set, cx, cy + 2, 4, 6, pal.body, pal.outline);
  blob(set, cx + 2, cy - 4, 3, 3, pal, .05);
  set(cx + 5, cy - 3, pal.mid); set(cx + 6, cy - 3, pal.dark);
  set(cx, cy - 7, pal.dark); set(cx + 3, cy - 7, pal.dark);
  for (let i = 0; i < 3; i++) { set(cx - 5, cy + 5 + i, pal.light); set(cx + 5, cy + 5 + i, pal.light); }
  eyes(set, [[cx + 1, cy - 4], [cx + 3, cy - 4]], 1, pal, pal.glow);
}

function drawDagon({ set, cx, cy, pal, a }) {
  const R = 8 + a.fluff;
  ellipse(set, cx, cy, 6, R, pal.body, pal.outline);
  set(cx - 6, cy - 4, pal.mid); set(cx + 6, cy - 4, pal.mid);
  for (let i = 0; i < 6; i++) { set(cx - 6 - (i > 2 ? 1 : 0), cy - 3 + i, pal.dark); set(cx + 6 + (i > 2 ? 1 : 0), cy - 3 + i, pal.dark); }
  blob(set, cx, cy - 7, 4, 3, pal, .05);
  set(cx - 4, cy - 8, pal.light); set(cx + 4, cy - 8, pal.light);
  for (let y = -3; y < 6; y += 2) for (let x = -3; x < 4; x += 2) set(cx + x, cy + y, pal.mid);
  eyes(set, [[cx - 2, cy - 7], [cx + 2, cy - 7]], 1.2, pal);
}

function drawPolyp({ set, cx, cy, pal, rng }) {
  for (let y = -8; y <= 8; y++) for (let x = -6; x <= 6; x++) {
    const d = Math.hypot(x / 6, y / 8);
    if (d < 1 && rng() > .35) set(cx + x, cy + y, d > .7 ? pal.mid : pal.light);
  }
  for (let i = -2; i <= 2; i++) { set(cx - 8, cy + i * 3, pal.glow); set(cx + 8, cy + i * 3, pal.glow); }
  eyes(set, [[cx, cy]], 2, pal);
}

function drawYog({ set, cx, cy, pal, rng, a }) {
  const spheres = 4 + Math.floor(a.eyeSize * 3);
  for (let s = 0; s < spheres; s++) {
    const ang = (s / spheres) * 6.28, rr = 4 + rng() * 3;
    const sx = cx + Math.cos(ang) * rr, sy = cy + Math.sin(ang) * rr;
    const r = 2 + rng() * 2.5;
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++)
      if (x * x + y * y <= r * r) set(sx + x, sy + y, x * x + y * y > (r - 1) * (r - 1) ? pal.glow : pal.mid);
  }
  for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++)
    if (x * x + y * y <= 9) set(cx + x, cy + y, x * x + y * y > 4 ? pal.body : pal.eye);
}

/* ============ MICRO ============ */
export function drawEldritchMicro(ctx, creature, zoom) {
  const archetype = creature._archetype || (creature._archetype = archetypeFor(creature));
  const a = creature.appearance;
  // Tamaño mínimo mayor para que se lean como criaturas incluso lejos.
  const r = Math.max(3.4 / zoom, creature.radius * 1.5);
  const baseHue = (ARCHETYPES.find(x => x.id === archetype)?.hueBase ?? creature.genome.hue) * .6 + creature.genome.hue * .4;
  const body = hslPix(baseHue, 42, 34 - a.darkness * 8);
  const rim = hslPix(baseHue, 55, 52 - a.darkness * 6);
  const glow = hslPix(a.accentHue, 95, 64);
  const p = Math.max(1, r * .34); // "pixel" del micro

  // Silueta por familia, con borde claro (rim) para destacar sobre el fondo oscuro.
  ctx.fillStyle = rim;
  if (archetype === 'yith' || archetype === 'elderthing') {
    // Triángulo (cono / cresta)
    ctx.beginPath(); ctx.moveTo(0, -r * 1.15); ctx.lineTo(r * 1.05, r); ctx.lineTo(-r * 1.05, r); ctx.closePath(); ctx.fill();
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.moveTo(0, -r * .7); ctx.lineTo(r * .7, r * .8); ctx.lineTo(-r * .7, r * .8); ctx.closePath(); ctx.fill();
  } else if (archetype === 'polyp' || archetype === 'dagon' || archetype === 'migo') {
    // Vertical alargado
    ctx.fillRect(-r * .85, -r * 1.1, r * 1.7, r * 2.2);
    ctx.fillStyle = body;
    ctx.fillRect(-r * .55, -r * .8, r * 1.1, r * 1.6);
  } else if (archetype === 'yog' || archetype === 'shoggoth') {
    // Masa redondeada (rombo relleno)
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.moveTo(0, -r * .6); ctx.lineTo(r * .6, 0); ctx.lineTo(0, r * .6); ctx.lineTo(-r * .6, 0); ctx.closePath(); ctx.fill();
  } else {
    // Bloque (cuerpo genérico)
    ctx.fillRect(-r, -r * .9, r * 2, r * 1.8);
    ctx.fillStyle = body;
    ctx.fillRect(-r * .65, -r * .6, r * 1.3, r * 1.3);
  }

  // Ojos brillantes: rasgo lovecraftiano que hace la silueta reconocible.
  ctx.fillStyle = glow;
  const multiEye = archetype === 'shoggoth' || archetype === 'yog' || archetype === 'yith';
  if (archetype === 'deep' || archetype === 'ghoul') {
    ctx.fillRect(-p * .4, -r * .25, p, p); // un ojo central
  } else if (multiEye) {
    ctx.fillRect(-r * .5, -r * .35, p, p);
    ctx.fillRect(r * .2, -r * .35, p, p);
    ctx.fillRect(-p * .4, r * .05, p, p);
  } else {
    ctx.fillRect(-r * .45, -r * .3, p, p);
    ctx.fillRect(r * .15, -r * .3, p, p);
  }
}

/* ============ PRIMITIVAS DE PÍXEL ============ */
function blob(set, cx, cy, rx, ry, pal, wob) {
  for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
    const d = Math.hypot(x / rx, y / ry);
    const w = 1 + Math.sin(Math.atan2(y, x) * 4) * wob;
    if (d < w) set(cx + x, cy + y, d > w * .82 ? pal.outline : d > .55 ? pal.body : pal.mid);
  }
}
function ellipse(set, cx, cy, rx, ry, fill, outline) {
  for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
    const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
    if (d <= 1) set(cx + x, cy + y, d > .78 ? outline : fill);
  }
}
function eyes(set, positions, r, pal, color) {
  for (const [ex, ey] of positions) {
    for (let y = -Math.ceil(r); y <= Math.ceil(r); y++) for (let x = -Math.ceil(r); x <= Math.ceil(r); x++)
      if (x * x + y * y <= r * r) set(ex + x, ey + y, x * x + y * y > (r - 1) * (r - 1) ? pal.eyeDk : (color || pal.eye));
    set(ex, ey, pal.outline);
  }
}

/* ---- color ---- */
function hueBand(hue, target) { const d = Math.abs(((hue - target + 540) % 360) - 180); return Math.max(0, 1 - d / 90); }
function hslPix(h, s, l) {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  let r = 0, gg = 0, b = 0;
  if (h < 60) [r, gg, b] = [c, x, 0]; else if (h < 120) [r, gg, b] = [x, c, 0];
  else if (h < 180) [r, gg, b] = [0, c, x]; else if (h < 240) [r, gg, b] = [0, x, c];
  else if (h < 300) [r, gg, b] = [x, 0, c]; else [r, gg, b] = [c, 0, x];
  const to = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(gg)}${to(b)}`;
}
function mix(hexA, hexB, t) {
  const a = parseInt(hexA.slice(1), 16), b = parseInt(hexB.slice(1), 16);
  const ar = a >> 16, ag = (a >> 8) & 255, ab = a & 255, br = b >> 16, bg = (b >> 8) & 255, bb = b & 255;
  return `#${(((Math.round(ar + (br - ar) * t)) << 16) | ((Math.round(ag + (bg - ag) * t)) << 8) | (Math.round(ab + (bb - ab) * t))).toString(16).padStart(6, '0')}`;
}
function seeded(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hashUnit(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}
