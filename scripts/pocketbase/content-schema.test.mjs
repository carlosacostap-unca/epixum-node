import assert from "node:assert/strict";
import test from "node:test";
import { CONTENT_COLLECTION_DEFINITIONS, assertContentDefinitions, materializeContentField, planContentSchema } from "./content-schema.mjs";

test("declara siete colecciones de contenido con relaciones válidas", () => {
  assert.equal(Object.keys(CONTENT_COLLECTION_DEFINITIONS).length, 7);
  assert.equal(assertContentDefinitions(), true);
  assert.ok(CONTENT_COLLECTION_DEFINITIONS.content_sections.fields.some((field) => field.name === "currentRevision" && field.deferred));
  assert.ok(CONTENT_COLLECTION_DEFINITIONS.content_bases.fields.some((field) => field.name === "currentVersion" && field.deferred));
});

test("mantiene privadas revisiones, intentos y progreso", () => {
  const closed = { listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null };
  assert.deepEqual(CONTENT_COLLECTION_DEFINITIONS.content_section_revisions.rules, closed);
  assert.deepEqual(CONTENT_COLLECTION_DEFINITIONS.content_activity_attempts.rules, closed);
  assert.deepEqual(CONTENT_COLLECTION_DEFINITIONS.content_section_progress.rules, closed);
  assert.equal(CONTENT_COLLECTION_DEFINITIONS.content_base_versions.rules.updateRule, null);
  assert.equal(CONTENT_COLLECTION_DEFINITIONS.content_base_versions.rules.deleteRule, null);
});

test("admite secciones sin actividades para completarlas al llegar al final", () => {
  const activityManifest = CONTENT_COLLECTION_DEFINITIONS.content_section_revisions.fields.find((field) => field.name === "activityManifest");
  assert.equal(activityManifest.required, false);
});

test("protege medios y reserva la administración de bases", () => {
  const file = CONTENT_COLLECTION_DEFINITIONS.content_assets.fields.find((field) => field.name === "file");
  assert.equal(file.protected, true);
  assert.ok(file.mimeTypes.includes("image/webp"));
  assert.ok(file.mimeTypes.includes("video/mp4"));
  assert.match(CONTENT_COLLECTION_DEFINITIONS.content_bases.rules.createRule, /admin/);
  assert.doesNotMatch(CONTENT_COLLECTION_DEFINITIONS.content_bases.rules.createRule, /docente/);
});

test("planifica creación sin tocar colecciones ajenas", () => {
  const operations = planContentSchema([{ name: "weeks", fields: [], indexes: [], listRule: "legacy" }]);
  assert.equal(operations.filter((item) => item.action === "create_collection").length, 7);
  assert.equal(operations.some((item) => item.collection === "weeks"), false);
});

test("el plan es idempotente con el esquema completo", () => {
  const known = new Map([
    ["users", { id: "users" }], ["cohorts", { id: "cohorts" }], ["weeks", { id: "weeks" }],
    ...Object.keys(CONTENT_COLLECTION_DEFINITIONS).map((name) => [name, { id: name }]),
  ]);
  const collections = Object.entries(CONTENT_COLLECTION_DEFINITIONS).map(([name, definition]) => ({
    name,
    fields: definition.fields.map((field) => materializeContentField(field, known, true)),
    indexes: definition.indexes,
    ...definition.rules,
  }));
  assert.deepEqual(planContentSchema(collections), []);
});

test("planifica cambios de obligatoriedad en campos existentes", () => {
  const definition = CONTENT_COLLECTION_DEFINITIONS.content_section_progress;
  const fields = definition.fields.map((field) => ({ ...field, ...(field.name === "masteredActivities" ? { required: true } : {}) }));
  const operations = planContentSchema([{ name: "content_section_progress", fields, indexes: definition.indexes, ...definition.rules }]);
  assert.deepEqual(operations.filter((item) => item.action === "update_field"), [{ action: "update_field", collection: "content_section_progress", field: "masteredActivities", changes: ["required"] }]);
});

test("define índices de unicidad para orden, revisiones, intentos y progreso", () => {
  assert.ok(CONTENT_COLLECTION_DEFINITIONS.content_sections.indexes.some((index) => index.includes("UNIQUE INDEX") && index.includes("week, position")));
  assert.ok(CONTENT_COLLECTION_DEFINITIONS.content_section_revisions.indexes.some((index) => index.includes("section, revisionNumber")));
  assert.ok(CONTENT_COLLECTION_DEFINITIONS.content_activity_attempts.indexes.some((index) => index.includes("attemptKey")));
  assert.ok(CONTENT_COLLECTION_DEFINITIONS.content_section_progress.indexes.some((index) => index.includes("student, section")));
});
