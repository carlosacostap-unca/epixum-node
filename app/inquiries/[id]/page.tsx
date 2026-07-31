import { notFound, redirect } from "next/navigation";
import { getInquiry } from "@/lib/actions-inquiries";
import { appendSearchParams, cohortPath, type LegacySearchParams } from "@/lib/cohorts/route-compatibility";

export const dynamic = "force-dynamic";
export default async function LegacyInquiryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<LegacySearchParams> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const result = await getInquiry(id);
  if (!result.success || !result.data?.cohort) notFound();
  redirect(appendSearchParams(cohortPath(result.data.cohort, `/inquiries/${id}`), query, ["cohortId"]));
}
