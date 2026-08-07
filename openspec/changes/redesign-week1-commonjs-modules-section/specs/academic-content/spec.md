## ADDED Requirements

### Requirement: Contrato CommonJS observable entre archivos
La sección de módulos SHALL presentar cada archivo como un módulo con alcance local y SHALL mostrar `module.exports` como la interfaz que otro archivo recibe mediante `require`.

#### Scenario: Módulo define y exporta
- **WHEN** el estudiante abre `operaciones.js`
- **THEN** identifica una función local llamada `sumar`
- **AND** reconoce que sólo las propiedades asignadas a `module.exports` forman parte del contrato público del ejemplo

#### Scenario: Archivo de entrada importa y usa
- **WHEN** el estudiante abre `app.js` junto a `operaciones.js`
- **THEN** observa `const { sumar } = require("./operaciones")`
- **AND** al ejecutar `node app.js` obtiene `12`, en coincidencia con el código y la captura

### Requirement: Resolución inicial de identificadores CommonJS
La sección SHALL distinguir identificadores de archivos locales, carpetas superiores, módulos incorporados y paquetes instalados, y SHALL explicar la base de resolución de una ruta relativa.

#### Scenario: Archivo vecino
- **WHEN** `app.js` requiere `./operaciones`
- **THEN** el contenido explica que `./` parte de la carpeta del módulo que realiza la llamada
- **AND** aclara que CommonJS puede resolver la extensión `.js` omitida en este ejemplo

#### Scenario: Otras clases de identificadores
- **WHEN** el estudiante compara `../utilidades`, `node:fs` y `express`
- **THEN** distingue respectivamente una ruta local ascendente, un módulo incorporado explícito y un paquete que Node.js busca mediante su resolución de dependencias

### Requirement: Cohesión, coordinación y diagnóstico inicial
La sección SHALL orientar la separación por propósito, SHALL mantener el archivo de entrada legible y SHALL ofrecer comprobaciones concretas para errores de ruta, exportación o sistema de módulos.

#### Scenario: Alumno decide una responsabilidad
- **WHEN** el contenido compara `operaciones.js` con `app.js`
- **THEN** atribuye al primero las operaciones relacionadas y al segundo la coordinación del flujo
- **AND** evita interpretar que cada función necesita obligatoriamente un archivo propio

#### Scenario: Ejemplo CommonJS no ejecuta
- **WHEN** el estudiante encuentra `MODULE_NOT_FOUND`, una función indefinida o `require is not defined`
- **THEN** el contenido orienta a revisar respectivamente ruta y mayúsculas, propiedad exportada e importada, o configuración del sistema de módulos
- **AND** no recomienda mezclar `require` con `import` al azar dentro del mismo ejemplo

### Requirement: Evidencia estable y única de módulos
La sección SHALL finalizar con la pregunta obligatoria existente como única evidencia requerida de la resolución de una ruta local.

#### Scenario: Nueva revisión de la sección
- **WHEN** se genera el contenido curado
- **THEN** las dos imágenes se conservan y el checklist opcional no se incluye
- **AND** la pregunta existente, sus opciones y su respuesta correcta permanecen sin cambios
