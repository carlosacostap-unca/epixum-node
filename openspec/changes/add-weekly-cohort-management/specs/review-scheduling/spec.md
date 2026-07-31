## ADDED Requirements

### Requirement: Revisiones limitadas a cohortes con sprints

El sistema MUST habilitar turnos de revisión solamente para cohortes de modalidad `sprints_and_teams`.

#### Scenario: Cohorte heredada

- **WHEN** una persona accede a revisiones desde la cohorte heredada
- **THEN** conserva la creación, reserva, cancelación y notas actuales por sprint

#### Scenario: Cohorte semanal

- **WHEN** una persona navega una cohorte `weekly`
- **THEN** el sistema no muestra el módulo de revisiones

#### Scenario: Acción directa semanal

- **WHEN** se intenta crear o reservar un turno bajo una cohorte `weekly`
- **THEN** el servidor rechaza la operación

