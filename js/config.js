export const APP_VERSION = '6.0.1';

export const BIOMES = Object.freeze({
  origin: Object.freeze({
    label: 'Cámara del Origen', shortLabel: 'ORIGEN', icon: 'Ω',
    description: 'Entorno equilibrado y estable para el nacimiento del linaje.',
    temperatureBase: 18, temperatureSwing: 8, foodFactor: 1, mutationFactor: 1, movementFactor: 1
  }),
  meadow: Object.freeze({
    label: 'Prado Luminoso', shortLabel: 'PRADO', icon: '✦',
    description: 'Hierba fértil, alimento abundante y desplazamiento fácil.',
    temperatureBase: 20, temperatureSwing: 5, foodFactor: 1.28, mutationFactor: .82, movementFactor: 1.08
  }),
  forest: Object.freeze({
    label: 'Bosque Profundo', shortLabel: 'BOSQUE', icon: '♠',
    description: 'Vegetación densa, refugios naturales y rutas más lentas.',
    temperatureBase: 16, temperatureSwing: 4, foodFactor: 1.12, mutationFactor: .95, movementFactor: .9
  }),
  desert: Object.freeze({
    label: 'Mar de Arena', shortLabel: 'ARENA', icon: '◇',
    description: 'Calor, escasez y largas migraciones entre recursos.',
    temperatureBase: 32, temperatureSwing: 10, foodFactor: .62, mutationFactor: 1.18, movementFactor: .94
  }),
  marsh: Object.freeze({
    label: 'Pantano Esmeralda', shortLabel: 'PANTANO', icon: '≈',
    description: 'Humedad fértil, suelo lento y refugios cambiantes.',
    temperatureBase: 23, temperatureSwing: 5, foodFactor: 1.2, mutationFactor: 1.06, movementFactor: .82
  }),
  tundra: Object.freeze({
    label: 'Tundra de Cristal', shortLabel: 'TUNDRA', icon: '❄',
    description: 'Frío extremo, poca energía y selección natural severa.',
    temperatureBase: -4, temperatureSwing: 11, foodFactor: .55, mutationFactor: 1.22, movementFactor: .84
  }),
  volcanic: Object.freeze({
    label: 'Falla Volcánica', shortLabel: 'VOLCÁNICO', icon: '▲',
    description: 'Calor inestable, alimento escaso y mutación acelerada.',
    temperatureBase: 39, temperatureSwing: 9, foodFactor: .5, mutationFactor: 1.55, movementFactor: .88
  }),
  abyss: Object.freeze({
    label: 'Abismo Oscuro', shortLabel: 'OSCURO', icon: '●',
    description: 'Penumbra, recursos inciertos y alta presión evolutiva.',
    temperatureBase: 12, temperatureSwing: 7, foodFactor: .78, mutationFactor: 1.38, movementFactor: .96
  })
});

export const CONFIG = Object.freeze({
  WORLD_WIDTH: 2400,
  WORLD_HEIGHT: 1600,
  INITIAL_CREATURES: 1,
  INITIAL_FOOD: 420,
  MAX_CREATURES: 900,
  MAX_EGGS: 260,
  MAX_FOOD: 2200,
  BASE_FOOD_SPAWN: 9.5,
  YEAR_SECONDS: 18,
  PRIMORDIAL_HATCH_SECONDS: 6,
  EGG_INCUBATION_MIN: 5.2,
  EGG_INCUBATION_MAX: 8.4,
  SPECIES_THRESHOLD: 0.20,
  AUTOSAVE_SECONDS: 45,
  HISTORY_LIMIT: 120,
  TIMELINE_LIMIT: 70,
  MAX_IMPORT_BYTES: 15 * 1024 * 1024,
  MAX_TEAMS: 6,
  MAX_OBRAS: 80,
  MAX_COLLECTIVE_REQUESTS: 12,
  AUTO_BIOME_YEARS: 16,
  GENOME_KEYS: [
    'speed', 'vision', 'size', 'metabolism', 'fertility', 'aggression',
    'sociability', 'curiosity', 'memory', 'longevity', 'efficiency', 'mutationRate'
  ]
});

export const GENE_LABELS = Object.freeze({
  speed: 'Velocidad', vision: 'Visión', size: 'Tamaño', metabolism: 'Metabolismo',
  fertility: 'Fertilidad', aggression: 'Agresividad', sociability: 'Sociabilidad',
  curiosity: 'Curiosidad', memory: 'Memoria', longevity: 'Longevidad',
  efficiency: 'Eficiencia', mutationRate: 'Mutación'
});
