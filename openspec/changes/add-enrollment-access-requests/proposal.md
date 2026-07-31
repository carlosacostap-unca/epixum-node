## Why

Alumnos nuevos, recursantes o personas que cambiaron su correo de Google pueden quedar fuera aunque tengan derecho a cursar. Necesitan un canal público y seguro para solicitar acceso, y el personal docente necesita revisar la identidad antes de habilitar la matrícula.

## What Changes

- Agregar desde el login una solicitud pública de matriculación para cohortes semanales activas.
- Solicitar nombre, apellido, DNI, fecha de nacimiento, correo actual de Google y teléfono.
- Guardar las solicitudes y sus datos personales en una colección sin acceso directo desde clientes.
- Ofrecer a docentes y administradores una bandeja de solicitudes pendientes, aprobadas y rechazadas.
- Al aprobar, reutilizar una cuenta compatible por correo o DNI para preservar historial; si todavía no existe, crear una admisión que se reclamará en el siguiente acceso con Google.
- Matricular o reactivar al alumno en la cohorte solicitada después de validar su identidad.
- Rechazar conflictos de identidad o correo para revisión administrativa en vez de fusionar cuentas ambiguas automáticamente.

## Capabilities

### New Capabilities

- `enrollment-access-requests`: Solicitud pública, revisión docente y resolución segura de acceso y matriculación.

### Modified Capabilities

- `authentication-access`: Expone una salida desde el login bloqueado y permite el acceso posterior de solicitudes aprobadas.

## Impact

- Nueva ruta pública bajo `app/enrollment-request` y modificación del proxy de rutas.
- Nueva bandeja de personal bajo `app/staff/enrollment-requests` y navegación en el encabezado.
- Nuevas acciones y reglas de resolución en `lib/cohorts`.
- Nueva colección PocketBase `enrollment_requests` y migración idempotente.
- Integración con `users`, `student_admissions` y `cohort_enrollments` sin acceso público directo a datos personales.
