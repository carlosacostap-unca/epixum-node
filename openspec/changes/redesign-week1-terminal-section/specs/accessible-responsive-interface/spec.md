## ADDED Requirements

### Requirement: Visuales técnicos adaptables
Las transcripciones de terminal y referencias de comandos SHALL conservar etiquetas, valores, jerarquía y acciones en pantallas pequeñas sin exigir desplazamiento horizontal de la página.

#### Scenario: Referencia de comandos en móvil
- **WHEN** la referencia se muestra en un viewport móvil
- **THEN** cada comando se transforma en una unidad apilada que mantiene propósito, consigna y acción de copia juntos

#### Scenario: Transcripción de terminal en móvil
- **WHEN** una transcripción no cabe en una fila
- **THEN** etiqueta y valor se apilan dentro de la misma fila lógica
- **AND** sólo el valor técnico puede desplazarse horizontalmente si fuera necesario

