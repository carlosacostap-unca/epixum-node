## Context

The current weekly flow enforces a minimum of `1` independently in the browser input, the shared Zod domain schema, and the PocketBase collection definition. The collection already sorts by `number` and enforces uniqueness for `(cohort, number)`.

## Goals / Non-Goals

**Goals:**

- Align client, server, and persistence validation on a minimum week number of `0`.
- Preserve integer validation, per-cohort uniqueness, authorization, publication behavior, and ascending order.
- Cover the boundary value with focused automated tests.

**Non-Goals:**

- Automatically create Semana 0 for existing or new cohorts.
- Rename existing weeks or renumber course content.
- Allow negative, decimal, or duplicate week numbers.

## Decisions

### Use zero as the single lower-bound constant across all validation layers

The HTML input, Zod schema, and PocketBase schema definition will each use `0` as their minimum. This avoids a client/server mismatch and ensures direct API writes receive the same constraint. Keeping the existing numeric field and unique index is narrower and safer than introducing a special onboarding container type.

### Preserve numeric ordering

The existing query sorts by `number`, so no sorting code is required. Zero naturally precedes positive week numbers and all existing labels already interpolate the stored number.

### Update the declarative PocketBase schema

The schema definition will change from `min: 1` to `min: 0`. The setup workflow will reconcile explicitly declared properties on existing fields while preserving PocketBase field identity and unrelated metadata. This makes the change detectable in dry-run mode and applicable to deployed instances without a record migration because all existing values remain valid.

## Risks / Trade-offs

- [Deployed PocketBase schema remains at minimum 1 until synchronized] → Run the existing cohort schema deployment procedure before using Semana 0 in that environment.
- [A hidden `number || fallback` assumption could reinterpret zero] → Search number consumers and add regression coverage that renders and validates the literal value `0`.
- [Duplicate Semana 0 creation] → Preserve the unique `(cohort, number)` database index and existing error handling.

## Migration Plan

1. Deploy the application changes.
2. Run the scoped `schema:week-zero` dry-run and apply it so only `weeks.number.min` becomes `0`.
3. Repeat the scoped dry-run and confirm it reports no changes.
4. Verify creation of a draft Semana 0 in a weekly test cohort.

Rollback restores the previous minimum of `1`; existing Semana 0 records must be renumbered or removed before that schema rollback.
