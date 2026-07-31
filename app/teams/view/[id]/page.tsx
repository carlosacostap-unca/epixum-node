import { notFound, redirect } from "next/navigation";
import { getTeam } from "@/lib/data";
import { getLegacyCohort } from "@/lib/cohorts/access";
import { appendSearchParams, cohortPath, type LegacySearchParams } from "@/lib/cohorts/route-compatibility";

export const dynamic = "force-dynamic";
export default async function LegacyTeamPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<LegacySearchParams> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const team = await getTeam(id);
  if (!team) notFound();
  const cohortId = team.cohort || (await getLegacyCohort()).id;
  redirect(appendSearchParams(cohortPath(cohortId, "/teams"), { ...query, team: id }, ["cohortId"]));
}
