## ADDED Requirements

### Requirement: Práctica integradora modular ejecutable
La sección integradora de la Semana 1 SHALL presentar un único programa CommonJS completo cuya entrada, salidas, módulos y archivo generado sean coherentes entre todos los bloques.

#### Scenario: Estudiante ejecuta el programa con un nombre
- **WHEN** el estudiante copia los archivos mostrados y ejecuta el punto de entrada con un nombre de una o más palabras
- **THEN** el programa muestra el saludo correspondiente, informa que actualizó el historial y agrega una línea al archivo de historial

#### Scenario: Estudiante ejecuta el programa sin nombre
- **WHEN** el estudiante ejecuta el punto de entrada sin argumentos adicionales
- **THEN** el programa muestra una instrucción de uso, establece un resultado fallido y no agrega una entrada al historial

### Requirement: Construcción incremental y comprobable
La sección SHALL organizar el taller desde el contrato observable hasta la implementación por responsabilidades y SHALL incluir resultados esperados y comprobaciones seguras para cada conducta relevante.

#### Scenario: Estudiante sigue el taller
- **WHEN** el estudiante recorre los bloques en orden
- **THEN** primero reconoce el resultado esperado, luego crea los módulos, ejecuta casos concretos y finalmente compara sus resultados con evidencias explícitas

#### Scenario: Programa ejecutado desde otra carpeta
- **WHEN** el punto de entrada se invoca mediante una ruta desde un directorio de trabajo diferente
- **THEN** el historial se resuelve junto al módulo que lo administra y no en una ubicación accidental dependiente del comando

### Requirement: Evidencia de comprensión y funcionamiento
La sección SHALL requerir una comprobación conceptual autocorregible y una lista de evidencia observable limitada al programa construido en esa sección.

#### Scenario: Estudiante completa la sección
- **WHEN** el estudiante responde correctamente la pregunta sobre los argumentos de línea de comandos y confirma todas las evidencias de ejecución
- **THEN** la plataforma puede considerar completas las actividades requeridas de la sección

#### Scenario: Estudiante aún no realizó Git
- **WHEN** el estudiante termina el programa antes de recorrer las secciones de versionado
- **THEN** la evidencia de esta sección no exige commits ni publicación remota
