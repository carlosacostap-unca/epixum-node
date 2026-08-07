import { readFile } from "node:fs/promises";
import path from "node:path";
import { createAdminClient, outputJson, projectRoot } from "../pocketbase/client.mjs";

const args = parseArgs(process.argv.slice(2));
const manifest = JSON.parse(await readFile(path.join(projectRoot, "content", "week-01.manifest.json"), "utf8"));
if (args.apply && args.confirmCount !== manifest.assets.length) {
  throw new Error(`Para aplicar, indicá --confirm-count ${manifest.assets.length}.`);
}

const pb = await createAdminClient();
const records = await pb.collection("content_assets").getFullList({ filter: "importKey != ''" });
const byKey = new Map(records.map((asset) => [asset.importKey, asset]));
const missingRecords = manifest.assets.filter((asset) => !byKey.has(asset.key)).map((asset) => asset.key);
if (missingRecords.length) throw new Error(`Faltan registros para: ${missingRecords.join(", ")}`);

if (!args.apply) {
  outputJson({ mode: "dry-run", assetsToRepair: manifest.assets.length, keys: manifest.assets.map((asset) => asset.key) });
  process.exit(0);
}

const repaired = [];
for (const asset of manifest.assets) {
  const record = byKey.get(asset.key);
  const filename = path.basename(asset.sourcePath);
  const bytes = await readFile(path.join(projectRoot, asset.sourcePath));
  const file = new File([bytes], filename, { type: mimeType(filename) });
  await pb.collection("content_assets").update(record.id, { file }, { requestKey: null });
  repaired.push({ key: asset.key, id: record.id, filename, bytes: bytes.length });
}

outputJson({ mode: "apply", repairedCount: repaired.length, repaired });

function parseArgs(values) {
  const result = { apply: false };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === "--apply") result.apply = true;
    else if (value === "--confirm-count") result.confirmCount = Number(values[++index]);
    else throw new Error(`Argumento desconocido: ${value}`);
  }
  return result;
}

function mimeType(filename) {
  const extension = path.extname(filename).toLowerCase();
  return ({ ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".mp4": "video/mp4", ".webm": "video/webm" })[extension] || "application/octet-stream";
}
