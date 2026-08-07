## Purpose

Ofrecer al alumno una lectura secuencial con progreso confiable y permitir al equipo docente interpretar aperturas, intentos, dominio y finalización de cada sección.

## ADDED Requirements

### Requirement: Lectura de una sección por página
El sistema SHALL presentar cada sección disponible como una página dentro de Epixum, indicando su posición y ofreciendo navegación anterior y siguiente compatible con pantallas estrechas.

#### Scenario: Alumno abre una sección intermedia
- **WHEN** un alumno abre una sección disponible que tiene vecinas disponibles
- **THEN** el sistema muestra su contenido, posición actual y acciones anterior y siguiente

#### Scenario: Secciones no disponibles entre vecinas
- **WHEN** existen secciones en borrador, ocultas o aún no disponibles entre dos secciones visibles
- **THEN** la navegación anterior y siguiente las omite

#### Scenario: Primera o última sección
- **WHEN** el alumno está en el extremo disponible del recorrido
- **THEN** el sistema deshabilita u omite la dirección que no tiene un destino disponible

### Requirement: Registro honesto de visualización
El sistema MUST registrar por alumno y sección la primera apertura, la última apertura, el número de aperturas y el último bloque alcanzado, sin presentar esos datos como prueba de lectura efectiva.

#### Scenario: Primera apertura
- **WHEN** un alumno abre una sección disponible por primera vez
- **THEN** el sistema registra la primera y última apertura y establece al menos una visualización

#### Scenario: Apertura posterior
- **WHEN** el mismo alumno vuelve a abrir la sección
- **THEN** el sistema actualiza la última apertura e incrementa el conteo sin perder la primera

#### Scenario: Avance dentro de la sección
- **WHEN** el alumno alcanza un bloque posterior al último registrado
- **THEN** el sistema conserva el bloque más avanzado alcanzado para esa revisión

### Requirement: Intentos ilimitados y corrección segura
Las actividades calificables SHALL admitir intentos ilimitados, SHALL corregirse con autoridad del servidor y SHALL registrar respuesta, resultado, fecha y revisión de actividad para cada intento.

#### Scenario: Respuesta correcta
- **WHEN** un alumno envía una respuesta correcta a una actividad disponible
- **THEN** el sistema registra el intento, informa inmediatamente el acierto y conserva el dominio de esa actividad

#### Scenario: Respuesta incorrecta
- **WHEN** un alumno envía una respuesta incorrecta
- **THEN** el sistema registra el intento e informa que debe volver a intentar
- **AND** no revela la respuesta correcta

#### Scenario: Intentos posteriores al acierto
- **WHEN** un alumno vuelve a responder una actividad que ya dominó
- **THEN** el sistema registra el nuevo intento sin eliminar el hecho de que la resolvió correctamente al menos una vez

#### Scenario: Respuesta manipulada o actividad inaccesible
- **WHEN** se envía una opción inexistente o una respuesta para una actividad no disponible
- **THEN** el sistema rechaza el intento sin otorgar dominio

### Requirement: Auto-comprobaciones no calificadas
Una lista de auto-comprobación SHALL considerarse satisfecha cuando el alumno marca todos sus puntos, y SHALL distinguirse de una pregunta correcta o incorrecta.

#### Scenario: Lista incompleta
- **WHEN** el alumno deja al menos un punto sin marcar
- **THEN** la lista permanece pendiente

#### Scenario: Lista completa
- **WHEN** el alumno marca todos los puntos vigentes
- **THEN** la lista queda completada como auto-verificación
- **AND** la interfaz no la califica como correcta o incorrecta

### Requirement: Finalización por dominio
Una sección con actividades requeridas SHALL completarse solamente cuando el alumno haya resuelto correctamente al menos una vez cada actividad calificable vigente y haya satisfecho cada auto-comprobación requerida.

#### Scenario: Actividades parcialmente dominadas
- **WHEN** al menos una actividad requerida permanece sin resolver correctamente
- **THEN** la sección permanece pendiente

#### Scenario: Todas las actividades dominadas
- **WHEN** todas las actividades requeridas vigentes fueron dominadas o satisfechas
- **THEN** el sistema marca automáticamente la sección como completada

#### Scenario: Sección sin actividades
- **WHEN** una sección no contiene actividades requeridas y el alumno alcanza su último bloque
- **THEN** el sistema la marca automáticamente como completada

### Requirement: Revisión de requisitos de finalización
Agregar o modificar una actividad requerida SHALL invalidar la finalización previa hasta que el alumno satisfaga la revisión vigente, sin borrar sus intentos históricos.

#### Scenario: Se agrega una actividad requerida
- **WHEN** una sección completada incorpora una nueva actividad requerida
- **THEN** la sección vuelve a quedar pendiente para el alumno
- **AND** los intentos y dominios históricos permanecen consultables

#### Scenario: Se modifica la respuesta correcta
- **WHEN** cambia la definición calificable de una actividad requerida
- **THEN** el dominio de revisiones anteriores no satisface automáticamente la nueva revisión

#### Scenario: Sólo cambia contenido explicativo
- **WHEN** se modifica contenido que no altera los requisitos ni actividades de la sección
- **THEN** una finalización previa continúa siendo válida

### Requirement: Progreso coherente del recorrido
El sistema SHALL mostrar al alumno el número de secciones completadas sobre el total actualmente disponible y SHALL recordar la última sección o bloque alcanzado.

#### Scenario: Regreso a la semana
- **WHEN** un alumno vuelve al contenido de una semana con progreso previo
- **THEN** el sistema muestra su resumen actualizado y permite continuar desde la última posición registrada

#### Scenario: Cambia la disponibilidad
- **WHEN** una sección se publica, oculta o vuelve a borrador
- **THEN** el denominador y la navegación se recalculan sobre las secciones actualmente disponibles

