import { performance } from "node:perf_hooks";
import { createAdminClient, outputJson } from "../pocketbase/client.mjs";

const baseUrl = process.env.E2E_BASE_URL || "http://localhost:3000";
const pb = await createAdminClient();
const [teacher, admin, cohort] = await Promise.all([
  pb.collection("users").getFirstListItem('role = "docente"'),
  pb.collection("users").getFirstListItem('role = "admin"'),
  pb.collection("cohorts").getFirstListItem('mode = "sprints_and_teams"'),
]);
const [teacherSession, adminSession] = await Promise.all([
  pb.collection("users").impersonate(teacher.id, 300),
  pb.collection("users").impersonate(admin.id, 300),
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
  await measure("Tablero longitudinal", `/cohorts/${cohort.id}/dashboard`, cookieFor(teacherSession), 12000),
  await measure("Colección de sprints", `/cohorts/${cohort.id}/sprints`, cookieFor(teacherSession), 5000),
  await measure("Administración de usuarios", "/admin/users", cookieFor(adminSession), 5000),
];
outputJson({ baseUrl, measuredAt: new Date().toISOString(), measurements });
if (measurements.some((item) => !item.withinBudget)) throw new Error("Una superficie superó el presupuesto de render warm.");
