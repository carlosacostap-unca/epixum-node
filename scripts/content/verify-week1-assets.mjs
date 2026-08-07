import { readFile } from "node:fs/promises";
import path from "node:path";
import { createAdminClient, outputJson, projectRoot } from "../pocketbase/client.mjs";

const manifest = JSON.parse(await readFile(path.join(projectRoot, "content", "week-01.manifest.json"), "utf8"));
const pb = await createAdminClient();
const expectedKeys = new Set(manifest.assets.map((asset) => asset.key));
const records = await pb.collection("content_assets").getFullList({ filter: "importKey != ''" });
const assets = records.filter((asset) => expectedKeys.has(asset.importKey));
const byKey = new Map(assets.map((asset) => [asset.importKey, asset]));
const missingRecords = [...expectedKeys].filter((key) => !byKey.has(key));
const missingFiles = assets.filter((asset) => !asset.file && !asset.externalUrl).map((asset) => asset.importKey);
const brokenFiles = [];
let fetchedFiles = 0;

if (assets.some((asset) => asset.file)) {
  const token = await pb.files.getToken();
  for (const asset of assets.filter((item) => item.file)) {
    const response = await fetch(pb.files.getURL(asset, asset.file, { token }));
    if (!response.ok) brokenFiles.push({ key: asset.importKey, status: response.status });
    else fetchedFiles += 1;
  }
}

outputJson({
  expected: expectedKeys.size,
  found: assets.length,
  filesPresent: assets.filter((asset) => Boolean(asset.file)).length,
  fetchedFiles,
  missingRecords,
  missingFiles,
  brokenFiles,
  ok: assets.length === expectedKeys.size && missingFiles.length === 0 && brokenFiles.length === 0,
});

if (assets.length !== expectedKeys.size || missingFiles.length || brokenFiles.length) process.exitCode = 1;
