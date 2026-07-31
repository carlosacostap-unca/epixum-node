import { createAdminClient, outputJson } from "./client.mjs";

const baseUrl = process.env.E2E_BASE_URL || "http://localhost:3000";
const pb = await createAdminClient();
const cohort = await pb.collection("cohorts").getFirstListItem('mode = "weekly" && status = "active"');
const enrollment = await pb.collection("cohort_enrollments").getFirstListItem(
  pb.filter("cohort = {:cohort} && status = 'active'", { cohort: cohort.id }),
);
const admin = await pb.collection("users").getFirstListItem('role = "admin"');

function cookieFor(session) {
  return session.authStore.exportToCookie({ secure: false, sameSite: "Lax", path: "/" }).split(";")[0];
}

async function inspect(path, cookie) {
  const response = await fetch(`${baseUrl}${path}`, { headers: { cookie }, redirect: "follow" });
  const html = await response.text();
  if (!response.ok) throw new Error(`${path} respondió ${response.status}.`);
  return { url: response.url, html };
}

const studentSession = await pb.collection("users").impersonate(enrollment.user, 300);
const adminSession = await pb.collection("users").impersonate(admin.id, 300);
const studentCookie = cookieFor(studentSession);
const adminCookie = cookieFor(adminSession);
const activeEnrollments = await pb.collection("cohort_enrollments").getFullList({
  filter: pb.filter("user = {:user} && status = 'active'", { user: enrollment.user }),
});
const [applicationHome, cohortHome, welcome, assessment, report] = await Promise.all([
  inspect("/", studentCookie),
  inspect(`/cohorts/${cohort.id}`, studentCookie),
  inspect(`/cohorts/${cohort.id}/welcome`, studentCookie),
  inspect(`/cohorts/${cohort.id}/assessment`, studentCookie),
  inspect(`/cohorts/${cohort.id}/assessment-report`, adminCookie),
]);

const checks = {
  studentHomeIsWelcome: applicationHome.html.includes("Sumate al grupo de WhatsApp") && applicationHome.html.includes("Código QR"),
  studentHomeUsesCurrentWhatsappInvite: applicationHome.html.includes("CRgkRSFDYljKjn8ApALedk") && applicationHome.html.includes("s=cl") && applicationHome.html.includes("p=a") && applicationHome.html.includes("ilr=4"),
  singleCohortUsesCanonicalHome: activeEnrollments.length !== 1 || resolvesToHome(cohortHome),
  legacyWelcomeUsesCanonicalHome: activeEnrollments.length !== 1 || resolvesToHome(welcome),
  assessmentHasFifteenQuestions: (assessment.html.match(/<fieldset/g) || []).length === 15,
  teacherReportVisible: report.html.includes("Reporte de JavaScript") && report.html.includes("Resultados por estudiante"),
  teacherReportHasAttemptStats: report.html.includes("intentos") && report.html.includes("peor nota") && report.html.includes("mejor nota"),
};
function resolvesToHome(result) {
  return new URL(result.url).pathname === "/" || (result.html.includes("NEXT_REDIRECT") && result.html.includes("NEXT_REDIRECT;replace;/;"));
}
if (Object.values(checks).some((check) => !check)) throw new Error(`Falló la verificación autenticada: ${JSON.stringify(checks)}`);
outputJson({ cohortId: cohort.id, checks });
