## 1. Datos y reglas de dominio

- [x] 1.1 Definir la colección privada `enrollment_requests`, sus índices y una migración idempotente
- [x] 1.2 Implementar validación, normalización, detección de duplicados y planificación segura de coincidencias
- [x] 1.3 Implementar acciones públicas y de personal para crear, aprobar y rechazar solicitudes

## 2. Experiencia de solicitud

- [x] 2.1 Habilitar `/enrollment-request` como ruta pública y crear el formulario con todos los datos requeridos
- [x] 2.2 Añadir accesos visibles desde el login y desde el error de autorización de Google

## 3. Revisión docente

- [x] 3.1 Crear la bandeja de solicitudes con filtros, coincidencias de identidad y auditoría
- [x] 3.2 Añadir controles de aprobación y rechazo y navegación para docentes y administradores

## 4. Verificación

- [x] 4.1 Agregar pruebas de validación, duplicados, resolución por correo/DNI, conflictos y autorización
- [x] 4.2 Aplicar la migración y verificar OpenSpec, lint, pruebas, build y rutas públicas/autenticadas
