## Context

La importación actual produce quince bloques: tres encabezados aislados, dos imágenes, tres códigos, tres grupos de tarjetas, dos avisos, un checklist opcional y una pregunta requerida. El primer ejemplo calcula `24`, mientras la captura enseña una versión distinta que exporta sólo `sumar` y muestra `12`. La explicación de rutas no diferencia el directorio del módulo de `process.cwd()`. Véase `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**

- Formar una secuencia de trece bloques con un contrato ejecutable entre `operaciones.js` y `app.js`.
- Preservar las dos imágenes y la pregunta obligatoria con sus claves y definición exactas.
- Conectar cohesión, encapsulación e interfaz pública con evidencia visible en código y terminal.
- Preparar la siguiente sección de programa modular sin duplicar su proyecto completo.

**Non-Goals:**

- Enseñar ESM en profundidad, interoperabilidad avanzada, caché, ciclos, paquetes, `package.json` o publicación en npm.
- Afirmar que un archivo debe contener una sola función o que `app.js` jamás puede realizar un cálculo trivial.
- Enseñar todas las variantes de resolución de Node.js o los detalles del algoritmo de `node_modules`.
- Modificar el esquema de bloques, el render, la corrección, otras secciones o el progreso previo.

## Decisions

### Curaduría declarativa de trece bloques

Una función focalizada reutilizará las imágenes y la pregunta, y reemplazará el resto por objetivo, principios del módulo, dos archivos alineados, recorrido de `require`, identificadores, árbol mínimo, salida, responsabilidades y diagnóstico. Se eliminan encabezados aislados y checklist opcional.

### Un solo ejemplo idéntico a la captura

`operaciones.js` definirá y exportará `sumar`; `app.js` la obtendrá mediante desestructuración y mostrará `12`. Se descarta conservar `duplicar` y el resultado `24` porque contradicen la imagen y añaden una segunda operación antes de consolidar el contrato básico.

### Alcance privado antes que fragmentación

Las tarjetas iniciales presentarán cohesión, alcance local, interfaz pública y punto de entrada. La metáfora de cajones se acompañará con la advertencia de que los límites se eligen por propósito, no por una regla mecánica de un archivo por función.

### Resolución desde el módulo que importa

El recorrido explicará que `./operaciones` se resuelve con relación a `app.js`, incluso si el proceso fue iniciado desde otra carpeta mediante una ruta válida. Se mantendrá la ruta sin `.js` porque la pregunta existente la utiliza y CommonJS resuelve esa extensión; el texto recomendará consistencia y respetar mayúsculas.

### Cuatro identificadores, cuatro intenciones

Las tarjetas distinguirán `./operaciones`, `../utilidades`, `node:fs` y un paquete como `express`. La alternativa de agrupar módulos incorporados y paquetes bajo “sin ./” se descarta porque oculta que `node:` expresa explícitamente un módulo provisto por Node.js.

### Diagnóstico sin migración improvisada

Las tarjetas finales asociarán `MODULE_NOT_FOUND` con ruta, nombre y mayúsculas; “no es una función” con el contrato exportado; y `require is not defined` con un proyecto interpretado como ESM. El ejemplo se declarará CommonJS y no sugerirá mezclar sintaxis como reparación.

## Risks / Trade-offs

- [Node.js moderno admite interoperabilidad parcial entre sistemas] → enseñar un contrato CommonJS coherente y reservar excepciones para un nivel posterior.
- [La extensión omitida puede parecer universal] → limitar la afirmación al cargador CommonJS del ejemplo y mostrar que `./` sigue siendo obligatorio.
- [La metáfora de cajones puede promover demasiados archivos] → explicitar cohesión y propósito compartido como criterio de separación.
- [La captura no muestra todas las explicaciones] → alinear los dos archivos y la salida, y usar epígrafes para señalar qué representa cada número.
- [Una función declarativa se separa del HTML fuente] → probar estructura, activos, código, resolución, diagnóstico, pregunta y estabilidad de las otras trece secciones.

## Migration Plan

1. Regenerar el manifiesto y demostrar que las otras trece secciones permanecen idénticas.
2. Ejecutar el ejemplo CommonJS y las pruebas de contenido, interfaz, tipos, lint, build y OpenSpec estricto.
3. Simular la actualización filtrada por `week01_modulos`.
4. Crear una revisión `draft` preservando posición, publicación y actividad.
5. Confirmar activos, idempotencia y revisión de requisitos; conservar la revisión anterior para rollback.
