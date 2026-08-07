## ADDED Requirements

### Requirement: Cierre semanal orientado a capacidades

El sistema MUST cerrar una semana de contenido con una síntesis breve que reconstruya el recorrido realizado, compruebe los aprendizajes requeridos y permita al alumno decidir qué necesita repasar antes de continuar.

#### Scenario: Reconstrucción del recorrido

- **WHEN** el alumno abre la última sección de la semana
- **THEN** el contenido conecta las acciones realizadas desde la preparación del entorno hasta la evidencia publicada
- **AND** utiliza los mismos archivos, comandos, resultados y nombres enseñados previamente

#### Scenario: Referencia conceptual utilizable

- **WHEN** el alumno consulta el resumen y el glosario
- **THEN** cada comando y término tiene una función contextualizada en el proyecto semanal
- **AND** las comparaciones presentan un único contraste por unidad visual con nombres significativos

#### Scenario: Recuperación dirigida

- **WHEN** el alumno identifica una capacidad que todavía no puede demostrar
- **THEN** el cierre le indica qué tramo temático volver a consultar y qué evidencia buscar allí
- **AND** no confunde una dificultad pendiente con el fracaso de toda la semana

#### Scenario: Comprobación y cierre

- **WHEN** el alumno llega al final de la síntesis
- **THEN** responde una actividad conceptual requerida y dispone de una autoevaluación opcional basada en evidencias observables
- **AND** el mensaje de cierre aparece después de esas actividades sin declarar contenidos futuros no confirmados

#### Scenario: Continuidad académica

- **WHEN** el alumno completa correctamente la actividad requerida
- **THEN** la sección confirma la base construida y le indica conservar accesible el proyecto y su repositorio para el siguiente tramo
