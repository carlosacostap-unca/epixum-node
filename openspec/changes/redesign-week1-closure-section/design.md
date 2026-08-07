## Context

`week01_cierre_glosario` ocupa la posición 14 y actualmente contiene 11 bloques. La extracción conserva encabezados como bloques separados, transforma seis ideas en pasos llamados “Paso 1” a “Paso 6” y fusiona dos contrastes distintos dentro de cada tarjeta “Idea”. El glosario tiene seis términos, la lista opcional usa afirmaciones subjetivas y el mensaje de éxito aparece antes de las actividades.

La pregunta múltiple requerida ya evalúa tres relaciones centrales y debe conservarse sin cambios para mantener su identidad académica. El manifiesto se regenera desde el prototipo, por lo que la solución debe vivir en una curaduría posterior a las demás secciones.

## Goals / Non-Goals

**Goals:**

- Convertir la sección en una síntesis accionable y breve, sin agregar teoría nueva.
- Mostrar el proyecto semanal como una cadena de decisiones y evidencias.
- Facilitar el repaso selectivo mediante rutas de recuperación concretas.
- Mantener estable la actividad requerida y la revisión de requisitos.

**Non-Goals:**

- Volver a explicar en profundidad terminal, runtime, event loop, módulos, errores o Git.
- Agregar una evaluación integradora extensa o exigir nuevamente la URL del repositorio.
- Definir el programa pedagógico de la Semana 2.

## Decisions

### Curaduría final posterior a todo el recorrido

Se añadirá `curateWeekClosureSection` después de `curateGitHubPublicationSection`. La función reemplazará los bloques de `14-cierre-glosario` y reutilizará la pregunta y el checklist extraídos del prototipo.

Alternativa descartada: corregir únicamente títulos. Eso dejaría las fusiones conceptuales, la secuencia de éxito prematura y las afirmaciones subjetivas sin resolver.

### Once bloques con una función distinta

La sección tendrá: objetivo, recuperación activa, reconstrucción en seis etapas, mapa del proyecto, referencia de comandos, cinco contrastes, glosario ampliado, rutas de repaso, pregunta requerida, autoevaluación opcional y cierre. El único `rich_text` pedirá recordar evidencias antes de mostrar la síntesis; no habrá encabezados aislados ni imágenes nuevas.

El mapa conservará los cinco archivos versionados y distinguirá `historial.txt` como resultado local ignorado. La referencia reutilizará comandos exactos ya probados: ejecución con argumento, estado, último commit, remoto y push.

### Identidades académicas mínimamente afectadas

`week01_cierre_glosario_question` se conservará byte a byte en su definición académica. `week01_cierre_glosario_checklist` seguirá siendo opcional, pero sus etiquetas cambiarán de “puedo” a evidencias concretas; su `activityRevision` cambiará, mientras que `requirementsRevision` debe permanecer estable porque sólo depende de la pregunta requerida.

### Cierre condicional y continuidad neutra

El callout final no afirmará que el alumno aprendió todo por haber llegado al bloque. Reconocerá la base construida después de las actividades e indicará conservar `programa-modular-node` y su URL. No nombrará NPM, `package.json` ni otros contenidos futuros hasta que exista un plan confirmado.

### Actualización versionada

La sección se actualizará mediante el flujo focalizado existente, preservando posición 14 y estado `draft`. Se verificarán idempotencia, activos, actividad requerida estable, checklist opcional revisado y rollback.

## Risks / Trade-offs

- [Un cierre demasiado compacto puede parecer superficial] → Cada síntesis remite a una evidencia o sección concreta, sin intentar sustituir el desarrollo anterior.
- [El checklist opcional no determina la finalización] → La pregunta requerida conserva el dominio conceptual; la lista funciona como diagnóstico honesto y ruta de repaso.
- [El glosario puede crecer demasiado] → Limitarlo a términos utilizados efectivamente en el proyecto y definiciones de una o dos oraciones.
- [Una promesa sobre la semana siguiente puede quedar obsoleta] → Usar una transición neutral basada en conservar el proyecto como punto de partida.

## Migration Plan

1. Implementar la curaduría y las pruebas de regresión.
2. Regenerar y validar el manifiesto completo.
3. Ejecutar pruebas, tipos, lint, build y validación OpenSpec estricta.
4. Ensayar la actualización focalizada y comparar revisiones académicas.
5. Aplicar la revisión en PocketBase y verificar idempotencia y rollback.
