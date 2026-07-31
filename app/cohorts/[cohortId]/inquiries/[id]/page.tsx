import { notFound } from "next/navigation";
import { getInquiry, getInquiryResponses } from "@/lib/actions-inquiries";
import { requireCohortAccess } from "@/lib/cohorts/access";
import { Alert, LinkButton, PageHeader } from "@/components/ui";
import InquiryDetailsHeader from "@/components/inquiries/InquiryDetailsHeader";
import InquiryResponseList from "@/components/inquiries/InquiryResponseList";
import InquiryResponseForm from "@/components/inquiries/InquiryResponseForm";

export const dynamic = "force-dynamic";

export default async function CohortInquiryDetailPage({ params }: { params: Promise<{ cohortId: string; id: string }> }) {
  const { cohortId, id } = await params;
  const access = await requireCohortAccess(cohortId);
  const result = await getInquiry(id);
  if (!result.success || result.data.cohort !== cohortId) notFound();
  const inquiry = result.data;
  const responses = await getInquiryResponses(id);
  const canReply = access.user.role !== "estudiante" || access.canMutateStudentWork;
  return <main className="mx-auto w-full max-w-[var(--content-reading)] space-y-8 px-4 py-8 lg:px-8">
    <PageHeader eyebrow={`${access.cohort.name} · Consulta`} title={inquiry.title} description="Conversación académica" actions={<LinkButton href={`/cohorts/${cohortId}/inquiries`} variant="secondary">Volver a consultas</LinkButton>} />
    <InquiryDetailsHeader inquiry={inquiry} currentUser={access.user} cohortId={cohortId} />
    <section aria-labelledby="responses-heading" className="space-y-5"><div><p className="text-sm font-semibold text-primary">Conversación</p><h2 id="responses-heading" className="mt-1 text-2xl font-bold">Respuestas ({responses.length})</h2></div><InquiryResponseList responses={responses} currentUser={access.user} inquiryId={id} />{inquiry.status === "Resuelta" ? <Alert variant="success" title="Consulta resuelta">La conversación queda disponible como historial. Reabrila si necesitás continuar.</Alert> : canReply ? <InquiryResponseForm inquiryId={id} /> : <Alert variant="warning" title="Historial de cursada">Tu matrícula finalizada no permite agregar respuestas.</Alert>}</section>
  </main>;
}
