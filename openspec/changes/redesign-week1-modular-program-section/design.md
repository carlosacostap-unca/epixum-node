## Context

La sección se genera desde el prototipo `12-programa-modular` y actualmente produce veinte bloques, varios de ellos títulos aislados. Conserva un checklist requerido, no posee pregunta conceptual y muestra fragmentos que funcionan solo si el comando se ejecuta desde la carpeta esperada. La sección sigue en borrador en PocketBase, por lo que es posible corregir sus requisitos antes de publicarla. Véase `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**

- Producir una secuencia compacta de bloques con un contrato observable antes del código.
- Mantener CommonJS y callbacks para integrar lo enseñado en las secciones inmediatamente anteriores.
- Hacer que la ubicación de `historial.txt` dependa del módulo y no del directorio de trabajo.
- Validar nombres vacíos, admitir nombres de varias palabras y ofrecer resultados esperados reproducibles.
- Actualizar la evidencia obligatoria para que mida solo logros alcanzables en esta sección.

**Non-Goals:**

- Introducir promesas, paquetes de terceros, interfaces gráficas o ejecución de código dentro de la plataforma.
- Enseñar Git o GitHub antes de sus secciones específicas.
- Crear imágenes nuevas: el prototipo no incluye recursos visuales que deban preservarse.

## Decisions

### Curaduría focalizada y determinista

Se añadirá `curateModularProgramSection` al constructor del manifiesto. La función exigirá que exista el checklist original antes de reemplazar los bloques, conservará su `activityKey` y generará una estructura estable sin títulos enriquecidos aislados. Esto permite probar la sección exacta sin modificar las otras trece.

Alternativa descartada: reescribir el HTML fuente. El manifiesto ya concentra la adaptación del prototipo al modelo editorial de la aplicación y permite conservar el original como referencia.

### Ruta del historial relativa al módulo

`historial.js` combinará `__dirname` con `path.join` para construir la ruta de `historial.txt`. Así el programa conserva su archivo junto al módulo incluso si `app.js` se invoca desde otra carpeta.

Alternativa descartada: mantener `"historial.txt"`. Esa ruta depende del directorio de trabajo del proceso y puede crear el archivo en un lugar inesperado.

### Validación sin terminación abrupta

`app.js` tomará todos los argumentos posteriores al script, los unirá y recortará espacios. Si el resultado queda vacío, mostrará el uso, asignará `process.exitCode = 1` y omitirá la escritura; en caso contrario continuará con saludo e historial.

Alternativa descartada: usar un nombre predeterminado. Oculta el error de uso y contradice la promesa de validar la entrada. También se evita `process.exit(1)` para no promover terminaciones abruptas mientras haya trabajo asíncrono pendiente.

### Dos actividades requeridas

Se conservará el checklist requerido con evidencias observables revisadas y se agregará una pregunta de opción única sobre la transformación de `process.argv`. El cambio de requisitos es deliberado porque la sección todavía es borrador; la actualización remota deberá verificar el nuevo `requirementsRevision` y conservar la revisión anterior como rollback.

## Risks / Trade-offs

- [La sección contiene tres archivos de código relativamente extensos] → Presentar primero árbol, contrato y recorrido, y acompañar cada ejecución con salida esperada.
- [El checklist actualizado invalida una revisión anterior de la actividad] → Aplicar solo en borrador, registrar los identificadores antes y después y conservar rollback.
- [Los mensajes exactos del sistema operativo varían] → Usar un mensaje propio estable y reservar los códigos como `EACCES` o `EPERM` para diagnóstico orientativo.

## Migration Plan

1. Generar y probar localmente el manifiesto revisado, incluido un ensayo real del programa desde la carpeta propia y desde su carpeta padre.
2. Ejecutar una simulación de actualización limitada a `week01_programa_modular` y revisar el cambio de requisitos.
3. Crear una nueva revisión en PocketBase sin alterar el estado de publicación.
4. Verificar idempotencia, activos y los manifiestos de actividad anterior y nuevo.
5. Ante un problema, restaurar el `currentRevision` anterior conservando posición, título y estado.
