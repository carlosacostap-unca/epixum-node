# UX/UI redesign rollout

## Intentional visual changes

- One role-aware application shell replaces the historical header and route-local navigation.
- Cohort identity, breadcrumbs, page titles, active navigation and account actions now remain in predictable locations.
- Student, teacher and administrator homes prioritize pending work instead of presenting the same destination catalog.
- Academic content, deliveries, inquiries, reviews, teams, surveys, dashboards, profiles and administration use shared page headers, cards, badges, form fields, feedback and route states.
- Dense datasets use a semantic desktop table or matrix and an equivalent labeled mobile representation.
- Light, dark and system themes share the same hierarchy and textual status meaning.
- Historical global URLs remain compatible, but application links use canonical cohort-scoped destinations.

## Quality evidence

| Area | Evidence |
| --- | --- |
| Accessibility | Axe smoke audits for public access and all three role shells; no serious or critical violations. Keyboard traversal verified on login, enrollment assistance, student navigation, teacher analytics and administrator filters. |
| Responsive visual | Login desktop/light, enrollment mobile/dark, student mobile/light, teacher dashboard tablet/dark and administrator desktop/light inspected at representative viewports. |
| Permissions | Anonymous protection, student/staff/admin navigation, administrator-only routes and cohort isolation verified through server and E2E tests. |
| Mutations | Enrollment requests, assessment attempts, deliveries, inquiries, reviews, teams, surveys, profile and administrative action tests retain the established PocketBase behavior. |
| Performance | Production warm render: longitudinal dashboard 1.60 s (budget 12 s), sprint collection 0.46 s (budget 5 s), user administration 0.37 s (budget 5 s), measured locally against configured PocketBase on 2026-07-30. |

Browser artifacts are generated under the ignored `output/playwright/final-quality/` directory. Run `node scripts/quality/create-role-browser-states.mjs` to create short-lived local sessions and `npm run quality:performance` to repeat timing measurements.

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
