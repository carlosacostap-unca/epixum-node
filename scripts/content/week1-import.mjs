export function planWeek1Import(manifest, existingSections = [], existingAssets = []) {
  const sectionKeys = new Set(existingSections.map((item) => item.sourceKey).filter(Boolean));
  const assetKeys = new Set(existingAssets.map((item) => item.importKey).filter(Boolean));
  const sections = manifest.sections.filter((section) => !sectionKeys.has(section.sourceKey));
  const assets = manifest.assets.filter((asset) => !assetKeys.has(asset.key));
  return { sections, assets, skippedSections: manifest.sections.length - sections.length, skippedAssets: manifest.assets.length - assets.length, finalSectionCount: existingSections.length + sections.length };
}

export function resolveManifestAssetReferences(blocks, assetIds) {
  return structuredClone(blocks).map((block) => {
    if ((block.type === "image" || block.type === "video") && block.source?.assetId) {
      const resolved = assetIds.get(block.source.assetId);
      if (!resolved) throw new Error(`No se encontró el activo ${block.source.assetId}.`);
      block.source.assetId = resolved;
    }
    return block;
  });
}
