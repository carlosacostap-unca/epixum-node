# Configuración de PocketBase para Epixum Node

Para que la aplicación funcione correctamente, necesitas crear las siguientes colecciones en tu instancia de PocketBase (`https://epixum-node.pockethost.io/`).

## 1. Colección: `courses` (Opcional por ahora, pero recomendada)
- **Name**: `courses`
- **Type**: `Base`
- **Fields**:
    - `title`: Text (Required)
    - `description`: Text

### Users Collection (`users`)

- **role**: Select (options: "admin", "docente", "estudiante").
- **firstName**: Text (Required)
- **lastName**: Text (Required)
- **dni**: Text
- **birthDate**: Date
- **phone**: Text
  - Esto permitirá identificar los permisos de cada usuario.

### API Rules (Reglas de Acceso)

Para que el rol "Docente" pueda gestionar el contenido, debes configurar las siguientes reglas en PocketBase:

**Collections: `sprints`, `classes`, `assignments`, `links`**

- **List/View Rule**: `""` (Público o accesible para todos los autenticados, según prefieras. Si es solo estudiantes/docentes: `@request.auth.id != ""`)
- **Create/Update/Delete Rule**: `@request.auth.role = "docente" || @request.auth.role = "admin"`

**Collection: `users`**

- **List/View Rule**: `id = @request.auth.id || @request.auth.role = "admin"`
- **Create Rule**: `""` (Público, para permitir registro)
- **Update Rule**: `(id = @request.auth.id && @request.body.role:isset = false) || @request.auth.role = "admin"`
  - *Nota*: Esto permite que los usuarios editen su perfil pero **NO** su rol. Solo los admins pueden cambiar roles.
- **Delete Rule**: `id = @request.auth.id || @request.auth.role = "admin"`
  - *Nota*: Permite que los usuarios borren su cuenta y que los admins borren a cualquiera.

## Pasos para implementar Roles

1.  Ve a la colección `users` > Edit Collection > Add Field > Select.

## 2. Colección: `sprints`
- **Name**: `sprints`
- **Type**: `Base`
- **Fields**:
    - `title`: Text (Required)
    - `description`: Text
    - `startDate`: Date
    - `endDate`: Date
    - `course`: Relation (Single) -> Collection: `courses` (Opcional si solo hay un curso)

## 3. Colección: `classes`
- **Name**: `classes`
- **Type**: `Base`
- **Fields**:
    - `title`: Text (Required)
    - `description`: Text
    - `date`: Date
    - `sprint`: Relation (Single, Required) -> Collection: `sprints`

## 4. Colección: `assignments` (Trabajos Prácticos)
- **Name**: `assignments`
- **Type**: `Base`
- **Fields**:
    - `title`: Text (Required)
    - `description`: Editor (Rich Text)
    - `sprint`: Relation (Single, Required) -> Collection: `sprints`

## 5. Colección: `links`
- **Name**: `links`
- **Type**: `Base`
- **Fields**:
    - `title`: Text (Required)
    - `url`: URL (Required)
    - `class`: Relation (Single, Optional) -> Collection: `classes`
    - `assignment`: Relation (Single, Optional) -> Collection: `assignments`

## 6. Colección: `deliveries` (Entregas de TP)
- **Name**: `deliveries`
- **Type**: `Base`
- **Fields**:
    - `assignment`: Relation (Single, Required) -> Collection: `assignments`
    - `student`: Relation (Single, Required) -> Collection: `users`
    - `repositoryUrl`: URL (Required)
- **Constraints**:
    - Unique index on `assignment` + `student` (Un estudiante solo puede tener una entrega por TP)
- **API Rules**:
    - **List/View Rule**: `student = @request.auth.id || @request.auth.role = "docente" || @request.auth.role = "admin"`
        - *Nota*: Los estudiantes solo ven sus entregas; docentes/admins ven todas.
    - **Create Rule**: `@request.auth.id != "" && @request.auth.role = "estudiante"`
    - **Update Rule**: `student = @request.auth.id || @request.auth.role = "admin"`
        - *Nota*: Estudiantes pueden modificar su entrega.
    - **Delete Rule**: `student = @request.auth.id || @request.auth.role = "admin"`

