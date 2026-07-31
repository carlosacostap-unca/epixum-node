import { notFound, redirect } from "next/navigation";
import { getReview } from "@/lib/actions-reviews";
import { getSprintCohortId } from "@/lib/data";
import { appendSearchParams, cohortPath, type LegacySearchParams } from "@/lib/cohorts/route-compatibility";

export const dynamic = "force-dynamic";
export default async function LegacyReviewPage({ params, searchParams }: { params: Promise<{ reviewId: string }>; searchParams: Promise<LegacySearchParams> }) {
  const [{ reviewId }, query] = await Promise.all([params, searchParams]);
  const result = await getReview(reviewId);
  if (!result.success || !result.data?.sprint) notFound();
  const cohortId = await getSprintCohortId(result.data.sprint).catch(() => notFound());
  redirect(appendSearchParams(cohortPath(cohortId, `/reviews/appointments/${reviewId}`), query, ["cohortId"]));
}
