# Changelog

## 6.0.2 — Rendimiento con población máxima

### Corregido

- **Saturación con el mundo lleno (P1):** con ~850 criaturas, la simulación consumía 9,6 ms/frame de media (picos de 66 ms) y el dibujo con el mundo encajado emitía miles de operaciones de canvas. Diagnóstico empírico: cada criatura recorría su lista de ~220 vecinos en cada paso (≈11,5 millones de iteraciones/s), `directiveSet()` asignaba un `Set` nuevo por criatura y paso, el pipeline social completo (13 fases, hasta 21 ms) se ejecutaba en un único frame cada tick, `getCollectiveMetrics` (hasta 8 ms) se recalculaba para la civilización, la UI y el aprendizaje, y cada recurso de comida se dibujaba con `beginPath`+`fill` propios.

### Optimizado (misma semántica, verificada por la suite)

- La selección de amenaza, pareja, amistad y pariente vulnerable se realiza al ritmo del sensado (donde la lista de vecinos ya se refrescaba), no en cada paso; las posiciones de los candidatos elegidos se siguen leyendo en vivo y su validez se revalida al usarlos.
- `directiveSet()` se cachea y se invalida al aprender conocimiento nuevo.
- El pipeline social se trocea: las 13 fases se encolan en su orden original y se drenan un par por frame desde la civilización; un tick nuevo vacía primero el lote pendiente (las llamadas directas de las pruebas conservan su semántica).
- `getCollectiveMetrics` usa una caché de 0,35 s (los valores son agregados suavizados).
- La comida se dibuja en dos rellenos por lote en lugar de miles de operaciones individuales.

**Resultado medido (Node, 858 criaturas):** media de `sim.update` 9,57 → 1,95 ms/frame (4,9×); frames >33 ms: 2 → 0 y peor frame 66 → 20 ms por cada 1200; CPU de dibujo a mundo encajado 4,7 ms/frame con ~11 000 operaciones de canvas. Facciones, gobierno, sagas y leyes siguen emergiendo con normalidad.

### Añadido

- `tests/performance-regression.mjs`: contratos de las nuevas mecánicas (invalidación de la caché de directivas, descarte de perceptos muertos, TTL de métricas, drenado y vaciado del pipeline social) más una cota de cordura laxa. Integrada en `npm test` (suite: 12 pruebas).

## 6.0.1 — Estabilidad del legado y entorno reproducible

### Corregido

- **Crash en partidas largas (P1):** la poda de perfiles del motor de legado podía eliminar perfiles de criaturas **vivas** al superar los 1800 perfiles cuando los muertos acumulaban más importancia; a continuación `maybeCreateRumor`, `maybeCreateCollectiveInsight` o `maybeEstablishLibrary` desreferenciaban el perfil ausente y la aplicación caía con `Cannot read properties of undefined (reading 'rumorsKnown')`. Ahora la poda conserva siempre a los vivos y las tres rutas recrean el perfil si falta.
- **`package-lock.json` con registro privado (P0 de entorno):** el archivo de bloqueo apuntaba a un registro npm interno inaccesible, lo que rompía `npm ci` en cualquier máquina ajena y en GitHub Actions. Regenerado íntegramente contra `registry.npmjs.org` (0 vulnerabilidades conocidas).
- **Importación con reversión (P2):** si la hidratación de un mundo importado fallara a mitad de proceso, el estado en memoria quedaba mixto y el autoguardado podía persistirlo. Ahora se toma una instantánea previa y se restaura ante cualquier error.

### Añadido

- Prueba de regresión `tests/legacy-profiles-regression.mjs`, que reproduce de forma determinista el escenario del crash (verificada en rojo sobre el código anterior y en verde sobre el corregido) e integrada en `npm test`.
- `tests/project-integrity.mjs` ahora deriva la versión esperada desde `js/config.js` y comprueba además que la caché del service worker y el app shell llevan la versión actual, evitando referencias contradictorias en futuros bumps.

### Conservado

- Todos los sistemas, el formato de guardado v11 y la compatibilidad de apertura v1–v10, verificada con mundos degradados reales.

## 6.0.0 — Grandes Proyectos

### Añadido

- Motor `GrandProjectEngine` persistente.
- Nueve clases de Gran Proyecto.
- Descomposición automática en definición, planificación, investigación, diseño, producción, verificación y entrega.
- Dependencias entre tareas y ejecución paralela limitada por población.
- Selección de equipos según oficio, genes, memoria, sociabilidad y conocimiento.
- Detección de carencias profesionales y sustitución mediante habilidades adyacentes.
- Fallos útiles, reintentos, aprendizaje e incremento de iteración.
- Artefactos por hito, decisiones, bloqueos, confianza y calidad simulada.
- Dossier Markdown exportable.
- Paquete de contexto para IA externa.
- Integración manual de aportaciones revisadas con trazabilidad.
- Panel retro completo para crear, seleccionar, pausar, reanudar, archivar y exportar proyectos.
- Prueba `grand-projects-smoke.mjs` y cobertura del flujo desde el DOM real.

### Cambiado

- Guardado actualizado a v11 con compatibilidad v1–v10.
- Navegación ampliada con acceso visible a Gran Proyecto.
- Manifest, caché PWA, bundle y documentación actualizados a v6.0.0.
- Diseño del panel adaptado a la columna lateral para evitar texto comprimido.

### Conservado

- Todos los sistemas de Retro Vivo, Legado Ω, Civilización, Reinos Emergentes, Mente Ω y Taller colectivo.
