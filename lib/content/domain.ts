import { z } from "zod";

export const contentSectionStatuses = ["draft", "scheduled", "published", "hidden"] as const;
export const contentBaseKinds = ["course", "week", "section"] as const;
export const contentAssetKinds = ["image", "video"] as const;
export const questionKinds = ["single", "multiple", "boolean"] as const;
export const validatorKinds = ["semantic_version", "git_version", "github_username", "github_repository_url", "text_pattern"] as const;

export const contentSectionStatusSchema = z.enum(contentSectionStatuses);
export const contentBaseKindSchema = z.enum(contentBaseKinds);
export const contentAssetKindSchema = z.enum(contentAssetKinds);
export const questionKindSchema = z.enum(questionKinds);
export const validatorKindSchema = z.enum(validatorKinds);

export const contentKeySchema = z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9_-]{2,79}$/, "La clave debe usar letras minúsculas, números, guiones o guiones bajos.");
export const pocketBaseIdSchema = z.string().trim().min(1).max(64);

const plainText = (max = 10_000) => z.string().trim().min(1).max(max);
const optionalText = (max = 10_000) => z.string().trim().max(max).optional();

export const httpsUrlSchema = z.string().trim().url().refine((value) => new URL(value).protocol === "https:", "La URL debe usar HTTPS.");
export const safeLinkUrlSchema = z.string().trim().max(2_048).refine((value) => {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "mailto:";
  } catch {
    return false;
  }
}, "El enlace debe usar HTTPS o mailto.");

export type RichTextMark =
  | { type: "bold" | "italic" | "strike" | "code" }
  | { type: "link"; attrs: { href: string } };

export interface RichTextNode {
  type: "doc" | "paragraph" | "text" | "heading" | "bulletList" | "orderedList" | "listItem" | "blockquote" | "hardBreak" | "horizontalRule";
  text?: string;
  attrs?: { level?: 2 | 3 | 4 };
  marks?: RichTextMark[];
  content?: RichTextNode[];
}

export type RichTextDocument = RichTextNode & { type: "doc" };

export const richTextDocumentSchema = z.unknown().transform((value, context): RichTextDocument => {
  try {
    return normalizeRichTextDocument(value);
  } catch (error) {
    context.addIssue({ code: "custom", message: error instanceof Error ? error.message : "El contenido enriquecido no es válido." });
    return z.NEVER;
  }
});

const blockBaseSchema = z.object({
  key: contentKeySchema,
});

export const richTextBlockSchema = blockBaseSchema.extend({
  type: z.literal("rich_text"),
  content: richTextDocumentSchema,
});

export const calloutBlockSchema = blockBaseSchema.extend({
  type: z.literal("callout"),
  eyebrow: optionalText(160),
  title: plainText(500),
  body: richTextDocumentSchema,
  tone: z.enum(["info", "success", "warning", "danger", "neutral"]).default("info"),
});

const editorialItemSchema = z.object({
  key: contentKeySchema,
  eyebrow: optionalText(160),
  title: plainText(500),
  body: plainText(5_000),
});

export const cardsBlockSchema = blockBaseSchema.extend({
  type: z.literal("cards"),
  title: optionalText(500),
  columns: z.coerce.number().int().min(1).max(3).default(2),
  items: z.array(editorialItemSchema).min(1).max(24),
}).superRefine((value, context) => addDuplicateIssues(value.items.map((item) => item.key), context, "Las tarjetas deben tener claves únicas."));

export const stepsBlockSchema = blockBaseSchema.extend({
  type: z.literal("steps"),
  title: optionalText(500),
  items: z.array(editorialItemSchema.omit({ eyebrow: true })).min(1).max(40),
}).superRefine((value, context) => addDuplicateIssues(value.items.map((item) => item.key), context, "Los pasos deben tener claves únicas."));

const mediaSourceSchema = z.object({
  assetId: pocketBaseIdSchema.optional(),
  externalUrl: httpsUrlSchema.optional(),
}).superRefine((value, context) => {
  if (Boolean(value.assetId) === Boolean(value.externalUrl)) context.addIssue({ code: "custom", message: "El medio debe usar exactamente un archivo subido o una URL externa." });
});

export const imageBlockSchema = blockBaseSchema.extend({
  type: z.literal("image"),
  source: mediaSourceSchema,
  alt: plainText(500),
  caption: optionalText(1_000),
});

export const videoBlockSchema = blockBaseSchema.extend({
  type: z.literal("video"),
  source: mediaSourceSchema,
  title: plainText(500),
  caption: optionalText(1_000),
  posterAssetId: pocketBaseIdSchema.optional(),
});

