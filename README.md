# Proyecto Génesis Ω v6.0.2 — Grandes Proyectos

Proyecto Génesis Ω es un laboratorio local de vida y civilización artificial. Todo comienza con un único huevo, Ω-001. La población aprende, hereda, se especializa, forma facciones, crea cultura, deja legado y ahora puede coordinarse alrededor de objetivos complejos mediante **Gran Proyecto Ω**.

La aplicación funciona de forma estática en GitHub Pages y no necesita servidor, cuenta, API ni recursos externos para su simulación principal.

## Qué significa «ser capaces de todo»

La v6 no presenta a las criaturas como una AGI real ni finge acceso ilimitado al conocimiento. Hace algo más concreto y verificable:

- divide objetivos abiertos en fases y dependencias;
- selecciona especialistas reales de la población;
- detecta oficios ausentes y trabaja con capacidades próximas;
- investiga con el Atlas Ω y la memoria acumulada;
- genera alternativas, prototipos textuales, planes y documentación;
- encuentra fallos, registra el aprendizaje y reintenta;
- verifica antes de declarar una entrega;
- exporta un dossier completo y trazable;
- permite incorporar información externa únicamente después de revisión humana.

Para hechos actuales, investigación profesional, ejecución de programas fuera del navegador o conocimiento que no exista en el Atlas, se necesita una fuente o una IA externa. La aplicación lo declara de forma visible y nunca guarda claves.

## Gran Proyecto Ω

Tipos incorporados:

- software o aplicación;
- videojuego;
- ciudad autosuficiente;
- investigación;
- invención;
- libro o historia;
- observatorio científico;
- cura de una enfermedad ficticia del mundo simulado;
- desafío libre.

Cada proyecto contiene:

1. definición del objetivo y criterios de éxito;
2. planificación y dependencias;
3. investigación y detección de vacíos;
4. diseño y comparación de alternativas;
5. producción de un resultado mínimo útil;
6. verificación, seguridad y corrección;
7. entrega y mantenimiento.

Las tareas conservan progreso, equipo, especialidades necesarias, intentos, carencias, resultados y año histórico. Los fallos no desaparecen: producen lecciones que mejoran la siguiente iteración.

## Exportaciones

Desde el proyecto seleccionado se puede descargar:

- `Dossier-Omega.md`: mandato, restricciones, fases, resultados, bloqueos, aprendizajes, decisiones, aportaciones y límites reales;
- `Contexto-IA.txt`: paquete para consultar manualmente en ChatGPT, Claude, Gemini u otra herramienta, con instrucciones de trazabilidad y prudencia.

El texto pegado de vuelta se trata como información, no como código ejecutable.

## Sistemas conservados

- origen único y reproducción por huevos;
- genes, mutaciones, herencia y especiación;
- memoria, voz, aprendizaje y autonomía individual;
- diecinueve oficios y Atlas Ω;
- Taller colectivo y obras descargables;
- tecnología, idioma, instituciones y cultura;
- facciones, leyes, gobiernos, reyes, traiciones, diplomacia y guerras;
- sueños, rumores, libros, bibliotecas, ruinas, reliquias, mitos y legado;
- entorno pixel art retro, clima, estaciones y calidad adaptativa;
- PWA, guardado local, importación y exportación JSON.

## Guardado

El formato actual es **v11**. Conserva Grandes Proyectos y sigue aceptando mundos v1–v10. Un mundo antiguo se abre con el nuevo módulo vacío, sin perder su población ni sus sistemas anteriores.

## Instalación en GitHub Pages

1. Extrae el ZIP.
2. Sube el contenido interior a la raíz del repositorio.
3. Comprueba que `index.html` esté en la raíz.
4. En GitHub, abre **Settings → Pages**.
5. Publica desde la rama principal y la carpeta raíz.

No subas `node_modules`; solo se utiliza para ejecutar las pruebas de desarrollo.

## Desarrollo y QA

```bash
npm ci
npm test
npm run build
npm run test:e2e
```

La suite principal cubre integridad, simulación, Taller, civilización, sociedad, legado, Grandes Proyectos, arquetipos, rendimiento visual y arranque DOM. Playwright necesita navegadores instalados y un entorno que permita navegación local.

## Privacidad y seguridad

- sin telemetría;
- sin claves API;
- sin dependencias CDN;
- sin peticiones automáticas a Internet;
- entradas limitadas y saneadas;
- importaciones con validación;
- puente externo manual y supervisado;
- las curas pertenecen exclusivamente al mundo ficticio y no son orientación médica.
