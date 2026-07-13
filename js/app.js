import { APP_VERSION, CONFIG } from './config.js?v=6.0.1';
import { Renderer } from './renderer.js?v=6.0.1';
import { Simulation } from './simulation.js?v=6.0.1';
import { UI } from './ui.js?v=6.0.1';

let simulation = null;
let renderer = null;
let ui = null;
let animationId = 0;
let running = false;
let last = performance.now();
let fpsAccumulator = 0;
let fpsFrames = 0;
let metricsTimer = 0;
let autosaveTimer = 0;

boot();

function boot() {
  try {
    const canvas = document.getElementById('worldCanvas');
    simulation = new Simulation();
    simulation.reset();
    renderer = new Renderer(canvas, simulation);
    ui = new UI(simulation, renderer);

    setupResize(canvas);
    setupKeyboard();
    setupLifecycle();
    setupServiceWorker();

    renderer.resize();
    ui.updateMetrics(60);
    document.documentElement.dataset.ready = 'true';
    document.getElementById('appVersion').textContent = `v${APP_VERSION}`;
    running = true;
    window.__GENESIS__ = Object.freeze({ simulation, renderer, ui, version: APP_VERSION });
    animationId = requestAnimationFrame(frame);
  } catch (error) {
    fail(error);
  }
}

function frame(now) {
  if (!running) return;
  try {
    const dt = Math.min(.1, Math.max(0, (now - last) / 1000));
    last = now;
    simulation.update(dt);
    renderer.draw();
    fpsAccumulator += dt;
    fpsFrames++;
    metricsTimer += dt;
    autosaveTimer += dt;

    if (fpsAccumulator >= .5) {
      const fps = fpsFrames / Math.max(.001, fpsAccumulator);
      fpsAccumulator = 0;
      fpsFrames = 0;
      renderer.reportFps(fps);
      if (metricsTimer >= .7) {
        ui.updateMetrics(fps);
        metricsTimer = 0;
      }
    }
    if (autosaveTimer >= CONFIG.AUTOSAVE_SECONDS) {
      ui.save(true);
      autosaveTimer = 0;
    }
    animationId = requestAnimationFrame(frame);
  } catch (error) {
    fail(error);
  }
}

function setupResize(canvas) {
  const resize = () => renderer?.resize();
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }
  window.addEventListener('orientationchange', () => setTimeout(resize, 100), { passive: true });
}

function setupKeyboard() {
  window.addEventListener('keydown', event => {
    const activeTag = document.activeElement?.tagName ?? '';
    const editing = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(activeTag);
    if (event.code === 'Space' && !editing) {
      event.preventDefault();
      if (simulation.genesis?.phase === 'dormant') {
        simulation.beginGenesis();
        ui.els.genesisIntro.hidden = true;
        ui.updateGenesisPanel();
      } else {
        simulation.paused = !simulation.paused;
      }
      ui.updatePause();
    }
    if (event.code === 'Escape' && document.body.classList.contains('cinema')) ui.toggleCinema(false);
    if (event.key.toLowerCase() === 'r' && !editing) {
      renderer.resetCamera();
      ui.toast('Cámara centrada');
    }
  });
}

function setupLifecycle() {
  document.getElementById('bootReloadBtn')?.addEventListener('click', () => location.reload());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && ui && simulation?.creatures.length) ui.save(true);
  });
  window.addEventListener('pagehide', () => {
    if (ui && simulation?.creatures.length) ui.save(true);
  });
}

async function setupServiceWorker() {
  if (!('serviceWorker' in navigator) || !['http:', 'https:'].includes(location.protocol)) {
    if (location.protocol === 'file:') ui.els.saveState.textContent = 'Modo local · PWA no disponible';
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
    ui.configureServiceWorker(registration);
    registration.update().catch(() => {});
  } catch (error) {
    console.warn('La PWA no pudo registrarse; la simulación seguirá funcionando.', error);
    ui.els.saveState.textContent = 'Simulación activa · PWA no disponible';
  }
}

function fail(error) {
  running = false;
  if (animationId) cancelAnimationFrame(animationId);
  if (simulation) simulation.paused = true;
  console.error('Fallo crítico en Proyecto Génesis Ω:', error);
  const overlay = document.getElementById('bootError');
  const message = document.getElementById('bootErrorMessage');
  if (message) message.textContent = friendlyError(error);
  if (overlay) overlay.hidden = false;
}

function friendlyError(error) {
  const raw = String(error?.message || error || 'Error desconocido');
  if (raw.includes("reading 'state'")) return 'Se detectó una caché incompatible de una versión anterior. Recarga la página; si persiste, borra los datos del sitio una sola vez.';
  return raw.slice(0, 300);
}
