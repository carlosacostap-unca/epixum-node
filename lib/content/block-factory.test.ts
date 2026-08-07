import assert from "node:assert/strict";
import test from "node:test";
import { contentBlocksSchema, contentSectionStatuses } from "./domain.ts";
import { contentBlockLabels, createContentBlock } from "./block-factory.ts";

test("crea una configuración inicial válida para cada tipo de bloque", () => {
  const types = Object.keys(contentBlockLabels) as Array<keyof typeof contentBlockLabels>;
  const blocks = types.map((type, index) => createContentBlock(type, `${type}_${index}`));
  assert.equal(contentBlocksSchema.parse(blocks).length, types.length);
  assert.equal(types.length, 16);
  assert.deepEqual(contentSectionStatuses, ["draft", "scheduled", "published", "hidden"]);
});