export const codeBlockSchema = blockBaseSchema.extend({
  type: z.literal("code"),
  title: optionalText(500),
  language: z.string().trim().toLowerCase().regex(/^[a-z0-9_+#.-]{1,40}$/).default("text"),
  code: z.string().min(1).max(100_000),
});

const terminalRowSchema = z.object({
  key: contentKeySchema,
  kind: z.enum(["prompt", "command", "response"]),
  label: plainText(160),
  value: z.string().trim().min(1).max(10_000),
});

export const terminalBlockSchema = blockBaseSchema.extend({
  type: z.literal("terminal"),
  title: optionalText(500),
  rows: z.array(terminalRowSchema).min(2).max(30),
}).superRefine((value, context) => addDuplicateIssues(value.rows.map((row) => row.key), context, "Las filas de terminal deben tener claves únicas."));

const commandReferenceItemSchema = z.object({
  key: contentKeySchema,
  command: z.string().trim().min(1).max(1_000),
  purpose: plainText(2_000),
  tryIt: plainText(2_000),
});

export const commandReferenceBlockSchema = blockBaseSchema.extend({
  type: z.literal("command_reference"),
  title: optionalText(500),
  items: z.array(commandReferenceItemSchema).min(1).max(30),
}).superRefine((value, context) => addDuplicateIssues(value.items.map((item) => item.key), context, "Los comandos deben tener claves únicas."));

export const linkBlockSchema = blockBaseSchema.extend({
  type: z.literal("link"),
  label: plainText(300),
  url: safeLinkUrlSchema,
  variant: z.enum(["primary", "secondary", "text"]).default("primary"),
  newTab: z.boolean().default(false),
});

export const embedBlockSchema = blockBaseSchema.extend({
  type: z.literal("embed"),
  provider: z.enum(["youtube", "vimeo"]),
  url: httpsUrlSchema,
  title: plainText(500),
}).superRefine((value, context) => {
  try { normalizeEmbedUrl(value.provider, value.url); }
  catch (error) { context.addIssue({ code: "custom", path: ["url"], message: error instanceof Error ? error.message : "La URL embebida no es válida." }); }
});

export const glossaryBlockSchema = blockBaseSchema.extend({
  type: z.literal("glossary"),
  title: optionalText(500),
  items: z.array(z.object({ key: contentKeySchema, term: plainText(300), definition: plainText(5_000) })).min(1).max(100),
}).superRefine((value, context) => addDuplicateIssues(value.items.map((item) => item.key), context, "Los términos deben tener claves únicas."));

export const activityOptionSchema = z.object({
  key: contentKeySchema,
  label: plainText(2_000),
  code: z.boolean().default(false),
});

export const questionBlockSchema = blockBaseSchema.extend({
  type: z.literal("question"),
  activityKey: contentKeySchema,
  required: z.boolean().default(true),
  questionKind: questionKindSchema,
  prompt: plainText(5_000),
  code: z.string().max(20_000).optional(),
  options: z.array(activityOptionSchema).min(2).max(12),
  correctOptionKeys: z.array(contentKeySchema).min(1).max(12),
}).superRefine((value, context) => {
  const optionKeys = value.options.map((option) => option.key);
  addDuplicateIssues(optionKeys, context, "Las opciones deben tener claves únicas.");
  addDuplicateIssues(value.correctOptionKeys, context, "Las respuestas correctas no pueden repetirse.");
  if (value.correctOptionKeys.some((key) => !optionKeys.includes(key))) context.addIssue({ code: "custom", path: ["correctOptionKeys"], message: "Cada respuesta correcta debe pertenecer a las opciones." });
  if (value.questionKind !== "multiple" && value.correctOptionKeys.length !== 1) context.addIssue({ code: "custom", path: ["correctOptionKeys"], message: "La pregunta admite exactamente una respuesta correcta." });
  if (value.questionKind === "boolean" && value.options.length !== 2) context.addIssue({ code: "custom", path: ["options"], message: "Verdadero o falso requiere exactamente dos opciones." });
});

export const checklistBlockSchema = blockBaseSchema.extend({
  type: z.literal("checklist"),
  activityKey: contentKeySchema,
  required: z.boolean().default(true),
  title: plainText(500),
  description: optionalText(2_000),
  items: z.array(z.object({ key: contentKeySchema, label: plainText(2_000) })).min(1).max(100),
}).superRefine((value, context) => addDuplicateIssues(value.items.map((item) => item.key), context, "Los puntos de la lista deben tener claves únicas."));

const validatorRuleSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("semantic_version") }),
  z.object({ kind: z.literal("git_version") }),
  z.object({ kind: z.literal("github_username") }),
  z.object({ kind: z.literal("github_repository_url"), repositoryName: plainText(200).optional() }),
  z.object({ kind: z.literal("text_pattern"), pattern: z.string().trim().min(1).max(200), flags: z.enum(["", "i"]).default("") }),
]);

