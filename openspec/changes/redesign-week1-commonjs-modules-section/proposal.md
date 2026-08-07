## Why

La sección actual ofrece una buena introducción visual, pero el ejemplo de código imprime `24` mientras la captura muestra `12`, no explica el alcance privado de cada archivo y simplifica en exceso la resolución de rutas. El alumno puede copiar una práctica que no coincide con su evidencia visual y memorizar `require` sin comprender qué objeto recibe ni por qué `./` es necesario.

## What Changes

- Reorganizar la sección en trece bloques alrededor de una práctica CommonJS única y reproducible.
- Alinear `operaciones.js`, `app.js`, la captura y la salida esperada en el resultado `12`.
- Definir módulo, cohesión, alcance privado, interfaz pública y archivo de entrada sin promover un archivo por función.
- Explicar qué sucede al ejecutar `require("./operaciones")` y cómo la desestructuración obtiene `sumar` desde `module.exports`.
- Precisar que las rutas relativas se resuelven desde el módulo que llama, y distinguir archivo local, módulo incorporado con `node:`, carpeta superior y paquete instalado.
- Incorporar un árbol mínimo, una ejecución verificable y criterios concretos para diagnosticar ruta, exportación y sistema de módulos.
- Conservar las dos imágenes y la pregunta obligatoria existente; retirar los encabezados aislados y el checklist opcional.
- Limitar la actualización al contenido base y al borrador `week01_modulos`, sin modificar otras secciones ni invalidar progreso.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `academic-content`: la sección de módulos de la Semana 1 deberá enseñar un contrato CommonJS verificable entre dos archivos, resolución inicial de identificadores y diagnóstico básico, manteniendo una única evidencia obligatoria estable.

## Impact

- Curaduría del manifiesto en `scripts/content/build-week1-manifest.mjs`.
- Regeneración de `content/week-01.manifest.json` y ampliación de sus pruebas de regresión.
- Nueva revisión del contenido base y del borrador de la Cohorte 6 en PocketBase.
- Sin cambios de esquema, componentes de interfaz, dependencias o contratos de API.
