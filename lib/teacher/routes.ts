import type { AnalyticsFilters } from "@/lib/analytics";

export type InquiryContextKind = "week" | "sprint" | "class" | "assignment";
export type DashboardContext = Partial<Pick<AnalyticsFilters, "period" | "progress" | "status" | "search" | "detail">>;

export function staffCohortHref(cohortId: string) {
  return `/cohorts/${cohortId}/dashboard`;
}

export function teacherDashboardHref(cohortId: string, context: DashboardContext = {}) {
  return withSearch(staffCohortHref(cohortId), context);
}

export function inquiryContext(kind: InquiryContextKind, id: string) {
  return `${kind}:${id}`;
}

export function teacherInquiriesHref(cohortId: string, context: { status?: "pending" | "resolved"; academicContext?: string; search?: string } = {}) {
  return withSearch(`/cohorts/${cohortId}/inquiries`, {
    status: context.status,
    context: context.academicContext,
    search: context.search,
  });
}

export function teacherStudentHref(cohortId: string, studentId: string, options: { returnTo?: string; signal?: string } = {}) {
  return withSearch(`/cohorts/${cohortId}/students/${studentId}`, {
    returnTo: options.returnTo,
    signal: options.signal,
  });
}

export function teacherAssignmentHref(cohortId: string, assignmentId: string, studentId?: string) {
  return withSearch(`/cohorts/${cohortId}/assignments/${assignmentId}`, { student: studentId });
}

export function safeTeacherReturnHref(value: string | string[] | undefined, cohortId: string) {
  const fallback = staffCohortHref(cohortId);
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  const [pathname] = value.split(/[?#]/, 1);
  const cohortRoot = `/cohorts/${cohortId}`;
  if (pathname !== cohortRoot && !pathname.startsWith(`${cohortRoot}/`)) return fallback;
  return value;
}

function withSearch(pathname: string, values: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value && value !== "all") params.set(key, value);
  return params.size ? `${pathname}?${params.toString()}` : pathname;
}
