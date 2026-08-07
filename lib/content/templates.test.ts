import assert from "node:assert/strict";
import test from "node:test";
import { assertCompatibleTemplateTarget, assertPedagogicalOnly, cloneTemplateSnapshot, summarizeTemplateSnapshot, type ContentTemplateSnapshot } from "./templates.ts";

const snapshot: ContentTemplateSnapshot = { schemaVersion: 1, kind: "course", weeks: [{ number: 1, title: "Introducción", description: "Base", sections: [{ position: 1, title: "Node.js", summary: "Contenido", blocks: [{ key: "intro_code", type: "code", language: "javascript", code: "console.log('hola')" }] }] }] };

test("resume instantáneas de curso, semana y sección", () => {
  assert.deepEqual(summarizeTemplateSnapshot(snapshot), { kind: "course", weeks: 1, sections: 1, blocks: 1 });
  assert.deepEqual(summarizeTemplateSnapshot({ schemaVersion: 1, kind: "week", week: snapshot.weeks[0] }), { kind: "week", weeks: 1, sections: 1, blocks: 1 });
  assert.deepEqual(summarizeTemplateSnapshot({ schemaVersion: 1, kind: "section", section: snapshot.weeks[0].sections[0] }), { kind: "section", weeks: 0, sections: 1, blocks: 1 });
});

test("excluye estado operativo y conserva copias independientes", () => {
  const clean = assertPedagogicalOnly(snapshot);
  const copy = cloneTemplateSnapshot(clean);
  if (copy.kind === "course") copy.weeks[0].sections[0].title = "Personalizada";
  assert.equal(snapshot.weeks[0].sections[0].title, "Node.js");
  assert.throws(() => assertPedagogicalOnly({ ...snapshot, publicationStatus: "published" }));
});

test("valida compatibilidad del destino", () => {
  assert.doesNotThrow(() => assertCompatibleTemplateTarget("course", { cohortId: "cohort" }));
  assert.doesNotThrow(() => assertCompatibleTemplateTarget("week", { cohortId: "cohort" }));
  assert.doesNotThrow(() => assertCompatibleTemplateTarget("section", { cohortId: "cohort", weekId: "week" }));
  assert.throws(() => assertCompatibleTemplateTarget("section", { cohortId: "cohort" }), /semana/);
  assert.throws(() => assertCompatibleTemplateTarget("week", { cohortId: "cohort", weekId: "week" }), /Sólo/);
});
