# Platform and Data Specification

## Purpose

Definir las dependencias de ejecución, la integración con PocketBase, el modelo persistente y las reglas transversales de recuperación de datos.

## Requirements

### Requirement: Plataforma de ejecución

El sistema MUST ejecutarse como una aplicación Next.js con App Router sobre Node.js 20.9.0 o superior.

#### Scenario: Desarrollo local

- **WHEN** se ejecuta el script `dev`
- **THEN** Next.js inicia el servidor de desarrollo

#### Scenario: Despliegue de producción

- **WHEN** se ejecutan `build` y luego `start`
- **THEN** el sistema compila y sirve la aplicación de producción

### Requirement: Configuración de PocketBase

El sistema MUST obtener la URL de PocketBase desde `NEXT_PUBLIC_POCKETBASE_URL` tanto en cliente como en servidor.

#### Scenario: URL configurada

- **WHEN** la variable existe
- **THEN** los clientes de PocketBase usan ese endpoint como fuente de verdad

#### Scenario: URL ausente en servidor

- **WHEN** la variable no está definida
- **THEN** el sistema registra un error crítico de configuración

### Requirement: Cliente autenticado de servidor

El sistema MUST crear clientes PocketBase aislados para solicitudes de servidor y cargar la sesión desde `pb_auth` cuando exista.

#### Scenario: Solicitud autenticada

- **WHEN** la cookie contiene una sesión válida
- **THEN** el cliente de servidor expone el modelo de usuario autenticado

#### Scenario: Sesión ausente o inválida

- **WHEN** no existe un almacén de autenticación válido
- **THEN** la consulta del usuario actual devuelve `null`

### Requirement: Modelo de datos académico

El sistema MUST persistir las entidades académicas y colaborativas en colecciones PocketBase relacionadas.

#### Scenario: Jerarquía académica

- **WHEN** se consulta el contenido del curso
- **THEN** `classes` y `assignments` se relacionan con `sprints`
- **AND** `links` se relacionan opcionalmente con una clase o un trabajo

#### Scenario: Actividad estudiantil

- **WHEN** se registra actividad del estudiante
- **THEN** `deliveries`, `student_surveys` y reservas de `reviews` se relacionan con `users` y `sprints` o trabajos según corresponda

#### Scenario: Colaboración

- **WHEN** se consulta colaboración
- **THEN** `teams` contiene múltiples miembros, `messages` liga remitente y equipo, e `inquiries` e `inquiry_responses` conservan autoría

### Requirement: Expansión de relaciones

El sistema MUST solicitar relaciones expandidas cuando una vista necesita mostrar datos humanos de entidades relacionadas.

#### Scenario: Entregas y revisiones

- **WHEN** una vista docente muestra entregas o turnos
- **THEN** el sistema expande estudiantes y docentes requeridos

#### Scenario: Equipos, consultas y mensajes

- **WHEN** se muestran equipos, consultas o chat
- **THEN** el sistema expande miembros, autores o remitentes requeridos

### Requirement: Caché de listados compartidos

El sistema MUST reducir solicitudes repetidas a PocketBase mediante memoización por petición y caché temporal para listados frecuentes.

#### Scenario: Sprints

- **WHEN** se solicitan sprints repetidamente para la misma sesión
- **THEN** el sistema puede reutilizar el resultado durante 30 segundos

#### Scenario: Usuarios, estudiantes y equipos

- **WHEN** se solicitan repetidamente para la misma sesión
- **THEN** el sistema puede reutilizar los resultados durante 60 segundos

#### Scenario: Separación por sesión

- **WHEN** dos sesiones tienen tokens diferentes
- **THEN** la clave funcional de la consulta incluye el token correspondiente

### Requirement: Orden y límites de consulta

El sistema MUST aplicar órdenes y límites consistentes con cada experiencia de usuario.

#### Scenario: Sprints y entidades administrativas

- **WHEN** se consultan listados académicos o equipos
- **THEN** se ordenan por creación salvo que la vista indique otro criterio

#### Scenario: Chat

- **WHEN** se consulta el chat
- **THEN** se recuperan hasta 50 mensajes en orden cronológico

#### Scenario: Consultas académicas

- **WHEN** se listan consultas
- **THEN** se presentan de la más reciente a la más antigua

### Requirement: Manejo de fallos de lectura

El sistema MUST evitar que errores recuperables de PocketBase derriben listados secundarios.

#### Scenario: Falla en un listado tolerante

- **WHEN** falla la lectura de equipos, revisiones, consultas u otra colección tratada como opcional por la vista
- **THEN** el sistema registra el error y devuelve un estado vacío o nulo apropiado

#### Scenario: Recurso individual ausente

- **WHEN** falla la lectura de un detalle requerido por identificador
- **THEN** la página presenta no encontrado o un mensaje de error controlado

### Requirement: Revalidación posterior a mutaciones

El sistema MUST invalidar las rutas afectadas después de una mutación exitosa.

#### Scenario: Cambio académico

- **WHEN** se modifica un sprint, clase, trabajo, enlace o entrega
- **THEN** el sistema revalida el detalle y los listados padres pertinentes

#### Scenario: Cambio colaborativo

- **WHEN** se modifica un equipo, consulta, respuesta o revisión
- **THEN** el sistema revalida las vistas relacionadas
