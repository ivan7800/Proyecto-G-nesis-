# Changelog

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
