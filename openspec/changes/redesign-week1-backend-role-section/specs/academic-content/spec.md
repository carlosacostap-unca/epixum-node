## ADDED Requirements

### Requirement: Modelo introductorio cliente-servidor
La sección de back end SHALL presentar las responsabilidades de front end, back end, base de datos y servicios externos, y SHALL describir la solicitud y la respuesta como mensajes intercambiados entre cliente y servidor.

#### Scenario: Alumno recorre la arquitectura
- **WHEN** un estudiante abre “¿Qué hace el back end?”
- **THEN** identifica qué componente presenta la interfaz, cuál aplica reglas, cuál persiste datos y cuáles aportan capacidades externas
- **AND** comprende que la base de datos intercambia consultas y resultados con el back end, no solicitudes HTTP con la persona

#### Scenario: Solicitud concreta de reserva
- **WHEN** el contenido ejemplifica la creación de una reserva
- **THEN** muestra método, ruta y cuerpo de la solicitud, junto con el estado y el cuerpo de una respuesta
- **AND** explica esos elementos sin exigir conocimientos previos de una API o framework

### Requirement: Frontera de confianza y reglas del servidor
La sección SHALL distinguir la validación temprana del front end de la validación autoritativa del back end y SHALL tratar cada solicitud recibida como entrada no confiable.

#### Scenario: Validación en ambas capas
- **WHEN** el contenido compara la interfaz con el servidor
- **THEN** explica que el front end puede detectar errores para mejorar la experiencia
- **AND** establece que el back end vuelve a validar formato, identidad, permisos y reglas antes de modificar datos

#### Scenario: Regla satisfecha
- **WHEN** el usuario tiene permiso y el libro está disponible
- **THEN** el recorrido registra la reserva y devuelve una respuesta de éxito

#### Scenario: Regla no satisfecha
- **WHEN** falta permiso, los datos no son válidos o el libro no está disponible
- **THEN** el recorrido no registra la reserva y devuelve una respuesta de error útil

### Requirement: Evidencia conceptual única
La sección SHALL concluir con una única pregunta obligatoria que diferencia responsabilidades del back end de decisiones de presentación.

#### Scenario: Nueva revisión de la sección
- **WHEN** se genera el contenido curado
- **THEN** el checklist opcional no se conserva
- **AND** la pregunta existente, sus opciones y sus respuestas correctas permanecen sin cambios

