## Context

`curateSectionFlow` ya separa los bloques remotos del prototipo y deja trece bloques locales en posición 12. Sin embargo, ese subconjunto conserva títulos sueltos, vocabulario de remoto y push, un README y una prueba desactualizados, y una secuencia `git add .` seguida directamente por el commit. La pregunta requerida ya distingue correctamente commit de publicación.

## Goals / Non-Goals

**Goals:**

- Construir un modelo mental explícito de carpeta, staging, commit y repositorio local.
- Alinear la preparación con los archivos y la interfaz actual del programa modular.
- Evitar que `historial.txt`, `.env`, logs o dependencias entren accidentalmente al commit.
- Hacer obligatoria en el recorrido la revisión de `git status --short` y `git diff --cached`.
- Probar todos los comandos en un repositorio temporal real.

**Non-Goals:**

- Crear o conectar un repositorio de GitHub, configurar remotos o ejecutar push.
- Enseñar ramas múltiples, rebase, merge o recuperación avanzada del historial.
- Cambiar la configuración global de Git del entorno de desarrollo durante las pruebas.

## Decisions

### Curaduría posterior a la separación local/remota

Se añadirá `curateLocalGitSection` después de `curateSectionFlow`, no antes. Así la función recibirá sólo el tramo local ya separado y podrá reemplazarlo de manera determinista conservando la pregunta que `curateSectionFlow` deja al final.

Alternativa descartada: ejecutarla antes de `curateSectionFlow`. Esa función busca marcadores de texto del prototipo para dividir bloques y fallaría si la curaduría los reemplaza primero.

### Staging explícito e inspeccionable

La guía usará `git add .gitignore README.md app.js saludos.js historial.js`, seguido por `git status --short`, `git diff --cached --stat` y `git diff --cached`. Esto enseña que el staging define el contenido exacto del próximo commit.

Alternativa descartada: `git add .`. Es válido, pero en el primer contacto oculta la decisión de selección y aumenta el riesgo de incluir archivos generados o sensibles antes de que el estudiante aprenda a inspeccionarlos.

### `.gitignore` antes de `git init` y `git add`

La sección creará `.gitignore` con `node_modules/`, `.env`, `*.log` e `historial.txt` antes de consultar el estado. También aclarará que las reglas se aplican a archivos no registrados y que ignorar no limpia un secreto ya preparado o confirmado.

Alternativa descartada: omitir `historial.txt`. Es una salida acumulativa de ejecución y volvería cada prueba un cambio pendiente sin valor pedagógico como código fuente.

### Resultados estables en vez de hashes exactos

Las terminales usarán marcadores `??` y `A`, un hash representado como `<hash>` y ausencia de salida para el estado corto limpio. El texto no dependerá de un identificador real ni del idioma completo de Git.

Alternativa descartada: reproducir una salida larga exacta. Hash, rutas, cantidad de líneas e idioma varían legítimamente.

### Prueba temporal sin modificar identidad global

La verificación creará un repositorio aislado, usará una identidad local con opciones `-c` durante el commit, comprobará los cinco archivos más `.gitignore`, verificará que `historial.txt` esté ignorado y eliminará el fixture al terminar.

## Risks / Trade-offs

- [La lista explícita debe mantenerse alineada con el proyecto] → Probar exactamente cinco archivos versionados y fallar si aparece el historial generado.
- [Git antiguo puede no aceptar `git init -b main`] → Mantener una alternativa visible con `git init` y `git branch -M main`.
- [El paginador puede abrirse con `git diff --cached`] → Indicar que `q` vuelve a la terminal sin modificar el contenido.
- [Un archivo ignorado pudo haberse preparado antes] → Enseñar `git restore --staged <archivo>` como retiro no destructivo y aclarar que el archivo permanece en disco.

## Migration Plan

1. Implementar y probar el manifiesto local, preservando la pregunta requerida.
2. Crear y ejecutar un repositorio temporal con los mismos archivos, exclusiones y comandos.
3. Ejecutar validaciones de contenido, interfaz, tipos, lint focalizado, build y OpenSpec.
4. Simular la actualización remota limitada a `week01_publica_primera_entrega` y comprobar estabilidad de requisitos.
5. Crear la revisión en borrador y conservar la anterior como rollback.
