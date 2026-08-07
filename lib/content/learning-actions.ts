"use server";

import type { ContentActivityAttempt, ContentSectionProgress, ContentSectionRevision } from "@/types";
import { requireAvailableStudentSection } from "./student-access";
import { activitySubmissionSchema, attemptKeySchema, calculateRequirementProgress, gradeActivity, monotonicBlockProgress, type GradableBlock, type MasteryEvidence } from "./learning";
import { buildContentRequirements } from "./revisions";

export type LearningActionResult<T = undefined> = T extends undefined
  ? { success: true; message?: string } | { success: false; error: string }
  : { success: true; message?: string; data: T } | { success: false; error: string };

export async function submitContentActivityAction(cohortId: string, weekId: string, sectionId: string, input: unknown): Promise<LearningActionResult<{ correct: boolean; mastered: boolean; sectionCompleted: boolean }>> {
  try {
    const parsed = activitySubmissionSchema.parse(input);
    const context = await requireAvailableStudentSection(cohortId, weekId, sectionId);
    const existing = await context.pb.collection("content_activity_attempts").getFirstListItem<ContentActivityAttempt>(context.pb.filter("student = {:student} && section = {:section} && attemptKey = {:attemptKey}", { student: context.studentId, section: sectionId, attemptKey: parsed.attemptKey })).catch(() => null);
    if (existing) {
      const projection = await refreshProgressProjection(context, context.section.currentRevision!);
      return activityResult(existing.outcome, projection.completed, true);
    }
    const revision = await context.pb.collection("content_section_revisions").getOne<ContentSectionRevision>(parsed.revisionId);
    if (revision.section !== sectionId) throw new Error("La revisión de la actividad no pertenece a esta sección.");
    const block = revision.blocks.find((item): item is GradableBlock => (item.type === "question" || item.type === "checklist" || item.type === "validator") && item.activityKey === parsed.activityKey);
    if (!block) throw new Error("La actividad ya no está disponible en la revisión indicada.");
    const graded = gradeActivity(block, parsed.response);
    const manifest = revision.activityManifest.find((item) => item.activityKey === block.activityKey);
    if (!manifest) throw new Error("La actividad no tiene metadatos de evaluación válidos.");
    const attemptedAt = new Date().toISOString();
    await context.pb.collection("content_activity_attempts").create({ cohort: cohortId, week: weekId, section: sectionId, sectionRevision: revision.id, student: context.studentId, activityKey: block.activityKey, activityRevision: manifest.activityRevision, activityKind: manifest.kind, response: graded.normalizedResponse, outcome: graded.outcome, attemptKey: parsed.attemptKey, attemptedAt });
    const projection = await refreshProgressProjection(context, context.section.currentRevision!);
    return activityResult(graded.outcome, projection.completed, false);
  } catch (error) { return learningFail(error); }
}

export async function recordContentSectionOpenAction(cohortId: string, weekId: string, sectionId: string, viewKey: string): Promise<LearningActionResult> {
  try {
    const key = attemptKeySchema.parse(viewKey);
    const context = await requireAvailableStudentSection(cohortId, weekId, sectionId);
    const revisionId = context.section.currentRevision!;
    const revision = await context.pb.collection("content_section_revisions").getOne<ContentSectionRevision>(revisionId);
    const existing = await getProgress(context, sectionId);
    if (existing?.lastViewKey === key) return { success: true };
    const now = new Date().toISOString();
    const base = {
      cohort: cohortId, week: weekId, section: sectionId, student: context.studentId,
      lastRevision: revisionId, firstViewedAt: existing?.firstViewedAt ?? now, lastViewedAt: now,
      viewCount: (existing?.viewCount ?? 0) + 1, lastViewKey: key,
      lastBlockKey: existing?.lastRevision === revisionId ? existing.lastBlockKey ?? null : null,
      lastBlockIndex: existing?.lastRevision === revisionId ? existing.lastBlockIndex ?? null : null,
      masteredActivities: existing?.masteredActivities ?? {}, requirementsRevision: revision.requirementsRevision,
      completedAt: existing?.requirementsRevision === revision.requirementsRevision ? existing.completedAt ?? null : null,
    };
    if (existing) await context.pb.collection("content_section_progress").update(existing.id, base);
    else await context.pb.collection("content_section_progress").create(base);
    await refreshProgressProjection(context, revisionId);
    return { success: true };
  } catch (error) { return learningFail(error); }
}

