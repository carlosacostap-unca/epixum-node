## ADDED Requirements

### Requirement: Tableros aislados por cohorte

El sistema MUST calcular todos los indicadores docentes usando únicamente inscripciones y actividad de la cohorte seleccionada.

#### Scenario: Tablero heredado

- **WHEN** un docente abre el tablero de una cohorte `sprints_and_teams`
- **THEN** mantiene indicadores por sprint sin incluir alumnos o actividad de otras cohortes

#### Scenario: Alumno recursante

- **WHEN** un usuario está inscripto en dos cohortes
- **THEN** su actividad aparece por separado en el tablero de cada cohorte

### Requirement: Tablero semanal

El sistema MUST ofrecer a docentes y administradores indicadores de progreso agregados por semana para una cohorte `weekly`.

#### Scenario: Estado por alumno y semana

- **WHEN** una semana contiene trabajos
- **THEN** el tablero muestra entregas realizadas, total de trabajos y estado `complete` o `pending` por alumno activo

#### Scenario: Semana sin trabajos

- **WHEN** una semana no contiene trabajos
- **THEN** el tablero muestra estado `empty` y la excluye del denominador de finalización

#### Scenario: Semana en borrador

- **WHEN** un docente consulta el tablero
- **THEN** puede distinguir semanas en borrador y publicadas
- **AND** las métricas estudiantiles públicas solo consideran semanas publicadas

### Requirement: Indicadores de consultas semanales

El sistema MUST resumir consultas académicas de la cohorte semanal por semana y estado.

#### Scenario: Consultas asociadas

- **WHEN** existen consultas vinculadas a una semana o a su contenido
- **THEN** el tablero muestra cantidades pendientes y resueltas para esa semana

#### Scenario: Consulta general

- **WHEN** una consulta pertenece a la cohorte pero no a una semana
- **THEN** el tablero la incluye en un segmento general de cohorte

