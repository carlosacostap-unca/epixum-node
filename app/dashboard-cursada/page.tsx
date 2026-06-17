import { createServerClient } from "@/lib/pocketbase-server";
import { Assignment, Delivery, Sprint, User } from "@/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardCursadaTable, { StudentCategory } from "./DashboardCursadaTable";

export const dynamic = "force-dynamic";

type SprintStatus = "approved" | "pending" | "empty";

type StudentSprintStatus = {
  sprintId: string;
  status: SprintStatus;
  deliveredCount: number;
  totalAssignments: number;
};

const getStudentCategory = (approvedSprints: number): StudentCategory => {
  if (approvedSprints >= 5) return "approved";
  if (approvedSprints >= 3) return "active";
  if (approvedSprints >= 1) return "atRisk";
  return "out";
};

const getStudentName = (student: User) => {
  const composedName = `${student.firstName || ""} ${student.lastName || ""}`.trim();
  return student.name || composedName || student.email || "Sin nombre";
};

export default async function DashboardCursadaPage() {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== "docente" && user.role !== "admin")) {
    redirect("/");
  }

  let sprints: Sprint[] = [];
  let students: User[] = [];
  let assignments: Assignment[] = [];
  let deliveries: Delivery[] = [];

  try {
    [sprints, students, assignments] = await Promise.all([
      pb.collection("sprints").getFullList<Sprint>({
        sort: "created",
        requestKey: null,
      }),
      pb.collection("users").getFullList<User>({
        filter: 'role = "estudiante"',
        sort: "name",
        requestKey: null,
      }),
      pb.collection("assignments").getFullList<Assignment>({
        sort: "created",
        requestKey: null,
      }),
    ]);
  } catch (error) {
    console.error("Error fetching dashboard cursada base data:", error);
  }

  const assignmentIds = assignments.map((assignment) => assignment.id);

  if (assignmentIds.length > 0) {
    try {
      const filter = assignmentIds.map((id) => `assignment = "${id}"`).join(" || ");
      deliveries = await pb.collection("deliveries").getFullList<Delivery>({
        filter,
        requestKey: null,
      });
    } catch (error) {
      console.error("Error fetching dashboard cursada deliveries:", error);
    }
  }

  const assignmentsBySprint = new Map<string, Assignment[]>();
  for (const sprint of sprints) {
    assignmentsBySprint.set(sprint.id, []);
  }
  for (const assignment of assignments) {
    const sprintAssignments = assignmentsBySprint.get(assignment.sprint) || [];
    sprintAssignments.push(assignment);
    assignmentsBySprint.set(assignment.sprint, sprintAssignments);
  }

  const deliveriesByStudent = new Map<string, Set<string>>();
  for (const delivery of deliveries) {
    const studentDeliveries = deliveriesByStudent.get(delivery.student) || new Set<string>();
    studentDeliveries.add(delivery.assignment);
    deliveriesByStudent.set(delivery.student, studentDeliveries);
  }

  const rows = students.map((student) => {
    const studentDeliveries = deliveriesByStudent.get(student.id) || new Set<string>();
    const sprintStatuses: StudentSprintStatus[] = sprints.map((sprint) => {
      const sprintAssignments = assignmentsBySprint.get(sprint.id) || [];
      const deliveredCount = sprintAssignments.filter((assignment) =>
        studentDeliveries.has(assignment.id)
      ).length;
      const totalAssignments = sprintAssignments.length;
      const status: SprintStatus =
        totalAssignments === 0
          ? "empty"
          : deliveredCount === totalAssignments
            ? "approved"
            : "pending";

      return {
        sprintId: sprint.id,
        status,
        deliveredCount,
        totalAssignments,
      };
    });

    const approvableSprints = sprintStatuses.filter((item) => item.totalAssignments > 0);
    const approvedSprints = approvableSprints.filter((item) => item.status === "approved").length;

    return {
      student: {
        id: student.id,
        name: getStudentName(student),
        email: student.email,
      },
      sprintStatuses,
      approvedSprints,
      approvableSprints: approvableSprints.length,
      category: getStudentCategory(approvedSprints),
    };
  });

  const totalApprovedCells = rows.reduce((total, row) => total + row.approvedSprints, 0);
  const totalApprovableCells = rows.reduce((total, row) => total + row.approvableSprints, 0);
  const approvalRate =
    totalApprovableCells === 0 ? 0 : Math.round((totalApprovedCells / totalApprovableCells) * 100);

  return (
    <div className="container mx-auto min-h-screen p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-400">
            Dashboard Cursada
          </p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            Estado de aprobacion por sprint
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-500 dark:text-zinc-400">
            Un sprint figura como aprobado cuando el alumno tiene entregas registradas para todos los TPs configurados.
          </p>
        </div>
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          &larr; Volver al Panel
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Alumnos</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{students.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Sprints</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{sprints.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Aprobacion general</p>
          <p className="mt-2 text-3xl font-bold text-cyan-600 dark:text-cyan-400">{approvalRate}%</p>
        </div>
      </div>

      <DashboardCursadaTable
        sprints={sprints.map((sprint) => ({
          id: sprint.id,
          title: sprint.title,
        }))}
        rows={rows}
      />
    </div>
  );
}
