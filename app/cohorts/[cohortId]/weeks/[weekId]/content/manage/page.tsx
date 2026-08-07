import { PageHeader, LinkButton } from "@/components/ui";
import ContentSectionManager from "@/components/content/ContentSectionManager";
import { getStaffWeekSections } from "@/lib/content/actions";
import { getWeek } from "@/lib/cohorts/weeks";

export default async function ManageWeekContentPage({ params }: { params: Promise<{ cohortId: string; weekId: string }> }) {
  const { cohortId, weekId } = await params;
  const [{ week, cohort }, sections] = await Promise.all([getWeek(cohortId, weekId), getStaffWeekSections(cohortId, weekId)]);
  return <main className="mx-auto w-full max-w-[var(--content-wide)] space-y-7 px-4 py-8 lg:px-8"><PageHeader eyebrow={`${cohort.name} · Semana ${week.number}`} title="Gestión de contenidos" description="Ordená, programá y publicá las secciones que verá el alumnado." actions={<LinkButton variant="secondary" href={`/cohorts/${cohortId}/weeks/${weekId}?section=content`}>Volver a la semana</LinkButton>} /><ContentSectionManager cohortId={cohortId} weekId={weekId} sections={sections} /></main>;
}
