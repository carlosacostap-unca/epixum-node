import { notFound } from "next/navigation";
import CompleteDeliveriesForm from "@/app/student-form/CompleteDeliveriesForm";
import IncompleteDeliveriesForm from "@/app/student-form/IncompleteDeliveriesForm";
import { requireCohortAccess } from "@/lib/cohorts/access";
import type { Assignment, Delivery, Sprint, StudentSurvey } from "@/types";
import { Badge, Card, CardContent, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CohortSurveyPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  const { pb, user, cohort } = await requireCohortAccess(cohortId, { capability: "surveys", activeEnrollment: true });
  if (user.role !== "estudiante") notFound();

  const sprint = await pb.collection("sprints").getFirstListItem<Sprint>(
    pb.filter("cohort = {:cohort}", { cohort: cohortId }),
    { sort: "created" },
  ).catch(() => null);
  const [assignments, deliveries, existingSurvey] = sprint ? await Promise.all([
    pb.collection("assignments").getFullList<Assignment>({ filter: pb.filter("sprint = {:sprint}", { sprint: sprint.id }), sort: "created" }),
    pb.collection("deliveries").getFullList<Delivery>({ filter: pb.filter("student = {:student}", { student: user.id }) }),
    pb.collection("student_surveys").getFirstListItem<StudentSurvey>(pb.filter("sprint = {:sprint} && student = {:student}", { sprint: sprint.id, student: user.id })).catch(() => null),
  ]) : [[], [], null];
  const allDelivered = assignments.length > 0 && assignments.every(assignment => deliveries.some(delivery => delivery.assignment === assignment.id));

  return <main className="mx-auto w-full max-w-[var(--content-wide)] space-y-8 px-4 py-8 lg:px-8">
    <PageHeader eyebrow={cohort.name} title={sprint ? `Encuesta de ${sprint.title}` : "Encuesta de seguimiento"} description="Revisá tus entregas y compartí cómo fue tu experiencia en este período." />
    {!sprint ? <EmptyState title="Todavía no hay un período para evaluar" description="La encuesta estará disponible cuando el equipo docente publique el primer sprint." /> : <>
      <section className="space-y-4" aria-labelledby="delivery-status-title">
        <h2 id="delivery-status-title" className="text-xl font-semibold">Estado de entregas</h2>
        {assignments.length === 0 ? <EmptyState title="No hay trabajos prácticos" description="Este sprint todavía no tiene entregas configuradas." /> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {assignments.map((assignment, index) => {
            const delivery = deliveries.find(item => item.assignment === assignment.id);
            return <Card key={assignment.id}><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><strong>TP {index + 1}</strong><Badge variant={delivery ? "success" : "warning"}>{delivery ? "Entregado" : "Pendiente"}</Badge></div><p className="text-sm text-[var(--text-secondary)]">{assignment.title}</p>{delivery?.repositoryUrl && <a className="text-sm font-medium text-[var(--brand-strong)] hover:underline" href={delivery.repositoryUrl} target="_blank" rel="noreferrer">Ver repositorio</a>}</CardContent></Card>;
          })}
        </div>}
      </section>
      <Card className="mx-auto max-w-3xl"><CardContent className="p-6 lg:p-8">
        {existingSurvey ? <div className="space-y-2 text-center"><Badge variant="success">Enviada</Badge><h2 className="text-2xl font-semibold">Encuesta completada</h2><p className="text-[var(--text-secondary)]">Tu respuesta quedó registrada. Gracias por compartir tu experiencia.</p></div> : assignments.length > 0 ? allDelivered ? <CompleteDeliveriesForm userId={user.id} sprintId={sprint.id} /> : <IncompleteDeliveriesForm userId={user.id} sprintId={sprint.id} /> : <p className="text-center text-[var(--text-secondary)]">La encuesta se habilitará cuando haya trabajos prácticos en el sprint.</p>}
      </CardContent></Card>
    </>}
  </main>;
}
