## ADDED Requirements

### Requirement: Resumen docente de contenidos semanales
El sistema MUST ofrecer a docentes y administradores un resumen por sección que muestre estudiantes activos, aperturas, finalizaciones, pendientes y desempeño de actividades dentro de la cohorte seleccionada.

#### Scenario: Docente abre el tablero por secciones
- **WHEN** un docente consulta la analítica de contenidos de una semana
- **THEN** cada sección muestra cuántos estudiantes la abrieron, la completaron y permanecen pendientes

#### Scenario: Sección sin actividad
- **WHEN** una sección todavía no tiene aperturas ni intentos
- **THEN** el tablero muestra valores cero y un estado vacío legible

### Requirement: Navegación analítica por sección y alumno
El tablero SHALL permitir comenzar desde una sección o desde un alumno y llegar al detalle correspondiente sin perder el contexto de cohorte y semana.

#### Scenario: Detalle desde una sección
- **WHEN** un docente abre una métrica de una sección
- **THEN** el sistema lista los estudiantes relacionados con su estado, primera apertura, última apertura y finalización

#### Scenario: Detalle desde un alumno
- **WHEN** un docente abre el recorrido de un alumno
- **THEN** el sistema lista las secciones de la semana con visualización, avance, finalización, intentos y dominio

### Requirement: Analítica de actividades e intentos
El sistema SHALL mostrar por actividad la cantidad de estudiantes que intentaron, que acertaron al menos una vez y que aún no alcanzaron dominio, además del historial autorizado de intentos individuales.

#### Scenario: Resumen de actividad
- **WHEN** una actividad tiene intentos registrados
- **THEN** el tablero muestra participantes, intentos totales, estudiantes con dominio y estudiantes sin dominio

#### Scenario: Historial individual
- **WHEN** un docente abre el detalle de una actividad para un alumno
- **THEN** el sistema muestra cada intento con fecha, respuesta, resultado y revisión evaluada

#### Scenario: Auto-comprobación
- **WHEN** una actividad es una lista de auto-comprobación
- **THEN** el tablero informa pendiente o satisfecha sin calcular porcentaje de acierto

### Requirement: Semántica honesta de trazabilidad
Las métricas SHALL denominar una apertura como `visualización` o `apertura` y no SHALL afirmar que el alumno leyó el contenido basándose únicamente en eventos de navegación.

#### Scenario: Presentación de una apertura
- **WHEN** el tablero muestra actividad de lectura de una sección
- **THEN** utiliza fechas y conteos de visualización o apertura
- **AND** diferencia esos datos de la finalización verificable

### Requirement: Aislamiento de datos académicos
Cada docente o administrador SHALL ver únicamente analítica de cohortes a las que tiene acceso, y cada estudiante SHALL quedar excluido de los tableros docentes.

#### Scenario: Estudiante intenta abrir analítica
- **WHEN** un estudiante solicita una ruta o acción de analítica de contenidos
- **THEN** el sistema deniega el acceso sin exponer datos de otros estudiantes

#### Scenario: Docente fuera de contexto
- **WHEN** un docente solicita analítica de una cohorte no autorizada
- **THEN** el sistema rechaza la consulta sin revelar métricas ni identidades

