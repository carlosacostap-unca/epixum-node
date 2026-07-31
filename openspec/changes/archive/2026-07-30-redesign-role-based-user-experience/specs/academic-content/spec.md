## ADDED Requirements

### Requirement: Progress-oriented academic listing
The system SHALL present weeks or sprints in learning order with publication, timing, and user-progress context available for each item.

#### Scenario: Student views course structure
- **WHEN** a student opens a list of weeks or sprints
- **THEN** each available item communicates its position, current state, and relevant completion summary, and unpublished content remains unavailable

#### Scenario: Staff views course structure
- **WHEN** staff opens a list of weeks or sprints
- **THEN** draft and published items are distinguishable and creation is available as a primary contextual action

### Requirement: Separated content reading and authoring
The system SHALL keep the default detail view focused on consuming content and SHALL open create or edit controls only after an explicit staff action.

#### Scenario: Staff opens a week or sprint
- **WHEN** staff opens an academic container detail
- **THEN** classes and assignments remain readable without simultaneous creation forms, and authoring controls open in a dedicated panel, dialog, or mode

### Requirement: Structured content detail
The system SHALL separate overview, resources, assignment activity, and contextual inquiries while preserving navigation between them.

#### Scenario: Student opens a class
- **WHEN** a student opens a class
- **THEN** the description and learning resources are prioritized and contextual inquiries remain directly reachable

