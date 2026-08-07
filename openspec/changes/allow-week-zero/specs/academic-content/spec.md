## ADDED Requirements

### Requirement: Non-negative weekly numbering
The system SHALL allow authorized staff to create and edit weekly academic containers with any non-negative integer number, including `0`, while rejecting negative and non-integer values.

#### Scenario: Staff creates Week 0
- **WHEN** authorized staff creates a week with number `0` and otherwise valid data
- **THEN** the system stores the week as a draft and presents it as "Semana 0"

#### Scenario: Week 0 precedes Week 1
- **WHEN** a cohort contains weeks numbered `0` and `1`
- **THEN** the system presents Semana 0 before Semana 1 in the weekly learning order

#### Scenario: Staff enters an invalid week number
- **WHEN** authorized staff submits a negative or non-integer week number
- **THEN** the system rejects the submission without creating or updating the week

