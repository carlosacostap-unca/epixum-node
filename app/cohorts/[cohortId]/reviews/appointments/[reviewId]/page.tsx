import { notFound } from "next/navigation";
import { getReview } from "@/lib/actions-reviews";
import { requireCohortAccess } from "@/lib/cohorts/access";
import ReviewDetail from "@/components/reviews/ReviewDetail";

export const dynamic = "force-dynamic";
export default async function CohortReviewDetailPage({ params }: { params: Promise<{ cohortId: string; reviewId: string }> }) {
  const { cohortId, reviewId } = await params; const access = await requireCohortAccess(cohortId, { capability: "reviews" }); const result = await getReview(reviewId); if (!result.success || !result.data || result.data.expand?.sprint?.cohort !== cohortId) notFound(); const review = result.data; if (access.user.role === "estudiante" && review.student !== access.user.id) notFound(); return <ReviewDetail review={review} user={access.user} cohortId={cohortId} />;
}
