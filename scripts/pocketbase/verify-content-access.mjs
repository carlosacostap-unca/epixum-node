import { randomBytes } from "node:crypto";
import { createAdminClient, outputJson } from "./client.mjs";
import { CONTENT_COLLECTION_DEFINITIONS } from "./content-schema.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.admin || !args.teacher || !args.student) throw new Error("Indicá --admin, --teacher y --student con usuarios de prueba para los tres roles.");

const pb = await createAdminClient();
const [adminRecord, teacherRecord, studentRecord] = await Promise.all([
  pb.collection("users").getOne(args.admin),
  pb.collection("users").getOne(args.teacher),
  pb.collection("users").getOne(args.student),
]);
assertRole(adminRecord, "admin");
assertRole(teacherRecord, "docente");
assertRole(studentRecord, "estudiante");

const [admin, teacher, student] = await Promise.all([
  pb.collection("users").impersonate(adminRecord.id, 300),
  pb.collection("users").impersonate(teacherRecord.id, 300),
  pb.collection("users").impersonate(studentRecord.id, 300),
]);

const checks = [];
await expectStatus(checks, "admin lista secciones", () => admin.collection("content_sections").getList(1, 1), "allow");
await expectStatus(checks, "docente lista secciones", () => teacher.collection("content_sections").getList(1, 1), "allow");
await expectHiddenList(checks, "estudiante no lista secciones directas", () => student.collection("content_sections").getList(1, 1));
await expectStatus(checks, "admin lista bases", () => admin.collection("content_bases").getList(1, 1), "allow");
await expectStatus(checks, "docente lista bases", () => teacher.collection("content_bases").getList(1, 1), "allow");
await expectHiddenList(checks, "estudiante no lista bases", () => student.collection("content_bases").getList(1, 1));

for (const collection of ["content_section_revisions", "content_activity_attempts", "content_section_progress"]) {
  await expectStatus(checks, `admin no lee ${collection} por API directa`, () => admin.collection(collection).getList(1, 1), 403);
  await expectStatus(checks, `docente no lee ${collection} por API directa`, () => teacher.collection(collection).getList(1, 1), 403);
  await expectStatus(checks, `estudiante no lee ${collection} por API directa`, () => student.collection(collection).getList(1, 1), 403);
}

await probeBaseCreate(checks, pb, admin, "admin crea bases", adminRecord.id, true);
await probeBaseCreate(checks, pb, teacher, "docente no crea bases", teacherRecord.id, false);
await probeBaseCreate(checks, pb, student, "estudiante no crea bases", studentRecord.id, false);

const schemas = await Promise.all(Object.keys(CONTENT_COLLECTION_DEFINITIONS).map((name) => pb.collections.getOne(name)));
for (const schema of schemas) {
  const expected = CONTENT_COLLECTION_DEFINITIONS[schema.name].indexes;
  for (const index of expected) {
    const indexName = index.match(/INDEX\s+(\S+)/i)?.[1];
    if (!indexName || !(schema.indexes ?? []).some((actual) => actual.includes(indexName))) throw new Error(`Falta el índice ${indexName ?? index} en ${schema.name}.`);
  }
  checks.push({ check: `índices de ${schema.name}`, result: "allow" });
}

outputJson({ verifiedAt: new Date().toISOString(), roles: { admin: adminRecord.id, teacher: teacherRecord.id, student: studentRecord.id }, checks, passed: checks.length });

async function expectStatus(checks, check, operation, expected) {
  try {
    await operation();
    if (expected !== "allow") throw new Error(`${check}: se esperaba HTTP ${expected}, pero la operación fue permitida.`);
    checks.push({ check, result: "allow" });
  } catch (error) {
    const status = Number(error?.status || 0);
    if (expected === "allow" || status !== expected) throw new Error(`${check}: se esperaba ${expected}, se obtuvo HTTP ${status || "desconocido"}.`);
    checks.push({ check, result: `deny_${status}` });
  }
}

async function expectHiddenList(checks, check, operation) {
  const result = await operation();
  if (result.totalItems !== 0 || result.items.length !== 0) throw new Error(`${check}: la API reveló ${result.totalItems} registros.`);
  checks.push({ check, result: "hidden_empty_list" });
}

async function probeBaseCreate(checks, superuser, client, check, userId, shouldAllow) {
  const id = randomBytes(10).toString("hex").slice(0, 15);
  let created = false;
  try {
    await client.collection("content_bases").create({ id, name: `Verificación temporal ${id}`, kind: "section", description: "", active: true, createdBy: userId });
    created = true;
    if (!shouldAllow) throw new Error(`${check}: la API permitió una escritura que debía rechazar.`);
    checks.push({ check, result: "allow_and_clean" });
  } catch (error) {
    const status = Number(error?.status || 0);
    if (shouldAllow || (status !== 400 && status !== 403)) throw error;
    checks.push({ check, result: `deny_${status}` });
  } finally {
    if (created) await superuser.collection("content_bases").delete(id).catch(() => undefined);
  }
}

function assertRole(record, expected) {
  if (record.role !== expected) throw new Error(`El usuario ${record.id} debe tener rol ${expected}.`);
}

function parseArgs(values) {
  const result = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === "--admin") result.admin = values[++index];
    else if (value === "--teacher") result.teacher = values[++index];
    else if (value === "--student") result.student = values[++index];
    else throw new Error(`Argumento desconocido: ${value}`);
  }
  return result;
}
