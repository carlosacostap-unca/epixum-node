## Context

La importación actual produce quince bloques, incluidos cuatro fragmentos de texto, dos bloques JSON separados, un checklist opcional y una pregunta requerida. Las tres ilustraciones describen arquitectura, secuencia de reserva e interfaz/servidor, pero sus rótulos pueden interpretarse literalmente. Véase `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**

- Formar una secuencia de once bloques que pueda leerse sin depender del HTML original.
- Preservar las tres imágenes y la pregunta obligatoria con sus claves y definición exactas.
- Introducir HTTP mediante un solo ejemplo legible, relacionado con el caso de reserva.
- Hacer visible el camino de rechazo y la ausencia de persistencia cuando una regla falla.

**Non-Goals:**

- Enseñar diseño REST, autenticación, SQL, concurrencia o implementación con Node.js en esta sección.
- Afirmar que toda aplicación utiliza base de datos o servicios externos.
- Modificar el esquema de bloques, el render de la aplicación o la corrección de actividades.
- Cambiar otras secciones, publicación o progreso previo.

## Decisions

### Curaduría declarativa de once bloques

Una función focalizada reutilizará imágenes y pregunta, y sustituirá el resto por objetivo, arquitectura, responsabilidades, frontera de confianza, recorrido, intercambio HTTP, resultados posibles y glosario. Esto evita encabezados sueltos y mantiene cada pantalla con una unidad pedagógica reconocible.

### HTTP sólo entre cliente y servidor

Los epígrafes aclararán que las flechas de solicitud/respuesta representan la comunicación entre front end y back end. La relación con base de datos se explicará como consultas/comandos y resultados, y la relación con servicios externos dependerá de sus propios protocolos. Esta precisión evita convertir una ilustración conceptual en una topología literal.

### Una transcripción, dos resultados

La solicitud y la respuesta exitosa se agruparán en un bloque `terminal` con `POST /reservas`, un cuerpo JSON, `201 Created` y el resultado. Un bloque de tarjetas mostrará éxito y rechazo, incluido `409 Conflict` como ejemplo posible para falta de disponibilidad, sin afirmar que sea la única elección válida de API.

### Pregunta sin cambios

Se reutilizará el objeto de pregunta generado y se retirará el checklist opcional. Así la revisión editorial no modifica la huella de requisitos ni invalida evidencia previa.

## Risks / Trade-offs

- [Los códigos HTTP pueden distraer a principiantes] → presentar sólo método, ruta, un éxito y un conflicto como etiquetas observables, acompañados de lenguaje cotidiano.
- [La imagen de arquitectura rotula todas las flechas como solicitud/respuesta] → corregir la lectura mediante el epígrafe y las tarjetas, sin alterar el activo original.
- [El ejemplo lineal puede ocultar concurrencia o transacciones] → limitar explícitamente el alcance a un modelo inicial y reservar esos temas para semanas posteriores.
- [Una función declarativa se separa del HTML fuente] → probar orden, contenido, activos y estabilidad de las otras trece secciones.

## Migration Plan

1. Regenerar el manifiesto y demostrar que las otras trece secciones no cambian.
2. Ejecutar pruebas de contenido, dominio, interfaz, tipos, lint, build y OpenSpec estricto.
3. Simular la actualización filtrada por `week01_que_hace_backend`.
4. Crear una revisión `draft` preservando posición y publicación.
5. Confirmar activos, idempotencia y revisión de requisitos; conservar la revisión anterior para rollback.
