## Why

La administración de una cohorte mezcla actualmente su configuración con el alta de alumnos, y no ofrece un camino claro para distinguir entre estudiantes ya registrados que recursan y estudiantes nuevos. Una pantalla dedicada de matriculación hará ambos casos explícitos y reducirá errores administrativos.

## What Changes

- Agregar un botón **Matricular estudiantes** en el detalle administrativo de cada cohorte.
- Incorporar una pantalla de matriculación propia de la cohorte con dos flujos: seleccionar un estudiante registrado o registrar nombre y correo de un estudiante nuevo.
- Permitir marcar al estudiante registrado como recursante al crear o reactivar su matrícula.
- Mostrar en la misma pantalla las matrículas y admisiones pendientes de la cohorte para dar contexto y evitar duplicados.
- Permitir matricular de forma masiva a todos los usuarios estudiantes todavía no asociados a la cohorte.
- Incorporar búsqueda y filtros sobre el listado completo de matrículas, con una acción para desmatricular preservando el historial.
- Permitir importar desde CSV admisiones nuevas usando únicamente nombre completo, correo, DNI, fecha de nacimiento y teléfono.
- Conservar los datos personales opcionales en la admisión y transferirlos al perfil cuando el alumno reclame su acceso mediante Google.
- Mantener sin cambios los datos, reglas y edición de las cohortes existentes.

## Capabilities

### New Capabilities

- `cohort-enrollment-workflow`: Navegación y flujo administrativo dedicado para matricular estudiantes registrados o admitir estudiantes nuevos en una cohorte.

### Modified Capabilities

- `user-profiles-administration`: El administrador puede buscar estudiantes registrados y matricularlos directamente desde el contexto de una cohorte.

## Impact

- Rutas administrativas de cohortes en `app/admin/cohorts`.
- Acciones de servidor y componentes de matriculación en `lib/cohorts` y `components/cohorts`.
- Consultas existentes a `users`, `cohort_enrollments` y `student_admissions` en PocketBase.
- Migración aditiva de `student_admissions` para DNI, fecha de nacimiento y teléfono opcionales.
