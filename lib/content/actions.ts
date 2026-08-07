"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import type PocketBase from "pocketbase";
import { createAdminServerClient } from "@/lib/pocketbase-server";
import { requireCohortStaffAccess } from "@/lib/cohorts/access";
import type { Week, ContentAsset, ContentSection, ContentSectionRevision } from "@/types";
import { contentRevisionInputSchema } from "./domain";
import { toPublicContentRevision } from "./projection";
import { resolveContentAssetUrls } from "./assets";
import {
  assertExpectedRevision,
  buildRevisionCommitPlan,
  contentSectionCreateSchema,
  contentSectionMetadataSchema,
  createEmptySectionBlocks,
  externalAssetSchema,
  publicationPatch,
  sectionPositionMap,
  validateSectionOrder,
  validateUploadedAsset,
} from "./authoring";

export type ContentActionResult<T = undefined> = T extends undefined
  ? { success: true; message?: string } | { success: false; error: string }
  : { success: true; message?: string; data: T } | { success: false; error: string };

export async function getStaffWeekSections(cohortId: string, weekId: string) {
  const { pb } = await staffContentContext(cohortId, weekId);
  return pb.collection("content_sections").getFullList<ContentSection>({
    filter: pb.filter("cohort = {:cohort} && week = {:week}", { cohort: cohortId, week: weekId }), sort: "position",
  });
}

export async function getStaffContentSection(cohortId: string, weekId: string, sectionId: string) {
  const { pb } = await staffContentContext(cohortId, weekId);
  const section = await ownedSection(pb, cohortId, weekId, sectionId);
  const revision = section.currentRevision ? await pb.collection("content_section_revisions").getOne<ContentSectionRevision>(section.currentRevision) : null;
  return { section, revision };
}

export async function createContentSectionAction(cohortId: string, weekId: string, input: unknown): Promise<ContentActionResult<{ sectionId: string }>> {
  try {
    const parsed = contentSectionCreateSchema.parse(input);
    const { pb, userId } = await staffContentContext(cohortId, weekId);
    const last = await pb.collection("content_sections").getFirstListItem<ContentSection>(pb.filter("cohort = {:cohort} && week = {:week}", { cohort: cohortId, week: weekId }), { sort: "-position", requestKey: null }).catch(() => null);
    const sectionId = pocketBaseId();
    const revisionId = pocketBaseId();
    const plan = buildRevisionCommitPlan({ id: revisionId, sectionId, revisionNumber: 1, blocks: createEmptySectionBlocks(), authorId: userId });
    await createSectionWithRevision(pb, { id: sectionId, cohort: cohortId, week: weekId, position: (last?.position ?? 0) + 1, title: parsed.title, summary: parsed.summary, status: "draft", scheduledAt: null, publishedAt: null, sourceKey: parsed.sourceKey ?? null }, plan.revision);
    revalidateContentPaths(cohortId, weekId, sectionId);
    return { success: true, message: "Sección creada como borrador.", data: { sectionId } };
  } catch (error) { return contentFail(error); }
}

export async function duplicateContentSectionAction(cohortId: string, weekId: string, sectionId: string): Promise<ContentActionResult<{ sectionId: string }>> {
  try {
    const { pb, userId } = await staffContentContext(cohortId, weekId);
    const source = await ownedSection(pb, cohortId, weekId, sectionId);
    if (!source.currentRevision) throw new Error("La sección de origen no tiene una revisión para duplicar.");
    const revision = await pb.collection("content_section_revisions").getOne<ContentSectionRevision>(source.currentRevision);
    const last = await pb.collection("content_sections").getFirstListItem<ContentSection>(pb.filter("cohort = {:cohort} && week = {:week}", { cohort: cohortId, week: weekId }), { sort: "-position", requestKey: null });
    const duplicateId = pocketBaseId();
    const revisionId = pocketBaseId();
    const plan = buildRevisionCommitPlan({ id: revisionId, sectionId: duplicateId, revisionNumber: 1, blocks: revision.blocks, note: `Copia de ${source.id}`, authorId: userId });
    await createSectionWithRevision(pb, { id: duplicateId, cohort: cohortId, week: weekId, position: last.position + 1, title: `Copia de ${source.title}`.slice(0, 500), summary: source.summary ?? "", status: "draft", scheduledAt: null, publishedAt: null }, plan.revision);
    revalidateContentPaths(cohortId, weekId, duplicateId);
    return { success: true, message: "Sección duplicada como borrador independiente.", data: { sectionId: duplicateId } };
  } catch (error) { return contentFail(error); }
}

