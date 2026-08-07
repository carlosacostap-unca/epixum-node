// @vitest-environment node
import { describe, expect, it } from "vitest";
import { inquiryContext, safeTeacherReturnHref, staffCohortHref, teacherAssignmentHref, teacherDashboardHref, teacherInquiriesHref, teacherStudentHref } from "./routes";

describe("teacher route contracts", () => {
  it("uses the dashboard as canonical staff cohort destination", () => {
    expect(staffCohortHref("cohort-1")).toBe("/cohorts/cohort-1/dashboard");
  });

  it("preserves supported dashboard filters", () => {
    expect(teacherDashboardHref("cohort-1", { period: "week-1", progress: "pending", status: "completed", search: "Ana", detail: "attention" }))
      .toBe("/cohorts/cohort-1/dashboard?period=week-1&progress=pending&status=completed&search=Ana&detail=attention");
  });

  it("encodes exact inquiry and evidence context", () => {
    expect(inquiryContext("week", "week-1")).toBe("week:week-1");
    expect(teacherInquiriesHref("cohort-1", { status: "pending", academicContext: inquiryContext("week", "week-1") }))
      .toBe("/cohorts/cohort-1/inquiries?status=pending&context=week%3Aweek-1");
    expect(teacherAssignmentHref("cohort-1", "assignment-1", "student-1"))
      .toBe("/cohorts/cohort-1/assignments/assignment-1?student=student-1");
  });

  it("allows only same-cohort return destinations", () => {
    const dashboard = "/cohorts/cohort-1/dashboard?period=week-1";
    expect(teacherStudentHref("cohort-1", "student-1", { returnTo: dashboard })).toContain(encodeURIComponent(dashboard));
    expect(safeTeacherReturnHref(dashboard, "cohort-1")).toBe(dashboard);
    expect(safeTeacherReturnHref("/cohorts/cohort-2/dashboard", "cohort-1")).toBe("/cohorts/cohort-1/dashboard");
    expect(safeTeacherReturnHref("https://example.com", "cohort-1")).toBe("/cohorts/cohort-1/dashboard");
    expect(safeTeacherReturnHref("//example.com", "cohort-1")).toBe("/cohorts/cohort-1/dashboard");
  });
});

