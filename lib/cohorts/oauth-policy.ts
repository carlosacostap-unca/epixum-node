import type { StudentAdmission, UserRole } from "@/types";

export type OAuthAccessDecision = "allow" | "claim" | "reject";

export function oauthAccessDecision(role: UserRole | undefined, enrollmentCount: number, pendingAdmissionCount: number): OAuthAccessDecision {
  if (role === "admin" || role === "docente" || enrollmentCount > 0) return "allow";
  return pendingAdmissionCount > 0 ? "claim" : "reject";
}

export function admissionProfilePatch(admission: Pick<StudentAdmission, "displayName" | "dni" | "birthDate" | "phone">) {
  return {
    role: "estudiante" as const,
    name: admission.displayName.trim(),
    ...(admission.dni?.trim() ? { dni: admission.dni.trim() } : {}),
    ...(admission.birthDate?.trim() ? { birthDate: admission.birthDate.trim() } : {}),
    ...(admission.phone?.trim() ? { phone: admission.phone.trim() } : {}),
  };
}