export const validatorBlockSchema = blockBaseSchema.extend({
  type: z.literal("validator"),
  activityKey: contentKeySchema,
  required: z.boolean().default(true),
  label: plainText(500),
  placeholder: optionalText(500),
  helpText: optionalText(2_000),
  successMessage: optionalText(1_000),
  presentation: z.enum(["github_profile"]).optional(),
  rule: validatorRuleSchema,
}).superRefine((value, context) => {
  if (value.rule.kind === "text_pattern" && !isSafeTextPattern(value.rule.pattern)) context.addIssue({ code: "custom", path: ["rule", "pattern"], message: "El patrón contiene una expresión no permitida o demasiado costosa." });
});

const generatorVariableSchema = z.object({
  key: contentKeySchema,
  label: plainText(300),
  inputType: z.enum(["text", "email", "url"]).default("text"),
  placeholder: optionalText(500),
  required: z.boolean().default(true),
});

export const generatorBlockSchema = blockBaseSchema.extend({
  type: z.literal("generator"),
  title: plainText(500),
  description: optionalText(2_000),
  variables: z.array(generatorVariableSchema).min(1).max(20),
  template: z.string().min(1).max(20_000),
  language: z.string().trim().toLowerCase().regex(/^[a-z0-9_+#.-]{1,40}$/).default("text"),
}).superRefine((value, context) => addDuplicateIssues(value.variables.map((variable) => variable.key), context, "Las variables deben tener claves únicas."));

export const contentBlockSchema = z.discriminatedUnion("type", [
  richTextBlockSchema,
  calloutBlockSchema,
  cardsBlockSchema,
  stepsBlockSchema,
  imageBlockSchema,
  videoBlockSchema,
  codeBlockSchema,
  terminalBlockSchema,
  commandReferenceBlockSchema,
  linkBlockSchema,
  embedBlockSchema,
  glossaryBlockSchema,
  questionBlockSchema,
  checklistBlockSchema,
  validatorBlockSchema,
  generatorBlockSchema,
]);

export const contentBlocksSchema = z.array(contentBlockSchema).min(1).max(200).superRefine((blocks, context) => {
  addDuplicateIssues(blocks.map((block) => block.key), context, "Los bloques deben tener claves únicas.");
  const activityKeys = blocks.flatMap((block) => "activityKey" in block ? [block.activityKey] : []);
  addDuplicateIssues(activityKeys, context, "Las actividades deben tener claves únicas dentro de la sección.");
});

export const contentRevisionInputSchema = z.object({
  blocks: contentBlocksSchema,
  note: z.string().trim().max(1_000).optional(),
});

export const contentSectionInputSchema = z.object({
  title: plainText(500),
  summary: z.string().trim().max(5_000).default(""),
  status: contentSectionStatusSchema.default("draft"),
  scheduledAt: z.string().datetime({ offset: true }).optional().nullable(),
}).superRefine((value, context) => {
  if (value.status === "scheduled" && !value.scheduledAt) context.addIssue({ code: "custom", path: ["scheduledAt"], message: "Una sección programada requiere fecha y hora." });
});

export const contentBaseInputSchema = z.object({
  name: plainText(500),
  kind: contentBaseKindSchema,
  description: z.string().trim().max(5_000).default(""),
});

export const contentAssetInputSchema = z.object({
  kind: contentAssetKindSchema,
  externalUrl: httpsUrlSchema.optional(),
  alt: z.string().trim().max(500).default(""),
  title: z.string().trim().max(500).default(""),
});

export type ContentSectionStatus = z.infer<typeof contentSectionStatusSchema>;
export type ContentBaseKind = z.infer<typeof contentBaseKindSchema>;
export type ContentAssetKind = z.infer<typeof contentAssetKindSchema>;
export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type ContentRevisionInput = z.infer<typeof contentRevisionInputSchema>;
export type ContentSectionInput = z.infer<typeof contentSectionInputSchema>;
export type QuestionBlock = z.infer<typeof questionBlockSchema>;
export type ChecklistBlock = z.infer<typeof checklistBlockSchema>;
export type ValidatorBlock = z.infer<typeof validatorBlockSchema>;
export type TerminalBlock = z.infer<typeof terminalBlockSchema>;
export type CommandReferenceBlock = z.infer<typeof commandReferenceBlockSchema>;

export function normalizeContentBlocks(input: unknown): ContentBlock[] {
  return contentBlocksSchema.parse(input).map((block) => block.type === "embed" ? { ...block, url: normalizeEmbedUrl(block.provider, block.url) } : block);
}

export function normalizeUtcIso(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error("La fecha y hora no son válidas.");
  return date.toISOString();
}

export function isSafeTextPattern(pattern: string): boolean {
  if (pattern.length > 200 || /\\[1-9]/.test(pattern)) return false;
  if (/\([^)]*[+*][^)]*\)[+*{]/.test(pattern) || /(?:\.\*|\.\+).*(?:\.\*|\.\+)/.test(pattern)) return false;
  try { new RegExp(pattern); return true; } catch { return false; }
}

export function normalizeEmbedUrl(provider: "youtube" | "vimeo", value: string): string {
  const url = new URL(value);
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (provider === "youtube") {
    let videoId = "";
    if (host === "youtu.be") videoId = url.pathname.split("/").filter(Boolean)[0] || "";
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") videoId = url.searchParams.get("v") || "";
      else if (url.pathname.startsWith("/embed/")) videoId = url.pathname.slice("/embed/".length).split("/")[0];
    }
    if (!/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) throw new Error("La URL no identifica un video válido de YouTube.");
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }
  if (host !== "vimeo.com" && host !== "player.vimeo.com") throw new Error("La URL debe pertenecer a Vimeo.");
  const parts = url.pathname.split("/").filter(Boolean);
  const videoId = parts[0] === "video" ? parts[1] : parts[0];
  if (!/^\d{5,15}$/.test(videoId || "")) throw new Error("La URL no identifica un video válido de Vimeo.");
  return `https://player.vimeo.com/video/${videoId}`;
}

