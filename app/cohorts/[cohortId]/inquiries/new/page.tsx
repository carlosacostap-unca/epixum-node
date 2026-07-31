import CreateInquiryForm from "@/components/inquiries/CreateInquiryForm";
import { requireCohortAccess } from "@/lib/cohorts/access";
import { getAllAssignments, getAllClasses, getSprints } from "@/lib/data";
import { PageHeader } from "@/components/ui";

export default async function NewCohortInquiryPage({ params, searchParams }: { params: Promise<{ cohortId: string }>; searchParams: Promise<{ weekId?: string; classId?: string; assignmentId?: string }> }) {
  const { cohortId } = await params;
  const query = await searchParams;
  const { cohort } = await requireCohortAccess(cohortId, { activeEnrollment: true });
  const [classes, assignments, sprints] = await Promise.all([
    getAllClasses(cohortId, query.weekId), getAllAssignments(cohortId, query.weekId), cohort.mode === "weekly" ? Promise.resolve([]) : getSprints(cohortId),
  ]);
  const basePath = query.weekId ? `/cohorts/${cohortId}/weeks/${query.weekId}` : `/cohorts/${cohortId}/inquiries`;
  return <main className="mx-auto w-full max-w-[var(--content-reading)] space-y-8 px-4 py-8 lg:px-8"><PageHeader eyebrow={cohort.name} title="Nueva consulta" description="Describí tu pregunta y vinculala al contenido donde apareció la duda." /><CreateInquiryForm cohortId={cohortId} weekId={query.weekId} basePath={basePath} initialClassId={query.classId} initialAssignmentId={query.assignmentId} classes={classes} assignments={assignments} sprints={sprints} /></main>;
}
