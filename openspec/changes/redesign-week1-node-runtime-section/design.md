## Context

La importación actual produce diecisiete bloques: cuatro textos enriquecidos, cuatro fragmentos de código, tres imágenes, dos grupos de tarjetas, dos avisos, un checklist opcional y una pregunta requerida. La práctica con `process` es valiosa, pero el recorrido no diferencia con suficiente precisión el lenguaje de su entorno ni explica el significado de los resultados observados. Véase `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**

- Formar una secuencia de trece bloques que avance desde el modelo conceptual hacia una práctica y un diagnóstico.
- Preservar las tres imágenes y la pregunta obligatoria con sus claves y definición exactas.
- Hacer observables el proceso, el directorio de trabajo y la estructura de los argumentos de línea de comandos.
- Mantener la profundidad adecuada para la primera semana y preparar, sin adelantar, la sección posterior sobre event loop.

**Non-Goals:**

- Enseñar internals de V8, fases del event loop, workers, módulos, sistema de archivos o servidores HTTP.
- Afirmar que todo código del navegador funciona en Node.js o que toda operación asíncrona depende exclusivamente de libuv.
- Modificar el esquema de bloques, su render, la corrección de actividades o el estado de publicación.
- Cambiar otras secciones o invalidar progreso previo.

## Decisions

### Curaduría declarativa de trece bloques

Una función focalizada reutilizará las imágenes y la pregunta, y sustituirá el resto por objetivo, código compartido, comparación de entornos, recorrido del proceso, piezas del runtime, laboratorio, lectura de `process` y diagnóstico. La secuencia elimina encabezados sueltos y el checklist redundante sin perder práctica.

### Comparación por lenguaje y API anfitrionas

El primer ejemplo será deliberadamente portable: variables, plantilla de texto y `console.log`. El epígrafe aclarará que esa coincidencia no vuelve intercambiables a los entornos. Tarjetas separadas presentarán el núcleo compartido, el navegador y Node.js, evitando la formulación ambigua «Node.js es JavaScript fuera del navegador» como definición completa.

### Arquitectura acotada y observable

Un bloque de pasos describirá terminal, proceso, archivo de entrada, V8, API del entorno y finalización. Otro bloque asignará a V8 la ejecución de JavaScript, a las API de Node.js el acceso a capacidades del entorno y a libuv el bucle de eventos y parte de la E/S asíncrona. Esta formulación es más precisa que representar libuv como responsable de toda asincronía, sin exigir internals.

### Laboratorio con una sola fuente de evidencia

La práctica conservará `process.version`, `process.cwd()` y el saludo obtenido de `process.argv[2]`. El comando y la captura quedarán juntos conceptualmente, seguidos por tarjetas que explican las posiciones 0, 1 y 2. La pregunta booleana existente se reutilizará sin mutación y será la única actividad requerida.

### El error como prueba del entorno

Un bloque `terminal` mostrará `ReferenceError: document is not defined` y su interpretación. La explicación no propondrá instalar una dependencia automáticamente: primero identificará que `document` es una API del DOM y que el programa debe cambiar de entorno o eliminar esa dependencia.

## Risks / Trade-offs

- [La mención de V8 y libuv puede añadir carga cognitiva] → limitar cada pieza a una responsabilidad y relacionarla con el recorrido visible del comando.
- [La imagen comparativa puede sugerir portabilidad total] → añadir un epígrafe explícito y una comparación inmediata de API anfitrionas.
- [`process.cwd()` puede variar entre capturas y equipos] → explicar que depende de la carpeta desde la cual se lanzó el comando y no exigir una ruta exacta.
- [La captura usa PowerShell y puede excluir otros sistemas] → tratar la ruta como ejemplo y mantener el comando `node app.js Martina` independiente del shell.
- [Una función declarativa se separa del HTML fuente] → probar estructura, contenido, activos, pregunta y estabilidad de las otras trece secciones.

## Migration Plan

1. Regenerar el manifiesto y demostrar que las otras trece secciones no cambian.
2. Ejecutar pruebas de contenido, dominio, interfaz, tipos, lint, build y OpenSpec estricto.
3. Simular la actualización filtrada por `week01_runtime_nodejs`.
4. Crear una revisión `draft` preservando posición, publicación y actividad.
5. Confirmar activos, idempotencia y revisión de requisitos; conservar la revisión anterior para rollback.
