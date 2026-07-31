import { createAdminClient, outputJson } from "./client.mjs";

const apply = process.argv.includes("--apply");
const cohortArgument = process.argv.find((argument) => argument.startsWith("--cohort="));
const requestedCohortId = cohortArgument?.slice("--cohort=".length);
const pb = await createAdminClient();
const weeklyCohorts = await pb.collection("cohorts").getFullList({ filter: "mode = 'weekly'", sort: "name" });
const cohort = requestedCohortId
  ? weeklyCohorts.find((item) => item.id === requestedCohortId)
  : weeklyCohorts.length === 1 ? weeklyCohorts[0] : null;

if (!cohort) {
  throw new Error(requestedCohortId
    ? `No existe una cohorte semanal con id ${requestedCohortId}.`
    : `Se esperaba una única cohorte semanal y se encontraron ${weeklyCohorts.length}. Usá --cohort=<id>.`);
}

const [students, enrollments] = await Promise.all([
  pb.collection("users").getFullList({ filter: "role = 'estudiante'", sort: "name,email" }),
  pb.collection("cohort_enrollments").getFullList({ filter: pb.filter("cohort = {:cohort}", { cohort: cohort.id }) }),
]);
const existingUserIds = new Set(enrollments.map((enrollment) => enrollment.user));
const candidates = students.filter((student) => !existingUserIds.has(student.id));

if (apply) {
  for (const student of candidates) {
    await pb.collection("cohort_enrollments").create({
      user: student.id,
      cohort: cohort.id,
      status: "active",
      entryType: "repeater",
      enrolledAt: new Date().toISOString(),
    });
  }
}

outputJson({
  mode: apply ? "applied" : "dry-run",
  cohort: { id: cohort.id, name: cohort.name, mode: cohort.mode },
  registeredStudents: students.length,
  existingEnrollments: enrollments.length,
  createdEnrollments: apply ? candidates.length : 0,
  pendingEnrollments: apply ? 0 : candidates.length,
  skippedExisting: students.length - candidates.length,
});
