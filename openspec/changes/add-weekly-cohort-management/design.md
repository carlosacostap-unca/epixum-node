## Context

La aplicación actual usa colecciones globales y rutas centradas en sprints. Los estudiantes se identifican únicamente por rol; sprints, equipos y tableros consultan todos los registros disponibles. Google OAuth crea o autentica usuarios y asigna `estudiante` a cualquier registro sin rol.

El cambio debe introducir aislamiento por cohorte y una modalidad semanal sin romper el flujo existente. La cohorte actual seguirá activa, editable y disponible para sus alumnos. Un mismo usuario podrá tener varias inscripciones, incluida una nueva cursada como recursante. PocketBase continúa como fuente de verdad y no se incorpora otra dependencia de infraestructura.

## Goals / Non-Goals

**Goals:**

- Aislar usuarios, contenido y métricas por cohorte.
- Conservar el modelo actual de sprints/equipos como modalidad compatible.
- Incorporar semanas publicadas manualmente con clases, materiales, TPs y entregas.
- Permitir inscripciones múltiples, altas administrativas por correo y acceso Google por invitación.
- Adaptar consultas y tableros a semanas.
- Ejecutar una migración aditiva, idempotente, verificable y reversible a nivel de aplicación.

**Non-Goals:**

- Reemplazar o eliminar sprints, equipos, mensajes, revisiones o encuestas existentes.
- Habilitar equipos, chat, revisiones o encuestas en cohortes semanales.
- Enviar correos de invitación desde la aplicación.
- Publicar semanas automáticamente por fecha.
- Rediseñar la evaluación académica más allá de agregar progreso semanal.

## Decisions

### 1. Cohorte explícita con modalidad inmutable después de tener contenido

Se incorporará `cohorts` con `name`, `slug`, `mode`, `status`, `startDate` y `endDate`. `mode` aceptará `sprints_and_teams` o `weekly`. Una cohorte con contenido no podrá cambiar de modalidad, porque hacerlo dejaría relaciones incompatibles.

Se prefiere una modalidad explícita frente a inferirla por la presencia de sprints o semanas: permite validar operaciones, construir navegación estable y bloquear módulos no soportados.

### 2. Inscripciones muchos-a-muchos separadas del rol global

`cohort_enrollments` relacionará `user` y `cohort` y guardará `status` (`active`/`completed`), `entryType` (`new`/`repeater`) y fechas. Habrá un índice único por usuario y cohorte. El rol global seguirá controlando privilegios generales; la inscripción controlará alcance de datos.

Se descarta un campo `cohort` directo en `users` porque impediría conservar historial y cursar más de una cohorte.

### 3. Admisiones previas separadas de usuarios autenticados

`student_admissions` almacenará `normalizedEmail`, `displayName`, `cohort`, `entryType`, `status` (`pending`/`claimed`/`cancelled`) y `claimedBy`. El correo se normalizará con `trim().toLowerCase()` y será único por cohorte mientras la admisión esté activa.

Para un correo que ya corresponde a un usuario, el administrador creará directamente la inscripción. Para un alumno nuevo se creará una admisión pendiente. Tras OAuth, el servidor buscará el usuario existente o una admisión pendiente por correo verificado, creará las inscripciones faltantes de forma idempotente y marcará la admisión como reclamada.

PocketBase puede crear el registro OAuth antes de que la aplicación determine la admisión. Por ello, el control de seguridad real no dependerá de borrar ese registro: una cuenta sin rol autorizado o sin inscripción activa cerrará sesión y las reglas de datos impedirán cualquier lectura. Esto evita una falsa garantía basada en limpieza cliente.

### 4. Rutas con contexto explícito y compatibilidad de enlaces existentes

Las nuevas superficies usarán un identificador de cohorte explícito en la URL, por ejemplo `/cohorts/{cohortId}/weeks` y `/cohorts/{cohortId}/dashboard`. Docentes y administradores tendrán selector de cohorte; un estudiante con varias inscripciones tendrá un selector limitado a las propias.

Las rutas actuales (`/sprints`, `/teams`, `/reviews`, etc.) seguirán resolviendo la cohorte heredada o redirigirán a su ruta contextual equivalente. Esto conserva marcadores y evita exigir cambios inmediatos a alumnos actuales.

Se descarta usar solo una cookie de “cohorte activa” porque crea URLs ambiguas, dificulta compartir enlaces y aumenta el riesgo de contaminar cachés entre cohortes.

### 5. Semanas como periodo nuevo; contenido reutilizado con padre exclusivo

`weeks` almacenará `cohort`, `number`, `title`, `description`, `startDate`, `endDate`, `publicationStatus` y `publishedAt`. El número será único dentro de la cohorte.

`classes` y `assignments` conservarán `sprint` y agregarán `week`, ambos opcionales en el esquema durante la transición, con validación de aplicación que exige exactamente uno. La cohorte se deriva del periodo padre para evitar duplicar una relación que podría quedar inconsistente. `links` y `deliveries` no cambian de padre: continúan ligados a clase/trabajo y trabajo/estudiante respectivamente.

