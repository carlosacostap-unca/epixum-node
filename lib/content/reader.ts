export interface ReaderNavigationItem {
  id: string;
  position: number;
}

export interface LearningWeekCandidate {
  id: string;
  number: number;
  startDate?: string;
  endDate?: string;
  progress: { completed: number; total: number };
}

export interface LearningSectionDestination {
  id: string;
  lastBlockKey?: string;
  completed?: boolean;
}

export function readerNavigation(items: ReaderNavigationItem[], currentId: string) {
  const ordered = [...items].sort((a, b) => a.position - b.position);
  const index = ordered.findIndex((item) => item.id === currentId);
  if (index < 0) throw new Error("La sección actual no pertenece al recorrido disponible.");
  return { previous: ordered[index - 1] ?? null, next: ordered[index + 1] ?? null, position: index + 1, total: ordered.length };
}

export function chooseContinueSection<T extends { id: string; position: number; completed: boolean; lastViewedAt?: string }>(sections: T[]): T | null {
  const incomplete = sections.filter((section) => !section.completed);
  if (!incomplete.length) return [...sections].sort((a, b) => a.position - b.position).at(-1) ?? null;
  const resumed = incomplete.filter((section) => section.lastViewedAt).sort((a, b) => new Date(b.lastViewedAt!).getTime() - new Date(a.lastViewedAt!).getTime())[0];
  return resumed ?? [...incomplete].sort((a, b) => a.position - b.position)[0] ?? null;
}

export function weeklyCompletion(sections: Array<{ completed: boolean }>) {
  const completed = sections.filter((section) => section.completed).length;
  return { completed, total: sections.length, percentage: sections.length ? Math.round((completed / sections.length) * 100) : 0 };
}

export function chooseLearningWeek<T extends LearningWeekCandidate>(weeks: T[], now = new Date()): T | null {
  const ordered = [...weeks].sort((a, b) => a.number - b.number);
  const incomplete = ordered.filter((week) => week.progress.total > 0 && week.progress.completed < week.progress.total);
  const current = incomplete.find((week) => isCurrentWeek(week, now.getTime()));
  if (current) return current;
  if (incomplete.length) return incomplete[0];
  return ordered.filter((week) => week.progress.total > 0).at(-1) ?? ordered[0] ?? null;
}

export function studentWeekContentHref(cohortId: string, weekId: string, section?: LearningSectionDestination | null) {
  const weekHref = `/cohorts/${cohortId}/weeks/${weekId}`;
  if (!section) return `${weekHref}?section=content`;
  const blockFragment = !section.completed && section.lastBlockKey ? `#block-${encodeURIComponent(section.lastBlockKey)}` : "";
  return `${weekHref}/content/${section.id}${blockFragment}`;
}

function isCurrentWeek(week: Pick<LearningWeekCandidate, "startDate" | "endDate">, now: number) {
  const start = week.startDate ? new Date(week.startDate).getTime() : Number.NaN;
  const end = week.endDate ? new Date(week.endDate).getTime() : Number.NaN;
  if (!Number.isFinite(start) && !Number.isFinite(end)) return false;
  return (!Number.isFinite(start) || start <= now) && (!Number.isFinite(end) || end >= now);
}
