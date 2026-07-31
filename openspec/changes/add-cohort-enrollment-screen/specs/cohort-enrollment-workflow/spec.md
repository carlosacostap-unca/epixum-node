## ADDED Requirements

### Requirement: Acceso a la matriculación desde una cohorte
El sistema MUST ofrecer a los administradores un acceso explícito a la matriculación desde el detalle de cada cohorte.

#### Scenario: Administrador abre el detalle de cohorte
- **WHEN** un administrador consulta una cohorte
- **THEN** el sistema muestra la acción `Matricular estudiantes`
- **AND** la acción navega a una pantalla de matriculación asociada a esa cohorte

### Requirement: Flujos diferenciados de matriculación
La pantalla de matriculación MUST distinguir entre estudiantes registrados y estudiantes nuevos.

#### Scenario: Matricular estudiante registrado
- **WHEN** el administrador busca y selecciona un estudiante registrado
- **AND** confirma su condición de ingreso
- **THEN** el sistema crea o reactiva la matrícula en la cohorte

#### Scenario: Registrar estudiante nuevo
- **WHEN** el administrador informa nombre y correo de Google de una persona sin cuenta
- **THEN** el sistema crea una admisión pendiente para la cohorte
- **AND** la cuenta se vincula cuando la persona accede con Google

### Requirement: Contexto de matriculación visible
La pantalla MUST mostrar las matrículas y admisiones pendientes correspondientes únicamente a la cohorte seleccionada.

#### Scenario: Consulta de estado
- **WHEN** el administrador abre la pantalla de matriculación
- **THEN** el sistema lista las matrículas existentes de la cohorte
- **AND** lista sus admisiones pendientes sin incluir registros de otras cohortes

### Requirement: Protección administrativa
El sistema MUST restringir la pantalla y las acciones de matriculación a usuarios administradores.

#### Scenario: Usuario no administrador
- **WHEN** un usuario no administrador intenta abrir o ejecutar la matriculación
- **THEN** el sistema rechaza el acceso mediante las reglas administrativas vigentes

### Requirement: Matriculación masiva de estudiantes registrados
El sistema MUST permitir que un administrador matricule en una cohorte a todos los usuarios con rol de estudiante que todavía no tengan un registro de matrícula en ella.

#### Scenario: Primera matriculación masiva
- **WHEN** el administrador confirma `Matricular a todos`
- **THEN** el sistema crea una matrícula activa con condición `repeater` para cada estudiante sin matrícula en la cohorte
- **AND** conserva sin cambios las matrículas activas o finalizadas que ya existan

#### Scenario: Repetición de la matriculación masiva
- **WHEN** el administrador repite la acción masiva
- **THEN** el sistema no crea duplicados ni reactiva personas desmatriculadas deliberadamente
- **AND** informa cuántos estudiantes fueron incorporados y cuántos fueron omitidos

### Requirement: Consulta y desmatriculación administrativa
El sistema MUST mostrar todas las matrículas de la cohorte y MUST permitir buscar, filtrar y desmatricular individualmente a un estudiante.

#### Scenario: Buscar una matrícula
- **WHEN** el administrador busca por nombre o correo o filtra por estado
- **THEN** el listado muestra solamente las matrículas coincidentes de la cohorte

#### Scenario: Desmatricular estudiante
- **WHEN** el administrador confirma la desmatriculación de una matrícula activa
- **THEN** el sistema cambia su estado a `completed`
- **AND** el estudiante deja de tener acceso activo a la cohorte
- **AND** se conservan la matrícula y sus datos académicos históricos

### Requirement: Importación de alumnos nuevos desde CSV
El sistema MUST permitir importar admisiones nuevas desde un CSV usando exclusivamente `nombre_completo`, `email`, `dni`, `fecha_nacimiento` y `telefono`.

#### Scenario: Fila válida sin usuario existente
- **WHEN** una fila contiene nombre completo y correo válidos que no existen como usuario ni admisión pendiente en la cohorte
- **THEN** el sistema crea una admisión `pending` con condición `new`
- **AND** guarda DNI, fecha de nacimiento y teléfono solamente cuando están informados

#### Scenario: Repetición de la importación
- **WHEN** el mismo CSV se procesa nuevamente
- **THEN** el sistema omite los correos que ya tengan usuario o admisión pendiente en la cohorte
- **AND** no crea duplicados

#### Scenario: Reclamo mediante Google
- **WHEN** un alumno importado ingresa con el mismo correo mediante Google
- **THEN** el sistema crea su matrícula activa en la cohorte
- **AND** transfiere nombre completo, DNI, fecha de nacimiento y teléfono informados a su perfil
