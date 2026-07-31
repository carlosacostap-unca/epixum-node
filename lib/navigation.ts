import type { Cohort, CohortMode, UserRole } from "@/types";
import { isStaffRole } from "./cohorts/access-policy";

export type NavigationIcon = "home" | "cohorts" | "content" | "inquiries" | "dashboard" | "teams" | "reviews" | "survey" | "requests" | "users" | "settings";

export interface NavigationContext {
  role: UserRole;
  cohort?: Pick<Cohort, "id" | "mode"> | null;
  showCohorts?: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: NavigationIcon;
  match?: string[];
  mobile?: boolean;
  exact?: boolean;
}

const cohortContentHref = (id: string, mode: CohortMode) => `/cohorts/${id}/${mode === "weekly" ? "weeks" : "sprints"}`;

export function getNavigationItems({ role, cohort, showCohorts = true }: NavigationContext): NavigationItem[] {
  const items: NavigationItem[] = [
    { id: "home", label: "Inicio", href: "/", icon: "home", mobile: true },
  ];
  if (showCohorts) items.push({ id: "cohorts", label: "Cohortes", href: "/cohorts", icon: "cohorts", mobile: true, exact: true });

  if (cohort) {
    const root = `/cohorts/${cohort.id}`;
    items.push(
      { id: "content", label: cohort.mode === "weekly" ? "Semanas" : "Sprints", href: cohortContentHref(cohort.id, cohort.mode), icon: "content", mobile: true },
      { id: "inquiries", label: "Consultas", href: `${root}/inquiries`, icon: "inquiries", mobile: true },
    );
    if (isStaffRole(role)) items.push({ id: "dashboard", label: "Tablero", href: `${root}/dashboard`, icon: "dashboard", mobile: true });
    if (cohort.mode === "sprints_and_teams") {
      items.push({ id: "teams", label: role === "estudiante" ? "Mi equipo" : "Equipos", href: `${root}/teams`, icon: "teams" });
      items.push({ id: "reviews", label: "Revisiones", href: `${root}/reviews`, icon: "reviews" });
      if (role === "estudiante") items.push({ id: "survey", label: "Encuesta", href: `${root}/survey`, icon: "survey" });
    }
  }

  if (isStaffRole(role)) items.push({ id: "requests", label: "Solicitudes", href: "/staff/enrollment-requests", icon: "requests" });
  if (role === "admin") items.push(
    { id: "admin-cohorts", label: "Administrar cohortes", href: "/admin/cohorts", icon: "settings" },
    { id: "users", label: "Administrar usuarios", href: "/admin/users", icon: "users" },
  );
  return items;
}

export function isNavigationItemActive(item: NavigationItem, pathname: string) {
  if (item.href === "/") return pathname === "/";
  if (item.exact) return pathname === item.href;
  const candidates = item.match || [item.href];
  return candidates.some(candidate => pathname === candidate || pathname.startsWith(`${candidate}/`));
}

export function getCohortDestination(cohort: Pick<Cohort, "id">) { return `/cohorts/${cohort.id}`; }

export function getBreadcrumbs(pathname: string, cohortName?: string) {
  const labels: Record<string, string> = { cohorts: "Cohortes", weeks: "Semanas", sprints: "Sprints", inquiries: "Consultas", dashboard: "Tablero", teams: "Equipos", reviews: "Revisiones", assessment: "Diagnóstico", "assessment-report": "Reporte del diagnóstico", admin: "Administración", users: "Usuarios", staff: "Equipo docente", "enrollment-requests": "Solicitudes", profile: "Perfil" };
  const segments = pathname.split("/").filter(Boolean);
  const result: Array<{ label: string; href?: string }> = [{ label: "Inicio", href: "/" }];
  let href = "";
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index]; href += `/${segment}`;
    if (segment === "cohorts" && segments[index + 1]) { index += 1; href += `/${segments[index]}`; result.push({ label: cohortName || "Cohorte", href }); continue; }
    if (/^[a-z0-9]{10,}$/i.test(segment)) continue;
    result.push({ label: labels[segment] || segment.replaceAll("-", " "), href });
  }
  if (result.length > 1) delete result[result.length - 1].href;
  return result;
}
