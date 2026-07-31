import { getWeeks, createWeekAction } from "@/lib/cohorts/weeks";
import { requireCohortAccess } from "@/lib/cohorts/access";
import WeekForm from "@/components/cohorts/WeekForm";
import AcademicCollection from "@/components/cohorts/AcademicCollection";
import { buildAcademicCollection } from "@/lib/cohorts/academic-collection";
import { buttonStyles, PageHeader } from "@/components/ui";

export default async function WeeksPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params; const context = await requireCohortAccess(cohortId, { capability: "weeks" }); const weeks = await getWeeks(cohortId); const staff = context.user.role !== "estudiante"; const create = createWeekAction.bind(null, cohortId);
  const items = await buildAcademicCollection(context.pb, { cohortId, containers: weeks, relation: "week", studentId: staff ? undefined : context.user.id });
  return <main className="mx-auto w-full max-w-[var(--content-reading)] space-y-8 px-4 py-8 lg:px-8">
    <PageHeader eyebrow={context.cohort.name} title="Semanas" description={staff ? "Organizá y publicá el recorrido de aprendizaje de la cohorte." : "Avanzá en orden y revisá tus clases, trabajos y entregas."} />
    {staff && <details className="group rounded-lg border bg-surface"><summary className="list-none p-4"><span className={buttonStyles()}>Crear semana</span></summary><div className="border-t p-4"><WeekForm action={create} /></div></details>}
    <AcademicCollection items={items} staff={staff} emptyTitle={staff ? "Todavía no hay semanas creadas" : "Todavía no hay semanas publicadas"} emptyDescription={staff ? "Creá la primera semana para comenzar a organizar la cursada." : "El equipo docente publicará el contenido cuando esté listo."} />
  </main>;
}
