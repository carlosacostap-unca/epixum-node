## ADDED Requirements

### Requirement: Agenda-based review discovery
The system SHALL organize review availability chronologically and distinguish available, reserved, completed, and cancelled appointments.

#### Scenario: Student seeks an appointment
- **WHEN** a student opens reviews for a sprint
- **THEN** available appointments are grouped by date and the student's existing reservation, if any, is prioritized

#### Scenario: Teacher manages agenda
- **WHEN** staff opens review scheduling
- **THEN** the system provides an agenda summary, filters, and contextual actions for creating, releasing, or opening an appointment

### Requirement: Focused review detail
The review detail SHALL prioritize schedule, participant, meeting mode, status, and role-appropriate notes.

#### Scenario: Student opens reserved review
- **WHEN** a student opens their reserved review
- **THEN** the system displays joining or location information and only feedback intended for the student

