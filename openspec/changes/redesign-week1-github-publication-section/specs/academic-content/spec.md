## ADDED Requirements

### Requirement: Recorrido verificable de publicación remota

El sistema MUST presentar la publicación de la entrega semanal como una secuencia breve, segura y observable que parte de un commit local existente y termina con una URL de repositorio comprobable por otra persona.

#### Scenario: Continuidad desde la versión local

- **WHEN** el alumno comienza la sección después de guardar su versión con Git
- **THEN** el contenido verifica el estado limpio y el último commit antes de publicar
- **AND** no repite la inicialización, el staging ni la creación del commit

#### Scenario: Repositorio remoto compatible

- **WHEN** el alumno prepara el destino en GitHub
- **THEN** el contenido exige un repositorio público vacío llamado `programa-modular-node`
- **AND** distingue los archivos versionados de resultados locales, dependencias y secretos excluidos

#### Scenario: Conexión y primer envío observables

- **WHEN** el alumno conecta y publica la rama `main` mediante HTTPS
- **THEN** el contenido muestra cómo verificar `origin`, el seguimiento de `origin/main` y el commit publicado
- **AND** explica la autenticación mediante navegador o gestor de credenciales sin incorporar contraseñas ni tokens a comandos o URLs

#### Scenario: Evidencia reproducible

- **WHEN** el alumno termina el primer envío
- **THEN** el contenido le solicita comprobar la página principal como visitante, los cinco archivos esperados, el README ejecutable y el mismo commit local y remoto
- **AND** conserva una validación requerida de la URL del repositorio y una lista final de evidencia

#### Scenario: Recuperación sin pérdida de historia

- **WHEN** aparece un remoto existente, una URL incorrecta, una rama ausente, un rechazo o un secreto expuesto
- **THEN** el contenido ofrece diagnóstico y recuperación contextual
- **AND** no recomienda forzar el push, borrar archivos indiscriminadamente ni considerar seguro un secreto sólo por retirarlo del último archivo
