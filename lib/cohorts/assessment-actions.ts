"use server";

import { revalidatePath } from "next/cache";
import { createAdminServerClient } from "@/lib/pocketbase-server";
import type { JavascriptAssessmentResult } from "@/types";
import { requireCohortAccess } from "./access";
import {
  JAVASCRIPT_ASSESSMENT_VERSION,
  assertAssessmentEligibility,
  getAssessmentCategoryFeedback,
  getPublicAssessmentQuestions,
  scoreAssessmentAnswers,
  type AssessmentAttemptKind,
  type AssessmentCategoryFeedback,
  type AssessmentCategoryScore,
} from "./javascript-assessment";

export type AssessmentActionResult =
  | {
      success: true;
      message: string;
      score: number;
      totalQuestions: number;
      attemptKind: AssessmentAttemptKind;
      categoryScores: AssessmentCategoryScore[];
      feedback: AssessmentCategoryFeedback[];
      duplicate: boolean;
    }
  | { success: false; error: string };

const ATTEMPT_KEY_PATTERN = /^[a-zA-Z0-9_-]{16,100}$/;

export async function submitJavascriptAssessmentAction(
  cohortId: string,
  _previous: AssessmentActionResult | undefined,
  formData: FormData,
): Promise<AssessmentActionResult> {
  try {
    const { cohort, user } = await requireCohortAccess(cohortId, { activeEnrollment: true });
    assertAssessmentEligibility({ role: user.role, cohortMode: cohort.mode, activeEnrollment: true });

    const attemptKey = String(formData.get("attemptKey") || "");
    if (!ATTEMPT_KEY_PATTERN.test(attemptKey)) throw new Error("No pudimos identificar este intento. Recargá la página para continuar.");

    const pb = await createAdminServerClient();
    const duplicate = await findAttemptByKey(pb, { cohortId, studentId: user.id, attemptKey });
    if (duplicate) return successfulResult(duplicate, true);

    const answers = Object.fromEntries(getPublicAssessmentQuestions().map((question) => [question.id, formData.get(`answer_${question.id}`)]));
    const scored = scoreAssessmentAnswers(answers);
    const previousAttempts = await pb.collection("javascript_assessment_results").getFullList<JavascriptAssessmentResult>({
      filter: pb.filter("cohort = {:cohort} && student = {:student} && assessmentVersion = {:version}", {
        cohort: cohortId,
        student: user.id,
        version: JAVASCRIPT_ASSESSMENT_VERSION,
      }),
    });
    let attemptKind: AssessmentAttemptKind = previousAttempts.length === 0 ? "initial" : "practice";
    let created: JavascriptAssessmentResult;
    try {
      created = await createResult(attemptKind);
    } catch (error) {
      const existing = await findAttemptByKey(pb, { cohortId, studentId: user.id, attemptKey });
      if (existing) return successfulResult(existing, true);
      if (attemptKind !== "initial") throw error;
      const winningInitial = await pb.collection("javascript_assessment_results").getFirstListItem<JavascriptAssessmentResult>(
        pb.filter("cohort = {:cohort} && student = {:student} && assessmentVersion = {:version} && attemptKind = 'initial'", {
          cohort: cohortId,
          student: user.id,
          version: JAVASCRIPT_ASSESSMENT_VERSION,
        }),
      ).catch(() => null);
      if (!winningInitial) throw error;
      attemptKind = "practice";
      created = await createResult(attemptKind);
    }

    revalidatePath("/");
    revalidatePath(`/cohorts/${cohortId}/welcome`);
    revalidatePath(`/cohorts/${cohortId}/assessment`);
    revalidatePath(`/cohorts/${cohortId}/assessment-report`);
    return successfulResult(created, false);

    async function createResult(kind: AssessmentAttemptKind) {
      return pb.collection("javascript_assessment_results").create<JavascriptAssessmentResult>({
        cohort: cohortId,
        student: user.id,
        assessmentVersion: JAVASCRIPT_ASSESSMENT_VERSION,
        attemptKind: kind,
        attemptKey,
        answers: scored.answers,
        score: scored.score,
        totalQuestions: scored.totalQuestions,
        completedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "No pudimos guardar el diagnóstico." };
  }
}

type AdminClient = Awaited<ReturnType<typeof createAdminServerClient>>;

async function findAttemptByKey(pb: AdminClient, input: { cohortId: string; studentId: string; attemptKey: string }) {
  return pb.collection("javascript_assessment_results").getFirstListItem<JavascriptAssessmentResult>(
    pb.filter("cohort = {:cohort} && student = {:student} && assessmentVersion = {:version} && attemptKey = {:attemptKey}", {
      cohort: input.cohortId,
      student: input.studentId,
      version: JAVASCRIPT_ASSESSMENT_VERSION,
      attemptKey: input.attemptKey,
    }),
  ).catch(() => null);
}

function successfulResult(result: JavascriptAssessmentResult, duplicate: boolean): Extract<AssessmentActionResult, { success: true }> {
  const categoryScores = scoreAssessmentAnswers(result.answers).categoryScores;
  const attemptKind = result.attemptKind || "initial";
  return {
    success: true,
    message: duplicate ? "Este intento ya estaba guardado; recuperamos el resultado sin duplicarlo." : attemptKind === "initial" ? "Guardamos tu diagnóstico inicial correctamente." : "Guardamos este intento de práctica correctamente.",
    score: result.score,
    totalQuestions: result.totalQuestions,
    attemptKind,
    categoryScores,
    feedback: getAssessmentCategoryFeedback(categoryScores),
    duplicate,
  };
}
