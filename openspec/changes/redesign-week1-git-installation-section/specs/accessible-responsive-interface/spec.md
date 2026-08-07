## ADDED Requirements

### Requirement: Generación copiable de comandos personalizados
Un generador de comandos SHALL mantener visibles los marcadores de datos requeridos que aún no fueron completados y SHALL habilitar una acción de copia accesible sólo cuando todos los campos obligatorios tengan valor.

#### Scenario: Generador incompleto
- **WHEN** falta al menos un campo obligatorio
- **THEN** la vista previa conserva el marcador correspondiente
- **AND** el control para copiar permanece deshabilitado

#### Scenario: Generador completo
- **WHEN** todos los campos obligatorios tienen un valor
- **THEN** los comandos muestran esos valores
- **AND** el usuario puede copiarlos mediante teclado o puntero
- **AND** recibe confirmación textual de la copia

### Requirement: Recorrido de configuración adaptable
Los pasos, imágenes, decisiones de privacidad, comandos y problemas de configuración SHALL conservar su orden y jerarquía en pantallas pequeñas sin desplazamiento horizontal de la página.

#### Scenario: Alumno consulta la guía en móvil
- **WHEN** la sección se muestra en un viewport móvil
- **THEN** pasos y tarjetas se apilan en orden pedagógico
- **AND** el generador agrupa campos, resultado y copia dentro de su propia superficie

