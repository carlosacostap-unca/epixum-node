import { notFound } from "next/navigation";
import { createAdminServerClient } from "@/lib/pocketbase-server";
import { requireCohortAccess } from "@/lib/cohorts/access";
import type { ContentSection, Week } from "@/types";
import { isContentSectionAvailable } from "./availability";

export async function requireStudentContentContext(cohortId: string, weekId: string) {
  const access = await requireCohortAccess(cohortId, { capability: "weeks", activeEnrollment: true });
  if (access.user.role !== "estudiante" || !access.enrollment || access.enrollment.status !== "active" || access.cohort.status !== "active") notFound();
  const pb = await createAdminServerClient();
  const week = await pb.collection("weeks").getOne<Week>(weekId).catch(() => notFound());
  if (week.cohort !== cohortId || week.publicationStatus !== "published") notFound();
  return { pb, cohort: access.cohort, enrollment: access.enrollment, week, studentId: access.user.id };
}

export async function getAvailableStudentSections(context: Awaited<ReturnType<typeof requireStudentContentContext>>) {
  const sections = await context.pb.collection("content_sections").getFullList<ContentSection>({ filter: context.pb.filter("cohort = {:cohort} && week = {:week}", { cohort: context.cohort.id, week: context.week.id }), sort: "position" });
  return sections.filter((section) => section.currentRevision && isContentSectionAvailable({ enrollmentStatus: context.enrollment.status, cohortStatus: context.cohort.status, weekPublicationStatus: context.week.publicationStatus, sectionStatus: section.status, scheduledAt: section.scheduledAt }));
}

export async function requireAvailableStudentSection(cohortId: string, weekId: string, sectionId: string) {
  const context = await requireStudentContentContext(cohortId, weekId);
  const sections = await getAvailableStudentSections(context);
  const section = sections.find((item) => item.id === sectionId);
  if (!section?.currentRevision) notFound();
  return { ...context, sections, section };
}
