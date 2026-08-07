## Why

La sección “Conocé la terminal integrada” perdió estructura e información al convertir el prototipo: la transcripción aparece como párrafos pegados y la referencia de comandos omite los comandos y las consignas. Esto dificulta que un alumno principiante relacione lo que escribe con la respuesta de la terminal, especialmente en dispositivos móviles.

## What Changes

- Incorporar bloques pedagógicos reutilizables para transcripciones de terminal y referencias de comandos.
- Renderizar ambos bloques de forma accesible, legible y adaptable a escritorio y móvil, con acciones de copia donde aporten valor.
- Reducir la sección de terminal a un recorrido de aproximadamente diez bloques coherentes, sin perder conceptos, errores frecuentes ni práctica.
- Corregir `cd ..` como navegación a la carpeta padre y aclarar las diferencias visuales entre PowerShell y terminales tipo Bash.
- Reemplazar la pregunta sobre `node app.js` por una comprobación basada en `echo Hola`, ya presentado en la explicación.
- Retirar la autoevaluación opcional redundante y conservar una única comprobación obligatoria.
- Actualizar únicamente la revisión de esta sección en Cohorte 6 / Semana 1, preservando su estado editorial.

## Capabilities

### New Capabilities

- `technical-learning-visuals`: Bloques estructurados para representar conversaciones de terminal y referencias ejecutables de comandos.

### Modified Capabilities

- `academic-content`: La sección de terminal de Semana 1 conserva la semántica del prototipo y presenta un recorrido condensado y correcto.
- `accessible-responsive-interface`: Las referencias técnicas se adaptan a pantallas pequeñas sin perder asociaciones entre etiquetas, comandos y explicaciones.

## Impact

- Esquema y tipos de bloques en `lib/content`.
- Renderizador, editor y pruebas de componentes en `components/content`.
- Conversor y manifiesto de Semana 1 en `scripts/content` y `content`.
- Nueva revisión remota de una sola sección en PocketBase; no cambia publicación, progreso histórico ni activos.
