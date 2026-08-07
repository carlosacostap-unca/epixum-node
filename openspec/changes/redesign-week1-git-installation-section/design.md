## Context

La conversión genérica conservó tres imágenes, un validador y un generador, pero dividió el texto, deformó tarjetas y ubicó la privacidad después de la captura de datos. El generador actual sustituye variables vacías por cadenas vacías y no ofrece copia, por lo que presenta comandos incompletos sin impedir su uso. La documentación oficial confirma que la identidad queda incorporada a cada commit y que `--global` configura al usuario del equipo.

## Goals / Non-Goals

**Goals:**

- Componer una sección estable de catorce bloques con recursos existentes.
- Corregir la explicación de privacidad antes de mostrar el generador.
- Hacer que el generador sea comprensible y copiable sin enviar sus datos al servidor.
- Conservar la misma evidencia obligatoria de versión de Git.

**Non-Goals:**

- Crear una cuenta de GitHub, publicar repositorios o configurar autenticación remota.
- Enseñar Git Bash, SSH, hooks, firma de commits o configuración avanzada.
- Reescribir commits previos si cambia la identidad.
- Cambiar imágenes, progreso histórico o estado editorial.

## Decisions

### Composición declarativa de catorce bloques

La sección usará: objetivo y distinción Git/GitHub, recorrido de cinco pasos, enlace oficial, captura de descarga, cuatro tarjetas de instalación, captura del instalador, comando de versión, privacidad, generador, captura de configuración, consulta de valores, explicación de `--global` y `main`, problemas frecuentes y validador final. El validador se ubicará al final para que la evidencia cierre el recorrido.

### Arquitectura sin suposición silenciosa

El contenido mencionará x64 como opción habitual y ARM64 para equipos Windows basados en ARM, pero pedirá consultar ante dudas. No se fijará un número de versión porque la página oficial cambia con cada lanzamiento.

### Privacidad antes de introducir datos

La advertencia explicará que Git guarda nombre y correo dentro de futuros commits y que el correo puede ser visible al publicar. Ofrecerá correo verificado o `noreply` de GitHub y un enlace oficial. Se elimina la frase que negaba la posible publicación del correo.

### Generador local con estado explícito

Los valores seguirán almacenados sólo en estado React. Las variables requeridas vacías conservarán su marcador `{{variable}}` en lugar de producir comillas vacías. El botón “Copiar comandos” estará deshabilitado hasta completar todos los campos requeridos y cambiará temporalmente a “Copiados” al escribir en el portapapeles. Las variables opcionales vacías se sustituirán por cadena vacía.

### Configuración global explicada y verificable

El generador conservará nombre, correo y `init.defaultBranch main`. Un bloque posterior consultará esos tres valores. Un `callout` aclarará que `--global` afecta al usuario actual de esa computadora y que `main` sólo define la rama inicial de repositorios futuros.

### Recuperación reversible

Los errores se presentarán como tarjetas de una columna con “Primero” y “Después”. No se indicará modificar permisos del equipo. Corregir nombre o correo consistirá en volver a ejecutar el comando y se advertirá que los commits anteriores no se reescriben.

### Actualización focalizada

El generador y su prueba son reutilizables, pero el manifiesto remoto se aplicará únicamente con `--source-key week01_instala_git`. Se comprobará por hash que las otras trece secciones no cambien y se preservará `draft`.

## Risks / Trade-offs

- [Las pantallas del instalador cambian] → Hablar de valores predeterminados y describir las capturas como orientativas.
- [El alumno aún no tiene GitHub] → Permitir usar un correo que luego verificará o volver tras crear la cuenta para elegir `noreply`; la versión de Git sigue siendo la única evidencia obligatoria.
- [Copiar datos incompletos genera comandos inválidos] → Conservar marcadores y deshabilitar la copia hasta completar requisitos.
- [Una identidad corregida puede interpretarse como retroactiva] → Aclarar que sólo afecta commits futuros.

## Migration Plan

1. Mejorar el generador y cubrir marcadores, habilitación y copia con pruebas.
2. Curar la sección, regenerar el manifiesto y comprobar la invariancia de las otras trece.
3. Validar bloques, enlace, imágenes, privacidad, comandos, errores y evidencia.
4. Ejecutar OpenSpec, pruebas de dominio e interfaz, TypeScript, lint y build.
5. Hacer dry-run y aplicar exclusivamente `week01_instala_git`.
6. Verificar estado, requisitos, activos e idempotencia.
7. Para rollback, restaurar el `currentRevision` anterior informado por el actualizador.
