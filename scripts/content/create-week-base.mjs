import { randomBytes } from "node:crypto";
import { createAdminClient, outputJson } from "../pocketbase/client.mjs";
import { assertPedagogicalOnly, summarizeTemplateSnapshot } from "../../lib/content/templates.ts";

const args = parseArgs(process.argv.slice(2));
if (!args.week || !args.author || !args.name) throw new Error("Indicá --week, --author y --name para identificar el origen, el administrador y la base.");
if (args.apply && args.confirmWeek !== args.week) throw new Error("Para aplicar, repetí el ID exacto con --confirm-week <weekId>.");

const pb = await createAdminClient();
const [week, author, sections, bases] = await Promise.all([
  pb.collection("weeks").getOne(args.week),
  pb.collection("users").getOne(args.author),
  pb.collection("content_sections").getFullList({ filter: pb.filter("week = {:week}", { week: args.week }), sort: "position" }),
  pb.collection("content_bases").getFullList({ filter: pb.filter("kind = 'week' && name = {:name}", { name: args.name }) }),
]);
if (author.role !== "admin") throw new Error("La primera versión base debe ser creada por un usuario administrador.");
if (!sections.length) throw new Error("La semana no tiene secciones para promover como base.");
if (sections.some((section) => !section.currentRevision)) throw new Error("Todas las secciones deben tener una revisión vigente antes de promover la semana.");

const revisions = await Promise.all(sections.map((section) => pb.collection("content_section_revisions").getOne(section.currentRevision)));
const revisionsById = new Map(revisions.map((revision) => [revision.id, revision]));
const snapshot = assertPedagogicalOnly({
  schemaVersion: 1,
  kind: "week",
  week: {
    number: week.number,
    title: week.title,
    description: week.description ?? "",
    sections: sections.map((section) => ({
      position: section.position,
      title: section.title,
      summary: section.summary ?? "",
      ...(section.sourceKey ? { sourceKey: section.sourceKey } : {}),
      blocks: revisionsById.get(section.currentRevision).blocks,
    })),
  },
});
const summary = summarizeTemplateSnapshot(snapshot);

let existingVersion = null;
if (bases.length) {
  const versions = await pb.collection("content_base_versions").getFullList({ filter: pb.filter("base = {:base}", { base: bases[0].id }), sort: "-versionNumber" });
  existingVersion = versions.find((version) => version.sourceKind === "import" && version.sourceReference === week.id) ?? null;
  if (!existingVersion) throw new Error("Ya existe una base con ese nombre, pero no corresponde a esta importación. Elegí otro nombre o promovela desde el panel.");
}

if (!args.apply || existingVersion) {
  outputJson({
    mode: "dry-run",
    action: existingVersion ? "skip_existing" : "create_base",
    source: { week: { id: week.id, number: week.number, title: week.title }, author: { id: author.id } },
    base: { name: args.name, kind: "week", description: args.description ?? "Base inicial validada de la Semana 1." },
    summary,
    sections: snapshot.week.sections.map((section) => ({ position: section.position, title: section.title, blocks: section.blocks.length })),
    ...(existingVersion ? { existing: { baseId: bases[0].id, versionId: existingVersion.id, versionNumber: existingVersion.versionNumber } } : {}),
  });
} else {
  const baseId = pocketBaseId();
  const versionId = pocketBaseId();
  let baseCreated = false;
  let versionCreated = false;
  try {
    await pb.collection("content_bases").create({ id: baseId, name: args.name, kind: "week", description: args.description ?? "Base inicial validada de la Semana 1.", active: true, createdBy: author.id });
    baseCreated = true;
    await pb.collection("content_base_versions").create({ id: versionId, base: baseId, versionNumber: 1, snapshot, sourceKind: "import", sourceReference: week.id, note: "Primera versión desde la importación validada de Semana 1.", createdBy: author.id });
    versionCreated = true;
    await pb.collection("content_bases").update(baseId, { currentVersion: versionId });
    outputJson({ mode: "apply", created: { baseId, versionId, versionNumber: 1 }, summary });
  } catch (error) {
    if (versionCreated) await pb.collection("content_base_versions").delete(versionId).catch(() => undefined);
    if (baseCreated) await pb.collection("content_bases").delete(baseId).catch(() => undefined);
    throw error;
  }
}

function parseArgs(values) {
  const result = { apply: false };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === "--apply") result.apply = true;
    else if (value === "--week") result.week = values[++index];
    else if (value === "--author") result.author = values[++index];
    else if (value === "--name") result.name = values[++index];
    else if (value === "--description") result.description = values[++index];
    else if (value === "--confirm-week") result.confirmWeek = values[++index];
    else throw new Error(`Argumento desconocido: ${value}`);
  }
  return result;
}

function pocketBaseId() {
  return randomBytes(10).toString("hex").slice(0, 15);
}
