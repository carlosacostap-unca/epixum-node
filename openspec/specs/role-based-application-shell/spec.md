# role-based-application-shell Specification

## Purpose
Provide every authenticated person with a consistent application frame whose navigation, home content, actions, and cohort context match their role and current academic scope.
## Requirements
### Requirement: Role-aware primary navigation
The system SHALL present a stable primary navigation containing only destinations available to the authenticated role and SHALL indicate the active destination.

#### Scenario: Student navigation
- **WHEN** an authenticated student opens any protected screen
- **THEN** the primary navigation exposes student learning, collaboration, review, inquiry, and profile destinations without staff administration actions

#### Scenario: Staff navigation
- **WHEN** an authenticated teacher or administrator opens any protected screen
- **THEN** the primary navigation exposes the operational destinations available to that role and visibly identifies the current section

### Requirement: Persistent cohort context
The system SHALL display the active cohort on cohort-scoped screens and SHALL preserve that context while navigating between supported capabilities.

#### Scenario: Navigation within a cohort
- **WHEN** a user follows a primary or contextual destination from a cohort-scoped screen
- **THEN** the destination remains scoped to the same cohort unless the user explicitly selects another cohort

#### Scenario: Cohort switch
- **WHEN** a user selects another accessible cohort
- **THEN** the system opens that cohort at an appropriate role-specific starting destination

#### Scenario: Student cohort visibility
- **WHEN** a student has active and completed enrollments
- **THEN** the system exposes only cohorts associated with active enrollments

#### Scenario: Student with one active cohort
- **WHEN** a student has exactly one active enrollment
- **THEN** the system uses that cohort as the default context throughout the experience
- **AND** it hides the cohort selector and the Cohorts navigation destination
- **AND** opening the cohort collection redirects directly to that cohort

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
- **THEN** the system prioritizes unresolved inquiries, submissions requiring attention, upcoming reviews, enrollment requests, and students requiring follow-up

#### Scenario: Administrator home
- **WHEN** an administrator opens the application home
- **THEN** the system prioritizes cohort, user, enrollment, request, and operational summaries with direct actions

### Requirement: Hierarchical orientation
The system SHALL expose the current page title, parent context, and one primary action where applicable.

#### Scenario: Nested academic screen
- **WHEN** a user opens a week, class, assignment, team, review, or administrative detail
- **THEN** the screen identifies its parent hierarchy and provides a predictable path back without relying on browser history
