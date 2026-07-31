import type { CohortEnrollment, EnrollmentEntryType } from "@/types";

export type EnrollmentMutation =
  | { action: "create"; data: { status: "active"; entryType: EnrollmentEntryType } }
  | { action: "update"; data: { status: "active"; entryType: EnrollmentEntryType; completedAt: null } }
  | { action: "none" };

export function planEnrollmentMutation(existing: Pick<CohortEnrollment, "status" | "entryType"> | null, entryType: EnrollmentEntryType): EnrollmentMutation {
  if (!existing) return { action: "create", data: { status: "active", entryType } };
  if (existing.status === "active" && existing.entryType === entryType) return { action: "none" };
  return { action: "update", data: { status: "active", entryType, completedAt: null } };
}

export function bulkEnrollmentCandidateIds(studentIds: string[], existingEnrollmentUserIds: string[]) {
  const existing = new Set(existingEnrollmentUserIds);
  return [...new Set(studentIds)].filter((userId) => !existing.has(userId));
}
