import assert from "node:assert/strict";
import test from "node:test";
import { buildRequirements, planWeek1Update } from "./week1-update.mjs";

const question = { key: "question", type: "question", activityKey: "question", required: true, questionKind: "single", prompt: "¿Cuál?", options: [{ key: "a", label: "A", code: false }, { key: "b", label: "B", code: false }], correctOptionKeys: ["a"] };
const manifest = { sections: [{ sourceKey: "week01_a", sourceFolder: "01-a", position: 1, title: "Nuevo", summary: "Resumen", blocks: [question] }] };
const section = { id: "section", sourceKey: "week01_a", position: 2, title: "Anterior", summary: "", currentRevision: "revision" };
const revision = { id: "revision", section: "section", revisionNumber: 3, blocks: [] };

test("planifica una revisión nueva sin alterar el estado editorial", () => {
  const [entry] = planWeek1Update(manifest, [section], new Map([[section.id, revision]]), new Map([[section.id, 5]]), new Map());
  assert.equal(entry.action, "create_revision");
  assert.equal(entry.nextRevisionNumber, 6);
  assert.equal(entry.previousRevisionId, "revision");
  assert.equal("status" in entry.desired, false);
  assert.equal(entry.desired.activityManifest.length, 1);
  assert.match(entry.desired.requirementsRevision, /^r[a-z0-9]{7,}$/);
});

test("es idempotente cuando contenido y metadatos ya coinciden", () => {
  const current = { ...revision, blocks: [question], ...buildRequirements([question]) };
  const currentSection = { ...section, position: 1, title: "Nuevo", summary: "Resumen" };
  const [entry] = planWeek1Update(manifest, [currentSection], new Map([[section.id, current]]), new Map([[section.id, 3]]), new Map());
  assert.equal(entry.action, "skip_unchanged");
  assert.equal(entry.contentChanged, false);
  assert.equal(entry.metadataChanged, false);
});

test("rechaza destinos incompletos o con secciones ajenas", () => {
  assert.throws(() => planWeek1Update(manifest, [], new Map(), new Map(), new Map()), /Faltan/);
  assert.throws(() => planWeek1Update(manifest, [{ ...section, sourceKey: "otra" }], new Map(), new Map(), new Map()), /Sobran/);
});
