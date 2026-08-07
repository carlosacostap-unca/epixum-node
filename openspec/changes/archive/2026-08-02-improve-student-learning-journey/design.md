## Context

El inicio semanal actual usa un componente de bienvenida independiente del inicio estudiantil general. El progreso por sección ya guarda `lastViewedAt`, `lastBlockKey` y `lastBlockIndex`, y los bloques renderizados ya poseen identificadores estables, pero los enlaces de continuación sólo incluyen la ruta de la sección. El shell y el lector renderizan barras inferiores fijas con el mismo borde y nivel de apilamiento en móvil.

## Goals / Non-Goals

**Goals:**

- Derivar una próxima acción determinista a partir de semanas publicadas y progreso existente.
- Reutilizar las claves de bloque persistidas sin cambios de esquema.
- Reducir pasos para estudiantes sin modificar el detalle predeterminado de staff.
- Mantener una única navegación inferior en el lector móvil.

**Non-Goals:**

- Redefinir las reglas de finalización o dominio de actividades.
- Añadir fechas límite, notificaciones, eventos de lectura o nuevas colecciones.
- Cambiar el onboarding, el diagnóstico o la gestión docente más allá de su posición en el inicio.
- Rediseñar breadcrumbs, perfil o preferencias de tema en este cambio.

## Decisions

### Elegir el destino de aprendizaje con funciones puras y datos existentes

La selección priorizará una semana publicada, vigente por fecha y con contenido incompleto; si no existe, usará la primera semana incompleta en orden y, cuando todo esté completo, la última semana con contenido. Dentro de la semana se reutilizará la selección de la sección incompleta vista más recientemente o la primera pendiente.

La alternativa de almacenar un único `currentLesson` en PocketBase duplicaría un estado que ya puede derivarse y exigiría sincronización adicional.

### Reanudar mediante fragmentos de URL estables

Los enlaces agregarán `#block-{lastBlockKey}` cuando el progreso pertenezca a la sección vigente. Los bloques ya exponen esos identificadores; se añadirá margen de desplazamiento para respetar el encabezado fijo. Si el bloque desapareció, el navegador mantendrá la sección al comienzo sin producir un error.

Se descarta ejecutar scroll imperativo después de cada render porque compite con la restauración nativa, añade estado cliente y no mejora el fallback ante bloques eliminados.

### Mantener el resumen para staff y profundizar enlaces estudiantiles

El listado de semanas sustituirá sólo el `href` de cada tarjeta estudiantil por su destino de continuación. Las tarjetas docentes conservarán la raíz de semana y sus herramientas de gestión.

### Tratar el lector como una ruta enfocada en móvil

El shell reconocerá las rutas canónicas de sección y omitirá allí la navegación principal inferior únicamente en viewports móviles; el lector conservará su barra secuencial y un enlace explícito para volver a la semana. En escritorio se mantiene la barra lateral del shell.

La alternativa de desplazar una barra encima de la otra consume demasiado alto útil y mantiene dos modelos de navegación simultáneos durante una tarea lineal.

### Integrar el inicio sin cambiar el modelo de onboarding

La bienvenida semanal seguirá mostrando horario, comunidad y diagnóstico, pero después de un encabezado y una tarjeta principal de continuación. Una configuración inválida de comunidad degradará sólo esa tarjeta en vez de impedir el acceso al inicio.

## Risks / Trade-offs

- [Consultar progreso de varias semanas aumenta lecturas del inicio] → Consultar en paralelo y limitarse a semanas publicadas; medir el render dentro del presupuesto existente.
- [Un fragmento apunta a un bloque eliminado] → Mantener el fallback nativo al comienzo de la sección.
- [Ocultar la navegación móvil puede reducir descubrimiento] → Conservar un enlace visible para salir del lector y restaurar inmediatamente la navegación global al abandonar la ruta.
- [Una semana sin secciones produce un CTA poco accionable] → Enlazar a la pestaña contextual de contenidos y mostrar su estado vacío existente.

## Migration Plan

1. Incorporar selección y construcción de destinos como funciones probadas.
2. Integrar los destinos en el listado semanal y el inicio.
3. Añadir reanudación por fragmento y modo lectura móvil.
4. Ejecutar pruebas unitarias, de componentes, lint y build.

Rollback: revertir los enlaces profundos y la condición de navegación del shell. No hay migraciones ni datos nuevos que deshacer.
