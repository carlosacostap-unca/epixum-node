# Review Scheduling Specification

## Purpose

Definir la creación, reserva y gestión de turnos de revisión por sprint, incluidos datos de encuentro y notas docentes.
## Requirements
### Requirement: Navegación de revisiones

El sistema MUST permitir a toda persona autenticada elegir un sprint y consultar sus turnos ordenados por hora de inicio.

#### Scenario: Listado de sprints

- **WHEN** una persona abre `/reviews`
- **THEN** el sistema muestra los sprints disponibles con acceso a sus turnos

#### Scenario: Sprint de revisión inexistente

- **WHEN** se solicita `/reviews/{sprintId}` para un sprint no accesible
- **THEN** el sistema responde como recurso no encontrado

### Requirement: Creación de turnos

El sistema MUST permitir a docentes y administradores crear turnos ligados al sprint y al docente de la sesión.

#### Scenario: Turno individual

- **WHEN** un usuario autorizado proporciona inicio y fin
- **THEN** el sistema crea el turno con el docente actual

#### Scenario: Generación por lote

- **WHEN** un usuario autorizado proporciona inicio, duración y cantidad
- **THEN** el sistema crea turnos consecutivos con esa duración

#### Scenario: Pausas periódicas

- **WHEN** el lote incluye duración de pausa y frecuencia positivas
- **THEN** el sistema inserta la pausa después de cada cantidad indicada de turnos, salvo después del último

#### Scenario: Usuario no autorizado

- **WHEN** un estudiante intenta crear turnos
- **THEN** el sistema rechaza la operación

### Requirement: Reserva estudiantil exclusiva

El sistema MUST permitir únicamente a estudiantes reservar un turno libre y como máximo uno por sprint.

#### Scenario: Reserva válida

- **WHEN** un estudiante sin reserva en el sprint elige un turno libre
- **THEN** el sistema asigna el identificador del estudiante al turno

#### Scenario: Turno ocupado

- **WHEN** el turno ya tiene estudiante
- **THEN** el sistema rechaza la reserva

#### Scenario: Segunda reserva del sprint

- **WHEN** el estudiante ya tiene otro turno en el mismo sprint
- **THEN** el sistema rechaza la nueva reserva

#### Scenario: Otro rol intenta reservar

- **WHEN** un usuario distinto de `estudiante` intenta reservar
- **THEN** el sistema rechaza la operación

### Requirement: Cancelación y liberación

El sistema MUST permitir que un estudiante cancele su propia reserva y que docentes o administradores liberen cualquier reserva.

#### Scenario: Cancelación propia

- **WHEN** el estudiante asignado cancela
- **THEN** el sistema elimina la relación `student` del turno

#### Scenario: Cancelación ajena

- **WHEN** un estudiante intenta cancelar una reserva de otra persona
- **THEN** el sistema rechaza la operación

#### Scenario: Liberación docente

- **WHEN** un docente o administrador libera un turno reservado
- **THEN** el turno vuelve a estar disponible

### Requirement: Eliminación de turnos

El sistema MUST permitir eliminar turnos únicamente a docentes y administradores.

#### Scenario: Eliminación autorizada

- **WHEN** un usuario autorizado elimina un turno
- **THEN** el sistema borra el registro y refresca el sprint de revisiones

### Requirement: Presentación del turno reservado

El sistema MUST mostrar al estudiante su reserva con horario, estado y datos de encuentro disponibles.

#### Scenario: Reserva con Zoom

- **WHEN** el turno reservado contiene `zoomLink`
- **THEN** el sistema ofrece un enlace externo para unirse a la reunión

#### Scenario: Reserva presencial

- **WHEN** el turno contiene `roomNumber`
- **THEN** el sistema muestra la sala o aula

### Requirement: Detalle y notas de revisión

El sistema MUST proporcionar un detalle del turno con sprint, docente y estudiante expandidos.

#### Scenario: Docente edita notas

- **WHEN** un docente o administrador guarda una revisión
- **THEN** el sistema actualiza nota privada, nota pública, enlace de Zoom y sala provistos

#### Scenario: Visibilidad para estudiante

- **WHEN** el estudiante asignado abre el detalle
- **THEN** el sistema muestra los datos del turno y la nota pública
- **AND** no expone la nota privada docente

#### Scenario: Edición no autorizada

- **WHEN** un estudiante intenta actualizar notas
- **THEN** el sistema rechaza la operación

### Requirement: Agenda-based review discovery
The system SHALL organize review availability chronologically and distinguish available, reserved, completed, and cancelled appointments.

#### Scenario: Student seeks an appointment
- **WHEN** a student opens reviews for a sprint
- **THEN** available appointments are grouped by date and the student's existing reservation, if any, is prioritized

#### Scenario: Teacher manages agenda
- **WHEN** staff opens review scheduling
- **THEN** the system provides an agenda summary, filters, and contextual actions for creating, releasing, or opening an appointment

### Requirement: Focused review detail
The review detail SHALL prioritize schedule, participant, meeting mode, status, and role-appropriate notes.

#### Scenario: Student opens reserved review
- **WHEN** a student opens their reserved review
- **THEN** the system displays joining or location information and only feedback intended for the student

