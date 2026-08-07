## Context

La modalidad semanal ya modela cohortes, matrículas, semanas, clases, trabajos y publicación manual de semanas. El detalle académico separa lectura y administración, el shell aporta navegación responsive y temas, Tiptap edita texto enriquecido, `dnd-kit` está disponible para ordenamiento y el diagnóstico de JavaScript demuestra corrección del lado servidor, intentos idempotentes y analítica por alumno.

El prototipo de la semana 1 contiene quince sitios estáticos independientes. Se importarán catorce: el diagnóstico queda fuera porque la cohorte ya posee un instrumento versionado. Los sitios restantes combinan contenido editorial, medios, código copiable, auto-comprobaciones, validadores y generadores; actualmente guardan progreso en `localStorage` y repiten estilos y lógica por carpeta.

La solución debe integrarse con PocketBase y con los permisos existentes, soportar copias independientes y bases versionadas en tres niveles, y conservar una representación consistente durante ediciones de contenido ya publicado.

## Goals / Non-Goals

**Goals:**

- Representar las secciones como contenido estructurado nativo de Epixum y no como HTML ejecutable o `iframe`.
- Hacer atómico el cambio de una revisión publicada y mantener trazabilidad entre revisión, actividad, intento y progreso.
- Reutilizar los patrones existentes de autorización, servidor, UI, Tiptap, ordenamiento, idempotencia y analítica.
- Permitir que una misma base produzca copias independientes sin duplicar innecesariamente archivos inmutables.
- Calcular programación y visibilidad sin depender de un proceso externo permanente.

**Non-Goals:**

- Reemplazar, copiar o editar desde este módulo el diagnóstico de JavaScript existente.
- Ejecutar código escrito por estudiantes o proveer un entorno de programación embebido.
- Incorporar archivos descargables, audio, publicación con fecha de cierre o colaboración editorial en tiempo real.
- Actualizar automáticamente cohortes existentes cuando cambia una base.
- Interpretar una apertura como prueba de lectura efectiva.

## Decisions

### Usar secciones con revisiones inmutables y bloques JSON discriminados

`content_sections` contendrá identidad, semana, posición, estado, programación, revisión actual y linaje. Cada guardado creará primero un registro inmutable en `content_section_revisions` con el árbol ordenado de bloques, el manifiesto de actividades y sus metadatos; después actualizará el puntero `currentRevision` de la sección.

El bloque tendrá una clave estable, un tipo discriminante y datos validados por tipo. El texto enriquecido vivirá dentro de bloques editoriales y no como el documento completo de la sección. Las claves estables permiten conservar referencias de progreso aunque cambie el orden.

El puntero a una revisión evita que un alumno reciba una mezcla de bloques anteriores y nuevos mientras se guarda. También permite previsualizar una revisión antes de activarla y auditar qué definición evaluó cada intento.

Alternativas descartadas:

- Servir el HTML, CSS y JavaScript del prototipo mediante `iframe`: aislaría el contenido del shell, permisos, temas, editor y analítica, y ejecutaría lógica no gobernada por la aplicación.
- Guardar cada bloque como un registro mutable: simplifica consultas parciales, pero hace visible una edición incompleta y complica las instantáneas de bases.
- Guardar una única cadena HTML: no permite configurar, reordenar ni medir actividades de manera segura.

### Extender Tiptap sólo dentro de bloques editoriales

El editor de sección será un lienzo ordenable. Cada bloque tendrá controles propios; Tiptap se reutilizará para títulos, párrafos, listas, enlaces, citas y formato inline dentro del bloque de texto. Tarjetas, pasos, glosarios, medios, código, embeds e interactividad conservarán esquemas explícitos.

El renderizador compartido recibirá el mismo modelo público tanto en vista previa como en lectura. Los bloques de código usarán resaltado lazy-loaded por lenguaje y botón de copia; no evaluarán el contenido. La vista previa no generará eventos ni progreso.

### Validar y proyectar revisiones desde el servidor

Las rutas de alumno no leerán directamente la revisión completa desde PocketBase. El servidor comprobará matrícula, cohorte, semana, estado y fecha; después devolverá una proyección pública que elimine respuestas correctas, reglas privadas de validación y configuración administrativa.

El HTML producido por Tiptap se restringirá a nodos y atributos admitidos. Enlaces, imágenes y videos externos requerirán HTTPS. Los embeds usarán una lista explícita de proveedores, inicialmente YouTube y Vimeo, y se construirán desde URLs validadas en vez de aceptar HTML arbitrario.

Las acciones de corrección recuperarán la revisión y actividad vigentes en el servidor, normalizarán la respuesta y compararán contra la definición privada. Selección múltiple exigirá coincidencia exacta del conjunto correcto.

### Modelar persistencia en colecciones especializadas

Se incorporarán estas colecciones principales:

