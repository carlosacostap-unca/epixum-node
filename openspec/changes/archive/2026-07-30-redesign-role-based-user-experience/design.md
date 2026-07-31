## Context

See `proposal.md` for motivation. The application uses Next.js App Router with server-rendered route components, client components for mutations and rich interaction, Tailwind CSS, and PocketBase. Global navigation currently lives in one client header while cohort navigation is implemented by a second server layout. Visual patterns are repeated as route-local utility classes, and historical global routes coexist with newer cohort-scoped routes.

The redesign must be incremental because the working application contains active weekly and historical cohort flows. Existing permissions, server actions, collection rules, URLs used in external links, and user data must remain valid throughout migration.

## Goals / Non-Goals

**Goals:**

- Establish one application shell, role navigation model, cohort context model, and responsive behavior.
- Create a small set of composable visual primitives that can replace repeated route-local patterns.
- Preserve server rendering and keep client-side state limited to interactions that require it.
- Migrate screens in independently verifiable vertical slices without a flag day.
- Make accessibility and narrow-viewport behavior part of each component contract.

**Non-Goals:**

- Changing PocketBase collections, access rules, role definitions, or academic calculations.
- Replacing Tailwind CSS or adopting a full third-party component framework.
- Rewriting every screen as a client component or introducing a global client state store.
- Removing historical URLs before redirects and compatibility have been verified.
- Adding new academic workflows unrelated to presentation and navigation.

## Decisions

### 1. Use a server-first application shell with small client islands

The root authenticated layout will resolve identity and stable navigation data on the server. Client components will handle the mobile menu, cohort switcher interaction, identity menu, theme preference, toasts, dialogs, and other local state.

This avoids the current post-hydration identity refresh and navigation shift while preserving App Router streaming and authorization boundaries. A fully client-rendered shell was rejected because it would duplicate server access decisions and increase layout instability.

### 2. Model navigation as role and capability data

Navigation items will be declared as typed configuration with label, icon identifier, destination builder, supported roles, cohort mode, and optional capability. The server filters this model using the same access context already used by routes.

Hard-coded JSX branches in each header were rejected because they reproduce the current divergence and make active-state, mobile, and breadcrumb behavior inconsistent.

### 3. Make cohort scope canonical

Cohort-aware destinations will use `/cohorts/[cohortId]/...` as the canonical information architecture. Historical global routes will remain as adapters or redirects until every entry point and deep link is verified. The shell will carry the active cohort through destination builders rather than global mutable state.

This makes URLs shareable and server-renderable. A client-only selected-cohort store was rejected because it could produce ambiguous deep links and cross-cohort actions.

### 4. Introduce layered visual primitives, not page-specific abstractions

The design system will have three layers:

1. Tokens: semantic colors, spacing, radii, shadows, typography, focus ring, and content widths.
2. Primitives: button, link button, input, select, textarea, badge, card, alert, dialog, drawer, tabs, skeleton, toast, and empty state.
3. Patterns: application shell, page header, filter bar, metric card, data table, mobile data list, form section, detail panel, and split view.

Components will accept semantic variants such as `primary`, `danger`, `success`, and `warning`; domain screens will not encode status solely through arbitrary color utilities. A large external UI kit was rejected to limit dependency and migration cost, while retaining the option to use accessible headless primitives for dialogs or menus if native behavior proves insufficient.

### 5. Separate reading, editing, and creation modes

Content and administrative detail screens will render read-focused views by default. Create and edit actions will open dedicated routes, dialogs, drawers, or explicit modes according to complexity. Short bounded forms may use dialogs; rich or multi-section forms will use a drawer or page.

Always-visible forms were rejected because they compete with the content users visit most often and make staff pages disproportionately long.

### 6. Use URL state for shareable filters and tabs

Collection filters, dashboard segments, status tabs, and meaningful detail tabs will use search parameters when the state is useful to share or restore. Ephemeral UI state such as an open mobile menu remains local.

This supports server rendering, back navigation, and links from metrics to filtered details. A global client filter store was rejected as unnecessary.

### 7. Provide paired desktop and mobile representations for dense data

Reusable collection patterns will support both a semantic table for wide viewports and a labeled card/list representation for narrow viewports. Long matrices may retain a contained horizontal region with sticky labels only when a card representation would lose comparative meaning.

Simply wrapping every table in full-page horizontal scrolling was rejected because it separates values from headers and hides row actions.

### 8. Treat operation feedback as shared infrastructure

Server actions will return a consistent result shape suitable for inline field errors, form-level errors, success toasts, and updated data. Destructive and bulk operations will use a shared confirmation dialog describing the target and consequence. Route-level loading, error, and not-found boundaries will use shared states.

Browser-native confirmation and silent refresh were rejected because they are visually inconsistent and do not provide adequate context or accessible focus management.

### 9. Implement theme and accessibility at the foundation

The document language will be Spanish. Focus styles, reduced-motion behavior, contrast, target sizing, accessible names, status text, landmarks, heading order, and keyboard dismissal will be part of primitives. Theme preference will support light, dark, and system modes and be applied before paint through server-readable or pre-hydration preference.

Accessibility cleanup after page migration was rejected because primitive defects would otherwise be repeated across the application.

## Risks / Trade-offs

- **Large visual surface can create an extended mixed-state UI** → Migrate by complete workflows, while compatibility primitives let unmigrated screens render inside the new shell.
- **Canonical cohort routes can break saved historical links** → Keep redirects/adapters, add route regression tests, and remove compatibility only in a later change.
- **Role navigation can drift from authorization rules** → Derive visibility from server access context and keep route authorization authoritative; navigation never grants access.
- **Custom primitives can accumulate accessibility defects** → Keep the primitive set small, use native elements where possible, and add automated keyboard and accessibility checks before broad adoption.
- **Responsive dual presentations duplicate markup** → Share normalized column/card descriptors or child renderers and test that both expose equivalent labels and actions.
- **Dashboard filtering can increase server query cost** → Reuse current fetched datasets initially, measure payload and render time, then move filters into PocketBase queries only where needed.
- **Visual redesign may obscure unchanged domain defects** → Keep behavioral tests green and separate domain fixes into follow-up changes unless required by these specifications.

## Migration Plan

1. Establish tokens, primitives, accessibility defaults, feedback infrastructure, and visual test fixtures without replacing domain screens.
2. Add the server-first shell and role navigation around existing screens; keep historical destinations operational.
3. Migrate authentication, cohort selection, role homes, and profile to validate the shell across public and authenticated states.
4. Migrate the student learning vertical slice: week/sprint list, detail, class, assignment, delivery, inquiries, reviews, team, and survey.
5. Migrate the teacher vertical slice: content authoring, delivery review, inquiries, agenda, teams, dashboards, and assessment reporting.
6. Migrate administrative cohort, enrollment, request, and user screens.
7. Add redirects for superseded global routes, run role and deep-link regression tests, and remove obsolete navigation components only after verification.

Each phase is deployable independently. Rollback consists of reverting the affected route or layout to its compatibility component; no data rollback is required because the change does not migrate PocketBase data.
