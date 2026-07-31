## Why

Los estudiantes de la nueva cohorte semanal necesitan una entrada clara al curso, un canal de comunicación inmediato y un diagnóstico inicial de conocimientos. Los docentes también necesitan resultados persistidos para conocer el punto de partida del grupo y adaptar la enseñanza.

## What Changes

- Mostrar a cada estudiante con matrícula activa una bienvenida específica de la cohorte semanal.
- Incluir una invitación simulada a un grupo de WhatsApp mediante enlace y código QR escaneable.
- Ofrecer un test diagnóstico simulado de JavaScript con 10 preguntas de opción múltiple.
- Guardar en PocketBase las respuestas, el puntaje y la fecha de realización de cada estudiante.
- Permitir múltiples intentos diagnósticos por estudiante y cohorte, conservando el historial completo.
- Añadir un reporte docente con participación, cantidad de intentos, mejor nota, peor nota y respuestas por estudiante.
- Mantener este flujo fuera de la cohorte histórica basada en sprints.

## Capabilities

### New Capabilities

- `weekly-cohort-onboarding`: Bienvenida del alumno matriculado e invitación al grupo de WhatsApp con enlace y QR.
- `javascript-diagnostic-assessment`: Test diagnóstico de JavaScript persistido y reporte de resultados para docentes.

### Modified Capabilities


## Impact

- Nuevas rutas estudiantiles y docentes bajo `app/cohorts/[cohortId]`.
- Nuevos componentes y lógica de evaluación en `components/cohorts` y `lib/cohorts`.
- Nueva colección PocketBase para intentos diagnósticos, con migración idempotente.
- Nueva dependencia local para generar códigos QR; no se depende de servicios externos de QR.
