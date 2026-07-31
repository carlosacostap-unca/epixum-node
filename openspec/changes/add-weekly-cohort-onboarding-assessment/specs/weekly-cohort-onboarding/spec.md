## Purpose

Brinda a estudiantes matriculados una entrada guiada a la cohorte semanal y acceso claro al canal de comunicación y al contenido del curso.

## ADDED Requirements

### Requirement: Bienvenida al ingresar a la cohorte semanal
El sistema MUST mostrar una pantalla de bienvenida cuando un estudiante con matrícula activa ingresa a una cohorte semanal.

#### Scenario: Estudiante matriculado abre la cohorte
- **WHEN** un estudiante con matrícula activa abre la raíz de una cohorte semanal
- **THEN** el sistema lo dirige a la bienvenida de esa cohorte
- **AND** ofrece continuar al contenido semanal

#### Scenario: Cohorte histórica
- **WHEN** un estudiante abre una cohorte basada en sprints
- **THEN** el sistema conserva su navegación histórica sin mostrar el onboarding semanal

### Requirement: Invitación a WhatsApp
La bienvenida MUST ofrecer un enlace HTTPS y un código QR que representen la misma invitación simulada al grupo de WhatsApp.

#### Scenario: Consultar invitación
- **WHEN** el estudiante abre la bienvenida
- **THEN** ve una acción para abrir el enlace simulado en una pestaña nueva
- **AND** ve un QR escaneable generado a partir de exactamente esa URL
- **AND** el sistema identifica la invitación como demostración

### Requirement: Protección por matrícula
El sistema MUST restringir la bienvenida a estudiantes con matrícula activa y al personal autorizado.

#### Scenario: Estudiante ajeno a la cohorte
- **WHEN** un estudiante sin matrícula activa intenta abrir la bienvenida
- **THEN** el sistema rechaza el acceso mediante las reglas vigentes
