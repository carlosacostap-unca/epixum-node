## Why

Las semanas de las cohortes semanales hoy permiten organizar clases y trabajos, pero no ofrecen un recorrido editorial propio que el equipo docente pueda preparar, previsualizar, publicar y seguir dentro de Epixum. El prototipo de la semana 1 aporta catorce secciones pedagógicas reutilizables que deben convertirse en contenido nativo, editable y medible sin depender de páginas HTML aisladas ni de progreso almacenado solamente en el navegador.

## What Changes

- Incorporar una pestaña de contenidos en cada semana, con secciones ordenables y estados `draft`, `scheduled`, `published` y `hidden`.
- Presentar cada sección en una página de lectura responsive dentro del shell de Epixum, con progreso, posición y navegación anterior/siguiente que omita contenido no disponible.
- Proveer un editor docente por bloques para texto enriquecido, destacados, tarjetas, pasos, imágenes, videos, código copiable, enlaces, contenido embebido, glosarios, preguntas, listas de auto-comprobación, validadores y generadores configurables.
- Permitir vista previa como alumno y aplicar inmediatamente los cambios guardados sobre secciones ya publicadas.
- Registrar aperturas, avance por bloques, intentos ilimitados, respuestas y dominio por actividad; completar una sección con actividades sólo cuando todas hayan sido resueltas correctamente al menos una vez, y una sección sin actividades al alcanzar su último bloque.
- Incorporar tableros docentes navegables por alumno y por sección, con visualizaciones, finalización, intentos y aciertos.
- Crear bases versionadas de curso, semana y sección; copiar su contenido a cada cohorte para permitir personalización independiente y reservar a administradores la promoción o restauración de versiones base.
- Importar como borradores las catorce secciones aplicables de `docs/contenidos/semana-01`, excluyendo `02-diagnostico-javascript` porque el diagnóstico de la cohorte ya existe como módulo independiente.
- Reemplazar la persistencia local del prototipo por datos autorizados y trazables en PocketBase, conservando únicamente estado efímero o borradores de interfaz cuando corresponda.

## Capabilities

### New Capabilities

- `weekly-content-authoring`: Gestión docente de secciones, estados, programación, orden, editor por bloques, medios y vista previa como alumno.
- `content-template-versioning`: Bases versionadas de curso, semana y sección, copias independientes por cohorte, promoción administrativa, historial y restauración.
- `section-learning-progress`: Lectura secuencial, navegación disponible, trazabilidad, intentos ilimitados, dominio de actividades y reglas de finalización por sección.

### Modified Capabilities

- `academic-content`: Las semanas incorporan un recorrido de secciones publicables además de clases, trabajos y consultas, con disponibilidad determinada por cohorte, semana, estado y programación.
- `teaching-analytics`: Los tableros docentes incorporan métricas y detalle de visualización, finalización, intentos y aciertos por alumno y por sección.

## Impact

- Nuevas rutas y componentes para gestión, edición, previsualización y lectura de contenidos semanales dentro de `app/cohorts` y `components/cohorts`.
- Extensión del detalle y navegación académica existentes, manteniendo el shell, temas, permisos y patrones responsive de Epixum.
- Nuevas colecciones, reglas, índices, tipos, acciones y scripts de migración de PocketBase para secciones, bloques, actividades, intentos, progreso, eventos, medios y versiones base.
- Reutilización y ampliación de Tiptap, `dnd-kit`, componentes UI y patrones de evaluación del lado servidor ya presentes; no se requiere un segundo motor de diagnóstico.
- Migración controlada de contenido y medios desde `docs/contenidos/semana-01`, sin modificar ni ejecutar el JavaScript del prototipo como contenido de producción.
- Nuevas pruebas unitarias, de componentes, accesibilidad, permisos, esquema y flujos E2E para docente, administrador y estudiante.
