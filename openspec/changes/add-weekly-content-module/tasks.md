## 1. Dominio de contenido estructurado

- [x] 1.1 Definir tipos TypeScript y esquemas Zod discriminados para secciones, estados, revisiones, bloques editoriales, medios, preguntas, auto-comprobaciones, validadores y generadores
- [x] 1.2 Implementar validación y normalización de bloques, URLs, proveedores embebidos, opciones y claves estables de actividad
- [x] 1.3 Implementar la política compartida de disponibilidad efectiva por matrícula, cohorte, semana, estado y fecha programada, con fechas almacenadas en UTC
- [x] 1.4 Implementar revisiones editoriales inmutables, cálculo de `requirementsRevision` y detección de cambios que invalidan finalización
- [x] 1.5 Implementar proyecciones públicas que eliminen respuestas correctas y configuración privada antes de entregar contenido al alumno
- [x] 1.6 Añadir pruebas unitarias para esquemas, disponibilidad, programación, revisiones, sanitización y proyecciones públicas

## 2. Esquema y seguridad de PocketBase

- [x] 2.1 Crear la definición idempotente de `content_sections` y `content_section_revisions` con relaciones, estados, posiciones, revisiones e índices necesarios
- [x] 2.2 Crear las definiciones idempotentes de `content_activity_attempts` y `content_section_progress` con unicidad e idempotencia por estudiante y contexto
- [x] 2.3 Crear las definiciones idempotentes de `content_assets`, `content_bases` y `content_base_versions` con linaje e historial inmutable
- [x] 2.4 Implementar reglas de lectura y escritura para aislar respuestas correctas, intentos, progreso, bases y cohortes según rol y acceso
- [x] 2.5 Actualizar tipos de PocketBase, documentación de esquema y comandos dry-run/apply sin alterar colecciones existentes
- [x] 2.6 Añadir pruebas de esquema, índices, reglas y compatibilidad con registros existentes

## 3. Acciones de autoría y revisiones

- [x] 3.1 Implementar consultas y acciones autorizadas para listar, crear, duplicar y editar metadatos de secciones
- [x] 3.2 Implementar guardado atómico mediante creación de revisión inmutable y cambio del puntero `currentRevision`
- [x] 3.3 Implementar reordenamiento validado y numeración derivada para secciones de una semana
- [x] 3.4 Implementar transiciones entre `draft`, `scheduled`, `published` y `hidden`, incluyendo validación de fecha programada
- [x] 3.5 Implementar carga y referencia de imágenes y videos, límites de archivo, metadatos accesibles y URLs HTTPS externas
- [x] 3.6 Implementar lectura de vista previa sin publicación, intentos ni escrituras de progreso
- [x] 3.7 Añadir pruebas de permisos, concurrencia de revisiones, guardado publicado, orden, estados, programación y medios

## 4. Gestión docente y editor por bloques

- [x] 4.1 Añadir la pestaña `Contenidos` al detalle semanal y una vista staff con estados, programación, posición y acciones contextuales
- [x] 4.2 Implementar reordenamiento accesible de secciones con `dnd-kit` y alternativa operable por teclado
- [x] 4.3 Construir el lienzo del editor con alta, eliminación, duplicación y reordenamiento de bloques
- [x] 4.4 Integrar Tiptap en bloques de texto enriquecido con títulos, listas, enlaces, citas y formato permitido
- [x] 4.5 Implementar editores para destacados, tarjetas, pasos, glosarios, enlaces, botones y contenido embebido permitido
- [x] 4.6 Implementar editores para imagen, video y código con lenguaje, título, texto alternativo y previsualización
- [x] 4.7 Implementar editores para opción única, selección múltiple, verdadero/falso y auto-comprobaciones requeridas
- [x] 4.8 Implementar editores declarativos para validadores y generadores de texto o comandos con variables sanitizadas
- [x] 4.9 Incorporar validación por bloque, mensajes de error localizables y confirmación de guardado sobre contenido publicado
- [x] 4.10 Implementar la vista previa como alumno con indicador persistente y equivalencia visual con el lector
- [x] 4.11 Añadir pruebas de componentes, teclado, accesibilidad y responsive para gestión, editor y vista previa

## 5. Experiencia de lectura del alumno

- [x] 5.1 Implementar el listado estudiantil de secciones disponibles con posición, estado de progreso y acción para continuar
- [x] 5.2 Crear la ruta de lector por sección usando proyecciones públicas y controles de acceso también para URLs directas
- [x] 5.3 Construir el renderizador compartido de bloques editoriales, tarjetas, pasos, medios, enlaces, glosarios y embeds
- [x] 5.4 Implementar bloques de código con resaltado lazy-loaded, desplazamiento horizontal seguro y botón de copia accesible
- [x] 5.5 Implementar navegación anterior/siguiente que omita secciones no disponibles y una barra móvil compatible con áreas táctiles seguras
- [x] 5.6 Mostrar posición, progreso de la semana y reanudación desde la última sección o bloque alcanzado
- [x] 5.7 Añadir pruebas de tema claro/oscuro, responsive, navegación, estados vacíos, acceso directo y renderizado seguro

