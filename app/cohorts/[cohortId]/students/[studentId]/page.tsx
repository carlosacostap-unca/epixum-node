import { notFound } from "next/navigation";
import TeacherStudentOverview from "@/components/teacher/TeacherStudentOverview";
import { requireCohortStaffAccess } from "@/lib/cohorts/access";
import { loadTeacherStudentOverview, TeacherStudentOverviewNotFoundError } from "@/lib/teacher/data";
import { safeTeacherReturnHref } from "@/lib/teacher/routes";

export const dynamic = "force-dynamic";
export default async function TeacherStudentOverviewPage({ params, searchParams }: { params: Promise<{ cohortId: string; studentId: string }>; searchParams: Promise<{ returnTo?: string | string[]; signal?: string | string[] }> }) {
  const [{ cohortId, studentId }, query] = await Promise.all([params, searchParams]); const { pb, cohort } = await requireCohortStaffAccess(cohortId);
  let data;
  try { data = await loadTeacherStudentOverview(pb, cohort, studentId); }
  catch (error) { if (error instanceof TeacherStudentOverviewNotFoundError) notFound(); throw error; }
  return <TeacherStudentOverview cohort={cohort} data={data} returnHref={safeTeacherReturnHref(query.returnTo, cohortId)} signal={typeof query.signal === "string" ? query.signal : undefined} />;
}
