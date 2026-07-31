import { createAdminServerClient, createServerClient } from "@/lib/pocketbase-server";
import type { CohortEnrollment, StudentAdmission, User } from "@/types";
import { normalizeEmail } from "./domain";
import { planEnrollmentMutation } from "./enrollment";
import { admissionProfilePatch, oauthAccessDecision } from "./oauth-policy";

export const UNKNOWN_ACCOUNT_MESSAGE = "Tu correo todavía no fue registrado. Contactá al administrador del curso para solicitar acceso.";

export async function authorizeCurrentOAuthUser() {
  const sessionPb = await createServerClient();
  if (!sessionPb.authStore.isValid || !sessionPb.authStore.record) {
    return { authorized: false as const, error: "La sesión de Google no es válida." };
  }
  const refreshed = await sessionPb.collection("users").authRefresh();
  const user = refreshed.record as unknown as User & { verified?: boolean };
  if (!user.email || user.verified === false) {
    return { authorized: false as const, error: "Google no proporcionó un correo verificado." };
  }

  const adminPb = await createAdminServerClient();
  const email = normalizeEmail(user.email);
  const existingEnrollments = await adminPb.collection("cohort_enrollments").getFullList<CohortEnrollment>({
    filter: adminPb.filter("user = {:user} && status = 'active'", { user: user.id }),
  });
  if (oauthAccessDecision(user.role, existingEnrollments.length, 0) === "allow") {
    return { authorized: true as const, destination: existingEnrollments.length === 1 ? "/" : "/cohorts" };
  }

  const admissions = await adminPb.collection("student_admissions").getFullList<StudentAdmission>({
    filter: adminPb.filter("normalizedEmail = {:email} && status = 'pending'", { email }),
  });
  if (oauthAccessDecision(user.role, existingEnrollments.length, admissions.length) === "reject") return { authorized: false as const, error: UNKNOWN_ACCOUNT_MESSAGE };
  const profilePatch = admissions.reduce((patch, admission) => ({ ...patch, ...admissionProfilePatch(admission) }), {});
  await adminPb.collection("users").update(user.id, profilePatch);

  for (const admission of admissions) {
    const existing = await adminPb.collection("cohort_enrollments").getFirstListItem<CohortEnrollment>(
      adminPb.filter("user = {:user} && cohort = {:cohort}", { user: user.id, cohort: admission.cohort }),
    ).catch(() => null);
    const plan = planEnrollmentMutation(existing, admission.entryType);
    if (plan.action === "create") await adminPb.collection("cohort_enrollments").create({ user: user.id, cohort: admission.cohort, ...plan.data, enrolledAt: new Date().toISOString() });
    if (plan.action === "update" && existing) await adminPb.collection("cohort_enrollments").update(existing.id, plan.data);
    await adminPb.collection("student_admissions").update(admission.id, { status: "claimed", claimedBy: user.id, claimedAt: new Date().toISOString() });
  }
  return { authorized: true as const, destination: admissions.length === 1 ? "/" : "/cohorts" };
}
