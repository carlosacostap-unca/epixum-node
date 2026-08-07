## Why

La sección actual presenta correctamente la idea general, pero separa conceptos relacionados, muestra sólo una reserva exitosa y puede dejar la impresión de que el front end no valida o que la base de datos intercambia solicitudes HTTP. Un alumno que recién empieza necesita reconocer la frontera de confianza, seguir una operación completa y entender que el back end también rechaza solicitudes sin registrar cambios.

## What Changes

- Reorganizar la sección en once bloques con una progresión desde arquitectura hasta una reserva concreta.
- Preservar las tres ilustraciones existentes con epígrafes que distingan comunicación HTTP de consultas internas y resultados.
- Definir front end, back end, base de datos y servicios externos mediante responsabilidades concretas, sin asociarlos rígidamente a una tecnología.
- Aclarar que la validación del cliente mejora la experiencia, pero el servidor debe volver a validar datos, permisos y reglas porque la solicitud es entrada no confiable.
- Presentar el recorrido de la reserva con bifurcaciones: registrar únicamente cuando el usuario y la disponibilidad son válidos; responder con un error útil en caso contrario.
- Unificar solicitud y respuesta en una transcripción HTTP introductoria con método, ruta, cuerpo, estado y resultado.
- Incorporar vocabulario operativo: solicitud, respuesta, regla de negocio y persistencia.
- Retirar el checklist opcional redundante y mantener sin cambios la pregunta obligatoria sobre responsabilidades del back end.
- Actualizar únicamente `week01_que_hace_backend` en Cohorte 6 / Semana 1, preservando su estado `draft`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `academic-content`: La introducción al back end presenta un modelo cliente-servidor verificable, una frontera de confianza explícita y resultados de éxito o rechazo antes de evaluar responsabilidades.

## Impact

- Curaduría declarativa en `scripts/content/build-week1-manifest.mjs`.
- Manifiesto y pruebas de Semana 1 en `content` y `lib/content`.
- Nueva revisión de una sola sección en PocketBase; no cambia la publicación, las imágenes, las demás secciones ni la actividad obligatoria.
