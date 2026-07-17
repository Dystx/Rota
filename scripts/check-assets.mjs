import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(resolve(root, "apps/web/content/asset-manifest.json"), "utf8"));
const fontManifest = JSON.parse(readFileSync(resolve(root, "apps/web/content/font-provenance.json"), "utf8"));
const regions = JSON.parse(readFileSync(resolve(root, "apps/web/content/portugal-regions.json"), "utf8"));
const errors = [];

for (const font of fontManifest) {
  if (!font.family || !font.licenseFile || !font.licenseUrl?.startsWith("https://") || !font.sourceUrl?.startsWith("https://")) {
    errors.push(`Incomplete font provenance entry: ${font.family ?? "unknown"}`);
  }
  for (const file of [...(font.files ?? []), font.licenseFile].filter(Boolean)) {
    const path = resolve(root, "apps/web/public", String(file).replace(/^\//u, ""));
    try {
      if (!statSync(path).isFile()) errors.push(`Missing font file: ${file}`);
    } catch {
      errors.push(`Missing font file: ${file}`);
    }
  }
}

for (const asset of manifest) {
  if (!asset.id || !asset.alt?.trim() || !asset.licence || !asset.owner || !asset.reviewedAt || !asset.files?.length) errors.push(`Incomplete manifest entry: ${asset.id ?? "unknown"}`);
  for (const file of asset.files ?? []) {
    if (!file.src?.startsWith("/") || file.src.startsWith("//")) errors.push(`Non-owned path: ${asset.id}`);
    const path = resolve(root, "apps/web/public", String(file.src).replace(/^\//u, ""));
    try {
      if (!statSync(path).isFile()) errors.push(`Missing file: ${file.src}`);
    } catch { errors.push(`Missing file: ${file.src}`); }
    if (!Number.isFinite(file.width) || !Number.isFinite(file.height) || !Number.isFinite(file.bytes)) errors.push(`Invalid dimensions: ${asset.id}`);
    if (String(file.src).endsWith(".mp4")) {
      if (!Number.isFinite(file.durationMs) || file.durationMs < 6000 || file.durationMs > 10000) errors.push(`Invalid video duration: ${asset.id}`);
      if (file.bytes > 1_500_000) errors.push(`Video exceeds mobile budget: ${asset.id}`);
      if (!asset.source?.toLowerCase().includes("derivative")) errors.push(`Video provenance must name its derivative source: ${asset.id}`);
      if (!asset.licenceUrl?.startsWith("https://")) errors.push(`Video licence URL missing: ${asset.id}`);
    }
  }
}

// Trip covers are referenced by route data rather than the editorial media
// manifest, so validate their XML-facing text separately. A raw ampersand in
// an SVG attribute makes Chromium return a broken image even when the HTTP
// request succeeds.
const tripCoverRoot = resolve(root, "apps/web/public/trip-covers");
for (const file of readdirSync(tripCoverRoot).filter((entry) => entry.endsWith(".svg"))) {
  const source = readFileSync(resolve(tripCoverRoot, file), "utf8");
  if (/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);)/iu.test(source)) {
    errors.push(`Unescaped XML entity in trip cover: ${file}`);
  }
}

const required = ["lisbon-sintra-cascais", "porto-north", "douro", "central-portugal-silver-coast", "alentejo", "algarve", "madeira", "azores"];
for (const slug of required) if (!regions.find((region) => region.slug === slug && region.published)) errors.push(`Missing published region: ${slug}`);

if (errors.length) {
  process.stderr.write(`${errors.join("\n")}\n`);
  process.exitCode = 1;
}
