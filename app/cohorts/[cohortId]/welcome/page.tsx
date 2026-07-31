import { notFound, redirect } from "next/navigation";
import WeeklyCohortHome from "@/components/cohorts/WeeklyCohortHome";
import { getAccessibleCohorts, requireCohortAccess } from "@/lib/cohorts/access";

export default async function WeeklyCohortWelcomePage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  const { cohort, user } = await requireCohortAccess(cohortId, { activeEnrollment: true });
  if (cohort.mode !== "weekly") notFound();
  if (user.role === "estudiante" && (await getAccessibleCohorts(user)).length === 1) redirect("/");
  return <WeeklyCohortHome cohort={cohort} user={user} />;
}
