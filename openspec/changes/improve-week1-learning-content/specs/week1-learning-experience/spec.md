## Purpose

Definir una experiencia de Semana 1 fiel al prototipo, coherente para principiantes y capaz de comprobar comprensión antes de registrar cada sección como completada.

## ADDED Requirements

### Requirement: Fidelidad estructural del contenido importado
El sistema SHALL conservar en bloques nativos los enlaces, callouts, listas ordenadas, comparaciones, código, imágenes, epígrafes y actividades relevantes del prototipo de Semana 1.

#### Scenario: Alumno lee una sección importada
- **WHEN** una sección del prototipo contiene una jerarquía, recurso o advertencia diferenciada
- **THEN** la versión importada presenta ese elemento sin sustituirlo por texto repetido o fuera de contexto

#### Scenario: Alumno necesita un recurso oficial
- **WHEN** el contenido indica descargar o abrir Node.js, Git o GitHub
- **THEN** muestra un enlace o botón navegable a la fuente oficial correspondiente

### Requirement: Proyecto único y evidencia coherente
El recorrido SHALL usar `programa-modular-node` como proyecto de Semana 1 y SHALL mantener consistentes el repositorio, los módulos, `historial.txt`, README y evidencia final.

#### Scenario: Alumno avanza desde construcción hasta entrega
- **WHEN** completa el programa, lo versiona y revisa la evidencia
- **THEN** todas las secciones e imágenes se refieren al mismo proyecto y a los mismos archivos

### Requirement: Evaluación formativa verificable
Las secciones conceptuales SHALL incluir al menos una actividad autocorregible adecuada a su objetivo, mientras que las declaraciones subjetivas de preparación o confianza SHALL ser opcionales.

#### Scenario: Alumno responde incorrectamente
- **WHEN** selecciona una respuesta incorrecta sobre terminal, back end, runtime, event loop, módulos o errores
- **THEN** recibe feedback inmediato sin revelar la respuesta correcta y puede volver a intentar

#### Scenario: Alumno marca una autoevaluación
- **WHEN** completa un checklist de disposición o confianza
- **THEN** ese checklist no demuestra por sí solo el dominio requerido de la sección

### Requirement: Recursos vigentes y privacidad de principiantes
El recorrido SHALL distinguir capturas ilustrativas de interfaces reales y SHALL ofrecer una opción de correo de commit que no exponga innecesariamente el correo personal.

#### Scenario: Interfaz externa cambia
- **WHEN** una captura de Node.js, Git o GitHub difiere de la interfaz actual
- **THEN** el alumno puede continuar mediante instrucciones independientes de la versión y un enlace oficial

#### Scenario: Alumno configura autoría de Git
- **WHEN** llega al paso de correo de commits
- **THEN** el contenido explica la alternativa `noreply` y la visibilidad del correo antes de sugerir el comando

### Requirement: Actualización conservadora de los borradores existentes
La mejora SHALL actualizar las revisiones actuales de las catorce secciones importadas sin reemplazar sus identificadores, estados de publicación, posiciones de progreso ni activos existentes.

#### Scenario: Administrador aplica la mejora a Cohorte 6
- **WHEN** confirma explícitamente la semana destino y ejecuta la actualización
- **THEN** se crean nuevas revisiones editoriales y cada sección apunta a su nueva revisión conservando su identidad y estado

