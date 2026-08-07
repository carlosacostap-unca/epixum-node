## Why

La experiencia docente actual ofrece métricas y destinos especializados, pero obliga a reconstruir manualmente qué estudiante necesita atención, por qué y cuál es la siguiente acción. Además, algunos accesos pierden o expresan incorrectamente el contexto de cohorte y período, por lo que la prioridad inmediata es hacer confiable y accionable el recorrido docente antes de sumar más superficies analíticas.

## What Changes

- Reemplazar el inicio docente limitado a una cohorte por un espacio operativo global que reúna trabajo pendiente de todas las cohortes accesibles y lo ordene por urgencia.
- Introducir una ficha docente por estudiante que unifique progreso, entregas, consultas, diagnóstico, revisiones y señales de seguimiento dentro de la cohorte seleccionada.
- Hacer accionables las métricas, filas y celdas del tablero, preservando cohorte, período, estado y búsqueda al abrir la población o evidencia subyacente.
- Corregir los accesos de seguimiento y consultas por período para que sus filtros representen exactamente la población anunciada.
- Sustituir el conteo agregado de “entregas faltantes” por estados de entrega derivados por estudiante y trabajo, distinguiendo pendiente, vencida, entregada y sin actividad aplicable cuando existan los datos necesarios.
- Priorizar consultas docentes mediante antigüedad y contexto académico, manteniendo visibles el estado y la cohorte.
- Dirigir el cambio de cohorte a un destino docente útil y consistente, evitando depender de una portada genérica para continuar una tarea.
- Mantener las garantías responsive, de teclado, contraste y comunicación textual de estados del rediseño vigente.

## Capabilities

### New Capabilities

- `teacher-attention-workspace`: Bandeja operativa docente global, priorización de señales y navegación directa a la acción correspondiente.
- `teacher-student-overview`: Vista unificada y contextual de un estudiante para comprender su situación y abrir la evidencia académica relacionada.

### Modified Capabilities

- `role-based-application-shell`: El inicio, cambio de cohorte y navegación docente deben preservar el contexto y conducir a destinos orientados al trabajo.
- `teaching-analytics`: Los indicadores y segmentos docentes deben representar poblaciones consistentes y permitir navegar hasta estudiantes y evidencias accionables.
- `inquiries`: Los filtros docentes por estado, período y contexto deben ser exactos, persistentes y priorizar el trabajo no resuelto.
- `assignment-deliveries`: El seguimiento docente debe derivar estados por estudiante y trabajo con semántica temporal explícita y acceso a la entrega correspondiente.

## Impact

- Rutas y componentes de inicio, shell, cohortes, tableros, matriz de progreso, consultas, entregas y analítica de contenidos.
- Consultas a PocketBase sobre cohortes, matrículas, trabajos, entregas, consultas, revisiones, diagnósticos y encuestas de seguimiento.
- Nuevos enlaces canónicos para abrir la ficha docente de un estudiante conservando el contexto académico.
- Posible incorporación o normalización de fechas de vencimiento y reglas de aplicabilidad de trabajos; el diseño deberá degradar de forma explícita cuando esos datos no existan.
- No se eliminan rutas históricas ni se modifican permisos de estudiantes, docentes o administradores.
