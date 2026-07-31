import InquiryList from "@/components/inquiries/InquiryList";
import { getInquiries } from "@/lib/actions-inquiries";
import { requireCohortAccess } from "@/lib/cohorts/access";
import { PageHeader } from "@/components/ui";

export default async function CohortInquiriesPage({ params, searchParams }: { params: Promise<{ cohortId: string }>; searchParams: Promise<{ search?: string; weekId?: string }> }) {
  const { cohortId } = await params;
  const query = await searchParams;
  const access = await requireCohortAccess(cohortId);
  const inquiries = await getInquiries({ cohortId, weekId: query.weekId, search: query.search });
  const canCreate = access.user.role !== "estudiante" || access.canMutateStudentWork;
  return <main className="mx-auto w-full max-w-[var(--content-wide)] space-y-8 px-4 py-8 lg:px-8"><PageHeader eyebrow={access.cohort.name} title="Consultas académicas" description="Encontrá conversaciones por estado y contenido, y priorizá las preguntas que todavía necesitan respuesta." /><InquiryList inquiries={inquiries} currentUser={access.user} showSearch canCreate={canCreate} context={{ cohortId, weekId: query.weekId, basePath: `/cohorts/${cohortId}/inquiries` }} /></main>;
}
