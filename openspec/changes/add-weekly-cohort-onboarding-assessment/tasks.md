## 1. Modelo y evaluación

- [x] 1.1 Definir la colección PocketBase de resultados diagnósticos y su migración idempotente
- [x] 1.2 Crear el banco versionado de 10 preguntas y las funciones puras de validación, puntaje y métricas
- [x] 1.3 Implementar la acción segura de entrega para estudiantes con matrícula activa

## 2. Bienvenida estudiantil

- [x] 2.1 Agregar generación local de QR y configuración del enlace simulado de WhatsApp
- [x] 2.2 Crear la pantalla de bienvenida con enlace, QR y accesos al test y al contenido semanal
- [x] 2.3 Redirigir a estudiantes de cohortes semanales desde la raíz sin alterar la cohorte histórica ni el acceso docente

## 3. Test y reporte

- [x] 3.1 Crear la interfaz estudiantil del test de 10 preguntas y su estado completado
- [x] 3.2 Crear el reporte docente con participación, promedio, resultados y respuestas individuales
- [x] 3.3 Añadir navegación docente hacia el reporte desde el centro de la cohorte semanal

## 4. Verificación

- [x] 4.1 Agregar pruebas de puntaje, validación, métricas y control de acceso
- [x] 4.2 Aplicar la migración y verificar OpenSpec, lint, pruebas, build y rutas autenticadas

## 5. Múltiples intentos

- [x] 5.1 Retirar de forma idempotente la restricción única de resultados por alumno, cohorte y versión
- [x] 5.2 Guardar cada entrega válida como un nuevo intento y mostrar el historial al estudiante
- [x] 5.3 Agrupar el reporte docente por alumno con cantidad de intentos, peor nota y mejor nota
- [x] 5.4 Agregar pruebas de agregación y verificar migración, OpenSpec, lint, build y rutas autenticadas
