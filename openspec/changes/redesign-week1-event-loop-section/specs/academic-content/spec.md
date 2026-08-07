## ADDED Requirements

### Requirement: Modelo introductorio de concurrencia en Node.js
La sección de event loop SHALL distinguir la ejecución secuencial de callbacks JavaScript de la concurrencia de operaciones en curso, y SHALL presentar sus analogías y diagramas como simplificaciones con límites explícitos.

#### Scenario: Alumno interpreta la analogía
- **WHEN** un estudiante abre «Una fila, muchas tareas en movimiento»
- **THEN** relaciona al cajero con la ejecución de JavaScript, la preparación delegada con recursos del entorno y los pedidos listos con callbacks que esperan turno
- **AND** comprende que el event loop no realiza la preparación ni ejecuta dos callbacks JavaScript simultáneamente

#### Scenario: Alumno interpreta el diagrama
- **WHEN** el contenido presenta pila, API, cola y event loop
- **THEN** explica que la pila contiene la ejecución JavaScript actual y que una callback lista sólo puede ejecutarse cuando recibe turno
- **AND** advierte que Node.js organiza callbacks en distintas fases y colas, aunque el modelo visual muestre una sola cola didáctica

### Requirement: Predicción verificable de temporizadores
La sección SHALL permitir predecir el orden del script `A`, `setTimeout(..., 0)`, `C` y SHALL explicar el retraso como umbral mínimo, no como ejecución inmediata ni hora exacta.

#### Scenario: Ejecución del script de orden
- **WHEN** el estudiante recorre o ejecuta el ejemplo del temporizador
- **THEN** observa la salida `A`, `C`, `B`
- **AND** atribuye el resultado a que el script sincrónico termina antes de que la callback del temporizador pueda recibir turno

#### Scenario: Interpretación de cero milisegundos
- **WHEN** el estudiante lee `setTimeout(callback, 0)`
- **THEN** comprende que la llamada registra la callback para una oportunidad posterior y no interrumpe la pila actual
- **AND** no interpreta el valor como garantía de ejecución inmediata o de tiempo exacto

### Requirement: Práctica reproducible de entrada y salida no bloqueante
La sección SHALL incluir una práctica que funcione sin archivos auxiliares y SHALL contrastar lectura asíncrona, lectura síncrona y ejecución de callbacks sin equiparar asincronismo con paralelismo o mayor velocidad.

#### Scenario: Lectura del propio archivo
- **WHEN** el estudiante ejecuta el ejemplo que usa `readFile(__filename, ...)`
- **THEN** observa `Inicio` y `Fin` antes del mensaje `Archivo listo`
- **AND** comprende que la lectura se coordina fuera del hilo del event loop y que su callback JavaScript se ejecuta posteriormente en ese hilo

#### Scenario: Comparación con una operación síncrona
- **WHEN** el contenido contrasta `readFile` con `readFileSync`
- **THEN** explica que la variante síncrona impide avanzar con más JavaScript hasta completar la lectura
- **AND** aclara que una API asíncrona favorece capacidad de respuesta pero no garantiza terminar antes ni ejecutar su callback en paralelo

### Requirement: Evidencia estable y única del event loop
La sección SHALL finalizar con la pregunta obligatoria existente como única evidencia requerida de la comprensión inicial del orden asíncrono.

#### Scenario: Nueva revisión de la sección
- **WHEN** se genera el contenido curado
- **THEN** se conservan las tres imágenes y se retiran la pista opcional de promesas y el checklist opcional
- **AND** la pregunta existente, su código, opciones y respuesta correcta permanecen sin cambios
