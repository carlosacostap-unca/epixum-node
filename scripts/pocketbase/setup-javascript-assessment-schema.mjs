import { createAdminClient, outputJson } from "./client.mjs";
import { COLLECTION_DEFINITIONS, materializeField, mergeIndexes } from "./cohort-schema.mjs";

const apply = process.argv.includes("--apply");
const name = "javascript_assessment_results";
const definition = COLLECTION_DEFINITIONS[name];
const pb = await createAdminClient();
const collections = await pb.collections.getFullList({ requestKey: null });
const byName = new Map(collections.map((collection) => [collection.name, collection]));
const existing = byName.get(name);
const operations = [];

if (!existing) {
  operations.push({ action: "create_collection", collection: name });
  if (apply) {
    await pb.collections.create({
      name,
      type: definition.type,
      fields: definition.fields.map((field) => materializeField(field, byName)),
      indexes: definition.indexes,
      ...definition.rules,
    }, { requestKey: null });
  }
} else {
  const fields = [...existing.fields];
  let fieldsChanged = false;
  for (const field of definition.fields) {
    if (!fields.some((current) => current.name === field.name)) {
      fields.push(materializeField(field, byName));
      operations.push({ action: "add_field", collection: name, field: field.name });
      fieldsChanged = true;
    }
  }
  const indexes = mergeIndexes(existing.indexes, definition.indexes);
  const indexesChanged = JSON.stringify(indexes) !== JSON.stringify(existing.indexes || []);
  const rulesChanged = Object.entries(definition.rules).some(([key, value]) => existing[key] !== value);
  if (indexesChanged) operations.push({ action: "merge_indexes", collection: name });
  if (rulesChanged) operations.push({ action: "close_api_rules", collection: name });
  if (apply && (fieldsChanged || indexesChanged || rulesChanged)) {
    await pb.collections.update(existing.id, { fields, indexes, ...definition.rules }, { requestKey: null });
  }
}

outputJson({ mode: apply ? "apply" : "dry-run", changed: operations.length > 0, operations });
