import { performance } from "node:perf_hooks";
import { createAdminClient, outputJson } from "../pocketbase/client.mjs";

const baseUrl = process.env.E2E_BASE_URL || "http://localhost:3000";
const pb = await createAdminClient();
const [teacher, admin, cohort] = await Promise.all([
  pb.collection("users").getFirstListItem('role = "docente"'),
  pb.collection("users").getFirstListItem('role = "admin"'),
  pb.collection("cohorts").getFirstListItem('mode = "sprints_and_teams"'),
]);
const weeklyCohorts = await pb.collection("cohorts").getFullList({ filter: 'mode = "weekly" && status = "active"', sort: "-startDate" });
let contentContext = null;
for (const candidate of weeklyCohorts) {
  const section = await pb.collection("content_sections").getFirstListItem(pb.filter("cohort = {:cohort}", { cohort: candidate.id }), { requestKey: null }).catch(() => null);
  if (!section) continue;
  const week = await pb.collection("weeks").getOne(section.week);
  const enrollment = await pb.collection("cohort_enrollments").getFirstListItem(pb.filter("cohort = {:cohort} && status = 'active'", { cohort: candidate.id }));
  contentContext = { cohort: candidate, week, enrollment };
  break;
}
if (!contentContext) throw new Error("No se encontró una cohorte semanal con contenido y estudiantes para medir.");
const [teacherSession, adminSession, studentSession] = await Promise.all([
  pb.collection("users").impersonate(teacher.id, 300),
  pb.collection("users").impersonate(admin.id, 300),
  pb.collection("users").impersonate(contentContext.enrollment.user, 300),
]);
const cookieFor = (session) => session.authStore.exportToCookie({ secure: false, sameSite: "Lax", path: "/" }).split(";")[0];

async function measure(name, path, cookie, budgetMs) {
  const samples = [];
  for (let index = 0; index < 2; index += 1) {
    const started = performance.now();
    const response = await fetch(`${baseUrl}${path}`, { headers: { cookie } });
    await response.arrayBuffer();
    samples.push(Math.round(performance.now() - started));
    if (!response.ok) throw new Error(`${name} respondió ${response.status}.`);
  }
  const warmMs = samples[1];
  return { name, path, coldMs: samples[0], warmMs, budgetMs, withinBudget: warmMs <= budgetMs };
}

const measurements = [
  await measure("Atención docente global", "/", cookieFor(teacherSession), 5000),
  await measure("Atención docente para administradores", "/staff/attention", cookieFor(adminSession), 5000),
  await measure("Tablero longitudinal", `/cohorts/${cohort.id}/dashboard`, cookieFor(teacherSession), 12000),
  await measure("Colección de sprints", `/cohorts/${cohort.id}/sprints`, cookieFor(teacherSession), 5000),
  await measure("Administración de usuarios", "/admin/users", cookieFor(adminSession), 5000),
  await measure("Gestión de contenidos", `/cohorts/${contentContext.cohort.id}/weeks/${contentContext.week.id}/content/manage`, cookieFor(adminSession), 5000),
  await measure("Trazabilidad de contenidos", `/cohorts/${contentContext.cohort.id}/content-analytics?week=${contentContext.week.id}`, cookieFor(adminSession), 12000),
  await measure("Listado estudiantil de contenidos", `/cohorts/${contentContext.cohort.id}/weeks/${contentContext.week.id}?section=content`, cookieFor(studentSession), 5000),
  await measure("Versiones base de contenido", "/admin/content-bases", cookieFor(adminSession), 5000),
];
outputJson({ baseUrl, measuredAt: new Date().toISOString(), representativeContentVolume: { cohortId: contentContext.cohort.id, weekId: contentContext.week.id, enrollments: await pb.collection("cohort_enrollments").getFullList({ filter: pb.filter("cohort = {:cohort} && status = 'active'", { cohort: contentContext.cohort.id }), fields: "id" }).then((items) => items.length), sections: await pb.collection("content_sections").getFullList({ filter: pb.filter("week = {:week}", { week: contentContext.week.id }), fields: "id" }).then((items) => items.length) }, measurements });
if (measurements.some((item) => !item.withinBudget)) throw new Error("Una superficie superó el presupuesto de render warm.");
