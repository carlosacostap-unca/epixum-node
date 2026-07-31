import assert from "node:assert/strict";
import test from "node:test";
import {
  JAVASCRIPT_ASSESSMENT_QUESTION_COUNT,
  JAVASCRIPT_ASSESSMENT_VERSION,
  assertAssessmentEligibility,
  assessmentAttemptKind,
  calculateAssessmentMetrics,
  getAssessmentCategories,
  getAssessmentCategoryFeedback,
  getAssessmentQuestionDetails,
  getPublicAssessmentQuestions,
  scoreAssessmentAnswers,
  summarizeAssessmentAttempts,
} from "./javascript-assessment.ts";

test("publica quince preguntas v3 equilibradas sin revelar respuestas", () => {
  const questions = getPublicAssessmentQuestions();
  const categories = getAssessmentCategories();
  assert.equal(JAVASCRIPT_ASSESSMENT_VERSION, "js-foundations-v3");
  assert.equal(questions.length, JAVASCRIPT_ASSESSMENT_QUESTION_COUNT);
  assert.equal(categories.length, 5);
  assert.equal(new Set(questions.map((question) => question.id)).size, JAVASCRIPT_ASSESSMENT_QUESTION_COUNT);
  assert.ok(questions.every((question) => question.options.length === 4));
  assert.ok(categories.every((category) => questions.filter((question) => question.categoryId === category.id).length === 3));
  assert.ok(questions.filter((question) => question.code).length >= 10);
  assert.ok(questions.every((question) => !question.prompt.includes("`")));
  assert.ok(questions.some((question) => question.options.some((option) => option.code)));
  assert.equal("correctOptionId" in questions[0], false);
});

test("califica la nota total y cada categoría en el servidor", () => {
  const answers = Object.fromEntries(getAssessmentQuestionDetails().map((question) => [question.id, question.correctOptionId]));
  const result = scoreAssessmentAnswers(answers);
  assert.equal(result.score, JAVASCRIPT_ASSESSMENT_QUESTION_COUNT);
  assert.equal(result.categoryScores.length, 5);
  assert.ok(result.categoryScores.every((category) => category.score === 3 && category.total === 3 && category.percentage === 100));
  assert.ok(result.feedback.every((item) => item.level === "strength"));
});

test("genera recomendaciones para categorías a reforzar", () => {
  const feedback = getAssessmentCategoryFeedback([{ id: "async", label: "Asincronismo", score: 1, total: 3, percentage: 33 }]);
  assert.equal(feedback[0].level, "reinforce");
  assert.match(feedback[0].message, /Repasá/);
});

test("rechaza tests incompletos y calcula métricas", () => {
  assert.throws(() => scoreAssessmentAnswers({ q1: "a" }), /exactamente las 15/);
  assert.deepEqual(calculateAssessmentMetrics(5, [{ score: 8, totalQuestions: 10 }, { score: 6, totalQuestions: 10 }]), {
    activeEnrollments: 5, completed: 2, pending: 3, averageScore: 7, averagePercentage: 70,
  });
});

test("limita el test a estudiantes activos de cohortes semanales", () => {
  assert.doesNotThrow(() => assertAssessmentEligibility({ role: "estudiante", cohortMode: "weekly", activeEnrollment: true }));
  assert.throws(() => assertAssessmentEligibility({ role: "docente", cohortMode: "weekly", activeEnrollment: true }), /Sólo los estudiantes/);
  assert.throws(() => assertAssessmentEligibility({ role: "estudiante", cohortMode: "sprints_and_teams", activeEnrollment: true }), /cohortes semanales/);
  assert.throws(() => assertAssessmentEligibility({ role: "estudiante", cohortMode: "weekly", activeEnrollment: false }), /matrícula activa/);
});

test("separa diagnóstico inicial, práctica, último resultado y evolución", () => {
  const summaries = summarizeAssessmentAttempts([
    { id: "initial", student: "a", score: 4, completedAt: "2026-01-01", attemptKind: "initial" as const },
    { id: "practice-2", student: "a", score: 9, completedAt: "2026-01-03", attemptKind: "practice" as const },
    { id: "practice-1", student: "a", score: 6, completedAt: "2026-01-02", attemptKind: "practice" as const },
    { id: "legacy", student: "b", score: 7, completedAt: "2026-01-01" },
  ]);
  assert.deepEqual(summaries.map(({ student, attemptCount, practiceCount, initialScore, latestScore, bestScore, changeFromInitial }) => ({ student, attemptCount, practiceCount, initialScore, latestScore, bestScore, changeFromInitial })), [
    { student: "a", attemptCount: 3, practiceCount: 2, initialScore: 4, latestScore: 9, bestScore: 9, changeFromInitial: 5 },
    { student: "b", attemptCount: 1, practiceCount: 0, initialScore: 7, latestScore: 7, bestScore: 7, changeFromInitial: 0 },
  ]);
  assert.equal(assessmentAttemptKind(summaries[0].attempts[0], summaries[0].attempts), "practice");
  assert.equal(assessmentAttemptKind(summaries[1].attempts[0], summaries[1].attempts), "initial");
});
