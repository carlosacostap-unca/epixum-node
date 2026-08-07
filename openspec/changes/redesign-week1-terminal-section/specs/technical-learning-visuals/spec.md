## Purpose

Representar interacciones de terminal y referencias de comandos como estructuras pedagógicas legibles, copiables y adaptables, sin convertirlas en texto plano ni imágenes inaccesibles.

## ADDED Requirements

### Requirement: Transcripción estructurada de terminal
El sistema SHALL representar una conversación de terminal mediante filas etiquetadas que mantengan asociadas la etiqueta, el valor y el rol visual de prompt, comando o respuesta.

#### Scenario: Alumno interpreta una interacción
- **WHEN** una sección contiene una transcripción de terminal
- **THEN** cada prompt, comando y respuesta aparece dentro de una única superficie de terminal y conserva su asociación semántica
- **AND** los comandos se distinguen sin depender únicamente del color

### Requirement: Referencia práctica de comandos
El sistema SHALL presentar cada comando junto con su propósito y una consigna breve, y SHALL permitir copiar el comando sin copiar explicaciones adyacentes.

#### Scenario: Alumno consulta y copia un comando
- **WHEN** un alumno abre una referencia de comandos
- **THEN** puede identificar el comando, para qué sirve y qué probar
- **AND** puede copiar únicamente el texto ejecutable mediante un control accesible

### Requirement: Autoría de visuales técnicos
El sistema SHALL validar y permitir editar transcripciones y referencias como bloques estructurados con claves estables.

#### Scenario: Docente guarda un visual técnico
- **WHEN** un docente configura filas de terminal o comandos válidos
- **THEN** la revisión conserva todos sus campos y la vista previa usa la misma representación que verá el alumno

