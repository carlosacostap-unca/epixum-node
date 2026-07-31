## Context

El OAuth actual permite cuentas de personal, alumnos ya matriculados o correos con una `student_admission` pendiente. Google puede crear un registro `users` sin rol antes de que la autorización interna lo rechace. Las solicitudes contienen datos personales sensibles y deben integrarse con ese comportamiento sin habilitar acceso por mera declaración pública.

## Goals / Non-Goals

**Goals:**

- Mantener la aprobación como operación explícita de docente o administrador.
- Preservar el ID y el historial de una cuenta existente cuando DNI y correo permitan una vinculación inequívoca.
- Hacer idempotentes la solicitud y su resolución.
- Mantener cerrada la colección de solicitudes y ejecutar todas las operaciones con comprobaciones de servidor.

**Non-Goals:**

- Fusionar automáticamente dos cuentas consolidadas con historial.
- Verificar documentalmente el DNI o la fecha de nacimiento.
- Enviar correo, WhatsApp o notificaciones externas.
- Incorporar CAPTCHA en esta iteración.

## Decisions

1. **Formulario público servido por la aplicación.** `/enrollment-request` obtiene solamente cohortes semanales activas mediante servidor y envía una acción validada. PocketBase no habilita reglas públicas para la colección.
2. **Datos separados de admisiones.** `enrollment_requests` conserva la petición y su auditoría (`pending`, `approved`, `rejected`). `student_admissions` continúa representando la autorización consumible por OAuth.
3. **Duplicados pendientes bloqueados.** Índices parciales por correo/cohorte y DNI/cohorte evitan solicitudes pendientes repetidas, además de la validación previa de la acción.
4. **Resolución por precedencia segura.** La aprobación busca usuarios por correo normalizado y por DNI normalizado. Una coincidencia única se reutiliza; ninguna coincidencia produce una admisión. Coincidencias incompatibles detienen la operación.
5. **Cuenta OAuth provisional.** Si el correo corresponde a un usuario sin rol y sin matrículas, esa cuenta puede completarse y matricularse. Si además el DNI identifica otra cuenta histórica, la resolución se detiene para no borrar ni fusionar automáticamente vínculos OAuth.
6. **Docentes con permiso acotado.** `requireStaff` protege bandeja y acciones. El personal sólo puede aprobar/rechazar solicitudes de cohortes semanales; no recibe permisos generales de administración de usuarios.
7. **Aprobación auditable.** La resolución guarda revisor, fecha, usuario vinculado o admisión creada y un resumen de la decisión.

## Risks / Trade-offs

- **[Spam sobre el formulario público]** Puede generar carga y PII innecesaria → validación estricta, campo trampa e idempotencia por correo/DNI; CAPTCHA queda como mejora futura.
- **[DNI declarado incorrectamente]** Puede sugerir otra identidad → el personal ve las coincidencias antes de aprobar y los conflictos bloquean la acción.
- **[Cuenta provisional y cuenta histórica distintas]** La fusión podría romper OAuth o historial → no se fusionan automáticamente; se requiere intervención administrativa.
- **[Fallo entre operaciones]** PocketBase no ofrece una transacción desde el SDK → las operaciones son idempotentes y la solicitud se marca aprobada al final.

## Migration Plan

1. Crear `enrollment_requests` con campos, índices y reglas cerradas.
2. Desplegar formulario público, bandeja y acciones.
3. Verificar solicitud, rechazo, aprobación por usuario existente y aprobación por admisión.
4. El rollback retira rutas y acciones, pero conserva solicitudes y auditoría para evitar pérdida de datos.
