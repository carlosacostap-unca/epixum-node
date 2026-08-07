import type { ActivityManifestEntry } from "./revisions.ts";
import type { ContentActivityAttempt, ContentSectionProgress } from "@/types";

export interface AnalyticsStudent { id: string; name: string; email: string }
export interface AnalyticsSection { id: string; week: string; position: number; title: string; requirementsRevision: string; activities: ActivityManifestEntry[] }

export function aggregateTeachingContent(input: { students: AnalyticsStudent[]; sections: AnalyticsSection[]; progress: ContentSectionProgress[]; attempts: ContentActivityAttempt[] }) {
  const progressByPair = new Map(input.progress.map((item) => [`${item.student}:${item.section}`, item]));
  const attemptsByPair = groupBy(input.attempts, (item) => `${item.student}:${item.section}`);
  const sectionRows = input.sections.map((section) => {
    const related = input.progress.filter((item) => item.section === section.id);
    const openedStudentIds = new Set(related.map((item) => item.student));
    const completedStudentIds = new Set(related.filter((item) => item.completedAt && item.requirementsRevision === section.requirementsRevision).map((item) => item.student));
    const activities = section.activities.map((activity) => {
      const relatedAttempts = input.attempts.filter((attempt) => attempt.section === section.id && attempt.activityKey === activity.activityKey && attempt.activityRevision === activity.activityRevision);
      const masteredStudentIds = new Set(relatedAttempts.filter((attempt) => attempt.outcome === "correct" || attempt.outcome === "satisfied").map((attempt) => attempt.student));
      return { ...activity, participants: new Set(relatedAttempts.map((attempt) => attempt.student)).size, attempts: relatedAttempts.length, mastered: masteredStudentIds.size };
    });
    return { ...section, enrolled: input.students.length, opened: openedStudentIds.size, completed: completedStudentIds.size, pending: Math.max(0, input.students.length - completedStudentIds.size), activities };
  });
  const studentRows = input.students.map((student) => {
    const sections = input.sections.map((section) => {
      const progress = progressByPair.get(`${student.id}:${section.id}`);
      const attempts = attemptsByPair.get(`${student.id}:${section.id}`) ?? [];
      const mastered = new Set(attempts.filter((attempt) => attempt.outcome === "correct" || attempt.outcome === "satisfied").map((attempt) => `${attempt.activityKey}:${attempt.activityRevision}`));
      return { id: section.id, week: section.week, position: section.position, title: section.title, opened: Boolean(progress), firstViewedAt: progress?.firstViewedAt, lastViewedAt: progress?.lastViewedAt, viewCount: progress?.viewCount ?? 0, lastBlockKey: progress?.lastBlockKey, completed: Boolean(progress?.completedAt && progress.requirementsRevision === section.requirementsRevision), activities: section.activities.map((activity) => ({ ...activity, mastered: mastered.has(`${activity.activityKey}:${activity.activityRevision}`), attempts: attempts.filter((attempt) => attempt.activityKey === activity.activityKey).length })) };
    });
    return { ...student, sections, opened: sections.filter((section) => section.opened).length, completed: sections.filter((section) => section.completed).length, attempts: sections.reduce((total, section) => total + section.activities.reduce((count, activity) => count + activity.attempts, 0), 0) };
  });
  return { sections: sectionRows, students: studentRows, totals: { students: input.students.length, sections: input.sections.length, opened: new Set(input.progress.map((item) => item.student)).size, completed: input.progress.filter((item) => input.sections.some((section) => section.id === item.section && section.requirementsRevision === item.requirementsRevision) && item.completedAt).length, attempts: input.attempts.length } };
}

function groupBy<T>(items: T[], key: (item: T) => string) {
  const grouped = new Map<string, T[]>();
  for (const item of items) grouped.set(key(item), [...(grouped.get(key(item)) ?? []), item]);
  return grouped;
}
