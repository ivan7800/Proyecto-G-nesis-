import { BIOMES, CONFIG } from './config.js?v=6.0.1';
import { clamp, hsl } from './utils.js?v=6.0.1';
import { paintEldritchSprite, drawEldritchMicro, archetypeFor, archetypeName } from './eldritch-sprites.js?v=6.0.1';

const BIOME_PALETTES = Object.freeze({
  origin: { outer: '#03070c', a: '#102234', b: '#07121c', c: '#03070b', line: '98,220,255', accent: '120,200,255' },
  meadow: { outer: '#07100b', a: '#335b39', b: '#173622', c: '#09170f', line: '161,229,149', accent: '214,244,153' },
  forest: { outer: '#030a07', a: '#183b2b', b: '#0b2118', c: '#030c09', line: '93,180,130', accent: '127,213,155' },
  desert: { outer: '#130d07', a: '#8b5e2d', b: '#4b2e18', c: '#1c1008', line: '255,201,123', accent: '255,221,154' },
  marsh: { outer: '#06100d', a: '#285546', b: '#103329', c: '#071712', line: '105,198,162', accent: '134,230,182' },
  tundra: { outer: '#071018', a: '#9db7c7', b: '#446578', c: '#162b38', line: '210,239,255', accent: '231,248,255' },
  volcanic: { outer: '#100403', a: '#4c1710', b: '#220b08', c: '#090302', line: '255,94,55', accent: '255,153,70' },
  abyss: { outer: '#020207', a: '#17132b', b: '#090817', c: '#020207', line: '146,112,255', accent: '121,94,255' }
});

export class Renderer {
  constructor(canvas, simulation) {
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error('No se encontró el lienzo principal');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('El navegador no permite iniciar Canvas 2D');
    this.canvas = canvas;
    this.ctx = context;
    this.simulation = simulation;
    this.camera = { x: CONFIG.WORLD_WIDTH / 2, y: CONFIG.WORLD_HEIGHT / 2, zoom: .72 };
    this.selectedId = null;
    this.followId = null;
    this.dragging = false;
    this.lastPointer = null;
    this.dpr = 1;
    this.hasSized = false;
    // Calidad de render: 'auto' decide según población y FPS; 'alta' fuerza detalle; 'rendimiento' fuerza modo pixelado ligero.
    this.qualityMode = 'auto';
    this.performanceActive = false;
    this.spriteCache = new Map();
    this.maxSpriteCache = 220;
    this.stars = Array.from({ length: 260 }, (_, index) => ({
      x: (index * 997) % CONFIG.WORLD_WIDTH,
      y: (index * 613) % CONFIG.WORLD_HEIGHT,
      a: .08 + (index % 9) / 70
    }));
    this.terrain = Array.from({ length: 420 }, (_, index) => ({
      x: (index * 733 + (index % 13) * 91) % CONFIG.WORLD_WIDTH,
      y: (index * 421 + (index % 17) * 57) % CONFIG.WORLD_HEIGHT,
      size: 4 + ((index * 19) % 24),
      rot: ((index * 37) % 360) * Math.PI / 180,
      kind: index % 7,
      a: .16 + (index % 8) * .035
    }));
    this.weatherParticles = Array.from({ length: 96 }, (_, index) => ({
      x: ((index * 83) % 997) / 997,
      y: ((index * 151) % 991) / 991,
      speed: .18 + (index % 11) * .025,
      size: 1 + (index % 3),
      drift: ((index % 7) - 3) * .012
    }));
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    const nextWidth = Math.round(width * this.dpr);
    const nextHeight = Math.round(height * this.dpr);
    if (this.canvas.width !== nextWidth) this.canvas.width = nextWidth;
    if (this.canvas.height !== nextHeight) this.canvas.height = nextHeight;
    if (!this.hasSized) {
      this.hasSized = true;
      this.resetCamera();
    } else {
      this.camera.zoom = clamp(this.camera.zoom, this.getMinZoom(), this.getMaxZoom());
      this.clampCamera();
    }
  }

