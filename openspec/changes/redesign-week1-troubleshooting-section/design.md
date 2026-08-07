## Context

El prototipo produce quince bloques: seis títulos aislados, una lista breve de seis errores, ejemplos descontextualizados de trazas y JSON, un checklist opcional y una pregunta requerida. La sección sigue en borrador y se presenta inmediatamente después del programa modular, que ya ofrece nombres, módulos y escritura asíncrona como contexto compartido.

## Goals / Non-Goals

**Goals:**

- Transformar la lista de errores en un proceso que el estudiante pueda repetir.
- Mostrar qué partes de un error son estables y cuáles pueden variar entre versiones o computadoras.
- Resolver `MODULE_NOT_FOUND` de punta a punta con una sola modificación.
- Explicar dónde observar un error de callback usando el código ya conocido del historial.
- Conservar intacta la actividad requerida y reducir bloques sin valor autónomo.

**Non-Goals:**

- Crear un catálogo exhaustivo de errores de Node.js.
- Introducir promesas, `async`/`await`, JSON o depuradores avanzados.
- Enseñar a ocultar errores, elevar privilegios o reinstalar herramientas como primera respuesta.

## Decisions

### Curaduría determinista con actividad preservada

Se añadirá `curateTroubleshootingSection`, que exigirá la pregunta requerida del prototipo y la colocará al final sin modificarla. El checklist opcional se retirará y los títulos enriquecidos se reemplazarán por títulos propios de bloques más informativos.

Alternativa descartada: conservar el checklist. Sus afirmaciones subjetivas no aportan corrección automática, agregan desplazamiento vertical y no forman parte de los requisitos de finalización.

### Un caso completo antes del catálogo

La sección comenzará con la rutina y luego desarrollará `MODULE_NOT_FOUND` usando `saludos.js`, archivo conocido por el estudiante. Se mostrará código defectuoso, salida condensada, lectura de evidencia, corrección mínima y resultado exitoso antes de comparar otras clases de error.

Alternativa descartada: abrir con seis tarjetas de definiciones. Los nombres aislados son difíciles de transferir a una situación real si el estudiante nunca practicó la lectura del mensaje.

### Propiedades estables sobre textos exactos

La guía priorizará clase, `error.code`, primera ubicación propia y, en errores del sistema de archivos, `error.path`. Las salidas indicarán que rutas y números de línea son ejemplos porque los mensajes humanos y el stack pueden variar.

Alternativa descartada: exigir coincidencia textual completa con una captura. Eso puede hacer que un resultado correcto parezca incorrecto en otra versión o ubicación.

### Canal de error explícito

El ejemplo de historial inspeccionará `error.code` y `error.path` dentro de la callback. Se explicará que errores de sintaxis impiden iniciar, excepciones JavaScript se lanzan durante la ejecución y errores de operaciones asincrónicas llegan por el mecanismo de finalización de la API utilizada.

Alternativa descartada: mantener el `try/catch` sobre `JSON.parse`. Es válido, pero introduce un dominio nuevo y no corrige la confusión más probable en el programa que el estudiante acaba de construir.

## Risks / Trade-offs

- [Las rutas y líneas del stack cambian entre equipos] → Rotularlas como orientativas y enseñar a buscar la primera ubicación perteneciente al proyecto.
- [Un catálogo breve no cubre todos los errores] → Enseñar una rutina transferible y vincular cada categoría con una primera inspección, no prometer exhaustividad.
- [Retirar el checklist elimina una autoevaluación] → Conservar la pregunta requerida y ofrecer una bitácora práctica reutilizable que no altera el progreso.

## Migration Plan

1. Generar y probar la sección revisada, incluida una ejecución real del caso roto y corregido.
2. Verificar que la pregunta mantenga su revisión y que las otras trece secciones no cambien.
3. Ejecutar una simulación filtrada en PocketBase y confirmar estabilidad de requisitos.
4. Crear una revisión nueva sin alterar posición ni estado de publicación.
5. Verificar idempotencia y conservar la revisión anterior como rollback.
