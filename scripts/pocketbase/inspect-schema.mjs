import { createAdminClient, outputJson, safeCollection } from "./client.mjs";

const pb = await createAdminClient();
const collections = await pb.collections.getFullList({ sort: "name", requestKey: null });
outputJson({
  inspectedAt: new Date().toISOString(),
  collections: collections
    .filter((collection) => !collection.name.startsWith("_"))
    .map(safeCollection),
});
