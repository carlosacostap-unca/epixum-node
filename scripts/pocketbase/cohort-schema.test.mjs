import test from "node:test";
import assert from "node:assert/strict";
import { COLLECTION_DEFINITIONS, reconcileFieldDefinition } from "./cohort-schema.mjs";

test("el esquema de semanas admite el número cero y conserva enteros y unicidad", () => {
  const numberField = COLLECTION_DEFINITIONS.weeks.fields.find((field) => field.name === "number");

  assert.deepEqual(numberField, { name: "number", type: "number", required: true, onlyInt: true, min: 0 });
  assert.ok(COLLECTION_DEFINITIONS.weeks.indexes.includes("CREATE UNIQUE INDEX idx_week_cohort_number ON weeks (cohort, number)"));
});

test("la sincronización actualiza el mínimo de un campo existente sin perder su identidad", () => {
  const existing = { id: "field-week-number", name: "number", type: "number", required: true, onlyInt: true, min: 1, system: false };
  const desired = COLLECTION_DEFINITIONS.weeks.fields.find((field) => field.name === "number");
  const result = reconcileFieldDefinition(existing, desired, new Map());

  assert.equal(result.changed, true);
  assert.deepEqual(result.changedKeys, ["min"]);
  assert.equal(result.field.id, "field-week-number");
  assert.equal(result.field.min, 0);
});

test("la sincronización del campo es idempotente una vez aplicado el mínimo", () => {
  const desired = COLLECTION_DEFINITIONS.weeks.fields.find((field) => field.name === "number");
  const result = reconcileFieldDefinition({ id: "field-week-number", ...desired }, desired, new Map());

  assert.equal(result.changed, false);
  assert.deepEqual(result.changedKeys, []);
});
