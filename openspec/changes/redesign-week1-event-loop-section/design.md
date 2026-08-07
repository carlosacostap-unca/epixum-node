## Context

La importación actual produce catorce bloques: tres encabezados aislados, tres imágenes, dos ejemplos de código, dos grupos de tarjetas, dos avisos, un checklist opcional y una pregunta requerida. Las ilustraciones funcionan como introducción, pero la cola única y la analogía de la cafetería requieren límites explícitos. La práctica de archivos referencia `datos.txt` sin proporcionarlo. Véase `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**

- Formar una secuencia de trece bloques que avance de analogía a modelo, predicción y práctica reproducible.
- Preservar las tres imágenes y la pregunta obligatoria con sus claves y definición exactas.
- Distinguir claramente «operación en curso» de «callback JavaScript ejecutándose».
- Preparar un vocabulario suficiente para razonar sobre orden y bloqueo sin enseñar todos los internals del runtime.

**Non-Goals:**

- Enseñar todas las fases del event loop, `process.nextTick`, `setImmediate`, microtareas, workers o diferencias entre versiones de libuv.
- Prometer orden entre temporizadores y otras fuentes asíncronas más allá de los dos ejemplos controlados.
- Afirmar que toda E/S utiliza el mismo mecanismo interno o que toda callback lista comparte una única cola.
- Modificar el esquema de bloques, el render, la corrección, otras secciones o el progreso previo.

## Decisions

### Curaduría declarativa de trece bloques

Una función focalizada reutilizará las imágenes y la pregunta, y reemplazará el resto por objetivo, límites de la analogía, modelo de cuatro piezas, traza A–C–B, regla de temporizadores, lectura reproducible, salida esperada y comparación de bloqueo. Se eliminan encabezados aislados, pista de promesas y checklist opcional.

### Una analogía con correspondencias y límites

Las tarjetas posteriores a la cafetería mapearán cajero, cocina y pedidos listos, y advertirán que el cajero no «continúa» la preparación. El event loop coordina cuándo ejecutar callbacks; la operación puede ser atendida por el sistema operativo o por recursos internos de Node.js. Esta precisión conserva la intuición sin volver literal la ilustración.

### Cola didáctica, fases reales

El epígrafe del diagrama explicará que la caja «cola de tareas» representa de forma simplificada callbacks listas. Las tarjetas hablarán de colas asociadas a fases, sin enumerarlas. La alternativa de enseñar el diagrama completo se descarta por carga cognitiva y porque no es necesaria para predecir los ejemplos de la semana 1.

### Temporizador como umbral mínimo

Una secuencia de pasos seguirá `A`, registro del temporizador, `C` y `B`. Un aviso separado fijará que cero no interrumpe el script actual, que Node.js normaliza retrasos menores que un milisegundo y que el instante real puede demorarse por trabajo pendiente. No se comparará `setTimeout` con `setImmediate`, porque su orden depende del contexto y excede el objetivo inicial.

### Lectura del propio archivo

El ejemplo utilizará `readFile(__filename, "utf8", callback)` y mostrará la cantidad de caracteres, evitando un activo auxiliar y una salida extensa. Un texto breve aclarará que `require` y `__filename` pertenecen al sistema CommonJS y se estudiarán en la sección siguiente. La salida demostrará sólo el orden estable `Inicio`, `Fin`, `Archivo listo`; el número exacto será variable.

### Asincronismo no equivale a JavaScript paralelo

Las tarjetas finales separarán capacidad de respuesta, tiempo de finalización y variante síncrona. La callback de `readFile` seguirá ejecutándose en el hilo del event loop; la lectura del sistema de archivos se realiza fuera de él. Esto evita atribuir la operación completa al event loop o suponer dos fragmentos JavaScript simultáneos.

## Risks / Trade-offs

- [La analogía visual dice «retoma cuando puede»] → el epígrafe y las tarjetas aclararán que se retoma la atención del resultado, no la preparación delegada.
- [El diagrama muestra una única cola] → identificarlo como modelo didáctico y mencionar colas asociadas a fases.
- [El uso de `require` y `__filename` anticipa CommonJS] → explicar sólo lo necesario y enlazar conceptualmente con la siguiente sección de módulos.
- [La cantidad de caracteres cambia al editar el archivo] → representar el valor como variable y evaluar únicamente el orden de las líneas.
- [Una función declarativa se separa del HTML fuente] → probar estructura, activos, conceptos, código, pregunta y estabilidad de las otras trece secciones.

## Migration Plan

1. Regenerar el manifiesto y demostrar que las otras trece secciones permanecen idénticas.
2. Ejecutar pruebas de contenido, dominio, interfaz, tipos, lint, build y OpenSpec estricto.
3. Simular la actualización filtrada por `week01_event_loop`.
4. Crear una revisión `draft` preservando posición, publicación y actividad.
5. Confirmar activos, idempotencia y revisión de requisitos; conservar la revisión anterior para rollback.
