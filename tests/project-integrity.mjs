import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const sw = readFileSync(resolve(root, 'sw.js'), 'utf8');
const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.webmanifest'), 'utf8'));
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'No debe haber IDs duplicados');

const requiredIds = [
  'worldCanvas','genesisIntro','startGenesisBtn','genesisProgress','genesisPhase','genesisProgressFill','genesisHint',
  'pauseBtn','cinemaBtn','cinemaExitBtn','cameraResetBtn','cameraZoomOutBtn','cameraZoomInBtn','cameraZoomLabel','helpBtn',
  'pulseBtn','resetBtn','armLineageBtn','saveBtn','loadBtn','exportBtn','importInput','clearSaveBtn','bootError',
  'creaturePortrait','teachForm','teachInput','teachBtn','listenBtn','speakBtn','autoSpeakToggle','knowledgeList','eggMetric',
  'obraList','obraEmpty','deliverAllBtn','workshopStatus','obraBadge','biomeSelect','biomeDescription','biomeIcon',
  'autoBiomeToggle','autonomyRange','autonomyOutput','moodValue','goalValue','autonomyValue',
  'biomeQuickSelect','quickSaveBtn','quickLoadBtn','quickExportBtn','quickImportInput','openCollectiveBtn','openLegacyBtn','openArchiveBtn',
  'collectiveBadge','collectiveIndex','collectiveKnowledge','collectiveRoles','collectiveSynergy','collectiveQueue','collectiveStatus',
  'injectAtlasBtn','collectiveProjectType','collectivePrompt','collectiveProjectBtn','collectiveProjectsList','openGrandProjectBtn','grandProjectBadge','grandProjectCreateBtn','grandProjectList','grandProjectDetail','grandProjectTaskList','grandProjectDossierBtn','grandProjectContextBtn',
  'openCivilizationBtn','legacyPhase','legacyWeather','legacyDreamCount','legacyBookCount','legacyRuinCount','legacyMythCount','legacyLibraryCount','legacyInsightCount','legacyDreamList','legacyRumorList','legacyBookList','legacyRuinList','legacyInsightList','legacyLegaciesList','civilizationEra','civilizationTechCount','civilizationInstitutionCount','civilizationWords','civilizationTechList','civilizationCultureList','civilizationLexicon','civilizationChronicle','oracleQuestion','exportOracleBtn','oracleResponse','integrateOracleBtn','societyFactionCount','societyTreatyCount','societyWarCount','societyGovernment','societyRuler','societyLegitimacy','societySuccession','societyLawList','societyUnrest','societyFactionList','societyDiplomacyList','societyBetrayals','societySagaList','factionValue','socialRankValue','loyaltyValue'
];
for (const id of requiredIds) assert.ok(ids.includes(id), `Falta el control #${id}`);

const relativeAssets = [...html.matchAll(/(?:src|href)="((?!https?:|data:|#)[^"]+)"/g)].map(match => match[1]);
for (const asset of relativeAssets) {
  const clean = asset.split('?')[0];
  assert.ok(existsSync(resolve(root, clean)), `Ruta rota: ${asset}`);
}
const cachedAssets = [...sw.matchAll(/'\.\/([^']*)'/g)].map(match => match[1] || '.');
for (const asset of cachedAssets) {
  if (asset === '.') continue;
  assert.ok(existsSync(resolve(root, asset.split('?')[0])), `Activo de caché inexistente: ${asset}`);
}

const configSource = readFileSync(resolve(root, 'js', 'config.js'), 'utf8');
const APP_VERSION = configSource.match(/APP_VERSION = '([^']+)'/)[1];
const VERSION_RE = APP_VERSION.replace(/\./g, '\\.');
assert.equal(pkg.version, APP_VERSION, 'package.json debe coincidir con APP_VERSION');
assert.ok(sw.includes(`genesis-omega-v${APP_VERSION}`), 'La caché del service worker debe llevar la versión actual');
assert.ok(sw.includes(`?v=${APP_VERSION}`), 'El app shell del service worker debe versionar sus activos');
assert.equal(pkg.private, true, 'El paquete debe ser privado con booleano real');
assert.equal(manifest.start_url, './');
assert.equal(manifest.scope, './');
assert.ok(manifest.icons.length >= 2, 'El manifest debe incluir iconos');
assert.ok(!/src="\//.test(html) && !/href="\//.test(html), 'No debe haber rutas absolutas');
assert.ok(!/https?:\/\//.test(html), 'No debe depender de recursos externos');
assert.ok(/Content-Security-Policy/.test(html), 'Debe existir CSP');
assert.ok(new RegExp(`src="js/app\\.bundle\\.js\\?v=${VERSION_RE}"`).test(html), `Debe cargar bundle v${APP_VERSION}`);
assert.ok(!/type="module"/.test(html), 'Debe funcionar bajo file://');
assert.ok(existsSync(resolve(root, 'js/app.bundle.js')), 'Falta el bundle');
assert.ok(existsSync(resolve(root, 'js/knowledge.js')), 'Falta el Atlas Ω');
assert.ok(existsSync(resolve(root, 'js/civilization.js')), 'Falta el motor de civilización');
assert.ok(existsSync(resolve(root, 'js/society.js')), 'Falta el motor social y político');
assert.ok(existsSync(resolve(root, 'js/legacy.js')), 'Falta el motor de legado y narrativa emergente');
assert.ok(existsSync(resolve(root, 'js/grand-projects.js')), 'Falta el motor de Grandes Proyectos');
assert.ok(new RegExp(`v${VERSION_RE}`).test(html), `La interfaz debe mostrar v${APP_VERSION}`);
assert.ok(/Todo empieza con un solo huevo/.test(html), 'Debe existir la experiencia Origen Único');
assert.ok(/Despertar a Ω-001/.test(html), 'Debe existir la activación del fundador');
assert.ok(/Canal cognitivo/.test(html), 'Debe existir el panel cognitivo');
assert.ok(/Taller colectivo/.test(html), 'Debe existir el Taller colectivo');
assert.ok(/Mente Colectiva Ω/.test(html), 'Debe existir el panel de inteligencia colectiva');
assert.ok(/Civilización emergente/.test(html), 'Debe existir el panel de civilización');
assert.ok(/Facciones/.test(html) && /Diplomacia/.test(html) && /Sagas y traiciones/.test(html), 'Debe existir la capa política emergente');
assert.ok(/Oráculo externo/.test(html), 'Debe existir el puente manual de IA externa');
assert.ok(/Legado Ω/.test(html) && /Sueños y presagios/.test(html) && /Ruinas y reliquias/.test(html), 'Debe existir la capa de legado emergente');
assert.ok(/Gran Proyecto Ω/.test(html) && /Convocar a toda la civilización/.test(html), 'Debe existir el modo Gran Proyecto');
assert.ok(/<b>Guardar<\/b>/.test(html) && /<b>Exportar<\/b>/.test(html), 'Las acciones esenciales deben estar visibles');
assert.ok(/Bosque Profundo/.test(html) && /Mar de Arena/.test(html) && /Abismo Oscuro/.test(html), 'Deben existir biomas seleccionables');
assert.ok(!/2\.2\.0/.test(sw), 'El service worker no debe conservar la caché anterior');

console.log('Integridad superada', { ids: ids.length, assets: relativeAssets.length, cacheAssets: cachedAssets.length });
