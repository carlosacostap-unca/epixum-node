import { redirect } from "next/navigation";
import { getLegacyCohort } from "@/lib/cohorts/access";
import { cohortPath } from "@/lib/cohorts/route-compatibility";

export const dynamic = "force-dynamic";
export default async function LegacyMyTeamPage() {
  const cohort = await getLegacyCohort();
  redirect(cohortPath(cohort.id, "/teams"));
}
