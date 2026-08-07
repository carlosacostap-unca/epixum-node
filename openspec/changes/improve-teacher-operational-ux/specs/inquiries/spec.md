## MODIFIED Requirements

### Requirement: Inquiry inbox
The system SHALL present inquiries as a filterable inbox with unresolved work visibly prioritized for authorized users.

#### Scenario: User filters inquiries
- **WHEN** a user filters by status, week, content context, or search text
- **THEN** the list updates while preserving the active cohort
- **AND** communicates the number of matching inquiries and the active filter context

#### Scenario: Teacher opens a period inquiry segment
- **WHEN** a teacher follows a pending-inquiry action for a specific academic period
- **THEN** the inbox displays exactly the pending inquiries associated with that period
- **AND** preserves the cohort and period context in subsequent inquiry navigation

#### Scenario: Pending inquiries are prioritized
- **WHEN** a staff user views inquiries containing pending and resolved conversations
- **THEN** pending inquiries appear before resolved inquiries
- **AND** each pending inquiry communicates how long it has been waiting since its last relevant activity

#### Scenario: Inquiry context has no matches
- **WHEN** a valid active filter context contains no inquiries
- **THEN** the inbox displays an empty state that identifies the applied context and offers a way to clear it

## ADDED Requirements

### Requirement: Cohort-visible inquiry identity
Every inquiry shown in a global or cross-cohort teacher surface SHALL identify its cohort and academic context before the teacher acts on it.

#### Scenario: Inquiry appears in the global teacher queue
- **WHEN** an unresolved inquiry is summarized outside its cohort inbox
- **THEN** the item identifies its cohort, author, academic context, status, and waiting time

