import type PocketBase from "pocketbase";
import type { ContentAsset } from "@/types";
import type { PublicContentBlock } from "./projection";

export function referencedContentAssetIds(blocks: PublicContentBlock[]) {
  return [...new Set(blocks.flatMap((block) => {
    if (block.type === "image") return block.source.assetId ? [block.source.assetId] : [];
    if (block.type === "video") return [block.source.assetId, block.posterAssetId].filter((id): id is string => Boolean(id));
    return [];
  }))];
}

export async function resolveContentAssetUrls(pb: PocketBase, blocks: PublicContentBlock[]) {
  const ids = referencedContentAssetIds(blocks);
  if (!ids.length) return {} as Record<string, string>;

  const assets = await Promise.all(ids.map((id) => pb.collection("content_assets").getOne<ContentAsset>(id)));
  const hasStoredFiles = assets.some((asset) => Boolean(asset.file));
  const token = hasStoredFiles ? await pb.files.getToken() : undefined;
  const entries = assets.map((asset) => {
    const url = asset.file
      ? pb.files.getURL(asset, asset.file, token ? { token } : undefined)
      : asset.externalUrl ?? "";
    return [asset.id, url] as const;
  });
  return Object.fromEntries(entries.filter(([, url]) => Boolean(url)));
}
