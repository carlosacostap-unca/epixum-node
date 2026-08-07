## Why

La práctica integradora de la Semana 1 reúne herramientas y conceptos pertinentes, pero hoy obliga al estudiante a copiar varios fragmentos sin mostrar con claridad el contrato observable del programa ni cómo comprobar cada avance. Además, el historial depende del directorio desde el que se ejecute Node.js y la consigna menciona validación y errores sin enseñar una implementación verificable.

## What Changes

- Reorganizar `week01_programa_modular` como un taller incremental que anticipe entrada, salidas, archivo generado y conducta ante errores.
- Proveer una versión final coherente y ejecutable de `app.js`, `saludos.js` e `historial.js`, usando CommonJS y una ruta de historial estable respecto del módulo.
- Validar explícitamente el nombre recibido por línea de comandos y mostrar una instrucción de uso cuando falte.
- Incorporar resultados esperados, una comprobación segura de casos exitosos y fallidos, un README mínimo y diagnóstico orientado a principiantes.
- Conservar la evidencia obligatoria existente y sumar una pregunta autocorregible sobre `process.argv` para comprobar comprensión, no solo ejecución mecánica.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `academic-content`: la práctica integradora deberá presentar un programa modular completo, portable y verificable, con progresión pedagógica, evidencia de ejecución y una comprobación conceptual requerida.

## Impact

- Curaduría focalizada en `scripts/content/build-week1-manifest.mjs` y manifiesto generado `content/week-01.manifest.json`.
- Pruebas de regresión en `lib/content/week1-manifest.test.ts`.
- Nueva revisión de la sección base y del borrador de Semana 1 en PocketBase, sin cambiar su publicación.
- No se agregan dependencias ni se modifica el esquema de datos.
