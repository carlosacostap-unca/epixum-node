## ADDED Requirements

### Requirement: Modelo persistente de cohortes

El sistema MUST persistir cohortes, inscripciones, admisiones y semanas con relaciones e índices que aseguren su integridad.

#### Scenario: Unicidad de inscripción

- **WHEN** se guardan inscripciones
- **THEN** la combinación de usuario y cohorte es única

#### Scenario: Unicidad semanal

- **WHEN** se guardan semanas
- **THEN** el número de semana es único dentro de cada cohorte

#### Scenario: Relaciones derivadas

- **WHEN** una clase, trabajo, entrega, revisión o encuesta se consulta
- **THEN** el sistema puede resolver una única cohorte mediante su periodo y relaciones padres

### Requirement: Reglas de datos por inscripción y modalidad

El sistema MUST aplicar autorización en servidor y PocketBase basada en rol, inscripción, cohorte y modalidad.

#### Scenario: Estudiante activo

- **WHEN** un estudiante consulta contenido publicado de una cohorte con inscripción activa
- **THEN** las reglas permiten la lectura correspondiente

#### Scenario: Cuenta autenticada sin inscripción

- **WHEN** una cuenta Google sin inscripción intenta consultar colecciones académicas
- **THEN** las reglas deniegan el acceso

#### Scenario: Módulo incompatible

- **WHEN** una operación apunta a un módulo no soportado por la modalidad
- **THEN** el servidor y las reglas rechazan la operación

### Requirement: Caché sensible a cohorte

El sistema MUST incluir el identificador de cohorte en toda clave, etiqueta o memoización cuyo resultado pueda variar entre cohortes.

#### Scenario: Mismo usuario en dos cohortes

- **WHEN** un usuario consulta sucesivamente dos cohortes
- **THEN** el resultado de la segunda no reutiliza datos académicos exclusivos de la primera

#### Scenario: Revalidación de semana

- **WHEN** se modifica contenido semanal
- **THEN** el sistema invalida únicamente las vistas y agregados pertinentes de su cohorte y semana

### Requirement: Migración aditiva de datos existentes

El sistema MUST migrar los datos actuales a una cohorte heredada sin eliminar ni renombrar registros o relaciones existentes.

#### Scenario: Simulación de migración

- **WHEN** se ejecuta el modo dry-run
- **THEN** el sistema reporta conteos, relaciones inválidas y correos conflictivos sin escribir datos

#### Scenario: Primera ejecución

- **WHEN** se ejecuta la migración sobre datos actuales
- **THEN** crea o reutiliza la cohorte heredada
- **AND** asocia sprints, equipos, consultas e inscripciones actuales

#### Scenario: Reejecución

- **WHEN** la migración se ejecuta nuevamente
- **THEN** no duplica cohortes, relaciones ni inscripciones

#### Scenario: Verificación posterior

- **WHEN** finaliza el backfill
- **THEN** los conteos de registros existentes permanecen iguales
- **AND** cada registro previo continúa accesible por el flujo heredado

### Requirement: Compatibilidad durante despliegue

El sistema MUST tolerar temporalmente registros sin relación explícita de cohorte durante la migración por fases.

#### Scenario: Registro aún no migrado

- **WHEN** la versión compatible lee un sprint o equipo sin cohorte
- **THEN** lo trata como perteneciente a la cohorte heredada

#### Scenario: Endurecimiento posterior

- **WHEN** la verificación confirma que el backfill está completo
- **THEN** se pueden activar reglas que exigen relaciones de cohorte para nuevas escrituras
