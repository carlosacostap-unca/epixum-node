## 1. Acciones de matriculación

- [x] 1.1 Agregar una acción administrativa para matricular o reactivar un usuario estudiante existente por identificador
- [x] 1.2 Asegurar validaciones, mensajes de resultado e invalidación de las vistas de cohorte

## 2. Interfaz administrativa

- [x] 2.1 Agregar el botón `Matricular estudiantes` al detalle de cohorte y retirar el formulario de alta embebido
- [x] 2.2 Crear la pantalla anidada de matriculación con búsqueda de estudiantes registrados y formulario de alumno nuevo
- [x] 2.3 Mostrar en la pantalla el estado actual de matrículas y admisiones pendientes de la cohorte

## 3. Verificación

- [x] 3.1 Agregar cobertura automatizada para el acceso y las reglas principales del flujo
- [x] 3.2 Ejecutar validación OpenSpec, pruebas y build de producción

## 4. Administración masiva y bajas

- [x] 4.1 Implementar matriculación masiva idempotente de todos los usuarios estudiantes
- [x] 4.2 Añadir confirmación de matriculación masiva y mensajes con cantidades procesadas
- [x] 4.3 Convertir la finalización administrativa en una opción explícita de desmatriculación con historial
- [x] 4.4 Añadir búsqueda y filtro de estado al listado completo de matrículas

## 5. Datos y verificación ampliada

- [x] 5.1 Matricular efectivamente en la cohorte semanal a los estudiantes registrados que aún no tengan matrícula
- [x] 5.2 Validar OpenSpec, pruebas, build y rutas administrativas después de la ampliación

## 6. Importación CSV de alumnos nuevos

- [x] 6.1 Añadir DNI, fecha de nacimiento y teléfono opcionales al esquema y tipos de admisiones
- [x] 6.2 Transferir los cinco campos importados al perfil durante el reclamo mediante Google
- [x] 6.3 Implementar un importador CSV idempotente limitado a los cinco campos solicitados
- [x] 6.4 Agregar cobertura para validación, normalización y traspaso de datos personales

## 7. Migración e importación

- [x] 7.1 Aplicar la migración aditiva e importar las 54 admisiones nuevas en la cohorte semanal
- [x] 7.2 Verificar conteos y campos, ejecutar pruebas, build y validación OpenSpec
