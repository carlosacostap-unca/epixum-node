import { requireCohortAccess } from "@/lib/cohorts/access";
import { getSprints } from "@/lib/data";
import AcademicCollection from "@/components/cohorts/AcademicCollection";
import { buildAcademicCollection } from "@/lib/cohorts/academic-collection";
import { PageHeader } from "@/components/ui";
import SprintCreateDialog from "@/components/cohorts/SprintCreateDialog";

export default async function CohortSprintsPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  const context = await requireCohortAccess(cohortId, { capability: "sprints" });
  const sprints = await getSprints(cohortId);
  const staff = context.user.role !== "estudiante";
  const items = await buildAcademicCollection(context.pb, { cohortId, containers: sprints, relation: "sprint", studentId: staff ? undefined : context.user.id });
  return <main className="mx-auto w-full max-w-[var(--content-reading)] space-y-8 px-4 py-8 lg:px-8">
    <PageHeader eyebrow={context.cohort.name} title="Sprints" description={staff ? "Revisá la secuencia, el calendario y la carga de cada sprint." : "Avanzá en orden y consultá el progreso de tus entregas."} actions={staff ? <SprintCreateDialog cohortId={cohortId} /> : undefined} />
    <AcademicCollection items={items} staff={staff} emptyTitle="Todavía no hay sprints" emptyDescription={staff ? "Creá el primer sprint desde la administración de contenidos." : "El equipo docente agregará el contenido de la cursada."} />
  </main>;
}
