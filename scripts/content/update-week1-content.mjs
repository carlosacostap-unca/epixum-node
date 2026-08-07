import { readFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { createAdminClient, outputJson, projectRoot } from "../pocketbase/client.mjs";
import { planWeek1Update, WEEK1_UPDATE_NOTE } from "./week1-update.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.cohort || !args.week || !args.author) throw new Error("Indicá --cohort, --week y --author para seleccionar explícitamente el destino y el usuario administrador autor.");
if (args.apply && args.confirmWeek !== args.week) throw new Error("Para aplicar, repetí el ID exacto con --confirm-week <weekId>.");

const manifest = JSON.parse(await readFile(path.join(projectRoot, "content", "week-01.manifest.json"), "utf8"));
const pb = await createAdminClient();
const [cohort, week, author, sections, assets] = await Promise.all([
  pb.collection("cohorts").getOne(args.cohort),
  pb.collection("weeks").getOne(args.week),
  pb.collection("users").getOne(args.author),
  pb.collection("content_sections").getFullList({ filter: pb.filter("week = {:week}", { week: args.week }), sort: "position" }),
  pb.collection("content_assets").getFullList({ filter: "importKey != ''" }),
]);
if (cohort.mode !== "weekly") throw new Error("El destino debe ser una cohorte de modalidad semanal.");
if (week.cohort !== cohort.id) throw new Error("La semana indicada no pertenece a la cohorte seleccionada.");
if (author.role !== "admin") throw new Error("El autor de la actualización debe tener rol administrador.");

const assetIds = new Map(assets.map((asset) => [asset.importKey, asset.id]));
const revisionsBySection = new Map();
const maxRevisionBySection = new Map();
for (const section of sections) {
  if (!section.currentRevision) throw new Error(`La sección ${section.sourceKey || section.id} no tiene revisión actual.`);
  const [current, latest] = await Promise.all([
    pb.collection("content_section_revisions").getOne(section.currentRevision),
    pb.collection("content_section_revisions").getFirstListItem(pb.filter("section = {:section}", { section: section.id }), { sort: "-revisionNumber" }),
  ]);
  revisionsBySection.set(section.id, current);
  maxRevisionBySection.set(section.id, latest.revisionNumber);
}

const completePlan = planWeek1Update(manifest, sections, revisionsBySection, maxRevisionBySection, assetIds);
const plan = args.sourceKey ? completePlan.filter((entry) => entry.sourceKey === args.sourceKey) : completePlan;
if (args.sourceKey && plan.length !== 1) throw new Error(`No existe una única sección con sourceKey ${args.sourceKey}.`);
if (args.sourceKey && plan[0].section.position !== plan[0].desired.position) throw new Error("Una actualización focalizada no puede cambiar la posición; ejecutá el plan semanal completo.");
const target = { cohort: { id: cohort.id, name: cohort.name }, week: { id: week.id, number: week.number, title: week.title }, author: { id: author.id, email: author.email } };
const preview = plan.map((entry) => ({ sourceKey: entry.sourceKey, sectionId: entry.section.id, fromPosition: entry.section.position, toPosition: entry.desired.position, fromRevision: entry.currentRevision.revisionNumber, toRevision: entry.contentChanged ? entry.nextRevisionNumber : entry.currentRevision.revisionNumber, title: entry.desired.title, blocks: entry.desired.blocks.length, statusPreserved: entry.section.status, action: entry.action }));

if (!args.apply) {
  outputJson({ mode: "dry-run", target, totals: summarize(plan), sections: preview, assets: { referenced: manifest.assets.length, resolved: manifest.assets.filter((asset) => assetIds.has(asset.key)).length }, publicationChanged: false });
  process.exit(0);
}

const original = plan.map((entry) => ({ id: entry.section.id, sourceKey: entry.sourceKey, position: entry.section.position, title: entry.section.title, summary: entry.section.summary || "", currentRevision: entry.section.currentRevision, status: entry.section.status }));
const createdRevisionIds = new Map();
try {
  for (const entry of plan.filter((item) => item.contentChanged)) {
    const revisionId = pocketBaseId();
    await pb.collection("content_section_revisions").create({ id: revisionId, section: entry.section.id, revisionNumber: entry.nextRevisionNumber, blocks: entry.desired.blocks, activityManifest: entry.desired.activityManifest, requirementsRevision: entry.desired.requirementsRevision, note: WEEK1_UPDATE_NOTE, author: author.id });
    createdRevisionIds.set(entry.section.id, revisionId);
  }
  if (plan.some((entry) => entry.section.position !== entry.desired.position)) await moveToTemporaryPositions(pb, plan.map((entry) => entry.section));
  for (const entry of plan) {
    const patch = { position: entry.desired.position, title: entry.desired.title, summary: entry.desired.summary };
    const revisionId = createdRevisionIds.get(entry.section.id);
    if (revisionId) patch.currentRevision = revisionId;
    await pb.collection("content_sections").update(entry.section.id, patch);
  }
} catch (error) {
  const rollbackSucceeded = await restoreOriginalSections(pb, original);
  if (rollbackSucceeded) for (const revisionId of createdRevisionIds.values()) await pb.collection("content_section_revisions").delete(revisionId).catch(() => undefined);
  throw new Error(`La actualización falló. Rollback automático: ${rollbackSucceeded ? "completado" : "incompleto; restaurá el backup"}. ${describeError(error)}`);
}

const verified = [];
for (const entry of plan) {
  const section = await pb.collection("content_sections").getOne(entry.section.id);
  const revision = await pb.collection("content_section_revisions").getOne(section.currentRevision);
  verified.push({ sourceKey: entry.sourceKey, sectionId: section.id, position: section.position, revisionId: revision.id, revisionNumber: revision.revisionNumber, requirementsRevision: revision.requirementsRevision, status: section.status, blocks: revision.blocks.length });
}
outputJson({ mode: "apply", target, totals: summarize(plan), verified, publicationChanged: false, rollback: original.map((entry) => ({ sourceKey: entry.sourceKey, sectionId: entry.id, previousRevisionId: entry.currentRevision, previousPosition: entry.position, previousTitle: entry.title, previousSummary: entry.summary, statusToPreserve: entry.status })) });

function parseArgs(values) { const result = { apply: false }; for (let index = 0; index < values.length; index += 1) { const value = values[index]; if (value === "--apply") result.apply = true; else if (value === "--cohort") result.cohort = values[++index]; else if (value === "--week") result.week = values[++index]; else if (value === "--author") result.author = values[++index]; else if (value === "--source-key") result.sourceKey = values[++index]; else if (value === "--confirm-week") result.confirmWeek = values[++index]; else throw new Error(`Argumento desconocido: ${value}`); } return result; }
function summarize(plan) { return { createRevisions: plan.filter((entry) => entry.contentChanged).length, updateMetadataOnly: plan.filter((entry) => !entry.contentChanged && entry.metadataChanged).length, skipUnchanged: plan.filter((entry) => entry.action === "skip_unchanged").length }; }
async function moveToTemporaryPositions(pb, sections) { const offset = Math.max(...sections.map((section) => section.position)) + sections.length + 100; for (const [index, section] of sections.entries()) await pb.collection("content_sections").update(section.id, { position: offset + index }); }
async function restoreOriginalSections(pb, original) { try { await moveToTemporaryPositions(pb, original); for (const section of [...original].sort((a, b) => a.position - b.position)) await pb.collection("content_sections").update(section.id, { position: section.position, title: section.title, summary: section.summary, currentRevision: section.currentRevision }); return true; } catch { return false; } }
function pocketBaseId() { return randomBytes(10).toString("hex").slice(0, 15); }
function describeError(error) { const message = error instanceof Error ? error.message : String(error); const details = error && typeof error === "object" && "response" in error ? error.response?.data : null; return details ? `${message} ${JSON.stringify(details)}` : message; }
