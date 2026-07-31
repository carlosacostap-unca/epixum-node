import { createAdminClient, outputJson } from "./client.mjs";

const baseUrl = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const pb = await createAdminClient();
const legacy = await pb.collection("cohorts").getFirstListItem('mode = "sprints_and_teams"');
const weekly = await pb.collection("cohorts").getFirstListItem('mode = "weekly"');
const [admin, enrollment, sprint, classItem, assignment] = await Promise.all([
  pb.collection("users").getFirstListItem('role = "admin"'),
  pb.collection("cohort_enrollments").getFirstListItem(pb.filter("cohort = {:cohort}", { cohort: legacy.id })),
  pb.collection("sprints").getFirstListItem(pb.filter("cohort = {:cohort}", { cohort: legacy.id })),
  pb.collection("classes").getFirstListItem(pb.filter("sprint.cohort = {:cohort}", { cohort: legacy.id })),
  pb.collection("assignments").getFirstListItem(pb.filter("sprint.cohort = {:cohort}", { cohort: legacy.id })),
]);

async function authCookie(userId) {
  const session = await pb.collection("users").impersonate(userId, 300);
  return session.authStore.exportToCookie({ secure: false, sameSite: "Lax", path: "/" }).split(";")[0];
}

const adminCookie = await authCookie(admin.id);
const studentCookie = await authCookie(enrollment.user);
const checks = [
  ["admin-cohort", `/admin/cohorts/${legacy.id}`, adminCookie],
  ["admin-cohort-enrollments", `/admin/cohorts/${legacy.id}/enrollments`, adminCookie],
  ["admin-weekly-enrollments", `/admin/cohorts/${weekly.id}/enrollments`, adminCookie, "Matricular a todos"],
  ["admin-users", `/admin/users?cohort=${legacy.id}`, adminCookie],
  ["sprints", `/cohorts/${legacy.id}/sprints`, adminCookie],
  ["class", `/classes/${classItem.id}?cohortId=${legacy.id}`, adminCookie],
  ["assignment", `/assignments/${assignment.id}?cohortId=${legacy.id}`, adminCookie],
  ["teams", "/teams/view", adminCookie],
  ["inquiries", `/cohorts/${legacy.id}/inquiries`, adminCookie],
  ["reviews", "/reviews", adminCookie],
  ["dashboard", "/dashboard-cursada", adminCookie],
  ["student-team", "/my-team", studentCookie],
  ["student-survey", "/student-form", studentCookie],
  ["sprint-detail", `/sprints/${sprint.id}`, studentCookie],
];

const results = [];
for (const [name, path, cookie, expectedText] of checks) {
  const response = await fetch(`${baseUrl}${path}`, { headers: { cookie }, redirect: "manual" });
  results.push({ name, path, status: response.status });
  if (expectedText && !(await response.text()).includes(expectedText)) throw new Error(`${name} no incluyó el texto esperado: ${expectedText}`);
  if (response.status < 200 || response.status >= 400) throw new Error(`${name} falló con HTTP ${response.status}`);
}
outputJson({ cohortId: legacy.id, results });
