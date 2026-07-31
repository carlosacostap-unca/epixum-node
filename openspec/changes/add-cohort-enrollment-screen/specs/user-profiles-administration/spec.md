## ADDED Requirements

### Requirement: Selección administrativa de estudiantes registrados
El sistema MUST permitir que un administrador localice por nombre o correo a un usuario con rol de estudiante para matricularlo en una cohorte.

#### Scenario: Búsqueda de estudiante
- **WHEN** el administrador escribe parte del nombre o correo en la pantalla de matriculación
- **THEN** el sistema muestra solamente usuarios estudiantes que coinciden con la búsqueda

#### Scenario: Usuario ya matriculado activamente
- **WHEN** el estudiante seleccionado ya posee una matrícula activa en la cohorte
- **THEN** el sistema conserva una única matrícula activa
- **AND** comunica al administrador que el estudiante ya estaba matriculado

#### Scenario: Usuario recursante
- **WHEN** el administrador matricula a un estudiante registrado con condición recursante
- **THEN** el sistema registra la condición `repeater` en su matrícula de la nueva cohorte
