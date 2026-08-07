## Purpose

Permitir que docentes y administradores construyan, organicen, previsualicen y publiquen recorridos de contenido estructurado dentro de las semanas de una cohorte.

## ADDED Requirements

### Requirement: Gestión de secciones semanales
El sistema SHALL permitir que docentes y administradores creen, editen, dupliquen, reordenen y retiren secciones de contenido asociadas a una semana accesible.

#### Scenario: Creación de una sección
- **WHEN** un docente o administrador crea una sección dentro de una semana
- **THEN** el sistema la agrega como borrador en la última posición disponible

#### Scenario: Reordenamiento de secciones
- **WHEN** un docente o administrador cambia el orden de las secciones
- **THEN** el sistema conserva el nuevo orden y lo utiliza para la numeración y navegación del alumno

#### Scenario: Estudiante intenta administrar contenido
- **WHEN** un estudiante intenta crear, modificar, reordenar o publicar una sección
- **THEN** el sistema rechaza la operación sin alterar el contenido

### Requirement: Ciclo de publicación por sección
Cada sección SHALL tener exactamente uno de los estados `draft`, `scheduled`, `published` o `hidden`, con una fecha y hora obligatoria cuando esté programada.

#### Scenario: Publicación manual
- **WHEN** un docente o administrador publica manualmente una sección válida
- **THEN** la sección queda en estado `published` y registra el momento de publicación

#### Scenario: Programación válida
- **WHEN** un docente o administrador programa una sección con fecha y hora futuras
- **THEN** la sección queda en estado `scheduled` y conserva el instante programado

#### Scenario: Programación incompleta
- **WHEN** se intenta guardar una sección programada sin fecha y hora válidas
- **THEN** el sistema rechaza el cambio y explica qué dato falta

#### Scenario: Ocultar una sección publicada
- **WHEN** un docente o administrador oculta una sección publicada o programada
- **THEN** la sección queda en estado `hidden` y deja de estar disponible para estudiantes

#### Scenario: Volver una sección a borrador
- **WHEN** un docente o administrador devuelve una sección a borrador
- **THEN** la sección queda en estado `draft` y conserva su contenido editable

### Requirement: Editor de contenido por bloques
El sistema MUST ofrecer un editor que componga una sección mediante bloques ordenables y configurables de texto enriquecido, destacado, tarjetas, pasos, imagen, video, código, enlace o botón, contenido embebido, glosario, pregunta, lista de auto-comprobación, validador y generador.

#### Scenario: Edición y orden de bloques
- **WHEN** un docente agrega, configura, elimina o reordena bloques y guarda la sección
- **THEN** el sistema conserva una revisión coherente con el orden y la configuración elegidos

#### Scenario: Bloque inválido
- **WHEN** un bloque obligatorio carece de contenido o configuración válida
- **THEN** el sistema impide guardar la revisión y señala el bloque que requiere corrección

#### Scenario: Código copiable
- **WHEN** un docente configura un bloque de código con lenguaje, título y contenido
- **THEN** la vista del alumno muestra el código con resaltado, desplazamiento seguro y una acción para copiarlo

#### Scenario: Preguntas admitidas
- **WHEN** un docente crea una actividad de pregunta
- **THEN** puede elegir opción única, selección múltiple o verdadero/falso y definir la respuesta correcta

### Requirement: Medios y contenido externo seguros
El sistema SHALL permitir usar imágenes y videos subidos o referenciados mediante URL, y SHALL validar enlaces y contenidos embebidos antes de mostrarlos.

#### Scenario: Carga de medio
- **WHEN** un usuario autorizado sube una imagen o video permitido
- **THEN** el sistema conserva el archivo y permite utilizarlo en un bloque con metadatos accesibles

#### Scenario: Medio externo
- **WHEN** un usuario autorizado configura una URL HTTPS válida para una imagen o video
- **THEN** el sistema permite previsualizarla y utilizarla en la sección

#### Scenario: Contenido embebido no permitido
- **WHEN** se intenta guardar un proveedor, protocolo o código embebido no permitido
- **THEN** el sistema rechaza el bloque sin ejecutar el contenido recibido

### Requirement: Vista previa como alumno
Docentes y administradores SHALL poder previsualizar cualquier revisión de una sección con la misma representación responsive del alumno, independientemente de su estado de publicación.

#### Scenario: Previsualización de borrador
- **WHEN** un docente activa la vista previa de una sección en borrador
- **THEN** el sistema muestra su revisión actual con un indicador inequívoco de vista previa
- **AND** no publica ni modifica progreso estudiantil

### Requirement: Edición de contenido publicado
Guardar una revisión válida de una sección publicada SHALL reemplazar inmediatamente la revisión visible para estudiantes sin exponer un estado intermedio incompleto.

#### Scenario: Guardado sobre una sección publicada
- **WHEN** un docente guarda cambios válidos en una sección publicada
- **THEN** las nuevas lecturas reciben la revisión completa recién guardada
- **AND** los estudiantes nunca reciben una mezcla parcial de ambas revisiones

### Requirement: Importación inicial de la semana 1
El sistema MUST disponer de una importación repetible que cree como borradores las catorce secciones aplicables del prototipo de la semana 1 y preserve su orden, contenido, medios e interacciones compatibles.

#### Scenario: Importación en una base vacía
- **WHEN** un administrador ejecuta la importación de la semana 1 sobre el destino previsto sin esas secciones
- **THEN** se crean catorce secciones ordenadas y editables
- **AND** la numeración visible se calcula de forma continua según su orden

#### Scenario: Exclusión del diagnóstico
- **WHEN** se importa el prototipo de la semana 1
- **THEN** `02-diagnostico-javascript` no se convierte en una sección
- **AND** el diagnóstico existente de la cohorte permanece independiente

#### Scenario: Repetición de la importación
- **WHEN** el administrador repite la importación sobre el mismo destino
- **THEN** el sistema evita duplicar secciones o medios ya importados

