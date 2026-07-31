import { notFound } from "next/navigation";
import { getAccessibleCohorts, requireCohortAccess } from "@/lib/cohorts/access";
import type { Assignment, CohortEnrollment, Delivery, Inquiry, Sprint, Week } from "@/types";
import { academicProgressStatus } from "@/lib/cohorts/progress";
import { matchesSearch, normalizeAnalyticsFilters, percentage } from "@/lib/analytics";
import { AnalyticsFilterBar } from "@/components/analytics/AnalyticsFilterBar";
import { MetricCard } from "@/components/analytics/MetricCard";
import { ProgressMatrix, type ProgressRow } from "@/components/analytics/ProgressMatrix";
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { LinkButton } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
type Query = Record<string, string | string[] | undefined>;

export default async function CohortDashboardPage({ params, searchParams }: { params: Promise<{ cohortId: string }>; searchParams: Promise<Query> }) {
  const [{ cohortId }, query] = await Promise.all([params, searchParams]);
  const { pb, user, cohort } = await requireCohortAccess(cohortId);
  if (user.role === "estudiante") notFound();
  const accessibleCohorts = await getAccessibleCohorts(user);
  const filters = normalizeAnalyticsFilters(query); const enrollmentStatus = filters.status === "completed" ? "completed" : "active";
  const periodCollection = cohort.mode === "weekly" ? "weeks" : "sprints";
  const [periods, enrollments, assignments, inquiries] = await Promise.all([
    cohort.mode === "weekly" ? pb.collection("weeks").getFullList<Week>({ filter: pb.filter("cohort = {:cohort}", { cohort: cohortId }), sort: "number" }) : pb.collection("sprints").getFullList<Sprint>({ filter: pb.filter("cohort = {:cohort}", { cohort: cohortId }), sort: "created" }),
    pb.collection("cohort_enrollments").getFullList<CohortEnrollment>({ filter: pb.filter("cohort = {:cohort} && status = {:status}", { cohort: cohortId, status: enrollmentStatus }), expand: "user", sort: "user.name" }),
    pb.collection("assignments").getFullList<Assignment>({ filter: pb.filter(`${periodCollection.slice(0, -1)}.cohort = {:cohort}`, { cohort: cohortId }), fields: "id,sprint,week" }),
    pb.collection("inquiries").getFullList<Inquiry>({ filter: pb.filter("cohort = {:cohort}", { cohort: cohortId }), fields: "id,status,week" }),
  ]);
  const assignmentValues: Record<string, string> = {};
  const assignmentClauses = assignments.map((assignment, index) => { const key = `assignment${index}`; assignmentValues[key] = assignment.id; return `assignment = {:${key}}`; });
  const deliveries = assignmentClauses.length ? await pb.collection("deliveries").getFullList<Delivery>({ filter: pb.filter(`(${assignmentClauses.join(" || ")})`, assignmentValues), fields: "id,assignment,student" }) : [];
  const visiblePeriods = filters.period === "all" ? periods : periods.filter((period) => period.id === filters.period);
  const delivered = new Map<string, Set<string>>(); deliveries.forEach((item) => { const set = delivered.get(item.student) || new Set<string>(); set.add(item.assignment); delivered.set(item.student, set); });
  const rows: ProgressRow[] = enrollments.map((enrollment) => { const student = enrollment.expand?.user; const studentDeliveries = delivered.get(enrollment.user) || new Set<string>(); return { id: enrollment.user, name: student?.name || student?.email || "Estudiante", email: student?.email, cells: visiblePeriods.map((period) => { const periodAssignments = assignments.filter((assignment) => cohort.mode === "weekly" ? assignment.week === period.id : assignment.sprint === period.id); const completed = periodAssignments.filter((assignment) => studentDeliveries.has(assignment.id)).length; return { periodId: period.id, status: academicProgressStatus(completed, periodAssignments.length), completed, total: periodAssignments.length }; }) }; });
  const filteredRows = rows.filter((row) => matchesSearch([row.name, row.email], filters.search)).filter((row) => filters.progress === "all" || row.cells.some((cell) => cell.status === filters.progress)).filter((row) => query.detail === "complete" ? row.cells.length > 0 && row.cells.every((cell) => cell.status === "complete") : query.detail === "attention" ? row.cells.some((cell) => cell.status === "pending") : true);
  const fullyComplete = rows.filter((row) => row.cells.length > 0 && row.cells.every((cell) => cell.status === "complete")).length; const attention = rows.filter((row) => row.cells.some((cell) => cell.status === "pending")).length; const pendingInquiries = inquiries.filter((item) => item.status === "Pendiente" && (filters.period === "all" || (cohort.mode === "weekly" ? item.week === filters.period : true))).length;
  const context = new URLSearchParams(); if (filters.period !== "all") context.set("period", filters.period); if (filters.progress !== "all") context.set("progress", filters.progress); if (filters.search) context.set("search", filters.search); if (enrollmentStatus !== "active") context.set("status", enrollmentStatus);
  const detailHref = (detail: string) => { const params = new URLSearchParams(context); params.set("detail", detail); return `/cohorts/${cohortId}/dashboard?${params}`; };
  const periodLabel = filters.period === "all" ? "todos los períodos" : visiblePeriods[0] ? labelPeriod(visiblePeriods[0], cohort.mode) : "período no disponible";
  return <div className="space-y-8">
    <PageHeader eyebrow={cohort.mode === "weekly" ? "Tablero semanal" : "Tablero longitudinal"} title={cohort.name} description={`Matrículas ${enrollmentStatus === "active" ? "activas" : "finalizadas"} · ${periodLabel}.`} actions={cohort.mode === "weekly" ? <LinkButton href={`/cohorts/${cohortId}/assessment-report`} variant="secondary">Reporte JavaScript</LinkButton> : undefined} />
    <AnalyticsFilterBar cohorts={accessibleCohorts.map((item) => ({ value: item.id, label: item.name }))} currentCohortId={cohortId} periods={periods.map((period) => ({ value: period.id, label: labelPeriod(period, cohort.mode) }))} statuses={[{ value: "active", label: "Matrícula activa" }, { value: "completed", label: "Matrícula finalizada" }]} defaultStatus="active" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Estudiantes" value={rows.length} detail={periodLabel} href={detailHref("students")} /><MetricCard label="Progreso completo" value={fullyComplete} detail={`${percentage(fullyComplete, rows.length)}% del segmento`} variant="success" href={detailHref("complete")} /><MetricCard label="Requieren atención" value={attention} detail="Con entregas pendientes" variant="warning" href={detailHref("attention")} /><MetricCard label="Consultas pendientes" value={pendingInquiries} detail="Abrir bandeja filtrada" variant="danger" href={`/cohorts/${cohortId}/inquiries?status=pending${cohort.mode === "weekly" && filters.period !== "all" ? `&context=week` : ""}`} /></div>
    {query.detail && <Alert variant="info" title="Detalle de métrica activo">La población debajo corresponde a “{query.detail === "complete" ? "Progreso completo" : query.detail === "attention" ? "Requieren atención" : "Estudiantes"}” y conserva los filtros del tablero.</Alert>}
    <section className="space-y-4" aria-labelledby="progress-heading"><div><h2 id="progress-heading" className="text-2xl font-bold">Progreso por estudiante</h2><p className="mt-1 text-sm text-muted">{filteredRows.length} de {rows.length} estudiantes coinciden con el contexto actual.</p></div><ProgressMatrix periods={visiblePeriods.map((period) => ({ id: period.id, label: labelPeriod(period, cohort.mode), detail: cohort.mode === "weekly" ? `${inquiries.filter((item) => item.week === period.id && item.status === "Pendiente").length} consultas pendientes` : undefined }))} rows={filteredRows} /></section>
  </div>;
}

function labelPeriod(period: Week | Sprint, mode: string) { return mode === "weekly" && "number" in period ? `Semana ${period.number}` : period.title; }
