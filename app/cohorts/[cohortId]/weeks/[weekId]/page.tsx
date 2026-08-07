import { getWeekContent, updateWeekAction } from "@/lib/cohorts/weeks";
import { getInquiries } from "@/lib/actions-inquiries";
import WeekForm from "@/components/cohorts/WeekForm";
import WeekControls from "@/components/cohorts/WeekControls";
import ClassForm from "@/components/ClassForm";
import AssignmentForm from "@/components/AssignmentForm";
import AcademicDetail, { type AcademicDetailSection } from "@/components/cohorts/AcademicDetail";
import ContentSectionManager from "@/components/content/ContentSectionManager";
import { getStaffWeekSections } from "@/lib/content/actions";
import { getStudentWeekContent } from "@/lib/content/student";
import StudentContentList from "@/components/content/StudentContentList";

export default async function WeekPage({ params, searchParams }: { params: Promise<{ cohortId: string; weekId: string }>; searchParams: Promise<{ section?: string }> }) {
  const { cohortId, weekId } = await params;
  const { section } = await searchParams;
  const data = await getWeekContent(cohortId, weekId);
  const inquiries = await getInquiries({ cohortId, weekId });
  const staff = data.user.role !== "estudiante";
  const contentSections = staff ? await getStaffWeekSections(cohortId, weekId) : [];
  const studentContent = !staff ? await getStudentWeekContent(cohortId, weekId) : null;
  const update = updateWeekAction.bind(null, cohortId, weekId);
  const activeSection = normalizeSection(section);
  return <AcademicDetail cohortId={cohortId} containerId={weekId} cohortName={data.cohort.name} kind="week" positionLabel={`Semana ${data.week.number}`} title={data.week.title} description={data.week.description} startDate={data.week.startDate} endDate={data.week.endDate} publication={data.week.publicationStatus} classes={data.classes} assignments={data.assignments} inquiries={inquiries} currentUser={data.user} activeSection={activeSection} weekId={weekId} content={staff ? <ContentSectionManager cohortId={cohortId} weekId={weekId} sections={contentSections} /> : studentContent ? <StudentContentList cohortId={cohortId} weekId={weekId} {...studentContent} /> : null} management={staff ? <details className="rounded-lg border bg-surface"><summary className="cursor-pointer p-4 font-semibold text-primary">Administrar esta semana</summary><div className="space-y-6 border-t p-4"><WeekControls cohortId={cohortId} weekId={weekId} published={data.week.publicationStatus === "published"} /><WeekForm action={update} week={data.week} /><div className="grid gap-6 lg:grid-cols-2"><section><h2 className="mb-3 text-lg font-bold">Nueva clase</h2><ClassForm weekId={weekId} /></section><section><h2 className="mb-3 text-lg font-bold">Nuevo trabajo práctico</h2><AssignmentForm weekId={weekId} /></section></div></div></details> : undefined} />;
}

function normalizeSection(value?: string): AcademicDetailSection { return value === "content" || value === "classes" || value === "assignments" || value === "inquiries" ? value : "overview"; }
