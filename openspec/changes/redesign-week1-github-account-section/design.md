## Context

La sección importada contiene 26 bloques —18 de texto enriquecido—, tres imágenes ya almacenadas y dos actividades que describen casi el mismo cierre. El validador actual comprueba únicamente la sintaxis del nombre de usuario; no ayuda a confirmar que la URL pertenece al estudiante. Véase `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**

- Reemplazar la fragmentación por catorce bloques declarativos con una secuencia estable aunque cambie la interfaz de GitHub.
- Preservar las tres imágenes, su identidad de activo y el validador requerido.
- Ofrecer una vista previa local y segura del enlace de perfil cuando el nombre tenga formato válido.
- Mantener la revisión de requisitos si la única actividad obligatoria no cambia.

**Non-Goals:**

- Automatizar el registro, consultar la API de GitHub o certificar remotamente la propiedad del perfil.
- Solicitar contraseñas, códigos, métodos 2FA, códigos de recuperación o correos privados como evidencia.
- Convertir la activación de 2FA en requisito evaluable de esta sección.
- Modificar otras secciones, estados de publicación o progreso histórico.

## Decisions

### Curaduría declarativa posterior a la importación

Se incorporará una función focalizada que reutilice los tres bloques de imagen y el validador generado, y reemplace el resto por una composición explícita. Esto conserva activos y claves de actividad mientras permite controlar orden, lenguaje y densidad. Editar el HTML original no garantiza la forma final porque el conversor fragmenta encabezados y párrafos.

### Catorce bloques y una sola evidencia

El recorrido combinará objetivo, mapa, acceso oficial, preparación del registro, tres capturas, verificación y recuperación, seguridad, privacidad, relación Git/GitHub, consulta del correo local y validador. El checklist opcional se elimina porque no demuestra que el perfil exista y agrega una segunda interacción de cierre.

### Vista previa local, sin consulta remota

Cuando el valor cumpla las mismas restricciones sintácticas que el validador, el cliente construirá `https://github.com/{usuario}` y mostrará una acción para abrirla. No se hará `fetch`: evita CORS, dependencia de red adicional, enumeración de usuarios y falsos resultados por límites o indisponibilidad. El texto distinguirá explícitamente formato válido de perfil comprobado.

### Seguridad actualizada sin credenciales

El contenido enlazará documentación oficial y explicará registro social, verificación, 2FA, recuperación y `noreply`. Las capturas continuarán marcadas como ilustrativas. Ningún bloque ni actividad contendrá campos para contraseñas o códigos.

## Risks / Trade-offs

- [Un nombre sintácticamente válido puede no existir] → mostrar la URL como paso de comprobación manual y evitar mensajes de éxito absoluto antes de abrirla.
- [GitHub puede cambiar su interfaz] → describir resultados y rutas conceptuales, usar enlaces oficiales y tratar las capturas como orientativas.
- [La expresión de usuario puede divergir entre cliente y servidor] → cubrir ambos comportamientos con pruebas del mismo conjunto de casos y mantener la expresión equivalente.
- [2FA puede interrumpir el avance si se exige en ese momento] → explicarla con prioridad, pero no convertirla en evidencia obligatoria de esta sección.

## Migration Plan

1. Regenerar el manifiesto y demostrar que las otras trece secciones no cambian.
2. Ejecutar pruebas de contenido, validador, dominio, interfaz, tipos, lint y build.
3. Simular la actualización filtrada por `week01_crea_cuenta_github`.
4. Crear una nueva revisión `draft` preservando posición y publicación.
5. Confirmar activos, idempotencia, actividad obligatoria y revisión de requisitos; conservar el identificador previo para rollback.
