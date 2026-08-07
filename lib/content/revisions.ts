import type { ChecklistBlock, ContentBlock, QuestionBlock, ValidatorBlock } from "./domain.ts";

export type ActivityManifestKind = "question" | "checklist" | "validator";

export interface ActivityManifestEntry {
  activityKey: string;
  blockKey: string;
  kind: ActivityManifestKind;
  required: boolean;
  activityRevision: string;
}

export interface ContentRequirements {
  requirementsRevision: string;
  activities: ActivityManifestEntry[];
  terminalBlockKey: string | null;
}

export function buildContentRequirements(blocks: ContentBlock[]): ContentRequirements {
  const activities = blocks.flatMap((block): ActivityManifestEntry[] => {
    if (block.type !== "question" && block.type !== "checklist" && block.type !== "validator") return [];
    return [{
      activityKey: block.activityKey,
      blockKey: block.key,
      kind: block.type,
      required: block.required,
      activityRevision: fingerprint(activityDefinition(block)),
    }];
  });
  const required = activities.filter((activity) => activity.required);
  const terminalBlockKey = required.length === 0 ? blocks.at(-1)?.key ?? null : null;
  return {
    requirementsRevision: fingerprint({ required: required.map(({ activityKey, kind, activityRevision }) => ({ activityKey, kind, activityRevision })), terminalBlockKey }),
    activities,
    terminalBlockKey,
  };
}

export function contentRequirementsChanged(previous: ContentBlock[], next: ContentBlock[]): boolean {
  return buildContentRequirements(previous).requirementsRevision !== buildContentRequirements(next).requirementsRevision;
}

export function activityRevisionFor(block: QuestionBlock | ChecklistBlock | ValidatorBlock): string {
  return fingerprint(activityDefinition(block));
}

function activityDefinition(block: QuestionBlock | ChecklistBlock | ValidatorBlock) {
  if (block.type === "question") return {
    type: block.type,
    activityKey: block.activityKey,
    required: block.required,
    questionKind: block.questionKind,
    prompt: block.prompt,
    code: block.code ?? null,
    options: block.options.map(({ key, label, code }) => ({ key, label, code })),
    correctOptionKeys: [...block.correctOptionKeys].sort(),
  };
  if (block.type === "checklist") return {
    type: block.type,
    activityKey: block.activityKey,
    required: block.required,
    title: block.title,
    items: block.items.map(({ key, label }) => ({ key, label })),
  };
  return {
    type: block.type,
    activityKey: block.activityKey,
    required: block.required,
    label: block.label,
    rule: block.rule,
  };
}

export function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`).join(",")}}`;
}

export function fingerprint(value: unknown): string {
  const text = stableSerialize(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `r${(hash >>> 0).toString(36).padStart(7, "0")}`;
}
