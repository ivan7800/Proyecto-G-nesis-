export const KNOWLEDGE_DOMAINS = Object.freeze({
  logica: 'Lógica y pensamiento crítico',
  matematicas: 'Matemáticas',
  programacion: 'Programación y software',
  datos: 'Datos e investigación',
  biologia: 'Biología y ecosistemas',
  cocina: 'Cocina y nutrición cotidiana',
  ingenieria: 'Ingeniería y prototipado',
  diseno: 'Diseño y experiencia de uso',
  comunicacion: 'Comunicación y enseñanza',
  organizacion: 'Organización y mejora continua',
  creatividad: 'Creatividad e invención',
  seguridad: 'Seguridad, privacidad y bienestar'
});

const RAW_ATLAS = [
  ['logica','premisas','Separar hechos, hipótesis y opiniones','Una conclusión fiable debe indicar de qué premisas procede y qué incertidumbre conserva.'],
  ['logica','falsacion','Buscar pruebas que puedan refutar una idea','Una hipótesis mejora cuando se intenta demostrar que es falsa, no solo cuando se buscan confirmaciones.'],
  ['logica','causalidad','No confundir correlación con causalidad','Dos sucesos que cambian juntos no prueban por sí solos que uno cause al otro.'],
  ['logica','alternativas','Comparar varias soluciones antes de elegir','Valorar coste, beneficio, riesgo, reversibilidad y evidencia evita decisiones impulsivas.'],
  ['logica','iteracion','Resolver problemas en ciclos pequeños','Observar, proponer, probar, medir y corregir permite aprender sin apostar todo a una sola idea.'],

  ['matematicas','proporcion','Usar proporciones y unidades coherentes','Las cantidades deben conservar unidades y escalas para evitar resultados engañosos.'],
  ['matematicas','media-mediana','Distinguir media, mediana y dispersión','Un promedio aislado puede ocultar extremos; conviene observar también variación y distribución.'],
  ['matematicas','probabilidad','Expresar incertidumbre como probabilidad','Las predicciones son más honestas cuando incluyen rango, supuestos y nivel de confianza.'],
  ['matematicas','optimizacion','Optimizar con restricciones explícitas','La mejor solución depende del objetivo y de límites como tiempo, energía, coste o seguridad.'],
  ['matematicas','verificacion','Comprobar resultados por una vía alternativa','Repetir un cálculo con otro método ayuda a detectar errores silenciosos.'],

  ['programacion','descomposicion','Dividir software en módulos pequeños','Cada módulo debe tener una responsabilidad clara, entradas controladas y salidas comprobables.'],
  ['programacion','validacion','Validar toda entrada antes de usarla','Datos externos, formularios y archivos deben limitar tamaño, formato y contenido.'],
  ['programacion','pruebas','Escribir pruebas para los flujos críticos','Las pruebas deben cubrir éxito, error, valores límite y regresiones conocidas.'],
  ['programacion','accesibilidad','Crear interfaces utilizables con teclado y lectores','HTML semántico, foco visible, etiquetas y contraste forman parte de la calidad del producto.'],
  ['programacion','progresivo','Aplicar mejora progresiva','La función esencial debe sobrevivir aunque fallen APIs opcionales, red o almacenamiento avanzado.'],

  ['datos','muestra','No generalizar desde muestras pequeñas','La calidad de una conclusión depende de cómo se obtuvieron y representan los datos.'],
  ['datos','procedencia','Registrar procedencia y fecha de los datos','Toda cifra útil necesita fuente, contexto, método y momento de obtención.'],
  ['datos','limpieza','Limpiar sin borrar anomalías valiosas','Los valores extraños deben investigarse antes de descartarse.'],
  ['datos','visualizacion','Elegir gráficos que no deformen la escala','Ejes, unidades y comparaciones deben permitir interpretar sin manipulación visual.'],
  ['datos','reproducibilidad','Documentar pasos para repetir un análisis','Una investigación sólida puede reproducirse con los mismos datos y reglas.'],

  ['biologia','adaptacion','La adaptación depende del entorno','Un rasgo ventajoso en un bioma puede ser costoso en otro.'],
  ['biologia','diversidad','La diversidad aumenta resiliencia','Poblaciones variadas suelen resistir mejor cambios, enfermedades o escasez.'],
  ['biologia','energia','Todo sistema vivo gestiona energía limitada','Crecer, moverse, aprender y reproducirse compiten por recursos.'],
  ['biologia','cooperacion','La cooperación prospera con memoria y reciprocidad','Ayuda, reputación y vínculos estables pueden beneficiar al grupo.'],
  ['biologia','retroalimentacion','Los ecosistemas contienen bucles de retroalimentación','Una mejora local puede producir efectos secundarios a largo plazo.'],

  ['cocina','mise-en-place','Preparar ingredientes y herramientas antes de cocinar','Ordenar cantidades, tiempos y utensilios reduce errores y desperdicio.'],
  ['cocina','equilibrio','Equilibrar sabor, textura y nutrición','Una receta útil combina salado, ácido, dulce, amargo, aroma, textura y necesidades dietéticas.'],
  ['cocina','sustituciones','Proponer sustituciones con función equivalente','Un reemplazo debe cumplir la misma función: grasa, humedad, estructura, dulzor o aroma.'],
  ['cocina','higiene','Separar crudo y cocinado y controlar tiempos','La seguridad alimentaria exige limpieza, conservación adecuada y cocción suficiente.'],
  ['cocina','aprovechamiento','Diseñar recetas que aprovechen sobras seguras','Planificar usos secundarios reduce coste y residuos.'],

  ['ingenieria','requisitos','Definir requisitos antes del prototipo','Un diseño necesita propósito, usuario, restricciones y criterios de éxito.'],
  ['ingenieria','margen','Incluir margen de seguridad','Los sistemas reales deben soportar variaciones sin fallar de forma peligrosa.'],
  ['ingenieria','prototipo','Probar primero con un prototipo reversible','Los modelos pequeños descubren fallos antes de comprometer muchos recursos.'],
  ['ingenieria','mantenimiento','Diseñar para reparar y mantener','Las piezas críticas deben ser accesibles, sustituibles y documentadas.'],
  ['ingenieria','fallo-seguro','Preferir modos de fallo seguros','Cuando algo falla, el sistema debe degradarse sin causar más daño.'],

  ['diseno','jerarquia','Usar jerarquía visual clara','El usuario debe reconocer de inmediato qué es principal, secundario y accionable.'],
  ['diseno','consistencia','Mantener patrones coherentes','Botones, estados, nombres y comportamientos similares reducen aprendizaje y errores.'],
  ['diseno','feedback','Confirmar cada acción importante','Cargar, guardar, borrar o procesar debe mostrar estado, resultado y recuperación.'],
  ['diseno','movil','Diseñar primero para espacio limitado','Controles grandes, contenido prioritario y navegación simple mejoran móvil y escritorio.'],
  ['diseno','accesible','La estética premium no debe sacrificar legibilidad','Contraste, tamaño, movimiento moderado y lenguaje claro son parte del diseño.'],

  ['comunicacion','audiencia','Adaptar explicación a la audiencia','El mismo conocimiento necesita vocabulario, ejemplos y profundidad distintos según quien lo reciba.'],
  ['comunicacion','estructura','Explicar con objetivo, pasos y verificación','Una guía práctica debe indicar qué hacer, por qué, cómo comprobarlo y qué hacer si falla.'],
  ['comunicacion','escucha','Confirmar necesidades antes de resolver','Escuchar restricciones y contexto evita soluciones técnicamente correctas pero inútiles.'],
  ['comunicacion','ensenanza','Enseñar mediante ejemplos y práctica','La comprensión crece cuando se combina explicación, demostración y ejercicio.'],
  ['comunicacion','incertidumbre','Comunicar límites sin ocultarlos','Distinguir lo sabido, inferido y desconocido aumenta confianza.'],

  ['organizacion','prioridad','Priorizar por impacto y urgencia','Primero se corrigen bloqueos, riesgos y fallos frecuentes; después el pulido.'],
  ['organizacion','kanban','Limitar trabajo simultáneo','Terminar pocas tareas importantes suele producir más valor que abrir muchas.'],
  ['organizacion','retrospectiva','Revisar qué funcionó y qué debe cambiar','Cada ciclo debe dejar una mejora concreta del proceso.'],
  ['organizacion','documentacion','Documentar decisiones, no solo resultados','Registrar por qué se eligió una opción evita repetir debates y errores.'],
  ['organizacion','automatizacion','Automatizar tareas repetitivas y verificables','La automatización merece controles, registros y una forma de intervención humana.'],

  ['creatividad','combinacion','Crear combinando ideas de dominios distintos','Muchas invenciones nacen al trasladar un patrón útil a otro contexto.'],
  ['creatividad','restricciones','Usar restricciones como motor creativo','Límites claros obligan a buscar soluciones más específicas y originales.'],
  ['creatividad','variantes','Generar varias variantes antes de pulir','Explorar opciones evita enamorarse de la primera respuesta.'],
  ['creatividad','analogias','Usar analogías y luego comprobar sus límites','Una analogía inspira, pero no sustituye pruebas.'],
  ['creatividad','proposito','La novedad necesita utilidad o significado','Una idea memorable resuelve algo, emociona o revela una perspectiva.'],

  ['seguridad','privacidad','Recoger solo los datos necesarios','La mejor protección comienza evitando almacenar información que no hace falta.'],
  ['seguridad','permisos','Aplicar mínimo privilegio','Cada función debe acceder solo a los recursos imprescindibles.'],
  ['seguridad','copias','Mantener copias verificadas y recuperables','Una copia que nunca se ha restaurado todavía no es una estrategia fiable.'],
  ['seguridad','salud','No presentar simulaciones como diagnóstico profesional','Las recomendaciones sensibles deben ser prudentes y remitir a especialistas cuando corresponda.'],
  ['seguridad','humano','Mantener supervisión humana en decisiones importantes','La autonomía debe incluir límites, trazabilidad, pausa y posibilidad de corrección.']
];

