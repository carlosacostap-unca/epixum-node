## ADDED Requirements

### Requirement: Modelo verificable de runtime JavaScript
La sección de runtime SHALL definir Node.js como un entorno de ejecución de JavaScript, SHALL distinguirlo del lenguaje, de un framework y de un servidor, y SHALL comparar las API anfitrionas disponibles en Node.js y en el navegador.

#### Scenario: Código compartido entre entornos
- **WHEN** un estudiante abre «JavaScript salió del navegador»
- **THEN** observa un fragmento de JavaScript que puede ejecutarse tanto en la consola del navegador como con Node.js
- **AND** el contenido advierte que compartir el lenguaje no implica compartir todas las API del entorno

#### Scenario: Capacidades propias del entorno
- **WHEN** el contenido compara navegador y Node.js
- **THEN** identifica `window`, `document` y el DOM como capacidades del navegador
- **AND** identifica `process` y las API de sistema, archivos o red como capacidades provistas por Node.js

### Requirement: Ejecución y proceso observables
La sección SHALL explicar el recorrido de `node app.js`, SHALL atribuir responsabilidades acotadas a V8, las API de Node.js y libuv, y SHALL permitir interpretar valores observables del proceso.

#### Scenario: Alumno ejecuta un archivo
- **WHEN** el estudiante ejecuta `node app.js Martina`
- **THEN** comprende que el sistema inicia un proceso de Node.js, carga el archivo de entrada y V8 ejecuta su JavaScript
- **AND** reconoce que las API de Node.js y su capa nativa conectan el programa con el entorno, mientras libuv participa en el bucle de eventos y en parte de la entrada y salida asíncrona

#### Scenario: Alumno interpreta process
- **WHEN** el programa muestra `process.version`, `process.cwd()` y `process.argv[2]`
- **THEN** el contenido explica que `process.cwd()` es el directorio desde el cual se inició el proceso y no necesariamente la carpeta del archivo
- **AND** distingue el ejecutable, el archivo de entrada y el primer argumento adicional en las posiciones 0, 1 y 2 de `process.argv`

### Requirement: Diagnóstico de entorno y evidencia única
La sección SHALL presentar una incompatibilidad de API como un problema de entorno y SHALL finalizar con la pregunta obligatoria existente como única evidencia requerida.

#### Scenario: API del navegador ejecutada en Node.js
- **WHEN** el estudiante encuentra `ReferenceError: document is not defined` al ejecutar un archivo con Node.js
- **THEN** el contenido explica que `document` pertenece al DOM del navegador
- **AND** orienta a ejecutar ese código en el entorno adecuado o a sustituir la dependencia, sin presentar a Node.js como defectuoso

#### Scenario: Nueva revisión de la sección
- **WHEN** se genera el contenido curado
- **THEN** las tres imágenes se conservan y el checklist opcional no se incluye
- **AND** la pregunta existente, sus opciones y su respuesta correcta permanecen sin cambios