export async function recordContentBlockProgressAction(cohortId: string, weekId: string, sectionId: string, input: { revisionId: string; blockKey: string; progressKey: string }): Promise<LearningActionResult<{ completed: boolean }>> {
  try {
    const progressKey = attemptKeySchema.parse(input.progressKey);
    const context = await requireAvailableStudentSection(cohortId, weekId, sectionId);
    if (context.section.currentRevision !== input.revisionId) throw new Error("El contenido cambió. Recargá la sección para continuar registrando el avance.");
    const revision = await context.pb.collection("content_section_revisions").getOne<ContentSectionRevision>(input.revisionId);
    const existing = await getProgress(context, sectionId);
    if (existing?.lastProgressKey === progressKey) return { success: true, data: { completed: Boolean(existing.completedAt && existing.requirementsRevision === revision.requirementsRevision) } };
    const blockKeys = revision.blocks.map((block) => block.key);
    const previousIndex = existing?.lastRevision === revision.id ? existing.lastBlockIndex : undefined;
    const nextIndex = monotonicBlockProgress(blockKeys, previousIndex, input.blockKey);
    const now = new Date().toISOString();
    const base = {
      cohort: cohortId, week: weekId, section: sectionId, student: context.studentId,
      lastRevision: revision.id, firstViewedAt: existing?.firstViewedAt ?? now, lastViewedAt: now,
      viewCount: existing?.viewCount ?? 1, lastViewKey: existing?.lastViewKey ?? null,
      lastBlockKey: blockKeys[nextIndex], lastBlockIndex: nextIndex, lastProgressKey: progressKey,
      masteredActivities: existing?.masteredActivities ?? {}, requirementsRevision: revision.requirementsRevision,
      completedAt: existing?.requirementsRevision === revision.requirementsRevision ? existing.completedAt ?? null : null,
    };
    if (existing) await context.pb.collection("content_section_progress").update(existing.id, base);
    else await context.pb.collection("content_section_progress").create(base);
    const projection = await refreshProgressProjection(context, revision.id);
    return { success: true, data: { completed: projection.completed } };
  } catch (error) { return learningFail(error); }
}

async function refreshProgressProjection(context: Awaited<ReturnType<typeof requireAvailableStudentSection>>, currentRevisionId: string) {
  const revision = await context.pb.collection("content_section_revisions").getOne<ContentSectionRevision>(currentRevisionId);
  const [attempts, existing] = await Promise.all([
    context.pb.collection("content_activity_attempts").getFullList<ContentActivityAttempt>({ filter: context.pb.filter("student = {:student} && section = {:section}", { student: context.studentId, section: context.section.id }), sort: "attemptedAt" }),
    getProgress(context, context.section.id),
  ]);
  const requirements = buildContentRequirements(revision.blocks);
  const evidence: MasteryEvidence[] = attempts.map((attempt) => ({ activityKey: attempt.activityKey, activityRevision: attempt.activityRevision, outcome: attempt.outcome }));
  const reachedTerminal = Boolean(requirements.terminalBlockKey && existing?.lastRevision === revision.id && existing.lastBlockKey === requirements.terminalBlockKey);
  const projection = calculateRequirementProgress(requirements, evidence, reachedTerminal);
  const now = new Date().toISOString();
  const patch = { masteredActivities: projection.masteredActivities, requirementsRevision: requirements.requirementsRevision, completedAt: projection.completed ? existing?.completedAt || now : null };
  if (existing) await context.pb.collection("content_section_progress").update(existing.id, patch);
  else await context.pb.collection("content_section_progress").create({ cohort: context.cohort.id, week: context.week.id, section: context.section.id, student: context.studentId, lastRevision: revision.id, firstViewedAt: now, lastViewedAt: now, viewCount: 1, masteredActivities: projection.masteredActivities, requirementsRevision: requirements.requirementsRevision, completedAt: projection.completed ? now : null });
  return projection;
}

async function getProgress(context: Awaited<ReturnType<typeof requireAvailableStudentSection>>, sectionId: string) {
  return context.pb.collection("content_section_progress").getFirstListItem<ContentSectionProgress>(context.pb.filter("student = {:student} && section = {:section}", { student: context.studentId, section: sectionId }), { requestKey: null }).catch(() => null);
}

function activityResult(outcome: ContentActivityAttempt["outcome"], sectionCompleted: boolean, duplicate: boolean): LearningActionResult<{ correct: boolean; mastered: boolean; sectionCompleted: boolean }> {
  const mastered = outcome === "correct" || outcome === "satisfied";
  return { success: true, message: mastered ? (sectionCompleted ? "¡Muy bien! Completaste la sección." : "Respuesta correcta.") : outcome === "pending" ? "Marcá todos los puntos para completar esta actividad." : "Todavía no es correcto. Revisá el contenido y volvé a intentar.", data: { correct: mastered, mastered, sectionCompleted }, ...(duplicate ? {} : {}) };
}

function learningFail(error: unknown): { success: false; error: string } {
  return { success: false, error: error instanceof Error ? error.message : "No se pudo registrar la actividad." };
}
