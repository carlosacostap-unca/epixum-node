## Why

La conversión de “Creá tu cuenta de GitHub” fragmentó un procedimiento breve en 26 bloques y duplicó la evidencia final con un checklist opcional y un validador. Un alumno principiante necesita distinguir la cuenta, el perfil público y el repositorio; tomar decisiones de seguridad y privacidad antes de publicar; y comprobar que el usuario ingresado conduce a su perfil real.

## What Changes

- Reorganizar la sección como un recorrido de registro, verificación, comprobación del perfil, seguridad y relación con Git.
- Actualizar el registro para contemplar una cuenta personal gratuita y las opciones vigentes de creación directa o inicio social sin depender del diseño exacto de GitHub.
- Mantener las tres capturas ilustrativas con epígrafes que aclaren qué debe comprobarse y qué elementos pueden cambiar.
- Explicar qué datos son públicos, evitar datos personales innecesarios en el nombre de usuario y diferenciar ese usuario del nombre configurado en Git.
- Incorporar recuperación concreta cuando no llega el correo o el enlace de verificación vence.
- Presentar 2FA como protección recomendada o potencialmente requerida para contribuyentes, junto con el resguardo privado de códigos y métodos de recuperación.
- Relacionar el correo verificado o `noreply` de GitHub con la atribución de commits y volver a comprobar la configuración local.
- Mejorar el validador de usuario para construir un enlace seguro al perfil y aclarar que el formato válido no prueba por sí solo que la cuenta exista.
- Retirar el checklist opcional redundante y conservar el nombre de usuario como evidencia obligatoria.
- Actualizar únicamente `week01_crea_cuenta_github` en Cohorte 6 / Semana 1, preservando su estado `draft`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `academic-content`: La creación de una cuenta de GitHub se presenta como un procedimiento actualizado, verificable y seguro, conectado con la atribución de commits de la cursada.
- `accessible-responsive-interface`: El validador de usuario ofrece una comprobación accionable del perfil sin solicitar secretos y mantiene una lectura jerárquica en escritorio y móvil.

## Impact

- Curaduría declarativa en `scripts/content/build-week1-manifest.mjs`.
- Render y pruebas del validador en `components/content`.
- Manifiesto y pruebas de Semana 1 en `content` y `lib/content`.
- Nueva revisión de una sola sección en PocketBase; no cambia la publicación, las imágenes ni las demás secciones.
