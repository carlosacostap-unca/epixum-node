import { notFound } from "next/navigation";
import ContentEditor from "@/components/content/ContentEditor";
import ContentPreview from "@/components/content/ContentPreview";
import { LinkButton } from "@/components/ui";
import { getContentSectionPreview, getStaffContentSection } from "@/lib/content/actions";

export default async function EditContentSectionPage({ params, searchParams }: { params: Promise<{ cohortId: string; weekId: string; sectionId: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { cohortId, weekId, sectionId } = await params;
  const { preview } = await searchParams;
  if (preview === "1") {
    const data = await getContentSectionPreview(cohortId, weekId, sectionId);
    return <ContentPreview cohortId={cohortId} weekId={weekId} section={data.section} revision={data.revision} assetUrls={data.assetUrls} backHref={`/cohorts/${cohortId}/weeks/${weekId}/content/${sectionId}/edit`} />;
  }
  const { section, revision } = await getStaffContentSection(cohortId, weekId, sectionId);
  if (!revision) notFound();
  return <main className="mx-auto w-full max-w-[var(--content-wide)] space-y-6 px-4 py-8 lg:px-8"><div><LinkButton variant="ghost" href={`/cohorts/${cohortId}/weeks/${weekId}?section=content`}>← Volver a contenidos</LinkButton></div><ContentEditor cohortId={cohortId} weekId={weekId} sectionId={sectionId} title={section.title} status={section.status} revisionId={revision.id} revisionNumber={revision.revisionNumber} initialBlocks={revision.blocks} /></main>;
}
