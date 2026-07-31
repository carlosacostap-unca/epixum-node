import { createAdminClient, outputJson } from "./client.mjs";
import { COLLECTION_DEFINITIONS, EXISTING_COLLECTION_ADDITIONS, materializeField, mergeIndexes } from "./cohort-schema.mjs";

const apply = process.argv.includes("--apply");
const pb = await createAdminClient();
let collections = await pb.collections.getFullList({ requestKey: null });
let byName = new Map(collections.map((collection) => [collection.name, collection]));
const operations = [];

for (const [name, definition] of Object.entries(COLLECTION_DEFINITIONS)) {
  if (!byName.has(name)) {
    operations.push({ action: "create_collection", collection: name });
    if (apply) {
      const fields = definition.fields.map((field) => materializeField(field, byName));
      const created = await pb.collections.create({ name, type: definition.type, fields, indexes: definition.indexes, ...definition.rules }, { requestKey: null });
      byName.set(name, created);
    }
  }
}

if (apply) {
  collections = await pb.collections.getFullList({ requestKey: null });
  byName = new Map(collections.map((collection) => [collection.name, collection]));
}

for (const [name, definition] of Object.entries(COLLECTION_DEFINITIONS)) {
  const collection = byName.get(name);
  if (!collection) continue;
  const fields = [...collection.fields];
  let changed = false;
  for (const field of definition.fields) {
    if (!fields.some((existing) => existing.name === field.name)) {
      fields.push(materializeField(field, byName, !apply));
      operations.push({ action: "add_field", collection: name, field: field.name });
      changed = true;
    }
  }
  const indexes = mergeIndexes(collection.indexes, definition.indexes);
  const indexesChanged = JSON.stringify(indexes) !== JSON.stringify(collection.indexes || []);
  const rulesChanged = Object.entries(definition.rules).some(([key, value]) => collection[key] !== value);
  if (indexesChanged) operations.push({ action: "merge_indexes", collection: name });
  if (rulesChanged) operations.push({ action: "set_transition_rules", collection: name });
  if (apply && (changed || indexesChanged || rulesChanged)) {
    await pb.collections.update(collection.id, { fields, indexes, ...definition.rules }, { requestKey: null });
  }
}

for (const [name, additions] of Object.entries(EXISTING_COLLECTION_ADDITIONS)) {
  const collection = byName.get(name);
  if (!collection) throw new Error(`Falta la colección existente ${name}.`);
  const fields = collection.fields.map((field) =>
    (name === "classes" || name === "assignments") && field.name === "sprint"
      ? { ...field, required: false }
      : field,
  );
  let changed = fields.some((field, index) => field.required !== collection.fields[index]?.required);
  if (changed) operations.push({ action: "make_optional", collection: name, field: "sprint" });
  for (const field of additions) {
    if (!fields.some((existing) => existing.name === field.name)) {
      fields.push(materializeField(field, byName, !apply));
      operations.push({ action: "add_field", collection: name, field: field.name });
      changed = true;
    }
  }
  if (apply && changed) await pb.collections.update(collection.id, { fields }, { requestKey: null });
}

outputJson({ mode: apply ? "apply" : "dry-run", changed: operations.length > 0, operations });
