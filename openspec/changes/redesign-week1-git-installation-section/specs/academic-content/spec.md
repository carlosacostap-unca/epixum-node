## ADDED Requirements

### Requirement: Instalación y configuración inicial de Git en Windows
La Semana 1 SHALL explicar cómo obtener Git para Windows desde la fuente oficial, conservar una instalación estándar, reiniciar el entorno, verificar la herramienta y configurar la identidad y rama inicial sin exigir una versión concreta.

#### Scenario: Alumno prepara Git
- **WHEN** el alumno abre “Instalá Git”
- **THEN** distingue Git local de GitHub remoto
- **AND** sigue un recorrido de descarga, instalación, verificación, configuración y consulta
- **AND** comprende que instalar o configurar Git no publica archivos en Internet

### Requirement: Decisión informada sobre la identidad de los commits
La sección SHALL explicar antes de solicitar datos que el nombre y correo quedan incorporados a los commits futuros, que el correo puede ser visible al publicarlos y que puede elegirse un correo verificado o el `noreply` proporcionado por GitHub.

#### Scenario: Alumno elige un correo de commit
- **WHEN** llega al generador de configuración
- **THEN** conoce el efecto de publicar un commit con ese correo
- **AND** puede consultar la guía oficial de privacidad antes de elegir
- **AND** comprende que volver a configurar el dato modifica commits futuros pero no reescribe los anteriores

### Requirement: Verificación y recuperación de Git
La sección SHALL permitir comprobar la versión, consultar cada valor configurado y resolver gradualmente Git no reconocido, permisos insuficientes o una identidad incorrecta.

#### Scenario: Git no responde
- **WHEN** `git --version` no es reconocido
- **THEN** el alumno reinicia primero Visual Studio Code y abre una terminal nueva
- **AND** recibe un siguiente paso acotado antes de reinstalar o modificar el sistema

#### Scenario: Alumno completa la sección
- **WHEN** registra una salida válida de `git --version`
- **THEN** satisface la evidencia obligatoria
- **AND** no necesita confirmar un checklist subjetivo

