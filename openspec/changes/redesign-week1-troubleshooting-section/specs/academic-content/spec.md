## ADDED Requirements

### Requirement: Diagnóstico reproducible de errores iniciales
La guía de errores de la Semana 1 SHALL enseñar una rutina que parta de reproducir el fallo, preserve el mensaje completo, ubique la primera referencia al proyecto, formule una hipótesis concreta, cambie una sola causa y vuelva a ejecutar el mismo comando.

#### Scenario: Estudiante investiga un fallo
- **WHEN** el estudiante encuentra un error al ejecutar el programa modular
- **THEN** la sección le permite convertir el mensaje en una hipótesis comprobable sin reinstalar herramientas ni modificar varias partes a la vez

#### Scenario: Estudiante solicita ayuda
- **WHEN** la corrección mínima no resuelve el fallo
- **THEN** la sección ofrece una plantilla para compartir comando, mensaje completo, ubicación, hipótesis, cambio realizado y nuevo resultado

### Requirement: Ejemplos contextualizados y canales de error
La sección SHALL relacionar los errores frecuentes con el programa modular y SHALL distinguir errores de análisis o ejecución inmediata de errores asincrónicos recibidos por callback.

#### Scenario: Módulo local sin prefijo relativo
- **WHEN** un módulo vecino se importa como paquete y Node.js informa `MODULE_NOT_FOUND`
- **THEN** la sección muestra la evidencia relevante, explica la resolución y aplica como único cambio el prefijo relativo antes de comprobar la salida correcta

#### Scenario: Escritura asincrónica falla
- **WHEN** una operación de archivos entrega un error a su callback
- **THEN** la sección indica consultar al menos su código y ruta dentro de esa callback, sin sugerir que un `try/catch` externo capture el resultado posterior

### Requirement: Alcance y actividad de la guía
La sección SHALL limitarse a conceptos disponibles al finalizar el programa modular y SHALL conservar la pregunta requerida existente sin agregar nuevos requisitos de finalización.

#### Scenario: Estudiante recorre la guía
- **WHEN** el estudiante abre la sección
- **THEN** no necesita conocer `await`, promesas ni procesamiento JSON para comprender los casos presentados

#### Scenario: Revisión editorial del contenido
- **WHEN** se publica una nueva revisión de la guía
- **THEN** la pregunta requerida mantiene su identificador, enunciado, opciones y respuesta correcta, y la autoevaluación opcional no condiciona el progreso
