import { notFound } from "next/navigation";
import { requireCohortAccess } from "@/lib/cohorts/access";
import { createAdminServerClient } from "@/lib/pocketbase-server";
import { assessmentCategoryInsights, assessmentQuestionInsights, matchesSearch, percentage } from "@/lib/analytics";
import { assessmentAttemptKind, calculateAssessmentCategoryScores, calculateAssessmentMetrics, getAssessmentCategories, getAssessmentQuestionDetails, JAVASCRIPT_ASSESSMENT_QUESTION_COUNT, JAVASCRIPT_ASSESSMENT_VERSION, summarizeAssessmentAttempts } from "@/lib/cohorts/javascript-assessment";
import type { CohortEnrollment, JavascriptAssessmentResult, User } from "@/types";
import { AnalyticsFilterBar } from "@/components/analytics/AnalyticsFilterBar";
import { MetricCard } from "@/components/analytics/MetricCard";
import { Alert, Badge, Card, CardContent, CardHeader, CardTitle, LinkButton, PageHeader } from "@/components/ui";

type Query = Record<string, string | string[] | undefined>;

export default async function AssessmentReportPage({ params, searchParams }: { params: Promise<{ cohortId: string }>; searchParams: Promise<Query> }) {
  const [{ cohortId }, query] = await Promise.all([params, searchParams]);
  const { cohort, user } = await requireCohortAccess(cohortId);
  if (user.role === "estudiante" || cohort.mode !== "weekly") notFound();
  const pb = await createAdminServerClient();
  const [enrollments, results] = await Promise.all([
    pb.collection("cohort_enrollments").getFullList<CohortEnrollment>({ filter: pb.filter("cohort = {:cohort} && status = 'active'", { cohort: cohortId }), expand: "user", sort: "user.name" }),
    pb.collection("javascript_assessment_results").getFullList<JavascriptAssessmentResult>({ filter: pb.filter("cohort = {:cohort} && assessmentVersion = {:version}", { cohort: cohortId, version: JAVASCRIPT_ASSESSMENT_VERSION }), expand: "student", sort: "-completedAt" }),
  ]);
  const activeIds = new Set(enrollments.map((item) => item.user));
  const activeResults = results.filter((result) => activeIds.has(result.student));
  const summaryList = summarizeAssessmentAttempts(activeResults);
  const summaries = new Map(summaryList.map((summary) => [summary.student, summary]));
  const initialResults = summaryList.map((summary) => summary.initial);
  const metrics = calculateAssessmentMetrics(enrollments.length, initialResults);
  const questions = getAssessmentQuestionDetails();
  const categories = getAssessmentCategories();
  const insights = assessmentQuestionInsights(initialResults, questions);
  const categoryInsights = assessmentCategoryInsights(initialResults, questions, categories);
  const students = new Map<string, User>();
  enrollments.forEach((item) => { if (item.expand?.user) students.set(item.user, item.expand.user); });
  results.forEach((item) => { if (item.expand?.student) students.set(item.student, item.expand.student); });

  const search = typeof query.search === "string" ? query.search.trim() : "";
  const status = query.status === "completed" || query.status === "pending" ? query.status : "all";
  const rows = enrollments.map((enrollment) => ({ id: enrollment.user, student: students.get(enrollment.user), summary: summaries.get(enrollment.user) }))
    .filter((row) => matchesSearch([studentLabel(row.student), row.student?.email], search))
    .filter((row) => status === "completed" ? Boolean(row.summary) : status === "pending" ? !row.summary : true);
  const focusedId = typeof query.student === "string" ? query.student : "";
  const focused = focusedId ? { student: students.get(focusedId), summary: summaries.get(focusedId) } : null;
  const requestedAttempt = typeof query.attempt === "string" ? query.attempt : "";
  const attempt = focused?.summary?.attempts.find((item) => item.id === requestedAttempt) || focused?.summary?.attempts[0];
  const detailHref = (nextStatus: string) => `/cohorts/${cohortId}/assessment-report?status=${nextStatus}`;

  return <div className="space-y-8">
    <PageHeader eyebrow={`Diagnóstico · ${JAVASCRIPT_ASSESSMENT_VERSION}`} title="Reporte de JavaScript" description={`${cohort.name}. Línea de base, evolución y desempeño temático.`} actions={<LinkButton href={`/cohorts/${cohortId}/dashboard`} variant="secondary">Volver al tablero</LinkButton>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Participación inicial" value={`${percentage(metrics.completed, metrics.activeEnrollments)}%`} detail={`${metrics.completed} de ${metrics.activeEnrollments}`} variant="info" href={detailHref("completed")} /><MetricCard label="Con diagnóstico" value={metrics.completed} detail="Estudiantes con línea de base" variant="success" href={detailHref("completed")} /><MetricCard label="Pendientes" value={metrics.pending} detail="Estudiantes activos" variant="warning" href={detailHref("pending")} /><MetricCard label="Promedio inicial" value={`${metrics.averageScore.toFixed(1)}/${JAVASCRIPT_ASSESSMENT_QUESTION_COUNT}`} detail={`${metrics.averagePercentage.toFixed(0)}% del diagnóstico`} /></div>
    <AnalyticsFilterBar showProgress={false} statuses={[{ value: "completed", label: "Con diagnóstico" }, { value: "pending", label: "Sin diagnóstico" }]} searchLabel="Buscar estudiante" />

    <section className="space-y-4" aria-labelledby="category-insight-heading"><div><h2 id="category-insight-heading" className="text-2xl font-bold">Punto de partida por categoría</h2><p className="mt-1 text-sm text-muted">Precisión calculada únicamente sobre el diagnóstico inicial.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{categoryInsights.map((insight) => <Card key={insight.id}><CardContent className="p-4"><p className="text-sm font-semibold">{insight.label}</p><p className="mt-3 text-3xl font-bold tabular-nums">{insight.accuracy}%</p><p className="mt-1 text-xs text-muted">{insight.correct} aciertos · {insight.incorrect} errores</p></CardContent></Card>)}</div></section>

    <section className="space-y-4" aria-labelledby="question-insight-heading"><div><h2 id="question-insight-heading" className="text-2xl font-bold">Dificultad por pregunta</h2><p className="mt-1 text-sm text-muted">Aciertos y errores del diagnóstico inicial de estudiantes activos.</p></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{questions.map((question, index) => { const insight = insights[index]; return <Card key={question.id}><CardContent className="p-4"><div className="flex items-center justify-between gap-3"><Badge variant={insight.accuracy >= 70 ? "success" : insight.accuracy >= 40 ? "warning" : "danger"}>Pregunta {index + 1}</Badge><strong className="tabular-nums">{insight.accuracy}%</strong></div><p className="mt-3 line-clamp-3 text-sm font-medium">{question.prompt}</p><p className="mt-2 text-xs text-muted">{insight.answered} respuestas · {insight.correct} aciertos · {insight.incorrect} errores</p></CardContent></Card>; })}</div></section>

    <section className="space-y-4" aria-labelledby="students-heading"><div><h2 id="students-heading" className="text-2xl font-bold">Resultados por estudiante</h2><p className="mt-1 text-sm text-muted">{rows.length} estudiantes coinciden con los filtros. Se distingue la línea de base de la práctica.</p></div>{!rows.length ? <Alert variant="info">No hay resultados para este contexto.</Alert> : <div className="grid gap-3">{rows.map((row) => <Card key={row.id}><CardContent className="space-y-4 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{studentLabel(row.student)}</p><p className="text-sm text-muted">{row.student?.email}</p></div><div className="flex flex-wrap items-center gap-3">{row.summary ? <><Badge variant="success">Inicial {row.summary.initialScore}/{JAVASCRIPT_ASSESSMENT_QUESTION_COUNT}</Badge><span className="text-sm">Última: <strong>{row.summary.latestScore}/{JAVASCRIPT_ASSESSMENT_QUESTION_COUNT}</strong></span><span className="text-sm">Mejor: <strong>{row.summary.bestScore}/{JAVASCRIPT_ASSESSMENT_QUESTION_COUNT}</strong></span><span className={`text-sm font-semibold ${row.summary.changeFromInitial > 0 ? "text-emerald-600" : row.summary.changeFromInitial < 0 ? "text-red-600" : "text-muted"}`}>{formatChange(row.summary.changeFromInitial)}</span><Badge variant="info">{row.summary.practiceCount} prácticas</Badge><LinkButton href={`/cohorts/${cohortId}/assessment-report?student=${row.id}`} size="sm">Ver detalle</LinkButton></> : <Badge variant="warning">Sin diagnóstico</Badge>}</div></div>{row.summary && <div className="grid gap-2 sm:grid-cols-5">{calculateAssessmentCategoryScores(row.summary.initial.answers).map((category) => <div key={category.id} className="rounded-lg bg-surface-muted p-3"><p className="text-xs text-muted">{category.label}</p><p className="mt-1 font-bold">{category.score}/{category.total}</p></div>)}</div>}</CardContent></Card>)}</div>}</section>

    {focused && <section className="scroll-mt-6" aria-labelledby="attempt-heading"><Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm text-muted">Detalle enfocado</p><CardTitle id="attempt-heading">{studentLabel(focused.student)}</CardTitle></div><LinkButton href={`/cohorts/${cohortId}/assessment-report`} variant="secondary" size="sm">Cerrar detalle</LinkButton></div></CardHeader><CardContent className="space-y-5">{!focused.summary || !attempt ? <Alert variant="warning">Este estudiante todavía no realizó el diagnóstico.</Alert> : <><div className="flex flex-wrap gap-2">{focused.summary.attempts.map((item, index) => <LinkButton key={item.id} href={`/cohorts/${cohortId}/assessment-report?student=${focusedId}&attempt=${item.id}`} variant={item.id === attempt.id ? "primary" : "secondary"} size="sm">{assessmentAttemptKind(item, focused.summary!.attempts) === "initial" ? "Diagnóstico inicial" : `Práctica ${focused.summary!.practiceCount - index + 1}`}: {item.score}/{item.totalQuestions}</LinkButton>)}</div><div className="flex flex-wrap items-center gap-3"><Badge variant={assessmentAttemptKind(attempt, focused.summary.attempts) === "initial" ? "info" : "success"}>{assessmentAttemptKind(attempt, focused.summary.attempts) === "initial" ? "Diagnóstico inicial" : "Intento de práctica"}</Badge><p className="text-sm text-muted">Completado {formatDate(attempt.completedAt)}</p></div><div className="grid gap-2 sm:grid-cols-5">{calculateAssessmentCategoryScores(attempt.answers).map((category) => <div key={category.id} className="rounded-lg bg-surface-muted p-3"><p className="text-xs text-muted">{category.label}</p><p className="mt-1 font-bold">{category.score}/{category.total}</p></div>)}</div><ol className="grid gap-3">{questions.map((question, index) => { const selected = attempt.answers?.[question.id]; const selectedLabel = question.options.find((option) => option.id === selected)?.label || "Sin respuesta"; const correct = selected === question.correctOptionId; return <li key={question.id} className="rounded-lg border p-4"><div className="flex items-start gap-3"><Badge variant={correct ? "success" : "danger"}>{correct ? "Correcta" : "Incorrecta"}</Badge><div><p className="font-medium">{index + 1}. {question.prompt}</p><p className="mt-2 text-sm text-muted">Respuesta: {selectedLabel}</p></div></div></li>; })}</ol></>}</CardContent></Card></section>}
  </div>;
}

function studentLabel(student?: User) { return student?.name || student?.email || "Estudiante"; }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "short" }).format(new Date(value)); }
function formatChange(value: number) { return value === 0 ? "Sin variación" : `${value > 0 ? "+" : ""}${value} desde el inicial`; }
