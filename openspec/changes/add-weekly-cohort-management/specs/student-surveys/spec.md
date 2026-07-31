## ADDED Requirements

### Requirement: Encuestas limitadas a cohortes con sprints

El sistema MUST habilitar encuestas solamente para cohortes de modalidad `sprints_and_teams`.

#### Scenario: Cohorte heredada

- **WHEN** un estudiante elegible accede a la encuesta de la cohorte heredada
- **THEN** conserva el flujo actual de entregas completas o incompletas

#### Scenario: Cohorte semanal

- **WHEN** un estudiante navega una cohorte `weekly`
- **THEN** el sistema no muestra encuestas ni indicadores para completarlas

#### Scenario: Solicitud directa semanal

- **WHEN** se intenta crear una encuesta para una semana o cohorte `weekly`
- **THEN** el servidor rechaza la operación

