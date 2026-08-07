import { getAccessibleCohorts, requireCohortStaffAccess } from "@/lib/cohorts/access";
import type { Assignment, CohortEnrollment, Delivery, Inquiry, Sprint, StudentSurvey, Week } from "@/types";
import { academicProgressStatus } from "@/lib/cohorts/progress";
import { normalizeAnalyticsFilters, percentage } from "@/lib/analytics";
import { AnalyticsFilterBar } from "@/components/analytics/AnalyticsFilterBar";
import { MetricCard } from "@/components/analytics/MetricCard";
import { ProgressMatrix, type ProgressRow } from "@/components/analytics/ProgressMatrix";
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { LinkButton } from "@/components/ui/Button";
import { projectTeacherDeliveryStates } from "@/lib/teacher/delivery-state";
import { inquiryContext, teacherDashboardHref, teacherInquiriesHref, teacherStudentHref } from "@/lib/teacher/routes";
import { teacherProgressPopulation } from "@/lib/teacher/analytics";

export const dynamic = "force-dynamic";
type Query = Record<string, string | string[] | undefined>;

export default async function CohortDashboardPage({ params, searchParams }: { params: Promise<{ cohortId: string }>; searchParams: Promise<Query> }) {
  const [{ cohortId }, query] = await Promise.all([params, searchParams]);
  const { pb, user, cohort } = await requireCohortStaffAccess(cohortId);
  const accessibleCohorts = await getAccessibleCohorts(user);
  const filters = normalizeAnalyticsFilters(query);
  const enrollmentStatus: "active" | "completed" = filters.status === "completed" ? "completed" : "active";
  const periodCollection = cohort.mode === "weekly" ? "weeks" : "sprints";
  const periodRelation = periodCollection.slice(0, -1);
  const [periods, enrollments, assignments, inquiries, followUps] = await Promise.all([
    cohort.mode === "weekly"
      ? pb.collection("weeks").getFullList<Week>({ filter: pb.filter("cohort = {:cohort}", { cohort: cohortId }), sort: "number" })
      : pb.collection("sprints").getFullList<Sprint>({ filter: pb.filter("cohort = {:cohort}", { cohort: cohortId }), sort: "created" }),
    pb.collection("cohort_enrollments").getFullList<CohortEnrollment>({ filter: pb.filter("cohort = {:cohort} && status = {:status}", { cohort: cohortId, status: enrollmentStatus }), expand: "user", sort: "user.name" }),
    pb.collection("assignments").getFullList<Assignment>({ filter: pb.filter(`${periodRelation}.cohort = {:cohort}`, { cohort: cohortId }), fields: "id,title,sprint,week" }),
    pb.collection("inquiries").getFullList<Inquiry>({ filter: pb.filter("cohort = {:cohort}", { cohort: cohortId }), fields: "id,status,week,class,assignment,expand.class.sprint,expand.assignment.sprint", expand: "class,assignment" }),
    cohort.mode === "weekly"
      ? Promise.resolve([] as StudentSurvey[])
      : pb.collection("student_surveys").getFullList<StudentSurvey>({ filter: pb.filter("sprint.cohort = {:cohort} && futurePlan = 'contact_teacher'", { cohort: cohortId }), fields: "id,student,sprint,futurePlan" }),
  ]);

  const assignmentValues: Record<string, string> = {};
  const assignmentClauses = assignments.map((assignment, index) => { const key = `assignment${index}`; assignmentValues[key] = assignment.id; return `assignment = {:${key}}`; });
  const deliveries = assignmentClauses.length
    ? await pb.collection("deliveries").getFullList<Delivery>({ filter: pb.filter(`(${assignmentClauses.join(" || ")})`, assignmentValues), fields: "id,assignment,student,repositoryUrl,created" })
    : [];
  const visiblePeriods = filters.period === "all" ? periods : periods.filter(period => period.id === filters.period);
  const projection = projectTeacherDeliveryStates({ students: enrollments.map(item => ({ id: item.user })), assignments, deliveries, periods, cohortId, periodIds: visiblePeriods.map(period => period.id) });
  const pairsByStudentPeriod = new Map<string, typeof projection.pairs>();
  projection.pairs.forEach(pair => { const key = `${pair.studentId}:${pair.periodId}`; pairsByStudentPeriod.set(key, [...(pairsByStudentPeriod.get(key) || []), pair]); });

  const dashboardContext = { period: filters.period, progress: filters.progress, status: enrollmentStatus, search: filters.search };
  const dashboardHref = teacherDashboardHref(cohortId, dashboardContext);
  const rows: ProgressRow[] = enrollments.map(enrollment => {
    const student = enrollment.expand?.user;
    return {
      id: enrollment.user,
      name: student?.name || student?.email || "Estudiante",
      email: student?.email,
      href: teacherStudentHref(cohortId, enrollment.user, { returnTo: dashboardHref }),
      cells: visiblePeriods.map(period => {
        const pairs = pairsByStudentPeriod.get(`${enrollment.user}:${period.id}`) || [];
        const completed = pairs.filter(pair => pair.state === "submitted").length;
        return { periodId: period.id, status: academicProgressStatus(completed, pairs.length), completed, total: pairs.length, href: pairs.length ? teacherStudentHref(cohortId, enrollment.user, { returnTo: dashboardHref, signal: `period:${period.id}` }) : undefined };
      }),
    };
  });
  const followUpIds = new Set(followUps.map(item => item.student));
  const detail = typeof query.detail === "string" ? query.detail : "";
  const population = teacherProgressPopulation(rows, { search: filters.search, progress: filters.progress, detail, followUpIds });
  const segmentRows = population.segment; const filteredRows = population.detailRows; const fullyComplete = population.complete; const attention = population.attention; const requestedContact = population.followUp;
  const pendingInquiries = inquiries.filter(item => item.status === "Pendiente" && (filters.period === "all" || inquiryMatchesPeriod(item, filters.period, cohort.mode))).length;
  const detailHref = (nextDetail: string) => teacherDashboardHref(cohortId, { ...dashboardContext, detail: nextDetail });
  const periodLabel = filters.period === "all" ? "todos los períodos" : visiblePeriods[0] ? labelPeriod(visiblePeriods[0], cohort.mode) : "período no disponible";
  const inquiryHref = teacherInquiriesHref(cohortId, { status: "pending", academicContext: filters.period === "all" ? undefined : inquiryContext(cohort.mode === "weekly" ? "week" : "sprint", filters.period) });

  return <div className="space-y-8">
    <PageHeader eyebrow={cohort.mode === "weekly" ? "Tablero semanal" : "Tablero longitudinal"} title={cohort.name} description={`Matrículas ${enrollmentStatus === "active" ? "activas" : "finalizadas"} · ${periodLabel}.`} actions={cohort.mode === "weekly" ? <LinkButton href={`/cohorts/${cohortId}/assessment-report`} variant="secondary">Reporte JavaScript</LinkButton> : undefined} />
    <AnalyticsFilterBar cohorts={accessibleCohorts.map(item => ({ value: item.id, label: item.name }))} currentCohortId={cohortId} periods={periods.map(period => ({ value: period.id, label: labelPeriod(period, cohort.mode) }))} statuses={[{ value: "active", label: "Matrícula activa" }, { value: "completed", label: "Matrícula finalizada" }]} defaultStatus="active" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Estudiantes" value={segmentRows.length} detail={periodLabel} href={detailHref("students")} />
      <MetricCard label="Progreso completo" value={fullyComplete} detail={`${percentage(fullyComplete, segmentRows.length)}% del segmento`} variant="success" href={detailHref("complete")} />
      <MetricCard label="Requieren atención" value={attention} detail="Con entregas pendientes" variant="warning" href={detailHref("attention")} />
      {cohort.mode !== "weekly" && <MetricCard label="Solicitan contacto" value={requestedContact} detail="Seguimiento pedido por estudiantes" variant="warning" href={detailHref("follow-up")} />}
      <MetricCard label="Consultas pendientes" value={pendingInquiries} detail="Abrir bandeja filtrada" variant="danger" href={inquiryHref} />
    </div>
    {detail && <Alert variant="info" title="Detalle de métrica activo">La población debajo corresponde a “{detail === "complete" ? "Progreso completo" : detail === "attention" ? "Requieren atención" : detail === "follow-up" ? "Solicitan contacto" : "Estudiantes"}” y conserva los filtros del tablero.</Alert>}
    <section className="space-y-4" aria-labelledby="progress-heading"><div><h2 id="progress-heading" className="text-2xl font-bold">Progreso por estudiante</h2><p className="mt-1 text-sm text-muted">{filteredRows.length} de {segmentRows.length} estudiantes coinciden con el contexto actual.</p></div><ProgressMatrix periods={visiblePeriods.map(period => ({ id: period.id, label: labelPeriod(period, cohort.mode), detail: `${inquiries.filter(item => item.status === "Pendiente" && inquiryMatchesPeriod(item, period.id, cohort.mode)).length} consultas pendientes` }))} rows={filteredRows} /></section>
  </div>;
}

function labelPeriod(period: Week | Sprint, mode: string) { return mode === "weekly" && "number" in period ? `Semana ${period.number}` : period.title; }
function inquiryMatchesPeriod(inquiry: Inquiry, periodId: string, mode: string) { return mode === "weekly" ? inquiry.week === periodId : inquiry.expand?.class?.sprint === periodId || inquiry.expand?.assignment?.sprint === periodId; }
