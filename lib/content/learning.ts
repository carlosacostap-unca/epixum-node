import { z } from "zod";
import type { ActivityManifestEntry, ContentRequirements } from "./revisions.ts";
import type { ChecklistBlock, QuestionBlock, ValidatorBlock } from "./domain.ts";
import { activityRevisionFor } from "./revisions.ts";

export const attemptKeySchema = z.string().trim().regex(/^[a-zA-Z0-9_-]{16,100}$/);
export const activitySubmissionSchema = z.object({
  revisionId: z.string().trim().min(1).max(64),
  activityKey: z.string().trim().min(3).max(80),
  attemptKey: attemptKeySchema,
  response: z.unknown(),
});

export type GradableBlock = QuestionBlock | ChecklistBlock | ValidatorBlock;
export type ActivityOutcome = "correct" | "incorrect" | "satisfied" | "pending";

export function gradeActivity(block: GradableBlock, response: unknown): { outcome: ActivityOutcome; mastered: boolean; normalizedResponse: unknown } {
  if (block.type === "question") {
    const selectedOptionKeys = z.object({ selectedOptionKeys: z.array(z.string()).max(12) }).parse(response).selectedOptionKeys;
    const allowed = new Set(block.options.map((option) => option.key));
    if (new Set(selectedOptionKeys).size !== selectedOptionKeys.length || selectedOptionKeys.some((key) => !allowed.has(key))) throw new Error("La respuesta contiene opciones no válidas.");
    if (block.questionKind !== "multiple" && selectedOptionKeys.length !== 1) throw new Error("La pregunta requiere exactamente una opción.");
    const selected = [...selectedOptionKeys].sort();
    const correct = [...block.correctOptionKeys].sort();
    const mastered = selected.length === correct.length && selected.every((key, index) => key === correct[index]);
    return { outcome: mastered ? "correct" : "incorrect", mastered, normalizedResponse: { selectedOptionKeys: selected } };
  }
  if (block.type === "checklist") {
    const checkedItemKeys = z.object({ checkedItemKeys: z.array(z.string()).max(100) }).parse(response).checkedItemKeys;
    const allowed = new Set(block.items.map((item) => item.key));
    if (new Set(checkedItemKeys).size !== checkedItemKeys.length || checkedItemKeys.some((key) => !allowed.has(key))) throw new Error("La auto-comprobación contiene puntos no válidos.");
    const mastered = block.items.every((item) => checkedItemKeys.includes(item.key));
    return { outcome: mastered ? "satisfied" : "pending", mastered, normalizedResponse: { checkedItemKeys: [...checkedItemKeys].sort() } };
  }
  const value = z.object({ value: z.string().trim().max(2_000) }).parse(response).value;
  const mastered = validateDeclarativeValue(block, value);
  return { outcome: mastered ? "correct" : "incorrect", mastered, normalizedResponse: { value } };
}

export function validateDeclarativeValue(block: ValidatorBlock, value: string): boolean {
  switch (block.rule.kind) {
    case "semantic_version": return /^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value);
    case "git_version": return /^git version \d+\.\d+(?:\.\d+)?(?:\.[A-Za-z0-9.-]+)?$/.test(value);
    case "github_username": return /^(?!-)(?!.*--)[A-Za-z0-9-]{1,39}(?<!-)$/.test(value);
    case "github_repository_url": {
      try { const url = new URL(value); const parts = url.pathname.split("/").filter(Boolean); return url.protocol === "https:" && url.hostname.toLowerCase() === "github.com" && parts.length === 2 && (!block.rule.repositoryName || parts[1].replace(/\.git$/, "") === block.rule.repositoryName); } catch { return false; }
    }
    case "text_pattern": return new RegExp(block.rule.pattern, block.rule.flags).test(value);
  }
}

export interface MasteryEvidence {
  activityKey: string;
  activityRevision: string;
  outcome: ActivityOutcome;
}

export function calculateRequirementProgress(requirements: ContentRequirements, evidence: MasteryEvidence[], reachedTerminalBlock: boolean) {
  const masteredActivities: Record<string, string> = {};
  for (const item of evidence) if (item.outcome === "correct" || item.outcome === "satisfied") masteredActivities[item.activityKey] = item.activityRevision;
  const required = requirements.activities.filter((activity) => activity.required);
  const completed = required.length
    ? required.every((activity) => masteredActivities[activity.activityKey] === activity.activityRevision)
    : Boolean(requirements.terminalBlockKey && reachedTerminalBlock);
  return { masteredActivities, completed };
}

export function activityManifestEntry(block: GradableBlock): ActivityManifestEntry {
  return { activityKey: block.activityKey, blockKey: block.key, kind: block.type, required: block.required, activityRevision: activityRevisionFor(block) };
}

export function monotonicBlockProgress(blockKeys: string[], previousIndex: number | undefined, blockKey: string) {
  const index = blockKeys.indexOf(blockKey);
  if (index < 0) throw new Error("El bloque no pertenece a la revisión indicada.");
  return Math.max(previousIndex ?? -1, index);
}
