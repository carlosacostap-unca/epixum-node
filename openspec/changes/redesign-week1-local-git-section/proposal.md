## Why

La sección local de Git quedó separada correctamente del recorrido de GitHub, pero todavía conserva fragmentos y vocabulario remoto, prueba el programa con un comando que ahora es inválido y prepara todos los archivos sin enseñar a revisar el contenido del commit. Esto dificulta que un principiante entienda la diferencia entre carpeta, staging y versión guardada.

## What Changes

- Reorganizar `week01_publica_primera_entrega` como un recorrido exclusivamente local: revisar, ignorar, iniciar, preparar, inspeccionar, confirmar y verificar.
- Alinear README y comando de prueba con el programa modular que exige un nombre.
- Incorporar `.gitignore` para resultados generados, secretos y dependencias, aclarando que no afecta archivos ya registrados.
- Reemplazar el agregado indiscriminado por una selección explícita de los cinco archivos del proyecto y revisar el staging con `git diff --cached` antes del commit.
- Mostrar resultados observables de `git status --short`, el primer commit, `git log -1 --oneline` y un árbol de trabajo limpio.
- Incluir recuperación segura ante carpeta incorrecta, identidad faltante, archivo sensible preparado y versiones antiguas de `git init`.
- Conservar sin cambios la pregunta requerida sobre el significado de `git commit`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `academic-content`: la sección de Git local deberá enseñar el modelo carpeta–staging–commit mediante un primer commit seguro, inspeccionable y verificable, sin anticipar publicación remota.

## Impact

- Curaduría focalizada en `scripts/content/build-week1-manifest.mjs` y manifiesto generado `content/week-01.manifest.json`.
- Pruebas de regresión en `lib/content/week1-manifest.test.ts`.
- Nueva revisión de la sección base y del borrador de Semana 1 en PocketBase, sin alterar posición, publicación ni requisitos.
- No se agregan dependencias ni cambios de esquema.
