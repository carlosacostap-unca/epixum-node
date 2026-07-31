import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { getAccessibleCohorts } from "@/lib/cohorts/access";
import { createServerClient, getCurrentUser } from "@/lib/pocketbase-server";
import type { Cohort, CohortEnrollment } from "@/types";

export const dynamic = "force-dynamic";

export default async function CohortsPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const cohorts = await getAccessibleCohorts(user); const pb = await createServerClient(); const staff = user.role !== "estudiante";
  if (!staff && cohorts.length === 1) redirect("/");
  const summaries = await Promise.all(cohorts.map(async cohort => {
    if (staff) {
      const [enrollments, pending] = await Promise.all([
        pb.collection("cohort_enrollments").getList(1, 1, { filter: pb.filter("cohort = {:cohort} && status = 'active'", { cohort: cohort.id }) }).catch(() => ({ totalItems: 0 })),
        pb.collection("enrollment_requests").getList(1, 1, { filter: pb.filter("cohort = {:cohort} && status = 'pending'", { cohort: cohort.id }) }).catch(() => ({ totalItems: 0 })),
      ]);
      return { cohort, activeStudents: enrollments.totalItems, pendingRequests: pending.totalItems };
    }
    const enrollment = await pb.collection("cohort_enrollments").getFirstListItem<CohortEnrollment>(pb.filter("cohort = {:cohort} && user = {:user} && status = 'active'", { cohort: cohort.id, user: user.id })).catch(() => null);
    return { cohort, enrollment };
  }));

  return <main className="mx-auto w-full max-w-[var(--content-dashboard)] space-y-8 px-4 py-8 lg:px-8">
    <PageHeader eyebrow="Espacio académico" title={staff ? "Seleccioná una cohorte" : "Mis cohortes"} description={staff ? "Cambiá de contexto sin mezclar contenidos, estudiantes ni métricas." : "Elegí la cursada activa que querés continuar."} />
    {summaries.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{summaries.map(summary => <CohortCard key={summary.cohort.id} summary={summary} staff={staff} />)}</div> : <EmptyState title="No tenés cohortes disponibles" description="Contactá a una persona administradora para verificar tu matrícula y el correo asociado." />}
  </main>;
}

function CohortCard({ summary, staff }: { summary: { cohort: Cohort; activeStudents?: number; pendingRequests?: number; enrollment?: CohortEnrollment | null }; staff: boolean }) {
  const cohort = summary.cohort;
  return <Link href={`/cohorts/${cohort.id}`} className="group flex min-h-64 flex-col rounded-lg border bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
    <div className="flex items-start justify-between gap-3"><Badge variant={cohort.status === "active" ? "success" : "neutral"}>{cohort.status === "active" ? "Activa" : "Archivada"}</Badge><span className="text-xs font-semibold text-muted">{cohort.mode === "weekly" ? "Por semanas" : "Sprints y equipos"}</span></div>
    <div className="mt-5 flex-1"><h2 className="text-xl font-bold group-hover:text-primary">{cohort.name}</h2><p className="mt-2 text-sm text-muted">{dateRange(cohort)}</p></div>
    {staff ? <dl className="mt-5 grid grid-cols-2 gap-3 border-t pt-4"><div><dt className="text-xs text-muted">Alumnos activos</dt><dd className="mt-1 text-xl font-bold">{summary.activeStudents ?? 0}</dd></div><div><dt className="text-xs text-muted">Solicitudes</dt><dd className="mt-1 text-xl font-bold">{summary.pendingRequests ?? 0}</dd></div></dl> : <div className="mt-5 flex items-center justify-between border-t pt-4"><span className="text-sm text-muted">{summary.enrollment?.status === "completed" ? "Cursada finalizada" : summary.enrollment?.entryType === "repeater" ? "Recursante · En curso" : "En curso"}</span><span className="font-semibold text-primary">Continuar →</span></div>}
  </Link>;
}

function dateRange(cohort: Cohort) {
  const format = (value?: string) => value ? new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value)) : null;
  const start = format(cohort.startDate); const end = format(cohort.endDate);
  if (start && end) return `${start} — ${end}`; if (start) return `Comienza ${start}`; if (end) return `Finaliza ${end}`; return "Fechas a confirmar";
}
