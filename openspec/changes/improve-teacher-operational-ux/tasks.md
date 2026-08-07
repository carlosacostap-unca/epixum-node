## 1. Shared teacher context foundations

- [x] 1.1 Add typed route builders for staff cohort landing, dashboard segments, inquiry context, student overview, assignment focus, and allowlisted return destinations.
- [x] 1.2 Add navigation tests covering exact period context, preserved dashboard filters, safe return fallback, and the canonical staff cohort destination.
- [x] 1.3 Implement the unique student-assignment delivery-state projector with submitted, overdue, due-soon, pending, and unscheduled metadata.
- [x] 1.4 Add delivery projector tests for seven-day boundaries, missing end dates, duplicate records, empty periods, cohort isolation, and enrollment-status filters.
- [x] 1.5 Define the discriminated teacher attention item model and deterministic urgency/timestamp ordering.
- [x] 1.6 Add attention projection tests covering every signal type, cross-cohort identity, stable ordering, and canonical primary actions.

## 2. Reliable teacher data loading

- [x] 2.1 Implement a server-side teacher attention loader that queries actionable PocketBase records across accessible cohorts with restricted fields and no per-item relation calls.
- [x] 2.2 Return per-source success or failure metadata from the attention loader and ensure an unavailable source cannot be represented as zero or all clear.
- [x] 2.3 Implement a cohort-and-student-scoped overview loader that verifies visible enrollment before reading deliveries, inquiries, assessments, reviews, and follow-up responses.
- [x] 2.4 Add data-loader tests for teacher and administrator access, student denial, inaccessible enrollments, cross-cohort record exclusion, and partial attention-source failure.

## 3. Correct existing dashboard and inbox drill-downs

- [x] 3.1 Replace dashboard delivery calculations with the shared projector so summary metrics and detail populations use the same unique pairs and active filters.
- [x] 3.2 Implement exact complete, delivery-attention, and requested-contact segments and make each metric action open the population it counted.
- [x] 3.3 Replace manual dashboard and home query-string construction with the typed route builders, including the requested-contact action.
- [x] 3.4 Correct period-specific pending-inquiry navigation to encode the exact relation type and period id expected by the inbox.
- [x] 3.5 Update the inquiry inbox to disclose active cohort/context filters, waiting time, prioritized pending work, and a context-aware empty-state reset.
- [x] 3.6 Add regression tests proving that dashboard counts reconcile with detail rows and that period inquiry actions never open an unrelated or accidentally empty population.

## 4. Actionable delivery monitoring

- [x] 4.1 Update teacher assignment delivery summaries and filters to use the shared temporal states and reconciled population counts.
- [x] 4.2 Display the enclosing period due date or an explicit no-date label and preserve assignment, cohort, period, and student focus in delivery actions.
- [x] 4.3 Make cross-assignment submitted and missing states open the correct repository or focused assignment evidence.
- [x] 4.4 Add component tests for textual state semantics, search and state filters, action destinations, mobile cards, and desktop tables.

## 5. Cohort-scoped student overview

- [x] 5.1 Add the protected `/cohorts/[cohortId]/students/[studentId]` server route with cohort staff access and visible-enrollment validation.
- [x] 5.2 Build the overview header and period summary using existing page, card, badge, alert, loading, error, and empty-state primitives.
- [x] 5.3 Add linked delivery, inquiry, assessment, review, and requested-follow-up sections with explicit completed, pending, unconfigured, and unavailable states.
- [x] 5.4 Implement a validated return action to the originating dashboard context with cohort dashboard fallback.
- [x] 5.5 Add route and component tests for cohort isolation, evidence links, return navigation, narrow viewport representation, keyboard access, and status text independent of color.

## 6. Global teacher attention workspace

- [x] 6.1 Replace the teacher home summary for a single default cohort with the global attention loader and cross-cohort source totals.
- [x] 6.2 Build urgency-grouped attention items that expose type, cohort, person, academic context, waiting or due time, explanation, and one primary action.
- [x] 6.3 Add source-unavailable notices, loading feedback, retry paths, and an all-clear state that appears only when every source loads successfully.
- [x] 6.4 Preserve the existing administrator home as the default while allowing administrators to open authorized teacher attention and student views.
- [x] 6.5 Add teacher-home tests for multiple cohorts, deterministic priority, partial failure, empty state, responsive layout, keyboard operation, and student denial.

## 7. Staff navigation and analytics actions

- [x] 7.1 Change staff cohort selection and cohort cards to open the canonical cohort dashboard while retaining student destinations and legacy cohort-root compatibility.
- [x] 7.2 Link analytics student identities to the new student overview with a validated return context.
- [x] 7.3 Make non-empty progress cells expose the assignments and delivery evidence that produced their state on desktop and mobile.
- [x] 7.4 Add navigation and shell regression tests for active cohort identity, contextual attention actions, breadcrumbs, mobile navigation, and role-specific destinations.

## 8. Quality and rollout verification

- [x] 8.1 Run and repair the targeted navigation, projection, dashboard, inquiry, delivery, student-overview, shell, accessibility, and role-access test suites.
- [x] 8.2 Run the full UI tests, cohort/content tests, lint, and production build and document any unrelated pre-existing failures separately.
- [ ] 8.3 Inspect representative teacher desktop, tablet, and mobile journeys for global triage, dashboard drill-down, student overview, inquiry context, and assignment evidence.
- [x] 8.4 Measure the global teacher workspace with representative multi-cohort data and eliminate avoidable serial or per-item PocketBase requests.
- [x] 8.5 Update UX rollout documentation with the new teacher journeys, monitoring signals, code-only rollback sequence, and the deferred assignment-specific due-date limitation.
