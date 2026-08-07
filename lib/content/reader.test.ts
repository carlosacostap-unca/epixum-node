import assert from "node:assert/strict";
import test from "node:test";
import { chooseContinueSection, chooseLearningWeek, readerNavigation, studentWeekContentHref, weeklyCompletion } from "./reader.ts";

test("la navegación usa sólo las secciones disponibles y respeta el orden", () => {
  const navigation = readerNavigation([{ id: "third", position: 3 }, { id: "first", position: 1 }], "first");
  assert.equal(navigation.previous, null);
  assert.equal(navigation.next?.id, "third");
  assert.equal(navigation.position, 1);
  assert.equal(navigation.total, 2);
  assert.throws(() => readerNavigation([{ id: "first", position: 1 }], "hidden"), /no pertenece/);
});

test("reanuda la sección incompleta vista más recientemente", () => {
  const sections = [{ id: "a", position: 1, completed: false, lastViewedAt: "2026-01-01" }, { id: "b", position: 2, completed: false, lastViewedAt: "2026-02-01" }, { id: "c", position: 3, completed: true }];
  assert.equal(chooseContinueSection(sections)?.id, "b");
  assert.deepEqual(weeklyCompletion(sections), { completed: 1, total: 3, percentage: 33 });
});

test("prioriza la semana vigente incompleta y luego la primera pendiente", () => {
  const weeks = [
    { id: "past", number: 1, startDate: "2026-07-01", endDate: "2026-07-07", progress: { completed: 0, total: 2 } },
    { id: "current", number: 2, startDate: "2026-08-01", endDate: "2026-08-08", progress: { completed: 1, total: 3 } },
    { id: "future", number: 3, startDate: "2026-08-10", endDate: "2026-08-17", progress: { completed: 0, total: 4 } },
  ];
  assert.equal(chooseLearningWeek(weeks, new Date("2026-08-02T12:00:00Z"))?.id, "current");
  assert.equal(chooseLearningWeek(weeks, new Date("2026-09-01T12:00:00Z"))?.id, "past");
});

test("usa la última semana con contenido cuando todo está completo y tolera colecciones vacías", () => {
  const weeks = [
    { id: "empty", number: 1, progress: { completed: 0, total: 0 } },
    { id: "complete", number: 2, progress: { completed: 2, total: 2 } },
  ];
  assert.equal(chooseLearningWeek(weeks)?.id, "complete");
  assert.equal(chooseLearningWeek([]), null);
});

test("construye destinos de contenido con reanudación opcional por bloque", () => {
  assert.equal(studentWeekContentHref("cohort", "week", null), "/cohorts/cohort/weeks/week?section=content");
  assert.equal(studentWeekContentHref("cohort", "week", { id: "section" }), "/cohorts/cohort/weeks/week/content/section");
  assert.equal(studentWeekContentHref("cohort", "week", { id: "section", lastBlockKey: "paso final" }), "/cohorts/cohort/weeks/week/content/section#block-paso%20final");
  assert.equal(studentWeekContentHref("cohort", "week", { id: "section", lastBlockKey: "final", completed: true }), "/cohorts/cohort/weeks/week/content/section");
});
