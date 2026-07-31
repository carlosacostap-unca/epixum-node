import Link from "next/link";
import BulkEnrollmentControl from "@/components/cohorts/BulkEnrollmentControl";
import EnrollmentForms from "@/components/cohorts/EnrollmentForms";
import EnrollmentList from "@/components/cohorts/EnrollmentList";
import { AdmissionControls } from "@/components/cohorts/AdminRecordControls";
import { requireAdmin } from "@/lib/cohorts/access";
import { createAdminServerClient } from "@/lib/pocketbase-server";
import type { Cohort, CohortEnrollment, StudentAdmission, User } from "@/types";

export const dynamic = "force-dynamic";

const entryTypeLabel = (entryType: string) => entryType === "repeater" ? "Recursante" : "Primera cursada";

export default async function CohortEnrollmentsPage({ params }: { params: Promise<{ cohortId: string }> }) {
  await requireAdmin();
  const { cohortId } = await params;
  const pb = await createAdminServerClient();
  const [cohort, users, enrollments, admissions] = await Promise.all([
    pb.collection("cohorts").getOne<Cohort>(cohortId),
    pb.collection("users").getFullList<User>({ sort: "name,email" }),
    pb.collection("cohort_enrollments").getFullList<CohortEnrollment>({ filter: pb.filter("cohort = {:cohort}", { cohort: cohortId }), expand: "user", sort: "-status,-enrolledAt" }),
    pb.collection("student_admissions").getFullList<StudentAdmission>({ filter: pb.filter("cohort = {:cohort} && status = 'pending'", { cohort: cohortId }), sort: "displayName" }),
  ]);
  const students = users.filter((user) => user.role === "estudiante").map(({ id, name, email }) => ({ id, name, email }));
  const enrollmentItems = enrollments.map((item) => ({ id: item.id, name: item.expand?.user?.name || "", email: item.expand?.user?.email || "", status: item.status, entryType: item.entryType }));
  const enrolledIds = new Set(enrollments.map((item) => item.user));
  const bulkCandidates = students.filter((student) => !enrolledIds.has(student.id));

  return <main className="container mx-auto space-y-8 p-8">
    <header>
      <Link href={`/admin/cohorts/${cohortId}`} className="text-sm font-medium text-blue-600 hover:underline">← Volver a la cohorte</Link>
      <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-blue-600">{cohort.name}</p>
      <h1 className="mt-1 text-3xl font-bold">Matricular estudiantes</h1>
      <p className="mt-2 max-w-3xl text-zinc-500">Elegí un estudiante ya registrado —por ejemplo, un recursante—, cargá un alumno nuevo o incorporá en bloque a todos los estudiantes registrados.</p>
    </header>

    <section className="flex flex-col gap-4 rounded-xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-900 dark:bg-violet-950/30 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="font-semibold">Matriculación masiva</h2><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Incorpora como recursantes sólo a quienes aún no tengan matrícula. No reactiva alumnos desmatriculados.</p></div>
      <BulkEnrollmentControl cohortId={cohortId} candidates={bulkCandidates} />
    </section>

    <EnrollmentForms cohortId={cohortId} students={students} />

    <EnrollmentList enrollments={enrollmentItems} />

    <section>
      <h2 className="mb-3 text-xl font-semibold">Pendientes de primer acceso ({admissions.length})</h2>
      <div className="grid gap-3 md:grid-cols-2">{admissions.length ? admissions.map((item) => <div key={item.id} className="rounded-lg border p-4"><p className="font-medium">{item.displayName}</p><p className="text-sm text-zinc-500">{item.normalizedEmail} · {entryTypeLabel(item.entryType)}</p><AdmissionControls id={item.id} status={item.status} /></div>) : <p className="rounded-lg border border-dashed p-4 text-sm text-zinc-500 md:col-span-2">No hay admisiones pendientes para esta cohorte.</p>}</div>
    </section>
  </main>;
}
