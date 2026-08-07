import assert from "node:assert/strict";
import test from "node:test";
import {
  assertExpectedRevision,
  buildRevisionCommitPlan,
  canAuthorContent,
  createEmptySectionBlocks,
  externalAssetSchema,
  publicationPatch,
  sectionPositionMap,
  validateSectionOrder,
  validateUploadedAsset,
} from "./authoring.ts";

test("sólo staff puede ejecutar operaciones de autoría", () => {
  assert.equal(canAuthorContent("admin"), true);
  assert.equal(canAuthorContent("docente"), true);
  assert.equal(canAuthorContent("estudiante"), false);
  assert.equal(canAuthorContent(undefined), false);
});

test("crea una revisión coherente y cambia un único puntero", () => {
  const plan = buildRevisionCommitPlan({ id: "revision0000001", sectionId: "section00000001", revisionNumber: 2, blocks: createEmptySectionBlocks(), authorId: "teacher00000001" });
  assert.equal(plan.revision.revisionNumber, 2);
  assert.equal(plan.sectionPatch.currentRevision, plan.revision.id);
  assert.equal(plan.revision.activityManifest.length, 0);
  assert.match(plan.revision.requirementsRevision, /^r[a-z0-9]{7,}$/);
});

test("rechaza guardados concurrentes sobre una revisión anterior", () => {
  assert.doesNotThrow(() => assertExpectedRevision("revision_current", "revision_current"));
  assert.throws(() => assertExpectedRevision("revision_new", "revision_old"), /cambió mientras/);
});

test("valida reordenamiento completo y deriva posiciones continuas", () => {
  const order = validateSectionOrder(["a", "b", "c"], ["c", "a", "b"]);
  assert.deepEqual([...sectionPositionMap(order).entries()], [["c", 1], ["a", 2], ["b", 3]]);
  assert.throws(() => validateSectionOrder(["a", "b"], ["a", "a"]), /exactamente una vez/);
  assert.throws(() => validateSectionOrder(["a", "b"], ["a", "c"]), /ajena/);
});

test("aplica estados, normaliza UTC y exige programación futura", () => {
  const now = new Date("2026-08-01T12:00:00.000Z");
  assert.deepEqual(publicationPatch({ status: "published" }, now), { status: "published", scheduledAt: null, publishedAt: now.toISOString() });
  assert.deepEqual(publicationPatch({ status: "hidden" }, now), { status: "hidden", scheduledAt: null });
  assert.deepEqual(publicationPatch({ status: "draft" }, now), { status: "draft", scheduledAt: null });
  assert.equal(publicationPatch({ status: "scheduled", scheduledAt: "2026-08-02T09:00:00-03:00" }, now).scheduledAt, "2026-08-02T12:00:00.000Z");
  assert.throws(() => publicationPatch({ status: "scheduled" }, now), /requiere fecha/);
  assert.throws(() => publicationPatch({ status: "scheduled", scheduledAt: "2026-08-01T08:00:00-03:00" }, now), /debe ser futura/);
});

test("valida formatos, tamaño y metadatos accesibles de medios", () => {
  assert.equal(validateUploadedAsset({ kind: "image", name: "cover.webp", type: "image/webp", size: 100, alt: "Terminal con Node.js" }).kind, "image");
  assert.equal(validateUploadedAsset({ kind: "video", name: "demo.mp4", type: "video/mp4", size: 1_000, title: "Demostración" }).kind, "video");
  assert.throws(() => validateUploadedAsset({ kind: "image", name: "x.svg", type: "image/svg+xml", size: 100, alt: "x" }), /no está permitido/);
  assert.throws(() => validateUploadedAsset({ kind: "image", name: "x.png", type: "image/png", size: 11 * 1024 * 1024, alt: "x" }), /10 MB/);
  assert.throws(() => validateUploadedAsset({ kind: "image", name: "x.png", type: "image/png", size: 100 }), /texto alternativo/);
  assert.throws(() => validateUploadedAsset({ kind: "video", name: "x.mp4", type: "video/mp4", size: 100 }), /título accesible/);
  assert.equal(externalAssetSchema.parse({ kind: "image", externalUrl: "https://example.com/a.png", alt: "Ejemplo" }).externalUrl, "https://example.com/a.png");
  assert.throws(() => externalAssetSchema.parse({ kind: "image", externalUrl: "http://example.com/a.png", alt: "Ejemplo" }), /HTTPS/);
});
