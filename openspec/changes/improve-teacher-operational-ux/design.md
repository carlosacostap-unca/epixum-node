## Context

See [proposal.md](./proposal.md) for motivation. The current teacher home calculates unrelated counts directly in the route, defaults to the first active cohort, and builds some drill-down URLs manually. The cohort dashboard independently reconstructs delivery coverage, while assignment details and content analytics use separate projections. This produces inconsistent populations and links even though the shared application shell and UI primitives are already established.

PocketBase remains the source of truth. Assignments do not currently have their own due date or applicability policy; weeks and sprints have optional end dates. The change must preserve the existing role checks, cohort isolation, canonical cohort-scoped routes, responsive representations, and legacy route compatibility.

## Goals / Non-Goals

**Goals:**

- Establish one reusable projection for delivery state and one reusable projection for teacher attention items.
- Make all teacher drill-downs encode and preserve the same typed cohort, period, student, and filter context.
- Add a server-rendered student overview whose data is strictly scoped to one accessible cohort and enrollment.
- Load independent teacher signals concurrently and represent partial failures honestly.
- Keep the first release deployable without a PocketBase schema migration.

**Non-Goals:**

- Adding grades, rubrics, automated interventions, notifications, email, or messaging.
- Persisting teacher ownership, custom priority, or follow-up notes as new records.
- Adding assignment-specific due dates or optional-assignment rules in this change.
- Replacing the existing content, inquiry, review, assessment, or enrollment workflows.
- Changing role permissions or removing legacy routes.

## Decisions

### 1. Build shared server-side domain projections

Create a delivery-state projector that accepts students, assignments, deliveries, enclosing periods, the current instant, and the active filter context. It returns a unique state for each applicable student-assignment pair plus reconciled counts. The same projector will feed the teacher home, dashboard, assignment detail, attention queue, and student overview.

Create a separate attention projector that converts pending inquiries, projected delivery risks, requested-contact survey responses, upcoming reserved reviews, and pending enrollment requests into a discriminated item model. Each item will contain stable identity, source type, urgency tier, cohort, optional student and period, relevant timestamp, explanation, and canonical action URL.

This separates data loading from behavior and prevents page components from inventing their own counts. Reusing the current page-level calculations was rejected because it would preserve inconsistent definitions and make exact drill-down tests difficult.

### 2. Derive temporal delivery state from the enclosing period

For this release, a submitted delivery always wins. A missing delivery becomes overdue after the enclosing week or sprint end date, due soon during the seven calendar days before that date, and pending otherwise. A missing delivery whose period has no end date remains pending and is labeled as unscheduled.

Dates are normalized through one helper using the application's academic timezone rather than ad hoc `Date` parsing in components. Introducing `assignment.dueAt` or `assignment.required` was rejected for this change because it would require a data migration, authoring UI, compatibility rules, and decisions about existing records. The projector boundary allows those fields to replace the fallback later.

### 3. Use a global server-rendered attention workspace with partial-source results

The teacher home will load accessible cohort identity first, then request each attention source concurrently with cohort-scoped filters and restricted fields. Independent source results will use settled outcomes so one unavailable collection cannot silently become a zero. The page will render available items, unavailable-source notices, source totals, and an all-clear state only when every source succeeded.

The attention list will be ordered by an explicit urgency rank followed by the relevant due or waiting timestamp. The interface will initially remain read-only: actions navigate into established workflows. Adding inline mutations was rejected until the navigation and population contracts are reliable.

### 4. Add a canonical cohort-scoped student overview route

Use `/cohorts/[cohortId]/students/[studentId]` as the canonical staff route. The route will require cohort staff access and then verify that the requested student has a visible enrollment in that cohort before loading academic records. Queries will be scoped by both cohort relationships and student identity; records from other cohorts must never be merged into the result.

The page will compose existing badges, cards, route states, mobile layouts, and evidence links. It will not duplicate editing forms. A query parameter may carry a validated return destination within the same application so the teacher can return to the filtered dashboard; an unsafe or unsupported value falls back to the cohort dashboard.

A modal or drawer was rejected because the overview combines several datasets, needs a stable deep link, and must remain usable on narrow viewports.

### 5. Centralize canonical route and filter builders

Introduce typed builders for staff cohort landing, dashboard segments, inquiry context, student overview, assignment focus, and safe return context. UI components will consume these builders instead of manually concatenating query strings. Inquiry period context will use the canonical compound identifier containing the relation type and record id.

The staff cohort selector and cohort cards will resolve to the cohort dashboard. Direct attention actions bypass that default and open their specific workflow. Historical cohort root routes remain available as compatibility adapters.

Centralized builders were chosen over patching the two known broken links individually because the same class of context loss exists across home metrics, analytics cards, and student evidence navigation.

### 6. Make analytics identities and period states interactive without changing their visual model

The existing responsive table/card representations remain. Student identities link to the student overview, and each non-empty period state exposes an assignment/evidence drill-down. Metric cards continue to filter the dashboard where that is the best detail, but their filter state must be produced from the same projection used for the count.

This is an incremental extension of the current dashboard rather than a replacement. A new analytics product was rejected because the current matrix and filter bar already satisfy the layout and accessibility baseline.

### 7. Test projections and navigation contracts before visual workflows

Unit tests will cover delivery-state boundaries, unique-pair reconciliation, attention priority, partial failures, and route builders. Component and route tests will verify exact filtered populations, access control, return navigation, textual status, keyboard operation, and equivalent mobile representation. Existing UI, navigation, content, and cohort tests remain regression gates.

## Risks / Trade-offs

- **[Period end dates are only a proxy for assignment deadlines]** → Label unscheduled work explicitly, keep the derivation in one projector, and defer assignment-specific dates to a separate schema change.
- **[Global aggregation can become expensive as cohorts grow]** → Query only actionable statuses and required fields, run sources concurrently, avoid per-item relation calls, and measure the workspace with representative multi-cohort data.
- **[Partial PocketBase failures could produce contradictory totals]** → Keep source health beside each result and never fold an unavailable source into zero or an all-clear state.
- **[Deep links can leak stale or unsafe return paths]** → Accept only application-relative destinations from an allowlisted cohort scope and use the cohort dashboard as fallback.
- **[Teacher and administrator priorities differ]** → Keep the existing administrator home as default; authorize administrators to use the teacher workspace and student overview without redefining their administrative landing page.
- **[A global queue may be visually dense]** → Start with urgency grouping, compact context labels, one primary action per item, and a bounded responsive layout; do not add inline secondary operations in this release.

## Migration Plan

1. Add shared route builders and projection tests without changing visible navigation.
2. Replace delivery calculations and repair inquiry/follow-up drill-downs behind existing screens.
3. Add and verify the cohort-scoped student overview and link it from analytics.
4. Replace the teacher home with the global attention workspace and switch staff cohort destinations to the dashboard.
5. Run unit, UI, accessibility, responsive, role-access, production build, and representative performance checks.
6. Deploy without data migration and monitor server errors, unavailable-source notices, response time, and empty drill-downs.

Rollback is code-only: restore the previous teacher home and staff destination while leaving the additive student route unused. Shared projection code can be reverted independently because it does not mutate PocketBase records or schemas.
