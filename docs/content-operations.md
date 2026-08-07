# Operación del módulo de contenidos semanales

Esta guía describe el despliegue seguro, la importación de la Semana 1 y la administración cotidiana del contenido. Todos los comandos que modifican PocketBase exigen una confirmación explícita y deben ejecutarse primero en un entorno de prueba.

## 1. Preparación y esquema

1. Confirmar que las variables de PocketBase apuntan al entorno deseado.
2. Inspeccionar el plan sin escribir:

   ```powershell
   npm run schema:content
   ```

3. Revisar que el plan sólo incluya las siete colecciones `content_*`.
4. Aplicar el esquema en prueba:

   ```powershell
   npm run schema:content -- --apply
   ```

5. Repetir el dry-run. Debe informar `changed: false`.
6. Validar con cuentas `admin`, `docente` y `estudiante`: las revisiones, respuestas correctas, intentos, progreso y bases no deben quedar expuestos por la API al alumno.

   ```powershell
   npm run schema:content:verify -- --admin ADMIN_USER_ID --teacher TEACHER_USER_ID --student STUDENT_USER_ID
   ```

El instalador es idempotente y no elimina registros ni colecciones existentes.

## 2. Importación de la Semana 1

El manifiesto se reconstruye desde `docs/contenidos/semana-01` con:

```powershell
npm run content:manifest:week1
```

El resultado esperado es `content/week-01.manifest.json`, con catorce secciones. El diagnóstico de JavaScript queda excluido porque la cohorte 6 ya utiliza el diagnóstico propio de la aplicación.

La importación necesita los IDs exactos de la cohorte semanal, la semana de destino y un usuario administrador:

```powershell
npm run content:import:week1 -- --cohort COHORT_ID --week WEEK_ID --author ADMIN_USER_ID
```

Ese comando es un dry-run: muestra secciones y activos por crear, elementos ya existentes que omitirá y el destino resuelto. Antes de aplicar, comprobar:

- que la cohorte sea la cohorte 6 y tenga modalidad `weekly`;
- que la semana pertenezca a esa cohorte;
- que aparezcan catorce secciones si el destino está vacío;
- que ninguna sección corresponda al diagnóstico;
- que todas queden con estado `draft`.

La escritura requiere repetir el ID de la semana:

```powershell
npm run content:import:week1 -- --cohort COHORT_ID --week WEEK_ID --author ADMIN_USER_ID --apply --confirm-week WEEK_ID
```

Después, repetir el dry-run. Debe omitir las secciones y medios ya importados. `sourceKey` e `importKey` impiden duplicarlos; la importación nunca publica la semana ni las secciones.

Para actualizar una Semana 1 ya importada con una nueva versión del manifiesto, usar el actualizador de revisiones. El primer comando no escribe y muestra, para cada `sourceKey`, la revisión actual y la propuesta:

```powershell
npm run content:update:week1 -- --cohort COHORT_ID --week WEEK_ID --author ADMIN_USER_ID
npm run content:update:week1 -- --cohort COHORT_ID --week WEEK_ID --author ADMIN_USER_ID --apply --confirm-week WEEK_ID
```

Para revisar y actualizar una sola sección sin escribir sobre las demás, agregar su clave estable a ambos comandos:

```powershell
npm run content:update:week1 -- --cohort COHORT_ID --week WEEK_ID --author ADMIN_USER_ID --source-key week01_conoce_la_terminal
npm run content:update:week1 -- --cohort COHORT_ID --week WEEK_ID --author ADMIN_USER_ID --source-key week01_conoce_la_terminal --apply --confirm-week WEEK_ID
```

El modo focalizado rechaza cambios de posición, porque un reordenamiento debe validarse sobre la semana completa.

El actualizador conserva `draft`, `scheduled`, `published` o `hidden`; nunca cambia la publicación. Crea una revisión inmutable sólo cuando difieren los bloques, reordena mediante posiciones temporales y restaura punteros, metadatos y posiciones originales si una escritura falla. Al repetir el dry-run después de aplicar, el resultado esperado es `createRevisions: 0` y `skipUnchanged: 14`.

La primera base semanal también se prepara con dry-run y confirmación explícita:

```powershell
npm run content:base:week -- --week WEEK_ID --author ADMIN_USER_ID --name "Semana 1 — Base inicial"
npm run content:base:week -- --week WEEK_ID --author ADMIN_USER_ID --name "Semana 1 — Base inicial" --apply --confirm-week WEEK_ID
```

Al repetir el primer comando debe informar `skip_existing` y los IDs de la base y versión ya creadas.

## 3. Flujo editorial

- `draft`: sólo personal; permite preparar y previsualizar.
- `scheduled`: aparece cuando vence la fecha programada, siempre que la semana también esté publicada.
- `published`: aparece inmediatamente si la semana está publicada.
- `hidden`: deja de aparecer al alumno, pero conserva revisiones, intentos y progreso.

