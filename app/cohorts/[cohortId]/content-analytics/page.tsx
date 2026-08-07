import TeachingContentDashboard from "@/components/content/TeachingContentDashboard";
import { LinkButton, PageHeader } from "@/components/ui";
import { getTeachingContentAnalytics, type ContentAnalyticsFilters } from "@/lib/content/analytics-actions";
import { requireCohortStaffAccess } from "@/lib/cohorts/access";

export const dynamic = "force-dynamic";
export default async function ContentAnalyticsPage({ params, searchParams }: { params: Promise<{ cohortId: string }>; searchParams: Promise<ContentAnalyticsFilters> }) {
  const [{ cohortId }, filters] = await Promise.all([params, searchParams]);
  const [context, data] = await Promise.all([requireCohortStaffAccess(cohortId), getTeachingContentAnalytics(cohortId, filters)]);
  return <main className="mx-auto w-full max-w-[var(--content-dashboard)] space-y-8 px-4 py-8 lg:px-8"><PageHeader eyebrow={context.cohort.name} title="Trazabilidad de contenidos" description="Aperturas registradas, avance, finalizaciones e intentos. Las visualizaciones no se presentan como prueba de lectura." actions={<LinkButton variant="secondary" href={`/cohorts/${cohortId}/weeks`}>Volver a semanas</LinkButton>} /><TeachingContentDashboard cohortId={cohortId} filters={filters} {...data} /></main>;
}