## 6. Actividades, intentos y finalización

- [x] 6.1 Implementar corrección del lado servidor para opción única, selección múltiple exacta, verdadero/falso y validadores declarativos
- [x] 6.2 Implementar intentos append-only e idempotentes con respuesta, resultado, instante y revisión de actividad
- [x] 6.3 Construir la interacción del alumno con devolución inmediata, sin revelar respuestas correctas tras un error y permitiendo intentos ilimitados
- [x] 6.4 Implementar auto-comprobaciones como actividades satisfechas al marcar todos los puntos, sin semántica de acierto o error
- [x] 6.5 Registrar primera y última apertura, contador y último bloque mediante actualizaciones idempotentes y limitadas
- [x] 6.6 Implementar finalización automática por dominio de requisitos o por alcance del último bloque en secciones sin actividades
- [x] 6.7 Recalcular progreso cuando cambien actividades requeridas sin eliminar intentos ni dominio histórico
- [x] 6.8 Añadir pruebas de manipulación de respuestas, idempotencia, intentos ilimitados, revisión concurrente, auto-comprobación y reglas de finalización

## 7. Bases, copias e historial

- [x] 7.1 Implementar instantáneas y materialización de bases de curso, semana y sección excluyendo estados y datos estudiantiles
- [x] 7.2 Implementar aplicación confirmada de una versión base a un destino compatible con copia independiente y linaje
- [x] 7.3 Implementar promoción administrativa de copias a versiones base inmutables en los tres niveles
- [x] 7.4 Implementar historial, comparación resumida y restauración mediante creación de una nueva versión
- [x] 7.5 Construir la administración de bases con vista previa de elementos a crear y controles exclusivos para `admin`
- [x] 7.6 Añadir pruebas de permisos, compatibilidad de destino, independencia entre copias, exclusión de datos operativos y restauración histórica

## 8. Analítica docente

- [x] 8.1 Implementar consultas agregadas por cohorte, semana y sección para aperturas, finalización, pendientes y dominio
- [x] 8.2 Construir el tablero por sección con métricas accionables y detalle de estudiantes relacionados
- [x] 8.3 Construir el recorrido por alumno con secciones, avance, finalización, actividades e intentos
- [x] 8.4 Implementar detalle por actividad con participantes, intentos totales, dominio e historial individual autorizado
- [x] 8.5 Conservar filtros de cohorte, semana, sección y alumno entre resumen y detalle y usar terminología honesta de visualización
- [x] 8.6 Añadir pruebas de agregaciones, aislamiento por cohorte, filtros, estados vacíos, acceso por rol y representación móvil

## 9. Conversión e importación de la semana 1

- [x] 9.1 Crear un manifiesto normalizado y revisable para las catorce secciones, excluyendo `02-diagnostico-javascript` y eliminando números editoriales incrustados
- [x] 9.2 Convertir textos, destacados, tarjetas, pasos, comparaciones, glosarios, imágenes y código del prototipo a bloques nativos
- [x] 9.3 Convertir checklists a auto-comprobaciones y recrear validadores y generadores de las secciones de Node.js, Git y GitHub
- [x] 9.4 Incorporar los activos gráficos con claves estables, texto alternativo y referencias idempotentes
- [x] 9.5 Implementar un comando de importación con selección explícita de destino, dry-run, confirmación y protección contra duplicados
- [x] 9.6 Añadir pruebas de conteo, orden, exclusión del diagnóstico, mapeo de interacciones, medios e idempotencia
- [x] 9.7 Ejecutar el dry-run, revisar el resultado y aplicar la importación como borrador únicamente en el destino confirmado
- [x] 9.8 Crear y verificar la primera versión base desde el contenido importado validado

## 10. Verificación y entrega

- [x] 10.1 Ejecutar pruebas unitarias y de componentes existentes y nuevas, corrigiendo regresiones
- [x] 10.2 Ejecutar lint y build de producción con el módulo y el manifiesto importable
- [x] 10.3 Aplicar el esquema en un entorno de prueba y validar reglas e índices con los tres roles
- [x] 10.4 Ejecutar flujos E2E de autoría, programación, publicación, lectura, intentos, finalización, analítica y versionado base
- [x] 10.5 Auditar accesibilidad, navegación por teclado, contraste, temas y vistas móviles representativas
- [x] 10.6 Medir consultas y renderizado con una cohorte de volumen representativo y corregir cargas completas innecesarias
- [x] 10.7 Documentar operación, límites de medios, importación, promoción, restauración y rollback antes del despliegue
- [x] 10.8 Verificar los medios importados de Semana 1 y resolver sus URLs protegidas en la vista previa docente
