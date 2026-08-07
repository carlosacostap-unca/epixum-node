import assert from "node:assert/strict";
import test from "node:test";
import { contentBlocksSchema, contentSectionInputSchema, isSafeTextPattern, normalizeContentBlocks, normalizeUtcIso, type ContentBlock } from "./domain.ts";
import { contentSectionAvailabilityReason, isContentSectionAvailable } from "./availability.ts";
import { buildContentRequirements, contentRequirementsChanged } from "./revisions.ts";
import { toPublicContentRevision } from "./projection.ts";

const document = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Contenido" }] }] };

const baseBlocks: ContentBlock[] = contentBlocksSchema.parse([
  { key: "intro_01", type: "rich_text", content: document },
  {
    key: "question_01", type: "question", activityKey: "activity_01", required: true, questionKind: "single", prompt: "¿Cuál?",
    options: [{ key: "option_a", label: "A" }, { key: "option_b", label: "B" }], correctOptionKeys: ["option_b"],
  },
]);

test("valida y normaliza bloques estructurados con claves únicas", () => {
  assert.equal(baseBlocks.length, 2);
  assert.equal(baseBlocks[0].type, "rich_text");
  assert.throws(() => contentBlocksSchema.parse([{ ...baseBlocks[0] }, { ...baseBlocks[0] }]), /claves únicas/);
  assert.throws(() => contentBlocksSchema.parse([{ ...baseBlocks[1], correctOptionKeys: ["missing"] }]), /pertenecer/);
});

test("valida visuales técnicos estructurados y los conserva en la proyección pública", () => {
  const technical = contentBlocksSchema.parse([
    { key: "terminal_01", type: "terminal", title: "Terminal", rows: [{ key: "terminal_prompt", kind: "prompt", label: "Prompt", value: "PS C:\\Curso>" }, { key: "terminal_command", kind: "command", label: "Comando", value: "echo Hola" }] },
    { key: "commands_01", type: "command_reference", title: "Comandos", items: [{ key: "command_pwd", command: "pwd", purpose: "Muestra la ubicación.", tryIt: "Compará la ruta." }] },
  ]);
  const projection = toPublicContentRevision({ revisionId: "rev1", revisionNumber: 1, blocks: technical });
  assert.equal(projection.blocks[0].type, "terminal");
  assert.equal(projection.blocks[1].type === "command_reference" && projection.blocks[1].items[0].command, "pwd");
  assert.throws(() => contentBlocksSchema.parse([{ ...technical[0], rows: [{ key: "same_row", kind: "prompt", label: "A", value: "A" }, { key: "same_row", kind: "response", label: "B", value: "B" }] }]), /claves únicas/);
});

test("rechaza markup y enlaces inseguros en texto enriquecido", () => {
  assert.throws(() => contentBlocksSchema.parse([{ key: "unsafe_01", type: "rich_text", content: { type: "doc", content: [{ type: "script", text: "alert(1)" }] } }]), /no está permitido/);
  assert.throws(() => contentBlocksSchema.parse([{ key: "unsafe_02", type: "rich_text", content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] }] }] } }]), /no es seguro/);
});

test("exige programación completa y normaliza instantes a UTC", () => {
  assert.throws(() => contentSectionInputSchema.parse({ title: "Sección", status: "scheduled" }), /requiere fecha/);
  assert.equal(normalizeUtcIso("2026-08-01T09:00:00-03:00"), "2026-08-01T12:00:00.000Z");
});

test("calcula disponibilidad efectiva con todos los niveles", () => {
  const context = { enrollmentStatus: "active", cohortStatus: "active", weekPublicationStatus: "published", sectionStatus: "scheduled", scheduledAt: "2026-08-01T12:00:00.000Z" };
  assert.equal(isContentSectionAvailable(context, new Date("2026-08-01T11:59:59.000Z")), false);
  assert.equal(contentSectionAvailabilityReason(context, new Date("2026-08-01T11:59:59.000Z")), "schedule");
  assert.equal(isContentSectionAvailable(context, new Date("2026-08-01T12:00:00.000Z")), true);
  assert.equal(isContentSectionAvailable({ ...context, weekPublicationStatus: "draft" }, new Date("2026-08-02")), false);
});

test("separa revisión editorial de requisitos de finalización", () => {
  const original = buildContentRequirements(baseBlocks);
  const textOnly = structuredClone(baseBlocks);
  if (textOnly[0].type === "rich_text") textOnly[0].content = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Texto editado" }] }] };
  assert.equal(contentRequirementsChanged(baseBlocks, textOnly), false);
  const changedAnswer = structuredClone(baseBlocks);
  if (changedAnswer[1].type === "question") changedAnswer[1].correctOptionKeys = ["option_a"];
  assert.equal(contentRequirementsChanged(baseBlocks, changedAnswer), true);
  assert.equal(original.activities.length, 1);
});

test("la proyección pública no revela respuestas ni reglas privadas", () => {
  const validator = contentBlocksSchema.parse([{ key: "validator_01", type: "validator", activityKey: "activity_02", required: true, label: "Usuario", presentation: "github_profile", rule: { kind: "github_username" } }])[0];
  const projection = toPublicContentRevision({ revisionId: "rev1", revisionNumber: 1, blocks: [...baseBlocks, validator] });
  const question = projection.blocks.find((block) => block.type === "question");
  const publicValidator = projection.blocks.find((block) => block.type === "validator");
  assert.equal(question && "correctOptionKeys" in question, false);
  assert.equal(publicValidator && "rule" in publicValidator, false);
  assert.equal(publicValidator?.presentation, "github_profile");
  assert.equal(projection.activities.length, 2);
});

test("limita patrones declarativos riesgosos", () => {
  assert.equal(isSafeTextPattern("^[a-z0-9-]+$"), true);
  assert.equal(isSafeTextPattern("(a+)+$"), false);
  assert.equal(isSafeTextPattern("(.*.*)+"), false);
  assert.throws(() => contentBlocksSchema.parse([{ key: "validator_03", type: "validator", activityKey: "activity_03", label: "Texto", rule: { kind: "text_pattern", pattern: "(a+)+$" } }]), /no permitida/);
});

test("normaliza embeds admitidos y rechaza proveedores cruzados", () => {
  const blocks = normalizeContentBlocks([{ key: "embed_01", type: "embed", provider: "youtube", url: "https://youtu.be/abcdefghijk", title: "Video" }]);
  assert.equal(blocks[0].type === "embed" && blocks[0].url, "https://www.youtube-nocookie.com/embed/abcdefghijk");
  assert.throws(() => contentBlocksSchema.parse([{ key: "embed_02", type: "embed", provider: "youtube", url: "https://vimeo.com/123456789", title: "Video" }]), /YouTube/);
});
