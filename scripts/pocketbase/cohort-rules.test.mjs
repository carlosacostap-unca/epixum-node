import test from "node:test";
import assert from "node:assert/strict";
import { HARDENED_RULES, ruleChanges } from "./cohort-rules.mjs";

test("las reglas académicas exigen cohorte y publicación semanal", () => {
  assert.match(HARDENED_RULES.weeks.listRule, /publicationStatus = "published"/);
  assert.match(HARDENED_RULES.inquiries.listRule, /cohort_enrollments_via_cohort/);
  assert.match(HARDENED_RULES.deliveries.createRule, /status \?= "active"/);
});

test("el endurecimiento es idempotente", () => {
  const collections = Object.entries(HARDENED_RULES).map(([name, rules]) => ({ name, fields: name === "sprints" || name === "teams" || name === "inquiries" ? [{ name: "cohort", required: true }] : [], ...rules }));
  assert.deepEqual(ruleChanges(collections), []);
});
