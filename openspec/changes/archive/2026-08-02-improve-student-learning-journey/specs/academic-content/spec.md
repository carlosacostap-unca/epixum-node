## ADDED Requirements

### Requirement: Direct student entry into weekly learning
The system SHALL minimize intermediate navigation when a student enters an available weekly learning journey.

#### Scenario: Student opens a week from the collection
- **WHEN** a student activates a published week that has available sections
- **THEN** the system opens the first incomplete or most recently viewed incomplete section directly

#### Scenario: Student opens a week without available sections
- **WHEN** a student activates a published week without available sections
- **THEN** the system opens the contextual content view and explains that no sections are available

#### Scenario: Staff opens a week from the collection
- **WHEN** staff activates a week
- **THEN** the system preserves the existing week overview and authoring entry points

### Requirement: Block-level learning resumption
The system SHALL resume an in-progress section at the furthest block recorded for its current revision.

#### Scenario: Student resumes viewed content
- **WHEN** a student activates a continuation action for a section with recorded block progress
- **THEN** the system opens that section at the recorded block
- **AND** the block remains visible below persistent application controls

#### Scenario: Student starts unviewed content
- **WHEN** a student activates a continuation action for a section without recorded block progress
- **THEN** the system opens the beginning of the section

#### Scenario: Student content revision changed
- **WHEN** the current content revision does not retain the recorded block
- **THEN** the system safely opens the beginning of the current section
