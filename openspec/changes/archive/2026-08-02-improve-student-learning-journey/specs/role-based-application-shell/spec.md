## MODIFIED Requirements

### Requirement: Role-specific home
The system SHALL present a home surface prioritized by pending work and relevant status rather than a uniform catalog of destinations.

#### Scenario: Student home
- **WHEN** a student opens the application home
- **THEN** the system prioritizes the next learning activity, pending submissions, upcoming reviews, and recent inquiry activity

#### Scenario: Weekly cohort student home
- **WHEN** a student whose active context is a weekly cohort opens the application home
- **THEN** the system presents one primary action that opens the most relevant available week or resumes its incomplete content
- **AND** the action identifies the week, section, and current progress when that information is available
- **AND** community access, initial assessment, schedule, weekly content, and inquiries remain directly reachable as secondary destinations
- **AND** legacy welcome URLs return the student to the canonical home

#### Scenario: Weekly cohort without published content
- **WHEN** a weekly cohort student has no available content section
- **THEN** the home explains that content is not yet available and offers the published week collection without presenting a broken continuation action

#### Scenario: Teacher home
- **WHEN** a teacher opens the application home
- **THEN** the system prioritizes unresolved inquiries, submissions requiring attention, upcoming reviews, enrollment requests, and students requiring follow-up

#### Scenario: Administrator home
- **WHEN** an administrator opens the application home
- **THEN** the system prioritizes cohort, user, enrollment, request, and operational summaries with direct actions
