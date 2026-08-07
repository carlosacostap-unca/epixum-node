## Why

Los cursos semanales necesitan poder representar una etapa introductoria o de preparación previa al inicio formal. Actualmente el formulario, la validación del servidor y el esquema de PocketBase rechazan el número `0`, impidiendo crear una "Semana 0".

## What Changes

- Permitir que docentes y administradores creen y editen semanas con números enteros desde `0`.
- Mantener el rechazo de números negativos y valores no enteros.
- Actualizar la definición de la colección `weeks` para aceptar `0` sin alterar la unicidad por cohorte.
- Conservar el orden ascendente, de modo que Semana 0 aparezca antes que Semana 1.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `academic-content`: La autoría de cursos semanales admitirá una Semana 0 como primer contenedor académico.

## Impact

- Formulario de creación y edición de semanas.
- Validación de entradas del dominio de cohortes.
- Definición y sincronización del esquema de PocketBase para `weeks.number`.
- Pruebas de dominio, interfaz y esquema relacionadas con semanas.
