import assert from "node:assert/strict";
import test from "node:test";
import { COLLECTION_DEFINITIONS } from "./cohort-schema.mjs";

test("las solicitudes son privadas y bloquean duplicados pendientes", () => {
  const definition = COLLECTION_DEFINITIONS.enrollment_requests;
  assert.deepEqual(definition.rules, { listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null });
  assert.equal(definition.indexes.length, 2);
  assert.ok(definition.indexes.every((index) => index.includes("UNIQUE INDEX") && index.includes("WHERE status = 'pending'")));
  assert.ok(definition.fields.some((field) => field.name === "created" && field.type === "autodate"));
  assert.ok(definition.fields.some((field) => field.name === "updated" && field.type === "autodate"));
});
