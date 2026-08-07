import { z } from "zod";
import type { ContentAssetKind, ContentBlock, ContentSectionStatus } from "./domain.ts";
import { contentAssetKindSchema, contentBlocksSchema, contentKeySchema, httpsUrlSchema, normalizeUtcIso } from "./domain.ts";
import { buildContentRequirements } from "./revisions.ts";

export const contentSectionCreateSchema = z.object({
  title: z.string().trim().min(1).max(500),
  summary: z.string().trim().max(5_000).default(""),
  sourceKey: contentKeySchema.optional(),
});

export const contentSectionMetadataSchema = contentSectionCreateSchema.pick({ title: true, summary: true });

export const contentSectionStateSchema = z.object({
  status: z.enum(["draft", "scheduled", "published", "hidden"]),
  scheduledAt: z.string().datetime({ offset: true }).optional().nullable(),
});

export const externalAssetSchema = z.object({
  kind: contentAssetKindSchema,
  externalUrl: httpsUrlSchema,
  alt: z.string().trim().max(500).default(""),
  title: z.string().trim().max(500).default(""),
}).superRefine((value, context) => addAccessibleMediaIssues(value, context));

export interface RevisionCommitPlan {
  revision: {
    id: string;
    section: string;
    revisionNumber: number;
    blocks: ContentBlock[];
    activityManifest: ReturnType<typeof buildContentRequirements>["activities"];
    requirementsRevision: string;
    note: string;
    author: string;
  };
  sectionPatch: { currentRevision: string };
}

export function createEmptySectionBlocks(): ContentBlock[] {
  return contentBlocksSchema.parse([{
    key: "intro_content",
    type: "rich_text",
    content: { type: "doc", content: [{ type: "paragraph", content: [] }] },
  }]);
}

export function buildRevisionCommitPlan(input: {
  id: string;
  sectionId: string;
  revisionNumber: number;
  blocks: unknown;
  note?: string;
  authorId: string;
}): RevisionCommitPlan {
  const blocks = contentBlocksSchema.parse(input.blocks);
  const requirements = buildContentRequirements(blocks);
  return {
    revision: {
      id: input.id,
      section: input.sectionId,
      revisionNumber: input.revisionNumber,
      blocks,
      activityManifest: requirements.activities,
      requirementsRevision: requirements.requirementsRevision,
      note: input.note?.trim().slice(0, 1_000) ?? "",
      author: input.authorId,
    },
    sectionPatch: { currentRevision: input.id },
  };
}

export function assertExpectedRevision(currentRevision: string | undefined, expectedRevision: string | undefined) {
  if (!currentRevision || !expectedRevision || currentRevision !== expectedRevision) {
    throw new Error("La sección cambió mientras la editabas. Recargá la revisión antes de volver a guardar.");
  }
}

export function validateSectionOrder(sectionIds: string[], orderedIds: string[]): string[] {
  if (orderedIds.length !== sectionIds.length || new Set(orderedIds).size !== orderedIds.length) {
    throw new Error("El nuevo orden debe incluir cada sección exactamente una vez.");
  }
  const expected = new Set(sectionIds);
  if (orderedIds.some((id) => !expected.has(id))) throw new Error("El nuevo orden contiene una sección ajena a la semana.");
  return [...orderedIds];
}

export function sectionPositionMap(orderedIds: string[]): Map<string, number> {
  return new Map(orderedIds.map((id, index) => [id, index + 1]));
}

export function publicationPatch(input: unknown, now = new Date()): {
  status: ContentSectionStatus;
  scheduledAt: string | null;
  publishedAt?: string;
} {
  const value = contentSectionStateSchema.parse(input);
  if (value.status === "scheduled") {
    if (!value.scheduledAt) throw new Error("Una sección programada requiere fecha y hora.");
    const scheduledAt = normalizeUtcIso(value.scheduledAt);
    if (new Date(scheduledAt).getTime() <= now.getTime()) throw new Error("La fecha programada debe ser futura.");
    return { status: "scheduled", scheduledAt };
  }
  if (value.status === "published") return { status: "published", scheduledAt: null, publishedAt: now.toISOString() };
  return { status: value.status, scheduledAt: null };
}

const assetPolicy = {
  image: { maxBytes: 10 * 1024 * 1024, mimeTypes: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]) },
  video: { maxBytes: 100 * 1024 * 1024, mimeTypes: new Set(["video/mp4", "video/webm"]) },
} as const;

export function validateUploadedAsset(input: { kind: ContentAssetKind; name: string; type: string; size: number; alt?: string; title?: string }) {
  const kind = contentAssetKindSchema.parse(input.kind);
  const policy = assetPolicy[kind];
  if (!input.name.trim()) throw new Error("El archivo necesita un nombre.");
  if (!(policy.mimeTypes as ReadonlySet<string>).has(input.type)) throw new Error(`El formato ${input.type || "desconocido"} no está permitido para ${kind === "image" ? "imágenes" : "videos"}.`);
  if (input.size <= 0 || input.size > policy.maxBytes) throw new Error(`El archivo supera el límite de ${policy.maxBytes / 1024 / 1024} MB.`);
  const metadata = { kind, alt: input.alt?.trim() ?? "", title: input.title?.trim() ?? "" };
  const parsed = z.object({ kind: contentAssetKindSchema, alt: z.string().max(500), title: z.string().max(500) }).superRefine(addAccessibleMediaIssues).parse(metadata);
  return { ...parsed, mimeType: input.type, size: input.size };
}

export function canAuthorContent(role: string | undefined): boolean {
  return role === "admin" || role === "docente";
}

function addAccessibleMediaIssues(value: { kind: ContentAssetKind; alt: string; title: string }, context: z.RefinementCtx) {
  if (value.kind === "image" && !value.alt) context.addIssue({ code: "custom", path: ["alt"], message: "Las imágenes requieren texto alternativo." });
  if (value.kind === "video" && !value.title) context.addIssue({ code: "custom", path: ["title"], message: "Los videos requieren un título accesible." });
}
