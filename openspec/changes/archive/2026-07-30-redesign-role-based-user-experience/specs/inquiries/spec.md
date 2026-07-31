## ADDED Requirements

### Requirement: Inquiry inbox
The system SHALL present inquiries as a filterable inbox with unresolved work visibly prioritized for authorized users.

#### Scenario: User filters inquiries
- **WHEN** a user filters by status, week, content context, or search text
- **THEN** the list updates while preserving the active cohort and communicates the number of matching inquiries

### Requirement: Conversational inquiry detail
The system SHALL present an inquiry and its responses as a chronological conversation with resolution state and reply action clearly separated.

#### Scenario: Open inquiry
- **WHEN** an authorized user opens a pending inquiry
- **THEN** the question, context, response history, reply action, and authorized resolution action are distinguishable

#### Scenario: Resolved inquiry
- **WHEN** a user opens a resolved inquiry
- **THEN** the resolved state and resolution history are visible without relying on color alone

