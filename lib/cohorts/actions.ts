"use server";

import { revalidatePath } from "next/cache";
import { createAdminServerClient } from "@/lib/pocketbase-server";
import type { Cohort, CohortEnrollment, StudentAdmission, User } from "@/types";
import { admissionInputSchema, cohortInputSchema, existingStudentEnrollmentInputSchema, normalizeEmail } from "./domain";
import { requireAdmin } from "./access";
import { bulkEnrollmentCandidateIds, planEnrollmentMutation } from "./enrollment";

export type ActionResult = { success: true; message?: string } | { success: false; error: string };
const ok = (message?: string): ActionResult => ({ success: true, message });
const fail = (error: unknown): ActionResult => ({ success: false, error: error instanceof Error ? error.message : "Ocurrió un error inesperado." });

async function findEnrollment(userId: string, cohortId: string) {
  const pb = await createAdminServerClient();
  return pb.collection("cohort_enrollments").getFirstListItem<CohortEnrollment>(
    pb.filter("user = {:user} && cohort = {:cohort}", { user: userId, cohort: cohortId }),
  ).catch(() => null);
}

export async function ensureEnrollment(userId: string, cohortId: string, entryType: "new" | "repeater") {
  const pb = await createAdminServerClient();
  const existing = await findEnrollment(userId, cohortId);
  const plan = planEnrollmentMutation(existing, entryType);
  if (existing) {
    if (plan.action === "update") await pb.collection("cohort_enrollments").update(existing.id, plan.data);
    return existing.id;
  }
  const created = await pb.collection("cohort_enrollments").create({ user: userId, cohort: cohortId, ...plan.action === "create" ? plan.data : { status: "active", entryType }, enrolledAt: new Date().toISOString() });
  return created.id;
}

export async function createCohortAction(_: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = cohortInputSchema.parse(Object.fromEntries(formData));
    const pb = await createAdminServerClient();
    await pb.collection("cohorts").create({ ...parsed, startDate: parsed.startDate || null, endDate: parsed.endDate || null });
    revalidatePath("/admin/cohorts");
    revalidatePath("/cohorts");
    return ok("Cohorte creada.");
  } catch (error) { return fail(error); }
}

export async function updateCohortAction(cohortId: string, _: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = cohortInputSchema.parse(Object.fromEntries(formData));
    const pb = await createAdminServerClient();
    const current = await pb.collection("cohorts").getOne<Cohort>(cohortId);
    if (current.mode !== parsed.mode) {
      const [sprints, weeks] = await Promise.all([
        pb.collection("sprints").getList(1, 1, { filter: pb.filter("cohort = {:cohort}", { cohort: cohortId }) }),
        pb.collection("weeks").getList(1, 1, { filter: pb.filter("cohort = {:cohort}", { cohort: cohortId }) }),
      ]);
      if (sprints.totalItems + weeks.totalItems > 0) throw new Error("No se puede cambiar la modalidad de una cohorte que ya tiene contenido.");
    }
    await pb.collection("cohorts").update(cohortId, { ...parsed, startDate: parsed.startDate || null, endDate: parsed.endDate || null });
    revalidatePath(`/admin/cohorts/${cohortId}`);
    revalidatePath(`/cohorts/${cohortId}`);
    return ok("Cohorte actualizada.");
  } catch (error) { return fail(error); }
}

export async function registerStudentAction(_: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = admissionInputSchema.parse(Object.fromEntries(formData));
    const pb = await createAdminServerClient();
    await pb.collection("cohorts").getOne(parsed.cohortId);
    const user = await pb.collection("users").getFirstListItem<User>(pb.filter("email = {:email}", { email: normalizeEmail(parsed.email) })).catch(() => null);
    if (user) {
      if (user.role && user.role !== "estudiante") throw new Error("El correo pertenece a un usuario que no es estudiante.");
      await ensureEnrollment(user.id, parsed.cohortId, parsed.entryType);
      if (!user.role) await pb.collection("users").update(user.id, { role: "estudiante" });
      revalidatePath("/admin/users");
      revalidatePath(`/admin/cohorts/${parsed.cohortId}`);
      revalidatePath(`/admin/cohorts/${parsed.cohortId}/enrollments`);
      return ok("Usuario existente inscripto o reactivado sin duplicar su cuenta.");
    }
    const existing = await pb.collection("student_admissions").getFirstListItem<StudentAdmission>(
      pb.filter("normalizedEmail = {:email} && cohort = {:cohort} && status = 'pending'", { email: parsed.email, cohort: parsed.cohortId }),
    ).catch(() => null);
    if (existing) return ok("Ya existía una admisión pendiente para ese correo y cohorte.");
    await pb.collection("student_admissions").create({ normalizedEmail: parsed.email, displayName: parsed.displayName, dni: parsed.dni || null, birthDate: parsed.birthDate || null, phone: parsed.phone || null, cohort: parsed.cohortId, entryType: parsed.entryType, status: "pending" });
    revalidatePath("/admin/users");
    revalidatePath(`/admin/cohorts/${parsed.cohortId}`);
    revalidatePath(`/admin/cohorts/${parsed.cohortId}/enrollments`);
    return ok("Admisión creada. El alumno podrá ingresar con Google.");
  } catch (error) { return fail(error); }
}

