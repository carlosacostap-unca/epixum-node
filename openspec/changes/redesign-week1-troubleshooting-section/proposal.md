## Why

La sección actual enumera errores frecuentes, pero ofrece pocos mensajes reales y pocas conexiones entre síntoma, evidencia, hipótesis y corrección. Para un estudiante principiante, esa distancia favorece cambios al azar y dificulta pedir ayuda con información útil.

## What Changes

- Reorganizar `week01_errores_frecuentes` como una rutina de diagnóstico aplicada al programa modular construido en la sección anterior.
- Enseñar a distinguir clase, mensaje, primera ubicación útil, código estable y canal de propagación del error.
- Desarrollar un caso completo de `MODULE_NOT_FOUND`, desde el código defectuoso hasta la corrección y la nueva ejecución.
- Comparar `SyntaxError`, `ReferenceError`, `TypeError`, `MODULE_NOT_FOUND`, `ENOENT` y errores recibidos por callback con acciones concretas de investigación.
- Incorporar trazas temporales seguras y una plantilla breve para registrar comando, evidencia, hipótesis, cambio y resultado.
- Retirar contenidos prematuros o descontextualizados sobre `await` y JSON, eliminar el checklist opcional y conservar sin cambios la pregunta autocorregible requerida.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `academic-content`: la guía de errores de la Semana 1 deberá enseñar un proceso de diagnóstico reproducible con ejemplos contextualizados, correcciones mínimas y evidencia útil para solicitar ayuda.

## Impact

- Curaduría focalizada en `scripts/content/build-week1-manifest.mjs` y manifiesto generado `content/week-01.manifest.json`.
- Pruebas de regresión en `lib/content/week1-manifest.test.ts`.
- Nueva revisión de la sección base y del borrador de Semana 1 en PocketBase, sin alterar su publicación ni los requisitos de finalización.
- No se agregan dependencias ni cambios de esquema.
