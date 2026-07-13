# Auditoría — Proyecto Génesis Ω v6.0.1

## Alcance

Auditoría de mantenimiento sobre la entrega v6.0.0: inventario completo, ejecución de la suite, prueba de estrés prolongada del motor de simulación, fuzzing del cargador de mundos, revisión de entrada de cámara, seguridad, CSP, accesibilidad estática y reproducibilidad del entorno de desarrollo.

## Hallazgos y correcciones

### P0 — `package-lock.json` apuntaba a un registro npm privado

El lockfile contenía 91 referencias a un registro interno inaccesible fuera del entorno donde se generó. `npm ci` fallaba con errores 403 tanto en una máquina limpia como en el propio workflow de GitHub Actions, que exige `git diff --exit-code` sobre el bundle tras `npm ci`.

**Corrección:** lockfile regenerado íntegramente contra `https://registry.npmjs.org/`. Verificado: `npm ci` limpio, 0 referencias privadas, `npm audit` sin vulnerabilidades conocidas.

### P1 — Crash en partidas largas por poda de perfiles vivos

Reproducido empíricamente en esta sesión mediante estrés acelerado:

```
TypeError: Cannot read properties of undefined (reading 'rumorsKnown')
    at LegacyEngine.maybeCreateRumor (js/legacy.js:243)
```

Causa raíz: `syncProfiles` poda los perfiles al superar 1800 ordenando por `legacyImportance`. Los vivos solo reciben +20 de importancia, mientras que un muerto célebre puede superar 130 (legado 100 + libros ×4), de modo que en mundos longevos la poda eliminaba perfiles de criaturas **vivas**. En el mismo ciclo, `maybeCreateRumor` (línea 243, sin guarda tras un `?.` en la 242), `maybeCreateCollectiveInsight` (línea 352) y `maybeEstablishLibrary` (línea 375) desreferenciaban el perfil ausente. El fallo era probabilístico y de aparición tardía: exactamente el tipo de crash que un usuario sufre tras horas de partida y que un test corto nunca ve.

**Corrección (causa raíz):** la poda separa vivos y muertos; los vivos se conservan siempre y solo los muertos compiten por el espacio restante. Las tres rutas de consumo recrean el perfil con `createProfile` si faltara por cualquier otra vía.

**Evidencia:** `tests/legacy-profiles-regression.mjs` reproduce el escenario de forma determinista. Ejecutado sobre el código v6.0.0 original falla con el `TypeError` exacto de producción; sobre el corregido pasa. Además, estrés posterior de 245 años simulados a velocidad 12 con techo de 1800 perfiles alcanzado: 0 errores y 0 criaturas vivas sin perfil.

### P2 — Importación sin reversión ante fallo de hidratación

`UI.importFile` llamaba a `hydrate` directamente. `hydrate` es muy robusto (el fuzzing con guardados malformados no logró corromper el estado: sanea tipos, acota a 900 criaturas y normaliza biomas y velocidades), pero muta `this` progresivamente, así que un fallo a mitad dejaría un mundo mixto en memoria que el autoguardado (cada 45 s) persistiría.

**Corrección:** antes de hidratar se toma una instantánea con `serialize()`; si la hidratación lanza, se restaura y se relanza el error para que el usuario vea el aviso. Verificado en jsdom con el bundle real: tras un archivo de versión inválida y tras un `hydrate` saboteado a mitad, población y año quedan intactos.

### P3 — Versión codificada por triplicado en la prueba de integridad

`tests/project-integrity.mjs` fijaba `6.0.0` en tres aserciones independientes, lo que permitía bumps incoherentes. Ahora deriva la versión desde `js/config.js` y añade dos comprobaciones nuevas: que la caché del service worker (`genesis-omega-v<versión>`) y el app shell versionado (`?v=<versión>`) coinciden con `APP_VERSION`.

## Verificaciones sin hallazgos

- **Fuzzing de `hydrate`:** guardados con tipos corruptos, arrays gigantes (5000 criaturas → acotado a 900), NaN, biomas inválidos y subsistemas ausentes: sin excepciones ni estado no finito, y estable tras 50 pasos de simulación posteriores.
- **Compatibilidad de guardado:** mundos reales degradados a v10, v8, v5 y v1 se abren, simulan 40 s sin errores y se re-serializan como v11 conservando la población.
- **Cámara:** zoom en cursor con reversibilidad `screenToWorld`/`worldToScreen`, pinza táctil con ancla en el punto medio, clamp de cámara y DPR limitado a 2. Sin defectos detectados en revisión de código.
- **Seguridad:** CSP `default-src 'self'` sin `unsafe-inline` en scripts; el único `innerHTML` del código vive dentro de artefactos HTML exportados y escapa su contenido; sin CDN, telemetría ni claves; entradas de importación con límite de 15 MB y validación de tipo.
- **Límites de memoria:** todas las colecciones del legado, la civilización y los Grandes Proyectos están acotadas (`slice` sistemático); heap estable en ~49 MB tras 245 años simulados.
- **Bundle:** el `app.bundle.js` de la entrega v6.0.0 coincidía byte a byte con la regeneración desde fuentes; el de v6.0.1 se ha regenerado tras los cambios.

## Limitaciones del entorno de auditoría

- No hay navegador real disponible (la descarga de navegadores de Playwright está bloqueada por la red y no existe Chromium del sistema). La suite Playwright queda incluida y configurada para el CI de GitHub, pero **no se ha ejecutado en esta sesión**. La verificación de interfaz se realizó con jsdom sobre el bundle real (arranque, flujo de UI, importación, descargas), que no cubre render de píxeles, reflow ni gestos táctiles reales.
- Las resoluciones 390×844, 768×1024, 1440×900 y 1920×1080 se revisaron de forma estática (breakpoints y reglas de overflow presentes en `styles.css` para 430/480/720/900/1100/1180 px), no con capturas reales.
- El service worker se validó estáticamente (nombre de caché versionado, app shell existente, estrategia network-first para código); su ciclo de actualización real requiere un navegador.
