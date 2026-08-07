// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { ProgressRow } from "@/components/analytics/ProgressMatrix";
import { teacherProgressPopulation } from "./analytics";

const rows: ProgressRow[] = [
  { id: "complete", name: "Ana", cells: [{ periodId: "w1", status: "complete", completed: 1, total: 1 }, { periodId: "w2", status: "empty", completed: 0, total: 0 }] },
  { id: "attention", name: "Bruno", cells: [{ periodId: "w1", status: "pending", completed: 0, total: 1 }, { periodId: "w2", status: "empty", completed: 0, total: 0 }] },
  { id: "empty", name: "Carla", cells: [{ periodId: "w1", status: "empty", completed: 0, total: 0 }] },
];

describe("teacher analytics populations", () => {
  it("reconciles complete and attention counts with their exact details", () => {
    const summary = teacherProgressPopulation(rows, { progress: "all", followUpIds: new Set(["attention"]) });
    expect(summary.complete).toBe(1); expect(summary.attention).toBe(1); expect(summary.followUp).toBe(1);
    expect(teacherProgressPopulation(rows, { detail: "complete" }).detailRows.map(row => row.id)).toEqual(["complete"]);
    expect(teacherProgressPopulation(rows, { detail: "attention" }).detailRows.map(row => row.id)).toEqual(["attention"]);
    expect(teacherProgressPopulation(rows, { detail: "follow-up", followUpIds: new Set(["attention"]) }).detailRows.map(row => row.id)).toEqual(["attention"]);
  });

  it("does not classify an empty period as complete or attention", () => {
    const summary = teacherProgressPopulation([rows[2]], {});
    expect(summary).toMatchObject({ complete: 0, attention: 0 });
  });
});
