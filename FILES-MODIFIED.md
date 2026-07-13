# Archivos modificados — v6.0.1 y v6.0.2

## Modificados

- `js/legacy.js`: la poda de perfiles conserva siempre a las criaturas vivas; `maybeCreateRumor`, `maybeCreateCollectiveInsight` y `maybeEstablishLibrary` recrean el perfil si falta en lugar de desreferenciarlo sin guarda (corrección del crash `rumorsKnown`).
- `js/ui.js`: `importFile` toma una instantánea del mundo antes de hidratar y la restaura si la hidratación falla, evitando estados mixtos que el autoguardado pudiera persistir.
- `package-lock.json`: regenerado íntegramente contra el registro público `registry.npmjs.org` (el anterior apuntaba a un registro privado inaccesible y rompía `npm ci` y el CI).
- `tests/project-integrity.mjs`: la versión esperada se deriva de `js/config.js`; nuevas aserciones de coherencia para la caché del service worker y el app shell versionado.
- `package.json`: versión 6.0.1 y prueba de regresión incorporada a `npm test`.
- `js/config.js`, `index.html`, `sw.js`, `tools/build-bundle.mjs` y el resto de módulos `js/`: bump coherente de la versión (APP_VERSION, caché PWA, parámetros `?v=` y banner del bundle).
- `js/app.bundle.js`: regenerado desde las fuentes v6.0.1.
- `README.md`, `CHANGELOG.md`, `AUDIT-REPORT.md`, `QA-REPORT.md`, `FILES-MODIFIED.md`, `docs/DECISIONS.md`: documentación actualizada.

## Añadidos

- `tests/legacy-profiles-regression.mjs`: reproducción determinista del crash de perfiles vivos podados; falla sobre el código v6.0.0 y pasa sobre el corregido.
- `QA-REPORT.md` y `docs/DECISIONS.md`.

## Eliminados

- Ninguno. No se ha retirado ningún sistema, función ni compatibilidad de guardado.

## v6.0.2

### Modificados

- `js/creature.js`: caché de `directiveSet()` con invalidación en `learnKnowledge`; la selección de amenaza/pareja/amistad/pariente vulnerable se mueve a `refreshSocialPercepts()` (cadencia del sensado) con revalidación de candidatos al usarlos y distancias frescas en los contactos.
- `js/society.js`: el pipeline social (13 fases) se encola en su orden original y se drena por frames (`drainPhases`/`flushPhases`); `reset()` inicializa la cola.
- `js/civilization.js`: drena hasta dos fases sociales pendientes en cada paso de simulación.
- `js/simulation.js`: caché TTL (0,35 s) para `getCollectiveMetrics`.
- `js/renderer.js`: `drawFood` batchea todos los círculos en dos rellenos.
- `package.json`, versión y suite; bundle regenerado; documentación actualizada.

### Añadidos

- `tests/performance-regression.mjs`.