## 7. Colección: `teams`
- **Name**: `teams`
- **Type**: `Base`
- **Fields**:
    - `name`: Text (Required)
    - `members`: Relation (Multiple) -> Collection: `users`
- **API Rules**:
    - **List/View**: `@request.auth.id != ""`
    - **Create/Update/Delete**: `@request.auth.role = "docente" || @request.auth.role = "admin"`

## 8. Colección: `messages` (Chat de Equipo)
- **Name**: `messages`
- **Type**: `Base`
- **Fields**:
    - `text`: Text (Required)
    - `sender`: Relation (Single, Required) -> Collection: `users` (Renamed from `user` to avoid system conflicts)
    - `team`: Relation (Single, Required) -> Collection: `teams`
- **API Rules**:
    - **List/View**: `@request.auth.id != "" && team.members.id ?= @request.auth.id`
        - *Nota*: Solo los miembros del equipo pueden ver los mensajes.
    - **Create Rule**: `@request.auth.id != "" && @request.data.team.members ?= @request.auth.id`

## 9. Colección: `inquiries` (Consultas)
- **Name**: `inquiries`
- **Type**: `Base`
- **Fields**:
    - `title`: Text (Required)
    - `description`: Text (Required)
    - `status`: Select (options: "Pendiente", "Resuelta") (Default: "Pendiente")
    - `author`: Relation (Single, Required) -> Collection: `users`
    - `class`: Relation (Single, Optional) -> Collection: `classes`
    - `assignment`: Relation (Single, Optional) -> Collection: `assignments`
- **API Rules**:
    - **List/View**: `@request.auth.id != ""` (Cualquier usuario autenticado puede ver las consultas)
    - **Create**: `@request.auth.id != ""`
    - **Update**: `author = @request.auth.id || @request.auth.role = "docente" || @request.auth.role = "admin"` (Autor o docentes pueden marcar como resuelta)
    - **Delete**: `author = @request.auth.id || @request.auth.role = "docente" || @request.auth.role = "admin"`

## 10. Colección: `inquiry_responses` (Respuestas a Consultas)
- **Name**: `inquiry_responses`
- **Type**: `Base`
- **Fields**:
    - `inquiry`: Relation (Single, Required) -> Collection: `inquiries`
    - `author`: Relation (Single, Required) -> Collection: `users`
    - `content`: Text (Required)
- **API Rules**:
    - **List/View**: `@request.auth.id != ""`
    - **Create**: `@request.auth.id != ""`
    - **Update**: `author = @request.auth.id || @request.auth.role = "docente" || @request.auth.role = "admin"`
    - **Delete**: `author = @request.auth.id || @request.auth.role = "docente" || @request.auth.role = "admin"`

## Cohortes y modalidad semanal

La aplicación soporta dos modalidades que no se mezclan:

- `sprints_and_teams`: modalidad histórica con sprints, equipos, chat, revisiones y encuestas.
- `weekly`: modalidad por semanas, sin equipos, revisiones ni encuestas.

Colecciones agregadas:

- `cohorts`: `name`, `slug` único, `mode`, `status` y fechas informativas.
- `cohort_enrollments`: relación única `(user, cohort)`, estado `active|completed`, condición `new|repeater` y fechas.
- `student_admissions`: nombre, correo normalizado, cohorte, condición y estado `pending|claimed|cancelled`; sólo puede existir una admisión pendiente por correo/cohorte.
- `weeks`: número único por cohorte, título, descripción, fechas informativas, `publicationStatus` y `publishedAt`.

`sprints`, `teams` e `inquiries` requieren una cohorte. `classes` y `assignments` deben tener exactamente uno de `sprint` o `week`. Las consultas pueden guardar `week` como contexto opcional compatible.

Las reglas definitivas permiten a docentes y administradores operar en sus módulos, y a estudiantes leer sólo cohortes inscriptas. El contenido semanal es visible para estudiantes únicamente cuando la semana está publicada; entregas, consultas y respuestas nuevas requieren inscripción activa.

## Procedimiento de despliegue

