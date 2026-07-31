import { getAssignments, getClasses, getSprint } from "@/lib/data";
import { requireCohortAccess } from "@/lib/cohorts/access";
import { notFound } from "next/navigation";
import { getInquiries } from "@/lib/actions-inquiries";
import AcademicDetail, { type AcademicDetailSection } from "@/components/cohorts/AcademicDetail";
import { LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CohortSprintPage({ params, searchParams }: { params: Promise<{ cohortId: string; sprintId: string }>; searchParams: Promise<{ section?: string }> }) {
  const { cohortId, sprintId } = await params;
  const { section } = await searchParams;
  const context = await requireCohortAccess(cohortId, { capability: "sprints" });
  const [sprint, classes, assignments, cohortInquiries] = await Promise.all([getSprint(sprintId, cohortId), getClasses(sprintId), getAssignments(sprintId), getInquiries({ cohortId })]);
  if (!sprint) notFound();
  const classIds = new Set(classes.map(item => item.id)); const assignmentIds = new Set(assignments.map(item => item.id));
  const inquiries = cohortInquiries.filter(item => (item.class && classIds.has(item.class)) || (item.assignment && assignmentIds.has(item.assignment)));
  const staff = context.user.role !== "estudiante";
  return <AcademicDetail cohortId={cohortId} containerId={sprintId} cohortName={context.cohort.name} kind="sprint" positionLabel="Sprint" title={sprint.title} description={sprint.description} startDate={sprint.startDate} endDate={sprint.endDate} classes={classes} assignments={assignments} inquiries={inquiries} currentUser={context.user} activeSection={normalizeSection(section)} actions={staff ? <LinkButton href={`/sprints/${sprintId}?cohortId=${cohortId}&manage=1`} variant="secondary">Administrar contenido</LinkButton> : undefined} />;
}

function normalizeSection(value?: string): AcademicDetailSection { return value === "classes" || value === "assignments" || value === "inquiries" ? value : "overview"; }
