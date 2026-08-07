## Context

La sección `week01_evidencia_avance` se forma al combinar el tramo remoto de `07-publica-primera-entrega` con `15-evidencia-avance`. Después de `curateSectionFlow` contiene 37 bloques, dos actividades requeridas y seis capturas; varias referencias todavía usan `entrega-semana-1`, `operaciones.js`, `saludos.txt`, `historial.txt` versionado o un commit distinto del producido en la sección 12.

El manifiesto se regenera desde los prototipos, por lo que la corrección debe vivir en el constructor y ejecutarse después de la separación del flujo local/remoto. PocketBase conserva revisiones y el estado editorial de la sección.

## Goals / Non-Goals

**Goals:**

- Reducir la carga de lectura y el desplazamiento móvil sin omitir los puntos de decisión del primer push.
- Mantener alineados proyecto, comandos, resultados, visuales y evidencia.
- Hacer observable cada transición: commit local, remoto configurado, rama publicada y enlace verificable.
- Preservar las claves estables del validador y la lista final, aunque sus definiciones cambien cuando sea necesario para corregir el criterio académico.

**Non-Goals:**

- Automatizar la creación del repositorio de GitHub o ejecutar el push en nombre del alumno.
- Enseñar SSH, GitHub CLI, ramas colaborativas, pull requests o reescritura avanzada de historia.
- Verificar desde el servidor que una URL pública realmente contiene todos los archivos; la actividad actual valida su forma y la lista final registra la comprobación del alumno.

## Decisions

### Curaduría posterior a la separación del flujo

Se añadirá `curateGitHubPublicationSection` después de `curateSectionFlow` y `curateLocalGitSection`. Así la función recibirá la sección remota definitiva y podrá reemplazarla sin alterar la extracción original ni volver a mezclar Git local con GitHub.

Alternativa descartada: editar los HTML prototipo. Mantendría duplicaciones entre dos fuentes y permitiría que la lógica de unión volviera a producir un recorrido extenso.

### Un solo recorrido de aproximadamente veinte bloques nativos

La sección usará `callout`, `steps`, `cards`, `code`, `terminal`, `generator`, `image`, `validator` y `checklist`. La secuencia será: precondición local, repositorio vacío, conexión HTTPS, primer push, comprobación autor/visitante/docente y recuperación segura.

Se conservará sólo `week01_evidencia_avance_image_2`, porque representa correctamente el commit `Completa programa modular` en ambos lados. Las otras capturas se excluirán de esta sección por nombres, archivos o estados incompatibles y por su dependencia de una interfaz de GitHub cambiante.

### Evidencia alineada con el repositorio real

El repositorio publicado contendrá exactamente `.gitignore`, `README.md`, `app.js`, `saludos.js` e `historial.js`. `historial.txt`, `.env`, logs y `node_modules` permanecerán locales. El README repetirá `node app.js "Ana Pérez"` y el commit verificable será `Completa programa modular`.

El validador conservará `week01_publica_primera_entrega_repository_url` y la regla `github_repository_url` para `programa-modular-node`. El generador seguirá creando `git remote add origin` y `git remote -v`. La lista `week01_evidencia_avance_checklist` seguirá siendo requerida, pero actualizará sus etiquetas; por lo tanto, su `activityRevision` y la `requirementsRevision` pueden cambiar legítimamente.

### Verificación técnica sin depender de una cuenta externa

Además de las pruebas estructurales del manifiesto, se ejecutará el recorrido Git contra un repositorio bare temporal local: crear commit, agregar `origin`, hacer `push -u`, comprobar seguimiento, estado e igualdad de referencias. Esto verifica la mecánica del flujo sin crear repositorios reales ni usar credenciales.

La creación de un repositorio vacío, la autenticación HTTPS y la visibilidad pública se contrastarán con la documentación oficial de GitHub.

### Actualización focalizada y reversible

El script existente hará ensayo y aplicación filtrados por `week01_evidencia_avance`. Se conservarán posición, título operativo y estado `draft`; se comprobarán activos, idempotencia, revisiones académicas y el identificador anterior para rollback.

## Risks / Trade-offs

- [La interfaz de GitHub puede cambiar] → Describir decisiones y resultados, usar un solo visual conceptual y evitar instrucciones dependientes de coordenadas o botones efímeros.
- [El validador comprueba formato, no contenido remoto] → Mantener una lista requerida con prueba como visitante y explicar claramente el alcance de cada comprobación.
- [La nueva lista invalida progreso previo] → La sección está en borrador y el cambio de criterios justifica una nueva revisión académica; verificarlo antes de aplicar.
- [Un repositorio público expone todo el historial] → Revisar secretos antes del push y enseñar revocación o rotación inmediata si alguno se publica.

## Migration Plan

1. Añadir la curaduría y las pruebas de regresión.
2. Regenerar y validar el manifiesto.
3. Ejecutar el flujo contra un remoto bare temporal y eliminar la prueba reproducible.
4. Ejecutar pruebas, tipos, lint, build y validación OpenSpec estricta.
5. Ensayar y aplicar una revisión focalizada en PocketBase.
6. Verificar idempotencia y conservar el identificador de revisión anterior para rollback.