1. Inspeccionar sin escribir: `npm run schema:cohorts`.
2. Crear el esquema de transición: `npm run schema:cohorts -- --apply`.
   Para habilitar exclusivamente Semana 0 sobre un esquema existente sin aplicar otros cambios pendientes, usar primero `npm run schema:week-zero` y luego `npm run schema:week-zero -- --apply`; al repetir el dry-run debe informar `changed: false`.
3. Auditar el legado: `npm run migrate:cohorts -- --legacy-slug nodejs-legacy`.
4. Ejecutar el backfill idempotente: `npm run migrate:cohorts -- --legacy-slug nodejs-legacy --apply`.
5. Repetir el comando sin `--apply`; debe informar cero operaciones y conservar todos los conteos.
6. Revisar reglas finales: `npm run schema:harden`.
7. Aplicarlas: `npm run schema:harden -- --apply` y repetir el dry-run hasta obtener `changed: false`.

## Contenidos estructurados por semana

El módulo de contenidos utiliza colecciones nuevas y no modifica las colecciones académicas existentes:

- `content_sections`: identidad, semana, orden, estado, programación, revisión visible y procedencia.
- `content_section_revisions`: instantáneas inmutables de bloques y requisitos; no son legibles directamente por estudiantes.
- `content_activity_attempts`: historial append-only e idempotente de respuestas.
- `content_section_progress`: primera y última apertura, avance, dominio y finalización por estudiante.
- `content_assets`: imágenes o videos inmutables, subidos o externos; los archivos quedan protegidos.
- `content_bases` y `content_base_versions`: bases de curso, semana o sección e historial inmutable.

Ejecutar primero `npm run schema:content` para inspeccionar el dry-run. Aplicar solamente con `npm run schema:content -- --apply` y repetir el dry-run hasta obtener `changed: false`. Las revisiones, intentos y progreso tienen reglas API cerradas: la aplicación los accede mediante acciones de servidor después de autorizar cohorte, rol y disponibilidad.

Los scripts no borran registros. El endurecimiento conserva una copia en memoria de cada colección y revierte las colecciones ya actualizadas si PocketBase rechaza alguna regla. Para rollback de aplicación, volver a desplegar la versión anterior; no se deben eliminar las nuevas relaciones ni la cohorte heredada porque ya forman parte de la resolución de datos históricos.

### Importación de la Semana 1

`npm run content:manifest:week1` reconstruye `content/week-01.manifest.json` desde los prototipos estáticos. Genera catorce secciones y excluye siempre `02-diagnostico-javascript`.

La importación requiere destino y autor explícitos. Sin `--apply` sólo consulta y muestra el plan:

```powershell
npm run content:import:week1 -- --cohort COHORT_ID --week WEEK_ID --author ADMIN_USER_ID
```

Para aplicarlo como borradores se debe repetir el ID de semana como confirmación:

```powershell
npm run content:import:week1 -- --cohort COHORT_ID --week WEEK_ID --author ADMIN_USER_ID --apply --confirm-week WEEK_ID
```

Las claves `sourceKey` e `importKey` vuelven idempotentes las reejecuciones. El comando nunca publica la semana ni las secciones.

La guía completa de despliegue, operación editorial, límites de medios, bases, restauración y rollback está en `docs/content-operations.md`.

## Alta de alumnos

Desde `/admin/users` o `/admin/cohorts/[cohortId]`, el administrador registra únicamente nombre, correo de Google, cohorte y condición (nuevo o recursante). Si el correo ya pertenece a un usuario, se crea o reactiva su inscripción sin duplicar la cuenta. En caso contrario se crea una admisión pendiente, que se reclama de forma idempotente en el primer acceso con Google.

Una cuenta de Google sin usuario inscripto ni admisión pendiente recibe: “Tu cuenta no está registrada. Contactá a la administración del curso.” La sesión se limpia y no puede leer información académica.

## Datos de Ejemplo
Una vez creadas las colecciones y configuradas las reglas, puedes añadir algunos registros de prueba:

1. Crea un **Sprint**: "Fundamentos de Node.js"
2. Crea una **Clase**: "Instalación y configuración" (sprint: [ID del sprint anterior])
3. Crea un **Link**: "Video de instalación" (url: https://youtube.com/..., type: video, class: [ID de la clase anterior])
