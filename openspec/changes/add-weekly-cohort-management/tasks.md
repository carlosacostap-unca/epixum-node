## 1. Esquema y tipos de dominio

- [x] 1.1 Definir en PocketBase las colecciones `cohorts`, `cohort_enrollments`, `student_admissions` y `weeks` con campos, relaciones, estados e índices únicos especificados.
- [x] 1.2 Agregar relaciones aditivas de cohorte a `sprints`, `teams` e `inquiries`, y relaciones opcionales `week` a `classes`, `assignments` e `inquiries`.
- [x] 1.3 Documentar y automatizar las reglas iniciales permisivas de transición necesarias para ejecutar el backfill sin interrumpir la cohorte existente.
- [x] 1.4 Incorporar tipos TypeScript para cohortes, inscripciones, admisiones y semanas, y actualizar los tipos académicos con sus nuevas relaciones opcionales.
- [x] 1.5 Implementar validadores compartidos para modalidad de cohorte, correo normalizado y padre académico exclusivo sprint/semana.

## 2. Migración segura de la cohorte existente

- [x] 2.1 Implementar un comando de migración con modos `dry-run` y `apply`, configuración explícita del identificador estable de la cohorte heredada y salida estructurada.
- [x] 2.2 Hacer que el dry-run reporte conteos, correos duplicados, recursos huérfanos y relaciones que no permitan resolver una cohorte.
- [x] 2.3 Implementar el backfill idempotente de la cohorte heredada y las relaciones de sprints, equipos y consultas existentes.
- [x] 2.4 Crear inscripciones de la cohorte heredada para los estudiantes actuales sin duplicarlas y conservar todos los usuarios existentes.
- [x] 2.5 Implementar verificación posterior que compare conteos, valide relaciones derivadas y falle si algún dato anterior deja de resolver su cohorte.
- [x] 2.6 Añadir pruebas automatizadas de primera ejecución, reejecución y datos parcialmente migrados.

## 3. Autorización, admisiones e inscripciones

- [x] 3.1 Implementar helpers de servidor que resuelvan cohortes accesibles y validen rol, inscripción, estado y modalidad para cada solicitud.
- [x] 3.2 Implementar acciones administrativas para registrar nombre/correo/cohorte, crear admisiones pendientes y detectar usuarios existentes por correo normalizado.
- [x] 3.3 Implementar alta, reactivación y finalización idempotente de inscripciones, incluida la condición `new` o `repeater`.
- [x] 3.4 Adaptar el flujo OAuth de Google para reclamar admisiones pendientes y crear las inscripciones faltantes sin duplicados.
- [x] 3.5 Rechazar cuentas no registradas limpiando la sesión, mostrando el mensaje de contacto administrativo y evitando toda lectura académica.
- [x] 3.6 Actualizar la administración de usuarios para listar y filtrar usuarios, admisiones e inscripciones por cohorte y estado.
- [x] 3.7 Añadir pruebas de correo normalizado, admisión duplicada, recursante, reclamación parcial/reintentada y acceso Google desconocido.

## 4. Contexto y navegación por cohorte

- [x] 4.1 Crear páginas administrativas para alta y edición de cohortes, impidiendo cambiar modalidad cuando ya existe contenido.
- [x] 4.2 Incorporar rutas contextuales `/cohorts/[cohortId]/...` y un layout que cargue, autorice y exponga la cohorte una sola vez por solicitud.
- [x] 4.3 Añadir selector de cohorte para docentes/administradores y para estudiantes con múltiples inscripciones accesibles.
- [x] 4.4 Adaptar inicio y encabezado para mostrar navegación según rol, inscripción y modalidad.
- [x] 4.5 Mantener las rutas heredadas mediante resolución o redirección hacia la cohorte `sprints_and_teams`, conservando parámetros y destinos.
- [x] 4.6 Incluir `cohortId` y token en cachés, etiquetas y revalidaciones afectadas, con una prueba que descarte contaminación entre cohortes.

## 5. Gestión y publicación de semanas

