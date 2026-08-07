import { readFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { createAdminClient, outputJson, projectRoot } from "../pocketbase/client.mjs";
import { planWeek1Import, resolveManifestAssetReferences } from "./week1-import.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.cohort || !args.week || !args.author) throw new Error("Indicá --cohort, --week y --author para seleccionar explícitamente el destino y el usuario administrador autor.");
if (args.apply && args.confirmWeek !== args.week) throw new Error("Para aplicar, repetí el ID exacto con --confirm-week <weekId>.");
const manifest = JSON.parse(await readFile(path.join(projectRoot, "content", "week-01.manifest.json"), "utf8"));
const pb = await createAdminClient();
const [cohort, week, author, existingSections, existingAssets] = await Promise.all([
  pb.collection("cohorts").getOne(args.cohort), pb.collection("weeks").getOne(args.week), pb.collection("users").getOne(args.author),
  pb.collection("content_sections").getFullList({ filter: pb.filter("week = {:week}", { week: args.week }), sort: "position" }),
  pb.collection("content_assets").getFullList({ filter: "importKey != ''" }),
]);
if (cohort.mode !== "weekly") throw new Error("El destino debe ser una cohorte de modalidad semanal.");
if (week.cohort !== cohort.id) throw new Error("La semana indicada no pertenece a la cohorte seleccionada.");
if (author.role !== "admin") throw new Error("El autor de la importación debe tener rol administrador.");
const plan = planWeek1Import(manifest, existingSections, existingAssets);
if (!args.apply) {
  outputJson({ mode: "dry-run", target: { cohort: { id: cohort.id, name: cohort.name }, week: { id: week.id, number: week.number, title: week.title }, author: { id: author.id, email: author.email } }, create: { sections: plan.sections.map((section) => ({ sourceKey: section.sourceKey, position: section.position, title: section.title, blocks: section.blocks.length })), assets: plan.assets.map((asset) => ({ key: asset.key, sourcePath: asset.sourcePath })) }, skip: { sections: plan.skippedSections, assets: plan.skippedAssets }, publicationStatus: "draft" });
} else {
  const assetIds = new Map(existingAssets.map((asset) => [asset.importKey, asset.id]));
  for (const asset of plan.assets) {
    const bytes = await readFile(path.join(projectRoot, asset.sourcePath));
    const filename = path.basename(asset.sourcePath);
    const file = new File([bytes], filename, { type: mimeType(filename) });
    const created = await pb.collection("content_assets").create({ kind: asset.kind, file, alt: asset.alt, title: asset.title, importKey: asset.key, author: author.id });
    assetIds.set(asset.key, created.id);
  }
  for (const asset of existingAssets) if (asset.importKey) assetIds.set(asset.importKey, asset.id);
  let position = existingSections.reduce((maximum, section) => Math.max(maximum, section.position || 0), 0);
  const createdSectionIds = [];
  for (const section of plan.sections) {
    position += 1;
    const sectionId = pocketBaseId(); const revisionId = pocketBaseId();
    const blocks = resolveManifestAssetReferences(section.blocks, assetIds);
    const requirements = buildRequirements(blocks);
    let sectionCreated = false;
    let revisionCreated = false;
    try {
      await pb.collection("content_sections").create({ id: sectionId, cohort: cohort.id, week: week.id, position, title: section.title, summary: section.summary, status: "draft", scheduledAt: null, publishedAt: null, sourceKey: section.sourceKey });
      sectionCreated = true;
      await pb.collection("content_section_revisions").create({ id: revisionId, section: sectionId, revisionNumber: 1, blocks, activityManifest: requirements.activities, requirementsRevision: requirements.requirementsRevision, note: `Importación desde ${section.sourceFolder}`, author: author.id });
      revisionCreated = true;
      await pb.collection("content_sections").update(sectionId, { currentRevision: revisionId });
      createdSectionIds.push(sectionId);
    } catch (error) {
      if (revisionCreated) await pb.collection("content_section_revisions").delete(revisionId).catch(() => undefined);
      if (sectionCreated) await pb.collection("content_sections").delete(sectionId).catch(() => undefined);
      throw error;
    }
  }
  outputJson({ mode: "apply", target: { cohort: cohort.id, week: week.id }, created: { sections: createdSectionIds.length, sectionIds: createdSectionIds, assets: plan.assets.length }, skipped: { sections: plan.skippedSections, assets: plan.skippedAssets }, publicationStatus: "draft" });
}

function parseArgs(values) { const result = { apply: false }; for (let index = 0; index < values.length; index += 1) { const value = values[index]; if (value === "--apply") result.apply = true; else if (value === "--cohort") result.cohort = values[++index]; else if (value === "--week") result.week = values[++index]; else if (value === "--author") result.author = values[++index]; else if (value === "--confirm-week") result.confirmWeek = values[++index]; else throw new Error(`Argumento desconocido: ${value}`); } return result; }
function pocketBaseId() { return randomBytes(10).toString("hex").slice(0, 15); }
function mimeType(filename) { const extension = path.extname(filename).toLowerCase(); return ({ ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".mp4": "video/mp4", ".webm": "video/webm" })[extension] || "application/octet-stream"; }
function buildRequirements(blocks) { const activities = blocks.flatMap((block) => block.type === "question" || block.type === "checklist" || block.type === "validator" ? [{ activityKey: block.activityKey, blockKey: block.key, kind: block.type, required: block.required, activityRevision: fingerprint(activityDefinition(block)) }] : []); const required = activities.filter((activity) => activity.required); const terminalBlockKey = required.length ? null : blocks.at(-1)?.key ?? null; return { activities, requirementsRevision: fingerprint({ required: required.map(({ activityKey, kind, activityRevision }) => ({ activityKey, kind, activityRevision })), terminalBlockKey }) }; }
function activityDefinition(block) { if (block.type === "question") return { type: block.type, activityKey: block.activityKey, required: block.required, questionKind: block.questionKind, prompt: block.prompt, code: block.code ?? null, options: block.options.map(({ key, label, code }) => ({ key, label, code })), correctOptionKeys: [...block.correctOptionKeys].sort() }; if (block.type === "checklist") return { type: block.type, activityKey: block.activityKey, required: block.required, title: block.title, items: block.items.map(({ key, label }) => ({ key, label })) }; return { type: block.type, activityKey: block.activityKey, required: block.required, label: block.label, rule: block.rule }; }
function stableSerialize(value) { if (value === null || typeof value !== "object") return JSON.stringify(value); if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`; return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(",")}}`; }
function fingerprint(value) { const text = stableSerialize(value); let hash = 0x811c9dc5; for (let index = 0; index < text.length; index += 1) { hash ^= text.charCodeAt(index); hash = Math.imul(hash, 0x01000193); } return `r${(hash >>> 0).toString(36).padStart(7, "0")}`; }
