## Why

Epixum actualmente trata a todos los usuarios y contenidos como una única cohorte basada en sprints y equipos, lo que impide incorporar una nueva cursada con reglas diferentes sin mezclar alumnos, entregas y métricas. Se necesita soportar cohortes coexistentes, preservar íntegramente la cursada actual y habilitar una nueva cohorte organizada por semanas.

## What Changes

- Incorporar cohortes con modalidad `sprints_and_teams` o `weekly`, manteniendo activa y editable la cohorte existente.
- Incorporar inscripciones muchos-a-muchos para que un alumno pueda conservar su historial y recursar en otra cohorte.
- Permitir al administrador registrar alumnos mediante nombre y correo, inscribir usuarios existentes y gestionar inscripciones activas o finalizadas.
- Restringir el acceso con Google a usuarios existentes o correos previamente registrados por un administrador.
- Migrar de forma aditiva los datos actuales hacia una cohorte inicial sin eliminar, renombrar ni perder registros o relaciones.
- Incorporar semanas editables con número, título, descripción, fechas y estado `draft`/`published`, publicadas manualmente por docentes.
- Permitir que clases y trabajos pertenezcan exactamente a un sprint o a una semana, reutilizando materiales y entregas existentes.
- Adaptar consultas académicas y tableros docentes al contexto de cohorte y semana.
- Mantener equipos, chat, turnos de revisión y encuestas en la cohorte actual, sin habilitarlos por ahora en la modalidad semanal.
- Incorporar selección de cohorte para docentes y administradores, y navegación contextual para estudiantes con una o más inscripciones.

## Capabilities

### New Capabilities

- `cohort-management`: Creación, modalidad, selección y aislamiento operativo de cohortes coexistentes.
- `cohort-enrollment`: Registro previo por administrador, inscripciones múltiples y vinculación segura durante el primer acceso con Google.
- `weekly-learning`: Gestión, publicación manual y consumo de semanas con clases, materiales, trabajos y entregas.

### Modified Capabilities

- `authentication-access`: El acceso con Google deja de ser abierto y exige usuario existente o registro previo, además de navegación según cohorte.
- `user-profiles-administration`: El administrador podrá registrar alumnos e inscribir usuarios nuevos o existentes en cohortes.
- `academic-content`: Sprints y contenido existente se aislarán por cohorte, mientras clases y trabajos podrán usar una semana como padre alternativo.
- `assignment-deliveries`: Entregas y progreso se resolverán dentro de la cohorte y podrán agregarse por semana.
- `team-collaboration`: Equipos y chat quedarán asociados y visibles únicamente en cohortes de modalidad `sprints_and_teams`.
- `inquiries`: Las consultas se aislarán por cohorte y podrán contextualizarse en una semana.
- `student-surveys`: Las encuestas continuarán disponibles solo para la modalidad existente basada en sprints.
- `review-scheduling`: Los turnos continuarán disponibles solo para la modalidad existente basada en sprints.
- `teaching-analytics`: Los tableros se filtrarán por cohorte y la modalidad semanal tendrá indicadores agregados por semana.
- `platform-data`: Se amplía el modelo PocketBase, las reglas de acceso, las claves de caché y la migración de datos para soportar cohortes y semanas.

## Impact

- **PocketBase:** nuevas colecciones `cohorts`, `cohort_enrollments`, `student_admissions` y `weeks`; relaciones opcionales/aditivas en colecciones existentes; índices únicos y reglas de acceso por inscripción.
- **Autenticación:** validación posterior a OAuth contra usuarios e invitaciones permitidas; rechazo y cierre de sesión para correos desconocidos.
- **Aplicación:** nuevas rutas y componentes para cohortes, inscripciones y semanas; adaptación de navegación, formularios académicos, consultas y tableros.
- **Datos existentes:** migración idempotente hacia una cohorte inicial, con verificación de conteos y relaciones antes y después.
- **Compatibilidad:** la experiencia actual basada en sprints, equipos, revisiones y encuestas debe seguir funcionando y siendo editable sin pérdida de datos.
- **Pruebas:** cobertura de migración, aislamiento entre cohortes, acceso por invitación, publicación de semanas y regresión completa de la cohorte existente.
