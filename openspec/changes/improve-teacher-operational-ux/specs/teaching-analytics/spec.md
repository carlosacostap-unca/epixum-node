## MODIFIED Requirements

### Requirement: Actionable analytics summary
Teaching dashboards SHALL connect summary metrics, student rows, and period states to the underlying students, submissions, surveys, or inquiries represented by each value.

#### Scenario: Teacher opens a metric
- **WHEN** a teacher activates a dashboard metric or segment
- **THEN** the system opens or filters the exact corresponding population while preserving cohort, period, enrollment status, progress, and search context

#### Scenario: Teacher opens a student row
- **WHEN** a teacher activates a student identity from an analytics population
- **THEN** the system opens that student's overview in the active cohort and preserves a return path to the current dashboard context

#### Scenario: Teacher opens a period state
- **WHEN** a teacher activates a student's period state
- **THEN** the system exposes the assignments and delivery evidence that produced that state

## ADDED Requirements

### Requirement: Exact teacher attention segments
The system SHALL calculate and disclose each teacher attention segment using the same filtered population shown by its detail view.

#### Scenario: Students requiring delivery attention
- **WHEN** the dashboard calculates the attention segment for the selected periods
- **THEN** it counts each visible student once when at least one applicable assignment has no delivery
- **AND** the detail contains exactly those students under the same filters

#### Scenario: Students with complete progress
- **WHEN** the dashboard calculates complete progress
- **THEN** it counts a student only when every applicable assignment in every selected non-empty period has a delivery
- **AND** periods without assignments do not cause a student to be classified as complete or requiring attention

#### Scenario: Students requesting teacher contact
- **WHEN** a follow-up signal is calculated from student responses
- **THEN** its action opens exactly the students whose recorded response requests teacher contact
- **AND** the destination identifies the reason for inclusion

### Requirement: Analytics population disclosure
The system SHALL communicate the active population and meaning of each analytics result without relying on color alone.

#### Scenario: Filtered analytics view
- **WHEN** cohort, period, enrollment status, progress, search, or attention filters are active
- **THEN** the dashboard states the active context and matching population
- **AND** status labels remain textual on desktop and mobile representations

