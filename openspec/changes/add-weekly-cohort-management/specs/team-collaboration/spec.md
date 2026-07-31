## ADDED Requirements

### Requirement: Disponibilidad de equipos por modalidad

El sistema MUST asociar equipos con una cohorte `sprints_and_teams` y bloquearlos en cohortes semanales.

#### Scenario: Cohorte heredada

- **WHEN** un docente o alumno accede a equipos desde la cohorte heredada
- **THEN** conserva la gestión, membresía y chat actuales filtrados por esa cohorte

#### Scenario: Cohorte semanal

- **WHEN** una persona navega una cohorte `weekly`
- **THEN** el sistema no muestra navegación de equipos ni chat

#### Scenario: Acción directa en cohorte semanal

- **WHEN** se intenta crear, modificar o consultar un equipo bajo una cohorte `weekly`
- **THEN** el servidor rechaza la operación
