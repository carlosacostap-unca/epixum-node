// @vitest-environment node
import { describe, expect, it } from "vitest";
import { projectTeacherDeliveryStates } from "./delivery-state";

const now = new Date("2026-08-02T15:00:00.000Z");
const students = [{ id: "student-1" }, { id: "student-2" }];

describe("teacher delivery projection", () => {
  it("derives temporal boundaries and lets a delivery win", () => {
    const result = projectTeacherDeliveryStates({
      now,
      students,
      periods: [
        { id: "past", cohort: "c1", endDate: "2026-08-01" },
        { id: "today", cohort: "c1", endDate: "2026-08-02" },
        { id: "seven", cohort: "c1", endDate: "2026-08-09" },
        { id: "later", cohort: "c1", endDate: "2026-08-10" },
        { id: "none", cohort: "c1" },
      ],
      assignments: [
        { id: "a-past", week: "past" }, { id: "a-today", week: "today" }, { id: "a-seven", week: "seven" },
        { id: "a-later", week: "later" }, { id: "a-none", week: "none" },
      ],
      deliveries: [{ id: "d1", assignment: "a-past", student: "student-1" }],
      cohortId: "c1",
    });
    const state = (studentId: string, assignmentId: string) => result.pairs.find(pair => pair.studentId === studentId && pair.assignmentId === assignmentId)?.state;
    expect(state("student-1", "a-past")).toBe("submitted");
    expect(state("student-2", "a-past")).toBe("overdue");
    expect(state("student-1", "a-today")).toBe("due-soon");
    expect(state("student-1", "a-seven")).toBe("due-soon");
    expect(state("student-1", "a-later")).toBe("pending");
    expect(state("student-1", "a-none")).toBe("pending");
    expect(result.counts.unscheduled).toBe(2);
  });

  it("deduplicates deliveries and excludes unrelated cohorts and periods", () => {
    const result = projectTeacherDeliveryStates({
      now, students: [{ id: "student-1" }], cohortId: "c1", periodIds: ["w1"],
      periods: [{ id: "w1", cohort: "c1", endDate: "2026-08-03" }, { id: "w2", cohort: "c2", endDate: "2026-08-03" }],
      assignments: [{ id: "a1", week: "w1" }, { id: "a2", week: "w2" }, { id: "orphan" }],
      deliveries: [{ id: "d1", assignment: "a1", student: "student-1" }, { id: "d2", assignment: "a1", student: "student-1" }, { id: "d3", assignment: "a2", student: "student-1" }],
    });
    expect(result.pairs).toHaveLength(1);
    expect(result.counts).toMatchObject({ total: 1, submitted: 1 });
  });

  it("does not create pairs for an empty period", () => {
    const result = projectTeacherDeliveryStates({ now, students, periods: [{ id: "w1", cohort: "c1" }], assignments: [], deliveries: [], cohortId: "c1" });
    expect(result.pairs).toEqual([]);
    expect(result.counts.total).toBe(0);
  });

  it("projects a representative 10,000-pair workload within the local budget", () => {
    const population = Array.from({ length: 500 }, (_, index) => ({ id: `student-${index}` }));
    const assignments = Array.from({ length: 20 }, (_, index) => ({ id: `assignment-${index}`, week: "w1" }));
    const started = performance.now();
    const result = projectTeacherDeliveryStates({ now, students: population, periods: [{ id: "w1", cohort: "c1", endDate: "2026-08-09" }], assignments, deliveries: [], cohortId: "c1" });
    const elapsedMs = performance.now() - started;
    expect(result.pairs).toHaveLength(10_000);
    expect(elapsedMs).toBeLessThan(2_000);
  });
});
