# Student Surveys Specification

## Purpose

Definir la encuesta de cierre del Sprint 1 y la captura diferenciada de feedback o planes de recuperación según el estado de entregas.
## Requirements
### Requirement: Elegibilidad de la encuesta

El sistema MUST restringir `/student-form` a usuarios con rol `estudiante`.

#### Scenario: Estudiante autenticado

- **WHEN** un estudiante abre la encuesta
- **THEN** el sistema determina el sprint objetivo y su estado de entregas

#### Scenario: Otro rol

- **WHEN** un docente, administrador o visitante abre la encuesta
- **THEN** el sistema redirige al inicio

### Requirement: Resolución del sprint objetivo

El sistema MUST usar el sprint cuyo título coincida con `Sprint 1` como objetivo de la encuesta.

#### Scenario: Sprint 1 encontrado

- **WHEN** existe un sprint cuyo título coincide sin distinguir mayúsculas
- **THEN** el sistema usa ese sprint

#### Scenario: Sprint 1 no encontrado

- **WHEN** no existe una coincidencia por título
- **THEN** el sistema usa el primer sprint por fecha de creación como alternativa

#### Scenario: No existe ningún sprint

- **WHEN** tampoco existe un primer sprint
- **THEN** el sistema informa que no hay datos suficientes para mostrar el formulario

### Requirement: Evaluación de entregas para la encuesta

El sistema MUST considerar completas las entregas cuando cada trabajo del sprint objetivo tiene una entrega del estudiante.

#### Scenario: Todos los trabajos entregados

- **WHEN** existe al menos un trabajo y todos tienen entrega
- **THEN** el sistema presenta la encuesta de experiencia satisfactoria

#### Scenario: Trabajo pendiente

- **WHEN** existe al menos un trabajo sin entrega
- **THEN** el sistema presenta la encuesta de seguimiento

#### Scenario: Estado visible

- **WHEN** se muestra la encuesta
- **THEN** el sistema lista cada trabajo como `Entregado` o `Pendiente`
- **AND** ofrece el repositorio para las entregas existentes

### Requirement: Encuesta de entregas completas

El sistema MUST registrar feedback académico cuando el estudiante completó todas las entregas.

#### Scenario: Envío de feedback

- **WHEN** el estudiante completa sentimientos y feedback, con sugerencias opcionales
- **THEN** el sistema guarda estado `completed` junto con `feelings`, `feedback` y `suggestions`

### Requirement: Encuesta de entregas incompletas

El sistema MUST registrar la situación y el plan futuro cuando faltan entregas.

#### Scenario: Elección de plan

- **WHEN** el estudiante completa la encuesta de seguimiento
- **THEN** debe elegir `continue`, `retake` o `contact_teacher`

#### Scenario: Reflexión completa

- **WHEN** el estudiante envía la encuesta
- **THEN** el sistema guarda estado `incomplete_deliveries`
- **AND** conserva factores de demora, reflexión de actitud, aprendizaje, estrategias futuras, plan de acción, compromiso personal y comentarios adicionales

#### Scenario: Formulario incompleto

- **WHEN** falta el plan futuro o un campo requerido de reflexión
- **THEN** el sistema impide el envío

### Requirement: Una encuesta por sprint y estudiante

El sistema MUST aceptar como máximo una respuesta por combinación de sprint y estudiante.

#### Scenario: Primera respuesta

- **WHEN** no existe encuesta para la combinación actual
- **THEN** el sistema crea la respuesta y confirma el envío

#### Scenario: Respuesta repetida

- **WHEN** ya existe una encuesta para la combinación actual
- **THEN** el sistema no crea otra y muestra que la encuesta ya fue enviada

#### Scenario: Página con respuesta existente

- **WHEN** el estudiante vuelve a abrir la encuesta completada
- **THEN** el sistema muestra una confirmación y no vuelve a presentar el formulario

### Requirement: Indicador en el inicio del estudiante

El sistema MUST destacar la encuesta en el inicio mientras no exista una respuesta para el Sprint 1.

#### Scenario: Encuesta pendiente

- **WHEN** no existe respuesta del estudiante para el Sprint 1
- **THEN** el inicio muestra una tarjeta prominente hacia `/student-form`

#### Scenario: Encuesta completada

- **WHEN** ya existe la respuesta
- **THEN** el inicio oculta esa tarjeta

### Requirement: Guided survey completion
The student survey SHALL divide long questionnaires into understandable sections and communicate completion progress.

#### Scenario: Student advances through survey
- **WHEN** a student completes the required fields in the current section
- **THEN** the system permits navigation to the next section and updates visible progress

#### Scenario: Required response missing
- **WHEN** a student attempts to advance or submit with a missing required response
- **THEN** the system identifies the affected field in context and preserves all other responses

### Requirement: Survey review before submission
The system SHALL provide a summary of the selected path and responses before the irreversible final submission.

#### Scenario: Student confirms survey
- **WHEN** a student reaches the final survey step
- **THEN** the system shows a review summary and requires explicit confirmation before submitting

