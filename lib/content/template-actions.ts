"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type PocketBase from "pocketbase";
import { createAdminServerClient } from "@/lib/pocketbase-server";
import { requireAdmin, requireCohortStaffAccess, requireStaff } from "@/lib/cohorts/access";
import type { Cohort, ContentBase, ContentBaseVersion, ContentSection, ContentSectionRevision, Week } from "@/types";
import { buildRevisionCommitPlan } from "./authoring";
import { assertCompatibleTemplateTarget, assertPedagogicalOnly, cloneTemplateSnapshot, contentTemplateSnapshotSchema, summarizeTemplateSnapshot, type ContentTemplateSnapshot, type PedagogicalSectionSnapshot, type PedagogicalWeekSnapshot } from "./templates";

type TemplateActionResult<T = undefined> = T extends undefined ? { success: true; message?: string } | { success: false; error: string } : { success: true; message?: string; data: T } | { success: false; error: string };

const promotionSchema = z.object({ baseId: z.string().optional(), name: z.string().trim().min(1).max(500), description: z.string().trim().max(5_000).default(""), kind: z.enum(["course", "week", "section"]), sourceId: z.string().trim().min(1), note: z.string().trim().max(1_000).optional() });
const targetSchema = z.object({ cohortId: z.string().trim().min(1), weekId: z.string().trim().min(1).optional() });

export async function listContentBases() {
  await requireStaff();
  const pb = await createAdminServerClient();
  return pb.collection("content_bases").getFullList<ContentBase>({ sort: "kind,name" });
}

export async function getContentBaseDetails(baseId: string) {
  await requireStaff();
  const pb = await createAdminServerClient();
  const base = await pb.collection("content_bases").getOne<ContentBase>(baseId);
  const versions = await pb.collection("content_base_versions").getFullList<ContentBaseVersion>({ filter: pb.filter("base = {:base}", { base: baseId }), sort: "-versionNumber" });
  return { base, versions: versions.map((version) => ({ ...version, summary: summarizeTemplateSnapshot(version.snapshot) })) };
}

export async function previewContentBaseVersion(versionId: string) {
  await requireStaff();
  const pb = await createAdminServerClient();
  const version = await pb.collection("content_base_versions").getOne<ContentBaseVersion>(versionId);
  return { version, snapshot: contentTemplateSnapshotSchema.parse(version.snapshot), summary: summarizeTemplateSnapshot(version.snapshot) };
}

export async function promoteContentBaseAction(input: unknown): Promise<TemplateActionResult<{ baseId: string; versionId: string }>> {
  try {
    const admin = await requireAdmin();
    const parsed = promotionSchema.parse(input);
    const pb = await createAdminServerClient();
    const snapshot = await snapshotSource(pb, parsed.kind, parsed.sourceId);
    assertPedagogicalOnly(snapshot);
    const versionId = pocketBaseId();
    let baseId = parsed.baseId;
    let versionNumber = 1;
    if (baseId) {
      const base = await pb.collection("content_bases").getOne<ContentBase>(baseId);
      if (base.kind !== parsed.kind) throw new Error("La base y la copia promovida deben tener el mismo nivel.");
      const latest = await pb.collection("content_base_versions").getFirstListItem<ContentBaseVersion>(pb.filter("base = {:base}", { base: baseId }), { sort: "-versionNumber", requestKey: null }).catch(() => null);
      versionNumber = (latest?.versionNumber ?? 0) + 1;
      await createVersionAndAdvanceBase(pb, baseId, { id: versionId, base: baseId, versionNumber, snapshot, sourceKind: "promotion", sourceReference: parsed.sourceId, note: parsed.note ?? "", createdBy: admin.id });
    } else {
      baseId = pocketBaseId();
      await createBaseWithVersion(pb, { id: baseId, name: parsed.name, kind: parsed.kind, description: parsed.description, active: true, createdBy: admin.id }, { id: versionId, base: baseId, versionNumber, snapshot, sourceKind: "promotion", sourceReference: parsed.sourceId, note: parsed.note ?? "", createdBy: admin.id });
    }
    revalidatePath("/admin/content-bases");
    return { success: true, message: `Versión base ${versionNumber} creada sin modificar copias existentes.`, data: { baseId, versionId } };
  } catch (error) { return templateFail(error); }
}

