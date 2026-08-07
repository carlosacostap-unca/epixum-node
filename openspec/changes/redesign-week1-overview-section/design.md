## Context

La primera sección ya se genera de forma declarativa dentro del manifiesto de Semana 1 y se almacena como una revisión en PocketBase. El dominio dispone de bloques `callout`, `code`, `cards` y `steps`, suficientes para representar la nueva composición sin ampliar esquemas ni renderizadores. El actualizador admite filtrar por `sourceKey` y preservar el estado editorial.

## Goals / Non-Goals

**Goals:**

- Componer una introducción breve y concreta con bloques ya soportados.
- Mantener separadas la duración de la clase guiada y la carga de trabajo individual.
- Regenerar el manifiesto de manera determinista y actualizar una sola sección remota.

**Non-Goals:**

- Modificar las otras trece secciones de Semana 1.
- Estimar o imponer una carga horaria total para el alumno.
- Agregar actividades, preguntas obligatorias o nuevos tipos de bloque.
- Publicar la sección o la semana.

## Decisions

### Composición de cinco bloques existentes

La sección se construirá con: un `callout` informativo de modalidad y duración, un bloque `code` con el árbol del entregable, tres `cards` de objetivos, cinco `steps` de recorrido y un `callout` neutral de preparación. Se descarta conservar encabezados separados porque agregan scroll sin aportar contexto, y se descarta crear bloques nuevos porque la semántica necesaria ya existe.

### Tiempo expresado como metadato de la clase guiada

El texto principal usará `CLASE GUIADA · 1 H 30 MIN` y aclarará expresamente que no incluye práctica, instalaciones ni preparación de la entrega. No se ofrecerá una estimación alternativa de carga total porque no fue definida.

### Entregable visible antes del recorrido

La estructura `programa-modular-node/` aparecerá antes de los objetivos para dar una referencia concreta a los conceptos posteriores. Se usará un bloque de código existente, que ya limita el desplazamiento horizontal a su propia superficie.

### Preparación sin estado de progreso

Los requisitos previos se expresarán como texto informativo y no como checklist. Así, la sección sin actividades se completará al llegar al final y no se mezclará preparación personal con evaluación.

### Actualización remota focalizada

El manifiesto se regenerará completo, pero el comando remoto se ejecutará con `--source-key week01_resumen`. La operación creará una revisión nueva, conservará `draft`, posición y resto de metadatos, e informará la revisión anterior para rollback.

## Risks / Trade-offs

- [La aclaración horaria puede crecer demasiado] → Mantenerla en dos oraciones y ubicarla en el primer bloque.
- [El árbol de archivos podría desbordar en móvil] → Reutilizar el scroll localizado del bloque de código y usar nombres breves.
- [La regeneración del manifiesto toca datos locales de todas las secciones] → Probar que sólo cambia `week01_resumen` y aplicar el filtro remoto obligatorio.
- [Cambiar requisitos de una sección puede afectar progreso] → No incluir actividades requeridas y preservar el comportamiento de finalización al llegar al último bloque.

## Migration Plan

1. Implementar la composición declarativa y regenerar el manifiesto.
2. Validar por prueba que la sección tiene cinco bloques, tiempo correcto y ninguna referencia a `2 h 30 min`.
3. Confirmar que las otras trece secciones permanecen sin cambios.
4. Ejecutar dry-run y aplicar una revisión sólo a `week01_resumen` en Cohorte 6 / Semana 1.
5. Verificar estado `draft`, idempotencia y pruebas del proyecto.
6. Para rollback, reasignar `currentRevision` a la revisión anterior informada por el actualizador.