export async function updateContentSectionMetadataAction(cohortId: string, weekId: string, sectionId: string, input: unknown): Promise<ContentActionResult> {
  try {
    const parsed = contentSectionMetadataSchema.parse(input);
    const { pb } = await staffContentContext(cohortId, weekId);
    await ownedSection(pb, cohortId, weekId, sectionId);
    await pb.collection("content_sections").update(sectionId, parsed);
    revalidateContentPaths(cohortId, weekId, sectionId);
    return { success: true, message: "Datos de la sección actualizados." };
  } catch (error) { return contentFail(error); }
}

export async function saveContentRevisionAction(cohortId: string, weekId: string, sectionId: string, expectedRevisionId: string, input: unknown): Promise<ContentActionResult<{ revisionId: string; revisionNumber: number }>> {
  try {
    const parsed = contentRevisionInputSchema.parse(input);
    const { pb, userId } = await staffContentContext(cohortId, weekId);
    const section = await ownedSection(pb, cohortId, weekId, sectionId);
    assertExpectedRevision(section.currentRevision, expectedRevisionId);
    const current = await pb.collection("content_section_revisions").getOne<ContentSectionRevision>(expectedRevisionId);
    if (current.section !== section.id) throw new Error("La revisión indicada no pertenece a la sección.");
    const revisionId = pocketBaseId();
    const plan = buildRevisionCommitPlan({ id: revisionId, sectionId, revisionNumber: current.revisionNumber + 1, blocks: parsed.blocks, note: parsed.note, authorId: userId });
    await pb.collection("content_section_revisions").create(plan.revision);
    try {
      const latest = await ownedSection(pb, cohortId, weekId, sectionId);
      assertExpectedRevision(latest.currentRevision, expectedRevisionId);
      await pb.collection("content_sections").update(sectionId, plan.sectionPatch);
    } catch (error) {
      await pb.collection("content_section_revisions").delete(revisionId).catch(() => undefined);
      throw error;
    }
    revalidateContentPaths(cohortId, weekId, sectionId);
    return { success: true, message: section.status === "published" ? "Cambios publicados inmediatamente." : "Borrador guardado.", data: { revisionId, revisionNumber: plan.revision.revisionNumber } };
  } catch (error) { return contentFail(error); }
}

export async function reorderContentSectionsAction(cohortId: string, weekId: string, orderedIds: string[]): Promise<ContentActionResult> {
  try {
    const { pb } = await staffContentContext(cohortId, weekId);
    const sections = await pb.collection("content_sections").getFullList<ContentSection>({ filter: pb.filter("cohort = {:cohort} && week = {:week}", { cohort: cohortId, week: weekId }), sort: "position" });
    const order = validateSectionOrder(sections.map((section) => section.id), orderedIds);
    const positions = sectionPositionMap(order);
    const temporaryOffset = sections.length + Math.max(0, ...sections.map((section) => section.position));
    try {
      for (const section of sections) await pb.collection("content_sections").update(section.id, { position: temporaryOffset + section.position });
      for (const id of order) await pb.collection("content_sections").update(id, { position: positions.get(id) });
    } catch (error) {
      const rollbackOffset = temporaryOffset * 3;
      for (const section of sections) await pb.collection("content_sections").update(section.id, { position: rollbackOffset + section.position }).catch(() => undefined);
      for (const section of sections) await pb.collection("content_sections").update(section.id, { position: section.position }).catch(() => undefined);
      throw error;
    }
    revalidateContentPaths(cohortId, weekId);
    return { success: true, message: "Orden de secciones actualizado." };
  } catch (error) { return contentFail(error); }
}

