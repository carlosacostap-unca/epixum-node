import test from "node:test";
import assert from "node:assert/strict";
import { appendSearchParams, cohortPath, legacyDashboardDestination, legacyRouteInventory, requireMatchingCohort } from "./route-compatibility.ts";

test("inventory covers every saved historical route family", () => {
  const sources = legacyRouteInventory.map(route => route.source);
  for (const source of ["/sprints", "/classes/:classId", "/assignments/:assignmentId", "/teams", "/reviews", "/inquiries", "/dashboard", "/student-form"]) {
    assert.ok(sources.includes(source as (typeof sources)[number]), `${source} is missing`);
  }
});

test("canonical builders preserve filters and repeated values", () => {
  assert.equal(cohortPath("cohort one", "/inquiries"), "/cohorts/cohort%20one/inquiries");
  assert.equal(appendSearchParams("/cohorts/c1/inquiries", { search: "async await", status: ["open", "closed"], cohortId: "old" }, ["cohortId"]), "/cohorts/c1/inquiries?search=async+await&status=open&status=closed");
});

test("entity ownership prevents cross-cohort deep links", () => {
  assert.equal(requireMatchingCohort("cohort-a", "cohort-a"), "cohort-a");
  assert.equal(requireMatchingCohort("cohort-a", "cohort-b"), null);
  assert.equal(requireMatchingCohort(undefined, "cohort-a"), null);
});

test("saved dashboard detail URLs retain period and drill-down state", () => {
  assert.equal(legacyDashboardDestination("cohort-a", "sprint-1", "follow-up"), "/cohorts/cohort-a/dashboard?period=sprint-1&detail=follow-up");
});
