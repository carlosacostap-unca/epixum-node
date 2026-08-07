import assert from "node:assert/strict";
import test from "node:test";
import manifest from "../../content/week-01.manifest.json" with { type: "json" };
import { planWeek1Import, resolveManifestAssetReferences } from "./week1-import.mjs";

test("planifica catorce borradores en un destino vacío", () => {
  const plan = planWeek1Import(manifest);
  assert.equal(plan.sections.length, 14);
  assert.equal(plan.assets.length, 27);
  assert.equal(plan.sections.some((section) => section.sourceFolder === "02-diagnostico-javascript"), false);
});

test("la repetición omite secciones y medios ya importados", () => {
  const plan = planWeek1Import(manifest, manifest.sections.map((section) => ({ sourceKey: section.sourceKey })), manifest.assets.map((asset) => ({ importKey: asset.key })));
  assert.equal(plan.sections.length, 0); assert.equal(plan.assets.length, 0); assert.equal(plan.skippedSections, 14); assert.equal(plan.skippedAssets, 27);
});

test("resuelve referencias de medios de forma explícita", () => {
  const block = manifest.sections.flatMap((section) => section.blocks).find((item) => item.type === "image");
  const ids = new Map([[block.source.assetId, "assetrecord0001"]]);
  assert.equal(resolveManifestAssetReferences([block], ids)[0].source.assetId, "assetrecord0001");
  assert.throws(() => resolveManifestAssetReferences([block], new Map()), /No se encontró/);
});

test("la introducción orienta la semana sin confundir la duración de la clase", () => {
  const section = manifest.sections.find((item) => item.sourceKey === "week01_resumen");
  assert.ok(section);
  assert.deepEqual(section.blocks.map((block) => block.type), ["callout", "code", "cards", "steps", "callout"]);

  const [guidedClass, deliverable, outcomes, journey, preparation] = section.blocks;
  assert.equal(guidedClass.eyebrow, "CLASE GUIADA · 1 H 30 MIN");
  assert.equal(guidedClass.tone, "info");
  assert.match(JSON.stringify(guidedClass.body), /solamente a esa lectura guiada/);
  assert.doesNotMatch(JSON.stringify(section), /2 H 30 MIN|ENCUENTRO PRINCIPAL/);

  assert.equal(deliverable.language, "text");
  assert.match(deliverable.code, /programa-modular-node\/.*app\.js.*saludos\.js.*historial\.js.*README\.md/s);
  assert.equal(outcomes.items.length, 3);
  assert.deepEqual(outcomes.items.map((item) => item.title), ["Preparar herramientas", "Comprender Node.js", "Construir y publicar"]);
  assert.equal(journey.items.length, 5);
  assert.deepEqual(journey.items.map((item) => item.title), ["Prepará el entorno", "Ubicá el back end", "Entendé Node.js", "Construí el programa", "Versioná y verificá"]);
  assert.equal(preparation.type, "callout");
  assert.equal(section.blocks.some((block) => block.type === "checklist"), false);
});
