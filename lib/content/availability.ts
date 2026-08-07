import type { ContentSectionStatus } from "./domain.ts";

export interface ContentAvailabilityContext {
  enrollmentStatus: string | null | undefined;
  cohortStatus: string | null | undefined;
  weekPublicationStatus: string | null | undefined;
  sectionStatus: ContentSectionStatus | string | null | undefined;
  scheduledAt?: string | null;
}

export function isContentSectionAvailable(context: ContentAvailabilityContext, now = new Date()): boolean {
  if (context.enrollmentStatus !== "active" || context.cohortStatus !== "active" || context.weekPublicationStatus !== "published") return false;
  if (context.sectionStatus === "published") return true;
  if (context.sectionStatus !== "scheduled" || !context.scheduledAt) return false;
  const scheduledTime = new Date(context.scheduledAt).getTime();
  return Number.isFinite(scheduledTime) && scheduledTime <= now.getTime();
}

export function contentSectionAvailabilityReason(context: ContentAvailabilityContext, now = new Date()): "available" | "enrollment" | "cohort" | "week" | "section" | "schedule" {
  if (context.enrollmentStatus !== "active") return "enrollment";
  if (context.cohortStatus !== "active") return "cohort";
  if (context.weekPublicationStatus !== "published") return "week";
  if (context.sectionStatus === "published") return "available";
  if (context.sectionStatus === "scheduled") return isContentSectionAvailable(context, now) ? "available" : "schedule";
  return "section";
}
