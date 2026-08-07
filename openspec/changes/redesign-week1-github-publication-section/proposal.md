## Why

La sección 13 mezcla dos prototipos, repite el commit local ya enseñado y extiende la lectura a 37 bloques con nombres de repositorio, archivos y capturas incompatibles. El alumno necesita un recorrido breve y comprobable que parta de la versión local existente, publique exactamente ese proyecto y produzca una evidencia que el docente pueda verificar.

## What Changes

- Reemplazar la sección por un recorrido móvil de cuatro etapas: crear un repositorio vacío, conectar `origin`, publicar `main` y verificar la entrega como visitante.
- Alinear nombre, archivos, README y mensaje de commit con `programa-modular-node` y con la sección anterior.
- Explicar la autenticación HTTPS mediante navegador o Git Credential Manager sin introducir contraseñas ni tokens en comandos o URLs.
- Enseñar resultados observables para `git remote -v`, `git push -u origin main`, `git status -sb` y `git log -1 --oneline`.
- Conservar el validador requerido de URL, el generador del comando remoto y la lista final de evidencia, actualizando sus criterios sin cambiar innecesariamente sus identidades académicas.
- Retirar repeticiones y capturas contradictorias, conservando únicamente el visual que representa correctamente el mismo commit local y remoto.
- Añadir pruebas de regresión, validar el manifiesto y actualizar la revisión en borrador de la Cohorte 6 con rollback disponible.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `academic-content`: el contenido semanal de publicación remota debe guiar una secuencia coherente, segura y verificable desde un commit local existente hasta una evidencia pública reproducible.

## Impact

- Curaduría focalizada en `scripts/content/build-week1-manifest.mjs`.
- Manifiesto generado `content/week-01.manifest.json` y pruebas en `lib/content/week1-manifest.test.ts`.
- Revisión de la sección `week01_evidencia_avance` en PocketBase, preservando posición y estado editorial.
- Sin cambios de esquema, rutas, dependencias ni APIs.
