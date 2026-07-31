import test from "node:test";
import assert from "node:assert/strict";
import { IMPORT_HEADERS, normalizeAdmissionRow } from "./student-admission-import.mjs";
import { COLLECTION_DEFINITIONS } from "./cohort-schema.mjs";

test("normaliza exclusivamente los cinco campos admitidos por la importación", () => {
  const headers = [...IMPORT_HEADERS, "avatar_url", "recomendado"];
  const parsed = normalizeAdmissionRow(headers, ["  Ana   Pérez  ", " ANA@EXAMPLE.COM ", " 123 ", "2000-01-02", " 3834000000 ", "https://example.com/avatar", "true"]);
  assert.deepEqual(parsed, { displayName: "Ana Pérez", email: "ana@example.com", dni: "123", birthDate: "2000-01-02", phone: "3834000000" });
  assert.equal("avatar_url" in parsed, false);
  assert.equal("recomendado" in parsed, false);
});

test("rechaza cabeceras faltantes, correos inválidos y fechas no ISO", () => {
  assert.throws(() => normalizeAdmissionRow(["nombre_completo"], ["Ana Pérez"]), /Faltan columnas/);
  assert.throws(() => normalizeAdmissionRow(IMPORT_HEADERS, ["Ana Pérez", "correo", "", "", ""]), /Correo inválido/);
  assert.throws(() => normalizeAdmissionRow(IMPORT_HEADERS, ["Ana Pérez", "ana@example.com", "", "02-01-2000", ""]), /Fecha de nacimiento inválida/);
});

test("el esquema declara los campos personales opcionales de admisión", () => {
  const fields = new Map(COLLECTION_DEFINITIONS.student_admissions.fields.map((field) => [field.name, field]));
  for (const name of ["dni", "birthDate", "phone"]) assert.equal(fields.get(name)?.required, false);
});
