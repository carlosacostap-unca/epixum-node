import { requireCohortAccess } from "@/lib/cohorts/access";

export default async function CohortLayout({ children, params }: { children: React.ReactNode; params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  await requireCohortAccess(cohortId);
  return children;
}
