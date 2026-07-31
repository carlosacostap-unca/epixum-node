## MODIFIED Requirements

### Requirement: Protección global de rutas

El sistema MUST exigir una cookie `pb_auth` para acceder a las páginas de la aplicación, salvo los recursos técnicos, la página de acceso y el formulario público de solicitud de matriculación.

#### Scenario: Visitante solicita una ruta protegida

- **WHEN** una solicitud sin `pb_auth` accede a una ruta distinta de `/login` y `/enrollment-request`
- **THEN** el sistema redirige a `/login`

#### Scenario: Visitante solicita matriculación

- **WHEN** una solicitud sin `pb_auth` accede a `/enrollment-request`
- **THEN** el sistema permite abrir y enviar el formulario público

#### Scenario: Usuario autenticado abre el login

- **WHEN** una solicitud con `pb_auth` accede a `/login`
- **THEN** el sistema redirige a `/`

#### Scenario: Recurso técnico o estático

- **WHEN** una solicitud apunta a API, recursos de Next.js, archivos estáticos o una ruta con extensión de archivo
- **THEN** el proxy permite continuar la solicitud sin aplicar la redirección de páginas

## ADDED Requirements

### Requirement: Salida ante acceso no autorizado
El sistema MUST ofrecer el formulario de solicitud cuando Google autentica correctamente pero la cuenta no tiene matrícula ni admisión aprobada.

#### Scenario: Correo no reconocido
- **WHEN** la autorización posterior a Google rechaza una cuenta desconocida
- **THEN** el login informa que todavía no tiene acceso
- **AND** ofrece una acción visible para solicitar matriculación

