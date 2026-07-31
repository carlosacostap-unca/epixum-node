## ADDED Requirements

### Requirement: Actionable analytics summary
Teaching dashboards SHALL connect summary metrics to the underlying students, submissions, surveys, or inquiries represented by each metric.

#### Scenario: Teacher opens a metric
- **WHEN** a teacher activates a dashboard metric or segment
- **THEN** the system opens or filters the corresponding detailed population while preserving cohort and period context

### Requirement: Persistent analytics filters
The system SHALL expose cohort, period, progress, and relevant status filters and SHALL retain them while navigating between a summary and its detail.

#### Scenario: Filtered dashboard
- **WHEN** a teacher applies supported analytics filters
- **THEN** all visible metrics and detail lists use the same filter context and disclose that context

### Requirement: Responsive longitudinal progress
The system SHALL provide an equivalent legible representation of longitudinal student progress on both wide and narrow viewports.

#### Scenario: Progress on narrow viewport
- **WHEN** the longitudinal matrix is displayed on a narrow viewport
- **THEN** each student and period status remains associated with its label and can be inspected without full-page horizontal overflow

