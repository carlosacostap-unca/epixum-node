## MODIFIED Requirements

### Requirement: Administración de usuarios

El sistema MUST ofrecer a los administradores un listado de usuarios, admisiones pendientes e inscripciones con identidad, correo, rol y cohortes relacionadas.

#### Scenario: Administrador abre el listado

- **WHEN** un `admin` abre la administración de usuarios
- **THEN** el sistema muestra usuarios con avatar o inicial, correo, rol e inscripciones
- **AND** permite filtrar por cohorte y estado de inscripción

#### Scenario: Administrador registra alumno nuevo

- **WHEN** proporciona nombre, correo y cohorte para un correo desconocido
- **THEN** el sistema crea una admisión pendiente sin contraseña

#### Scenario: Administrador registra recursante

- **WHEN** proporciona un correo que ya pertenece a un usuario
- **THEN** el sistema crea una inscripción adicional sin duplicar la cuenta

#### Scenario: No administrador abre el listado

- **WHEN** un usuario distinto de `admin` abre la administración
- **THEN** el sistema redirige al inicio o deniega el acceso

