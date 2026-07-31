import { redirect } from "next/navigation";
import { getLegacyCohort } from "@/lib/cohorts/access";
import { appendSearchParams, cohortPath, type LegacySearchParams } from "@/lib/cohorts/route-compatibility";

export const dynamic = "force-dynamic";
export default async function LegacyInquiriesPage({ searchParams }: { searchParams: Promise<LegacySearchParams> }) {
  const [cohort, query] = await Promise.all([getLegacyCohort(), searchParams]);
  redirect(appendSearchParams(cohortPath(cohort.id, "/inquiries"), query));
}
