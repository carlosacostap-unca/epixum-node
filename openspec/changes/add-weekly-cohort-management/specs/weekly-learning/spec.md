## ADDED Requirements

### Requirement: Gestión de semanas

El sistema MUST permitir a docentes y administradores crear, editar y eliminar semanas dentro de una cohorte `weekly`.

#### Scenario: Crear semana

- **WHEN** un usuario autorizado proporciona número, título, descripción y fechas opcionales
- **THEN** el sistema crea la semana en estado `draft`

#### Scenario: Número duplicado

- **WHEN** ya existe una semana con el mismo número en la cohorte
- **THEN** el sistema rechaza la creación

#### Scenario: Eliminar semana con actividad

- **WHEN** una semana contiene clases, trabajos o entregas
- **THEN** el sistema exige una confirmación explícita y aplica las restricciones de integridad configuradas

### Requirement: Publicación manual

El sistema MUST exponer una semana a estudiantes únicamente después de una publicación explícita.

#### Scenario: Publicar borrador

- **WHEN** un docente publica una semana `draft`
- **THEN** el sistema cambia su estado a `published`
- **AND** registra la fecha de publicación

#### Scenario: Fecha de inicio alcanzada

- **WHEN** llega la fecha de inicio de una semana todavía en borrador
- **THEN** el sistema no la publica automáticamente

#### Scenario: Volver a borrador

- **WHEN** un docente despublica una semana
- **THEN** deja de ser visible para estudiantes sin eliminar su contenido

### Requirement: Visibilidad estudiantil de semanas

El sistema MUST mostrar a un estudiante solamente semanas publicadas de cohortes con inscripción accesible.

#### Scenario: Semana publicada

- **WHEN** un estudiante activo consulta su cohorte semanal
- **THEN** ve la semana publicada y puede abrir su contenido

#### Scenario: Semana en borrador

- **WHEN** un estudiante intenta acceder directamente a una semana `draft`
- **THEN** el sistema deniega el acceso

#### Scenario: Inscripción finalizada

- **WHEN** un alumno con inscripción finalizada consulta el historial permitido de la cohorte
- **THEN** puede ver semanas que fueron publicadas sin realizar nuevas entregas

### Requirement: Contenido académico semanal

El sistema MUST permitir que una semana contenga clases, materiales y trabajos prácticos reutilizando el modelo académico existente.

#### Scenario: Crear clase semanal

- **WHEN** un docente crea una clase dentro de una semana
- **THEN** la clase queda relacionada con esa semana y no con un sprint

#### Scenario: Crear trabajo semanal

- **WHEN** un docente crea un trabajo dentro de una semana
- **THEN** el trabajo queda relacionado con esa semana y acepta descripción enriquecida y materiales

#### Scenario: Padre académico inválido

- **WHEN** una clase o trabajo queda relacionado simultáneamente con sprint y semana, o con ninguno
- **THEN** el sistema rechaza la mutación

### Requirement: Entregas semanales

El sistema MUST permitir a estudiantes activos crear y actualizar entregas de trabajos pertenecientes a semanas publicadas.

#### Scenario: Entrega habilitada

- **WHEN** un estudiante activo entrega un trabajo de una semana publicada
- **THEN** el sistema conserva la regla de una entrega por estudiante y trabajo

#### Scenario: Semana no publicada

- **WHEN** un estudiante intenta entregar un trabajo de una semana en borrador
- **THEN** el sistema rechaza la entrega

#### Scenario: Trabajo de otra cohorte

- **WHEN** un estudiante intenta entregar un trabajo fuera de sus inscripciones
- **THEN** el sistema deniega la operación

### Requirement: Progreso por semana

El sistema MUST calcular el progreso semanal a partir de los trabajos y entregas de esa semana.

#### Scenario: Semana completa

- **WHEN** un alumno entregó todos los trabajos de una semana con al menos un trabajo
- **THEN** su estado semanal es `complete`

#### Scenario: Semana incompleta

- **WHEN** falta al menos una entrega
- **THEN** su estado semanal es `pending`

#### Scenario: Semana sin trabajos

- **WHEN** la semana no contiene trabajos
- **THEN** su estado es `empty`
