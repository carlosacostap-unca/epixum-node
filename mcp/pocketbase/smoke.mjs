import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDirectory, "..", "..");
const serverPath = resolve(currentDirectory, "server.mjs");
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [serverPath],
  cwd: projectRoot,
  stderr: "pipe",
});
const client = new Client({ name: "epixum-pocketbase-smoke", version: "1.0.0" });

try {
  await client.connect(transport);
  const listed = await client.listTools();
  const health = await client.callTool({ name: "pocketbase_health", arguments: {} });
  if (health.isError) throw new Error(health.content?.[0]?.text || "La herramienta health devolvió un error.");
  const collections = await client.callTool({ name: "pocketbase_list_collections", arguments: {} });
  if (collections.isError) {
    throw new Error(collections.content?.[0]?.text || "No se pudieron listar las colecciones.");
  }
  process.stdout.write(`${JSON.stringify({
    tools: listed.tools.map((tool) => tool.name),
    health: health.structuredContent,
    applicationCollectionCount: collections.structuredContent?.count,
  }, null, 2)}\n`);
} finally {
  await client.close();
}