- `content_sections`: semana, posición, título, resumen, estado, `scheduledAt`, `publishedAt`, `currentRevision`, `sourceBaseVersion` y metadatos de linaje.
- `content_section_revisions`: sección, número de revisión, bloques JSON, manifiesto privado de actividades, `requirementsRevision`, autor y fecha.
- `content_activity_attempts`: cohorte, semana, sección, revisión, clave y revisión de actividad, estudiante, respuesta JSON, resultado, instante e idempotency key.
- `content_section_progress`: relación única estudiante-sección con primera/última apertura, contador, último bloque, requisitos satisfechos y finalización vigente.
- `content_assets`: archivo o URL externa, tipo, metadatos accesibles, autor y procedencia.
- `content_bases`: identidad estable, nivel `course|week|section`, nombre, versión actual y estado.
- `content_base_versions`: base, número, instantánea JSON inmutable, versión de origen, autor y fecha.

Las respuestas correctas permanecen dentro de revisiones no legibles por estudiantes. Los intentos serán append-only para preservar evolución. `content_section_progress` será una proyección operativa compacta, no la única evidencia: podrá reconstruirse desde intentos y aperturas si fuera necesario.

Los archivos subidos serán inmutables. Una copia puede compartir una referencia a un medio de la base; reemplazarlo crea un activo nuevo para esa copia, de modo que compartir almacenamiento no crea sincronización editorial.

### Separar revisión editorial de revisión de requisitos

Cada guardado incrementará la revisión editorial. `requirementsRevision` sólo cambiará cuando se agregue, elimine o modifique una actividad requerida, cambien sus respuestas válidas o se altere la condición terminal de una sección sin actividades.

La finalización será válida contra la revisión de requisitos actual:

- Pregunta o validador: al menos un intento correcto para la clave y revisión vigentes.
- Auto-comprobación: todos los puntos vigentes marcados; se registra como satisfecha, no como correcta.
- Generador: bloque auxiliar no requerido salvo que una configuración futura lo convierta explícitamente en actividad.
- Sección sin actividades: último bloque vigente alcanzado.

Agregar o cambiar una actividad deja pendiente una sección antes completada, pero conserva intentos históricos. Cambiar sólo texto, medios o presentación no invalida dominio.

### Calcular disponibilidad efectiva en cada lectura

Las fechas se almacenarán en UTC y se presentarán en la zona configurada por la aplicación, inicialmente `America/Argentina/Buenos_Aires`. No se incorporará un cron ni una cola para publicar.

Una sección será efectiva para el alumno cuando:

```text
matrícula activa
AND cohorte activa
AND semana published
AND (
  sección published
  OR (sección scheduled AND scheduledAt <= ahora)
)
```

`draft` y `hidden` nunca serán efectivos. Las consultas de lista, lectura, navegación y envío de actividad compartirán la misma política para impedir accesos mediante URL directa. Publicar una semana después de una fecha ya vencida hará visible inmediatamente la sección programada.

### Integrar el módulo en el recorrido académico existente

`AcademicDetail` incorporará la pestaña `content`. El listado de semana tendrá una representación diferente por rol: gestión completa para staff y disponibilidad/progreso propio para estudiantes.

Las rutas conceptuales serán:

- `/cohorts/{cohortId}/weeks/{weekId}?section=content`: listado contextual.
- `/cohorts/{cohortId}/weeks/{weekId}/content/{sectionId}`: lector del alumno y lectura docente.
- `/cohorts/{cohortId}/weeks/{weekId}/content/manage`: orden y estados.
- `/cohorts/{cohortId}/weeks/{weekId}/content/{sectionId}/edit`: editor.
- `/admin/content-bases`: bases, versiones, aplicación, promoción y restauración.

En pantallas pequeñas, anterior/siguiente y posición se presentarán en una barra inferior segura respecto del área táctil. La navegación se calculará sólo sobre secciones efectivas. La numeración será derivada del orden, por lo que excluir el diagnóstico no dejará un hueco.

### Registrar visualización de forma agregada e intentos de forma completa

La primera apertura creará o actualizará `content_section_progress`; aperturas posteriores actualizarán `lastViewedAt` y `viewCount`. El avance por bloques será monotónico dentro de una revisión y se enviará mediante acciones idempotentes con limitación de frecuencia desde el cliente. Alcanzar el último bloque se detectará con observación de visibilidad y nunca se describirá como lectura comprobada.

Cada intento de actividad se guardará individualmente. Una clave idempotente por envío impedirá duplicados por recarga o reintento de red, siguiendo el patrón del diagnóstico existente. La respuesta inmediata sólo incluirá `correct`, el estado de dominio y un mensaje; una respuesta incorrecta no incluirá el solucionario.

### Construir analítica sobre consultas compartidas

La capa analítica combinará matrículas activas, secciones, progreso e intentos dentro del contexto autorizado. Proveerá dos pivotes equivalentes:

- Por sección: cobertura de aperturas, finalización, pendientes y dominio por actividad.
- Por alumno: recorrido de secciones, aperturas, último avance, finalización e historial de intentos.

