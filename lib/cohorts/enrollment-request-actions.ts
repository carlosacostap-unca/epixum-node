"use server";

import { revalidatePath } from "next/cache";
import { createAdminServerClient } from "@/lib/pocketbase-server";
import type { Cohort, CohortEnrollment, EnrollmentRequest, StudentAdmission, User } from "@/types";
import { requireStaff } from "./access";
import { ensureEnrollment } from "./actions";
import { assertEnrollmentRequestReviewer, enrollmentRequestInputSchema, hasPendingEnrollmentRequestDuplicate, normalizeDni, planEnrollmentRequestResolution } from "./enrollment-requests";

export type EnrollmentRequestActionResult = { success: true; message: string } | { success: false; error: string };
const success = (message: string): EnrollmentRequestActionResult => ({ success: true, message });
const failure = (error: unknown): EnrollmentRequestActionResult => ({ success: false, error: error instanceof Error ? error.message : "Ocurrió un error inesperado." });

export async function createEnrollmentRequestAction(_previous: EnrollmentRequestActionResult | undefined, formData: FormData): Promise<EnrollmentRequestActionResult> {
  try {
    const parsed = enrollmentRequestInputSchema.parse(Object.fromEntries(formData));
    if (parsed.website) return success("Recibimos tu solicitud para revisión.");
    const pb = await createAdminServerClient();
    const cohort = await pb.collection("cohorts").getOne<Cohort>(parsed.cohortId);
    if (cohort.mode !== "weekly" || cohort.status !== "active") throw new Error("La cohorte seleccionada no admite solicitudes.");

    const [emailMatch, dniMatch] = await Promise.all([
      pb.collection("enrollment_requests").getFirstListItem<EnrollmentRequest>(pb.filter("normalizedEmail = {:email} && cohort = {:cohort} && status = 'pending'", { email: parsed.email, cohort: cohort.id })).catch(() => null),
      pb.collection("enrollment_requests").getFirstListItem<EnrollmentRequest>(pb.filter("dni = {:dni} && cohort = {:cohort} && status = 'pending'", { dni: parsed.dni, cohort: cohort.id })).catch(() => null),
    ]);
    if (hasPendingEnrollmentRequestDuplicate({ emailMatch: Boolean(emailMatch), dniMatch: Boolean(dniMatch) })) {
      return success("Ya existe una solicitud pendiente para esos datos. El equipo docente la revisará.");
    }

    await pb.collection("enrollment_requests").create({
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      dni: parsed.dni,
      birthDate: parsed.birthDate,
      normalizedEmail: parsed.email,
      phone: parsed.phone,
      cohort: cohort.id,
      status: "pending",
    });
    revalidatePath("/staff/enrollment-requests");
    return success("Recibimos tu solicitud. Cuando sea aprobada, podrás ingresar nuevamente con este correo de Google.");
  } catch (error) {
    return failure(error);
  }
}

export async function approveEnrollmentRequestAction(requestId: string): Promise<EnrollmentRequestActionResult> {
  try {
    const reviewer = await requireStaff();
    assertEnrollmentRequestReviewer(reviewer.role);
    const pb = await createAdminServerClient();
    const request = await pb.collection("enrollment_requests").getOne<EnrollmentRequest>(requestId);
    if (request.status === "approved") return success("La solicitud ya estaba aprobada.");
    if (request.status !== "pending") throw new Error("Sólo se pueden aprobar solicitudes pendientes.");
    const cohort = await pb.collection("cohorts").getOne<Cohort>(request.cohort);
    if (cohort.mode !== "weekly" || cohort.status !== "active") throw new Error("La cohorte ya no está activa o no es semanal.");

    const [emailUser, usersWithDni] = await Promise.all([
      pb.collection("users").getFirstListItem<User>(pb.filter("email = {:email}", { email: request.normalizedEmail })).catch(() => null),
      pb.collection("users").getFullList<User>({ filter: "dni != ''" }),
    ]);
    const dniUsers = usersWithDni.filter((user) => normalizeDni(user.dni || "") === request.dni);
    const plan = planEnrollmentRequestResolution({ emailUser, dniUsers });
    if (plan.action === "conflict") throw new Error(`${plan.reason} Requiere revisión administrativa manual.`);

    const reviewedAt = new Date().toISOString();
    if (plan.action === "use_user") {
      const target = emailUser?.id === plan.userId ? emailUser : dniUsers.find((user) => user.id === plan.userId);
      if (!target) throw new Error("No se pudo recuperar la cuenta coincidente.");
      const priorEnrollments = await pb.collection("cohort_enrollments").getFullList<CohortEnrollment>({ filter: pb.filter("user = {:user}", { user: target.id }) });
      await pb.collection("users").update(target.id, {
        email: request.normalizedEmail,
        role: "estudiante",
        firstName: request.firstName,
        lastName: request.lastName,
        name: `${request.firstName} ${request.lastName}`,
        dni: request.dni,
        birthDate: request.birthDate,
        phone: request.phone,
      });
      await ensureEnrollment(target.id, cohort.id, priorEnrollments.length > 0 ? "repeater" : "new");
      await pb.collection("enrollment_requests").update(request.id, { status: "approved", reviewedBy: reviewer.id, reviewedAt, linkedUser: target.id, resolution: `Cuenta existente vinculada por ${plan.matchedBy}.` });
      revalidateRequestViews();
      return success("Solicitud aprobada y estudiante matriculado.");
    }

    let admission = await pb.collection("student_admissions").getFirstListItem<StudentAdmission>(
      pb.filter("normalizedEmail = {:email} && cohort = {:cohort} && status = 'pending'", { email: request.normalizedEmail, cohort: cohort.id }),
    ).catch(() => null);
    if (!admission) {
      admission = await pb.collection("student_admissions").create<StudentAdmission>({
        normalizedEmail: request.normalizedEmail,
        displayName: `${request.firstName} ${request.lastName}`,
        dni: request.dni,
        birthDate: request.birthDate,
        phone: request.phone,
        cohort: cohort.id,
        entryType: "new",
        status: "pending",
      });
    }
    await pb.collection("enrollment_requests").update(request.id, { status: "approved", reviewedBy: reviewer.id, reviewedAt, admission: admission.id, resolution: "Admisión creada para el próximo acceso con Google." });
    revalidateRequestViews();
    return success("Solicitud aprobada. El alumno podrá ingresar con Google y será matriculado automáticamente.");
  } catch (error) {
    return failure(error);
  }
}

export async function rejectEnrollmentRequestAction(requestId: string): Promise<EnrollmentRequestActionResult> {
  try {
    const reviewer = await requireStaff();
    assertEnrollmentRequestReviewer(reviewer.role);
    const pb = await createAdminServerClient();
    const request = await pb.collection("enrollment_requests").getOne<EnrollmentRequest>(requestId);
    if (request.status === "rejected") return success("La solicitud ya estaba rechazada.");
    if (request.status !== "pending") throw new Error("Sólo se pueden rechazar solicitudes pendientes.");
    await pb.collection("enrollment_requests").update(request.id, { status: "rejected", reviewedBy: reviewer.id, reviewedAt: new Date().toISOString(), resolution: "Solicitud rechazada por el personal." });
    revalidateRequestViews();
    return success("Solicitud rechazada.");
  } catch (error) {
    return failure(error);
  }
}

function revalidateRequestViews() {
  revalidatePath("/staff/enrollment-requests");
  revalidatePath("/admin/users");
  revalidatePath("/cohorts");
}
