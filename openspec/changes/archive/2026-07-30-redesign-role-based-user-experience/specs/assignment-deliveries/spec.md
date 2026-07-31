## ADDED Requirements

### Requirement: Explicit student delivery state
The assignment detail SHALL identify the student's delivery state and the single next applicable action before showing secondary information.

#### Scenario: Assignment without submission
- **WHEN** a student opens an assignment they have not submitted
- **THEN** the system identifies it as pending and presents the submission action with its requirements

#### Scenario: Assignment with submission
- **WHEN** a student opens an assignment they have submitted
- **THEN** the system displays the repository, submission state, and available update action

### Requirement: Actionable teacher delivery overview
The staff assignment detail SHALL summarize submission coverage and provide searchable or filterable access to individual submissions.

#### Scenario: Teacher reviews submissions
- **WHEN** staff opens an assignment with enrolled students
- **THEN** the system shows submitted and missing counts and allows the list to be narrowed without losing assignment context

