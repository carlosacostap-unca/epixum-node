export type SearchValue = string | string[] | undefined;
export type LegacySearchParams = Record<string, SearchValue>;

export const legacyRouteInventory = [
  { source: "/sprints", destination: "/cohorts/:cohortId/sprints", strategy: "legacy-cohort" },
  { source: "/sprints/:sprintId", destination: "/cohorts/:cohortId/sprints/:sprintId", strategy: "entity-cohort" },
  { source: "/classes/:classId", destination: "/cohorts/:cohortId/classes/:classId", strategy: "academic-parent" },
  { source: "/assignments/:assignmentId", destination: "/cohorts/:cohortId/assignments/:assignmentId", strategy: "academic-parent" },
  { source: "/teams", destination: "/cohorts/:cohortId/teams", strategy: "legacy-cohort" },
  { source: "/teams/view", destination: "/cohorts/:cohortId/teams", strategy: "legacy-cohort" },
  { source: "/teams/view/:teamId", destination: "/cohorts/:cohortId/teams?team=:teamId", strategy: "entity-cohort" },
  { source: "/teams/restructure", destination: "/cohorts/:cohortId/teams", strategy: "legacy-cohort" },
  { source: "/my-team", destination: "/cohorts/:cohortId/teams", strategy: "legacy-cohort" },
  { source: "/reviews", destination: "/cohorts/:cohortId/reviews", strategy: "legacy-cohort" },
  { source: "/reviews/:sprintId", destination: "/cohorts/:cohortId/reviews/:sprintId", strategy: "entity-cohort" },
  { source: "/reviews/detail/:reviewId", destination: "/cohorts/:cohortId/reviews/appointments/:reviewId", strategy: "entity-cohort" },
  { source: "/inquiries", destination: "/cohorts/:cohortId/inquiries", strategy: "legacy-cohort" },
  { source: "/inquiries/new", destination: "/cohorts/:cohortId/inquiries/new", strategy: "legacy-cohort" },
  { source: "/inquiries/:inquiryId", destination: "/cohorts/:cohortId/inquiries/:inquiryId", strategy: "entity-cohort" },
  { source: "/dashboard", destination: "/cohorts/:cohortId/dashboard", strategy: "legacy-cohort" },
  { source: "/dashboard-cursada", destination: "/cohorts/:cohortId/dashboard", strategy: "legacy-cohort" },
  { source: "/dashboard/:sprintId/:view", destination: "/cohorts/:cohortId/dashboard?period=:sprintId", strategy: "entity-cohort" },
  { source: "/student-form", destination: "/cohorts/:cohortId/survey", strategy: "legacy-cohort" },
] as const;

export function cohortPath(cohortId: string, suffix = "") {
  return `/cohorts/${encodeURIComponent(cohortId)}${suffix}`;
}

export function appendSearchParams(path: string, params: LegacySearchParams, omitted: string[] = []) {
  const result = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(params)) {
    if (omitted.includes(key) || rawValue === undefined) continue;
    for (const value of Array.isArray(rawValue) ? rawValue : [rawValue]) result.append(key, value);
  }
  const query = result.toString();
  return query ? `${path}${path.includes("?") ? "&" : "?"}${query}` : path;
}

export function requireMatchingCohort(entityCohortId: string | undefined, requestedCohortId?: string) {
  if (!entityCohortId || (requestedCohortId && requestedCohortId !== entityCohortId)) return null;
  return entityCohortId;
}

export function legacyDashboardDestination(cohortId: string, sprintId?: string, view?: string) {
  const params: LegacySearchParams = {};
  if (sprintId) params.period = sprintId;
  if (view) params.detail = view;
  return appendSearchParams(cohortPath(cohortId, "/dashboard"), params);
}
