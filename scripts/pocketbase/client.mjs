import { resolve } from "node:path";
import { config as loadEnvFile } from "dotenv";
import PocketBase from "pocketbase";

export const projectRoot = resolve(import.meta.dirname, "..", "..");

export function loadPocketBaseEnvironment(environment = process.env) {
  loadEnvFile({ path: resolve(projectRoot, ".env.local"), quiet: true });
  const required = [
    "NEXT_PUBLIC_POCKETBASE_URL",
    "POCKETBASE_ADMIN_EMAIL",
    "POCKETBASE_ADMIN_PASSWORD",
  ];
  const missing = required.filter((key) => !environment[key]?.trim());
  if (missing.length) throw new Error(`Faltan variables: ${missing.join(", ")}`);
  return {
    url: environment.NEXT_PUBLIC_POCKETBASE_URL.replace(/\/$/, ""),
    email: environment.POCKETBASE_ADMIN_EMAIL,
    password: environment.POCKETBASE_ADMIN_PASSWORD,
  };
}

export async function createAdminClient(environment = process.env) {
  const settings = loadPocketBaseEnvironment(environment);
  const pb = new PocketBase(settings.url);
  pb.autoCancellation(false);
  await pb.collection("_superusers").authWithPassword(settings.email, settings.password, {
    requestKey: null,
  });
  if (!pb.authStore.isSuperuser) throw new Error("La cuenta configurada no es superusuario.");
  return pb;
}

export function safeCollection(collection) {
  return {
    id: collection.id,
    name: collection.name,
    type: collection.type,
    system: collection.system,
    fields: (collection.fields || []).map((field) => {
      const { id, name, type, required, system, hidden, presentable, ...options } = field;
      return { id, name, type, required, system, hidden, presentable, options };
    }),
    indexes: collection.indexes || [],
    rules: {
      list: collection.listRule,
      view: collection.viewRule,
      create: collection.createRule,
      update: collection.updateRule,
      delete: collection.deleteRule,
    },
  };
}

export function outputJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
