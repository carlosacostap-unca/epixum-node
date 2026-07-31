## ADDED Requirements

### Requirement: Guided survey completion
The student survey SHALL divide long questionnaires into understandable sections and communicate completion progress.

#### Scenario: Student advances through survey
- **WHEN** a student completes the required fields in the current section
- **THEN** the system permits navigation to the next section and updates visible progress

#### Scenario: Required response missing
- **WHEN** a student attempts to advance or submit with a missing required response
- **THEN** the system identifies the affected field in context and preserves all other responses

### Requirement: Survey review before submission
The system SHALL provide a summary of the selected path and responses before the irreversible final submission.

#### Scenario: Student confirms survey
- **WHEN** a student reaches the final survey step
- **THEN** the system shows a review summary and requires explicit confirmation before submitting

