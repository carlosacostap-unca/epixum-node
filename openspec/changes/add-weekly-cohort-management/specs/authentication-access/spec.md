## MODIFIED Requirements

### Requirement: Inicio de sesión con Google

El sistema MUST permitir autenticación mediante OAuth 2 con Google únicamente a usuarios existentes autorizados o correos registrados previamente por un administrador.

#### Scenario: Usuario existente autorizado

- **WHEN** Google autentica un correo correspondiente a un usuario con al menos una inscripción accesible
- **THEN** el sistema conserva la sesión de PocketBase en la cookie `pb_auth`
- **AND** redirige a una cohorte accesible o al selector de cohortes

#### Scenario: Alumno nuevo preinscripto

- **WHEN** Google autentica un correo verificado que coincide con una admisión pendiente
- **THEN** el sistema reclama la admisión, asigna rol `estudiante` y crea su inscripción
- **AND** conserva la sesión y redirige a la cohorte correspondiente

#### Scenario: Correo no registrado

- **WHEN** Google autentica un correo sin usuario autorizado ni admisión pendiente
- **THEN** el sistema limpia la sesión
- **AND** informa que el acceso requiere registro previo del administrador

#### Scenario: Error de autenticación

- **WHEN** el proveedor o PocketBase rechaza el inicio de sesión
- **THEN** el sistema informa que no pudo iniciar sesión
- **AND** mantiene a la persona fuera de las áreas protegidas

### Requirement: Navegación según identidad

El sistema MUST presentar una experiencia inicial acorde al rol, las inscripciones y la modalidad de la cohorte seleccionada.

#### Scenario: Estudiante de cohorte heredada

- **WHEN** un estudiante selecciona una cohorte `sprints_and_teams`
- **THEN** el sistema ofrece sprints, equipo, revisiones, consultas y encuesta cuando corresponda

#### Scenario: Estudiante de cohorte semanal

- **WHEN** un estudiante selecciona una cohorte `weekly`
- **THEN** el sistema ofrece semanas publicadas, entregas y consultas
- **AND** no ofrece equipos, revisiones ni encuestas

#### Scenario: Docente o administrador

- **WHEN** un docente o administrador accede al sistema
- **THEN** puede seleccionar una cohorte accesible y ve sus herramientas según modalidad

#### Scenario: Navegación de administrador

- **WHEN** el encabezado corresponde a un `admin`
- **THEN** muestra acceso adicional a administración de usuarios, admisiones, inscripciones y cohortes

