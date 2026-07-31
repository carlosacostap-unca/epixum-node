import { createAdminClient, outputJson } from "./client.mjs";

const command = process.argv[2];
const slug = "codex-e2e-weekly";
const pb = await createAdminClient();

async function retry(operation, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try { return await operation(); } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, attempt * 750));
    }
  }
  throw lastError;
}

async function findFixture() {
  return pb.collection("cohorts").getFirstListItem(pb.filter("slug = {:slug}", { slug })).catch(() => null);
}

async function removeFixture() {
  const cohort = await findFixture();
  if (!cohort) return { removed: false };
  if (cohort.name !== "Fixture E2E semanal") throw new Error("Se rechazó eliminar una cohorte que no coincide con la fixture exacta.");
  for (const collection of ["inquiries", "weeks", "cohort_enrollments"]) {
    const records = await retry(() => pb.collection(collection).getFullList({ filter: pb.filter("cohort = {:cohort}", { cohort: cohort.id }) }));
    for (const record of records) await retry(() => pb.collection(collection).delete(record.id));
  }
  await retry(() => pb.collection("cohorts").delete(cohort.id));
  return { removed: true, cohortId: cohort.id };
}

function cookieFor(session) {
  const serialized = session.authStore.exportToCookie({ secure: false, sameSite: "Lax", path: "/" });
  return serialized.slice(serialized.indexOf("=") + 1, serialized.indexOf(";"));
}

if (command === "cleanup") {
  outputJson(await removeFixture());
} else if (command === "sessions") {
  const cohort = await findFixture();
  if (!cohort) throw new Error("No existe la fixture E2E.");
  const enrolled = await pb.collection("cohort_enrollments").getFirstListItem(pb.filter("cohort = {:cohort}", { cohort: cohort.id }));
  const legacy = await pb.collection("cohorts").getFirstListItem('mode = "sprints_and_teams"');
  const isolated = await pb.collection("cohort_enrollments").getFirstListItem(pb.filter("cohort = {:legacy} && user != {:enrolled}", { legacy: legacy.id, enrolled: enrolled.user }));
  const enrolledSession = await pb.collection("users").impersonate(enrolled.user, 300);
  const isolatedSession = await pb.collection("users").impersonate(isolated.user, 300);
  outputJson({ cohortId: cohort.id, enrolledCookie: cookieFor(enrolledSession), isolatedCookie: cookieFor(isolatedSession) });
} else if (command === "setup") {
  await removeFixture();
  const legacy = await pb.collection("cohorts").getFirstListItem('mode = "sprints_and_teams"');
  const legacyEnrollments = await pb.collection("cohort_enrollments").getFullList({ filter: pb.filter("cohort = {:cohort}", { cohort: legacy.id }), sort: "user" });
  if (legacyEnrollments.length < 2) throw new Error("Se necesitan dos alumnos históricos para la prueba de aislamiento.");
  const enrolledUser = legacyEnrollments[0].user;
  const isolatedUser = legacyEnrollments[1].user;
  const cohort = await pb.collection("cohorts").create({ name: "Fixture E2E semanal", slug, mode: "weekly", status: "active" });
  await pb.collection("cohort_enrollments").create({ user: enrolledUser, cohort: cohort.id, status: "active", entryType: "repeater", enrolledAt: new Date().toISOString() });
  const published = await pb.collection("weeks").create({ cohort: cohort.id, number: 1, title: "Semana pública E2E", description: "Visible", publicationStatus: "published", publishedAt: new Date().toISOString() });
  const draft = await pb.collection("weeks").create({ cohort: cohort.id, number: 2, title: "Semana borrador E2E", description: "Oculta", publicationStatus: "draft" });
  const enrolledSession = await pb.collection("users").impersonate(enrolledUser, 300);
  const isolatedSession = await pb.collection("users").impersonate(isolatedUser, 300);
  outputJson({ cohortId: cohort.id, publishedWeekId: published.id, draftWeekId: draft.id, enrolledCookie: cookieFor(enrolledSession), isolatedCookie: cookieFor(isolatedSession) });
} else {
  throw new Error("Uso: node scripts/pocketbase/e2e-cohort-fixture.mjs setup|sessions|cleanup");
}