export const KNOWLEDGE_ATLAS = Object.freeze(RAW_ATLAS.map(([domain, key, label, principle]) => Object.freeze({
  key: `atlas:${domain}:${key}`,
  domain,
  domainLabel: KNOWLEDGE_DOMAINS[domain],
  label,
  principle
})));

const SKILL_DOMAINS = Object.freeze({
  cronista: ['comunicacion','creatividad','organizacion'],
  cartografo: ['datos','matematicas','diseno'],
  cantor: ['creatividad','comunicacion','diseno'],
  arquitecto: ['ingenieria','diseno','matematicas'],
  tejedor: ['diseno','creatividad'],
  alquimista: ['biologia','datos','seguridad'],
  matematico: ['matematicas','logica','datos'],
  naturalista: ['biologia','datos','logica'],
  programador: ['programacion','logica','seguridad'],
  desarrollador: ['programacion','diseno','organizacion'],
  genetista: ['biologia','datos','seguridad'],
  filosofo: ['logica','comunicacion','seguridad'],
  cocinero: ['cocina','organizacion','seguridad'],
  ingeniero: ['ingenieria','matematicas','seguridad'],
  inventor: ['creatividad','ingenieria','programacion'],
  analista: ['datos','logica','matematicas'],
  educador: ['comunicacion','organizacion','diseno'],
  mediador: ['comunicacion','logica','seguridad'],
  cuidador: ['seguridad','biologia','comunicacion']
});

export function atlasRecordsForSkill(skill, count = 4, salt = '') {
  const domains = SKILL_DOMAINS[skill] || ['logica','comunicacion','organizacion'];
  const preferred = KNOWLEDGE_ATLAS.filter(item => domains.includes(item.domain));
  const fallback = KNOWLEDGE_ATLAS.filter(item => !domains.includes(item.domain));
  return [...preferred, ...fallback]
    .map(item => ({ item, rank: seededUnit(`${salt}:${skill}:${item.key}`) }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, Math.max(0, Math.min(16, Math.floor(Number(count) || 0))))
    .map(entry => entry.item);
}

export function atlasRecordByKey(key) {
  return KNOWLEDGE_ATLAS.find(item => item.key === key) || null;
}

export function sanitizeCollectivePrompt(value, max = 220) {
  return String(value ?? '')
    .replace(/[<>\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function seededUnit(value) {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0) / 4294967295;
}
