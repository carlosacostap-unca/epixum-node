# UX/UI redesign rollout

## Intentional visual changes

- One role-aware application shell replaces the historical header and route-local navigation.
- Cohort identity, breadcrumbs, page titles, active navigation and account actions now remain in predictable locations.
- Student, teacher and administrator homes prioritize pending work instead of presenting the same destination catalog.
- Academic content, deliveries, inquiries, reviews, teams, surveys, dashboards, profiles and administration use shared page headers, cards, badges, form fields, feedback and route states.
- Dense datasets use a semantic desktop table or matrix and an equivalent labeled mobile representation.
- Light, dark and system themes share the same hierarchy and textual status meaning.
- Historical global URLs remain compatible, but application links use canonical cohort-scoped destinations.

## Teacher operational journeys

- The teacher home now aggregates actionable work across every accessible cohort instead of selecting one implicit cohort. Consultations, overdue or imminent deliveries, requested follow-up, scheduled reviews and enrollment requests are grouped by urgency with one evidence-backed action each.
- Every source reports its own availability. A failed PocketBase request appears as unavailable and never as a zero count or an all-clear state; the remaining sources stay usable and expose a retry path.
- Cohort cards, the cohort switcher and legacy staff cohort roots open the cohort dashboard. Student cohort destinations keep their existing learning entry point.
- Dashboard metrics reconcile with their detail population. Student identities and non-empty period cells open the cohort-scoped student overview while preserving a validated return URL and the originating signal.
- Assignment monitoring uses unique student-assignment pairs and textual submitted, overdue, due-soon and pending states on desktop and mobile. Evidence links preserve cohort, period, assignment and focused student context.
- The inquiry inbox discloses cohort/context/status filters, prioritizes the oldest pending work, shows waiting time and offers a context-aware reset.

The assignment schema still has no assignment-specific due date. Delivery urgency therefore uses the enclosing week or sprint end date and displays an explicit no-date state when that value is absent. Adding per-assignment deadlines remains deferred.

## Quality evidence

| Area | Evidence |
| --- | --- |
| Accessibility | Axe smoke audits for public access and all three role shells; no serious or critical violations. Keyboard traversal verified on login, enrollment assistance, student navigation, teacher analytics and administrator filters. |
| Responsive visual | Login desktop/light, enrollment mobile/dark, student mobile/light, teacher dashboard tablet/dark and administrator desktop/light inspected at representative viewports. |
| Permissions | Anonymous protection, student/staff/admin navigation, administrator-only routes and cohort isolation verified through server and E2E tests. |
| Mutations | Enrollment requests, assessment attempts, deliveries, inquiries, reviews, teams, surveys, profile and administrative action tests retain the established PocketBase behavior. |
| Performance | Production warm render: longitudinal dashboard 1.60 s (budget 12 s), sprint collection 0.46 s (budget 5 s), user administration 0.37 s (budget 5 s), measured locally against configured PocketBase on 2026-07-30. |

Teacher workspace monitoring should track the warm response time for `/` as a teacher and `/staff/attention` as an administrator, per-source PocketBase failures, empty-versus-partial outcomes, authorization denials, and drill-down 404s. The loader performs a fixed set of batched collection reads and no request per attention item.

Offline performance verification covers twelve cohorts with a fixed nine-list-request loader plan and a representative 10,000 student-assignment-pair projection under a two-second local budget. The authenticated remote timing command remains the production-like check; it requires explicit authorization because it impersonates short-lived teacher, student and administrator sessions against the configured PocketBase.

Browser artifacts are generated under the ignored `output/playwright/final-quality/` directory. Run `node scripts/quality/create-role-browser-states.mjs` to create short-lived local sessions and `npm run quality:performance` to repeat timing measurements.

### Teacher UX verification — 2026-08-02

- `npm run test:ui`: 26 files and 103 tests passed.
- `npm run test:cohorts`: 104 tests passed.
- Targeted teacher loader and projection verification: 9 tests passed, including the fixed nine-request plan and 10,000-pair workload.
- `npm run lint`: passed with 30 pre-existing warnings in legacy forms, team images, review actions and PocketBase helpers; the teacher UX change adds no lint error.
- `npm run build`: production compilation, TypeScript and route generation passed, including `/staff/attention` and `/cohorts/[cohortId]/students/[studentId]`.
- Authenticated desktop, tablet and mobile visual inspection remains pending because the available browser session has no teacher login. The public login surface loaded correctly; no alternate signed-in browser was connected.

## Phased rollout checklist

- [x] Foundation: tokens, primitives, focus, motion, theme and shared feedback available.
- [x] Shell: server identity, role navigation, cohort context and responsive navigation active.
- [x] Student workflows: academic content, submissions, inquiries, reviews, team and survey migrated.
- [x] Staff workflows: authoring, deliveries, collaboration, dashboard and assessment reporting migrated.
- [x] Administration: cohorts, enrollments, requests, users and profile migrated.
- [x] Compatibility: historical entry points mapped, tested and retained as adapters or redirects.
- [x] Quality gate: accessibility, responsive, permissions, mutation, performance, lint, production build and automated tests verified.
- [ ] Deployment: release through the normal environment pipeline and monitor server errors, rejected PocketBase requests and response-time percentiles.
- [ ] Post-deployment: sample one public, student, teacher and administrator journey with production identities.
- [ ] Stabilization: remove temporary rollout monitoring only after the agreed observation window.

## Rollback

No data migration is part of this redesign. If a migrated workflow regresses, revert its route or shared component while retaining the compatibility routes. Do not roll back PocketBase data. If a global shell issue occurs, revert the root shell integration as one unit; if a cohort workflow fails, revert only that vertical slice and keep canonical URL adapters operational.

For the teacher UX specifically, use this code-only rollback order:

1. Restore the previous teacher branch in `app/page.tsx` and remove the administrator action to `/staff/attention`; this immediately restores the single-cohort home without changing data.
2. Restore staff cohort destinations in `lib/navigation.ts`, the cohort cards and the shell switcher if dashboard landing causes operational regressions.
3. Restore the previous dashboard, inquiry list and assignment-delivery components while keeping their canonical routes available.
4. Remove the student overview and `/staff/attention` routes last, after confirming no saved application links still target them.

No PocketBase collection, record or migration needs to be reverted for any step.
