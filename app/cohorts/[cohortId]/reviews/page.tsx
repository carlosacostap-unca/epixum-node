import Link from "next/link";
import { requireCohortAccess } from "@/lib/cohorts/access";
import { getSprints } from "@/lib/data";
import { Badge, Card, CardContent, EmptyState, PageHeader } from "@/components/ui";

export default async function CohortReviewsPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  const access = await requireCohortAccess(cohortId, { capability: "reviews" });
  const sprints = await getSprints(cohortId);
  return <main className="mx-auto w-full max-w-[var(--content-wide)] space-y-8 px-4 py-8 lg:px-8"><PageHeader eyebrow={access.cohort.name} title="Revisiones" description="Elegí un sprint para consultar la agenda, reservar un turno o gestionar disponibilidad." />{sprints.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{sprints.map(sprint => <Link key={sprint.id} href={`/cohorts/${cohortId}/reviews/${sprint.id}`} className="group"><Card className="h-full group-hover:border-primary group-hover:shadow-md"><CardContent className="p-5"><Badge variant="primary">Sprint</Badge><h2 className="mt-4 text-xl font-bold group-hover:text-primary">{sprint.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{sprint.description}</p><p className="mt-5 border-t pt-4 text-sm font-semibold text-primary">Abrir agenda →</p></CardContent></Card></Link>)}</div> : <EmptyState title="No hay sprints disponibles" description="La agenda de revisiones se habilitará cuando exista al menos un sprint en esta cohorte." />}</main>;
}
