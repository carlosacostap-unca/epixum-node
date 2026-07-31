import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createAdminClient, projectRoot } from "../pocketbase/client.mjs";

const outputDirectory = resolve(projectRoot, "output", "playwright", "final-quality", "auth");
await mkdir(outputDirectory, { recursive: true });
const pb = await createAdminClient();
const activeEnrollment = await pb.collection("cohort_enrollments").getFirstListItem("status = 'active' && cohort.status = 'active'", { expand: "user,cohort" });
const users = {
  estudiante: activeEnrollment.expand?.user,
  docente: await pb.collection("users").getFirstListItem('role = "docente"'),
  admin: await pb.collection("users").getFirstListItem('role = "admin"'),
};
if (!users.estudiante || !activeEnrollment.expand?.cohort) throw new Error("No hay un estudiante activo para la verificación.");

for (const [role, user] of Object.entries(users)) {
  const session = await pb.collection("users").impersonate(user.id, 900);
  const header = session.authStore.exportToCookie({ httpOnly: false, secure: false, sameSite: "Lax", path: "/" });
  const encodedValue = header.match(/^pb_auth=([^;]+)/)?.[1];
  if (!encodedValue) throw new Error(`No se pudo crear la sesión de ${role}.`);
  const state = { cookies: [{ name: "pb_auth", value: encodedValue, domain: "127.0.0.1", path: "/", expires: Math.floor(Date.now() / 1000) + 900, httpOnly: false, secure: false, sameSite: "Lax" }], origins: [] };
  await writeFile(resolve(outputDirectory, `${role}.json`), JSON.stringify(state), { mode: 0o600 });
}

await writeFile(resolve(outputDirectory, "context.json"), JSON.stringify({ cohortId: activeEnrollment.expand.cohort.id }, null, 2));
process.stdout.write("Estados temporales creados para estudiante, docente y administrador.\n");