- [x] 5.1 Implementar consultas y acciones de creación, edición y eliminación de semanas con número único dentro de la cohorte.
- [x] 5.2 Crear listado y detalle docente de semanas que distinga `draft` y `published` y muestre fechas como información.
- [x] 5.3 Implementar acciones explícitas de publicar y volver a borrador, registrando `publishedAt` sin automatización por fecha.
- [x] 5.4 Crear la vista estudiantil que liste únicamente semanas publicadas y deniegue acceso directo a borradores.
- [x] 5.5 Permitir historial de semanas publicadas para inscripciones finalizadas, bloqueando nuevas entregas.
- [x] 5.6 Añadir pruebas de publicación manual, despublicación, número duplicado y visibilidad por estado e inscripción.

## 6. Contenido y entregas semanales

- [x] 6.1 Adaptar consultas, formularios y acciones de clases para aceptar exactamente un padre `sprint` o `week` y comprobar su cohorte.
- [x] 6.2 Adaptar consultas, editor enriquecido, formularios y acciones de trabajos prácticos con la misma invariante de padre exclusivo.
- [x] 6.3 Reutilizar la gestión de materiales para clases y trabajos semanales y heredar la visibilidad de la semana.
- [x] 6.4 Adaptar las entregas para validar inscripción activa, cohorte del trabajo y publicación de la semana antes de crear o actualizar.
- [x] 6.5 Crear la matriz docente de entregas por semana usando únicamente alumnos activos y trabajos de la cohorte seleccionada.
- [x] 6.6 Añadir pruebas negativas para contenido con dos padres, contenido sin padre, trabajo de otra cohorte y entrega sobre borrador.
- [x] 6.7 Ejecutar pruebas de regresión de creación, edición y entrega dentro de sprints de la cohorte heredada.

## 7. Consultas y tableros semanales

- [x] 7.1 Persistir la cohorte en todas las consultas y permitir contexto opcional compatible de semana, clase o trabajo.
- [x] 7.2 Adaptar listados, búsqueda, detalle, respuestas y moderación para aplicar aislamiento por cohorte.
- [x] 7.3 Incorporar creación y navegación de consultas desde semanas y su contenido.
- [x] 7.4 Implementar el tablero semanal por alumno con conteos de entregas y estados `complete`, `pending` y `empty`.
- [x] 7.5 Agregar al tablero indicadores de consultas pendientes/resueltas por semana y un segmento general de cohorte.
- [x] 7.6 Añadir pruebas de búsqueda aislada, contexto incompatible, progreso semanal y alumno recursante visible por separado en cada cohorte.

## 8. Restricciones por modalidad y compatibilidad

- [x] 8.1 Asociar equipos existentes con la cohorte heredada y filtrar gestión, membresía y chat por cohorte.
- [x] 8.2 Ocultar equipos, revisiones y encuestas en navegación semanal y rechazar también sus acciones directas de servidor.
- [x] 8.3 Mantener operativos y editables equipos/chat, revisiones y encuestas dentro de la cohorte heredada.
- [x] 8.4 Endurecer las reglas PocketBase después del backfill para exigir inscripción, cohorte, modalidad y publicación según cada colección.
- [x] 8.5 Añadir pruebas E2E de aislamiento con dos cohortes y de acceso denegado a módulos incompatibles.
- [x] 8.6 Ejecutar una suite E2E de regresión de la cohorte actual: sprints, equipos, clases, TPs, entregas, consultas, revisiones, encuestas y tableros.

## 9. Operación y documentación

- [x] 9.1 Actualizar `README_SCHEMA.md` con las colecciones, campos, índices y reglas definitivas de cohortes y semanas.
- [x] 9.2 Documentar el procedimiento de dry-run, backfill, verificación, endurecimiento de reglas y rollback de aplicación.
- [x] 9.3 Documentar el alta administrativa de alumnos nuevos, recursantes y el mensaje de acceso rechazado.
- [x] 9.4 Ejecutar lint, build, pruebas unitarias, integración y E2E; corregir cualquier regresión antes de habilitar la nueva cohorte.
