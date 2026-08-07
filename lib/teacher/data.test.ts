// @vitest-environment node
import { describe, expect, it } from "vitest";
import { loadTeacherAttentionData, loadTeacherStudentOverview, TeacherStudentOverviewNotFoundError, type TeacherDataClient } from "./data";
import type { Cohort } from "@/types";
import { isStaffRole } from "@/lib/cohorts/access-policy";

const cohort = record({ id: "c1", name: "Cohorte 1", slug: "c1", mode: "weekly", status: "active" }) as Cohort;

describe("teacher data loaders", () => {
  it("keeps the overview restricted to teacher and administrator roles", () => {
    expect(isStaffRole("docente")).toBe(true); expect(isStaffRole("admin")).toBe(true); expect(isStaffRole("estudiante")).toBe(false);
  });
  it("keeps partial source failures visible instead of reporting all clear", async () => {
    const pb = fakeClient({ inquiries: new Error("offline") });
    const data = await loadTeacherAttentionData(pb, [cohort], new Date("2026-08-02T12:00:00Z"));
    expect(data.sources.inquiries.available).toBe(false);
    expect(data.sources.inquiries.count).toBe(0);
    expect(data.allClear).toBe(false);
    expect(Object.values(data.sources).filter(source => source.available)).toHaveLength(4);
  });

  it("uses a fixed batched request count as cohort and item volume grows", async () => {
    let listCalls = 0;
    const pb: TeacherDataClient = {
      filter(template: string) { return template; },
      collection() { return { async getFullList<T>() { listCalls += 1; return [] as T[]; }, async getFirstListItem<T>() { throw new Error("unused"); } }; },
    };
    const cohorts = Array.from({ length: 12 }, (_, index) => record({ id: `cohort-${index}`, name: `Cohorte ${index}`, slug: `c-${index}`, mode: index % 2 ? "weekly" : "sprints_and_teams", status: "active" }) as Cohort);
    await loadTeacherAttentionData(pb, cohorts, new Date("2026-08-02T12:00:00Z"));
    expect(listCalls).toBe(9);
  });

  it("rejects a student without a visible cohort enrollment", async () => {
    const pb = fakeClient({}, { enrollment: null });
    await expect(loadTeacherStudentOverview(pb, cohort, "student-1")).rejects.toBeInstanceOf(TeacherStudentOverviewNotFoundError);
  });

  it("defensively excludes cross-cohort overview records", async () => {
    const student = record({ id: "student-1", name: "Ana", email: "ana@example.com", username: "ana", role: "estudiante" });
    const enrollment = record({ id: "en1", cohort: "c1", user: "student-1", status: "active", entryType: "new", enrolledAt: "2026-01-01", expand: { user: student } });
    const pb = fakeClient({
      weeks: [record({ id: "w1", cohort: "c1", number: 1, title: "Semana 1", publicationStatus: "published" })],
      assignments: [record({ id: "a1", title: "TP 1", week: "w1" }), record({ id: "a2", title: "Ajeno", week: "other" })],
      deliveries: [record({ id: "d1", student: "student-1", assignment: "a1", repositoryUrl: "https://github.com/a/b" }), record({ id: "d2", student: "student-1", assignment: "a2", repositoryUrl: "https://github.com/a/c" })],
      inquiries: [record({ id: "i1", cohort: "c1", author: "student-1", title: "Duda", status: "Pendiente" }), record({ id: "i2", cohort: "c2", author: "student-1", title: "Ajena", status: "Pendiente" })],
    }, { enrollment });
    const data = await loadTeacherStudentOverview(pb, cohort, "student-1");
    expect(data.assignments.map(row => row.id)).toEqual(["a1"]);
    expect(data.sources.deliveries.data.map(row => row.id)).toEqual(["d1"]);
    expect(data.sources.inquiries.data.map(row => row.id)).toEqual(["i1"]);
  });
});

function fakeClient(collections: Record<string, unknown[] | Error> = {}, options: { enrollment?: unknown } = {}): TeacherDataClient {
  return {
    filter(template: string) { return template; },
    collection(name: string) {
      return {
        async getFullList<T>() { const value = collections[name] ?? []; if (value instanceof Error) throw value; return value as T[]; },
        async getFirstListItem<T>() { if (options.enrollment === null) throw new Error("missing"); return (options.enrollment ?? null) as T; },
      };
    },
  };
}

function record<T extends Record<string, unknown>>(value: T) { return { collectionId: "test", collectionName: "test", created: "2026-01-01T00:00:00Z", updated: "2026-01-01T00:00:00Z", ...value }; }
