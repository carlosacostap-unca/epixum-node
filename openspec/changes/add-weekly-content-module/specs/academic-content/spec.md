## ADDED Requirements

### Requirement: Contenidos estructurados dentro de semanas
El sistema SHALL incorporar una sección de contenidos al detalle de cada semana, separada de clases, trabajos y consultas, con una lista ordenada y un resumen de disponibilidad o progreso apropiado al rol.

#### Scenario: Docente consulta contenidos de una semana
- **WHEN** un docente o administrador abre la sección de contenidos
- **THEN** el sistema muestra todas las secciones, su orden, estado, programación y acciones autorizadas

#### Scenario: Alumno consulta contenidos de una semana
- **WHEN** un alumno abre la sección de contenidos de una semana accesible
- **THEN** el sistema muestra únicamente las secciones disponibles y el progreso propio

#### Scenario: Semana sin secciones
- **WHEN** una semana no tiene secciones visibles para el rol actual
- **THEN** el sistema presenta un estado vacío contextual en lugar de fallar

### Requirement: Disponibilidad efectiva de una sección
Una sección SHALL estar disponible para un alumno solamente cuando su matrícula esté activa, la cohorte esté activa, la semana esté publicada y la sección esté publicada o haya alcanzado su fecha programada.

#### Scenario: Sección publicada en semana publicada
- **WHEN** la cohorte y matrícula están activas, la semana está publicada y la sección está `published`
- **THEN** el alumno puede listar y abrir la sección

#### Scenario: Fecha programada alcanzada
- **WHEN** una sección `scheduled` alcanza su instante programado mientras los demás niveles están disponibles
- **THEN** el alumno puede verla sin requerir una tarea manual de publicación

#### Scenario: Fecha alcanzada con semana en borrador
- **WHEN** una sección alcanza su fecha programada pero la semana permanece en borrador
- **THEN** la sección continúa inaccesible para el alumno

#### Scenario: Publicación posterior de la semana
- **WHEN** se publica una semana después de la fecha programada de una sección
- **THEN** la sección se vuelve disponible inmediatamente

#### Scenario: Sección en borrador u oculta
- **WHEN** una sección está `draft` o `hidden`
- **THEN** el alumno no puede listarla ni abrirla mediante una URL directa

### Requirement: Numeración derivada del orden
La posición visible de una sección SHALL calcularse desde el orden vigente y no depender de números incorporados al contenido importado.

#### Scenario: Se excluye o reordena una sección
- **WHEN** cambia el conjunto u orden de secciones
- **THEN** la interfaz presenta una secuencia continua sin huecos

