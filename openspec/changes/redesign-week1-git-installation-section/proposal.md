## Why

La conversión de “Instalá Git” fragmentó el recorrido en 28 bloques, perdió estructuras esenciales y dejó una afirmación incorrecta sobre la privacidad del correo de los commits. Un alumno principiante necesita distinguir Git de GitHub, instalar sin adivinar opciones, elegir su identidad con información suficiente y comprobar cada resultado antes de continuar.

## What Changes

- Reorganizar la sección como un recorrido de instalación, verificación y configuración de Git para Windows.
- Mantener la descarga oficial y explicar la elección entre x64 y ARM64 sin fijar una versión concreta.
- Preservar las tres imágenes existentes con epígrafes orientativos.
- Recuperar la distinción entre Git local y GitHub remoto, y explicar las opciones principales del instalador sin exigir memorizarlas.
- Mover la decisión de privacidad antes del generador y aclarar que el correo queda incorporado a los commits futuros y puede ser visible al publicarlos.
- Explicar el alcance de `--global`, la rama inicial `main` y cómo consultar los valores guardados.
- Reescribir la recuperación ante Git no reconocido, permisos insuficientes y datos de autoría incorrectos.
- Mejorar el generador reutilizable para conservar marcadores hasta completar los campos y habilitar una copia accesible sólo cuando los datos requeridos estén completos.
- Retirar el checklist opcional redundante y mantener `git --version` como evidencia obligatoria.
- Actualizar únicamente `week01_instala_git` en Cohorte 6 / Semana 1, preservando su estado `draft`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `academic-content`: La instalación y configuración inicial de Git se presenta como un procedimiento verificable, seguro y correcto respecto de la autoría y privacidad de los commits.
- `accessible-responsive-interface`: El generador y el recorrido técnico conservan jerarquía, marcadores, controles de copia y legibilidad en escritorio y móvil.

## Impact

- Curaduría declarativa en `scripts/content/build-week1-manifest.mjs`.
- Render y pruebas del generador en `components/content`.
- Manifiesto y pruebas de Semana 1 en `content` y `lib/content`.
- Nueva revisión de una sola sección en PocketBase; no cambia la publicación, las imágenes ni las demás secciones.
