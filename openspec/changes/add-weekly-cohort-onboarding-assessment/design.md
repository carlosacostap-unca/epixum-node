## Context

La cohorte semanal ya restringe contenido y tableros por matrícula activa, pero su página raíz funciona como navegación académica y no existe un onboarding ni una evaluación diagnóstica. PocketBase sigue siendo la fuente de verdad y las operaciones sensibles se realizan mediante acciones de servidor.

## Goals / Non-Goals

**Goals:**

- Interceptar la entrada estudiantil a una cohorte semanal con una bienvenida útil sin alterar la experiencia docente.
- Mantener las respuestas correctas y el cálculo del puntaje exclusivamente en servidor.
- Persistir múltiples intentos diagnósticos, auditables y consultables por docentes.

**Non-Goals:**

- Administrar preguntas desde la interfaz en esta iteración.
- Configurar un grupo real de WhatsApp o verificar que el alumno se haya unido.
- Incorporar temporizador, certificados, aprobación/reprobación o un límite de intentos.
- Habilitar este flujo en la cohorte histórica basada en sprints.

## Decisions

1. **Redirección por rol desde la cohorte.** Al abrir la raíz de una cohorte semanal, un estudiante activo será enviado a `/cohorts/[cohortId]/welcome`; docentes y administradores conservarán el centro de gestión existente. La ruta de bienvenida también ofrecerá continuar al contenido semanal.
2. **Invitación simulada centralizada.** Una constante de configuración proveerá una URL HTTPS simulada por cohorte. El QR se generará localmente en servidor con una dependencia de QR y se incrustará como imagen; no se enviarán datos a terceros.
3. **Banco de preguntas versionado en código.** Las 10 preguntas simuladas pertenecerán a `js-basics-v1`. El cliente recibirá identificadores, enunciados y opciones, pero nunca las respuestas correctas.
4. **Evaluación y puntaje en servidor.** La acción valida matrícula activa, modalidad semanal, versión, diez respuestas y opciones válidas. Luego calcula el puntaje contra el banco privado y crea el resultado mediante cliente administrativo.
5. **Historial inmutable de intentos.** Cada envío válido crea un nuevo registro con fecha propia. No se actualizan ni eliminan resultados anteriores y no se impone un límite de intentos.
6. **Reporte docente separado.** `/cohorts/[cohortId]/assessment-report` agrupa resultados por estudiante y muestra cantidad de intentos, peor nota, mejor nota y el detalle de cada intento; sólo docentes y administradores pueden acceder.
7. **Colección administrada por servidor.** `javascript_assessment_results` no admite acceso directo de clientes. Las rutas y acciones aplican las comprobaciones de rol y cohorte antes de leer o escribir.

## Risks / Trade-offs

- **[Preguntas visibles en el bundle]** Los enunciados y opciones se muestran al alumno → las respuestas correctas permanecen sólo en el módulo de servidor.
- **[URL simulada no funcional]** El enlace no incorpora realmente al grupo → etiquetarlo claramente como demostración y centralizarlo para reemplazo posterior.
- **[Intentos incompletos]** Un envío incompleto no debe persistirse → exigir las 10 respuestas válidas antes de crear cada registro.
- **[Resultados identificables]** El reporte contiene datos académicos personales → restringirlo a docentes y administradores de la cohorte.

## Migration Plan

1. Crear de forma idempotente `javascript_assessment_results` con campos y reglas cerradas; retirar el índice único anterior para habilitar múltiples intentos.
2. Desplegar rutas, acciones y dependencia QR.
3. Verificar acceso de estudiante y docente con la colección vacía.
4. El rollback retira rutas y acciones; la colección se conserva para no perder resultados ya enviados.