Se descartan colecciones paralelas como `weekly_classes` o `weekly_assignments` porque duplicarían formularios, acciones, reglas y reportes.

### 6. Publicación manual y visibilidad

Una semana se crea en `draft`. Docentes y administradores de la cohorte pueden verla, editarla, publicarla y devolverla a borrador. Publicar establece `publishedAt`; las fechas son informativas. Los estudiantes solo pueden consultar semanas `published` de cohortes con inscripción activa.

Las clases, materiales y trabajos de una semana heredan su visibilidad: no se exponen si la semana está en borrador.

### 7. Alcance de módulos por modalidad

- `sprints_and_teams`: mantiene sprints, equipos/chat, consultas, revisiones, encuestas y tableros existentes.
- `weekly`: habilita semanas, clases, materiales, trabajos, entregas, consultas y tableros semanales; oculta y bloquea equipos, revisiones y encuestas.

La restricción se aplicará tanto en navegación como en acciones de servidor y reglas de PocketBase.

### 8. Consultas y analítica contextualizadas

`inquiries` incorporará `cohort` y `week` opcional. En contenido heredado, la cohorte se podrá derivar de clase/trabajo durante la migración, pero se persistirá explícitamente para filtrar consultas generales sin un contexto académico concreto.

El tablero semanal mostrará por alumno y semana la cobertura de entregas (`deliveredCount/totalAssignments`) y estados `complete`, `pending` o `empty`, además de agregados de consultas. No intentará aplicar las categorías fijas de cinco sprints a la cohorte semanal.

### 9. Caché y autorización incluyen cohorte

Toda consulta compartida que pueda variar por cohorte incluirá `cohortId` y el token de sesión en sus argumentos o clave. Las acciones validarán rol, inscripción y modalidad antes de mutar. Los identificadores recibidos del cliente se resolverán nuevamente en servidor para comprobar que pertenecen a la cohorte de la ruta.

### 10. Migración en fases

La migración será un comando explícito e idempotente, no un efecto secundario del arranque. Primero crea o localiza una cohorte heredada estable; luego asigna sprints, equipos y consultas existentes, crea inscripciones para estudiantes actuales y verifica que todos los registros derivados resuelvan una cohorte.

Los nuevos campos se mantendrán opcionales hasta completar backfill y verificación. No se borrarán campos ni colecciones anteriores en este cambio.

## Risks / Trade-offs

- **[OAuth crea un usuario desconocido antes del rechazo]** → denegar toda información sin inscripción activa, limpiar la sesión y mantener el registro huérfano sin privilegios para revisión administrativa.
- **[Datos existentes sin relación suficiente para inferir cohorte]** → asignarlos a la cohorte heredada por defecto y emitir un reporte detallado de migración.
- **[Contenido con sprint y semana simultáneos o sin padre]** → validación de servidor, auditoría de migración y pruebas de invariantes.
- **[Fuga de datos por filtros omitidos]** → helpers de consulta obligatorios por cohorte, reglas PocketBase y pruebas negativas entre dos cohortes.
- **[Caché compartida entre cohortes]** → incluir cohorte y sesión en claves y etiquetas de revalidación.
- **[Regresión en la cohorte actual]** → rutas de compatibilidad y suite E2E que recorra sprints, equipos, entregas, consultas, revisiones y encuestas antes y después de migrar.
- **[Complejidad de dos modalidades]** → centralizar capacidades por modalidad y reutilizar clases, trabajos, materiales y entregas.

## Migration Plan

1. Crear colecciones, campos, índices y reglas nuevas con relaciones existentes todavía opcionales.
2. Desplegar código compatible que pueda leer registros aún no migrados como pertenecientes a la cohorte heredada.
3. Ejecutar un dry-run que reporte conteos, correos duplicados y relaciones inválidas sin escribir.
4. Ejecutar el backfill idempotente: cohorte heredada, relaciones de sprints/equipos/consultas e inscripciones actuales.
5. Comparar conteos y validar que cada registro existente siga accesible por sus rutas actuales.
6. Habilitar creación de la cohorte semanal, admisiones, semanas y rutas contextuales.
7. Endurecer reglas de PocketBase para exigir inscripción y modalidad una vez verificado el backfill.

Rollback: volver a la versión anterior de la aplicación. Como el cambio no elimina ni renombra datos existentes y las relaciones nuevas son aditivas, los campos y colecciones nuevas pueden permanecer sin afectar el flujo heredado. Si fuera necesario, se revierten primero las reglas endurecidas; no se elimina el backfill.

## Open Questions

No quedan decisiones funcionales bloqueantes. El nombre, fechas y cantidad inicial de semanas de la nueva cohorte se definirán como datos administrativos al crearla.