  getViewportSize() {
    const rect = this.canvas.getBoundingClientRect();
    return { width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
  }

  getFitZoom(padding = 26) {
    const { width, height } = this.getViewportSize();
    const availableWidth = Math.max(1, width - padding * 2);
    const availableHeight = Math.max(1, height - padding * 2);
    return clamp(Math.min(availableWidth / CONFIG.WORLD_WIDTH, availableHeight / CONFIG.WORLD_HEIGHT), .1, 1.6);
  }

  getMinZoom() { return this.getFitZoom(26); }
  getMaxZoom() { return 3.4; }

  resetCamera() {
    this.clearFollow();
    this.camera.x = CONFIG.WORLD_WIDTH / 2;
    this.camera.y = CONFIG.WORLD_HEIGHT / 2;
    this.camera.zoom = this.getFitZoom();
    this.clampCamera();
  }

  zoomAt(sx, sy, factor) {
    const before = this.screenToWorld(sx, sy);
    this.camera.zoom = clamp(this.camera.zoom * factor, this.getMinZoom(), this.getMaxZoom());
    const after = this.screenToWorld(sx, sy);
    this.camera.x += before.x - after.x;
    this.camera.y += before.y - after.y;
    this.clampCamera();
    return this.camera.zoom;
  }

  setZoom(zoom, sx = null, sy = null) {
    const rect = this.canvas.getBoundingClientRect();
    const px = Number.isFinite(sx) ? sx : rect.left + rect.width / 2;
    const py = Number.isFinite(sy) ? sy : rect.top + rect.height / 2;
    const factor = clamp(zoom, this.getMinZoom(), this.getMaxZoom()) / Math.max(.001, this.camera.zoom);
    return this.zoomAt(px, py, factor);
  }

  clampCamera() {
    const { width, height } = this.getViewportSize();
    const zoom = Math.max(.01, this.camera.zoom);
    const halfWidth = width / zoom / 2;
    const halfHeight = height / zoom / 2;
    this.camera.x = halfWidth * 2 >= CONFIG.WORLD_WIDTH
      ? CONFIG.WORLD_WIDTH / 2
      : clamp(this.camera.x, halfWidth, CONFIG.WORLD_WIDTH - halfWidth);
    this.camera.y = halfHeight * 2 >= CONFIG.WORLD_HEIGHT
      ? CONFIG.WORLD_HEIGHT / 2
      : clamp(this.camera.y, halfHeight, CONFIG.WORLD_HEIGHT - halfHeight);
  }

  screenToWorld(sx, sy) {
    const rect = this.canvas.getBoundingClientRect();
    const zoom = Math.max(.01, this.camera.zoom);
    return {
      x: (sx - rect.left - rect.width / 2) / zoom + this.camera.x,
      y: (sy - rect.top - rect.height / 2) / zoom + this.camera.y
    };
  }

  worldToScreen(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (x - this.camera.x) * this.camera.zoom + rect.width / 2,
      y: (y - this.camera.y) * this.camera.zoom + rect.height / 2
    };
  }

  setFollow(id) { this.followId = typeof id === 'string' ? id : null; }
  clearFollow() { this.followId = null; }

  setQualityMode(mode) {
    if (['auto', 'alta', 'rendimiento'].includes(mode)) this.qualityMode = mode;
  }

  // El bucle principal llama esto una vez por medio segundo con los FPS medidos.
  reportFps(fps) {
    if (Number.isFinite(fps)) this.lastFps = fps;
  }

  // Decide si esta frame se dibuja en modo rendimiento. Combina la elección manual con
  // una heurística automática (población alta o FPS bajos) usando histéresis para no parpadear.
  resolvePerformanceMode() {
    if (this.qualityMode === 'rendimiento') return true;
    if (this.qualityMode === 'alta') return false;
    const population = this.simulation.creatures.length;
    const fps = this.lastFps ?? 60;
    if (this.performanceActive) {
      // Ya estamos en modo ligero: solo salimos si hay holgura clara.
      if (population < 280 && fps > 52) return false;
      return true;
    }
    // Estamos en modo detallado: entramos en ligero en cuanto la carga aprieta.
    if (population > 350 || fps < 45) return true;
    return false;
  }

