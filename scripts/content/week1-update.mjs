import { resolveManifestAssetReferences } from "./week1-import.mjs";

export const WEEK1_UPDATE_NOTE = "Actualización pedagógica Semana 1";

export function planWeek1Update(manifest, sections, revisionsBySection, maxRevisionBySection, assetIds) {
  const expectedKeys = new Set(manifest.sections.map((section) => section.sourceKey));
  const actualKeys = new Set(sections.map((section) => section.sourceKey).filter(Boolean));
  const missing = [...expectedKeys].filter((key) => !actualKeys.has(key));
  const unexpected = sections.filter((section) => !expectedKeys.has(section.sourceKey)).map((section) => section.sourceKey || `(sin sourceKey: ${section.id})`);
  if (missing.length || unexpected.length || sections.length !== manifest.sections.length) {
    throw new Error(`La semana no coincide exactamente con el manifiesto. Faltan: ${missing.join(", ") || "ninguna"}. Sobran: ${unexpected.join(", ") || "ninguna"}.`);
  }

  const sectionByKey = new Map(sections.map((section) => [section.sourceKey, section]));
  return manifest.sections.map((desired) => {
    const section = sectionByKey.get(desired.sourceKey);
    const currentRevision = revisionsBySection.get(section.id);
    if (!currentRevision) throw new Error(`La sección ${desired.sourceKey} no tiene una revisión actual.`);
    const blocks = resolveManifestAssetReferences(desired.blocks, assetIds);
    const requirements = buildRequirements(blocks);
    const contentChanged = stableSerialize(currentRevision.blocks) !== stableSerialize(blocks);
    const metadataChanged = section.title !== desired.title || (section.summary || "") !== (desired.summary || "") || section.position !== desired.position;
    return {
      sourceKey: desired.sourceKey,
      sourceFolder: desired.sourceFolder,
      section,
      currentRevision,
      previousRevisionId: currentRevision.id,
      nextRevisionNumber: (maxRevisionBySection.get(section.id) || currentRevision.revisionNumber) + 1,
      desired: { position: desired.position, title: desired.title, summary: desired.summary || "", blocks, ...requirements },
      contentChanged,
      metadataChanged,
      action: contentChanged ? "create_revision" : metadataChanged ? "update_metadata" : "skip_unchanged",
    };
  });
}

export function buildRequirements(blocks) {
  const activities = blocks.flatMap((block) =>
    block.type === "question" || block.type === "checklist" || block.type === "validator"
      ? [{ activityKey: block.activityKey, blockKey: block.key, kind: block.type, required: block.required, activityRevision: fingerprint(activityDefinition(block)) }]
      : [],
  );
  const required = activities.filter((activity) => activity.required);
  const terminalBlockKey = required.length ? null : blocks.at(-1)?.key ?? null;
  return {
    activityManifest: activities,
    requirementsRevision: fingerprint({ required: required.map(({ activityKey, kind, activityRevision }) => ({ activityKey, kind, activityRevision })), terminalBlockKey }),
  };
}

function activityDefinition(block) {
  if (block.type === "question") return { type: block.type, activityKey: block.activityKey, required: block.required, questionKind: block.questionKind, prompt: block.prompt, code: block.code ?? null, options: block.options.map(({ key, label, code }) => ({ key, label, code })), correctOptionKeys: [...block.correctOptionKeys].sort() };
  if (block.type === "checklist") return { type: block.type, activityKey: block.activityKey, required: block.required, title: block.title, items: block.items.map(({ key, label }) => ({ key, label })) };
  return { type: block.type, activityKey: block.activityKey, required: block.required, label: block.label, rule: block.rule };
}

export function stableSerialize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(",")}}`;
}

function fingerprint(value) {
  const text = stableSerialize(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `r${(hash >>> 0).toString(36).padStart(7, "0")}`;
}
