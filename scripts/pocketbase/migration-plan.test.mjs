import test from "node:test";
import assert from "node:assert/strict";
import { analyzeSnapshot, duplicateEmails, normalizeEmail } from "./migration-plan.mjs";

const base = {
  users: [{ id: "u1", email: " Student@Example.com ", role: "estudiante" }],
  sprints: [{ id: "s1", cohort: "" }],
  teams: [{ id: "t1", cohort: "" }],
  classes: [{ id: "c1", sprint: "s1", week: "" }],
  assignments: [{ id: "a1", sprint: "s1", week: "" }],
  deliveries: [{ id: "d1", assignment: "a1", student: "u1" }],
  inquiries: [{ id: "i1", cohort: "", class: "c1" }],
  messages: [{ id: "m1", team: "t1", sender: "u1" }],
  reviews: [{ id: "r1", sprint: "s1" }],
  student_surveys: [{ id: "sv1", sprint: "s1" }],
};

test("normaliza correos y detecta duplicados", () => {
  assert.equal(normalizeEmail(" User@Example.COM "), "user@example.com");
  assert.deepEqual(duplicateEmails([{ id: "1", email: "A@x.com" }, { id: "2", email: " a@X.com " }]), [{ email: "a@x.com", userIds: ["1", "2"] }]);
});

test("planifica la primera ejecución sin modificar conteos", () => {
  const result = analyzeSnapshot(base);
  assert.deepEqual(result.missingCohort, { sprints: ["s1"], teams: ["t1"], inquiries: ["i1"] });
  assert.deepEqual(result.orphaned, []);
  assert.deepEqual(result.invalidParents, []);
});

test("la reejecución y los datos parcialmente migrados sólo incluyen faltantes", () => {
  const result = analyzeSnapshot({
    ...base,
    sprints: [{ ...base.sprints[0], cohort: "legacy" }],
    teams: [{ ...base.teams[0], cohort: "legacy" }],
  });
  assert.deepEqual(result.missingCohort.sprints, []);
  assert.deepEqual(result.missingCohort.teams, []);
  assert.deepEqual(result.missingCohort.inquiries, ["i1"]);
});

test("detecta padres dobles, padres ausentes y referencias huérfanas", () => {
  const result = analyzeSnapshot({
    ...base,
    classes: [{ id: "bad", sprint: "missing", week: "w1" }],
    assignments: [{ id: "none", sprint: "", week: "" }],
  });
  assert.equal(result.invalidParents.length, 2);
  assert.equal(result.orphaned[0].collection, "classes");
});
