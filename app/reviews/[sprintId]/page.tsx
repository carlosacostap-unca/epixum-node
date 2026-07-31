import { notFound, redirect } from "next/navigation";
import { getSprintCohortId } from "@/lib/data";
import { appendSearchParams, cohortPath, type LegacySearchParams } from "@/lib/cohorts/route-compatibility";

export const dynamic = "force-dynamic";
export default async function LegacySprintReviewsPage({ params, searchParams }: { params: Promise<{ sprintId: string }>; searchParams: Promise<LegacySearchParams> }) {
  const [{ sprintId }, query] = await Promise.all([params, searchParams]);
  const cohortId = await getSprintCohortId(sprintId).catch(() => notFound());
  redirect(appendSearchParams(cohortPath(cohortId, `/reviews/${sprintId}`), query, ["cohortId"]));
}
