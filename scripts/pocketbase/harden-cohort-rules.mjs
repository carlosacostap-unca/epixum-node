import { createAdminClient, outputJson } from "./client.mjs";
import { HARDENED_RULES, ruleChanges } from "./cohort-rules.mjs";

const apply = process.argv.includes("--apply");
const pb = await createAdminClient();
const collections = await pb.collections.getFullList({ requestKey: null });
const operations = ruleChanges(collections);
if (operations.some(item => item.action === "missing_collection")) throw new Error("No se puede endurecer: faltan colecciones requeridas.");

if (apply) {
  const byName = new Map(collections.map(item => [item.name, item]));
  const updated = [];
  try {
    for (const operation of operations) {
      const collection = byName.get(operation.collection);
      const fields = collection.fields.map(field => operation.requiredFields.includes(field.name) ? { ...field, required: true } : field);
      await pb.collections.update(collection.id, { fields, ...HARDENED_RULES[operation.collection] }, { requestKey: null });
      updated.push(collection);
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const collection of updated.reverse()) {
      try {
        await pb.collections.update(collection.id, {
          fields: collection.fields, listRule: collection.listRule, viewRule: collection.viewRule,
          createRule: collection.createRule, updateRule: collection.updateRule, deleteRule: collection.deleteRule,
        }, { requestKey: null });
      } catch (rollbackError) { rollbackErrors.push({ collection: collection.name, error: String(rollbackError) }); }
    }
    if (rollbackErrors.length) console.error(JSON.stringify({ rollbackErrors }, null, 2));
    throw error;
  }
}
outputJson({ mode: apply ? "apply" : "dry-run", changed: operations.length > 0, operations });
