import { notFound } from "next/navigation";
import { requireCohortAccess } from "@/lib/cohorts/access";
import { getReviews, getSprint } from "@/lib/data";
import ReviewsManager from "@/components/reviews/ReviewsManager";
import { LinkButton, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export default async function CohortSprintReviewsPage({ params }: { params: Promise<{ cohortId: string; sprintId: string }> }) {
  const { cohortId, sprintId } = await params;
  const access = await requireCohortAccess(cohortId, { capability: "reviews" });
  const sprint = await getSprint(sprintId, cohortId); if (!sprint) notFound();
  const reviews = await getReviews(sprintId);
  return <main className="mx-auto w-full max-w-[var(--content-wide)] space-y-8 px-4 py-8 lg:px-8"><PageHeader eyebrow={`${access.cohort.name} · Revisiones`} title={sprint.title} description="Agenda cronológica de turnos de revisión." actions={<LinkButton href={`/cohorts/${cohortId}/reviews`} variant="secondary">Cambiar sprint</LinkButton>} /><ReviewsManager sprint={sprint} initialReviews={reviews} currentUser={access.user} cohortId={cohortId} /></main>;
}
