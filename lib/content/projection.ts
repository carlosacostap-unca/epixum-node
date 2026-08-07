import type { ContentBlock } from "./domain.ts";
import { buildContentRequirements } from "./revisions.ts";

export type PublicContentBlock =
  | Exclude<ContentBlock, { type: "question" | "validator" }>
  | Omit<Extract<ContentBlock, { type: "question" }>, "correctOptionKeys">
  | Omit<Extract<ContentBlock, { type: "validator" }>, "rule">;

export interface PublicContentRevision {
  revisionId: string;
  revisionNumber: number;
  requirementsRevision: string;
  blocks: PublicContentBlock[];
  activities: Array<{ activityKey: string; blockKey: string; kind: "question" | "checklist" | "validator"; required: boolean; activityRevision: string }>;
}

export function toPublicContentRevision(input: { revisionId: string; revisionNumber: number; blocks: ContentBlock[] }): PublicContentRevision {
  const requirements = buildContentRequirements(input.blocks);
  return {
    revisionId: input.revisionId,
    revisionNumber: input.revisionNumber,
    requirementsRevision: requirements.requirementsRevision,
    blocks: input.blocks.map(toPublicBlock),
    activities: requirements.activities.map((activity) => ({ ...activity })),
  };
}

function toPublicBlock(block: ContentBlock): PublicContentBlock {
  if (block.type === "question") {
    const publicBlock = structuredClone(block) as Partial<typeof block>;
    delete publicBlock.correctOptionKeys;
    return publicBlock as Omit<typeof block, "correctOptionKeys">;
  }
  if (block.type === "validator") {
    const publicBlock = structuredClone(block) as Partial<typeof block>;
    delete publicBlock.rule;
    return publicBlock as Omit<typeof block, "rule">;
  }
  return structuredClone(block);
}
