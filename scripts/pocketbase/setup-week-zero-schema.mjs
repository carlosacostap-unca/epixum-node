import { createAdminClient, outputJson } from "./client.mjs";
import { COLLECTION_DEFINITIONS, reconcileFieldDefinition } from "./cohort-schema.mjs";

const apply = process.argv.includes("--apply");
const pb = await createAdminClient();
const collections = await pb.collections.getFullList({ requestKey: null });
const byName = new Map(collections.map((collection) => [collection.name, collection]));
const weeks = byName.get("weeks");

if (!weeks) throw new Error("Falta la colección weeks.");

const desired = COLLECTION_DEFINITIONS.weeks.fields.find((field) => field.name === "number");
const fieldIndex = weeks.fields.findIndex((field) => field.name === "number");

if (!desired || fieldIndex === -1) throw new Error("Falta el campo weeks.number.");

const reconciled = reconcileFieldDefinition(weeks.fields[fieldIndex], desired, byName, !apply);
const operations = reconciled.changed
  ? [{ action: "update_field", collection: "weeks", field: "number", properties: reconciled.changedKeys }]
  : [];

if (apply && reconciled.changed) {
  const fields = [...weeks.fields];
  fields[fieldIndex] = reconciled.field;
  await pb.collections.update(weeks.id, { fields }, { requestKey: null });
}

outputJson({ mode: apply ? "apply" : "dry-run", changed: operations.length > 0, operations });
