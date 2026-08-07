import { z } from "zod";
import { contentBlocksSchema } from "./domain.ts";

export const pedagogicalSectionSnapshotSchema = z.object({
  position: z.number().int().min(1),
  title: z.string().trim().min(1).max(500),
  summary: z.string().max(5_000).default(""),
  sourceKey: z.string().optional(),
  blocks: contentBlocksSchema,
});

export const pedagogicalWeekSnapshotSchema = z.object({
  number: z.number().int().min(1),
  title: z.string().trim().min(1).max(500),
  description: z.string().max(10_000).default(""),
  sections: z.array(pedagogicalSectionSnapshotSchema),
});

export const contentTemplateSnapshotSchema = z.discriminatedUnion("kind", [
  z.object({ schemaVersion: z.literal(1), kind: z.literal("section"), section: pedagogicalSectionSnapshotSchema }),
  z.object({ schemaVersion: z.literal(1), kind: z.literal("week"), week: pedagogicalWeekSnapshotSchema }),
  z.object({ schemaVersion: z.literal(1), kind: z.literal("course"), weeks: z.array(pedagogicalWeekSnapshotSchema) }),
]);

export type PedagogicalSectionSnapshot = z.infer<typeof pedagogicalSectionSnapshotSchema>;
export type PedagogicalWeekSnapshot = z.infer<typeof pedagogicalWeekSnapshotSchema>;
export type ContentTemplateSnapshot = z.infer<typeof contentTemplateSnapshotSchema>;

export function summarizeTemplateSnapshot(input: unknown) {
  const snapshot = contentTemplateSnapshotSchema.parse(input);
  const weeks = snapshot.kind === "course" ? snapshot.weeks : snapshot.kind === "week" ? [snapshot.week] : [];
  const sections = snapshot.kind === "section" ? [snapshot.section] : weeks.flatMap((week) => week.sections);
  return { kind: snapshot.kind, weeks: weeks.length, sections: sections.length, blocks: sections.reduce((count, section) => count + section.blocks.length, 0) };
}

export function cloneTemplateSnapshot(input: unknown): ContentTemplateSnapshot {
  return structuredClone(contentTemplateSnapshotSchema.parse(input));
}

export function assertPedagogicalOnly(input: unknown) {
  const serialized = JSON.stringify(input);
  for (const forbidden of ["publicationStatus", "scheduledAt", "publishedAt", "student", "enrollment", "progress", "attempt", "completedAt", "viewCount"]) {
    if (serialized.includes(`\"${forbidden}\"`)) throw new Error(`La instantánea contiene el campo operativo ${forbidden}.`);
  }
  return contentTemplateSnapshotSchema.parse(input);
}

export function assertCompatibleTemplateTarget(kind: ContentTemplateSnapshot["kind"], target: { cohortId?: string; weekId?: string }) {
  if (kind === "section" && (!target.cohortId || !target.weekId)) throw new Error("Una base de sección requiere una semana de destino.");
  if ((kind === "course" || kind === "week") && !target.cohortId) throw new Error(`Una base de ${kind === "course" ? "curso" : "semana"} requiere una cohorte de destino.`);
  if (kind !== "section" && target.weekId) throw new Error("Sólo una base de sección puede aplicarse directamente a una semana.");
  return true;
}
