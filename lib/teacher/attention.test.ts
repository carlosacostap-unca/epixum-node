// @vitest-environment node
import { describe, expect, it } from "vitest";
import { projectTeacherAttention, sortTeacherAttention, type TeacherAttentionItem } from "./attention";

describe("teacher attention projection", () => {
  it("projects every signal with cohort identity and a canonical action", () => {
    const items = projectTeacherAttention({
      inquiries: [{ id: "i1", cohortId: "c1", cohortName: "Cohorte 1", title: "Duda", authorId: "s1", authorName: "Ana", contextLabel: "Semana 1", updated: "2026-08-01T10:00:00Z" }],
      deliveryRisks: [{ id: "s1:a1", cohortId: "c1", cohortName: "Cohorte 1", studentId: "s1", studentName: "Ana", assignmentId: "a1", assignmentTitle: "TP 1", periodId: "w1", periodLabel: "Semana 1", state: "overdue", dueDate: "2026-07-31" }],
      followUps: [{ id: "f1", cohortId: "c2", cohortName: "Cohorte 2", studentId: "s2", studentName: "Bruno", periodLabel: "Sprint 2", created: "2026-08-01T08:00:00Z" }],
      reviews: [{ id: "r1", cohortId: "c2", cohortName: "Cohorte 2", studentId: "s2", studentName: "Bruno", periodLabel: "Sprint 2", startTime: "2026-08-03T12:00:00Z" }],
      enrollmentRequests: [{ id: "e1", cohortId: "c1", cohortName: "Cohorte 1", personName: "Carla", created: "2026-07-30T12:00:00Z" }],
    });
    expect(new Set(items.map(item => item.type))).toEqual(new Set(["inquiry", "delivery-risk", "follow-up", "review", "enrollment-request"]));
    expect(items.every(item => item.cohortName && item.contextLabel && item.href.startsWith("/"))).toBe(true);
    expect(items.find(item => item.type === "delivery-risk")?.href).toBe("/cohorts/c1/assignments/a1?student=s1");
    expect(items.find(item => item.type === "follow-up")?.href).toBe("/cohorts/c2/students/s2?signal=follow-up");
  });

  it("orders urgency first and timestamps consistently", () => {
    const item = (id: string, urgency: TeacherAttentionItem["urgency"], timestamp: string): TeacherAttentionItem => ({ id, urgency, timestamp, type: "inquiry", cohortId: "c1", cohortName: "C1", contextLabel: "General", title: id, reason: id, href: "/", actionLabel: "Abrir" });
    expect(sortTeacherAttention([item("routine", "routine", "2026-01-01"), item("critical-new", "critical", "2026-02-01"), item("upcoming", "upcoming", "2026-01-01"), item("critical-old", "critical", "2026-01-01")]).map(value => value.id))
      .toEqual(["critical-old", "critical-new", "upcoming", "routine"]);
  });
});

