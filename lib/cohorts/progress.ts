import type { Inquiry } from "@/types";

export type AcademicProgressStatus = "complete" | "pending" | "empty";

export function academicProgressStatus(delivered: number, total: number): AcademicProgressStatus {
  if (total === 0) return "empty";
  return delivered === total ? "complete" : "pending";
}

export function inquiryStatusCount(inquiries: Pick<Inquiry, "week" | "status">[], weekId: string | undefined, status: Inquiry["status"]) {
  return inquiries.filter(item => item.week === weekId && item.status === status).length;
}

export function activeEnrollmentUserIds(enrollments: { user: string; cohort: string; status: string }[], cohortId: string) {
  return enrollments.filter(item => item.cohort === cohortId && item.status === "active").map(item => item.user);
}
