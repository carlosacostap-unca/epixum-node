## ADDED Requirements

### Requirement: Preparación verificable de una cuenta de GitHub
La sección de creación de cuenta SHALL guiar al estudiante desde el registro hasta la comprobación de su perfil público, distinguiendo GitHub de Git y evitando depender de una captura o versión específica de la interfaz externa.

#### Scenario: Recorrido completo para una cuenta nueva
- **WHEN** un estudiante abre “Creá tu cuenta de GitHub”
- **THEN** encuentra en orden el registro de una cuenta personal, la verificación del correo, la comprobación del perfil, la protección de la cuenta y la relación del correo con sus commits
- **AND** dispone de un acceso explícito al registro oficial

#### Scenario: Interfaz externa diferente de la captura
- **WHEN** GitHub cambia el aspecto o el orden de su registro
- **THEN** el contenido identifica los resultados que deben comprobarse y presenta las imágenes como orientación, no como reproducción exacta

### Requirement: Decisiones seguras de identidad y recuperación
La sección SHALL explicar qué datos pueden hacerse públicos, cómo proteger el acceso y cómo recuperarse de problemas de verificación sin solicitar ni almacenar secretos del estudiante.

#### Scenario: Elección de usuario y correo
- **WHEN** el estudiante elige su nombre de usuario y correo de commits
- **THEN** el contenido advierte que el usuario forma parte de una URL pública, desaconseja datos personales innecesarios y ofrece elegir entre un correo verificado y el `noreply` provisto por GitHub

#### Scenario: Correo de verificación ausente o vencido
- **WHEN** el estudiante no recibe el mensaje o el enlace deja de funcionar
- **THEN** el contenido indica revisar dirección y spam, esperar, solicitar un nuevo mensaje desde Settings → Emails y confirmar que inició sesión en la cuenta correcta

#### Scenario: Protección con dos factores
- **WHEN** el estudiante prepara la seguridad de la cuenta
- **THEN** el contenido explica 2FA, métodos alternativos y códigos de recuperación
- **AND** indica conservar los códigos de forma privada y no compartir contraseñas ni verificaciones con docentes o compañeros

### Requirement: Evidencia única del perfil de GitHub
La sección SHALL usar el nombre de usuario como única actividad obligatoria y SHALL mantener separadas la validez sintáctica y la existencia real del perfil.

#### Scenario: Usuario con formato válido
- **WHEN** el estudiante ingresa un nombre permitido por GitHub
- **THEN** el sistema permite abrir `https://github.com/{usuario}` para comprobar el perfil antes de registrar la evidencia

#### Scenario: Usuario inexistente con formato válido
- **WHEN** el valor cumple el formato pero el perfil no existe o no corresponde al estudiante
- **THEN** el contenido no afirma que la cuenta esté comprobada y pide verificar el enlace en GitHub

#### Scenario: Cierre de la sección
- **WHEN** se genera la nueva revisión de contenido
- **THEN** el checklist opcional no se conserva y el validador existente de nombre de usuario permanece obligatorio

