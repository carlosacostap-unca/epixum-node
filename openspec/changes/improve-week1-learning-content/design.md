## Context

La fuente estática contiene catorce secciones utilizables y veintisiete imágenes. El generador actual consulta por tipo de elemento en pasadas globales: separa títulos de sus hermanos, toma párrafos del contenedor equivocado y agrupa todos los medios y códigos al final. Como resultado, el manifiesto no respeta el orden del DOM ni conserva enlaces, callouts o listas. Las secciones ya existen como borradores en PocketBase y sus identificadores son consumidos por la interfaz.

## Goals / Non-Goals

**Goals:**

- Generar bloques en el mismo orden pedagógico del DOM con claves estables.
- Aplicar una curaduría explícita de orden, actividades y proyecto de Semana 1 encima de la conversión estructural.
- Actualizar revisiones existentes de forma idempotente y reversible.
- Mantener los veintisiete activos y sus IDs de PocketBase.

**Non-Goals:**

- Reemplazar el editor de bloques o el modelo de progreso.
- Publicar secciones o la semana automáticamente.
- Modificar intentos, progreso o analítica de alumnos.
- Reintroducir el diagnóstico excluido.

## Decisions

### Conversión DOM ordenada con curaduría posterior

El generador recorrerá los hijos del contenedor de contenido en orden y convertirá cada estructura reconocida una sola vez. Los elementos semánticos tendrán conversores dedicados para callout, figure, code, cards/compare, route, glossary y checklist. Luego se aplicará una capa pequeña y declarativa para orden de secciones, enlaces oficiales, preguntas formativas, obligatoriedad y nomenclatura del proyecto.

Se descarta seguir ampliando las consultas globales actuales porque no pueden preservar contexto ni orden. También se descarta mantener un manifiesto escrito completamente a mano porque divergiría del prototipo y haría costosas futuras iteraciones.

### Un recorrido, un proyecto

La práctica integradora será `programa-modular-node` y la publicación se moverá después de su construcción y depuración. El contenido textual, validador y evidencia usarán ese nombre y `historial.txt`. Las capturas externas se presentarán como ilustrativas cuando su texto visual no pueda mantenerse como contrato operativo.

### Actividades declarativas existentes

Las nuevas comprobaciones usarán bloques `question` existentes y respuestas privadas en la revisión. No se incorpora un nuevo tipo de actividad. Los checklists de preparación o autopercepción serán `required: false`; las preguntas conceptuales y validadores técnicos serán requeridos.

### Nueva revisión sobre cada sección

Un script separado planificará y aplicará la actualización. Para cada `sourceKey` existente creará una revisión con número incremental, resolverá referencias de activos y cambiará `currentRevision`. Las posiciones se actualizarán con un desplazamiento temporal para respetar el índice único. El script exigirá cohorte, semana, autor administrador y confirmación exacta.

Se descarta borrar y reimportar secciones porque rompería relaciones y trazabilidad. El rollback consistirá en restaurar los punteros de revisión y posiciones informados por el script.

## Risks / Trade-offs

- [Cambios futuros en el HTML no reconocidos] → Las pruebas exigirán tipos, orden y ausencia de párrafos duplicados o enlaces faltantes.
- [Capturas ilustrativas envejecen] → Los pasos dependerán de enlaces oficiales y texto, no de coordenadas visuales ni versiones exactas.
- [Una nueva actividad invalida una finalización previa] → Las secciones siguen en borrador y el cambio se aplicará antes de exponerlas a alumnos; el script no toca progreso.
- [Fallo parcial durante la actualización] → El resultado registrará revisiones previas y sólo cambiará un puntero después de crear cada revisión válida.

## Migration Plan

1. Generar y validar localmente el manifiesto curado.
2. Ejecutar pruebas de bloques, secuencia, enlaces, actividades y activos.
3. Ejecutar la actualización en modo dry-run para Cohorte 6, Semana 1.
4. Aplicar con confirmación exacta y conservar el mapa de revisiones anterior/nueva.
5. Verificar las catorce vistas previas y los veintisiete activos.
6. Ante rollback, restaurar `currentRevision` y posiciones mediante el mapa emitido, sin eliminar historial.
