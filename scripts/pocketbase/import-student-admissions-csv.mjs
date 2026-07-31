import fs from "node:fs/promises";
import { resolve } from "node:path";
import { Workbook } from "@oai/artifact-tool";
import { createAdminClient, outputJson, projectRoot } from "./client.mjs";
import { normalizeAdmissionRow } from "./student-admission-import.mjs";

const apply = process.argv.includes("--apply");
const fileArg = process.argv.find((argument) => argument.startsWith("--file="));
const cohortArg = process.argv.find((argument) => argument.startsWith("--cohort="));
const sourcePath = resolve(projectRoot, fileArg?.slice("--file=".length) || "docs/alumnos_aprobados.csv");
const cohortId = cohortArg?.slice("--cohort=".length) || "kfkcnaet6t8gf8e";
const csvText = await fs.readFile(sourcePath, "utf8");
const workbook = await Workbook.fromCSV(csvText, { sheetName: "Alumnos" });
const values = workbook.worksheets.getItem("Alumnos").getUsedRange(true).values;
const headers = values[0] || [];
const parsedRows = values.slice(1).filter((row) => row.some((value) => String(value ?? "").trim())).map((row) => normalizeAdmissionRow(headers, row));
const emails = parsedRows.map((row) => row.email);
if (emails.length !== new Set(emails).size) throw new Error("El CSV contiene correos duplicados.");

const pb = await createAdminClient();
await pb.collection("cohorts").getOne(cohortId);
const [users, pendingAdmissions] = await Promise.all([
  pb.collection("users").getFullList({ fields: "email" }),
  pb.collection("student_admissions").getFullList({ filter: pb.filter("cohort = {:cohort} && status = 'pending'", { cohort: cohortId }), fields: "normalizedEmail,displayName,dni,birthDate,phone" }),
]);
const existingEmails = new Set(users.map((user) => String(user.email || "").trim().toLowerCase()));
const pendingEmails = new Set(pendingAdmissions.map((admission) => String(admission.normalizedEmail || "").trim().toLowerCase()));
const pendingByEmail = new Map(pendingAdmissions.map((admission) => [String(admission.normalizedEmail || "").trim().toLowerCase(), admission]));
const candidates = parsedRows.filter((row) => !existingEmails.has(row.email) && !pendingEmails.has(row.email));
const importedPending = parsedRows.map((row) => ({ row, admission: pendingByEmail.get(row.email) })).filter((item) => item.admission);
const sameDate = (stored, expected) => !expected ? !stored : String(stored || "").startsWith(expected);
const mismatchedRecords = importedPending.filter(({ row, admission }) =>
  admission.displayName !== row.displayName || String(admission.dni || "") !== row.dni || !sameDate(admission.birthDate, row.birthDate) || String(admission.phone || "") !== row.phone,
).length;

if (apply) {
  for (const row of candidates) {
    await pb.collection("student_admissions").create({
      normalizedEmail: row.email,
      displayName: row.displayName,
      ...(row.dni ? { dni: row.dni } : {}),
      ...(row.birthDate ? { birthDate: row.birthDate } : {}),
      ...(row.phone ? { phone: row.phone } : {}),
      cohort: cohortId,
      entryType: "new",
      status: "pending",
    });
  }
}

outputJson({
  mode: apply ? "applied" : "dry-run",
  sourceRows: parsedRows.length,
  createdAdmissions: apply ? candidates.length : 0,
  pendingAdmissions: apply ? 0 : candidates.length,
  skippedExistingUsers: parsedRows.filter((row) => existingEmails.has(row.email)).length,
  skippedPendingAdmissions: parsedRows.filter((row) => pendingEmails.has(row.email)).length,
  verifiedPendingAdmissions: importedPending.length,
  mismatchedRecords,
  storedFieldCoverage: {
    nombre_completo: importedPending.filter(({ admission }) => admission.displayName).length,
    email: importedPending.filter(({ admission }) => admission.normalizedEmail).length,
    dni: importedPending.filter(({ admission }) => admission.dni).length,
    fecha_nacimiento: importedPending.filter(({ admission }) => admission.birthDate).length,
    telefono: importedPending.filter(({ admission }) => admission.phone).length,
  },
  fieldCoverage: {
    nombre_completo: parsedRows.filter((row) => row.displayName).length,
    email: parsedRows.filter((row) => row.email).length,
    dni: parsedRows.filter((row) => row.dni).length,
    fecha_nacimiento: parsedRows.filter((row) => row.birthDate).length,
    telefono: parsedRows.filter((row) => row.phone).length,
  },
});
