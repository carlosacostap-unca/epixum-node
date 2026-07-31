# Teaching Analytics Specification

## Purpose

Definir los tableros que permiten al equipo docente evaluar entregas, aprobación y respuestas de seguimiento por sprint.
## Requirements
### Requirement: Acceso docente a tableros

El sistema MUST limitar `/dashboard`, `/dashboard-cursada` y sus vistas derivadas a docentes y administradores.

#### Scenario: Acceso autorizado

- **WHEN** un `docente` o `admin` abre un tablero
- **THEN** el sistema carga y presenta los indicadores académicos

#### Scenario: Acceso no autorizado

- **WHEN** un estudiante o visitante abre un tablero docente
- **THEN** el sistema redirige al inicio

### Requirement: Resumen por sprint

El sistema MUST resumir para cada sprint la cobertura de entregas y las respuestas de encuesta.

#### Scenario: Cálculo de entregas completas

- **WHEN** se construye el resumen de un sprint
- **THEN** el sistema cuenta estudiantes con una entrega para cada trabajo de ese sprint
- **AND** calcula el porcentaje sobre el total de estudiantes

#### Scenario: Encuestas positivas

- **WHEN** existen encuestas con estado `completed`
- **THEN** el sistema las cuenta como estudiantes con entregas al día

#### Scenario: Solicitudes de seguimiento

- **WHEN** existen encuestas `incomplete_deliveries` con plan `continue`
- **THEN** el sistema las cuenta como casos que requieren seguimiento

#### Scenario: Solicitudes de recursado

- **WHEN** existen encuestas `incomplete_deliveries` con plan `retake`
- **THEN** el sistema las cuenta como solicitudes de recursado

#### Scenario: Sin sprints

- **WHEN** no hay sprints configurados
- **THEN** el tablero presenta un estado vacío

### Requirement: Detalle de segmentos de encuesta

El sistema MUST ofrecer un listado por sprint para cada segmento relevante.

#### Scenario: Segmento positivo

- **WHEN** se abre `/dashboard/{sprintId}/positive`
- **THEN** el sistema lista encuestas `completed` con estudiante expandido

#### Scenario: Segmento de seguimiento

- **WHEN** se abre `/dashboard/{sprintId}/follow-up`
- **THEN** el sistema lista encuestas incompletas cuyo plan es `continue`

#### Scenario: Segmento de recursado

- **WHEN** se abre `/dashboard/{sprintId}/retake`
- **THEN** el sistema lista encuestas incompletas cuyo plan es `retake`

### Requirement: Matriz longitudinal de cursada

El sistema MUST cruzar todos los estudiantes con todos los sprints y sus trabajos en `/dashboard-cursada`.

#### Scenario: Estado por celda

- **WHEN** un sprint tiene trabajos
- **THEN** la celda es `Aprobado` si todos están entregados y `No aprobado` en caso contrario

#### Scenario: Sprint sin trabajos

- **WHEN** el sprint no tiene trabajos configurados
- **THEN** la celda indica `Sin TPs` y se excluye del denominador aprobable

#### Scenario: Tasa general

- **WHEN** existen celdas aprobables
- **THEN** el sistema calcula el porcentaje de celdas aprobadas sobre celdas aprobables
- **AND** redondea el resultado al entero más próximo

#### Scenario: Sin celdas aprobables

- **WHEN** ningún sprint contiene trabajos
- **THEN** la tasa general es cero

### Requirement: Clasificación longitudinal de estudiantes

El sistema MUST agrupar estudiantes según la cantidad de sprints aprobados.

#### Scenario: Aprobado

- **WHEN** un estudiante tiene al menos cinco sprints aprobados
- **THEN** el sistema lo clasifica como `Aprobado`

#### Scenario: En carrera

- **WHEN** tiene tres o cuatro sprints aprobados
- **THEN** el sistema lo clasifica como `En carrera`

#### Scenario: Complicado

- **WHEN** tiene uno o dos sprints aprobados
- **THEN** el sistema lo clasifica como `Complicado`

#### Scenario: Fuera de carrera

- **WHEN** no tiene sprints aprobados
- **THEN** el sistema lo clasifica como `Fuera de carrera`

### Requirement: Identidad en reportes

El sistema MUST identificar a cada estudiante por el mejor nombre disponible.

#### Scenario: Resolución del nombre

- **WHEN** se construye una fila del tablero longitudinal
- **THEN** el sistema usa `name`, o nombre y apellido compuestos, o correo electrónico, en ese orden

### Requirement: Actionable analytics summary
Teaching dashboards SHALL connect summary metrics to the underlying students, submissions, surveys, or inquiries represented by each metric.

#### Scenario: Teacher opens a metric
- **WHEN** a teacher activates a dashboard metric or segment
- **THEN** the system opens or filters the corresponding detailed population while preserving cohort and period context

### Requirement: Persistent analytics filters
The system SHALL expose cohort, period, progress, and relevant status filters and SHALL retain them while navigating between a summary and its detail.

#### Scenario: Filtered dashboard
- **WHEN** a teacher applies supported analytics filters
- **THEN** all visible metrics and detail lists use the same filter context and disclose that context

### Requirement: Responsive longitudinal progress
The system SHALL provide an equivalent legible representation of longitudinal student progress on both wide and narrow viewports.

#### Scenario: Progress on narrow viewport
- **WHEN** the longitudinal matrix is displayed on a narrow viewport
- **THEN** each student and period status remains associated with its label and can be inspected without full-page horizontal overflow

