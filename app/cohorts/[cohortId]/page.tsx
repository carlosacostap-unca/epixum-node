import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccessibleCohorts, requireCohortAccess } from "@/lib/cohorts/access";
import EnrollmentStatusNotice from "@/components/cohorts/EnrollmentStatusNotice";

export default async function CohortHome({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  const { cohort, enrollment, user } = await requireCohortAccess(cohortId);
  const weekly = cohort.mode === "weekly";

  if (weekly && user.role === "estudiante" && enrollment?.status === "active") {
    const cohorts = await getAccessibleCohorts(user);
    redirect(cohorts.length === 1 ? "/" : `/cohorts/${cohortId}/welcome`);
  }

  return <main className="container mx-auto p-8">
    <p className="text-sm uppercase tracking-wide text-blue-600">{weekly ? "Cohorte semanal" : "Cohorte por sprints"}</p>
    <h1 className="mt-2 text-4xl font-bold">{cohort.name}</h1>
    <div className="mt-4"><EnrollmentStatusNotice status={enrollment?.status} /></div>
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      <Link href={weekly ? `/cohorts/${cohortId}/weeks` : `/cohorts/${cohortId}/sprints`} className="rounded-xl border p-6"><h2 className="text-xl font-semibold">{weekly ? "Semanas" : "Sprints"}</h2><p className="mt-2 text-zinc-500">Clases, materiales y trabajos prácticos.</p></Link>
      <Link href={`/cohorts/${cohortId}/inquiries`} className="rounded-xl border p-6"><h2 className="text-xl font-semibold">Consultas</h2><p className="mt-2 text-zinc-500">Preguntas académicas de esta cohorte.</p></Link>
      {weekly && user.role !== "estudiante" && <>
        <Link href={`/cohorts/${cohortId}/welcome`} className="rounded-xl border p-6"><h2 className="text-xl font-semibold">Bienvenida</h2><p className="mt-2 text-zinc-500">Revisar la experiencia inicial de los alumnos.</p></Link>
        <Link href={`/cohorts/${cohortId}/assessment-report`} className="rounded-xl border p-6"><h2 className="text-xl font-semibold">Reporte del diagnóstico</h2><p className="mt-2 text-zinc-500">Resultados individuales y métricas del test.</p></Link>
      </>}
    </div>
  </main>;
}
