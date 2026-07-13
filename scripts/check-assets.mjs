import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(resolve(root, "apps/web/content/asset-manifest.json"), "utf8"));
const regions = JSON.parse(readFileSync(resolve(root, "apps/web/content/portugal-regions.json"), "utf8"));
const errors = [];

for (const asset of manifest) {
  if (!asset.id || !asset.alt?.trim() || !asset.licence || !asset.owner || !asset.reviewedAt || !asset.files?.length) errors.push(`Incomplete manifest entry: ${asset.id ?? "unknown"}`);
  for (const file of asset.files ?? []) {
    if (!file.src?.startsWith("/") || file.src.startsWith("//")) errors.push(`Non-owned path: ${asset.id}`);
    const path = resolve(root, "apps/web/public", String(file.src).replace(/^\//u, ""));
    try {
      if (!statSync(path).isFile()) errors.push(`Missing file: ${file.src}`);
    } catch { errors.push(`Missing file: ${file.src}`); }
    if (!Number.isFinite(file.width) || !Number.isFinite(file.height) || !Number.isFinite(file.bytes)) errors.push(`Invalid dimensions: ${asset.id}`);
  }
}

const required = ["lisbon-sintra-cascais", "porto-north", "douro", "central-portugal-silver-coast", "alentejo", "algarve", "madeira", "azores"];
for (const slug of required) if (!regions.find((region) => region.slug === slug && region.published)) errors.push(`Missing published region: ${slug}`);

if (errors.length) {
  process.stderr.write(`${errors.join("\n")}\n`);
  process.exitCode = 1;
}
