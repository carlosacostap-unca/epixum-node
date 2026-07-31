## ADDED Requirements

### Requirement: Aislamiento de entregas por cohorte

El sistema MUST autorizar una entrega mediante la cohorte derivada del trabajo práctico.

#### Scenario: Inscripción activa

- **WHEN** un estudiante entrega un trabajo de una cohorte donde tiene inscripción activa
- **THEN** el sistema permite la operación si se cumplen las reglas de entrega

#### Scenario: Cohorte no inscripta

- **WHEN** el trabajo pertenece a una cohorte fuera de las inscripciones del estudiante
- **THEN** el sistema rechaza creación, lectura y actualización de la entrega

### Requirement: Matriz de entregas por semana

El sistema MUST ofrecer a docentes y administradores una matriz que cruce alumnos inscriptos, trabajos y entregas de cada semana.

#### Scenario: Semana con trabajos

- **WHEN** un docente abre el tablero de entregas de una semana
- **THEN** el sistema muestra únicamente alumnos activos de la cohorte y trabajos de la semana
- **AND** indica el estado de entrega de cada combinación

#### Scenario: Datos de otra cohorte

- **WHEN** existen entregas de otros periodos o cohortes
- **THEN** no se incluyen en la matriz semanal

