## MODIFIED Requirements

### Requirement: Contexto de una consulta

El sistema MUST asociar cada consulta con una cohorte y permitir un contexto opcional de clase, trabajo práctico o semana compatible.

#### Scenario: Nueva consulta desde contenido

- **WHEN** el formulario se abre desde una clase o un trabajo
- **THEN** el sistema preselecciona el recurso, su periodo y su cohorte

#### Scenario: Nueva consulta desde semana

- **WHEN** el formulario se abre desde una semana
- **THEN** el sistema preselecciona la semana y su cohorte

#### Scenario: Consulta general de cohorte

- **WHEN** la persona crea una consulta sin clase, trabajo ni semana
- **THEN** el sistema conserva igualmente la cohorte seleccionada

#### Scenario: Contexto incompatible

- **WHEN** el recurso o semana seleccionados pertenecen a otra cohorte
- **THEN** el sistema rechaza la creación

## ADDED Requirements

### Requirement: Aislamiento de consultas por cohorte

El sistema MUST limitar listados, búsqueda, respuestas y moderación al alcance de la cohorte seleccionada.

#### Scenario: Listado semanal

- **WHEN** una persona consulta preguntas de una cohorte `weekly`
- **THEN** ve consultas generales de esa cohorte y las asociadas a sus semanas, clases o trabajos

#### Scenario: Búsqueda

- **WHEN** se busca texto dentro de una cohorte
- **THEN** las coincidencias de consultas y respuestas de otras cohortes no aparecen

#### Scenario: Acceso cruzado

- **WHEN** una persona solicita por identificador una consulta fuera de su cohorte accesible
- **THEN** el sistema deniega el acceso

