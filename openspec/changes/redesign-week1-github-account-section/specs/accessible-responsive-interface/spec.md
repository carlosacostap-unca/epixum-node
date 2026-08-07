## ADDED Requirements

### Requirement: Comprobación accionable de identificadores externos
El sistema SHALL convertir un identificador externo válido en una acción explícita de comprobación sin transmitir secretos ni afirmar que el recurso remoto existe antes de que el usuario lo abra.

#### Scenario: Nombre de usuario válido
- **WHEN** el estudiante escribe un nombre de usuario de GitHub con formato válido
- **THEN** la interfaz muestra la URL completa y un enlace operable por teclado que se abre en una pestaña aislada

#### Scenario: Nombre de usuario incompleto o inválido
- **WHEN** el valor está vacío o contiene un formato no admitido
- **THEN** la interfaz no genera un enlace navegable y mantiene la explicación necesaria para corregirlo

#### Scenario: Presentación móvil
- **WHEN** el validador se muestra en una pantalla angosta
- **THEN** la URL puede ajustarse o desplazarse dentro de su región y la acción principal permanece visible sin provocar scroll horizontal de página

