# Academic Content Specification

## Purpose

Definir la publicación y navegación del contenido académico organizado en sprints, clases, trabajos prácticos y recursos enlazados.
## Requirements
### Requirement: Listado de sprints

El sistema MUST permitir a toda persona autenticada consultar los sprints en orden de creación.

#### Scenario: Consulta con sprints disponibles

- **WHEN** una persona abre `/sprints`
- **THEN** el sistema muestra cada sprint con título y fechas disponibles
- **AND** permite acceder a su detalle

#### Scenario: Consulta sin sprints

- **WHEN** no hay sprints configurados
- **THEN** el sistema presenta un estado vacío en lugar de fallar

### Requirement: Gestión de sprints

El sistema MUST permitir que docentes y administradores creen, editen y eliminen sprints.

#### Scenario: Creación válida

- **WHEN** un docente o administrador envía un título y fechas opcionales
- **THEN** el sistema crea el sprint y normaliza las fechas al formato de PocketBase

#### Scenario: Creación sin título

- **WHEN** se intenta crear un sprint sin título
- **THEN** el sistema devuelve un error de validación

#### Scenario: Edición

- **WHEN** un docente o administrador modifica un sprint existente
- **THEN** el sistema actualiza título y fechas provistas
- **AND** refresca las vistas de inicio y detalle

#### Scenario: Eliminación

- **WHEN** un docente o administrador confirma la eliminación de un sprint
- **THEN** el sistema elimina el registro y actualiza el listado

### Requirement: Detalle de sprint

El sistema MUST presentar las clases y trabajos prácticos pertenecientes al sprint solicitado.

#### Scenario: Sprint existente

- **WHEN** una persona abre `/sprints/{id}` para un sprint válido
- **THEN** el sistema muestra sus datos, clases y trabajos prácticos
- **AND** ofrece navegación al detalle de cada elemento

#### Scenario: Sprint inexistente

- **WHEN** el identificador no corresponde a un sprint accesible
- **THEN** el sistema responde como recurso no encontrado

#### Scenario: Controles de edición

- **WHEN** el usuario es `docente` o `admin`
- **THEN** el detalle habilita controles de alta, edición y baja de clases y trabajos

### Requirement: Gestión de clases

El sistema MUST permitir que docentes y administradores administren clases asociadas a un sprint.

#### Scenario: Creación de clase

- **WHEN** se envían título, sprint, descripción y fecha opcional
- **THEN** el sistema crea la clase asociada al sprint

#### Scenario: Datos mínimos ausentes

- **WHEN** falta el título o el identificador del sprint
- **THEN** el sistema rechaza la creación

#### Scenario: Edición de clase

- **WHEN** un usuario autorizado modifica título, descripción o fecha
- **THEN** el sistema actualiza la clase y refresca sus vistas relacionadas

#### Scenario: Eliminación de clase

- **WHEN** un usuario autorizado elimina una clase
- **THEN** el sistema elimina el registro y refresca el sprint padre

### Requirement: Gestión de trabajos prácticos

El sistema MUST permitir que docentes y administradores administren trabajos prácticos asociados a un sprint.

#### Scenario: Creación de trabajo

- **WHEN** se envían un título, una descripción enriquecida y un sprint
- **THEN** el sistema crea el trabajo dentro de ese sprint

#### Scenario: Edición de trabajo

- **WHEN** un usuario autorizado modifica título o descripción
- **THEN** el sistema conserva el contenido enriquecido y actualiza el trabajo

#### Scenario: Eliminación de trabajo

- **WHEN** un usuario autorizado elimina el trabajo
- **THEN** el sistema elimina el registro y actualiza el sprint padre

### Requirement: Recursos enlazados

El sistema MUST permitir asociar enlaces externos a una clase o a un trabajo práctico.

#### Scenario: Creación de recurso

- **WHEN** un docente o administrador proporciona título, URL y exactamente un padre académico
- **THEN** el sistema crea el enlace asociado a la clase o al trabajo

#### Scenario: Recurso sin padre

- **WHEN** faltan tanto la clase como el trabajo padre
- **THEN** el sistema rechaza la creación

#### Scenario: Apertura de recurso

- **WHEN** una persona activa un enlace publicado
- **THEN** el sistema abre la URL externa en una nueva pestaña con aislamiento de la página de origen

#### Scenario: Mantenimiento de recurso

- **WHEN** un docente o administrador edita o elimina un enlace
- **THEN** el sistema actualiza el registro y refresca el detalle de su padre

### Requirement: Consultas contextuales del contenido

El sistema MUST integrar las consultas asociadas en el detalle de una clase o trabajo.

#### Scenario: Detalle con consultas

- **WHEN** una persona abre una clase o trabajo con consultas relacionadas
- **THEN** el sistema muestra dichas consultas junto con el contenido y los recursos

### Requirement: Progress-oriented academic listing
The system SHALL present weeks or sprints in learning order with publication, timing, and user-progress context available for each item.

#### Scenario: Student views course structure
- **WHEN** a student opens a list of weeks or sprints
- **THEN** each available item communicates its position, current state, and relevant completion summary, and unpublished content remains unavailable

#### Scenario: Staff views course structure
- **WHEN** staff opens a list of weeks or sprints
- **THEN** draft and published items are distinguishable and creation is available as a primary contextual action

### Requirement: Separated content reading and authoring
The system SHALL keep the default detail view focused on consuming content and SHALL open create or edit controls only after an explicit staff action.

#### Scenario: Staff opens a week or sprint
- **WHEN** staff opens an academic container detail
- **THEN** classes and assignments remain readable without simultaneous creation forms, and authoring controls open in a dedicated panel, dialog, or mode

### Requirement: Structured content detail
The system SHALL separate overview, resources, assignment activity, and contextual inquiries while preserving navigation between them.

#### Scenario: Student opens a class
- **WHEN** a student opens a class
- **THEN** the description and learning resources are prioritized and contextual inquiries remain directly reachable

