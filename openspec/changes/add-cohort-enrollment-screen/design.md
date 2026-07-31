## Context

El detalle administrativo de cohorte contiene hoy configuración, formulario de admisión y listados. La acción existente identifica por correo si el alumno ya tiene usuario, pero la interfaz no permite elegirlo de forma visible ni separa el caso recursante. PocketBase ya dispone de `users`, `cohort_enrollments` y `student_admissions`, por lo que el cambio es de flujo y no de modelo.

## Goals / Non-Goals

**Goals:**

- Dar a cada cohorte una pantalla dedicada de matriculación.
- Separar claramente la matrícula de un usuario existente del alta de un alumno nuevo.
- Evitar matrículas activas duplicadas y conservar la trazabilidad de recursantes.
- Mantener visible el estado actual de matrículas y admisiones.

**Non-Goals:**

- Crear cuentas o contraseñas para alumnos nuevos antes de su primer acceso con Google.
- Cambiar las reglas de visibilidad de cohortes o crear cuentas antes del acceso con Google.
- Eliminar o migrar registros históricos de la cohorte original.

## Decisions

1. **Ruta anidada por cohorte.** La pantalla vivirá en `/admin/cohorts/[cohortId]/enrollments`; así el identificador de cohorte queda fijado por la navegación y no se expone un selector propenso a errores. Se descartó mantener solamente el formulario embebido porque mezcla responsabilidades y no escala al listado de usuarios registrados.
2. **Selección de usuario por identificador.** El servidor recibirá `userId`, validará que corresponde a un estudiante y creará o reactivará su matrícula. La búsqueda por nombre/correo se realiza en la interfaz sobre usuarios cargados por el servidor. Se evita usar el correo como identidad mutable para este flujo.
3. **Admisión diferida para alumnos nuevos.** Nombre y correo continúan creando `student_admissions`; la cuenta real se vincula cuando el alumno ingresa con Google, preservando el mecanismo existente.
4. **Reutilización de colecciones y estados.** La pantalla consulta las mismas matrículas y admisiones que el detalle actual. No se introducen colecciones ni dependencias nuevas.
5. **Baja lógica.** Desmatricular cambia `cohort_enrollments.status` a `completed` y completa `completedAt`; no elimina el registro. Esto retira el acceso basado en matrícula activa sin destruir trazabilidad ni contenido académico.
6. **Alta masiva idempotente.** La acción masiva crea registros solamente para estudiantes que no tienen ninguna matrícula en la cohorte. Los activos y los previamente desmatriculados se omiten para que una repetición no deshaga decisiones manuales.
7. **Datos personales diferidos.** `student_admissions` incorpora `dni`, `birthDate` y `phone` opcionales. Junto con `displayName` y `normalizedEmail`, son los únicos datos leídos del CSV y se copian al usuario durante el reclamo OAuth.
8. **Importador auditable e idempotente.** Un script usa `@oai/artifact-tool` para leer el CSV, valida encabezados y filas, ofrece simulación por defecto y requiere `--apply` para escribir. Omite usuarios y admisiones ya existentes por correo normalizado.

## Risks / Trade-offs

- **[Lista de usuarios grande]** La búsqueda inicial se hace en cliente sobre el listado administrativo completo → mantener el componente preparado para reemplazarla por búsqueda paginada si el volumen crece.
- **[Operaciones concurrentes]** Dos administradores podrían intentar matricular al mismo alumno → la acción reutiliza la matrícula existente y la reactiva en lugar de crear duplicados.
- **[Alumno con rol no estudiante]** Un usuario administrativo podría seleccionarse por error → filtrar en interfaz y volver a validar el rol en servidor.
- **[Alta masiva accidental]** La acción afecta a todos los estudiantes registrados → exigir confirmación explícita y mostrar el resultado agregado.

## Migration Plan

El despliegue agrega tres campos opcionales a `student_admissions` mediante el migrador idempotente antes de ejecutar la importación. El rollback de código conserva los campos y registros para evitar pérdida de información.

## Open Questions

Ninguna para esta iteración.
