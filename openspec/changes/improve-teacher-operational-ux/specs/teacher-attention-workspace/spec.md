## Purpose

Proporcionar al equipo docente una bandeja operativa única que reúna señales de todas sus cohortes, explique su urgencia y conduzca directamente a la siguiente acción verificable.

## ADDED Requirements

### Requirement: Global teacher attention queue
The system SHALL provide teachers and administrators with a global attention queue covering every cohort accessible to the current user.

#### Scenario: Staff opens the application home
- **WHEN** a teacher or administrator opens the operational teacher workspace
- **THEN** the system lists unresolved inquiries, delivery risks, requested teacher follow-ups, upcoming reserved reviews, and pending enrollment requests from accessible cohorts
- **AND** every item identifies its type, cohort, affected person when applicable, relevant academic context, and age or due time

#### Scenario: Student attempts to open the workspace
- **WHEN** a student attempts to open the operational teacher workspace
- **THEN** the system denies access and returns the student to an authorized destination

### Requirement: Deterministic attention priority
The system SHALL order attention items by an explicit urgency tier and then by the relevant due or waiting timestamp.

#### Scenario: Mixed pending work
- **WHEN** the queue contains overdue work, requested contact, unresolved inquiries, upcoming reviews, and enrollment requests
- **THEN** overdue work and requested contact appear before routine pending work
- **AND** items within the same tier use the oldest unresolved timestamp or nearest upcoming due time consistently

### Requirement: Actionable attention items
Each attention item SHALL expose one primary action that opens the underlying evidence or workflow without losing its cohort and academic context.

#### Scenario: Teacher opens an attention item
- **WHEN** a teacher activates an item associated with a student and academic period
- **THEN** the destination preserves the cohort, student, period, signal type, and supported filters represented by that item
- **AND** the destination displays the same case rather than an unfiltered collection

### Requirement: Honest loading and partial-data states
The workspace SHALL distinguish no pending work from data that could not be loaded.

#### Scenario: All sources load without pending work
- **WHEN** all attention sources load successfully and produce no items
- **THEN** the workspace displays an explicit all-clear state

#### Scenario: One attention source fails
- **WHEN** one source cannot be loaded while other sources remain available
- **THEN** the workspace displays the available items and identifies the unavailable source
- **AND** it does not represent the unavailable source as a zero count

### Requirement: Responsive queue equivalence
The teacher attention queue SHALL preserve item identity, urgency, context, and primary action on wide and narrow viewports.

#### Scenario: Teacher uses a narrow viewport
- **WHEN** the global queue is displayed on a narrow viewport
- **THEN** each item remains readable and actionable without full-page horizontal scrolling

