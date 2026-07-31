## ADDED Requirements

### Requirement: Cohortes con modalidad explícita

El sistema MUST permitir a administradores crear cohortes con nombre, identificador, fechas, estado y modalidad `sprints_and_teams` o `weekly`.

#### Scenario: Crear cohorte semanal

- **WHEN** un administrador crea una cohorte con modalidad `weekly`
- **THEN** el sistema guarda la cohorte y habilita sus capacidades semanales

#### Scenario: Cambiar modalidad con contenido

- **WHEN** se intenta cambiar la modalidad de una cohorte que ya contiene sprints o semanas
- **THEN** el sistema rechaza el cambio

### Requirement: Selección de cohorte

El sistema MUST permitir que cada usuario seleccione únicamente una cohorte a la que tenga acceso.

#### Scenario: Docente selecciona cohorte

- **WHEN** un docente o administrador selecciona una cohorte accesible
- **THEN** el sistema navega a una URL que contiene explícitamente el identificador de la cohorte
- **AND** presenta las capacidades correspondientes a su modalidad

#### Scenario: Estudiante con múltiples inscripciones

- **WHEN** un estudiante tiene más de una inscripción activa o histórica accesible
- **THEN** el sistema ofrece un selector limitado a esas cohortes

#### Scenario: Cohorte no autorizada

- **WHEN** una persona solicita una cohorte fuera de su alcance
- **THEN** el sistema deniega el acceso sin revelar sus datos

### Requirement: Aislamiento entre cohortes

El sistema MUST filtrar contenido, actividad y métricas por la cohorte explícita de la solicitud.

#### Scenario: Dos cohortes activas

- **WHEN** una persona consulta una cohorte
- **THEN** el sistema no incluye usuarios, contenido, entregas, consultas ni métricas exclusivos de otra cohorte

#### Scenario: Mutación con identificador cruzado

- **WHEN** una acción recibe un recurso perteneciente a otra cohorte
- **THEN** el servidor rechaza la mutación aunque el identificador sea válido

### Requirement: Compatibilidad de la cohorte existente

El sistema MUST mantener activa, editable y consultable la cohorte heredada de modalidad `sprints_and_teams`.

#### Scenario: Docente gestiona la cohorte heredada

- **WHEN** un docente abre la cohorte heredada después de la migración
- **THEN** conserva las funciones actuales de sprints, equipos, contenido, consultas, revisiones, encuestas y tableros

#### Scenario: Alumno consulta su historial

- **WHEN** un alumno de la cohorte heredada inicia sesión
- **THEN** puede consultar sus sprints, equipo, entregas y demás datos existentes

#### Scenario: Ruta heredada

- **WHEN** una persona usa una ruta actual sin identificador de cohorte
- **THEN** el sistema resuelve o redirige a la cohorte heredada sin perder el destino funcional

### Requirement: Capacidades por modalidad

El sistema MUST bloquear módulos no habilitados por la modalidad de la cohorte.

#### Scenario: Cohorte semanal

- **WHEN** se abre una cohorte `weekly`
- **THEN** el sistema habilita semanas, contenido, entregas, consultas y tableros
- **AND** oculta equipos, chat, revisiones y encuestas

#### Scenario: Acción no soportada

- **WHEN** se invoca directamente una acción de un módulo no soportado por la modalidad
- **THEN** el servidor rechaza la operación

