import type { UserRole } from "../../types";

export function isStaffRole(role: UserRole | string | null | undefined) {
  return role === "docente" || role === "admin";
}

export function isStudentRole(role: UserRole | string | null | undefined) {
  return role === "estudiante";
}
