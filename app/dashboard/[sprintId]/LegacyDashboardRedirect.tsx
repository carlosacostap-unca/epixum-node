import { notFound, redirect } from "next/navigation";
import { getSprintCohortId } from "@/lib/data";
import { appendSearchParams, legacyDashboardDestination, type LegacySearchParams } from "@/lib/cohorts/route-compatibility";

export async function LegacyDashboardRedirect({ params, searchParams, view }: { params: Promise<{ sprintId: string }>; searchParams?: Promise<LegacySearchParams>; view: string }) {
  const [{ sprintId }, query = {}] = await Promise.all([params, searchParams]);
  const cohortId = await getSprintCohortId(sprintId).catch(() => notFound());
  redirect(appendSearchParams(legacyDashboardDestination(cohortId, sprintId, view), query, ["cohortId", "period", "detail"]));
}
