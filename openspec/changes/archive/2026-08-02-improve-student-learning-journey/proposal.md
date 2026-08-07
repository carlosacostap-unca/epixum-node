## Why

La experiencia estudiantil ya cuenta con una base visual consistente, pero el recorrido semanal no prioriza la próxima acción académica: el inicio muestra principalmente onboarding, entrar al contenido requiere varios pasos y la reanudación vuelve al principio de la sección. En móvil, además, la navegación global y los controles del lector ocupan simultáneamente el borde inferior.

## What Changes

- Unificar el inicio del estudiante alrededor de una acción principal que retome la sección incompleta más relevante de la cohorte activa.
- Mantener horarios, comunidad y diagnóstico como información de acompañamiento, sin desplazar el acceso al aprendizaje semanal.
- Abrir las semanas directamente en el recorrido de contenidos para estudiantes y conservar el resumen como destino explícito.
- Reanudar una sección en el último bloque alcanzado, sin alterar las reglas existentes de disponibilidad ni finalización.
- Incorporar un modo de lectura móvil que evite la superposición entre la navegación principal y los controles anterior/siguiente.
- Añadir pruebas de integración para el inicio, los enlaces de continuación, la restauración del bloque y la navegación responsive.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `role-based-application-shell`: El inicio semanal del estudiante pasa a priorizar la continuación del aprendizaje y mantiene el onboarding como contenido secundario.
- `academic-content`: Las semanas estudiantiles permiten entrar y reanudar directamente el recorrido de contenidos en el bloque alcanzado.
- `accessible-responsive-interface`: El lector móvil presenta una única zona de navegación inferior operable y sin superposiciones.

## Impact

- Inicio por rol en `app/page.tsx` y experiencia semanal en `components/cohorts`.
- Selección y enlaces de continuación en `lib/content`, listado semanal y lector estudiantil.
- Shell responsive en `components/shell` y estilos/controles del lector.
- Pruebas de componentes y navegación; no se requieren cambios de esquema, datos ni dependencias.