export async function restoreContentBaseVersionAction(baseId: string, versionId: string, confirmed: boolean): Promise<TemplateActionResult<{ versionId: string }>> {
  try {
    if (!confirmed) throw new Error("La restauración requiere confirmación explícita.");
    const admin = await requireAdmin();
    const pb = await createAdminServerClient();
    const [base, source, latest] = await Promise.all([
      pb.collection("content_bases").getOne<ContentBase>(baseId),
      pb.collection("content_base_versions").getOne<ContentBaseVersion>(versionId),
      pb.collection("content_base_versions").getFirstListItem<ContentBaseVersion>(pb.filter("base = {:base}", { base: baseId }), { sort: "-versionNumber", requestKey: null }),
    ]);
    if (source.base !== base.id) throw new Error("La versión histórica no pertenece a la base indicada.");
    const restoredId = pocketBaseId();
    await createVersionAndAdvanceBase(pb, base.id, { id: restoredId, base: base.id, versionNumber: latest.versionNumber + 1, snapshot: cloneTemplateSnapshot(source.snapshot), sourceKind: "restore", sourceReference: source.id, note: `Restauración de la versión ${source.versionNumber}`, createdBy: admin.id });
    revalidatePath("/admin/content-bases");
    return { success: true, message: `Versión ${source.versionNumber} restaurada como nueva versión ${latest.versionNumber + 1}.`, data: { versionId: restoredId } };
  } catch (error) { return templateFail(error); }
}

export async function applyContentBaseVersionAction(versionId: string, target: unknown, confirmed: boolean): Promise<TemplateActionResult<{ weeks: number; sections: number }>> {
  try {
    if (!confirmed) throw new Error("La copia requiere confirmación explícita después de revisar el resumen.");
    const parsedTarget = targetSchema.parse(target);
    const access = await requireCohortStaffAccess(parsedTarget.cohortId);
    const pb = await createAdminServerClient();
    const [cohort, version] = await Promise.all([pb.collection("cohorts").getOne<Cohort>(parsedTarget.cohortId), pb.collection("content_base_versions").getOne<ContentBaseVersion>(versionId)]);
    const snapshot = contentTemplateSnapshotSchema.parse(version.snapshot);
    assertCompatibleTemplateTarget(snapshot.kind, parsedTarget);
    if ((snapshot.kind === "course" || snapshot.kind === "week") && cohort.mode !== "weekly") throw new Error("Las bases semanales sólo pueden aplicarse a cohortes de modalidad semanal.");
    if (snapshot.kind === "section") {
      const week = await pb.collection("weeks").getOne<Week>(parsedTarget.weekId!);
      if (week.cohort !== cohort.id) throw new Error("La semana de destino no pertenece a la cohorte indicada.");
      await materializeSection(pb, cohort.id, week.id, snapshot.section, version.id, access.user.id);
    } else {
      const sourceWeeks = snapshot.kind === "course" ? snapshot.weeks : [snapshot.week];
      const latestWeek = await pb.collection("weeks").getFirstListItem<Week>(pb.filter("cohort = {:cohort}", { cohort: cohort.id }), { sort: "-number", requestKey: null }).catch(() => null);
      for (let index = 0; index < sourceWeeks.length; index += 1) await materializeWeek(pb, cohort.id, (latestWeek?.number ?? 0) + index + 1, sourceWeeks[index], version.id, access.user.id);
    }
    const summary = summarizeTemplateSnapshot(snapshot);
    revalidatePath(`/cohorts/${cohort.id}/weeks`); revalidatePath("/admin/content-bases");
    return { success: true, message: "Base copiada como contenido independiente en borrador.", data: { weeks: summary.weeks, sections: summary.sections } };
  } catch (error) { return templateFail(error); }
}

async function snapshotSource(pb: PocketBase, kind: "course" | "week" | "section", sourceId: string): Promise<ContentTemplateSnapshot> {
  if (kind === "section") return { schemaVersion: 1, kind, section: await snapshotSection(pb, sourceId) };
  if (kind === "week") return { schemaVersion: 1, kind, week: await snapshotWeek(pb, sourceId) };
  const cohort = await pb.collection("cohorts").getOne<Cohort>(sourceId);
  if (cohort.mode !== "weekly") throw new Error("Sólo una cohorte semanal puede promoverse como base de curso semanal.");
  const weeks = await pb.collection("weeks").getFullList<Week>({ filter: pb.filter("cohort = {:cohort}", { cohort: sourceId }), sort: "number" });
  return { schemaVersion: 1, kind, weeks: await Promise.all(weeks.map((week) => snapshotWeek(pb, week.id))) };
}

async function snapshotWeek(pb: PocketBase, weekId: string): Promise<PedagogicalWeekSnapshot> {
  const week = await pb.collection("weeks").getOne<Week>(weekId);
  const sections = await pb.collection("content_sections").getFullList<ContentSection>({ filter: pb.filter("week = {:week}", { week: weekId }), sort: "position" });
  return { number: week.number, title: week.title, description: week.description ?? "", sections: await Promise.all(sections.map((section) => snapshotSection(pb, section.id))) };
}

