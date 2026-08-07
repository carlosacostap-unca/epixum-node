"use server";

import { createAdminServerClient } from "@/lib/pocketbase-server";
import { requireCohortStaffAccess } from "@/lib/cohorts/access";
import type { CohortEnrollment, ContentActivityAttempt, ContentSection, ContentSectionProgress, ContentSectionRevision, User, Week } from "@/types";
import { aggregateTeachingContent } from "./teaching-analytics";

export interface ContentAnalyticsFilters { week?: string; section?: string; student?: string; activity?: string }

export async function getTeachingContentAnalytics(cohortId: string, filters: ContentAnalyticsFilters = {}) {
  await requireCohortStaffAccess(cohortId);
  const pb = await createAdminServerClient();
  const [weeks, enrollments, allSections] = await Promise.all([
    pb.collection("weeks").getFullList<Week>({ filter: pb.filter("cohort = {:cohort}", { cohort: cohortId }), sort: "number" }),
    pb.collection("cohort_enrollments").getFullList<CohortEnrollment>({ filter: pb.filter("cohort = {:cohort} && status = 'active'", { cohort: cohortId }), expand: "user", sort: "enrolledAt" }),
    pb.collection("content_sections").getFullList<ContentSection>({ filter: filters.week ? pb.filter("cohort = {:cohort} && week = {:week}", { cohort: cohortId, week: filters.week }) : pb.filter("cohort = {:cohort}", { cohort: cohortId }), sort: "week,position" }),
  ]);
  const sections = filters.section ? allSections.filter((section) => section.id === filters.section) : allSections;
  const revisions = await Promise.all(sections.filter((section) => section.currentRevision).map((section) => pb.collection("content_section_revisions").getOne<ContentSectionRevision>(section.currentRevision!)));
  const revisionById = new Map(revisions.map((revision) => [revision.id, revision]));
  const enrolledStudents = enrollments
    .map((enrollment) => enrollment.expand?.user)
    .filter((user): user is User => Boolean(user))
    .sort((left, right) => (left.name || left.email).localeCompare(right.name || right.email, "es"));
  const students = enrolledStudents.filter((user) => !filters.student || user.id === filters.student);
  const sectionIds = new Set(sections.map((section) => section.id));
  const progressFilter = scopedFilter(pb, "cohort = {:cohort}", { cohort: cohortId }, filters, false);
  const attemptFilter = scopedFilter(pb, "cohort = {:cohort}", { cohort: cohortId }, filters, true);
  const [progress, attempts] = await Promise.all([
    pb.collection("content_section_progress").getFullList<ContentSectionProgress>({ filter: progressFilter, sort: "-lastViewedAt" }),
    pb.collection("content_activity_attempts").getFullList<ContentActivityAttempt>({ filter: attemptFilter, sort: "-attemptedAt" }),
  ]);
  const studentIds = new Set(students.map((student) => student.id));
  const scopedProgress = progress.filter((item) => sectionIds.has(item.section) && studentIds.has(item.student));
  const scopedAttempts = attempts.filter((item) => sectionIds.has(item.section) && studentIds.has(item.student) && (!filters.activity || item.activityKey === filters.activity));
  const analytics = aggregateTeachingContent({ students: students.map((user) => ({ id: user.id, name: user.name || user.email, email: user.email })), sections: sections.flatMap((section) => { const revision = section.currentRevision ? revisionById.get(section.currentRevision) : undefined; return revision ? [{ id: section.id, week: section.week, position: section.position, title: section.title, requirementsRevision: revision.requirementsRevision, activities: revision.activityManifest }] : []; }), progress: scopedProgress, attempts: scopedAttempts });
  return { weeks, allSections, allStudents: enrolledStudents, analytics, attempts: scopedAttempts };
}

function scopedFilter(pb: Awaited<ReturnType<typeof createAdminServerClient>>, base: string, values: Record<string, string>, filters: ContentAnalyticsFilters, includeActivity: boolean) {
  const clauses = [base]; const parameters = { ...values };
  if (filters.week) { clauses.push("week = {:week}"); parameters.week = filters.week; }
  if (filters.section) { clauses.push("section = {:section}"); parameters.section = filters.section; }
  if (filters.student) { clauses.push("student = {:student}"); parameters.student = filters.student; }
  if (includeActivity && filters.activity) { clauses.push("activityKey = {:activity}"); parameters.activity = filters.activity; }
  return pb.filter(clauses.join(" && "), parameters);
}
