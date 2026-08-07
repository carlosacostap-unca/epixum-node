import test from "node:test";
import assert from "node:assert/strict";
import { assertExclusiveAcademicParent, assertModeCapability, existingStudentEnrollmentInputSchema, normalizeEmail, weekInputSchema } from "./domain.ts";
import { activeEnrollmentUserIds, academicProgressStatus, inquiryStatusCount } from "./progress.ts";
import { cohortCacheScope } from "./cache.ts";
import { bulkEnrollmentCandidateIds, planEnrollmentMutation } from "./enrollment.ts";
import { canStudentViewWeek, weekPublicationPatch } from "./publication.ts";
import { admissionProfilePatch, oauthAccessDecision } from "./oauth-policy.ts";

test("normaliza el correo usado por admisiones y OAuth", () => {
  assert.equal(normalizeEmail("  Alumno@Example.COM "), "alumno@example.com");
});

test("exige exactamente un padre académico", () => {
  assert.deepEqual(assertExclusiveAcademicParent({ week: "w1" }), { sprint: null, week: "w1" });
  assert.throws(() => assertExclusiveAcademicParent({}), /exactamente/);
  assert.throws(() => assertExclusiveAcademicParent({ sprint: "s1", week: "w1" }), /exactamente/);
});

test("la modalidad semanal rechaza equipos, revisiones y encuestas", () => {
  for (const capability of ["teams", "reviews", "surveys"]) assert.throws(() => assertModeCapability("weekly", capability));
  assert.doesNotThrow(() => assertModeCapability("weekly", "weeks"));
});

test("la numeración semanal admite cero y rechaza negativos o decimales", () => {
  const validWeek = { number: "0", title: "Semana 0", description: "Preparación" };
  assert.equal(weekInputSchema.parse(validWeek).number, 0);
  assert.throws(() => weekInputSchema.parse({ ...validWeek, number: "-1" }));
  assert.throws(() => weekInputSchema.parse({ ...validWeek, number: "0.5" }));
});

test("calcula progreso e indicadores de consultas por semana", () => {
  assert.equal(academicProgressStatus(0, 0), "empty");
  assert.equal(academicProgressStatus(1, 2), "pending");
  assert.equal(academicProgressStatus(2, 2), "complete");
  assert.equal(inquiryStatusCount([{ week: "w1", status: "Pendiente" }, { week: undefined, status: "Pendiente" }], "w1", "Pendiente"), 1);
});

test("separa al recursante por inscripción y la caché por cohorte", () => {
  const enrollments = [{ user: "u1", cohort: "legacy", status: "completed" }, { user: "u1", cohort: "weekly", status: "active" }];
  assert.deepEqual(activeEnrollmentUserIds(enrollments, "legacy"), []);
  assert.deepEqual(activeEnrollmentUserIds(enrollments, "weekly"), ["u1"]);
  assert.notDeepEqual(cohortCacheScope("token", "legacy"), cohortCacheScope("token", "weekly"));
});

test("alta, reactivación y reintento de inscripción son idempotentes", () => {
  assert.equal(planEnrollmentMutation(null, "new").action, "create");
  assert.equal(planEnrollmentMutation({ status: "completed", entryType: "new" }, "repeater").action, "update");
  assert.equal(planEnrollmentMutation({ status: "active", entryType: "repeater" }, "repeater").action, "none");
});

test("la matrícula de un usuario registrado exige identificador y condición válidos", () => {
  assert.deepEqual(existingStudentEnrollmentInputSchema.parse({ userId: "student-1", entryType: "repeater" }), { userId: "student-1", entryType: "repeater" });
  assert.throws(() => existingStudentEnrollmentInputSchema.parse({ userId: "", entryType: "repeater" }));
  assert.throws(() => existingStudentEnrollmentInputSchema.parse({ userId: "student-1", entryType: "teacher" }));
});

test("la matriculación masiva omite cualquier matrícula existente y elimina duplicados", () => {
  assert.deepEqual(bulkEnrollmentCandidateIds(["u1", "u2", "u2", "u3"], ["u1", "u3"]), ["u2"]);
});

test("la publicación semanal es manual y reversible", () => {
  const now = new Date("2026-08-01T12:00:00.000Z");
  assert.deepEqual(weekPublicationPatch(true, now), { publicationStatus: "published", publishedAt: now.toISOString() });
  assert.deepEqual(weekPublicationPatch(false, now), { publicationStatus: "draft", publishedAt: null });
  assert.equal(canStudentViewWeek("draft"), false);
  assert.equal(canStudentViewWeek("published"), true);
});

test("OAuth permite personal, reclama admisiones y rechaza cuentas desconocidas", () => {
  assert.equal(oauthAccessDecision("admin", 0, 0), "allow");
  assert.equal(oauthAccessDecision("estudiante", 1, 0), "allow");
  assert.equal(oauthAccessDecision(undefined, 0, 2), "claim");
  assert.equal(oauthAccessDecision(undefined, 0, 0), "reject");
});

test("OAuth transfiere al perfil sólo los datos personales informados en la admisión", () => {
  assert.deepEqual(admissionProfilePatch({ displayName: " Ana Pérez ", dni: " 123 ", birthDate: "2000-01-02", phone: " 3834 " }), {
    role: "estudiante",
    name: "Ana Pérez",
    dni: "123",
    birthDate: "2000-01-02",
    phone: "3834",
  });
  assert.deepEqual(admissionProfilePatch({ displayName: "Ana Pérez", dni: "", birthDate: "", phone: "" }), { role: "estudiante", name: "Ana Pérez" });
});
