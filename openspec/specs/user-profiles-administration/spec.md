# User Profiles and Administration Specification

## Purpose

Definir la consulta y edición de perfiles personales y la administración de roles de usuario.
## Requirements
### Requirement: Visualización del perfil vigente

El sistema MUST recuperar de PocketBase la versión actualizada del registro autenticado al abrir `/profile`.

#### Scenario: Perfil existente

- **WHEN** una persona autenticada abre su perfil
- **THEN** el sistema muestra sus datos personales actuales

#### Scenario: Registro inexistente

- **WHEN** la sesión es válida pero el registro de usuario ya no existe
- **THEN** el sistema responde como recurso no encontrado

### Requirement: Edición del perfil propio

El sistema MUST permitir modificar nombre, apellido, DNI, fecha de nacimiento y teléfono del perfil propio.

#### Scenario: Actualización válida

- **WHEN** la persona envía cambios sobre su propio identificador
- **THEN** el sistema actualiza los campos provistos
- **AND** compone el campo `name` con nombre y apellido cuando ambos están presentes
- **AND** invalida las vistas de perfil e inicio

#### Scenario: Fecha de nacimiento vacía

- **WHEN** el formulario envía una fecha de nacimiento vacía
- **THEN** el sistema elimina el valor almacenado

#### Scenario: Edición de otro perfil

- **WHEN** una persona que no es administradora intenta editar otro usuario
- **THEN** el sistema rechaza la actualización

### Requirement: Administración de usuarios

El sistema MUST ofrecer a los administradores un listado de usuarios con identidad, correo electrónico y rol.

#### Scenario: Administrador abre el listado

- **WHEN** un `admin` abre `/admin/users`
- **THEN** el sistema muestra todos los usuarios ordenados por creación
- **AND** presenta avatar cuando existe o una inicial como alternativa

#### Scenario: No administrador abre el listado

- **WHEN** un usuario distinto de `admin` abre `/admin/users`
- **THEN** el sistema redirige al inicio

### Requirement: Asignación administrativa de roles

El sistema MUST permitir únicamente a un administrador cambiar un usuario entre los roles soportados.

#### Scenario: Cambio autorizado

- **WHEN** un `admin` selecciona un nuevo rol para un usuario
- **THEN** el sistema actualiza el registro en PocketBase
- **AND** refresca el listado administrativo

#### Scenario: Cambio no autorizado

- **WHEN** una sesión inválida o no administradora solicita un cambio de rol
- **THEN** el sistema rechaza la solicitud como no autorizada

### Requirement: Sincronización de identidad en el encabezado

El sistema MUST refrescar el registro local de usuario para reflejar cambios de rol o perfil en la navegación.

#### Scenario: Carga del encabezado autenticado

- **WHEN** existe una sesión local válida
- **THEN** el encabezado solicita el registro actualizado a PocketBase
- **AND** reemplaza el modelo almacenado conservando el token

#### Scenario: Cambio del estado de autenticación

- **WHEN** PocketBase notifica un cambio del almacén de autenticación
- **THEN** el encabezado actualiza la identidad mostrada

### Requirement: Sectioned personal profile
The profile screen SHALL organize editable identity, contact, account, and preference information into labeled sections and provide explicit save feedback.

#### Scenario: User updates profile section
- **WHEN** a user saves valid profile changes
- **THEN** the system confirms the update and refreshes identity presentation where affected

### Requirement: Exploratory user administration
The administrative user screen SHALL support search, cohort and status filtering, ordering, and contextual actions without losing the active result set.

#### Scenario: Administrator narrows users
- **WHEN** an administrator searches or filters the user collection
- **THEN** the system shows the applied criteria, matching count, and user rows or cards with role and enrollment summaries

#### Scenario: Administrator opens user actions
- **WHEN** an administrator selects a user
- **THEN** role, enrollments, admissions, and permitted actions are presented in a focused detail surface rather than overcrowding the collection view

