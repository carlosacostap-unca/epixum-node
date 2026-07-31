# Team Collaboration Specification

## Purpose

Definir la creación y organización de equipos de estudiantes, su visualización y el chat privado de cada equipo.
## Requirements
### Requirement: Acceso a la gestión de equipos

El sistema MUST limitar las rutas `/teams`, `/teams/view` y `/teams/restructure` a docentes y administradores.

#### Scenario: Acceso docente

- **WHEN** un `docente` o `admin` abre la gestión de equipos
- **THEN** el sistema permite ver equipos o reestructurarlos

#### Scenario: Acceso de estudiante

- **WHEN** un estudiante intenta abrir una ruta de gestión
- **THEN** el sistema redirige al inicio

### Requirement: Ciclo de vida de equipos

El sistema MUST permitir a docentes y administradores crear, renombrar y eliminar equipos.

#### Scenario: Crear equipo

- **WHEN** un usuario autorizado envía un nombre no vacío
- **THEN** el sistema crea un equipo sin miembros iniciales

#### Scenario: Nombre ausente

- **WHEN** el nombre del nuevo equipo está vacío
- **THEN** el sistema rechaza la creación

#### Scenario: Renombrar equipo

- **WHEN** un usuario autorizado confirma un nombre nuevo
- **THEN** el sistema actualiza el equipo y refresca la gestión

#### Scenario: Eliminar equipo

- **WHEN** un usuario autorizado confirma la eliminación
- **THEN** el sistema elimina el equipo y actualiza la gestión

### Requirement: Asignación exclusiva de estudiantes

El sistema MUST mantener a cada estudiante en un máximo de un equipo durante una operación de reestructuración.

#### Scenario: Mover a otro equipo

- **WHEN** un docente arrastra un estudiante hacia un equipo destino
- **THEN** el sistema elimina al estudiante de cualquier otro equipo
- **AND** lo agrega al equipo destino si aún no pertenece a él

#### Scenario: Dejar sin asignar

- **WHEN** un docente mueve un estudiante a la columna `Sin Asignar`
- **THEN** el sistema lo elimina de todos los equipos

#### Scenario: Estudiante presente en múltiples equipos por datos previos

- **WHEN** una operación detecta más de un equipo actual para el estudiante
- **THEN** el sistema lo elimina de todos salvo el destino solicitado

### Requirement: Listado y detalle docente

El sistema MUST permitir consultar equipos con sus miembros expandidos.

#### Scenario: Lista de equipos

- **WHEN** un docente abre `/teams/view`
- **THEN** el sistema muestra los equipos ordenados por creación y un resumen de sus miembros

#### Scenario: Detalle de equipo

- **WHEN** un docente abre `/teams/view/{id}` para un equipo válido
- **THEN** el sistema muestra nombre e identidad de sus integrantes

#### Scenario: Equipo inexistente

- **WHEN** el identificador no corresponde a un equipo accesible
- **THEN** el sistema responde como recurso no encontrado

### Requirement: Vista personal del equipo

El sistema MUST permitir a una persona autenticada consultar el equipo que contiene su identificador.

#### Scenario: Persona asignada

- **WHEN** abre `/my-team` y pertenece a un equipo
- **THEN** el sistema muestra el nombre, miembros, avatares y correos del equipo
- **AND** destaca a la persona actual
- **AND** habilita el chat del equipo

#### Scenario: Persona sin equipo

- **WHEN** no existe un equipo que contenga su identificador
- **THEN** el sistema informa que todavía no tiene equipo asignado

### Requirement: Mensajería del equipo

El sistema MUST permitir a los miembros autorizados leer y enviar mensajes dentro de su equipo.

#### Scenario: Carga de mensajes

- **WHEN** se abre el chat de un equipo
- **THEN** el sistema carga hasta 50 mensajes ordenados por creación con la identidad del remitente
- **AND** actualiza la conversación cada 60 segundos

#### Scenario: Actualización manual

- **WHEN** la persona activa recargar mensajes
- **THEN** el sistema vuelve a consultar la conversación inmediatamente

#### Scenario: Envío válido

- **WHEN** un miembro envía texto no vacío
- **THEN** el sistema crea un mensaje ligado al remitente y al equipo
- **AND** limpia el campo y vuelve a cargar la conversación

#### Scenario: Mensaje vacío

- **WHEN** el texto solo contiene espacios
- **THEN** el sistema no crea un mensaje

#### Scenario: Aislamiento del chat

- **WHEN** una persona intenta leer o escribir mensajes de un equipo al que no pertenece
- **THEN** las reglas de PocketBase deniegan el acceso

### Requirement: Unified team management
Staff SHALL be able to switch between team overview and organization without navigating through separate landing screens.

#### Scenario: Staff reorganizes teams
- **WHEN** staff enters organization mode and moves or edits students and teams
- **THEN** the system identifies unsaved changes and requires one explicit save or discard decision

### Requirement: Student collaboration priority
The student's team screen SHALL prioritize team identity, members, and conversation and SHALL adapt the conversation for narrow viewports.

#### Scenario: Student opens team on mobile
- **WHEN** an assigned student opens their team on a narrow viewport
- **THEN** member context remains available and the conversation and send action are usable without page-level horizontal scrolling

