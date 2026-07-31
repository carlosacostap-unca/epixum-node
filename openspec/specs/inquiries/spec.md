# Inquiries Specification

## Purpose

Definir el foro de consultas académicas, sus contextos, respuestas, búsqueda y moderación.
## Requirements
### Requirement: Consulta de preguntas

El sistema MUST permitir a usuarios autenticados listar consultas en orden descendente de creación.

#### Scenario: Listado general

- **WHEN** una persona abre `/inquiries`
- **THEN** el sistema muestra consultas con autor, estado y contexto académico expandido

#### Scenario: Filtrado local

- **WHEN** la persona selecciona pendientes, resueltas o propias
- **THEN** el sistema limita la lista a las consultas que cumplen el criterio

### Requirement: Búsqueda de consultas

El sistema MUST permitir buscar consultas por contenido y relaciones académicas.

#### Scenario: Búsqueda con texto

- **WHEN** se proporciona un término de búsqueda
- **THEN** el sistema busca coincidencias en título, descripción, autor, correo, clase, trabajo y sprint relacionado
- **AND** incluye consultas cuyas respuestas coinciden con el término

#### Scenario: Límite de búsqueda en respuestas

- **WHEN** se buscan coincidencias dentro de respuestas
- **THEN** el sistema inspecciona como máximo 50 respuestas
- **AND** incorpora como máximo 20 identificadores de consulta a la búsqueda final

### Requirement: Contexto de una consulta

El sistema MUST permitir asociar opcionalmente una consulta con una clase o un trabajo práctico.

#### Scenario: Nueva consulta desde contexto

- **WHEN** el formulario se abre desde una clase o un trabajo
- **THEN** el sistema preselecciona ese contexto

#### Scenario: Selección por sprint

- **WHEN** se crea una consulta desde la vista general
- **THEN** el formulario permite elegir un sprint y luego una clase o trabajo perteneciente a él

### Requirement: Creación de consultas

El sistema MUST permitir a cualquier usuario autenticado publicar una consulta.

#### Scenario: Publicación válida

- **WHEN** una persona envía título y descripción válidos
- **THEN** el sistema crea la consulta con estado `Pendiente` y autor igual a la sesión
- **AND** conserva el contexto opcional seleccionado

#### Scenario: Visitante intenta publicar

- **WHEN** no existe usuario autenticado
- **THEN** el sistema rechaza la creación

### Requirement: Detalle y respuestas

El sistema MUST mostrar el detalle de una consulta y sus respuestas en orden cronológico.

#### Scenario: Consulta existente

- **WHEN** una persona abre `/inquiries/{id}`
- **THEN** el sistema muestra cabecera, descripción, estado, autor, contexto y respuestas

#### Scenario: Consulta inexistente

- **WHEN** el identificador no corresponde a una consulta accesible
- **THEN** el sistema responde como recurso no encontrado

#### Scenario: Respuesta válida

- **WHEN** una persona autenticada envía contenido no vacío
- **THEN** el sistema crea una respuesta ligada a la consulta y a su autor
- **AND** refresca el detalle

### Requirement: Estado de resolución

El sistema MUST permitir cambiar una consulta entre `Pendiente` y `Resuelta` conforme a las reglas de autorización.

#### Scenario: Cambio autorizado

- **WHEN** el autor, un docente o un administrador solicita un estado válido
- **THEN** el sistema actualiza el estado y refresca listado y detalle

#### Scenario: Cambio no autorizado

- **WHEN** otra persona intenta cambiar el estado
- **THEN** PocketBase rechaza la operación

### Requirement: Eliminación y moderación

El sistema MUST permitir eliminar consultas y respuestas según propiedad o rol docente.

#### Scenario: Eliminar consulta

- **WHEN** el autor, un docente o un administrador elimina una consulta
- **THEN** el sistema elimina el registro y regresa al listado

#### Scenario: Eliminar respuesta

- **WHEN** el autor de la respuesta, un docente o un administrador la elimina
- **THEN** el sistema elimina la respuesta y refresca el detalle

#### Scenario: Eliminación no autorizada

- **WHEN** otra persona intenta eliminar contenido
- **THEN** PocketBase deniega la operación

### Requirement: Inquiry inbox
The system SHALL present inquiries as a filterable inbox with unresolved work visibly prioritized for authorized users.

#### Scenario: User filters inquiries
- **WHEN** a user filters by status, week, content context, or search text
- **THEN** the list updates while preserving the active cohort and communicates the number of matching inquiries

### Requirement: Conversational inquiry detail
The system SHALL present an inquiry and its responses as a chronological conversation with resolution state and reply action clearly separated.

#### Scenario: Open inquiry
- **WHEN** an authorized user opens a pending inquiry
- **THEN** the question, context, response history, reply action, and authorized resolution action are distinguishable

#### Scenario: Resolved inquiry
- **WHEN** a user opens a resolved inquiry
- **THEN** the resolved state and resolution history are visible without relying on color alone