export async function setContentSectionStateAction(cohortId: string, weekId: string, sectionId: string, input: unknown): Promise<ContentActionResult> {
  try {
    const { pb } = await staffContentContext(cohortId, weekId);
    await ownedSection(pb, cohortId, weekId, sectionId);
    const patch = publicationPatch(input);
    await pb.collection("content_sections").update(sectionId, patch);
    revalidateContentPaths(cohortId, weekId, sectionId);
    const messages = { draft: "Sección devuelta a borrador.", scheduled: "Publicación programada.", published: "Sección publicada.", hidden: "Sección oculta." };
    return { success: true, message: messages[patch.status] };
  } catch (error) { return contentFail(error); }
}

export async function uploadContentAssetAction(cohortId: string, weekId: string, input: { kind: "image" | "video"; file: File; alt?: string; title?: string }): Promise<ContentActionResult<{ asset: ContentAsset }>> {
  try {
    const { pb, userId } = await staffContentContext(cohortId, weekId);
    const metadata = validateUploadedAsset({ kind: input.kind, name: input.file?.name ?? "", type: input.file?.type ?? "", size: input.file?.size ?? 0, alt: input.alt, title: input.title });
    const asset = await pb.collection("content_assets").create<ContentAsset>({ kind: metadata.kind, file: input.file, alt: metadata.alt, title: metadata.title, author: userId });
    return { success: true, message: "Medio subido.", data: { asset } };
  } catch (error) { return contentFail(error); }
}

export async function referenceExternalContentAssetAction(cohortId: string, weekId: string, input: unknown): Promise<ContentActionResult<{ asset: ContentAsset }>> {
  try {
    const { pb, userId } = await staffContentContext(cohortId, weekId);
    const parsed = externalAssetSchema.parse(input);
    const asset = await pb.collection("content_assets").create<ContentAsset>({ ...parsed, author: userId });
    return { success: true, message: "Medio externo agregado.", data: { asset } };
  } catch (error) { return contentFail(error); }
}

export async function getContentSectionPreview(cohortId: string, weekId: string, sectionId: string, revisionId?: string) {
  const { pb } = await staffContentContext(cohortId, weekId);
  const section = await ownedSection(pb, cohortId, weekId, sectionId);
  const selectedRevision = revisionId ?? section.currentRevision;
  if (!selectedRevision) throw new Error("La sección no tiene contenido para previsualizar.");
  const revision = await pb.collection("content_section_revisions").getOne<ContentSectionRevision>(selectedRevision);
  if (revision.section !== section.id) throw new Error("La revisión indicada no pertenece a la sección.");
  const publicRevision = toPublicContentRevision({ revisionId: revision.id, revisionNumber: revision.revisionNumber, blocks: revision.blocks });
  const assetUrls = await resolveContentAssetUrls(pb, publicRevision.blocks);
  return { preview: true as const, section, revision: publicRevision, assetUrls };
}

async function staffContentContext(cohortId: string, weekId: string) {
  const access = await requireCohortStaffAccess(cohortId);
  const pb = await createAdminServerClient();
  const week = await pb.collection("weeks").getOne<Week>(weekId);
  if (week.cohort !== cohortId) throw new Error("La semana no pertenece a la cohorte indicada.");
  return { pb, userId: access.user.id };
}

async function ownedSection(pb: PocketBase, cohortId: string, weekId: string, sectionId: string) {
  const section = await pb.collection("content_sections").getOne<ContentSection>(sectionId);
  if (section.cohort !== cohortId || section.week !== weekId) throw new Error("La sección no pertenece a la semana indicada.");
  return section;
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

function pocketBaseId() {
  return randomBytes(10).toString("hex").slice(0, 15);
}

function revalidateContentPaths(cohortId: string, weekId: string, sectionId?: string) {
  revalidatePath(`/cohorts/${cohortId}/weeks/${weekId}`);
  revalidatePath(`/cohorts/${cohortId}/weeks/${weekId}/content/manage`);
  if (sectionId) {
    revalidatePath(`/cohorts/${cohortId}/weeks/${weekId}/content/${sectionId}`);
    revalidatePath(`/cohorts/${cohortId}/weeks/${weekId}/content/${sectionId}/edit`);
  }
}

function contentFail(error: unknown): { success: false; error: string } {
  return { success: false, error: error instanceof Error ? error.message : "No se pudo completar la operación de contenido." };
}
