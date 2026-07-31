## Purpose

Permite que una persona sin acceso solicite su matriculación con datos verificables y que el personal resuelva la solicitud sin exponer información personal ni duplicar identidades de forma insegura.

## ADDED Requirements

### Requirement: Solicitud pública de matriculación
El sistema MUST permitir que una persona no autenticada solicite acceso a una cohorte semanal activa informando nombre, apellido, DNI, fecha de nacimiento, correo actual de Google y teléfono.

#### Scenario: Solicitud válida
- **WHEN** una persona completa todos los campos válidos y elige una cohorte semanal activa
- **THEN** el sistema guarda una solicitud pendiente
- **AND** confirma que será revisada antes de habilitar el acceso

#### Scenario: Solicitud incompleta o manipulada
- **WHEN** falta un campo, el correo o fecha no son válidos, o la cohorte no es semanal y activa
- **THEN** el sistema rechaza la solicitud sin guardar datos

#### Scenario: Solicitud pendiente duplicada
- **WHEN** ya existe una solicitud pendiente con el mismo correo o DNI para la cohorte
- **THEN** el sistema no crea otra solicitud
- **AND** informa que la petición ya está siendo revisada

### Requirement: Privacidad de las solicitudes
El sistema MUST impedir la lectura, modificación y eliminación directa de solicitudes desde clientes públicos o autenticados.

#### Scenario: Acceso directo a PocketBase
- **WHEN** un cliente intenta listar o modificar solicitudes mediante la API de la colección
- **THEN** PocketBase rechaza la operación

### Requirement: Bandeja de revisión para personal
El sistema MUST permitir a docentes y administradores consultar solicitudes y resolver las pendientes como aprobadas o rechazadas.

#### Scenario: Personal abre la bandeja
- **WHEN** un docente o administrador abre la pantalla de solicitudes
- **THEN** ve los datos declarados, la cohorte, el estado y las posibles coincidencias por correo o DNI

#### Scenario: Estudiante abre la bandeja
- **WHEN** un estudiante intenta acceder a la pantalla o acciones de revisión
- **THEN** el sistema rechaza el acceso

#### Scenario: Rechazo
- **WHEN** el personal rechaza una solicitud pendiente
- **THEN** el sistema registra quién la revisó y cuándo
- **AND** no crea admisiones ni matrículas

### Requirement: Aprobación segura y conservación de identidad
El sistema MUST aprobar solicitudes mediante una cuenta inequívoca existente o una admisión pendiente para el correo verificado, y MUST evitar fusiones automáticas cuando existan conflictos.

#### Scenario: Correo asociado a usuario compatible
- **WHEN** el correo solicitado pertenece a un estudiante o usuario todavía no habilitado sin otra coincidencia conflictiva
- **THEN** el sistema completa su perfil y crea o reactiva la matrícula solicitada

#### Scenario: DNI asociado a estudiante con correo anterior
- **WHEN** el DNI identifica inequívocamente a un estudiante existente y el correo nuevo no pertenece a otra cuenta consolidada
- **THEN** el sistema actualiza la identidad compatible y preserva el identificador y el historial del estudiante
- **AND** crea o reactiva su matrícula en la cohorte

#### Scenario: Persona todavía sin cuenta
- **WHEN** no existe una cuenta por correo ni DNI
- **THEN** el sistema crea una admisión aprobada pendiente de ser reclamada con Google
- **AND** el siguiente inicio de sesión crea o matricula al estudiante en la cohorte

#### Scenario: Conflicto de identidad
- **WHEN** el correo o DNI coincide con cuentas consolidadas diferentes o la vinculación no es inequívoca
- **THEN** el sistema no aprueba ni modifica cuentas
- **AND** informa al personal que requiere resolución administrativa

