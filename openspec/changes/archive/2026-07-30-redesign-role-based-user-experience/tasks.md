## 1. Visual foundation and accessibility

- [x] 1.1 Define semantic color, typography, spacing, radius, shadow, focus, motion, and content-width tokens in the global theme
- [x] 1.2 Correct document language and font application and add global focus-visible and reduced-motion behavior
- [x] 1.3 Implement accessible Button, LinkButton, IconButton, Badge, Card, Alert, and Separator primitives
- [x] 1.4 Implement labeled Input, Select, Textarea, Checkbox, RadioGroup, and FormField primitives with help and error states
- [x] 1.5 Implement Dialog, Drawer, Menu, Tabs, Toast, Skeleton, EmptyState, ErrorState, and confirmation patterns with keyboard focus management
- [x] 1.6 Add component-level tests for variants, keyboard operation, accessible names, status text, and theme contrast

## 2. Application shell and navigation

- [x] 2.1 Define typed role, cohort-mode, and capability-aware navigation configuration
- [x] 2.2 Resolve authenticated identity and accessible cohort context server-side for the protected application layout
- [x] 2.3 Implement the desktop sidebar, top bar, breadcrumbs, page header, identity menu, and active navigation state
- [x] 2.4 Implement compact mobile header, primary mobile navigation, navigation drawer, and responsive content frame
- [x] 2.5 Implement a cohort switcher that routes to an appropriate role-specific destination and preserves cohort scope
- [x] 2.6 Implement persistent light, dark, and system theme selection without an incorrect first paint
- [x] 2.7 Add role navigation, cohort switching, keyboard, mobile overflow, and unauthorized-destination tests

## 3. Access, cohort entry, and role homes

- [x] 3.1 Redesign login with platform identity, explicit Google access action, error feedback, and enrollment assistance path
- [x] 3.2 Reorganize the enrollment request form into labeled sections with inline validation and a submitted confirmation state
- [x] 3.3 Redesign cohort selection cards with mode, status, dates, progress or operational counts, and an explicit continue action
- [x] 3.4 Build the student home with next activity, pending submissions, upcoming review, and recent inquiry summaries
- [x] 3.5 Build the teacher home with pending inquiries, delivery attention, reviews, requests, and follow-up summaries
- [x] 3.6 Build the administrator home with cohort, user, enrollment, request, and operational summaries
- [x] 3.7 Add public access, request confirmation, cohort selection, and three-role home end-to-end coverage

## 4. Academic content experience

- [x] 4.1 Build the shared progress-oriented week and sprint collection pattern with student and staff variants
- [x] 4.2 Redesign week and sprint details with overview, classes, assignments, and contextual inquiry sections or tabs
- [x] 4.3 Move week, sprint, class, assignment, and resource creation and editing into explicit dialogs, drawers, modes, or dedicated routes
- [x] 4.4 Redesign class detail to prioritize description, dated context, typed resources, and contextual inquiries
- [x] 4.5 Preserve active cohort context through class, assignment, and historical sprint compatibility routes
- [x] 4.6 Add empty, draft, published, completed-enrollment, not-found, loading, and mutation feedback tests for academic content

## 5. Assignments and deliveries

- [x] 5.1 Redesign student assignment detail around pending or submitted state and the single next delivery action
- [x] 5.2 Rebuild delivery creation and update forms with URL validation, recoverable errors, and success confirmation
- [x] 5.3 Redesign staff assignment detail with submission metrics, search or filters, and individual delivery access
- [x] 5.4 Add mobile delivery list presentation equivalent to the desktop staff table
- [x] 5.5 Add student pending/submitted and staff submitted/missing delivery flow tests

## 6. Inquiries, reviews, teams, and surveys

- [x] 6.1 Redesign inquiries as a cohort-scoped inbox with search, status and context filters, matching count, and new-inquiry action
- [x] 6.2 Redesign inquiry creation and detail as contextual question entry and chronological conversation with explicit resolution state
- [x] 6.3 Redesign review discovery as a chronological agenda with student reservation priority and staff management filters
- [x] 6.4 Redesign review detail around schedule, participant, mode, status, private notes, and student-visible feedback
- [x] 6.5 Unify staff team overview and organization modes with unsaved-change and save/discard handling
- [x] 6.6 Redesign the student team surface to prioritize identity, members, responsive chat history, and message composer
- [x] 6.7 Convert the student survey into a sectioned flow with progress, inline validation, preserved responses, review, and final confirmation
- [x] 6.8 Add end-to-end coverage for inquiry resolution, review reservation, team reorganization, mobile chat, and both survey branches

## 7. Teaching analytics and assessment reporting

- [x] 7.1 Implement shared metric cards and URL-backed cohort, period, progress, and status filter bars
- [x] 7.2 Connect dashboard metrics to their corresponding filtered student, submission, survey, or inquiry details
- [x] 7.3 Redesign the weekly dashboard with actionable summary, filter context, and labeled student progress detail
- [x] 7.4 Redesign the historical sprint and longitudinal dashboards using consistent statuses and navigation
- [x] 7.5 Provide sticky desktop and labeled mobile representations for longitudinal progress without full-page overflow
- [x] 7.6 Redesign the JavaScript assessment report with participation metrics, question-level insight, filters, and focused student attempt detail
- [x] 7.7 Add calculation regression, filter persistence, metric drill-down, and responsive analytics tests

## 8. Administration and profile

- [x] 8.1 Redesign profile into identity, contact, account, and preference sections with avatar and save confirmation
- [x] 8.2 Redesign cohort administration as a searchable list with status, mode, dates, enrollment summary, and contextual actions
- [x] 8.3 Redesign cohort detail into summary, configuration, enrollment, admission, content, and analytics sections
- [x] 8.4 Convert enrollment management into explicit existing-student, new-student, and bulk flows with preview and outcome feedback
- [x] 8.5 Redesign user administration with search, filters, ordering, matching count, responsive collection, and focused user detail actions
- [x] 8.6 Redesign enrollment requests as a list-and-detail review workflow with identity match explanation and explicit approval consequences
- [x] 8.7 Add administrator-only access, filtering, bulk confirmation, conflict, approval, rejection, role update, and profile tests

## 9. Route migration and compatibility

- [x] 9.1 Inventory every global historical entry point and map it to its canonical cohort-scoped destination or retained exception
- [x] 9.2 Add compatibility redirects or adapters for historical sprint, class, assignment, team, review, inquiry, dashboard, and survey URLs
- [x] 9.3 Update internal links and navigation builders to use canonical cohort-scoped destinations
- [x] 9.4 Remove obsolete header and cohort navigation implementations after all routes use the shared shell
- [x] 9.5 Add deep-link, browser back/forward, cross-cohort isolation, and saved historical URL regression tests

## 10. Final quality and rollout

- [x] 10.1 Add shared route loading, error, not-found, empty, and operation feedback states across migrated workflows
- [x] 10.2 Run automated accessibility checks and manually verify keyboard-only flows for each role and public access
- [x] 10.3 Run responsive visual regression at representative mobile, tablet, desktop, light, and dark configurations
- [x] 10.4 Verify role permissions and PocketBase mutations remain behaviorally equivalent after each migrated workflow
- [x] 10.5 Measure key dashboard and collection render times and optimize only regressions introduced by the redesign
- [x] 10.6 Run the full build and test suite, document intentional visual changes, and complete the phased rollout checklist
