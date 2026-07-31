## Purpose

Permite diagnosticar conocimientos iniciales de JavaScript, conservar resultados confiables y ofrecer a docentes una visión accionable de la cohorte.

## ADDED Requirements

### Requirement: Test diagnóstico de diez preguntas
El sistema MUST ofrecer a cada estudiante activo de la cohorte semanal un test simulado de JavaScript con exactamente 10 preguntas de opción múltiple.

#### Scenario: Abrir test pendiente
- **WHEN** un estudiante matriculado que todavía no respondió abre el diagnóstico
- **THEN** el sistema muestra 10 preguntas y sus opciones
- **AND** no expone las respuestas correctas al cliente

#### Scenario: Entrega incompleta o manipulada
- **WHEN** faltan respuestas o una respuesta no pertenece a las opciones definidas
- **THEN** el sistema rechaza la entrega sin persistir resultados

### Requirement: Persistencia de múltiples intentos por alumno
El sistema MUST calcular el puntaje en servidor y MUST guardar cada intento válido como un resultado independiente por estudiante, cohorte y versión de evaluación.

#### Scenario: Primera entrega válida
- **WHEN** el estudiante envía respuestas válidas para las 10 preguntas
- **THEN** el sistema guarda respuestas, puntaje, total de preguntas, versión y fecha de realización
- **AND** muestra al estudiante su puntaje

#### Scenario: Nuevo intento
- **WHEN** el estudiante responde nuevamente una versión ya completada
- **THEN** el sistema crea un nuevo resultado sin modificar los intentos anteriores
- **AND** muestra el puntaje del nuevo intento

#### Scenario: Consultar historial propio
- **WHEN** un estudiante abre un test que ya realizó
- **THEN** el sistema muestra la cantidad de intentos anteriores y sus puntajes
- **AND** permite comenzar un nuevo intento

### Requirement: Reporte docente de resultados
El sistema MUST permitir a docentes y administradores consultar los resultados del diagnóstico por cohorte.

#### Scenario: Docente abre el reporte
- **WHEN** un docente autorizado abre el reporte de una cohorte semanal
- **THEN** el sistema muestra participación, puntaje promedio y resultados agrupados por estudiante
- **AND** indica la cantidad de intentos, la peor nota y la mejor nota de cada estudiante
- **AND** permite revisar las respuestas de cada intento

#### Scenario: Estudiante intenta abrir el reporte
- **WHEN** un estudiante intenta acceder al reporte docente
- **THEN** el sistema rechaza o redirige el acceso
