## Purpose

Administrar contenido base reutilizable y versionado en los niveles de curso, semana y sección, manteniendo copias de cohorte independientes y un historial recuperable.

## ADDED Requirements

### Requirement: Copias independientes desde una base
El sistema SHALL permitir crear contenido de una cohorte a partir de una versión base y SHALL conservar la relación de procedencia sin mantener sincronización automática con la base.

#### Scenario: Crear una copia desde una base
- **WHEN** un usuario autorizado aplica una base de curso, semana o sección a un destino compatible
- **THEN** el sistema crea una copia editable con referencia a la versión de origen

#### Scenario: Personalizar una copia
- **WHEN** un docente modifica la copia de una cohorte
- **THEN** el cambio afecta solamente a esa copia
- **AND** no modifica la base ni otras cohortes

#### Scenario: Publicar una nueva base
- **WHEN** se crea una versión base posterior
- **THEN** las copias existentes conservan su contenido actual
- **AND** los destinos futuros pueden utilizar la nueva versión

### Requirement: Bases en tres niveles
El sistema MUST admitir bases independientes de curso, semana y sección, respetando la jerarquía de cada nivel al copiarlas o promoverlas.

#### Scenario: Copiar una base de curso
- **WHEN** se aplica una base de curso a una cohorte compatible
- **THEN** el sistema copia la estructura de semanas, secciones, bloques y actividades incluida en esa versión

#### Scenario: Copiar una base de semana
- **WHEN** se aplica una base de semana a una cohorte compatible
- **THEN** el sistema crea una semana con sus secciones, bloques y actividades en el destino

#### Scenario: Copiar una base de sección
- **WHEN** se aplica una base de sección a una semana
- **THEN** el sistema crea una sección independiente con sus bloques y actividades

### Requirement: Promoción administrativa a versión base
Solamente un administrador MUST poder promover una copia de curso, semana o sección a una nueva versión base.

#### Scenario: Administrador promueve contenido
- **WHEN** un administrador confirma la promoción de una copia válida
- **THEN** el sistema crea una nueva versión base inmutable en el mismo nivel
- **AND** registra su autor, fecha y procedencia

#### Scenario: Docente intenta promover contenido
- **WHEN** un docente intenta promover contenido a versión base
- **THEN** el sistema rechaza la operación sin crear una versión

### Requirement: Alcance pedagógico de las versiones base
Una versión base SHALL contener únicamente estructura y contenido pedagógico; SHALL excluir estados de publicación, programación, matrículas, estudiantes, progreso, visualizaciones e intentos.

#### Scenario: Promoción de una semana utilizada
- **WHEN** un administrador promueve una semana que tiene publicación y actividad estudiantil
- **THEN** la versión base contiene sus secciones, orden, bloques, medios y actividades
- **AND** no contiene estados operativos ni datos de estudiantes

### Requirement: Historial inmutable y restauración
El sistema SHALL conservar todas las versiones base anteriores y SHALL restaurar una versión histórica creando una nueva versión actual, sin reescribir ni eliminar el historial.

#### Scenario: Consultar historial
- **WHEN** un administrador abre una base
- **THEN** el sistema lista sus versiones con número, fecha, autor y procedencia

#### Scenario: Restaurar una versión anterior
- **WHEN** un administrador confirma la restauración de una versión histórica
- **THEN** el sistema crea una nueva versión cuyo contenido replica la versión seleccionada
- **AND** conserva intactas todas las versiones anteriores

### Requirement: Aplicación compatible y explícita
El sistema SHALL validar que el nivel y destino de una base sean compatibles y SHALL solicitar confirmación antes de crear contenido material en una cohorte.

#### Scenario: Destino incompatible
- **WHEN** se intenta aplicar una base de semana sobre un destino que no admite semanas
- **THEN** el sistema rechaza la operación y explica la incompatibilidad

#### Scenario: Vista previa antes de copiar
- **WHEN** un usuario autorizado selecciona una versión base
- **THEN** el sistema muestra un resumen de los elementos que se crearán antes de solicitar confirmación

