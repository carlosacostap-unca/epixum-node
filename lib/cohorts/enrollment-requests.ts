import { z } from "zod";
import { normalizedEmailSchema } from "./domain.ts";

export const normalizeDni = (value: string) => value.replace(/[^0-9]/g, "");

export const enrollmentRequestInputSchema = z.object({
  firstName: z.string().trim().min(2, "Ingresá tu nombre.").max(80),
  lastName: z.string().trim().min(2, "Ingresá tu apellido.").max(80),
  dni: z.string().trim().transform(normalizeDni).pipe(z.string().regex(/^\d{6,12}$/, "Ingresá un DNI válido.")),
  birthDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresá una fecha válida.").refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.valueOf()) && date < new Date();
  }, "La fecha de nacimiento debe ser anterior a hoy."),
  email: normalizedEmailSchema,
  phone: z.string().trim().min(6, "Ingresá un teléfono de contacto.").max(50).regex(/^[+0-9()\-\s]+$/, "Ingresá un teléfono válido."),
  cohortId: z.string().trim().min(1, "Seleccioná una cohorte."),
  website: z.string().max(200).optional().default(""),
});

export interface IdentityCandidate {
  id: string;
  role?: string;
}

export type EnrollmentRequestResolutionPlan =
  | { action: "create_admission" }
  | { action: "use_user"; userId: string; matchedBy: "email" | "dni" | "email_and_dni" }
  | { action: "conflict"; reason: string };

export function planEnrollmentRequestResolution(input: { emailUser?: IdentityCandidate | null; dniUsers: IdentityCandidate[] }): EnrollmentRequestResolutionPlan {
  const { emailUser, dniUsers } = input;
  if (dniUsers.length > 1) return { action: "conflict", reason: "El DNI coincide con más de una cuenta." };
  const dniUser = dniUsers[0];
  if (emailUser && dniUser && emailUser.id !== dniUser.id) return { action: "conflict", reason: "El correo y el DNI pertenecen a cuentas diferentes." };
  const candidate = emailUser || dniUser;
  if (!candidate) return { action: "create_admission" };
  if (candidate.role && candidate.role !== "estudiante") return { action: "conflict", reason: "La identidad coincide con una cuenta de personal." };
  return { action: "use_user", userId: candidate.id, matchedBy: emailUser && dniUser ? "email_and_dni" : emailUser ? "email" : "dni" };
}

export function hasPendingEnrollmentRequestDuplicate(input: { emailMatch: boolean; dniMatch: boolean }) {
  return input.emailMatch || input.dniMatch;
}

export function assertEnrollmentRequestReviewer(role: string) {
  if (role !== "docente" && role !== "admin") throw new Error("No autorizado para revisar solicitudes.");
}
