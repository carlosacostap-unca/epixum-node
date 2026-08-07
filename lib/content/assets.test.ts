import assert from "node:assert/strict";
import test from "node:test";
import type { PublicContentBlock } from "./projection";
import { referencedContentAssetIds } from "./assets.ts";

test("collects uploaded image, video and poster ids without duplicates", () => {
  const blocks = [
    { key: "image", type: "image", source: { assetId: "asset-image" }, alt: "Imagen" },
    { key: "video", type: "video", source: { assetId: "asset-video" }, posterAssetId: "asset-image", title: "Video" },
    { key: "external", type: "image", source: { externalUrl: "https://example.com/image.png" }, alt: "Externa" },
  ] as PublicContentBlock[];

  assert.deepEqual(referencedContentAssetIds(blocks), ["asset-image", "asset-video"]);
});
