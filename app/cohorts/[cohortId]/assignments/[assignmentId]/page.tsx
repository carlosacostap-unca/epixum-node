import AssignmentPage from "@/app/assignments/[id]/page";

export const dynamic = "force-dynamic";

type Query = Record<string, string | string[] | undefined>;

export default async function CohortAssignmentPage({ params, searchParams }: { params: Promise<{ cohortId: string; assignmentId: string }>; searchParams: Promise<Query> }) {
  const [{ cohortId, assignmentId }, query] = await Promise.all([params, searchParams]);
  return AssignmentPage({ params: Promise.resolve({ id: assignmentId }), searchParams: Promise.resolve({ ...query, cohortId }) });
}