export async function enrollExistingStudentAction(cohortId: string, _: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = existingStudentEnrollmentInputSchema.parse(Object.fromEntries(formData));
    const pb = await createAdminServerClient();
    const [cohort, user, existing] = await Promise.all([
      pb.collection("cohorts").getOne<Cohort>(cohortId),
      pb.collection("users").getOne<User>(parsed.userId),
      findEnrollment(parsed.userId, cohortId),
    ]);
    if (user.role !== "estudiante") throw new Error("Sólo se pueden matricular usuarios con rol de estudiante.");
    await ensureEnrollment(user.id, cohort.id, parsed.entryType);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/cohorts/${cohortId}`);
    revalidatePath(`/admin/cohorts/${cohortId}/enrollments`);
    if (existing?.status === "active" && existing.entryType === parsed.entryType) return ok("El estudiante ya estaba matriculado en esta cohorte.");
    if (existing) return ok("Matrícula reactivada y actualizada.");
    return ok("Estudiante matriculado correctamente.");
  } catch (error) { return fail(error); }
}

export async function enrollAllStudentsAction(cohortId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const pb = await createAdminServerClient();
    const [, students, existingEnrollments] = await Promise.all([
      pb.collection("cohorts").getOne<Cohort>(cohortId),
      pb.collection("users").getFullList<User>({ filter: "role = 'estudiante'", sort: "name,email" }),
      pb.collection("cohort_enrollments").getFullList<CohortEnrollment>({ filter: pb.filter("cohort = {:cohort}", { cohort: cohortId }) }),
    ]);
    const candidateIds = bulkEnrollmentCandidateIds(students.map((student) => student.id), existingEnrollments.map((enrollment) => enrollment.user));
    for (const userId of candidateIds) {
      await pb.collection("cohort_enrollments").create({ user: userId, cohort: cohortId, status: "active", entryType: "repeater", enrolledAt: new Date().toISOString() });
    }
    revalidatePath("/admin/users");
    revalidatePath(`/admin/cohorts/${cohortId}`);
    revalidatePath(`/admin/cohorts/${cohortId}/enrollments`);
    const skipped = students.length - candidateIds.length;
    return ok(`${candidateIds.length} estudiante${candidateIds.length === 1 ? "" : "s"} matriculado${candidateIds.length === 1 ? "" : "s"}; ${skipped} ya tenía${skipped === 1 ? "" : "n"} una matrícula.`);
  } catch (error) { return fail(error); }
}

export async function setEnrollmentStatusAction(enrollmentId: string, status: "active" | "completed"): Promise<ActionResult> {
  try {
    await requireAdmin();
    const pb = await createAdminServerClient();
    const enrollment = await pb.collection("cohort_enrollments").getOne<CohortEnrollment>(enrollmentId);
    await pb.collection("cohort_enrollments").update(enrollmentId, { status, completedAt: status === "completed" ? new Date().toISOString() : null });
    revalidatePath("/admin/users");
    revalidatePath(`/admin/cohorts/${enrollment.cohort}`);
    revalidatePath(`/admin/cohorts/${enrollment.cohort}/enrollments`);
    return ok(status === "completed" ? "Estudiante desmatriculado. Se conservó su historial." : "Estudiante rematriculado.");
  } catch (error) { return fail(error); }
}

export async function cancelAdmissionAction(admissionId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const pb = await createAdminServerClient();
    const admission = await pb.collection("student_admissions").getOne<StudentAdmission>(admissionId);
    if (admission.status !== "pending") throw new Error("Sólo se pueden cancelar admisiones pendientes.");
    await pb.collection("student_admissions").update(admissionId, { status: "cancelled" });
    revalidatePath("/admin/users");
    revalidatePath(`/admin/cohorts/${admission.cohort}`);
    revalidatePath(`/admin/cohorts/${admission.cohort}/enrollments`);
    return ok("Admisión cancelada.");
  } catch (error) { return fail(error); }
}