async function snapshotSection(pb: PocketBase, sectionId: string): Promise<PedagogicalSectionSnapshot> {
  const section = await pb.collection("content_sections").getOne<ContentSection>(sectionId);
  if (!section.currentRevision) throw new Error(`La sección ${section.title} no tiene una revisión para promover.`);
  const revision = await pb.collection("content_section_revisions").getOne<ContentSectionRevision>(section.currentRevision);
  return { position: section.position, title: section.title, summary: section.summary ?? "", sourceKey: section.sourceKey, blocks: revision.blocks };
}

async function materializeWeek(pb: PocketBase, cohortId: string, weekNumber: number, snapshot: PedagogicalWeekSnapshot, versionId: string, authorId: string) {
  const weekId = pocketBaseId();
  await pb.collection("weeks").create({ id: weekId, cohort: cohortId, number: weekNumber, title: snapshot.title, description: snapshot.description, publicationStatus: "draft", publishedAt: null, startDate: null, endDate: null });
  const created: Array<{ sectionId: string; revisionId: string }> = [];
  try {
    for (const section of [...snapshot.sections].sort((a, b) => a.position - b.position)) created.push(await materializeSection(pb, cohortId, weekId, section, versionId, authorId));
  } catch (error) {
    for (const item of created.reverse()) {
      await pb.collection("content_section_revisions").delete(item.revisionId).catch(() => undefined);
      await pb.collection("content_sections").delete(item.sectionId).catch(() => undefined);
    }
    await pb.collection("weeks").delete(weekId).catch(() => undefined);
    throw error;
  }
}

async function materializeSection(pb: PocketBase, cohortId: string, weekId: string, snapshot: PedagogicalSectionSnapshot, versionId: string, authorId: string) {
  const last = await pb.collection("content_sections").getFirstListItem<ContentSection>(pb.filter("week = {:week}", { week: weekId }), { sort: "-position", requestKey: null }).catch(() => null);
  const sectionId = pocketBaseId(); const revisionId = pocketBaseId();
  const plan = buildRevisionCommitPlan({ id: revisionId, sectionId, revisionNumber: 1, blocks: snapshot.blocks, note: `Copia independiente de la versión base ${versionId}`, authorId });
  await createSectionWithRevision(pb, { id: sectionId, cohort: cohortId, week: weekId, position: (last?.position ?? 0) + 1, title: snapshot.title, summary: snapshot.summary, status: "draft", scheduledAt: null, publishedAt: null, sourceBaseVersion: versionId }, plan.revision);
  return { sectionId, revisionId };
}

async function createSectionWithRevision(pb: PocketBase, section: Record<string, unknown> & { id: string }, revision: Record<string, unknown> & { id: string }) {
  let sectionCreated = false;
  let revisionCreated = false;
  try {
    await pb.collection("content_sections").create(section);
    sectionCreated = true;
    await pb.collection("content_section_revisions").create(revision);
    revisionCreated = true;
    await pb.collection("content_sections").update(section.id, { currentRevision: revision.id });
  } catch (error) {
    if (revisionCreated) await pb.collection("content_section_revisions").delete(revision.id).catch(() => undefined);
    if (sectionCreated) await pb.collection("content_sections").delete(section.id).catch(() => undefined);
    throw error;
  }
}

async function createVersionAndAdvanceBase(pb: PocketBase, baseId: string, version: Record<string, unknown> & { id: string }) {
  await pb.collection("content_base_versions").create(version);
  try {
    await pb.collection("content_bases").update(baseId, { currentVersion: version.id });
  } catch (error) {
    await pb.collection("content_base_versions").delete(version.id).catch(() => undefined);
    throw error;
  }
}

async function createBaseWithVersion(pb: PocketBase, base: Record<string, unknown> & { id: string }, version: Record<string, unknown> & { id: string }) {
  let baseCreated = false;
  let versionCreated = false;
  try {
    await pb.collection("content_bases").create(base);
    baseCreated = true;
    await pb.collection("content_base_versions").create(version);
    versionCreated = true;
    await pb.collection("content_bases").update(base.id, { currentVersion: version.id });
  } catch (error) {
    if (versionCreated) await pb.collection("content_base_versions").delete(version.id).catch(() => undefined);
    if (baseCreated) await pb.collection("content_bases").delete(base.id).catch(() => undefined);
    throw error;
  }
}

function pocketBaseId() { return randomBytes(10).toString("hex").slice(0, 15); }
function templateFail(error: unknown): { success: false; error: string } { return { success: false, error: error instanceof Error ? error.message : "No se pudo completar la operación con la base." }; }
