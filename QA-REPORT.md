# QA — Proyecto Génesis Ω v6.0.1

Fecha: 13 de julio de 2026 · Node.js v22.22.2 · npm 10.9.7 · Linux (contenedor sin navegador gráfico)

## Comandos ejecutados y resultados exactos

| Comando | Resultado |
| --- | --- |
| `npm ci` (lockfile original v6.0.0) | **Fallo**: 403 en 91 paquetes por registro npm privado en el lockfile |
| `npm install` (tras regenerar lockfile) | Correcto · `npm audit`: 0 vulnerabilidades conocidas |
| `npm ci` (lockfile nuevo) | Correcto |
| `npm test` (11 pruebas) | **11/11 superadas** — detalle abajo |
| `npm run build` | Bundle regenerado; el bundle previo v6.0.0 coincidía byte a byte (md5 `4a6bd2…`) con la regeneración desde fuentes |
| `npx playwright install chromium` | **Fallo de red del entorno**: descarga de navegadores bloqueada; sin Chromium del sistema. E2E no ejecutado en esta sesión (queda para el CI de GitHub) |

## Detalle de `npm test` (v6.0.1)

1. `project-integrity` — superada (238 ids, 5 assets, 9 activos de caché, versión coherente en package/HTML/SW).
2. `simulation-smoke` — superada (nacimientos, generaciones, invariantes).
3. `workshop-smoke` — superada (obras `codigo`, 6 autores, formato 11).
4. `civilization-smoke` — superada (era «Civilización en red», 14 tecnologías, 6 instituciones).
5. `society-smoke` — superada (6 facciones, gobierno, 1 guerra, 1 traición, 1 tratado).
6. `legacy-smoke` — superada (120 sueños, libros, ruinas, mitos, bibliotecas).
7. `legacy-profiles-regression` — **nueva**, superada (1800 perfiles, 0 vivos sin perfil). Verificado además que **falla** sobre el código v6.0.0 con el `TypeError` exacto de producción.
8. `grand-projects-smoke` — superada (proyecto de 7 tareas completado, calidad 49, 2 aprendizajes).
9. `archetypes-check` — superada (10/10 especies eldritch, siluetas no vacías).
10. `visual-perf-check` — superada.
11. `dom-boot` — superada (arranque real del bundle en jsdom, población 3, descargas 5).

## Verificaciones adicionales de esta sesión

- **Estrés prolongado:** 245 años simulados a velocidad 12 (población pico 900): 0 excepciones, techo de 1800 perfiles alcanzado con 0 criaturas vivas sin perfil, heap estable ≈49 MB.
- **Fuzzing de importación:** guardados malformados (tipos corruptos, NaN, 5000 criaturas, subsistemas ausentes): sin excepciones, estado siempre finito, población acotada a 900.
- **Compatibilidad de guardados:** mundos reales degradados a v10, v8, v5 y v1: hidratación correcta, 40 s de simulación sin errores, re-serialización como v11.
- **Reversión de importación (jsdom, bundle real):** archivo de versión inválida → mundo intacto; `hydrate` saboteado a mitad → mundo restaurado desde la instantánea (población y año idénticos).

## No verificado en esta sesión (limitaciones reales del entorno)

- Ejecución en Chromium, Firefox y WebKit reales (suite Playwright incluida y cableada al CI, no ejecutable aquí).
- Render de píxeles, capturas en 390×844 / 768×1024 / 1440×900 / 1920×1080 (revisión estática de breakpoints y overflow en `styles.css`), gestos táctiles físicos, `prefers-reduced-motion` en navegador y ciclo real de actualización del service worker.
- Rendimiento de FPS en GPU real (la medición de esta sesión es de CPU pura en Node).
