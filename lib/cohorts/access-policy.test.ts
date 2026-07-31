import assert from "node:assert/strict";
import test from "node:test";
import { isStaffRole, isStudentRole } from "./access-policy.ts";

test("teacher-only screens reject students", () => {
  assert.equal(isStaffRole("estudiante"), false);
});

test("unknown or missing roles fail closed", () => {
  assert.equal(isStaffRole(""), false);
  assert.equal(isStaffRole(undefined), false);
  assert.equal(isStudentRole(""), false);
  assert.equal(isStudentRole(undefined), false);
});

test("teacher-only screens remain available to teachers and administrators", () => {
  assert.equal(isStaffRole("docente"), true);
  assert.equal(isStaffRole("admin"), true);
});
