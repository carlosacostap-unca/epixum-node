## Context

El dominio actual usa una unión discriminada de bloques Zod que alimenta editor, revisión inmutable, proyección pública y renderer. El conversor de Semana 1 transformó estructuras específicas del prototipo en múltiples bloques `rich_text`, por lo que perdió columnas y agrupaciones. La sección ya está en PocketBase como borrador y debe actualizarse mediante una nueva revisión.

## Goals / Non-Goals

**Goals:**

- Incorporar dos tipos de bloque reutilizables y estrictamente validados.
- Mantener una única representación para vista previa y experiencia del alumno.
- Componer la sección de terminal con aproximadamente diez bloques pedagógicos.
- Actualizar sólo la sección identificada por `week01_conoce_la_terminal`.

**Non-Goals:**

- Rediseñar otras trece secciones de Semana 1.
- Ejecutar comandos dentro del navegador.
- Crear un emulador de terminal o persistir interacciones de copia.
- Cambiar estados de publicación o reinterpretar progreso anterior.

## Decisions

### Dos bloques de dominio explícitos

Se agregarán `terminal` y `command_reference` a la unión de bloques. `terminal` tendrá título opcional y filas con `kind`, `label` y `value`; `command_reference` tendrá título e ítems con `command`, `purpose` y `tryIt`. Esto preserva semántica y habilita validaciones específicas. Se descartó representar ambos como `cards` o `rich_text` porque esos bloques no pueden conservar asociaciones ni acciones de copia de manera fiable.

### Render responsive sin tablas rígidas

La terminal usará una superficie monospace con filas de dos columnas que se apilan en móvil. La referencia usará encabezados tabulares en escritorio y unidades apiladas en móvil, compartiendo el mismo DOM semántico. Cada comando tendrá botón “Copiar”. Se evita una tabla HTML con ancho mínimo porque provocaría scroll horizontal global.

### Curaduría explícita de la sección

El generador reemplazará los bloques convertidos de esta sección por una composición declarativa y estable, reutilizando la imagen existente y las tarjetas de conceptos y errores. La práctica será un bloque de código con seis comandos; la comprobación usará `echo Hola`. Esto evita volver a inferir estructuras especiales desde selectores HTML ambiguos.

### Actualización remota focalizada

El actualizador aceptará un filtro de `sourceKey` o se incorporará un comando equivalente que exija cohorte, semana y confirmación. Creará una revisión sólo para la sección terminal, conservará posición, título y estado, y devolverá el ID anterior para rollback.

## Risks / Trade-offs

- [La unión de bloques crece] → Cubrir fábrica, editor, proyección y renderer con pruebas exhaustivas.
- [El editor genérico usa JSON para bloques complejos] → Mantener edición JSON inicialmente, con validación y vista previa; un formulario visual específico queda fuera de alcance.
- [La revisión cambia requisitos de finalización] → Conservar una sola pregunta requerida y registrar una nueva `requirementsRevision` de forma esperable.
- [El contenido se deriva del prototipo pero tiene curaduría manual] → Proteger títulos, cantidad de comandos y ausencia de fragmentos rotos mediante pruebas del manifiesto.

## Migration Plan

1. Regenerar y validar localmente el manifiesto.
2. Ejecutar pruebas de dominio, componentes y responsive.
3. Hacer dry-run sobre Cohorte 6 / Semana 1 y comprobar una sola revisión propuesta.
4. Aplicar con confirmación exacta, verificar el estado `draft` y las imágenes.
5. Repetir dry-run para confirmar idempotencia.
6. Para rollback, restaurar el `currentRevision` anterior informado por el comando sin eliminar la revisión nueva.
