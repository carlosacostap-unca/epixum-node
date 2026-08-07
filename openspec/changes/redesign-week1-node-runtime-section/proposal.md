## Why

La sección «JavaScript salió del navegador» presenta una práctica útil, pero mezcla el lenguaje con el entorno de ejecución y deja implícitos conceptos decisivos como las API anfitrionas, el directorio de trabajo y la estructura de `process.argv`. Esto puede hacer que el estudiante interprete Node.js como otro lenguaje o como un servidor, y que memorice comandos sin comprender qué proceso está ejecutando.

## What Changes

- Reorganizar la sección en una secuencia breve que defina Node.js como runtime y lo distinga de JavaScript, un framework o un servidor.
- Contrastar explícitamente qué comparte JavaScript entre navegador y Node.js y qué API aporta cada entorno.
- Explicar el recorrido observable de `node app.js` y el papel acotado de V8, las API de Node.js y libuv.
- Convertir la práctica con `process.version`, `process.cwd()` y `process.argv` en un laboratorio guiado con interpretación de cada resultado.
- Incorporar el error `document is not defined` como diagnóstico de una incompatibilidad de entorno.
- Conservar las tres imágenes del prototipo y la pregunta obligatoria existente, eliminar la lista de control opcional y reducir la sección de 17 a 13 bloques.
- Limitar la actualización al contenido base y al borrador de `week01_runtime_nodejs`; no modificar las otras secciones ni el progreso de estudiantes.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `academic-content`: la sección de runtime de la Semana 1 deberá construir un modelo verificable de ejecución de JavaScript en Node.js, guiar una práctica observable y diagnosticar diferencias con el navegador sin introducir evidencia de finalización redundante.

## Impact

- Curaduría del manifiesto en `scripts/content/build-week1-manifest.mjs`.
- Regeneración de `content/week-01.manifest.json` y actualización de sus pruebas de regresión.
- Nueva revisión del contenido base y del borrador de la Cohorte 6 en PocketBase.
- Sin cambios de esquema, componentes de interfaz, dependencias ni contratos de API.
