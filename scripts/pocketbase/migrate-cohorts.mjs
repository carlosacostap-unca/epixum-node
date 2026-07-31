import { createAdminClient, outputJson } from "./client.mjs";
import { analyzeSnapshot } from "./migration-plan.mjs";

const trackedCollections = ["users", "sprints", "teams", "classes", "assignments", "deliveries", "inquiries", "messages", "reviews", "student_surveys"];
const valueAfter = (flag) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const mode = process.argv.includes("--apply") ? "apply" : process.argv.includes("--verify") ? "verify" : "dry-run";
const legacySlug = valueAfter("--legacy-slug") || process.env.LEGACY_COHORT_SLUG;
const legacyName = valueAfter("--legacy-name") || "Curso Node.js — cohorte original";
if (!legacySlug) throw new Error("Indique --legacy-slug o LEGACY_COHORT_SLUG para identificar la cohorte heredada.");

const pb = await createAdminClient();
async function readSnapshot() {
  const entries = await Promise.all(trackedCollections.map(async (name) => [name, await pb.collection(name).getFullList({ requestKey: null })]));
  return Object.fromEntries(entries);
}

const before = await readSnapshot();
const analysis = analyzeSnapshot(before);
const existingCohort = await pb.collection("cohorts").getFirstListItem(pb.filter("slug = {:slug}", { slug: legacySlug }), { requestKey: null }).catch(() => null);
const existingEnrollments = existingCohort
  ? await pb.collection("cohort_enrollments").getFullList({ filter: pb.filter("cohort = {:cohort}", { cohort: existingCohort.id }), requestKey: null })
  : [];
const enrolledUsers = new Set(existingEnrollments.map((record) => record.user));
analysis.studentsWithoutEnrollment = before.users
  .filter((user) => user.role === "estudiante" && !enrolledUsers.has(user.id))
  .map((user) => user.id);

const report = {
  mode,
  legacy: { slug: legacySlug, name: legacyName, existingId: existingCohort?.id || null },
  before: analysis,
  operations: {
    createLegacyCohort: !existingCohort,
    updateSprints: analysis.missingCohort.sprints,
    updateTeams: analysis.missingCohort.teams,
    updateInquiries: analysis.missingCohort.inquiries,
    createEnrollments: analysis.studentsWithoutEnrollment,
  },
};

if (mode === "dry-run") {
  outputJson(report);
  process.exit(0);
}

if (analysis.orphaned.length || analysis.invalidParents.length) {
  outputJson({ ...report, verified: false, error: "La migración se detuvo por relaciones huérfanas o padres académicos inválidos." });
  process.exit(1);
}

let cohort = existingCohort;
if (mode === "apply") {
  cohort ||= await pb.collection("cohorts").create({ name: legacyName, slug: legacySlug, mode: "sprints_and_teams", status: "active" }, { requestKey: null });
  for (const id of analysis.missingCohort.sprints) await pb.collection("sprints").update(id, { cohort: cohort.id }, { requestKey: null });
  for (const id of analysis.missingCohort.teams) await pb.collection("teams").update(id, { cohort: cohort.id }, { requestKey: null });
  for (const id of analysis.missingCohort.inquiries) await pb.collection("inquiries").update(id, { cohort: cohort.id }, { requestKey: null });
  for (const userId of analysis.studentsWithoutEnrollment) {
    const user = before.users.find((candidate) => candidate.id === userId);
    await pb.collection("cohort_enrollments").create({
      user: userId,
      cohort: cohort.id,
      status: "active",
      entryType: "new",
      enrolledAt: user?.created || new Date().toISOString(),
    }, { requestKey: null });
  }
}

cohort ||= await pb.collection("cohorts").getFirstListItem(pb.filter("slug = {:slug}", { slug: legacySlug }), { requestKey: null });
const after = await readSnapshot();
const afterAnalysis = analyzeSnapshot(after);
const unchangedCounts = Object.fromEntries(trackedCollections.map((name) => [name, before[name].length === after[name].length]));
const remainingEnrollments = await pb.collection("cohort_enrollments").getFullList({ filter: pb.filter("cohort = {:cohort}", { cohort: cohort.id }), requestKey: null });
const enrolledAfter = new Set(remainingEnrollments.map((record) => record.user));
const missingStudents = after.users.filter((user) => user.role === "estudiante" && !enrolledAfter.has(user.id)).map((user) => user.id);
afterAnalysis.studentsWithoutEnrollment = missingStudents;
const verified = Object.values(unchangedCounts).every(Boolean)
  && !afterAnalysis.orphaned.length
  && !afterAnalysis.invalidParents.length
  && !afterAnalysis.missingCohort.sprints.length
  && !afterAnalysis.missingCohort.teams.length
  && !afterAnalysis.missingCohort.inquiries.length
  && !missingStudents.length;

outputJson({ ...report, cohortId: cohort.id, after: afterAnalysis, unchangedCounts, missingStudents, verified });
if (!verified) process.exitCode = 1;
