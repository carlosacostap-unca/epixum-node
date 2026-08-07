import assert from "node:assert/strict";
import test from "node:test";
import { aggregateTeachingContent } from "./teaching-analytics.ts";
import type { ContentActivityAttempt, ContentSectionProgress } from "@/types";

const base = { created: "", updated: "", collectionId: "", collectionName: "" };
test("agrega aperturas, finalización y dominio sin confundir visualización con lectura", () => {
  const progress = [{ ...base, id: "p1", cohort: "c", week: "w", section: "s", student: "u1", firstViewedAt: "2026-01-01", lastViewedAt: "2026-01-02", viewCount: 2, masteredActivities: { activity: "ra" }, requirementsRevision: "rr", completedAt: "2026-01-02" }] satisfies ContentSectionProgress[];
  const attempts = [{ ...base, id: "a1", cohort: "c", week: "w", section: "s", sectionRevision: "rev", student: "u1", activityKey: "activity", activityRevision: "ra", activityKind: "question", response: {}, outcome: "correct", attemptKey: "attempt_0000000001", attemptedAt: "2026-01-02" }] satisfies ContentActivityAttempt[];
  const result = aggregateTeachingContent({ students: [{ id: "u1", name: "Ana", email: "ana@example.com" }, { id: "u2", name: "Bruno", email: "bruno@example.com" }], sections: [{ id: "s", week: "w", position: 1, title: "Inicio", requirementsRevision: "rr", activities: [{ activityKey: "activity", blockKey: "question", kind: "question", required: true, activityRevision: "ra" }] }], progress, attempts });
  assert.deepEqual({ opened: result.sections[0].opened, completed: result.sections[0].completed, pending: result.sections[0].pending }, { opened: 1, completed: 1, pending: 1 });
  assert.deepEqual({ participants: result.sections[0].activities[0].participants, attempts: result.sections[0].activities[0].attempts, mastered: result.sections[0].activities[0].mastered }, { participants: 1, attempts: 1, mastered: 1 });
  assert.equal(result.students[1].opened, 0);
});

test("una revisión de requisitos nueva deja de contar finalización anterior", () => {
  const progress = [{ ...base, id: "p1", cohort: "c", week: "w", section: "s", student: "u1", firstViewedAt: "2026-01-01", lastViewedAt: "2026-01-02", viewCount: 1, masteredActivities: {}, requirementsRevision: "old", completedAt: "2026-01-02" }] satisfies ContentSectionProgress[];
  const result = aggregateTeachingContent({ students: [{ id: "u1", name: "Ana", email: "ana@example.com" }], sections: [{ id: "s", week: "w", position: 1, title: "Inicio", requirementsRevision: "new", activities: [] }], progress, attempts: [] });
  assert.equal(result.sections[0].completed, 0);
  assert.equal(result.students[0].sections[0].completed, false);
});
