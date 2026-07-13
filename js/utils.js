export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (min = 0, max = 1) => min + Math.random() * (max - min);
export const randInt = (min, max) => Math.floor(rand(min, max + 1));
export const chance = probability => Math.random() < clamp(Number(probability) || 0, 0, 1);
export const distanceSq = (a, b) => {
  if (!a || !b) return Infinity;
  const dx = Number(a.x) - Number(b.x);
  const dy = Number(a.y) - Number(b.y);
  return Number.isFinite(dx) && Number.isFinite(dy) ? dx * dx + dy * dy : Infinity;
};
export const distance = (a, b) => Math.sqrt(distanceSq(a, b));
export const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
export const normalizeAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
export const formatNumber = value => Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(Number(value) || 0);
export const weightedAverage = (a, b) => chance(.5) ? a : b;
export const finiteOr = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function gaussian(mean = 0, stdev = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  return mean + stdev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function hsl(h, s = 78, l = 62, alpha = 1) {
  const hue = Number.isFinite(Number(h)) ? Number(h) : 180;
  return `hsla(${((hue % 360) + 360) % 360} ${s}% ${l}% / ${alpha})`;
}
