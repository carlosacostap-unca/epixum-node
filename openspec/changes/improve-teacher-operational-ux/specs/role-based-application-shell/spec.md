## MODIFIED Requirements

### Requirement: Role-specific home
The system SHALL present a home surface prioritized by pending work and relevant status rather than a uniform catalog of destinations.

#### Scenario: Student home
- **WHEN** a student opens the application home
- **THEN** the system prioritizes the next learning activity, pending submissions, upcoming reviews, and recent inquiry activity

#### Scenario: Weekly cohort student home
- **WHEN** a student whose active context is a weekly cohort opens the application home
- **THEN** the system presents the cohort welcome experience as the home screen
- **AND** it provides direct access to the community invitation, initial assessment, weekly content, and inquiries
- **AND** legacy welcome URLs return the student to the canonical home

#### Scenario: Teacher home
- **WHEN** a teacher opens the application home
- **THEN** the system presents a global operational workspace across every accessible cohort
- **AND** prioritizes unresolved inquiries, delivery risks, upcoming reserved reviews, enrollment requests, and students requiring follow-up

#### Scenario: Administrator home
- **WHEN** an administrator opens the application home
- **THEN** the system prioritizes cohort, user, enrollment, request, and operational summaries with direct actions

## ADDED Requirements

### Requirement: Task-oriented staff cohort destination
The system SHALL take staff to a cohort-scoped operational destination when they explicitly select a cohort.

#### Scenario: Staff switches cohort from the shell
- **WHEN** a teacher or administrator selects another cohort from the application shell
- **THEN** the system opens that cohort's staff dashboard
- **AND** all subsequent cohort-scoped navigation uses the selected cohort until another cohort is selected

#### Scenario: Staff opens a cohort card
- **WHEN** a teacher or administrator activates a cohort from the cohort collection
- **THEN** the system opens the same canonical staff dashboard rather than a separate generic landing page

#### Scenario: Staff follows a contextual attention action
- **WHEN** staff opens a queue item that already identifies a cohort and workflow
- **THEN** the system opens the specified workflow directly instead of replacing it with the default cohort dashboard

