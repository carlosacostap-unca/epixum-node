## Purpose

Unificar las señales académicas de un estudiante dentro de una cohorte para que el equipo docente comprenda el caso y acceda a su evidencia sin reconstruirlo entre pantallas aisladas.

## ADDED Requirements

### Requirement: Cohort-scoped student overview
The system SHALL provide teachers and administrators with an overview of an enrolled student scoped to one accessible cohort.

#### Scenario: Staff opens an enrolled student
- **WHEN** authorized staff opens a student from a cohort-scoped queue, metric, row, or progress cell
- **THEN** the overview identifies the student and cohort
- **AND** summarizes period progress, delivery states, inquiries, assessment results, reviews, and requested follow-up available for that cohort

#### Scenario: Student is not enrolled in the selected cohort
- **WHEN** staff requests an overview for a person who has no visible enrollment in the selected cohort
- **THEN** the system returns a not-found state without exposing academic data from another cohort

#### Scenario: Student attempts to open a staff overview
- **WHEN** a student requests a teacher student overview
- **THEN** the system denies access and does not expose other students' academic data

### Requirement: Evidence-linked student signals
The overview SHALL connect each summarized signal to its underlying evidence when an authorized evidence view exists.

#### Scenario: Teacher opens a delivery signal
- **WHEN** a teacher activates a delivery state for a period or assignment
- **THEN** the system opens the corresponding assignment or submission context for that student

#### Scenario: Teacher opens another academic signal
- **WHEN** a teacher activates an inquiry, assessment, or review signal
- **THEN** the system opens its authorized detail while preserving a predictable return path to the same student overview

### Requirement: Explicit absence of evidence
The overview SHALL distinguish a completed state, a pending state, an activity that is not configured, and data that is unavailable.

#### Scenario: Student has no record for a capability
- **WHEN** no assignment, assessment, inquiry, or review is configured or recorded for the selected context
- **THEN** the overview describes the absence explicitly instead of displaying an ambiguous zero or failure state

### Requirement: Responsive student overview
The student overview SHALL maintain the association between academic periods, signals, states, and actions on wide and narrow viewports.

#### Scenario: Overview on a narrow viewport
- **WHEN** staff opens the student overview on a narrow viewport
- **THEN** all labels and actions remain associated with the correct period and signal without full-page horizontal scrolling

