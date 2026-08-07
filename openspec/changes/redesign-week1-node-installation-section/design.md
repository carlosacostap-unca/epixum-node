## Context

La sección actual se genera mediante conversión genérica del prototipo. Conservó tres imágenes y dos validadores, pero perdió estructuras visuales especiales y produjo tarjetas con textos concatenados. El dominio ya dispone de `callout`, `steps`, `link`, `image`, `cards`, `code` y `validator`, suficientes para una composición estable. El sitio oficial de Node.js mantiene una descarga LTS y comandos de verificación, pero los números y la presentación cambian con el tiempo.

## Goals / Non-Goals

**Goals:**

- Reemplazar la conversión ambigua por una composición declarativa de doce bloques.
- Conservar las tres imágenes y las dos evidencias obligatorias existentes.
- Presentar decisiones y recuperación en lenguaje apto para principiantes.
- Mantener la sección independiente de una versión concreta de Node.js o npm.

**Non-Goals:**

- Cubrir instalaciones de macOS o Linux en esta sección orientada a Windows.
- Incorporar un gestor de versiones o automatizar la instalación.
- Modificar políticas de ejecución, PATH u otros ajustes del sistema desde la aplicación.
- Cambiar validadores, progreso histórico, imágenes o estado editorial.

## Decisions

### Composición declarativa con bloques existentes

El generador reemplazará los 22 bloques convertidos por doce bloques: objetivo y preparación, recorrido de cuatro pasos, enlace oficial, captura de descarga, componentes del instalador, captura del instalador, reinicio en tres pasos, comandos de verificación, captura de resultado, problemas frecuentes y dos validadores. Se evita crear tipos nuevos porque las relaciones son lineales y se expresan correctamente con `steps` y `cards`.

### Orientación estable sin versión fija

El enlace usará `https://nodejs.org/en/download` y el texto indicará “LTS” sin copiar el número vigente. Las capturas se describirán como ilustrativas. Esta decisión evita que una actualización ordinaria convierta una guía correcta en una falsa comprobación de versión.

### Preparación y alcance en el primer bloque

El objetivo aclarará que la guía es para Windows, pedirá guardar archivos y cerrar terminales, y derivará al docente cuando se requieran permisos administrativos o se use otro sistema operativo. Se descarta insertar estas advertencias al final porque llegan tarde para prevenir un bloqueo.

### Componentes y opciones en una cuadrícula equilibrada

Node.js runtime, npm, PATH y herramientas adicionales se presentarán como cuatro tarjetas en dos columnas. Esto recupera la explicación perdida y evita una cuarta tarjeta aislada en escritorio.

### Recuperación gradual y segura

Cada tarjeta de problemas contendrá primero una comprobación reversible y luego un siguiente paso. Para `npm.ps1`, el contenido no recomendará `Set-ExecutionPolicy`; las políticas de PowerShell controlan la ejecución de scripts y pueden estar gestionadas por la organización. El alumno conservará el error y consultará al docente o responsable.

### Dos validadores como única evidencia

Se eliminará el checklist opcional. Los validadores de Node.js y npm conservarán sus `activityKey`, reglas y obligatoriedad, de modo que completar la sección signifique demostrar que ambos comandos respondieron.

### Actualización remota focalizada

El manifiesto se regenerará completo, pero se comprobará por hash que las otras trece secciones no cambien. El actualizador se ejecutará con `--source-key week01_instala_nodejs`, creará una revisión nueva y preservará posición y estado `draft`.

## Risks / Trade-offs

- [La web oficial puede volver a cambiar de diseño] → Referirse a la etiqueta LTS y declarar las capturas como orientativas.
- [El alumno usa otro sistema operativo] → Aclarar el alcance Windows antes del primer paso y derivar al docente.
- [Una solución genérica a npm.ps1 puede debilitar seguridad] → No incluir cambios de política y priorizar consulta con el responsable.
- [La nueva revisión modifica bloques pero no requisitos] → Conservar sin cambios las dos actividades obligatorias y verificar `requirementsRevision`.

## Migration Plan

1. Curar la sección de forma declarativa y regenerar el manifiesto.
2. Probar estructura, textos, activos, enlace oficial, problemas frecuentes y ausencia del checklist.
3. Confirmar por hash que las otras trece secciones permanecen iguales.
4. Ejecutar pruebas de dominio e interfaz, TypeScript, lint, build y validación OpenSpec.
5. Hacer dry-run y aplicar exclusivamente `week01_instala_nodejs` en Cohorte 6 / Semana 1.
6. Verificar estado `draft`, dos validadores, tres imágenes, activos e idempotencia.
7. Para rollback, restaurar el `currentRevision` anterior informado por el actualizador.
