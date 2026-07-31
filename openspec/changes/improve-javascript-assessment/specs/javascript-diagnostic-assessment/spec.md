## Purpose

Definir una experiencia diagnóstica de JavaScript que preserve una línea de base confiable, permita practicar sin alterar esa referencia y entregue orientación útil al estudiante.

## ADDED Requirements

### Requirement: Diagnóstico inicial separado de la práctica
El sistema MUST identificar el primer intento completado de cada estudiante, cohorte y versión como diagnóstico inicial, y MUST clasificar los intentos posteriores como práctica.

#### Scenario: Primer envío
- **WHEN** un estudiante sin intentos de la versión vigente completa el test
- **THEN** el resultado queda registrado como diagnóstico inicial

#### Scenario: Envío posterior
- **WHEN** el mismo estudiante completa otro intento de la versión vigente
- **THEN** el resultado queda registrado como práctica sin reemplazar el diagnóstico inicial

### Requirement: Una pregunta por vez con progreso
El sistema MUST presentar una pregunta por vez e indicar tanto la posición actual como el avance respondido sobre el total.

#### Scenario: Navegación hacia adelante
- **WHEN** el estudiante responde la pregunta actual
- **THEN** puede avanzar a la siguiente y el progreso visible se actualiza

#### Scenario: Navegación hacia atrás
- **WHEN** el estudiante vuelve a una pregunta anterior
- **THEN** la respuesta seleccionada permanece visible y puede modificarse

### Requirement: Borrador recuperable
El sistema MUST conservar localmente las respuestas y la posición del intento en curso de forma aislada por estudiante, cohorte y versión.

#### Scenario: Recarga durante el test
- **WHEN** el estudiante recarga o vuelve a abrir el test antes de enviarlo
- **THEN** el sistema restaura las respuestas y la posición guardadas

#### Scenario: Envío exitoso
- **WHEN** el servidor confirma el resultado
- **THEN** el sistema elimina el borrador correspondiente

### Requirement: Revisión y confirmación antes del envío
El sistema MUST mostrar un resumen de completitud y requerir confirmación explícita antes de crear el resultado.

#### Scenario: Preguntas incompletas
- **WHEN** falta al menos una respuesta
- **THEN** el sistema impide el envío y dirige al estudiante a la primera pregunta incompleta

#### Scenario: Confirmación final
- **WHEN** las quince preguntas están respondidas
- **THEN** el estudiante puede revisar el resumen y confirmar el envío

### Requirement: Envío idempotente
El sistema MUST asociar una clave estable al intento en curso y MUST devolver el mismo resultado cuando recibe nuevamente esa clave para el mismo estudiante y contexto.

#### Scenario: Doble envío
- **WHEN** el cliente repite una solicitud ya guardada con la misma clave
- **THEN** no se crea un segundo resultado y se devuelve la nota existente

### Requirement: Categorías de conocimientos de JavaScript
El sistema MUST organizar las quince preguntas en categorías explícitas de JavaScript y calcular el resultado de cada categoría.

#### Scenario: Resultado completado
- **WHEN** se puntúa un intento válido
- **THEN** la respuesta incluye la nota total y el puntaje obtenido en cada categoría

### Requirement: Retroalimentación por categoría
El sistema MUST mostrar al estudiante fortalezas y áreas a reforzar según su rendimiento por categoría, sin convertir el diagnóstico en contenido específico de Node.js.

#### Scenario: Categoría con desempeño bajo
- **WHEN** el estudiante obtiene hasta un tercio de los puntos de una categoría
- **THEN** el resultado la presenta como prioridad de repaso con una recomendación concreta

#### Scenario: Categoría con desempeño alto
- **WHEN** el estudiante obtiene todos los puntos de una categoría
- **THEN** el resultado la presenta como fortaleza

### Requirement: Preguntas claras y centradas en JavaScript
El sistema MUST utilizar enunciados autocontenidos, opciones no ambiguas y una cobertura equilibrada de fundamentos, funciones, colecciones, navegador y asincronismo de JavaScript.

#### Scenario: Versión vigente
- **WHEN** el estudiante abre el diagnóstico
- **THEN** visualiza quince preguntas distribuidas de manera uniforme entre cinco categorías de JavaScript

#### Scenario: Pregunta con código
- **WHEN** una consigna necesita mostrar código fuente o una opción contiene sintaxis de JavaScript
- **THEN** el sistema separa la redacción del código y lo presenta en una sección monoespaciada legible
