## ADDED Requirements

### Requirement: Clear access journey
The system SHALL present authentication, enrollment assistance, and session actions as one understandable access journey.

#### Scenario: Visitor at login
- **WHEN** an unauthenticated visitor opens the login screen
- **THEN** the system identifies the platform, explains the Google sign-in action, and provides a distinct path for enrollment or account-access problems

#### Scenario: Enrollment request submitted
- **WHEN** a visitor successfully submits an enrollment request
- **THEN** the system displays a confirmation, expected next step, and route back to sign-in without exposing protected navigation

#### Scenario: Authenticated session menu
- **WHEN** an authenticated user opens the identity menu
- **THEN** the system shows their name, role, profile action, theme preference, and sign-out action in a compact surface

