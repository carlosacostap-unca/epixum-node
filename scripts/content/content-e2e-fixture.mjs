import { randomBytes } from "node:crypto";
import { createAdminClient, outputJson } from "../pocketbase/client.mjs";
import { buildContentRequirements } from "../../lib/content/revisions.ts";

const FIXTURE_SLUG = "content-e2e-isolated";
const FIXTURE_EMAIL = "content-e2e-isolated@example.invalid";
const command = process.argv[2];
if (!new Set(["setup", "cleanup", "schedule", "publish", "hide", "attempt", "progress", "inspect"]).has(command)) {
  throw new Error("Usá `setup`, `schedule`, `publish`, `hide`, `attempt`, `progress` o `cleanup`.");
}

const pb = await createAdminClient();
if (command === "cleanup") {
  outputJson({ mode: "cleanup", removed: await cleanupFixture(pb) });
} else if (command === "attempt" || command === "progress" || command === "inspect") {
  const cohort = await pb.collection("cohorts").getFirstListItem(pb.filter("slug = {:slug}", { slug: FIXTURE_SLUG }));
  const section = await pb.collection("content_sections").getFirstListItem(pb.filter("cohort = {:cohort} && sourceKey = 'content_e2e_section'", { cohort: cohort.id }));
  const revision = await pb.collection("content_section_revisions").getOne(section.currentRevision);
  const user = await pb.collection("users").getFirstListItem(pb.filter("email = {:email}", { email: FIXTURE_EMAIL }));
  if (command === "inspect") {
    const attempts = await pb.collection("content_activity_attempts").getFullList({ filter: pb.filter("section = {:section}", { section: section.id }), sort: "attemptedAt" });
    const progress = await pb.collection("content_section_progress").getFullList({ filter: pb.filter("section = {:section}", { section: section.id }) });
    outputJson({ mode: "inspect", attempts: attempts.map(({ id, activityKey, activityRevision, outcome }) => ({ id, activityKey, activityRevision, outcome })), progress: progress.map(({ id, masteredActivities, requirementsRevision, completedAt, viewCount }) => ({ id, masteredActivities, requirementsRevision, completedAt, viewCount })) });
  } else if (command === "attempt") {
    const manifest = revision.activityManifest[0];
    const created = await pb.collection("content_activity_attempts").create({ cohort: cohort.id, week: section.week, section: section.id, sectionRevision: revision.id, student: user.id, activityKey: manifest.activityKey, activityRevision: manifest.activityRevision, activityKind: manifest.kind, response: { selectedOptionKeys: ["option_no"] }, outcome: "incorrect", attemptKey: randomBytes(18).toString("base64url"), attemptedAt: new Date().toISOString() });
    outputJson({ mode: "attempt", id: created.id });
  } else {
    const now = new Date().toISOString();
    const created = await pb.collection("content_section_progress").create({ cohort: cohort.id, week: section.week, section: section.id, student: user.id, lastRevision: revision.id, firstViewedAt: now, lastViewedAt: now, viewCount: 1, masteredActivities: {}, requirementsRevision: revision.requirementsRevision });
    outputJson({ mode: "progress", id: created.id });
  }
} else if (command !== "setup") {
  const cohort = await pb.collection("cohorts").getFirstListItem(pb.filter("slug = {:slug}", { slug: FIXTURE_SLUG }));
  const section = await pb.collection("content_sections").getFirstListItem(pb.filter("cohort = {:cohort} && sourceKey = 'content_e2e_section'", { cohort: cohort.id }));
  const patches = {
    schedule: { status: "scheduled", scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), publishedAt: null },
    publish: { status: "published", scheduledAt: null, publishedAt: new Date().toISOString() },
    hide: { status: "hidden", scheduledAt: null },
  };
  await pb.collection("content_sections").update(section.id, patches[command]);
  outputJson({ mode: command, cohortId: cohort.id, sectionId: section.id, patch: patches[command] });
} else {
  await cleanupFixture(pb);
  const admin = await pb.collection("users").getFirstListItem('role = "admin"');
  const ids = Object.fromEntries(["user", "cohort", "week", "enrollment", "section", "revision", "base", "baseVersion"].map((name) => [name, pocketBaseId()]));
  const password = `E2e-${randomBytes(12).toString("base64url")}!`;
  const blocks = [
    { key: "intro_e2e", type: "rich_text", content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Contenido aislado para validar el recorrido completo." }] }] } },
    { key: "question_e2e", type: "question", activityKey: "activity_e2e", required: true, questionKind: "single", prompt: "¿Node.js permite ejecutar JavaScript fuera del navegador?", options: [{ key: "option_no", label: "No" }, { key: "option_yes", label: "Sí" }], correctOptionKeys: ["option_yes"] },
  ];
  const requirements = buildContentRequirements(blocks);
  const snapshot = { schemaVersion: 1, kind: "week", week: { number: 1, title: "Semana E2E", description: "Fixture aislada", sections: [{ position: 1, title: "Sección E2E", summary: "Recorrido temporal", sourceKey: "content_e2e_section", blocks }] } };

  try {
    await pb.collection("users").create({ id: ids.user, email: FIXTURE_EMAIL, emailVisibility: false, password, passwordConfirm: password, name: "Alumno E2E aislado", role: "estudiante" });
    await pb.collection("cohorts").create({ id: ids.cohort, name: "Cohorte E2E aislada", slug: FIXTURE_SLUG, mode: "weekly", status: "active" });
    await pb.collection("weeks").create({ id: ids.week, cohort: ids.cohort, number: 1, title: "Semana E2E", description: "Fixture temporal de contenidos", publicationStatus: "published", publishedAt: new Date().toISOString() });
    await pb.collection("cohort_enrollments").create({ id: ids.enrollment, user: ids.user, cohort: ids.cohort, status: "active", entryType: "new", enrolledAt: new Date().toISOString() });
    await pb.collection("content_sections").create({ id: ids.section, cohort: ids.cohort, week: ids.week, position: 1, title: "Sección E2E", summary: "Recorrido temporal", status: "draft", sourceKey: "content_e2e_section" });
    await pb.collection("content_section_revisions").create({ id: ids.revision, section: ids.section, revisionNumber: 1, blocks, activityManifest: requirements.activities, requirementsRevision: requirements.requirementsRevision, note: "Fixture E2E temporal", author: admin.id });
    await pb.collection("content_sections").update(ids.section, { currentRevision: ids.revision });
    await pb.collection("content_bases").create({ id: ids.base, name: "Base E2E aislada", kind: "week", description: "Fixture temporal", active: true, createdBy: admin.id });
    await pb.collection("content_base_versions").create({ id: ids.baseVersion, base: ids.base, versionNumber: 1, snapshot, sourceKind: "promotion", sourceReference: ids.week, note: "Fixture E2E temporal", createdBy: admin.id });
    await pb.collection("content_bases").update(ids.base, { currentVersion: ids.baseVersion });
    outputJson({ mode: "setup", ids, adminId: admin.id, requirementsRevision: requirements.requirementsRevision, activityRevision: requirements.activities[0].activityRevision });
  } catch (error) {
    await cleanupFixture(pb);
    throw error;
  }
}

async function cleanupFixture(client) {
  const cohorts = await client.collection("cohorts").getFullList({ filter: client.filter("slug = {:slug}", { slug: FIXTURE_SLUG }) });
  const users = await client.collection("users").getFullList({ filter: client.filter("email = {:email}", { email: FIXTURE_EMAIL }) });
  const cohortIds = cohorts.map((item) => item.id);
  const removed = { attempts: 0, progress: 0, revisions: 0, sections: 0, enrollments: 0, weeks: 0, bases: 0, baseVersions: 0, cohorts: 0, users: 0 };
  for (const cohortId of cohortIds) {
    const sections = await client.collection("content_sections").getFullList({ filter: client.filter("cohort = {:cohort}", { cohort: cohortId }) });
    for (const section of sections) {
      for (const attempt of await client.collection("content_activity_attempts").getFullList({ filter: client.filter("section = {:section}", { section: section.id }) })) { await client.collection("content_activity_attempts").delete(attempt.id); removed.attempts += 1; }
      for (const progress of await client.collection("content_section_progress").getFullList({ filter: client.filter("section = {:section}", { section: section.id }) })) { await client.collection("content_section_progress").delete(progress.id); removed.progress += 1; }
      await client.collection("content_sections").update(section.id, { currentRevision: null });
      for (const revision of await client.collection("content_section_revisions").getFullList({ filter: client.filter("section = {:section}", { section: section.id }) })) { await client.collection("content_section_revisions").delete(revision.id); removed.revisions += 1; }
      await client.collection("content_sections").delete(section.id); removed.sections += 1;
    }
    for (const enrollment of await client.collection("cohort_enrollments").getFullList({ filter: client.filter("cohort = {:cohort}", { cohort: cohortId }) })) { await client.collection("cohort_enrollments").delete(enrollment.id); removed.enrollments += 1; }
    for (const week of await client.collection("weeks").getFullList({ filter: client.filter("cohort = {:cohort}", { cohort: cohortId }) })) { await client.collection("weeks").delete(week.id); removed.weeks += 1; }
    await client.collection("cohorts").delete(cohortId); removed.cohorts += 1;
  }
  const bases = await client.collection("content_bases").getFullList({ filter: 'name = "Base E2E aislada"' });
  for (const base of bases) {
    await client.collection("content_bases").update(base.id, { currentVersion: null });
    for (const version of await client.collection("content_base_versions").getFullList({ filter: client.filter("base = {:base}", { base: base.id }) })) { await client.collection("content_base_versions").delete(version.id); removed.baseVersions += 1; }
    await client.collection("content_bases").delete(base.id); removed.bases += 1;
  }
  for (const user of users) { await client.collection("users").delete(user.id); removed.users += 1; }
  return removed;
}

function pocketBaseId() {
  return randomBytes(10).toString("hex").slice(0, 15);
}
