import { createAdminClient, outputJson } from "./client.mjs";
import { CONTENT_COLLECTION_DEFINITIONS, assertContentDefinitions, materializeContentField, planContentSchema } from "./content-schema.mjs";
import { mergeIndexes } from "./cohort-schema.mjs";

const apply = process.argv.includes("--apply");
assertContentDefinitions();
const pb = await createAdminClient();
let collections = await pb.collections.getFullList({ requestKey: null });
let byName = new Map(collections.map((collection) => [collection.name, collection]));
const operations = planContentSchema(collections);

if (apply) {
  for (const [name, definition] of Object.entries(CONTENT_COLLECTION_DEFINITIONS)) {
    if (byName.has(name)) continue;
    const fields = definition.fields.filter((field) => !field.deferred).map((field) => materializeContentField(field, byName));
    const created = await pb.collections.create({ name, type: definition.type, fields, indexes: definition.indexes, ...definition.rules }, { requestKey: null });
    byName.set(name, created);
  }

  collections = await pb.collections.getFullList({ requestKey: null });
  byName = new Map(collections.map((collection) => [collection.name, collection]));

  for (const [name, definition] of Object.entries(CONTENT_COLLECTION_DEFINITIONS)) {
    const collection = byName.get(name);
    const fields = [...collection.fields];
    for (const field of definition.fields) {
      const index = fields.findIndex((current) => current.name === field.name);
      const desired = materializeContentField(field, byName);
      if (index < 0) fields.push(desired);
      else if (fields[index].required !== desired.required) fields[index] = { ...fields[index], required: desired.required };
    }
    const indexes = mergeIndexes(collection.indexes, definition.indexes);
    const changed = JSON.stringify(fields) !== JSON.stringify(collection.fields)
      || JSON.stringify(indexes) !== JSON.stringify(collection.indexes || [])
      || Object.entries(definition.rules).some(([key, value]) => collection[key] !== value);
    if (changed) await pb.collections.update(collection.id, { fields, indexes, ...definition.rules }, { requestKey: null });
  }
}

outputJson({ mode: apply ? "apply" : "dry-run", changed: operations.length > 0, operations });
