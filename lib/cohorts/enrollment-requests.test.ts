import assert from "node:assert/strict";
import test from "node:test";
import { assertEnrollmentRequestReviewer, enrollmentRequestInputSchema, hasPendingEnrollmentRequestDuplicate, normalizeDni, planEnrollmentRequestResolution } from "./enrollment-requests.ts";

const validInput = { firstName: "Ana", lastName: "Pérez", dni: "30.123.456", birthDate: "1995-05-20", email: " ANA@EXAMPLE.COM ", phone: "+54 9 11 5555-5555", cohortId: "cohort", website: "" };

test("normaliza y valida todos los datos de una solicitud", () => {
  const parsed = enrollmentRequestInputSchema.parse(validInput);
  assert.equal(parsed.dni, "30123456");
  assert.equal(parsed.email, "ana@example.com");
  assert.equal(normalizeDni("30.123.456"), "30123456");
  assert.throws(() => enrollmentRequestInputSchema.parse({ ...validInput, birthDate: "2999-01-01" }), /anterior a hoy/);
});

test("detecta solicitudes pendientes duplicadas", () => {
  assert.equal(hasPendingEnrollmentRequestDuplicate({ emailMatch: true, dniMatch: false }), true);
  assert.equal(hasPendingEnrollmentRequestDuplicate({ emailMatch: false, dniMatch: false }), false);
});

test("planifica admisión, reutilización y conflictos de identidad", () => {
  assert.deepEqual(planEnrollmentRequestResolution({ emailUser: null, dniUsers: [] }), { action: "create_admission" });
  assert.deepEqual(planEnrollmentRequestResolution({ emailUser: { id: "u1" }, dniUsers: [] }), { action: "use_user", userId: "u1", matchedBy: "email" });
  assert.deepEqual(planEnrollmentRequestResolution({ emailUser: null, dniUsers: [{ id: "u2", role: "estudiante" }] }), { action: "use_user", userId: "u2", matchedBy: "dni" });
  assert.equal(planEnrollmentRequestResolution({ emailUser: { id: "u1" }, dniUsers: [{ id: "u2" }] }).action, "conflict");
  assert.equal(planEnrollmentRequestResolution({ emailUser: { id: "staff", role: "docente" }, dniUsers: [] }).action, "conflict");
});

test("sólo personal puede revisar solicitudes", () => {
  assert.doesNotThrow(() => assertEnrollmentRequestReviewer("docente"));
  assert.doesNotThrow(() => assertEnrollmentRequestReviewer("admin"));
  assert.throws(() => assertEnrollmentRequestReviewer("estudiante"), /No autorizado/);
});
