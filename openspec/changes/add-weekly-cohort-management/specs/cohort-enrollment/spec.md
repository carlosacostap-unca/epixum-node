## ADDED Requirements

### Requirement: Inscripciones múltiples

El sistema MUST relacionar usuarios y cohortes mediante inscripciones independientes con estado y condición de ingreso.

#### Scenario: Alumno recursante

- **WHEN** un administrador inscribe en una nueva cohorte a un usuario existente
- **THEN** el sistema crea una inscripción con condición `repeater`
- **AND** conserva todas sus inscripciones y datos anteriores

#### Scenario: Inscripción duplicada

- **WHEN** se intenta crear otra inscripción para el mismo usuario y cohorte
- **THEN** el sistema rechaza el duplicado

#### Scenario: Finalizar inscripción

- **WHEN** un administrador finaliza una inscripción
- **THEN** el sistema conserva su historial y evita nuevas operaciones estudiantiles en esa cohorte

### Requirement: Registro previo de alumnos nuevos

El sistema MUST permitir únicamente a administradores registrar el nombre, correo y cohorte de un alumno nuevo.

#### Scenario: Correo nuevo

- **WHEN** el administrador registra un correo que no pertenece a un usuario
- **THEN** el sistema crea una admisión pendiente para la cohorte

#### Scenario: Correo existente

- **WHEN** el correo normalizado ya pertenece a un usuario
- **THEN** el sistema crea o reactiva su inscripción sin crear otro usuario

#### Scenario: Registro por no administrador

- **WHEN** un docente o estudiante intenta registrar un alumno
- **THEN** el sistema rechaza la operación

### Requirement: Normalización y unicidad del correo

El sistema MUST comparar correos después de eliminar espacios externos y convertirlos a minúsculas.

#### Scenario: Diferencias de mayúsculas

- **WHEN** una admisión y Google entregan el mismo correo con distinta capitalización
- **THEN** el sistema los considera equivalentes

#### Scenario: Admisión pendiente duplicada

- **WHEN** ya existe una admisión activa para el correo y cohorte normalizados
- **THEN** el sistema no crea otra

### Requirement: Reclamación mediante Google

El sistema MUST vincular una admisión pendiente únicamente cuando Google devuelve el mismo correo verificado.

#### Scenario: Primera autenticación autorizada

- **WHEN** Google autentica un correo con una admisión pendiente
- **THEN** el sistema crea o reutiliza el usuario con rol `estudiante`
- **AND** crea la inscripción faltante de forma idempotente
- **AND** marca la admisión como reclamada por ese usuario

#### Scenario: Reintento del flujo

- **WHEN** el proceso se repite después de una ejecución parcial
- **THEN** el sistema completa los pasos faltantes sin duplicar usuario, inscripción ni admisión

### Requirement: Acceso denegado sin inscripción

El sistema MUST impedir el acceso de una cuenta Google sin usuario autorizado ni admisión pendiente.

#### Scenario: Correo desconocido

- **WHEN** Google autentica un correo no registrado
- **THEN** el sistema limpia la sesión de aplicación
- **AND** informa que debe contactar al administrador
- **AND** las reglas de datos impiden leer contenido académico

### Requirement: Administración de inscripciones

El sistema MUST permitir a administradores consultar y gestionar admisiones e inscripciones por cohorte.

#### Scenario: Listado administrativo

- **WHEN** un administrador abre una cohorte
- **THEN** puede distinguir alumnos activos, finalizados y pendientes de primer acceso

#### Scenario: Cancelar admisión

- **WHEN** un administrador cancela una admisión pendiente
- **THEN** ese correo deja de poder reclamarla en un acceso futuro

