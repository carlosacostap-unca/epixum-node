## ADDED Requirements

### Requirement: Primer commit local observable
La sección de Git local SHALL diferenciar carpeta de trabajo, staging, commit y repositorio mediante un recorrido que permita observar qué archivos existen, cuáles están preparados y qué versión fue registrada.

#### Scenario: Estudiante crea el primer commit
- **WHEN** el estudiante parte del programa modular terminado y ejecuta el recorrido en orden
- **THEN** inicia la rama principal, prepara únicamente los archivos indicados, inspecciona su contenido y crea una versión con un mensaje reconocible

#### Scenario: Estudiante verifica el resultado
- **WHEN** el commit termina correctamente
- **THEN** la sección muestra cómo confirmar rama, identificador breve, mensaje del último commit y ausencia de cambios pendientes

### Requirement: Preparación segura del contenido
La sección SHALL enseñar a excluir resultados generados y archivos sensibles antes de preparar cambios, y SHALL exigir una inspección del staging previa al commit.

#### Scenario: Programa genera historial
- **WHEN** el estudiante ejecutó el programa y existe `historial.txt`
- **THEN** el archivo queda ignorado y no aparece entre los contenidos preparados para la primera versión

#### Scenario: Archivo sensible aparece preparado
- **WHEN** el estudiante detecta un archivo como `.env` dentro del staging
- **THEN** la sección ofrece una operación no destructiva para retirarlo del staging y le indica resolver su ubicación antes de continuar

### Requirement: Alcance local y continuidad pedagógica
La sección SHALL usar el comando válido del programa modular, SHALL limitarse a operaciones locales y SHALL conservar la comprobación requerida sobre `git commit`.

#### Scenario: Estudiante prueba antes de guardar
- **WHEN** el estudiante sigue la preparación previa
- **THEN** ejecuta el programa con un nombre, verifica el README y confirma que trabaja en la carpeta correcta

#### Scenario: Estudiante termina la sección
- **WHEN** el repositorio local tiene un commit verificable
- **THEN** la sección no exige remoto, push ni publicación en GitHub y la pregunta requerida mantiene identificador, contenido y respuesta correcta
