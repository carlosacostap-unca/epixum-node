## ADDED Requirements

### Requirement: Recorrido inicial de terminal fiel y condensado
La Semana 1 SHALL explicar la terminal mediante un objetivo, una demostración, una referencia de comandos, una práctica guiada, errores frecuentes y una comprobación obligatoria, sin repetir fragmentos ni perder campos del prototipo.

#### Scenario: Alumno estudia la sección de terminal
- **WHEN** abre “Conocé la terminal integrada”
- **THEN** distingue prompt, comando y respuesta
- **AND** encuentra los seis comandos con propósito y consigna
- **AND** practica crear, recorrer y abandonar una carpeta antes de responder la comprobación

### Requirement: Precisión de navegación y contexto de terminal
La sección SHALL describir `cd ..` como acceso a la carpeta padre y SHALL advertir que PowerShell y Bash pueden mostrar rutas diferentes aunque los comandos seleccionados funcionen en ambos contextos de la cursada.

#### Scenario: Alumno compara resultados
- **WHEN** ejecuta la práctica guiada en PowerShell o una terminal tipo Bash
- **THEN** puede interpretar diferencias de presentación sin confundirlas con un error
- **AND** comprende que `cd ..` sube un nivel en la jerarquía