Guardar una sección publicada crea una revisión inmutable y actualiza inmediatamente lo que ve el alumno. Si cambian las actividades requeridas, la sección vuelve a quedar pendiente hasta que el alumno domine los nuevos requisitos; el historial anterior no se borra.

La vista previa como alumno no registra aperturas, intentos ni avance. Los botones anterior y siguiente sólo recorren secciones efectivamente disponibles.

## 4. Medios y contenido externo

- Imágenes subidas: JPEG, PNG, WebP o GIF; máximo 10 MB; requieren texto alternativo.
- Videos subidos: MP4 o WebM; máximo 100 MB; requieren título accesible.
- Imágenes y videos externos: URL HTTPS.
- Embeds: únicamente proveedores admitidos y normalizados por el dominio.
- Código: se muestra con resaltado y copia; nunca se ejecuta en el navegador ni en el servidor.

PocketBase admite hasta 100 MB en el campo físico para cubrir videos. La aplicación aplica el límite más estricto de 10 MB para imágenes antes de subirlas. Los archivos son protegidos y el servidor entrega referencias autorizadas.

## 5. Bases, copias e historial

Sólo un administrador puede operar `/admin/content-bases`.

Una base puede abarcar un curso, una semana o una sección. Promover contenido crea una versión inmutable que contiene únicamente material pedagógico: no copia publicaciones, programaciones, matrículas, progreso ni intentos. Las cohortes existentes no cambian automáticamente.

Al aplicar una versión se muestra primero el resumen de semanas, secciones y bloques. La confirmación crea una copia independiente y en borrador. Las modificaciones posteriores de esa copia no cambian la base ni otras cohortes.

Restaurar una versión histórica no sobrescribe el historial: crea una versión nueva con la instantánea elegida y la marca como actual. Para convertir una copia mejorada en la nueva base, promover esa copia desde el mismo panel.

## 6. Trazabilidad y privacidad

El tablero docente permite recorrer datos por sección, alumno y actividad. Distingue apertura, avance, finalización y dominio; no interpreta una simple visualización como lectura efectiva. Los intentos son append-only, las respuestas se corrigen en el servidor y las proyecciones para alumnos eliminan respuestas correctas y reglas privadas.

## 7. Rollback y recuperación

Antes del despliegue, conservar un backup verificable de PocketBase. Si falla la aplicación:

1. volver a desplegar la versión anterior del código;
2. no eliminar las colecciones `content_*` ni sus relaciones, porque contienen historial y progreso;
3. ocultar secciones afectadas para retirarlas del alumno sin perder datos;
4. corregir y volver a ejecutar los comandos idempotentes;
5. para contenido base, restaurar la versión anterior desde el historial, lo que genera una versión nueva auditable.

Si una importación se interrumpe, no borrar en bloque. Repetir primero el dry-run: las claves estables harán que continúe sólo con los elementos faltantes. Cualquier eliminación manual de contenido o activos debe hacerse únicamente después de identificar las referencias y contar con un backup.

Cada aplicación de `content:update:week1` devuelve un arreglo `rollback` con el ID de sección, la revisión anterior, posición, título y resumen. Para revertir manualmente una actualización pedagógica:

1. ocultar temporalmente la semana o mantener sus secciones en borrador;
2. tomar los valores `previousRevisionId` del resultado guardado de la aplicación;
3. mover primero las secciones a posiciones temporales que no colisionen;
4. restaurar en cada registro `content_sections` el puntero `currentRevision`, la posición, el título y el resumen informados;
5. comprobar las catorce secciones en vista previa y recién entonces recuperar sus estados editoriales originales;
6. conservar las revisiones nuevas para auditoría: cambiar el puntero es suficiente y evita perder historial.

El 1 de agosto de 2026 se aplicó la revisión pedagógica v2 a Cohorte 6 / Semana 1: catorce revisiones nuevas, 267 bloques, ocho preguntas autocorregibles y veintisiete activos verificados. Todas las secciones permanecieron en `draft`. El dry-run posterior omitió las catorce por no tener cambios.

Ese mismo día se aplicó la revisión 3 únicamente a `week01_conoce_la_terminal`: diez bloques, una transcripción estructurada, seis comandos completos y una pregunta requerida. La sección permaneció en posición 2 y estado `draft`; su revisión anterior para rollback es `bb694a2899e5c84`. El dry-run posterior informó `skipUnchanged: 1`.

## 8. Lista previa al despliegue

- Pruebas unitarias y de componentes en verde.
- TypeScript, ESLint y build de producción en verde.
- Esquema aplicado y segundo dry-run sin cambios.
- Roles verificados con tres cuentas de prueba.
- Importación aplicada únicamente a la semana confirmada y segundo dry-run sin duplicados.
- Primera base creada desde el contenido revisado.
- Flujo docente y alumno probado en escritorio y móvil, tema claro y oscuro.
- Consultas y tiempos medidos con una cohorte de volumen representativo.
