import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import JavascriptAssessmentForm from "@/components/cohorts/JavascriptAssessmentForm";
import { getAccessibleCohorts, requireCohortAccess } from "@/lib/cohorts/access";
import { createAdminServerClient } from "@/lib/pocketbase-server";
import { JAVASCRIPT_ASSESSMENT_QUESTION_COUNT, JAVASCRIPT_ASSESSMENT_VERSION, assessmentAttemptKind, getPublicAssessmentQuestions, summarizeAssessmentAttempts } from "@/lib/cohorts/javascript-assessment";
import type { JavascriptAssessmentResult } from "@/types";

export default async function JavascriptAssessmentPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  const { cohort, user } = await requireCohortAccess(cohortId, { activeEnrollment: true });
  if (cohort.mode !== "weekly") notFound();
  if (user.role !== "estudiante") redirect(`/cohorts/${cohortId}/assessment-report`);

  const pb = await createAdminServerClient();
  const attempts = await pb.collection("javascript_assessment_results").getFullList<JavascriptAssessmentResult>({
    filter: pb.filter("cohort = {:cohort} && student = {:student} && assessmentVersion = {:version}", { cohort: cohortId, student: user.id, version: JAVASCRIPT_ASSESSMENT_VERSION }),
    sort: "-completedAt",
  });
  const summary = attempts.length > 0 ? summarizeAssessmentAttempts(attempts)[0] : null;
  const backHref = (await getAccessibleCohorts(user)).length === 1 ? "/" : `/cohorts/${cohortId}/welcome`;

  return <main className="container mx-auto max-w-3xl p-5 sm:p-8">
    <Link href={backHref} className="text-sm font-semibold text-primary hover:underline">← Volver al inicio</Link>
    <header className="my-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Diagnóstico inicial · {cohort.name}</p>
      <h1 className="mt-2 text-4xl font-bold">Test de JavaScript</h1>
      <p className="mt-3 text-muted">Son {JAVASCRIPT_ASSESSMENT_QUESTION_COUNT} preguntas de opción múltiple, presentadas de a una. El primer resultado registra tu punto de partida; los siguientes son prácticas.</p>
    </header>
    {summary && <section className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
      <h2 className="text-xl font-bold">Tu recorrido</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3"><AttemptMetric label="Diagnóstico inicial" value={`${summary.initialScore}/${JAVASCRIPT_ASSESSMENT_QUESTION_COUNT}`} /><AttemptMetric label="Prácticas" value={summary.practiceCount} /><AttemptMetric label="Mejor nota" value={`${summary.bestScore}/${JAVASCRIPT_ASSESSMENT_QUESTION_COUNT}`} /></div>
      <ol className="mt-4 flex flex-wrap gap-2">{summary.attempts.map((attempt) => <li key={attempt.id} className="rounded-full bg-white px-3 py-1 text-sm dark:bg-zinc-900">{assessmentAttemptKind(attempt, summary.attempts) === "initial" ? "Diagnóstico inicial" : "Práctica"}: <strong>{attempt.score}/{attempt.totalQuestions}</strong></li>)}</ol>
    </section>}
    <div className="mb-5"><h2 className="text-2xl font-bold">{summary ? "Realizar un intento de práctica" : "Completar el diagnóstico inicial"}</h2></div>
    <JavascriptAssessmentForm cohortId={cohortId} studentId={user.id} questions={getPublicAssessmentQuestions()} />
  </main>;
}

function AttemptMetric({ label, value }: { label: string; value: string | number }) {
  return <div><p className="text-sm text-muted">{label}</p><p className="text-2xl font-bold">{value}</p></div>;
}
