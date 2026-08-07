"use server";

import { notFound } from "next/navigation";
import type { ContentSectionProgress, ContentSectionRevision } from "@/types";
import { toPublicContentRevision } from "./projection";
import { chooseContinueSection, readerNavigation, weeklyCompletion } from "./reader";
import { getAvailableStudentSections, requireStudentContentContext } from "./student-access";
import { resolveContentAssetUrls } from "./assets";

export interface StudentContentSummary {
  id: string;
  position: number;
  title: string;
  summary?: string;
  completed: boolean;
  started: boolean;
  lastViewedAt?: string;
  lastBlockKey?: string;
}

export async function getStudentWeekContent(cohortId: string, weekId: string) {
  const context = await requireStudentContentContext(cohortId, weekId);
  const sections = await getAvailableStudentSections(context);
  const progress = await context.pb.collection("content_section_progress").getFullList<ContentSectionProgress>({ filter: context.pb.filter("cohort = {:cohort} && week = {:week} && student = {:student}", { cohort: cohortId, week: weekId, student: context.studentId }) });
  const bySection = new Map(progress.map((item) => [item.section, item]));
  const revisions = await Promise.all(sections.map((section) => context.pb.collection("content_section_revisions").getOne<ContentSectionRevision>(section.currentRevision!)));
  const summaries: StudentContentSummary[] = sections.map((section, index) => {
    const item = bySection.get(section.id);
    const revision = revisions[index];
    const completed = Boolean(item?.completedAt && item.requirementsRevision === revision.requirementsRevision);
    return { id: section.id, position: index + 1, title: section.title, summary: section.summary, completed, started: Boolean(item?.firstViewedAt), lastViewedAt: item?.lastViewedAt, lastBlockKey: item?.lastRevision === revision.id ? item.lastBlockKey : undefined };
  });
  const progressSummary = weeklyCompletion(summaries);
  return { sections: summaries, progress: progressSummary, continueSection: chooseContinueSection(summaries) };
}

export async function getStudentContentReader(cohortId: string, weekId: string, sectionId: string) {
  const context = await requireStudentContentContext(cohortId, weekId);
  const sections = await getAvailableStudentSections(context);
  const section = sections.find((item) => item.id === sectionId);
  if (!section?.currentRevision) notFound();
  const navigation = readerNavigation(sections, sectionId);
  const [revision, progress] = await Promise.all([
    context.pb.collection("content_section_revisions").getOne<ContentSectionRevision>(section.currentRevision),
    context.pb.collection("content_section_progress").getFirstListItem<ContentSectionProgress>(context.pb.filter("student = {:student} && section = {:section}", { student: context.studentId, section: sectionId })).catch(() => null),
  ]);
  const publicRevision = toPublicContentRevision({ revisionId: revision.id, revisionNumber: revision.revisionNumber, blocks: revision.blocks });
  const assetUrls = await resolveContentAssetUrls(context.pb, publicRevision.blocks);
  const allProgress = await context.pb.collection("content_section_progress").getFullList<ContentSectionProgress>({ filter: context.pb.filter("student = {:student} && week = {:week}", { student: context.studentId, week: weekId }) });
  const requirementsBySection = new Map<string, string>();
  await Promise.all(sections.map(async (item) => { if (!item.currentRevision) return; const current = await context.pb.collection("content_section_revisions").getOne<ContentSectionRevision>(item.currentRevision); requirementsBySection.set(item.id, current.requirementsRevision); }));
  const completed = new Set(allProgress.filter((item) => item.completedAt && item.requirementsRevision === requirementsBySection.get(item.section)).map((item) => item.section));
  return { section, revision: publicRevision, progress, assetUrls, navigation, weekProgress: weeklyCompletion(sections.map((item) => ({ completed: completed.has(item.id) }))) };
}
