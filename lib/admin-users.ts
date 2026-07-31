import type { CohortEnrollment, User } from "@/types";
export interface AdminUserFilters { search?: string; role?: string; cohort?: string; status?: string; order?: string }
export function filterAndSortAdminUsers(users: User[], enrollmentsByUser: Map<string, CohortEnrollment[]>, query: AdminUserFilters) {
  const search = query.search?.trim().toLocaleLowerCase("es") || "";
  return [...users].filter((user) => !search || `${user.name} ${user.email} ${user.dni || ""}`.toLocaleLowerCase("es").includes(search)).filter((user) => !query.role || user.role === query.role).filter((user) => !query.cohort || (enrollmentsByUser.get(user.id) || []).some((item) => item.cohort === query.cohort)).filter((user) => !query.status || (enrollmentsByUser.get(user.id) || []).some((item) => item.status === query.status)).sort((a, b) => query.order === "email" ? a.email.localeCompare(b.email) : query.order === "role" ? a.role.localeCompare(b.role) : (a.name || a.email).localeCompare(b.name || b.email, "es"));
}
