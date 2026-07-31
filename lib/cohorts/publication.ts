import type { WeekPublicationStatus } from "@/types";

export function weekPublicationPatch(publish: boolean, now = new Date()) {
  return publish
    ? { publicationStatus: "published" as const, publishedAt: now.toISOString() }
    : { publicationStatus: "draft" as const, publishedAt: null };
}

export function canStudentViewWeek(status: WeekPublicationStatus) {
  return status === "published";
}
