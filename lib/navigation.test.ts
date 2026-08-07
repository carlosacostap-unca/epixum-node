// @vitest-environment node
import { describe, expect, it } from "vitest";
import { getBreadcrumbs, getCohortDestination, getNavigationItems, isFocusedLearningPath, isNavigationItemActive } from "./navigation";

const weekly = { id: "abcdefghijklmno", mode: "weekly" as const };
const historical = { id: "pqrstuvwxyzabcd", mode: "sprints_and_teams" as const };

describe("role navigation", () => {
  it("keeps administrative destinations away from students", () => {
    const ids = getNavigationItems({ role: "estudiante", cohort: weekly }).map(item => item.id);
    expect(ids).toContain("content"); expect(ids).toContain("inquiries");
    expect(ids).not.toContain("dashboard"); expect(ids).not.toContain("requests"); expect(ids).not.toContain("users");
  });

  it("provides teacher operations without administrator-only users", () => {
    const ids = getNavigationItems({ role: "docente", cohort: weekly }).map(item => item.id);
    expect(ids).toEqual(expect.arrayContaining(["content", "inquiries", "dashboard", "requests"]));
    expect(ids).not.toContain("users");
  });

  it("provides complete administrator navigation", () => {
    const ids = getNavigationItems({ role: "admin", cohort: historical }).map(item => item.id);
    expect(ids).toEqual(expect.arrayContaining(["dashboard", "teams", "reviews", "requests", "admin-cohorts", "users"]));
  });

  it("builds mode-aware content destinations and active state", () => {
    const weeklyContent = getNavigationItems({ role: "estudiante", cohort: weekly }).find(item => item.id === "content")!;
    const sprintContent = getNavigationItems({ role: "estudiante", cohort: historical }).find(item => item.id === "content")!;
    expect(weeklyContent.href).toBe("/cohorts/abcdefghijklmno/weeks");
    expect(sprintContent.href).toBe("/cohorts/pqrstuvwxyzabcd/sprints");
    expect(isNavigationItemActive(weeklyContent, "/cohorts/abcdefghijklmno/weeks/week-1")).toBe(true);
    const cohorts = getNavigationItems({ role: "estudiante", cohort: weekly }).find(item => item.id === "cohorts")!;
    expect(isNavigationItemActive(cohorts, "/cohorts/abcdefghijklmno/weeks")).toBe(false);
  });

  it("keeps historical student tools inside the selected cohort", () => {
    const items = getNavigationItems({ role: "estudiante", cohort: historical });
    expect(items.find(item => item.id === "teams")?.href).toBe("/cohorts/pqrstuvwxyzabcd/teams");
    expect(items.find(item => item.id === "survey")?.href).toBe("/cohorts/pqrstuvwxyzabcd/survey");
  });

  it("omits the cohort destination when a student has no cohort to switch to", () => {
    const ids = getNavigationItems({ role: "estudiante", cohort: weekly, showCohorts: false }).map(item => item.id);
    expect(ids).not.toContain("cohorts");
    expect(ids).toEqual(expect.arrayContaining(["home", "content", "inquiries"]));
  });

  it("uses role-specific safe switch destinations", () => {
    expect(getCohortDestination(weekly)).toBe("/cohorts/abcdefghijklmno");
    expect(getCohortDestination(weekly, "docente")).toBe("/cohorts/abcdefghijklmno/dashboard");
    expect(getCohortDestination(weekly, "admin")).toBe("/cohorts/abcdefghijklmno/dashboard");
  });

  it("recognizes only canonical section readers as focused learning routes", () => {
    expect(isFocusedLearningPath("/cohorts/cohort/weeks/week/content/section")).toBe(true);
    expect(isFocusedLearningPath("/cohorts/cohort/weeks/week/content/section/")).toBe(true);
    expect(isFocusedLearningPath("/cohorts/cohort/weeks/week?section=content")).toBe(false);
    expect(isFocusedLearningPath("/cohorts/cohort/weeks/week/content/manage")).toBe(false);
  });

  it("builds human-readable breadcrumbs without record ids", () => {
    const breadcrumbs = getBreadcrumbs("/cohorts/abcdefghijklmno/weeks/1234567890abc", "Node Cohorte 6");
    expect(breadcrumbs.map(item => item.label)).toEqual(["Inicio", "Node Cohorte 6", "Semanas"]);
    expect(breadcrumbs[1].href).toBe("/cohorts/abcdefghijklmno");
  });

  it("labels teacher attention and student overview breadcrumbs", () => {
    expect(getBreadcrumbs("/staff/attention").map(item => item.label)).toEqual(["Inicio", "Equipo docente", "Atención docente"]);
    expect(getBreadcrumbs("/cohorts/abcdefghijklmno/students/student123456789", "Node Cohorte 6").map(item => item.label)).toEqual(["Inicio", "Node Cohorte 6", "Estudiantes"]);
  });
});