function normalizeRichTextDocument(value: unknown): RichTextDocument {
  const budget = { nodes: 0, text: 0 };
  const root = normalizeRichTextNode(value, budget);
  if (root.type !== "doc") throw new Error("El contenido enriquecido debe comenzar con un documento.");
  return root as RichTextDocument;
}

function normalizeRichTextNode(value: unknown, budget: { nodes: number; text: number }): RichTextNode {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("El contenido enriquecido contiene un nodo inválido.");
  budget.nodes += 1;
  if (budget.nodes > 2_000) throw new Error("El contenido enriquecido contiene demasiados nodos.");
  const source = value as Record<string, unknown>;
  const allowedTypes: RichTextNode["type"][] = ["doc", "paragraph", "text", "heading", "bulletList", "orderedList", "listItem", "blockquote", "hardBreak", "horizontalRule"];
  if (typeof source.type !== "string" || !allowedTypes.includes(source.type as RichTextNode["type"])) throw new Error(`El nodo ${String(source.type)} no está permitido.`);
  const type = source.type as RichTextNode["type"];
  const normalized: RichTextNode = { type };
  if (type === "text") {
    if (typeof source.text !== "string") throw new Error("Un nodo de texto requiere contenido.");
    budget.text += source.text.length;
    if (budget.text > 100_000) throw new Error("El contenido enriquecido es demasiado extenso.");
    normalized.text = source.text;
    if (Array.isArray(source.marks)) normalized.marks = source.marks.map(normalizeRichTextMark);
    return normalized;
  }
  if (type === "heading") {
    const level = Number((source.attrs as Record<string, unknown> | undefined)?.level);
    if (level !== 2 && level !== 3 && level !== 4) throw new Error("El nivel de título debe estar entre 2 y 4.");
    normalized.attrs = { level };
  }
  if (Array.isArray(source.content)) normalized.content = source.content.map((child) => normalizeRichTextNode(child, budget));
  return normalized;
}

function normalizeRichTextMark(value: unknown): RichTextMark {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("El formato de texto no es válido.");
  const source = value as Record<string, unknown>;
  if (source.type === "bold" || source.type === "italic" || source.type === "strike" || source.type === "code") return { type: source.type };
  if (source.type === "link") {
    const href = (source.attrs as Record<string, unknown> | undefined)?.href;
    const parsed = safeLinkUrlSchema.safeParse(href);
    if (!parsed.success) throw new Error("El enlace del texto enriquecido no es seguro.");
    return { type: "link", attrs: { href: parsed.data } };
  }
  throw new Error(`El formato ${String(source.type)} no está permitido.`);
}

function addDuplicateIssues(values: string[], context: z.RefinementCtx, message: string) {
  if (new Set(values).size !== values.length) context.addIssue({ code: "custom", message });
}
