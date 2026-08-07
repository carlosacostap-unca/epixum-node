## ADDED Requirements

### Requirement: Instalación guiada y verificable de Node.js en Windows
La Semana 1 SHALL explicar cómo preparar Windows, obtener una versión LTS desde el sitio oficial de Node.js, conservar los componentes necesarios, reiniciar el entorno y verificar Node.js y npm sin exigir un número de versión fijo.

#### Scenario: Alumno instala Node.js
- **WHEN** el alumno abre “Instalá Node.js”
- **THEN** identifica que la guía corresponde a Windows
- **AND** comprende para qué sirven Node.js runtime, npm y PATH
- **AND** sigue una secuencia de descarga, instalación, reinicio y verificación
- **AND** sabe que una versión diferente a las capturas puede ser válida

### Requirement: Recuperación segura ante errores de instalación
La sección SHALL ofrecer una primera comprobación y un siguiente paso para los errores frecuentes de `node`, `npm` y `npm.ps1`, sin instruir al alumno a debilitar la configuración de seguridad del equipo.

#### Scenario: PowerShell bloquea npm.ps1
- **WHEN** PowerShell informa que `npm.ps1` no puede ejecutarse
- **THEN** el contenido indica que no se cambie la política de ejecución sin autorización
- **AND** propone conservar el mensaje y consultar al docente o responsable del equipo

#### Scenario: La terminal no reconoce node o npm
- **WHEN** un comando no es reconocido después de la instalación
- **THEN** el alumno comprueba primero que reinició Visual Studio Code y abrió una terminal nueva
- **AND** recibe un siguiente paso acotado antes de reinstalar o modificar el sistema

### Requirement: Evidencia real de instalación
La finalización de la sección SHALL depender de registrar salidas con formato de versión para Node.js y npm, y no de confirmar manualmente un checklist de pasos.

#### Scenario: Alumno verifica el entorno
- **WHEN** registra respuestas válidas de `node --version` y `npm --version`
- **THEN** ambas evidencias quedan satisfechas
- **AND** la sección puede considerarse completada

