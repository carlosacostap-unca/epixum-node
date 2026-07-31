## ADDED Requirements

### Requirement: Sectioned personal profile
The profile screen SHALL organize editable identity, contact, account, and preference information into labeled sections and provide explicit save feedback.

#### Scenario: User updates profile section
- **WHEN** a user saves valid profile changes
- **THEN** the system confirms the update and refreshes identity presentation where affected

### Requirement: Exploratory user administration
The administrative user screen SHALL support search, cohort and status filtering, ordering, and contextual actions without losing the active result set.

#### Scenario: Administrator narrows users
- **WHEN** an administrator searches or filters the user collection
- **THEN** the system shows the applied criteria, matching count, and user rows or cards with role and enrollment summaries

#### Scenario: Administrator opens user actions
- **WHEN** an administrator selects a user
- **THEN** role, enrollments, admissions, and permitted actions are presented in a focused detail surface rather than overcrowding the collection view

