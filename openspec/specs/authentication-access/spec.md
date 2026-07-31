# Authentication and Access Specification

## Purpose

Definir el inicio y cierre de sesión, la persistencia de identidad y las restricciones de acceso por rol de Epixum.
## Requirements
### Requirement: Inicio de sesión con Google

El sistema MUST permitir que una persona se autentique mediante OAuth 2 con Google usando la colección `users` de PocketBase.

#### Scenario: Autenticación exitosa

- **WHEN** una persona completa correctamente el flujo OAuth de Google
- **THEN** el sistema conserva la sesión de PocketBase en la cookie `pb_auth`
- **AND** redirige a la página de inicio

#### Scenario: Usuario nuevo sin rol

- **WHEN** Google autentica un registro cuyo campo `role` está vacío
- **THEN** el sistema asigna el rol `estudiante`
- **AND** actualiza el estado de autenticación local con ese rol

#### Scenario: Error de autenticación

- **WHEN** el proveedor o PocketBase rechaza el inicio de sesión
- **THEN** el sistema informa que no pudo iniciar sesión
- **AND** mantiene a la persona fuera de las áreas protegidas

### Requirement: Protección global de rutas

El sistema MUST exigir una cookie `pb_auth` para acceder a las páginas de la aplicación, salvo los recursos técnicos y la página de acceso.

#### Scenario: Visitante solicita una ruta protegida

- **WHEN** una solicitud sin `pb_auth` accede a una ruta distinta de `/login`
- **THEN** el sistema redirige a `/login`

#### Scenario: Usuario autenticado abre el login

- **WHEN** una solicitud con `pb_auth` accede a `/login`
- **THEN** el sistema redirige a `/`

#### Scenario: Recurso técnico o estático

- **WHEN** una solicitud apunta a API, recursos de Next.js, archivos estáticos o una ruta con extensión de archivo
- **THEN** el proxy permite continuar la solicitud sin aplicar la redirección de páginas

### Requirement: Roles de aplicación

El sistema MUST reconocer exactamente los roles `admin`, `docente` y `estudiante` para determinar navegación y autorización.

#### Scenario: Operación docente

- **WHEN** una acción de gestión académica es solicitada por un `docente` o `admin`
- **THEN** el sistema permite intentar la operación contra PocketBase

#### Scenario: Operación docente solicitada por estudiante

- **WHEN** un `estudiante` intenta una acción reservada a docentes o administradores
- **THEN** el sistema rechaza la acción o redirige al inicio

#### Scenario: Operación administrativa

- **WHEN** una persona que no es `admin` accede a `/admin/users` o intenta modificar roles
- **THEN** el sistema deniega la operación

### Requirement: Cierre de sesión

El sistema MUST permitir que una persona autenticada cierre su sesión desde el encabezado.

#### Scenario: Cierre exitoso

- **WHEN** la persona activa la opción de cerrar sesión
- **THEN** el sistema limpia el almacén de autenticación de PocketBase
- **AND** elimina la cookie `pb_auth`
- **AND** redirige a `/login`

### Requirement: Navegación según identidad

El sistema MUST presentar una experiencia inicial acorde al rol vigente del usuario.

#### Scenario: Inicio de estudiante

- **WHEN** un `estudiante` abre `/`
- **THEN** el sistema ofrece acceso a sprints, equipo, revisiones y consultas
- **AND** ofrece la encuesta del Sprint 1 mientras no exista una respuesta

#### Scenario: Inicio de docente o administrador

- **WHEN** un `docente` o `admin` abre `/`
- **THEN** el sistema ofrece gestión de sprints, equipos, revisiones, consultas y tableros docentes

#### Scenario: Navegación de administrador

- **WHEN** el encabezado corresponde a un `admin`
- **THEN** muestra acceso adicional a la administración de usuarios

### Requirement: Clear access journey
The system SHALL present authentication, enrollment assistance, and session actions as one understandable access journey.

#### Scenario: Visitor at login
- **WHEN** an unauthenticated visitor opens the login screen
- **THEN** the system identifies the platform and explains the Google sign-in action
- **AND** it does not show the enrollment assistance path before an access attempt

#### Scenario: Google account is not enabled
- **WHEN** Google authenticates the person but the selected account is not authorized to access the module
- **THEN** the system keeps the person outside protected areas and explains that the account is not enabled
- **AND** it displays a distinct path to request enrollment

#### Scenario: Enrollment request submitted
- **WHEN** a visitor successfully submits an enrollment request
- **THEN** the system displays a confirmation, expected next step, and route back to sign-in without exposing protected navigation

#### Scenario: Authenticated session menu
- **WHEN** an authenticated user opens the identity menu
- **THEN** the system shows their name, role, profile action, theme preference, and sign-out action in a compact surface
