## ADDED Requirements

### Requirement: Focused mobile learning navigation
The system SHALL expose one non-overlapping bottom navigation region while a student reads sequential content on a mobile viewport.

#### Scenario: Student reads a section on mobile
- **WHEN** a student opens a weekly content section on a mobile viewport
- **THEN** previous, next, position, and exit controls remain reachable without being covered by the global navigation

#### Scenario: Student exits focused reading
- **WHEN** a student leaves the content reader
- **THEN** the standard mobile primary navigation is presented again

#### Scenario: Student reads on desktop
- **WHEN** a student opens a weekly content section on a desktop viewport
- **THEN** the persistent desktop navigation and sequential reader controls remain available without obscuring the content
