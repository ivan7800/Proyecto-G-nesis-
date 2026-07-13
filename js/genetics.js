import { CONFIG } from './config.js?v=6.0.1';
import { chance, clamp, gaussian, rand, weightedAverage } from './utils.js?v=6.0.1';

export const GENE_LIMITS = Object.freeze({
  speed: [0.45, 2.4], vision: [55, 260], size: [2.5, 8.5], metabolism: [0.45, 1.85],
  fertility: [0.35, 1.85], aggression: [0, 1], sociability: [0, 1], curiosity: [0, 1],
  memory: [0.1, 1], longevity: [70, 260], efficiency: [0.35, 1.6], mutationRate: [0.01, 0.16]
});

export function randomGenome(seedHue = rand(0, 360)) {
  return {
    speed: rand(.75, 1.45), vision: rand(85, 175), size: rand(3.4, 6.2), metabolism: rand(.7, 1.2),
    fertility: rand(.7, 1.25), aggression: rand(.05, .75), sociability: rand(.1, .9), curiosity: rand(.15, .95),
    memory: rand(.25, .9), longevity: rand(115, 190), efficiency: rand(.65, 1.25), mutationRate: rand(.025, .075),
    hue: normalizeHue(seedHue)
  };
}

export function sanitizeGenome(candidate, fallbackHue = rand(0, 360)) {
  const fallback = randomGenome(fallbackHue);
  if (!candidate || typeof candidate !== 'object') return fallback;
  const result = {};
  for (const key of CONFIG.GENOME_KEYS) {
    const [min, max] = GENE_LIMITS[key];
    const value = Number(candidate[key]);
    result[key] = Number.isFinite(value) ? clamp(value, min, max) : fallback[key];
  }
  const hue = Number(candidate.hue);
  result.hue = Number.isFinite(hue) ? normalizeHue(hue) : fallback.hue;
  return result;
}

export function combineGenomes(a, b, environmentalMutation = 1) {
  const parentA = sanitizeGenome(a);
  const parentB = sanitizeGenome(b, parentA.hue);
  const child = {};
  for (const key of CONFIG.GENOME_KEYS) {
    const [min, max] = GENE_LIMITS[key];
    let value = weightedAverage(parentA[key], parentB[key]);
    const inheritedMutation = (parentA.mutationRate + parentB.mutationRate) * .5;
    if (chance(clamp(inheritedMutation * environmentalMutation, 0, .55))) {
      const spread = (max - min) * (.025 + inheritedMutation * .45);
      value += gaussian(0, spread);
    } else {
      value += gaussian(0, (max - min) * .004);
    }
    child[key] = clamp(value, min, max);
  }
  const delta = ((parentB.hue - parentA.hue + 540) % 360) - 180;
  child.hue = normalizeHue(parentA.hue + delta * .5 + gaussian(0, 4 * environmentalMutation));
  return child;
}

export function mutateGenome(genome, strength = 1) {
  const clone = sanitizeGenome(genome);
  const safeStrength = clamp(Number(strength) || 1, 0, 12);
  for (const key of CONFIG.GENOME_KEYS) {
    const [min, max] = GENE_LIMITS[key];
    if (chance(.55)) clone[key] = clamp(clone[key] + gaussian(0, (max - min) * .06 * safeStrength), min, max);
  }
  clone.hue = normalizeHue(clone.hue + gaussian(0, 18 * safeStrength));
  return clone;
}

export function geneticDistance(a, b) {
  const genomeA = sanitizeGenome(a);
  const genomeB = sanitizeGenome(b, genomeA.hue);
  let sum = 0;
  for (const key of CONFIG.GENOME_KEYS) {
    const [min, max] = GENE_LIMITS[key];
    const normalized = (genomeA[key] - genomeB[key]) / (max - min);
    sum += normalized * normalized;
  }
  const hueDelta = Math.abs(((genomeA.hue - genomeB.hue + 540) % 360) - 180) / 180;
  sum += hueDelta * hueDelta * .35;
  return Math.sqrt(sum / (CONFIG.GENOME_KEYS.length + .35));
}

export function genomeScore(genome) {
  const g = sanitizeGenome(genome);
  return g.speed * .12 + g.vision / 200 * .12 + g.efficiency * .25 + g.memory * .08 + g.longevity / 120 * .08 + g.fertility * .09 - g.metabolism * .12 + (1 - g.aggression * .35) * .08;
}

function normalizeHue(value) {
  return ((value % 360) + 360) % 360;
}
