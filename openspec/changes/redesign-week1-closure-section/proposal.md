## Why

El cierre actual enumera definiciones, usa rótulos genéricos y declara la semana completada antes de comprobar el aprendizaje. La última sección debe ayudar al alumno a reconstruir lo que hizo, detectar qué necesita repasar y conservar una referencia breve para continuar.

## What Changes

- Reemplazar el resumen lineal por una reconstrucción del recorrido completo de `programa-modular-node`, desde la terminal hasta la publicación verificable.
- Alinear la hoja de referencia con los comandos, archivos y resultados enseñados en las trece secciones anteriores.
- Separar comparaciones conceptuales en tarjetas independientes con nombres significativos.
- Ampliar y precisar el glosario con los términos que el alumno realmente utilizó durante la semana.
- Incorporar rutas de repaso que indiquen a qué sección volver según la dificultad observada.
- Preservar la pregunta requerida y mantener la autoevaluación como actividad opcional, actualizando sus criterios para que describan evidencias observables.
- Mover el mensaje de cierre después de la comprobación y evitar prometer contenidos futuros que todavía no estén definidos.
- Añadir pruebas de regresión y actualizar la revisión en borrador de la Cohorte 6 con rollback disponible.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `academic-content`: la última sección de una semana debe sintetizar capacidades, orientar la recuperación y condicionar el cierre a una comprobación académica coherente.

## Impact

- Curaduría focalizada en `scripts/content/build-week1-manifest.mjs`.
- Manifiesto `content/week-01.manifest.json` y pruebas de regresión en `lib/content/week1-manifest.test.ts`.
- Nueva revisión de `week01_cierre_glosario` en PocketBase, preservando posición y estado editorial.
- Sin cambios de esquema, APIs, rutas ni dependencias.
