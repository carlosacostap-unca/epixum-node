import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import type PocketBase from "pocketbase";
import type { Cohort, CohortEnrollment, User } from "@/types";
import { createServerClient, getCurrentUser } from "@/lib/pocketbase-server";
import { assertModeCapability } from "./domain";
import { isStaffRole, isStudentRole } from "./access-policy";

export const LEGACY_COHORT_SLUG = process.env.LEGACY_COHORT_SLUG || "nodejs-legacy";

export const getLegacyCohort = cache(async () => {
  const pb = await createServerClient();
  return pb.collection("cohorts").getFirstListItem<Cohort>(pb.filter("slug = {:slug}", { slug: LEGACY_COHORT_SLUG }));
});

export const getAccessibleCohorts = cache(async (user?: User | null) => {
  const currentUser = user ?? await getCurrentUser();
  if (!currentUser) return [];
  const pb = await createServerClient();
  if (isStaffRole(currentUser.role)) {
    return pb.collection("cohorts").getFullList<Cohort>({ sort: "-status,startDate,name" });
  }
  if (!isStudentRole(currentUser.role)) return [];
  const enrollments = await pb.collection("cohort_enrollments").getFullList<CohortEnrollment>({
    filter: pb.filter("user = {:user} && status = 'active'", { user: currentUser.id }), expand: "cohort", sort: "-enrolledAt",
  });
  return enrollments.map((item) => item.expand?.cohort).filter((cohort): cohort is Cohort => Boolean(cohort));
});

export interface CohortAccessContext {
  pb: PocketBase;
  user: User;
  cohort: Cohort;
  enrollment: CohortEnrollment | null;
  canMutateStudentWork: boolean;
}

export const getCohortAccess = cache(async (cohortId: string): Promise<CohortAccessContext | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const pb = await createServerClient();
  const cohort = await pb.collection("cohorts").getOne<Cohort>(cohortId).catch(() => null);
  if (!cohort) return null;
  if (isStaffRole(user.role)) {
    return { pb, user, cohort, enrollment: null, canMutateStudentWork: false };
  }
  if (!isStudentRole(user.role)) return null;
  const enrollment = await pb.collection("cohort_enrollments").getFirstListItem<CohortEnrollment>(
    pb.filter("user = {:user} && cohort = {:cohort} && status = 'active'", { user: user.id, cohort: cohort.id }),
  ).catch(() => null);
  if (!enrollment) return null;
  return { pb, user, cohort, enrollment, canMutateStudentWork: enrollment.status === "active" };
});

export async function requireCohortAccess(cohortId: string, options?: { capability?: string; activeEnrollment?: boolean }) {
  const context = await getCohortAccess(cohortId);
  if (!context) notFound();
  if (options?.capability) assertModeCapability(context.cohort.mode, options.capability);
  if (options?.activeEnrollment && context.user.role === "estudiante" && !context.canMutateStudentWork) {
    throw new Error("La inscripción finalizada permite consultar el historial, pero no realizar nuevas operaciones.");
  }
  return context;
}

export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isStaffRole(user.role)) notFound();
  return user;
}

export async function requireCohortStaffAccess(cohortId: string) {
  const context = await requireCohortAccess(cohortId);
  if (!isStaffRole(context.user.role)) redirect("/");
  return context;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") notFound();
  return user;
}
