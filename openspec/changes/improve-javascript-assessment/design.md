## Context

El diagnóstico vigente usa una acción de servidor para guardar un documento por intento en `javascript_assessment_results`. Las preguntas y respuestas correctas viven en el servidor, mientras el formulario cliente recibe sólo la versión pública. Véase `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**

- Mantener el servidor como autoridad para elegibilidad, puntuación y clasificación del intento.
- Conservar compatibilidad con resultados históricos y permitir desplegar el cambio sin pérdida de datos.
- Hacer que una recarga o reintento de red sea seguro para el alumno y para las métricas.
- Derivar categorías y retroalimentación desde una única definición de preguntas.

**Non-Goals:**

- Evaluar contenidos específicos de Node.js o del módulo que todavía no fue cursado.
- Sincronizar borradores entre dispositivos.
- Implementar vigilancia, límite de tiempo o mecanismos antitrampa.

## Decisions

### Versionar la nueva batería como `js-foundations-v3`

La revisión de enunciados y categorías cambia el instrumento, por lo que los resultados nuevos no deben compararse directamente con `v2`. Los registros históricos permanecerán en PocketBase y el reporte operativo usará la versión vigente.

### Clasificar intentos en el servidor

Cada resultado nuevo tendrá `attemptKind` (`initial` o `practice`) y `attemptKey`. El servidor decide el tipo según la existencia de resultados previos de la versión. Los registros históricos sin `attemptKind` se interpretarán por orden cronológico cuando deban resumirse.

Alternativa descartada: inferir siempre el tipo sólo por fecha. La etiqueta persistida hace más clara la auditoría y permite reglas de unicidad.

### Idempotencia mediante clave del intento

El cliente genera una clave al comenzar y la conserva junto al borrador. Antes de crear un resultado, el servidor busca esa clave en el mismo estudiante, cohorte y versión. Un índice único evita duplicados por concurrencia.

### Borrador local aislado

Las respuestas, posición y clave se guardan en `localStorage` bajo una clave formada por estudiante, cohorte y versión. Se evita almacenar información personal adicional y se elimina el borrador tras una respuesta exitosa.

Alternativa descartada: guardar cada respuesta en PocketBase. Añadiría mutaciones frecuentes, limpieza de borradores y una superficie de permisos innecesaria.

### Flujo secuencial con etapa de revisión

El formulario tendrá una sola pregunta visible, progreso, navegación anterior/siguiente y una pantalla final de revisión. El envío requiere confirmación y permanece deshabilitado mientras la acción está pendiente.

### Categorías derivadas de la definición de preguntas

Cada pregunta declara una categoría entre cinco áreas equilibradas. Las métricas, el resultado del alumno y el reporte docente reutilizan esa metadata para evitar divergencias.

## Risks / Trade-offs

- [El almacenamiento local puede quedar bloqueado o no estar disponible] → Capturar errores y mantener el test funcional sin recuperación automática.
- [Dos claves distintas podrían enviarse simultáneamente como primeros intentos] → Usar una restricción parcial de un único diagnóstico inicial por estudiante, cohorte y versión y recuperar el registro ganador.
- [El cambio de versión separa métricas anteriores] → Conservar `v2` sin borrarlo y rotular siempre la versión vigente en reportes.
- [Mostrar explicaciones completas facilita memorizar respuestas en reintentos] → Dar retroalimentación temática y recomendaciones, sin revelar el solucionario pregunta por pregunta al alumno.

## Migration Plan

1. Añadir `attemptKind` y `attemptKey` como campos compatibles con registros existentes.
2. Crear índices de idempotencia y diagnóstico inicial único para registros nuevos.
3. Desplegar la aplicación con `js-foundations-v3`.
4. Mantener intactos los resultados `v2`; el rollback consiste en restaurar la constante de versión y la interfaz anterior.
