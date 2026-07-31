## ADDED Requirements

### Requirement: Aislamiento del contenido académico

El sistema MUST resolver sprints, semanas, clases, trabajos y materiales dentro de una cohorte explícita.

#### Scenario: Listado de sprints heredado

- **WHEN** una persona consulta una cohorte `sprints_and_teams`
- **THEN** el sistema lista únicamente los sprints asignados a esa cohorte

#### Scenario: Contenido de otra cohorte

- **WHEN** se solicita una clase o trabajo cuyo periodo pertenece a otra cohorte
- **THEN** el sistema deniega el acceso

### Requirement: Padre de contenido exclusivo

El sistema MUST exigir que cada clase y trabajo práctico pertenezca exactamente a un sprint o a una semana.

#### Scenario: Contenido heredado

- **WHEN** una clase o trabajo pertenece a un sprint
- **THEN** conserva el comportamiento actual y no tiene semana

#### Scenario: Contenido semanal

- **WHEN** una clase o trabajo pertenece a una semana
- **THEN** no tiene sprint y hereda la cohorte y visibilidad de la semana

#### Scenario: Relación inválida

- **WHEN** una mutación asigna ambos padres o ninguno
- **THEN** el sistema rechaza la mutación

### Requirement: Gestión contextual de contenido

El sistema MUST permitir a docentes y administradores gestionar contenido solamente en una cohorte y periodo compatibles.

#### Scenario: Crear contenido en cohorte semanal

- **WHEN** un docente crea una clase, trabajo o material desde una semana
- **THEN** el sistema conserva el contexto de cohorte y semana en todas las acciones y revalidaciones

#### Scenario: Crear sprint en cohorte semanal

- **WHEN** se intenta crear un sprint dentro de una cohorte `weekly`
- **THEN** el servidor rechaza la operación

