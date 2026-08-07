## Why

La conversión de “Instalá Node.js” fragmentó el procedimiento en 22 bloques, perdió la secuencia de reinicio y deformó tanto los componentes del instalador como la tabla de resolución de problemas. Para un alumno principiante esto vuelve ambiguo qué descargar, qué conservar, cómo verificar la instalación y qué hacer ante un error.

## What Changes

- Reorganizar la sección como un recorrido completo y predecible para Windows: preparar, descargar LTS, instalar, reiniciar y verificar.
- Mantener el enlace oficial de Node.js sin fijar un número de versión que quede obsoleto.
- Preservar las tres imágenes existentes con epígrafes orientativos que no dependan del aspecto exacto de sitios o instaladores.
- Recuperar la explicación de Node.js runtime, npm, PATH y herramientas adicionales mediante tarjetas legibles.
- Representar el reinicio de Visual Studio Code como una secuencia explícita de tres acciones.
- Reescribir la resolución de `node` no reconocido, `npm` no reconocido y `npm.ps1` bloqueado con comprobaciones seguras y siguientes pasos accionables.
- Retirar el checklist opcional redundante y conservar como evidencia obligatoria las versiones reales de Node.js y npm.
- Actualizar únicamente `week01_instala_nodejs` en Cohorte 6 / Semana 1, preservando su estado `draft`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `academic-content`: La instalación de Node.js se presenta como un procedimiento guiado, verificable y seguro, con recuperación ante errores frecuentes.
- `accessible-responsive-interface`: Pasos, componentes, capturas y problemas de instalación mantienen su jerarquía y legibilidad en pantallas pequeñas.

## Impact

- Curaduría declarativa en `scripts/content/build-week1-manifest.mjs`.
- Manifiesto de Semana 1 y pruebas de contenido en `content` y `lib/content`.
- Nueva revisión de una sola sección en PocketBase; no se modifican las imágenes, la publicación ni las demás secciones.
