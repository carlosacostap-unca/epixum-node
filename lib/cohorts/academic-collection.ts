import type PocketBase from "pocketbase";
import type { Assignment, Class, Delivery } from "@/types";
import type { AcademicCollectionItem } from "@/components/cohorts/AcademicCollection";

type Container = { id: string; title: string; description?: string; startDate?: string; endDate?: string; publicationStatus?: "draft" | "published" };

export async function buildAcademicCollection(pb: PocketBase, options: { cohortId: string; containers: Container[]; relation: "week" | "sprint"; studentId?: string }): Promise<AcademicCollectionItem[]> {
  const { cohortId, containers, relation, studentId } = options;
  if (!containers.length) return [];
  const cohortPath = relation === "week" ? "week.cohort" : "sprint.cohort";
  const [classes, assignments, deliveries] = await Promise.all([
    pb.collection("classes").getFullList<Class>({ filter: pb.filter(`${cohortPath} = {:cohort}`, { cohort: cohortId }) }).catch(() => []),
    pb.collection("assignments").getFullList<Assignment>({ filter: pb.filter(`${cohortPath} = {:cohort}`, { cohort: cohortId }) }).catch(() => []),
    studentId ? pb.collection("deliveries").getFullList<Delivery>({ filter: pb.filter(`student = {:student} && assignment.${cohortPath} = {:cohort}`, { student: studentId, cohort: cohortId }) }).catch(() => []) : Promise.resolve([]),
  ]);
  const delivered = new Set(deliveries.map(item => item.assignment));
  return containers.map((container, index) => {
    const containerClasses = classes.filter(item => item[relation] === container.id);
    const containerAssignments = assignments.filter(item => item[relation] === container.id);
    return {
      id: container.id,
      position: index + 1,
      label: relation === "week" ? `Semana ${index + 1}` : `Sprint ${index + 1}`,
      title: container.title,
      description: container.description,
      href: `/cohorts/${cohortId}/${relation === "week" ? "weeks" : "sprints"}/${container.id}`,
      startDate: container.startDate,
      endDate: container.endDate,
      publication: container.publicationStatus || "published",
      classCount: containerClasses.length,
      assignmentCount: containerAssignments.length,
      completedAssignments: studentId ? containerAssignments.filter(item => delivered.has(item.id)).length : undefined,
    };
  });
}
