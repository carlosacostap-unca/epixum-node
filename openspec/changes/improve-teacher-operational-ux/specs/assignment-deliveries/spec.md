## MODIFIED Requirements

### Requirement: Actionable teacher delivery overview
The staff assignment detail SHALL summarize submission coverage using unique student-assignment pairs and provide searchable or filterable access to individual submission states.

#### Scenario: Teacher reviews submissions
- **WHEN** staff opens an assignment with enrolled students
- **THEN** the system shows submitted, pending, due-soon, and overdue counts that reconcile with the visible student population
- **AND** allows the list to be narrowed without losing assignment, cohort, or period context

#### Scenario: Teacher opens a submitted delivery
- **WHEN** staff activates a submitted state
- **THEN** the system opens the student's repository and identifies the corresponding student and assignment

#### Scenario: Teacher opens a missing delivery
- **WHEN** staff activates a pending, due-soon, or overdue state from a cross-assignment view
- **THEN** the system opens the corresponding assignment context focused on that student

## ADDED Requirements

### Requirement: Temporal teacher delivery states
The system SHALL derive one teacher-visible delivery state for each applicable enrolled-student and assignment pair using the delivery record and the enclosing week or sprint end date.

#### Scenario: Delivery exists
- **WHEN** a delivery exists for the student and assignment
- **THEN** the state is `submitted` regardless of the academic period end date

#### Scenario: Missing delivery after the period end date
- **WHEN** no delivery exists and the enclosing week or sprint end date has passed
- **THEN** the state is `overdue`

#### Scenario: Missing delivery near the period end date
- **WHEN** no delivery exists and the enclosing period ends within the next seven calendar days
- **THEN** the state is `due-soon`

#### Scenario: Missing delivery before the upcoming window
- **WHEN** no delivery exists and the enclosing period ends more than seven calendar days in the future
- **THEN** the state is `pending`

#### Scenario: Missing delivery without an end date
- **WHEN** no delivery exists and the enclosing period has no end date
- **THEN** the state is `pending`
- **AND** the interface identifies that no due date is configured and never labels the state overdue

### Requirement: Reconciled delivery counts
Teacher delivery metrics SHALL count each applicable student-assignment pair at most once and disclose the population used.

#### Scenario: Duplicate or unrelated records are present
- **WHEN** delivery data contains repeated or out-of-context records
- **THEN** the visible counts use at most one matching delivery for each student-assignment pair
- **AND** exclude records outside the selected cohort, enrollment status, assignment, or period

