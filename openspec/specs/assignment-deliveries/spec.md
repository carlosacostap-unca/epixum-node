# Assignment Deliveries Specification

## Purpose

Definir la entrega individual de trabajos prácticos mediante repositorios y su seguimiento por parte del equipo docente.
## Requirements
### Requirement: Entrega única por trabajo y estudiante

El sistema MUST registrar como máximo una entrega por combinación de trabajo práctico y estudiante.

#### Scenario: Primera entrega válida

- **WHEN** un estudiante autenticado envía un trabajo y una URL de repositorio no vacía
- **THEN** el sistema crea una entrega asociada al estudiante de la sesión

#### Scenario: Entrega duplicada

- **WHEN** el estudiante intenta crear una segunda entrega para el mismo trabajo
- **THEN** el sistema rechaza el duplicado e informa que ya existe una entrega

#### Scenario: Datos obligatorios ausentes

- **WHEN** falta el trabajo o la URL del repositorio
- **THEN** el sistema rechaza la solicitud

### Requirement: Restricción de creación por rol

El sistema MUST permitir crear entregas únicamente a usuarios con rol `estudiante`.

#### Scenario: Docente intenta entregar

- **WHEN** un docente, administrador o usuario no autenticado intenta crear una entrega
- **THEN** el sistema rechaza la operación

### Requirement: Edición de una entrega

El sistema MUST permitir actualizar la URL de repositorio de una entrega accesible para la sesión, sujeta a las reglas de PocketBase.

#### Scenario: Actualización válida

- **WHEN** el propietario autorizado envía una URL no vacía para una entrega existente
- **THEN** el sistema actualiza la URL y refresca el detalle del trabajo

#### Scenario: URL vacía

- **WHEN** se intenta actualizar una entrega con una URL vacía
- **THEN** el sistema rechaza la actualización

### Requirement: Vista del estudiante

El sistema MUST mostrar al estudiante su propia entrega en el detalle del trabajo práctico.

#### Scenario: Trabajo sin entrega propia

- **WHEN** un estudiante abre un trabajo que todavía no entregó
- **THEN** el sistema presenta el formulario de entrega

#### Scenario: Trabajo con entrega propia

- **WHEN** un estudiante abre un trabajo ya entregado
- **THEN** el sistema muestra la URL, fecha y hora de entrega
- **AND** permite iniciar la edición

### Requirement: Vista docente de entregas

El sistema MUST permitir a docentes y administradores consultar todas las entregas de un trabajo.

#### Scenario: Docente abre un trabajo

- **WHEN** un docente o administrador abre el detalle de un trabajo
- **THEN** el sistema lista entregas con identidad expandida del estudiante, repositorio y fecha
- **AND** permite buscar estudiantes dentro del listado

### Requirement: Matriz de entregas por sprint

El sistema MUST ofrecer a docentes y administradores una matriz que cruce estudiantes, trabajos y entregas de un sprint.

#### Scenario: Consulta de progreso

- **WHEN** un usuario docente abre `/dashboard/{sprintId}/deliveries`
- **THEN** el sistema carga el sprint, sus trabajos, todos los estudiantes y las entregas correspondientes
- **AND** muestra para cada estudiante qué trabajos tienen una entrega registrada

#### Scenario: Acceso no autorizado

- **WHEN** un usuario que no es docente ni administrador abre la matriz
- **THEN** el sistema redirige al inicio

### Requirement: Criterio de aprobación de sprint

El sistema MUST considerar un sprint aprobado por un estudiante cuando existe una entrega para cada trabajo configurado en ese sprint.

#### Scenario: Todas las entregas presentes

- **WHEN** el conjunto de entregas del estudiante cubre todos los trabajos de un sprint con al menos un trabajo
- **THEN** el estado del sprint es `approved`

#### Scenario: Entregas incompletas

- **WHEN** falta al menos una entrega de un sprint con trabajos
- **THEN** el estado del sprint es `pending`

#### Scenario: Sprint sin trabajos

- **WHEN** un sprint no contiene trabajos prácticos
- **THEN** el estado es `empty` y no cuenta como sprint aprobable

### Requirement: Explicit student delivery state
The assignment detail SHALL identify the student's delivery state and the single next applicable action before showing secondary information.

#### Scenario: Assignment without submission
- **WHEN** a student opens an assignment they have not submitted
- **THEN** the system identifies it as pending and presents the submission action with its requirements

#### Scenario: Assignment with submission
- **WHEN** a student opens an assignment they have submitted
- **THEN** the system displays the repository, submission state, and available update action

### Requirement: Actionable teacher delivery overview
The staff assignment detail SHALL summarize submission coverage and provide searchable or filterable access to individual submissions.

#### Scenario: Teacher reviews submissions
- **WHEN** staff opens an assignment with enrolled students
- **THEN** the system shows submitted and missing counts and allows the list to be narrowed without losing assignment context

