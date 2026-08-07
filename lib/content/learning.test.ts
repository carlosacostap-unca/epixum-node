import assert from "node:assert/strict";
import test from "node:test";
import { contentBlockSchema, type ChecklistBlock, type QuestionBlock, type ValidatorBlock } from "./domain.ts";
import { buildContentRequirements } from "./revisions.ts";
import { activityManifestEntry, calculateRequirementProgress, gradeActivity, monotonicBlockProgress } from "./learning.ts";

const question = contentBlockSchema.parse({ key: "question_one", type: "question", activityKey: "activity_one", required: true, questionKind: "multiple", prompt: "Elegí", options: [{ key: "option_a", label: "A" }, { key: "option_b", label: "B" }, { key: "option_c", label: "C" }], correctOptionKeys: ["option_a", "option_c"] }) as QuestionBlock;
const checklist = contentBlockSchema.parse({ key: "checklist_one", type: "checklist", activityKey: "activity_check", required: true, title: "Lista", items: [{ key: "check_a", label: "A" }, { key: "check_b", label: "B" }] }) as ChecklistBlock;
const validator = contentBlockSchema.parse({ key: "validator_one", type: "validator", activityKey: "activity_version", required: true, label: "Versión", rule: { kind: "semantic_version" } }) as ValidatorBlock;

test("corrige selección múltiple por coincidencia exacta sin confiar en el cliente", () => {
  assert.equal(gradeActivity(question, { selectedOptionKeys: ["option_c", "option_a"] }).outcome, "correct");
  assert.equal(gradeActivity(question, { selectedOptionKeys: ["option_a"] }).outcome, "incorrect");
  assert.throws(() => gradeActivity(question, { selectedOptionKeys: ["missing"] }), /no válidas/);
});

test("una auto-comprobación queda satisfecha al marcar todos los puntos", () => {
  assert.equal(gradeActivity(checklist, { checkedItemKeys: ["check_a"] }).outcome, "pending");
  assert.equal(gradeActivity(checklist, { checkedItemKeys: ["check_b", "check_a"] }).outcome, "satisfied");
});

test("valida reglas declarativas del lado servidor", () => {
  assert.equal(gradeActivity(validator, { value: "v20.11.1" }).outcome, "correct");
  assert.equal(gradeActivity(validator, { value: "la última" }).outcome, "incorrect");
});

test("la finalización exige dominio de cada revisión requerida", () => {
  const blocks = [question, checklist];
  const requirements = buildContentRequirements(blocks);
  const questionEntry = activityManifestEntry(question);
  const checklistEntry = activityManifestEntry(checklist);
  assert.equal(calculateRequirementProgress(requirements, [{ ...questionEntry, outcome: "correct" }], false).completed, false);
  assert.equal(calculateRequirementProgress(requirements, [{ ...questionEntry, outcome: "correct" }, { ...checklistEntry, outcome: "satisfied" }], false).completed, true);
  assert.equal(calculateRequirementProgress(requirements, [{ ...questionEntry, activityRevision: "rprevious", outcome: "correct" }, { ...checklistEntry, outcome: "satisfied" }], false).completed, false);
});

test("una sección sin actividades se completa sólo al alcanzar el último bloque", () => {
  const block = contentBlockSchema.parse({ key: "content_end", type: "code", language: "text", code: "fin" });
  const requirements = buildContentRequirements([block]);
  assert.equal(calculateRequirementProgress(requirements, [], false).completed, false);
  assert.equal(calculateRequirementProgress(requirements, [], true).completed, true);
  assert.equal(monotonicBlockProgress(["first", "middle", "content_end"], 1, "first"), 1);
  assert.equal(monotonicBlockProgress(["first", "middle", "content_end"], 1, "content_end"), 2);
});
