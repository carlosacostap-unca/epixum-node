## Why

El diagnóstico actual guarda intentos y una nota global, pero presenta las quince preguntas juntas, mezcla el primer resultado con la práctica posterior y ofrece poca orientación al estudiante o al equipo docente. La experiencia debe medir los conocimientos previos de JavaScript con mayor claridad y resistir recargas, fallos de red y envíos repetidos.

## What Changes

- Distinguir el primer intento como diagnóstico inicial y los posteriores como práctica, conservando métricas separadas.
- Presentar una pregunta por vez con progreso visible, navegación anterior/siguiente y resumen antes de enviar.
- Guardar localmente el borrador y restaurarlo tras recargas o interrupciones.
- Confirmar el envío final y evitar resultados duplicados mediante una clave idempotente por intento.
- Clasificar las preguntas por áreas de JavaScript y mostrar puntajes por categoría.
- Entregar retroalimentación personalizada por categoría al finalizar.
- Mejorar el reporte docente con diagnóstico inicial, último, mejor, evolución, cantidad de intentos, desglose temático y preguntas con mayor dificultad.
- Revisar la redacción y cobertura de las preguntas sin convertir el diagnóstico en una evaluación de Node.js.

## Capabilities

### New Capabilities

- `javascript-diagnostic-assessment`: Experiencia estudiantil del diagnóstico inicial y sus intentos de práctica, incluyendo progreso, recuperación, categorización, retroalimentación e idempotencia.

### Modified Capabilities

- `teaching-analytics`: El reporte docente incorpora métricas del diagnóstico inicial, evolución, categorías y dificultad por pregunta.

## Impact

- Componentes y páginas del diagnóstico y del inicio semanal.
- Dominio y acciones de `lib/cohorts/javascript-assessment*`.
- Colección PocketBase `javascript_assessment_results` y scripts de esquema.
- Reporte docente, funciones analíticas y pruebas unitarias/E2E.
- Almacenamiento local del navegador para borradores; sin nuevas dependencias externas.
