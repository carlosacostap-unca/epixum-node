import assert from "node:assert/strict";
import test from "node:test";
import { COLLECTION_DEFINITIONS } from "./cohort-schema.mjs";

test("el resultado diagnóstico es privado, idempotente y separa el intento inicial", () => {
  const definition = COLLECTION_DEFINITIONS.javascript_assessment_results;
  assert.ok(definition);
  assert.deepEqual(definition.rules, { listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null });
  assert.ok(definition.indexes.some((index) => index.includes("CREATE INDEX") && index.includes("student, cohort, assessmentVersion")));
  assert.ok(definition.fields.some((field) => field.name === "attemptKind" && field.values.includes("initial") && field.values.includes("practice")));
  assert.ok(definition.fields.some((field) => field.name === "attemptKey"));
  assert.ok(definition.indexes.some((index) => index.includes("UNIQUE INDEX idx_js_assessment_attempt_key")));
  assert.ok(definition.indexes.some((index) => index.includes("UNIQUE INDEX idx_js_assessment_initial")));
});
