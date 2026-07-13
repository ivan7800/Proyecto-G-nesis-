# Decisiones arquitectónicas

## v6.0.1

### La poda de perfiles nunca elimina criaturas vivas

El `LegacyEngine` limita los perfiles a 1800 para acotar la memoria. La versión anterior podaba por una puntuación de importancia en la que un muerto célebre podía superar a cualquier vivo, provocando un crash tardío y probabilístico. Se decidió que la propiedad "toda criatura viva tiene perfil" es un invariante del motor: la poda solo compite entre muertos, y los consumidores del perfil (`rumores`, `síntesis colectivas`, `bibliotecas`) lo recrean defensivamente si faltara por cualquier otra vía. Se descartó subir el límite de 1800 porque no elimina la clase de fallo, solo la retrasa. Con `MAX_CREATURES = 900`, los vivos nunca pueden desbordar por sí solos el límite.

### Instantánea de reversión en la importación

`Simulation.hydrate` sanea sus entradas de forma exhaustiva, pero muta el estado progresivamente. En lugar de reescribirlo para construir en un objeto temporal (refactor amplio con riesgo de regresión en 17 subsistemas), la importación toma una instantánea `serialize()` y la restaura ante error: mismo resultado para el usuario con una fracción del riesgo.

### La versión vive en `js/config.js`

`tests/project-integrity.mjs` deriva la versión esperada de `APP_VERSION` y verifica que `package.json`, el HTML, la caché del service worker y el app shell coinciden. Un bump incompleto ahora rompe la suite en lugar de publicar referencias contradictorias.

### Lockfile solo contra el registro público

`package-lock.json` debe resolver exclusivamente contra `registry.npmjs.org`. Cualquier regeneración desde entornos con registro corporativo debe revisarse antes de publicar, porque el CI ejecuta `npm ci` y fallaría en silencio para cualquier colaborador externo.
