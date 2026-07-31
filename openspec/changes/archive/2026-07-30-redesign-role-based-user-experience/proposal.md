## Why

Epixum creció desde una experiencia histórica basada en sprints y equipos hacia una plataforma multi-cohorte que también soporta cursadas semanales. La interfaz actual expone ambas arquitecturas a la vez, distribuye las acciones frecuentes entre múltiples entradas y carece de un sistema visual y de navegación consistente para estudiantes, docentes y administradores.

## What Changes

- Introducir un shell de aplicación común, responsive y consciente del rol, con navegación principal, contexto permanente de cohorte, indicador de ubicación y acceso unificado al perfil.
- Reemplazar los inicios basados en catálogos de tarjetas por tableros orientados a tareas para estudiante, docente y administrador.
- Consolidar la navegación histórica y la navegación por cohortes en recorridos canónicos que preserven el contexto académico.
- Estandarizar encabezados, acciones, formularios, tablas, estados, filtros, vacíos, carga, error, confirmaciones y notificaciones mediante un sistema compartido de componentes y tokens.
- Rediseñar las vistas de contenido académico para separar lectura, creación y edición, y para priorizar progreso y próximas acciones.
- Rediseñar entregas, consultas, equipos, revisiones y encuestas alrededor de las tareas principales de cada rol.
- Convertir tableros docentes y pantallas administrativas en superficies explorables con filtros, resumen accionable y alternativas legibles en dispositivos móviles.
- Incorporar requisitos transversales de accesibilidad, navegación por teclado, foco visible, semántica de estado, contraste y preferencia explícita de tema.
- Mantener las reglas de permisos, modelos de PocketBase y comportamientos académicos existentes; el cambio reorganiza y mejora su presentación e interacción.

## Capabilities

### New Capabilities

- `role-based-application-shell`: Navegación, contexto de cohorte, inicio y acciones globales adaptadas a estudiante, docente y administrador.
- `accessible-responsive-interface`: Comportamiento transversal responsive, accesible y consistente de componentes, estados y feedback de interacción.

### Modified Capabilities

- `authentication-access`: Actualizar la experiencia de ingreso, salida y navegación por identidad para integrarla con el nuevo shell.
- `academic-content`: Reorganizar los listados y detalles de semanas, sprints, clases, recursos y trabajos en recorridos orientados a lectura y gestión.
- `assignment-deliveries`: Hacer visible el estado y la próxima acción de entrega para el estudiante y ofrecer una vista docente resumida y filtrable.
- `inquiries`: Transformar consultas en una bandeja filtrable y conversaciones con estado y resolución explícitos.
- `review-scheduling`: Presentar disponibilidad y reservas como agenda y separar claramente reserva, detalle y retroalimentación.
- `student-surveys`: Convertir encuestas extensas en un flujo guiado con progreso, validación y revisión previa al envío.
- `teaching-analytics`: Añadir filtros, navegación desde métricas a segmentos y presentaciones adaptadas a escritorio y móvil.
- `team-collaboration`: Unificar consulta y organización de equipos y priorizar la experiencia de colaboración del estudiante.
- `user-profiles-administration`: Reorganizar perfil y administración de usuarios con secciones, búsqueda, filtros y acciones contextualizadas.

## Impact

- Afecta el layout raíz, el encabezado, la navegación de cohortes y la mayoría de las rutas en `app/` y componentes en `components/`.
- Introduce una capa de componentes visuales compartidos y tokens en los estilos globales; puede requerir una librería de iconos, pero no un framework UI completo.
- Conserva Next.js App Router, React, TypeScript, Tailwind CSS y PocketBase, sin migraciones de datos previstas.
- Las rutas históricas podrán mantenerse temporalmente como redirecciones o adaptadores durante la migración para evitar enlaces rotos.
- Requiere pruebas de componentes, flujos por rol, accesibilidad, responsive y regresión visual.