Los resúmenes utilizarán agregaciones compactas y cargarán el historial detallado sólo cuando el docente lo solicite. Filtros y URLs conservarán cohorte, semana, sección y alumno de acuerdo con el patrón actual de tableros.

### Versionar bases mediante instantáneas y punteros estables

`content_bases` será la identidad estable; cada promoción creará una `content_base_version` inmutable y moverá el puntero de versión actual. Las instantáneas podrán abarcar:

- Curso: estructura de semanas y contenido descendiente.
- Semana: metadatos pedagógicos y secciones.
- Sección: revisión estructurada completa.

La instantánea excluirá identificadores operativos, estados, horarios, estudiantes, progreso e intentos. Aplicarla materializará nuevos registros normalizados con linaje hacia la versión base. Restaurar una versión histórica creará una versión nueva equivalente, sin mutar el pasado.

Sólo `admin` podrá promover, restaurar o cambiar la cabeza de una base. Docentes y administradores podrán aplicar versiones autorizadas a destinos compatibles, con vista previa y confirmación de la cantidad de semanas o secciones que se crearán.

Alternativa descartada: mantener copias enlazadas a la base y propagar cambios. Contradice la personalización independiente acordada y arriesga sobrescribir contenido usado por alumnos.

### Importar la semana 1 desde un manifiesto normalizado y repetible

La implementación generará un manifiesto revisable a partir del prototipo y un comando de seed/importación con dry-run. El proceso no ejecutará los `script.js` originales ni publicará HTML arbitrario. Mapeará sus patrones a bloques nativos, trasladará imágenes a activos y recreará interacciones mediante tipos configurados.

El manifiesto tendrá una clave estable de importación por sección y activo para garantizar idempotencia. Excluirá `02-diagnostico-javascript`, conservará el orden relativo de las otras catorce carpetas y permitirá crear primero una semana base o una copia de cohorte según el destino explícito.

Los comportamientos especiales se mapearán así:

- Checklists a auto-comprobaciones requeridas.
- Versiones y URLs a validadores declarativos del servidor.
- Comandos personalizados a generadores con plantillas y variables sanitizadas.
- Botones copiar a bloques de código.
- Glosario a bloques desplegables.

## Risks / Trade-offs

- [Las revisiones JSON pueden crecer y hacer costosas las listas] → Mantener revisiones fuera de la colección de secciones, solicitar sólo la revisión necesaria y conservar medios como referencias.
- [Una edición publicada puede cambiar requisitos mientras un alumno responde] → Corregir contra la revisión identificada por el cliente sólo si sigue disponible y registrar esa revisión; recalcular dominio contra los requisitos actuales.
- [Los eventos de avance pueden generar demasiadas escrituras] → Actualizar sólo cuando aumenta el bloque máximo, aplicar debounce cliente e idempotencia servidor.
- [Los videos subidos pueden exceder límites de PocketBase o despliegue] → Validar tipo y tamaño, documentar límites y favorecer proveedores externos para videos grandes.
- [Los embeds y rich text amplían la superficie XSS] → Esquemas por bloque, lista de proveedores, protocolos permitidos, sanitización y ausencia de HTML/JavaScript arbitrario.
- [Una base de curso completa puede producir una instantánea grande] → Guardar medios por referencia, validar tamaño antes de promover y permitir bases más granulares de semana o sección.
- [Compartir un activo entre copias podría parecer sincronización] → Tratar activos como inmutables; toda sustitución crea una referencia nueva en la copia.
- [Completar automáticamente al llegar al final no demuestra lectura] → Mostrarlo como finalización de recorrido y mantener aperturas separadas de dominio y lectura real.

## Migration Plan

1. Añadir tipos, validadores, colecciones e índices nuevos mediante scripts de esquema idempotentes con dry-run; no modificar todavía las rutas visibles.
2. Aplicar reglas de PocketBase y comprobar que estudiantes no pueden leer revisiones privadas, respuestas ajenas, bases ni analítica.
3. Implementar dominio, proyecciones públicas, políticas de disponibilidad, revisiones y pruebas antes de habilitar UI.
4. Incorporar gestión, editor, previsualización y lector detrás de la presencia de secciones, manteniendo semanas existentes sin cambios.
5. Añadir progreso, actividades y analítica; validar concurrencia, idempotencia y revisiones de requisitos.
6. Generar y auditar el manifiesto de las catorce secciones; ejecutar dry-run y luego importar como borradores en el destino confirmado.
7. Crear la primera versión base desde la importación validada y comprobar que una copia futura sea independiente.
8. Ejecutar pruebas unitarias, de componentes, accesibilidad, esquema, permisos, build y E2E para los tres roles.

Rollback: ocultar o devolver a borrador las secciones importadas y desplegar la versión anterior de la aplicación. Las colecciones nuevas permanecerán para no perder contenido, intentos ni progreso; no se eliminarán registros durante rollback. El importador será idempotente y no reintentará escrituras sin confirmación explícita.
