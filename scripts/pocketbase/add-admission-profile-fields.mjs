import { createAdminClient, outputJson } from "./client.mjs";
import { COLLECTION_DEFINITIONS, materializeField } from "./cohort-schema.mjs";

const apply = process.argv.includes("--apply");
const pb = await createAdminClient();
const collection = await pb.collections.getOne("student_admissions", { requestKey: null });
const collections = await pb.collections.getFullList({ requestKey: null });
const byName = new Map(collections.map((item) => [item.name, item]));
const requestedNames = new Set(["dni", "birthDate", "phone"]);
const definitions = COLLECTION_DEFINITIONS.student_admissions.fields.filter((field) => requestedNames.has(field.name));
const fields = [...collection.fields];
const addedFields = [];

for (const definition of definitions) {
  if (fields.some((field) => field.name === definition.name)) continue;
  fields.push(materializeField(definition, byName));
  addedFields.push(definition.name);
}

if (apply && addedFields.length) await pb.collections.update(collection.id, { fields }, { requestKey: null });
outputJson({ mode: apply ? "applied" : "dry-run", collection: collection.name, addedFields });
