import AssignmentPage from "@/app/assignments/[id]/page";

export const dynamic = "force-dynamic";

export default async function CohortAssignmentPage({ params }: { params: Promise<{ cohortId: string; assignmentId: string }> }) {
  const { cohortId, assignmentId } = await params;
  return AssignmentPage({ params: Promise.resolve({ id: assignmentId }), searchParams: Promise.resolve({ cohortId }) });
}