  draw() {
    const ctx = this.ctx;
    const perf = this.resolvePerformanceMode();
    this.performanceActive = perf;
    // Pixel-art 16-bit: el suavizado se mantiene siempre desactivado para que los sprites se vean nítidos y cuadrados.
    ctx.imageSmoothingEnabled = false;
    const width = Math.max(1, this.canvas.width / this.dpr);
    const height = Math.max(1, this.canvas.height / this.dpr);
    const palette = BIOME_PALETTES[this.simulation.biome] ?? BIOME_PALETTES.origin;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = palette.outer;
    ctx.fillRect(0, 0, width, height);

    const followed = this.followId ? this.simulation.creatures.find(creature => creature?.id === this.followId) : null;
    if (followed) {
      this.camera.x += (followed.x - this.camera.x) * .08;
      this.camera.y += (followed.y - this.camera.y) * .08;
    } else if (this.followId) {
      this.clearFollow();
    }
    this.camera.zoom = clamp(this.camera.zoom, this.getMinZoom(), this.getMaxZoom());
    this.clampCamera();

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);
    this.drawBackground(ctx);
    this.drawLegacySites(ctx);
    this.drawSanctuaries(ctx);
    this.drawWorkshops(ctx);
    this.drawFood(ctx);
    this.drawEggs(ctx);
    this.drawCreatures(ctx);
    ctx.restore();
    this.drawAtmosphere(ctx, width, height);
    this.drawVignette(ctx, width, height);
  }

  drawBackground(ctx) {
    const key = Object.prototype.hasOwnProperty.call(BIOME_PALETTES, this.simulation.biome) ? this.simulation.biome : 'origin';
    const palette = BIOME_PALETTES[key];
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
    ctx.clip();

    // Fondo cuantizado: bandas y teselas en lugar de un gradiente recalculado cada frame.
    ctx.fillStyle = palette.c;
    ctx.fillRect(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
    const bandHeight = CONFIG.WORLD_HEIGHT / 5;
    const bands = [palette.a, palette.b, palette.b, palette.c, palette.c];
    for (let index = 0; index < bands.length; index++) {
      ctx.globalAlpha = .34 - index * .035;
      ctx.fillStyle = bands[index];
      ctx.fillRect(0, Math.floor(index * bandHeight), CONFIG.WORLD_WIDTH, Math.ceil(bandHeight + 1));
    }
    ctx.globalAlpha = 1;
    this.drawPixelTerrainGrid(ctx, palette);

    if (key === 'origin') this.drawOriginTerrain(ctx, palette);
    else if (key === 'meadow') this.drawMeadowTerrain(ctx, palette);
    else if (key === 'forest') this.drawForestTerrain(ctx, palette);
    else if (key === 'desert') this.drawDesertTerrain(ctx, palette);
    else if (key === 'marsh') this.drawMarshTerrain(ctx, palette);
    else if (key === 'tundra') this.drawTundraTerrain(ctx, palette);
    else if (key === 'volcanic') this.drawVolcanicTerrain(ctx, palette);
    else this.drawAbyssTerrain(ctx, palette);

    ctx.restore();
    ctx.strokeStyle = `rgba(${palette.line},.24)`;
    ctx.lineWidth = 2 / this.camera.zoom;
    ctx.strokeRect(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
  }

  drawPixelTerrainGrid(ctx, palette) {
    const tile = this.camera.zoom < .28 ? 96 : 48;
    const startX = Math.max(0, Math.floor((this.camera.x - 900 / this.camera.zoom) / tile) * tile);
    const endX = Math.min(CONFIG.WORLD_WIDTH, Math.ceil((this.camera.x + 900 / this.camera.zoom) / tile) * tile);
    const startY = Math.max(0, Math.floor((this.camera.y - 700 / this.camera.zoom) / tile) * tile);
    const endY = Math.min(CONFIG.WORLD_HEIGHT, Math.ceil((this.camera.y + 700 / this.camera.zoom) / tile) * tile);
    ctx.lineWidth = 1 / Math.max(.2, this.camera.zoom);
    ctx.strokeStyle = `rgba(${palette.line},.035)`;
    for (let x = startX; x <= endX; x += tile) {
      ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke();
    }
    for (let y = startY; y <= endY; y += tile) {
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke();
    }
    const count = this.performanceActive ? 70 : 150;
    for (let index = 0; index < count; index++) {
      const item = this.terrain[index * 2 % this.terrain.length];
      if (!item || !this.isVisible(item.x, item.y, 45)) continue;
      const size = 3 + (item.kind % 4) * 2;
      ctx.fillStyle = `rgba(${palette.accent},${.035 + item.a * .14})`;
      ctx.fillRect(Math.round(item.x / 2) * 2, Math.round(item.y / 2) * 2, size * 2, size);
      if (item.kind % 3 === 0) ctx.fillRect(Math.round(item.x / 2) * 2 + size, Math.round(item.y / 2) * 2 - size, size, size * 2);
    }
  }

  drawLegacySites(ctx) {
    const legacy = this.simulation.legacy;
    if (!legacy) return;
    const palette = BIOME_PALETTES[this.simulation.biome] ?? BIOME_PALETTES.origin;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    for (const ruin of legacy.ruins ?? []) {
      if (!ruin || !this.isVisible(ruin.x, ruin.y, 70)) continue;
      const condition = clamp(Number(ruin.condition) || 0, 0, 1);
      const scale = 18 + condition * 10;
      ctx.globalAlpha = .45 + condition * .45;
      ctx.fillStyle = '#17191d';
      ctx.fillRect(Math.round(ruin.x - scale), Math.round(ruin.y - scale * .35), Math.round(scale * 2), Math.round(scale * .7));
      ctx.fillStyle = `rgba(${palette.accent},.2)`;
      ctx.fillRect(Math.round(ruin.x - scale * .72), Math.round(ruin.y - scale), Math.round(scale * .38), Math.round(scale * .78));
      ctx.fillRect(Math.round(ruin.x + scale * .22), Math.round(ruin.y - scale * .72), Math.round(scale * .32), Math.round(scale * .5));
      ctx.fillStyle = '#050608';
      ctx.fillRect(Math.round(ruin.x - 3), Math.round(ruin.y - scale * .45), 7, Math.round(scale * .45));
      ctx.strokeStyle = `rgba(${palette.line},.45)`;
      ctx.lineWidth = 2 / Math.max(.25, this.camera.zoom);
      ctx.strokeRect(Math.round(ruin.x - scale), Math.round(ruin.y - scale), Math.round(scale * 2), Math.round(scale * 1.35));
    }
    for (const library of legacy.libraries ?? []) {
      if (!library || !this.isVisible(library.x, library.y, 80)) continue;
      const x = Math.round(library.x); const y = Math.round(library.y);
      ctx.globalAlpha = .95;
      ctx.fillStyle = '#0a1014'; ctx.fillRect(x - 28, y - 22, 56, 44);
      ctx.fillStyle = `rgba(${palette.accent},.62)`; ctx.fillRect(x - 22, y - 16, 44, 5);
      ctx.fillRect(x - 18, y - 7, 6, 19); ctx.fillRect(x - 7, y - 7, 6, 19); ctx.fillRect(x + 4, y - 7, 6, 19); ctx.fillRect(x + 15, y - 7, 6, 19);
      ctx.strokeStyle = `rgba(${palette.line},.8)`; ctx.lineWidth = 2 / Math.max(.25, this.camera.zoom); ctx.strokeRect(x - 28, y - 22, 56, 44);
    }
    ctx.restore();
  }

  drawAtmosphere(ctx, width, height) {
    const environment = this.simulation.legacy?.environment;
    if (!environment) return;
    const phase = environment.phase;
    let darkness = phase === 'noche' ? .48 : phase === 'madrugada' ? .38 : phase === 'ocaso' ? .22 : phase === 'amanecer' ? .12 : 0;
    if (darkness > 0) {
      ctx.fillStyle = `rgba(3,5,13,${darkness})`;
      ctx.fillRect(0, 0, width, height);
    }
    const weather = environment.weather || 'clear';
    if (weather === 'clear') return;
    const intensity = clamp(Number(environment.weatherIntensity) || .4, .1, 1);
    const count = this.performanceActive ? 32 : Math.round(48 + intensity * 42);
    const time = this.simulation.time || 0;
    ctx.save();
    ctx.globalAlpha = .28 + intensity * .38;
    for (let index = 0; index < Math.min(count, this.weatherParticles.length); index++) {
      const particle = this.weatherParticles[index];
      let x = ((particle.x + time * particle.drift) % 1 + 1) % 1 * width;
      let y = ((particle.y + time * particle.speed * (weather === 'fog' ? .035 : .12)) % 1) * height;
      if (weather === 'rain' || weather === 'storm') {
        ctx.fillStyle = weather === 'storm' ? '#b9d9e8' : '#82a9ba';
        ctx.fillRect(Math.round(x), Math.round(y), 1 + particle.size, 7 + particle.size * 2);
      } else if (weather === 'snow') {
        ctx.fillStyle = '#e8f4f7'; ctx.fillRect(Math.round(x), Math.round(y), particle.size + 1, particle.size + 1);
      } else if (weather === 'ash') {
        ctx.fillStyle = '#a28d7b'; ctx.fillRect(Math.round(x), Math.round(y), particle.size + 1, particle.size);
      } else if (weather === 'spores') {
        ctx.fillStyle = '#b8e986'; ctx.fillRect(Math.round(x), Math.round(y), 2 + particle.size, 2 + particle.size);
      } else if (weather === 'fog') {
        ctx.fillStyle = 'rgba(190,205,211,.09)';
        ctx.fillRect(Math.round(x - 40), Math.round(y), 90 + particle.size * 16, 7 + particle.size * 2);
      }
    }
    if (weather === 'storm' && Math.floor(time * 2.2) % 29 === 0) {
      ctx.fillStyle = 'rgba(225,242,255,.12)'; ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }

  drawOriginTerrain(ctx, palette) {
    ctx.strokeStyle = `rgba(${palette.line},.045)`;
    ctx.lineWidth = 1 / this.camera.zoom;
    const grid = this.camera.zoom < .35 ? 160 : 80;
    for (let x = 0; x <= CONFIG.WORLD_WIDTH; x += grid) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CONFIG.WORLD_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y <= CONFIG.WORLD_HEIGHT; y += grid) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CONFIG.WORLD_WIDTH, y); ctx.stroke();
    }
    for (const star of this.stars) {
      if (!this.isVisible(star.x, star.y, 8)) continue;
      ctx.fillStyle = `rgba(${palette.accent},${star.a})`;
      ctx.fillRect(star.x, star.y, Math.max(.8, 1.2 / this.camera.zoom), Math.max(.8, 1.2 / this.camera.zoom));
    }
  }

  drawMeadowTerrain(ctx, palette) {
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 30)) continue;
      const sway = Math.sin(this.simulation.time * .7 + item.x * .01) * 3;
      ctx.strokeStyle = `rgba(${palette.accent},${item.a})`;
      ctx.lineWidth = 1.2 / Math.max(.55, this.camera.zoom);
      ctx.beginPath();
      ctx.moveTo(item.x, item.y + item.size * .45);
      ctx.quadraticCurveTo(item.x + sway, item.y, item.x + Math.sin(item.rot) * item.size * .22, item.y - item.size * .5);
      ctx.stroke();
      if (item.kind === 0 && this.camera.zoom > .28) {
        ctx.fillStyle = `rgba(255,226,126,${Math.min(.8, item.a * 2.4)})`;
        ctx.beginPath(); ctx.arc(item.x, item.y - item.size * .5, 2.2 / this.camera.zoom, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  drawForestTerrain(ctx, palette) {
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 55) || item.kind > 4) continue;
      const trunk = Math.max(2.5, item.size * .16);
      ctx.fillStyle = `rgba(45,31,22,${.25 + item.a})`;
      ctx.fillRect(item.x - trunk / 2, item.y, trunk, item.size * .9);
      const canopy = ctx.createRadialGradient(item.x, item.y - item.size * .2, 2, item.x, item.y - item.size * .2, item.size);
      canopy.addColorStop(0, `rgba(${palette.accent},${Math.min(.5, item.a + .16)})`);
      canopy.addColorStop(1, 'rgba(4,24,14,0)');
      ctx.fillStyle = canopy;
      ctx.beginPath(); ctx.arc(item.x, item.y - item.size * .18, item.size, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawDesertTerrain(ctx, palette) {
    ctx.strokeStyle = `rgba(${palette.accent},.12)`;
    ctx.lineWidth = 2 / this.camera.zoom;
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 90) || item.kind > 3) continue;
      ctx.beginPath();
      ctx.ellipse(item.x, item.y, item.size * 3.2, item.size * .7, item.rot * .18, Math.PI * .08, Math.PI * .92);
      ctx.stroke();
      if (item.kind === 0 && this.camera.zoom > .3) {
        ctx.fillStyle = `rgba(68,42,24,${item.a + .1})`;
        ctx.beginPath(); ctx.ellipse(item.x + item.size, item.y - 2, item.size * .42, item.size * .25, item.rot, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  drawMarshTerrain(ctx, palette) {
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 60)) continue;
      if (item.kind < 2) {
        ctx.fillStyle = `rgba(8,36,42,${item.a + .08})`;
        ctx.beginPath(); ctx.ellipse(item.x, item.y, item.size * 2.2, item.size * .75, item.rot, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(${palette.accent},${item.a})`; ctx.stroke();
      } else if (item.kind < 5 && this.camera.zoom > .25) {
        ctx.strokeStyle = `rgba(${palette.accent},${item.a + .08})`;
        ctx.lineWidth = 1.3 / this.camera.zoom;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath(); ctx.moveTo(item.x + i * 4, item.y + item.size * .35); ctx.lineTo(item.x + i * 3, item.y - item.size * .55); ctx.stroke();
        }
      }
    }
  }

  drawTundraTerrain(ctx, palette) {
    ctx.strokeStyle = `rgba(${palette.accent},.15)`;
    ctx.lineWidth = 1.4 / this.camera.zoom;
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 55)) continue;
      if (item.kind < 4) {
        ctx.beginPath();
        ctx.moveTo(item.x - item.size, item.y);
        ctx.lineTo(item.x, item.y - item.size * .45);
        ctx.lineTo(item.x + item.size * .8, item.y + item.size * .15);
        ctx.stroke();
      }
      if (item.kind === 6 && this.camera.zoom > .28) {
        ctx.fillStyle = `rgba(240,252,255,${item.a + .1})`;
        ctx.beginPath(); ctx.arc(item.x, item.y, 1.7 / this.camera.zoom, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  drawVolcanicTerrain(ctx, palette) {
    ctx.lineCap = 'round';
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 65) || item.kind > 4) continue;
      ctx.strokeStyle = `rgba(${palette.accent},${item.a + .08})`;
      ctx.lineWidth = (1.5 + item.kind * .25) / this.camera.zoom;
      ctx.beginPath();
      ctx.moveTo(item.x - item.size, item.y - item.size * .4);
      ctx.lineTo(item.x - item.size * .2, item.y);
      ctx.lineTo(item.x + item.size * .15, item.y - item.size * .3);
      ctx.lineTo(item.x + item.size, item.y + item.size * .25);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }

  drawAbyssTerrain(ctx, palette) {
    for (const item of this.terrain) {
      if (!this.isVisible(item.x, item.y, 40)) continue;
      const pulse = .5 + Math.sin(this.simulation.time * .9 + item.rot) * .25;
      ctx.fillStyle = `rgba(${palette.accent},${Math.max(.04, item.a * pulse)})`;
      ctx.beginPath(); ctx.arc(item.x, item.y, Math.max(1, item.size * .16), 0, Math.PI * 2); ctx.fill();
      if (item.kind === 0 && this.camera.zoom > .32) {
        ctx.strokeStyle = `rgba(${palette.line},${item.a * .45})`;
        ctx.beginPath(); ctx.arc(item.x, item.y, item.size * 1.8, 0, Math.PI * 2); ctx.stroke();
      }
    }
  }

  drawWorkshops(ctx) {
    const teams = this.simulation.workshop?.teams ?? [];
    if (!teams.length) return;
    const pulse = (performance.now() % 2400) / 2400;
    for (const team of teams) {
      if (!team || team.dissolved || !this.isVisible(team.siteX, team.siteY, 120)) continue;
      ctx.save();
      ctx.translate(team.siteX, team.siteY);
      ctx.rotate(pulse * Math.PI * 2);
      ctx.beginPath();
      ctx.arc(0, 0, 58 + pulse * 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(140,196,255,.35)';
      ctx.setLineDash([10, 14]);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      const progress = Math.max(0, Math.min(1, team.progress));
      ctx.beginPath();
      ctx.arc(team.siteX, team.siteY, 44, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = 'rgba(95,240,183,.8)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = 'rgba(223,234,244,.85)';
      ctx.font = '600 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TALLER', team.siteX, team.siteY - 66);
      for (const memberId of team.memberIds) {
        const member = this.simulation.creatures.find(creature => creature?.id === memberId);
        if (!member || member.dead) continue;
        ctx.beginPath();
        ctx.moveTo(team.siteX, team.siteY);
        ctx.lineTo(member.x, member.y);
        ctx.strokeStyle = 'rgba(140,196,255,.16)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }
  }

  drawFood(ctx) {
    for (const resource of this.simulation.food) {
      if (!resource || !Number.isFinite(resource.x) || !Number.isFinite(resource.y) || !this.isVisible(resource.x, resource.y, 20)) continue;
      const pulse = 1 + Math.sin(this.simulation.time * 3 + resource.x) * .16;
      ctx.beginPath();
      ctx.arc(resource.x, resource.y, Math.max(.5, resource.radius * pulse), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(95,240,183,.75)';
      ctx.fill();
      if (this.camera.zoom > .55) {
        ctx.beginPath();
        ctx.arc(resource.x, resource.y, resource.radius * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(95,240,183,.05)';
        ctx.fill();
      }
    }
  }

  drawSanctuaries(ctx) {
    for (const sanctuary of this.simulation.sanctuaries) {
      if (!sanctuary || !this.isVisible(sanctuary.x, sanctuary.y, sanctuary.radius)) continue;
      const gradient = ctx.createRadialGradient(sanctuary.x, sanctuary.y, 0, sanctuary.x, sanctuary.y, sanctuary.radius);
      gradient.addColorStop(0, 'rgba(95,240,183,.13)');
      gradient.addColorStop(1, 'rgba(95,240,183,0)');
      ctx.beginPath();
      ctx.arc(sanctuary.x, sanctuary.y, sanctuary.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(95,240,183,.18)';
      ctx.setLineDash([8, 12]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }


  drawEggs(ctx) {
    for (const egg of this.simulation.eggs ?? []) {
      if (!egg || !this.isVisible(egg.x, egg.y, 70)) continue;
      const duration = Number.isFinite(egg.hatchAt) ? Math.max(.1, egg.hatchAt - egg.laidAt) : 1;
      const progress = Number.isFinite(egg.hatchAt) ? clamp((this.simulation.time - egg.laidAt) / duration, 0, 1) : 0;
      const pulse = 1 + Math.sin(this.simulation.time * 2.5 + egg.wobble) * .035;
      const wobble = progress > .55 ? Math.sin(this.simulation.time * (6 + progress * 8) + egg.wobble) * progress * .12 : 0;
      ctx.save();
      ctx.translate(egg.x, egg.y);
      ctx.rotate(wobble);
      ctx.scale(pulse, pulse);
      const radius = egg.founder ? 28 : 21;
      const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, radius * 3.2);
      aura.addColorStop(0, egg.founder ? 'rgba(255,77,99,.28)' : 'rgba(98,220,255,.22)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, 0, radius * 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = egg.founder ? 'rgba(255,77,99,.44)' : 'rgba(98,220,255,.36)';
      ctx.lineWidth = 1.5 / this.camera.zoom;
      ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.ellipse(0, radius * .62, radius * 1.25, radius * .42, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      const shell = ctx.createLinearGradient(-radius, -radius, radius, radius);
      shell.addColorStop(0, '#edf7fa'); shell.addColorStop(.45, egg.founder ? '#c8d9dc' : '#c4e8ef'); shell.addColorStop(1, egg.founder ? '#722938' : '#176777');
      ctx.fillStyle = shell; ctx.strokeStyle = 'rgba(3,8,12,.9)'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.ellipse(0, 0, radius * .7, radius, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.globalAlpha = .45; ctx.fillStyle = egg.founder ? '#ff4d63' : hsl(egg.genome?.hue ?? 190, 75, 52);
      ctx.beginPath(); ctx.ellipse(-radius * .18, radius * .05, radius * .22, radius * .72, -.18, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      if (progress > .35) {
        ctx.strokeStyle = 'rgba(15,22,28,.82)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-2, -radius * .72); ctx.lineTo(5, -radius * .48); ctx.lineTo(-3, -radius * .24); ctx.lineTo(7, -radius * .02); ctx.stroke();
      }
      if (progress > .72) {
        ctx.beginPath(); ctx.moveTo(6, -radius * .02); ctx.lineTo(-4, radius * .2); ctx.lineTo(6, radius * .42); ctx.stroke();
      }
      ctx.restore();
      if (this.camera.zoom > .45) {
        ctx.save(); ctx.font = `${Math.max(10, 12 / this.camera.zoom)}px system-ui`; ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(231,246,255,.9)'; ctx.fillText(egg.entityCode || 'HUEVO Ω', egg.x, egg.y + radius + 22 / this.camera.zoom); ctx.restore();
      }
    }
  }

  drawCreatures(ctx) {
    const zoom = this.camera.zoom;
    const perf = this.performanceActive;
    const population = this.simulation.creatures.length;
    // Viewport cacheado UNA vez por frame (getBoundingClientRect fuerza reflow: no llamarlo por criatura).
    const rect = this.canvas.getBoundingClientRect();
    const halfW = rect.width / zoom / 2;
    const halfH = rect.height / zoom / 2;
    const viewLeft = this.camera.x - halfW;
    const viewRight = this.camera.x + halfW;
    const viewTop = this.camera.y - halfH;
    const viewBottom = this.camera.y + halfH;

    // Primero contamos cuántos seres están realmente en pantalla: eso decide el nivel de detalle,
    // no la población total (con culling, dibujar 80 sprites visibles es barato aunque existan 1500).
    const visible = [];
    for (const creature of this.simulation.creatures) {
      if (!creature || !creature.genome) continue;
      const x = creature.x, y = creature.y;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const margin = 60;
      if (x < viewLeft - margin || x > viewRight + margin || y < viewTop - margin || y > viewBottom + margin) continue;
      visible.push(creature);
    }

    const onScreen = visible.length;
    // El detalle depende de cuántos hay EN PANTALLA y del zoom, no de la población global.
    let detail;
    if (zoom < .3) detail = 'micro';
    else if (perf && onScreen > 220) detail = 'micro';
    else if (onScreen > 340) detail = 'micro';
    else if (zoom < .55 || onScreen > 140) detail = 'simple';
    else detail = 'full';

    const useShadow = !perf && detail === 'full' && onScreen < 90;

    for (const creature of visible) {
      const selected = creature.id === this.selectedId;
      const bob = perf ? 0 : Math.sin(this.simulation.time * (5.2 + creature.genome.speed) + hashUnit(creature.id) * 20) * Math.min(1.3, creature.radius * .16);
      const visualRadius = Number(creature.visualRadius) || (Number(creature.radius) || 4) * 4;

      if (detail === 'micro') {
        ctx.save();
        ctx.translate(creature.x, creature.y + bob);
        this.drawMicroCreature(ctx, creature);
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(creature.x, creature.y + bob);
        const growth = Number(creature.growthScale) || 1;
        ctx.scale(growth, growth);
        if (Number.isFinite(creature.angle) && Math.cos(creature.angle) < 0) ctx.scale(-1, 1);
        const sprite = this.getCreatureSprite(creature, detail);
        const size = creature.radius * (detail === 'full' ? 9.4 : 8.2) * (1 + creature.appearance.fluff * .06);
        if (useShadow) {
          ctx.shadowColor = hsl(creature.appearance.accentHue, 90, 55, .5);
          ctx.shadowBlur = selected ? 16 : 6;
        }
        ctx.drawImage(sprite, -size * .5, -size * .5, size, size);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      if (selected) this.drawSelection(ctx, creature, visualRadius);
      if ((selected || creature.speechUntil > this.simulation.time) && creature.lastSpeech) this.drawSpeechBubble(ctx, creature);
      if (selected && zoom > .48) this.drawNameplate(ctx, creature, visualRadius);
    }
  }

  drawMicroCreature(ctx, creature) {
    drawEldritchMicro(ctx, creature, this.camera.zoom);
  }

  drawSelection(ctx, creature, visualRadius) {
    const pulse = 1 + Math.sin(this.simulation.time * 5) * .05;
    ctx.save();
    ctx.translate(creature.x, creature.y);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.4 / this.camera.zoom;
    ctx.beginPath();
    ctx.arc(0, 0, visualRadius * 1.04 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = hsl(creature.genome.hue, 90, 65, .48);
    ctx.lineWidth = .85 / this.camera.zoom;
    ctx.beginPath();
    ctx.arc(0, 0, creature.genome.vision, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawNameplate(ctx, creature, visualRadius) {
    const fontSize = 10 / this.camera.zoom;
    ctx.save();
    ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = `${creature.name} · ${creature.personality}`;
    const width = ctx.measureText(text).width + 14 / this.camera.zoom;
    const height = 20 / this.camera.zoom;
    const y = creature.y + visualRadius + 11 / this.camera.zoom;
    roundedRect(ctx, creature.x - width / 2, y - height / 2, width, height, 7 / this.camera.zoom);
    ctx.fillStyle = 'rgba(4,8,13,.84)'; ctx.fill();
    ctx.strokeStyle = hsl(creature.genome.hue, 80, 65, .38); ctx.lineWidth = .8 / this.camera.zoom; ctx.stroke();
    ctx.fillStyle = '#eaf6ff'; ctx.fillText(text, creature.x, y);
    ctx.restore();
  }

  drawSpeechBubble(ctx, creature) {
    const text = String(creature.lastSpeech || '').slice(0, 92);
    if (!text) return;
    const fontSize = 11 / this.camera.zoom;
    const maxWidth = 170 / this.camera.zoom;
    ctx.save();
    ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
    const lines = wrapText(ctx, text, maxWidth, 3);
    const lineHeight = 15 / this.camera.zoom;
    const padding = 9 / this.camera.zoom;
    const width = Math.min(maxWidth, Math.max(...lines.map(line => ctx.measureText(line).width), 48 / this.camera.zoom)) + padding * 2;
    const height = lines.length * lineHeight + padding * 1.5;
    const x = creature.x + (Number(creature.visualRadius) || 20) * .75;
    const y = creature.y - (Number(creature.visualRadius) || 20) - height - 10 / this.camera.zoom;
    roundedRect(ctx, x, y, width, height, 9 / this.camera.zoom);
    ctx.fillStyle = 'rgba(5,12,18,.92)'; ctx.fill();
    ctx.strokeStyle = 'rgba(98,220,255,.55)'; ctx.lineWidth = 1 / this.camera.zoom; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 14 / this.camera.zoom, y + height);
    ctx.lineTo(x + 21 / this.camera.zoom, y + height + 8 / this.camera.zoom);
    ctx.lineTo(x + 30 / this.camera.zoom, y + height);
    ctx.closePath(); ctx.fillStyle = 'rgba(5,12,18,.92)'; ctx.fill();
    ctx.fillStyle = '#dff8ff';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    lines.forEach((line, index) => ctx.fillText(line, x + padding, y + padding * .65 + index * lineHeight));
    ctx.restore();
  }

  getCreatureSprite(creature, detail = 'full') {
    const a = creature.appearance;
    const archetype = creature._archetype || (creature._archetype = archetypeFor(creature));
    // La clave incluye el arquetipo (la silueta) además de los genes visuales discretizados.
    const key = ['eld', archetype, detail, Math.round(creature.genome.hue / 14), Math.round(a.accentHue / 16),
      Math.round(a.eyeSize * 3), Math.round(a.fluff * 3), Math.round(a.darkness * 4)].join(':');
    if (this.spriteCache.has(key)) return this.spriteCache.get(key);
    const canvas = document.createElement('canvas');
    // Baja resolución = píxeles cuadrados reales estilo 16-bit. Al escalarse sin suavizado se ve pixelado.
    const size = detail === 'full' ? 96 : 64;
    canvas.width = size;
    canvas.height = size;
    paintEldritchSprite(canvas, creature, detail);
    if (this.spriteCache.size >= this.maxSpriteCache) this.spriteCache.delete(this.spriteCache.keys().next().value);
    this.spriteCache.set(key, canvas);
    return canvas;
  }

  drawPortrait(canvas, creature) {
    if (!(canvas instanceof HTMLCanvasElement) || !creature) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = Math.max(52, canvas.getBoundingClientRect().width || 64);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const gradient = ctx.createRadialGradient(size * .5, size * .4, 2, size * .5, size * .5, size * .7);
    gradient.addColorStop(0, hsl(creature.genome.hue, 70, 55, .24));
    gradient.addColorStop(1, 'rgba(5,8,13,.1)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = false;
    const sprite = this.getCreatureSprite(creature, 'full');
    ctx.drawImage(sprite, size * .06, size * .06, size * .88, size * .88);
  }

  isVisible(x, y, margin = 0) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    const rect = this.canvas.getBoundingClientRect();
    const halfWidth = rect.width / this.camera.zoom / 2 + margin;
    const halfHeight = rect.height / this.camera.zoom / 2 + margin;
    return x > this.camera.x - halfWidth && x < this.camera.x + halfWidth && y > this.camera.y - halfHeight && y < this.camera.y + halfHeight;
  }

  drawVignette(ctx, width, height) {
    const edge = Math.max(20, Math.min(width, height) * .075);
    ctx.fillStyle = 'rgba(0,0,0,.34)';
    ctx.fillRect(0, 0, width, edge);
    ctx.fillRect(0, height - edge, width, edge);
    ctx.fillRect(0, edge, edge, height - edge * 2);
    ctx.fillRect(width - edge, edge, edge, height - edge * 2);
    ctx.fillStyle = 'rgba(255,255,255,.018)';
    for (let y = 0; y < height; y += 4) ctx.fillRect(0, y, width, 1);
  }
}

function drawEllipse(ctx, x, y, rx, ry, rotation, fill, stroke, lineWidth = 3) {
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rotation, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
}

function drawEar(ctx, rootX, rootY, tipX, tipY, baseX, baseY, fill, inner, outline) {
  ctx.beginPath();
  ctx.moveTo(rootX, rootY);
  ctx.quadraticCurveTo((rootX + tipX) * .5, tipY - 8, tipX, tipY);
  ctx.quadraticCurveTo((tipX + baseX) * .52, baseY + 8, baseX, baseY);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = outline; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rootX - 1, rootY - 2);
  ctx.quadraticCurveTo(tipX * .72, tipY * .75, tipX * .78, tipY * .78);
  ctx.quadraticCurveTo(baseX * .7, baseY + 1, baseX - 2, baseY - 2);
  ctx.closePath(); ctx.fillStyle = inner; ctx.globalAlpha = .75; ctx.fill(); ctx.globalAlpha = 1;
}

function drawEye(ctx, x, y, radius, hue) {
  drawEllipse(ctx, x, y, radius, radius * 1.12, 0, '#f5fbff', 'rgba(8,12,16,.9)', 2.2);
  drawEllipse(ctx, x + radius * .18, y + radius * .08, radius * .58, radius * .67, 0, hsl(hue, 68, 52), 'rgba(5,9,12,.8)', 1.5);
  drawEllipse(ctx, x + radius * .28, y + radius * .12, radius * .3, radius * .38, 0, '#071016', null);
  drawEllipse(ctx, x + radius * .02, y - radius * .25, radius * .19, radius * .21, 0, 'rgba(255,255,255,.95)', null);
  drawEllipse(ctx, x + radius * .42, y + radius * .34, radius * .09, radius * .1, 0, 'rgba(255,255,255,.65)', null);
}

function drawPattern(ctx, pattern, accent, dark, detail) {
  if (pattern === 0) {
    ctx.beginPath(); ctx.moveTo(-1, -28); ctx.quadraticCurveTo(10, -6, 15, 17); ctx.quadraticCurveTo(-2, 10, -13, -8); ctx.closePath(); ctx.fillStyle = accent; ctx.globalAlpha = .66; ctx.fill(); ctx.globalAlpha = 1;
  } else if (pattern === 1) {
    ctx.strokeStyle = dark; ctx.lineWidth = detail === 'full' ? 6 : 7; ctx.globalAlpha = .72;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-34 + i * 10, -8); ctx.quadraticCurveTo(-20 + i * 8, 3, -28 + i * 10, 18); ctx.stroke(); }
    ctx.globalAlpha = 1;
  } else if (pattern === 2) {
    ctx.fillStyle = accent; ctx.globalAlpha = .7;
    for (const [x, y, r] of [[-24,-8,7],[-12,8,5],[3,-27,7],[24,6,5]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = dark; ctx.globalAlpha = .6;
    ctx.beginPath(); ctx.moveTo(-25,-19); ctx.lineTo(-7,-29); ctx.lineTo(4,-6); ctx.lineTo(-15,0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(15,-31); ctx.lineTo(34,-26); ctx.lineTo(28,-5); ctx.lineTo(10,-10); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawFurTufts(ctx, fill, outline, fluff) {
  ctx.fillStyle = fill; ctx.strokeStyle = outline; ctx.lineWidth = 2.2;
  const points = [[-17,-33,-23,-45,-8,-36],[2,-38,7,-50,15,-36],[29,-31,39,-42,38,-26],[-38,-4,-49,-8,-38,8],[-28,24,-38,35,-20,31]];
  for (const [x1,y1,x2,y2,x3,y3] of points) {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2 * fluff,y2 * fluff); ctx.lineTo(x3,y3); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}

function drawClaws(ctx, x, y, rotation) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.strokeStyle = 'rgba(230,236,242,.55)'; ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 3, 0); ctx.lineTo(i * 3 + 1, 5); ctx.stroke(); }
  ctx.restore();
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + width - r, y); ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r); ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function wrapText(ctx, text, maxWidth, maxLines) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth || !current) current = trial;
    else { lines.push(current); current = word; }
    if (lines.length === maxLines - 1) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  const used = lines.join(' ').split(/\s+/).length;
  if (used < words.length && lines.length) lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.…]+$/, '')}…`;
  return lines.length ? lines : ['…'];
}

function hashUnit(value) {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0) / 4294967295;
}
