## ADDED Requirements

### Requirement: Reporte docente del diagnóstico de JavaScript
El sistema MUST distinguir por estudiante el diagnóstico inicial de los intentos de práctica y mostrar indicadores que permitan interpretar la evolución y las dificultades temáticas.

#### Scenario: Resumen por estudiante
- **WHEN** un docente consulta un estudiante con resultados
- **THEN** el reporte muestra nota inicial, última nota, mejor nota, cantidad de intentos y variación respecto del diagnóstico inicial

#### Scenario: Desglose por categoría
- **WHEN** existen resultados de la versión vigente
- **THEN** el reporte muestra desempeño agregado y por estudiante para cada categoría de JavaScript

#### Scenario: Dificultad por pregunta
- **WHEN** una pregunta fue respondida por estudiantes activos
- **THEN** el reporte muestra cantidad de respuestas, aciertos, errores y porcentaje de acierto

#### Scenario: Intentos de práctica
- **WHEN** un estudiante realizó más de un intento
- **THEN** el detalle identifica cuál es el diagnóstico inicial y cuáles son prácticas posteriores

