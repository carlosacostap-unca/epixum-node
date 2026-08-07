## Why

La sección actual introduce correctamente la idea de no bloquear, pero su analogía y su diagrama pueden hacer creer que existe una sola cola, que el event loop ejecuta operaciones en segundo plano o que un temporizador de cero milisegundos se ejecuta inmediatamente. Además, la práctica con `readFile` depende de un archivo que el contenido no enseña a crear, por lo que puede fallar aunque el alumno copie el código correctamente.

## What Changes

- Reorganizar la sección en trece bloques que distingan ejecución secuencial de JavaScript, concurrencia de operaciones y ejecución posterior de callbacks.
- Explicitar qué representa y qué simplifica la analogía de la cafetería.
- Presentar pila, recursos asíncronos, colas por fases y event loop sin convertir el diagrama introductorio en una descripción literal de los internals.
- Explicar `setTimeout(..., 0)` como un umbral mínimo: registra una callback para después, pero no interrumpe el script actual ni garantiza un instante exacto.
- Convertir el ejemplo de archivos en una práctica reproducible que lea su propio archivo mediante `__filename` y muestre el orden `Inicio`, `Fin`, `Archivo listo`.
- Comparar operación asíncrona y síncrona sin afirmar que asincronismo significa mayor velocidad o JavaScript paralelo.
- Conservar las tres imágenes y la pregunta obligatoria existente; retirar la pista prematura sobre promesas y el checklist opcional.
- Limitar la actualización al contenido base y al borrador `week01_event_loop`, sin modificar otras secciones ni invalidar progreso.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `academic-content`: la sección de event loop de la Semana 1 deberá construir un modelo introductorio preciso de concurrencia y no bloqueo, ofrecer dos predicciones observables y mantener una única evidencia obligatoria estable.

## Impact

- Curaduría del manifiesto en `scripts/content/build-week1-manifest.mjs`.
- Regeneración de `content/week-01.manifest.json` y ampliación de sus pruebas de regresión.
- Nueva revisión del contenido base y del borrador de la Cohorte 6 en PocketBase.
- Sin cambios de esquema, componentes de interfaz, dependencias o contratos de API.
