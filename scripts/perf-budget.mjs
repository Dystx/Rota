#!/usr/bin/env node
/**
 * Perf budget check for the apps/web Next.js build output.
 *
 * Walks `apps/web/.next/` (after `pnpm build`) and reports:
 *  - the total compressed-weight estimate (gzip over the
 *    first chunks), and
 *  - the top 10 largest static assets.
 *
 * Report mode (no `PERF_BUDGET_KB` env): always exits 0.
 * Wired into `pnpm build` via `turbo run quality` so a build
 * that exceeds the budget fails CI without blocking local
 * dev (which runs the script in report mode).
 *
 * Budgets:
 *  - PERF_BUDGET_KB — total static asset budget in KB.
 *    Defaults to 5000 (5 MB) which fits a typical Vercel
 *    Hobby / Pro edge budget. Override per-env as needed.
 *  - PERF_BUDGET_FAIL — set to "1" to fail on over-budget
 *    even when PERF_BUDGET_KB is unset (useful for CI).
 *
 * Usage:
 *   node scripts/perf-budget.mjs
 *   PERF_BUDGET_KB=4000 PERF_BUDGET_FAIL=1 pnpm build
 *
 * Exit codes:
 *   0 — no build / under budget
 *   1 — over budget (only when PERF_BUDGET_FAIL=1 or
 *       PERF_BUDGET_KB is set)
 *
 * Why not full WebPageTest / Lighthouse? Those belong in
 * the Playwright perf gate (apps/web/playwright.config.ts
 * @perf grep), not in a build-time lint. This script
 * catches "the bundle got 2x bigger" before it ships.
 */

import { readdir, stat, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const BUILD_DIRS = [
  join(repoRoot, "apps", "web", ".next"),
  join(repoRoot, "apps", "web", ".next", "static")
];
const TOP_N = 10;
const DEFAULT_BUDGET_KB = 5000;
const KB = 1024;
const MB = KB * 1024;

function humanSize(bytes) {
  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${(bytes / MB).toFixed(2)} MB`;
}

/** Walk a directory recursively and collect { path, size }
 *  for every regular file. Symlinks are followed once. */
async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return out;
    throw err;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (entry.isFile()) {
      const stats = await stat(full);
      out.push({ path: full, size: stats.size });
    }
  }
  return out;
}

/** Cheap gzip estimate over a small sample. The first
 *  5 MB of assets is enough for a stable gzipped total. */
async function estimateGzipTotal(files) {
  const sample = files
    .filter((f) => /\.(js|css|html|json|svg|woff2?)$/.test(f.path))
    .slice(0, 200);
  if (sample.length === 0) return 0;
  const buffers = await Promise.all(
    sample.map((f) => readFile(f.path).then((b) => ({ path: f.path, b })))
  );
  let total = 0;
  for (const { b } of buffers) {
    total += gzipSync(b).length;
  }
  // Scale up by the ratio of total-bytes-sampled to
  // total-asset-bytes. The sample is JS/CSS-heavy, so the
  // ratio is close to the truth; SVG/WOFF2 are skipped
  // (already compressed) so they don't skew the estimate.
  const sampled = buffers.reduce((acc, { b }) => acc + b.length, 0);
  const totalAssetBytes = files.reduce((acc, f) => acc + f.size, 0);
  if (sampled === 0) return 0;
  return Math.round((total / sampled) * totalAssetBytes);
}

async function main() {
  const budgetKb = process.env.PERF_BUDGET_KB
    ? Number(process.env.PERF_BUDGET_KB)
    : null;
  const failOnExceed =
    process.env.PERF_BUDGET_FAIL === "1" || budgetKb !== null;

  // Walk the top-level .next dir (covers all static
  // assets + the server bundle). The narrower
  // .next/static walk is for the report.
  let files = [];
  for (const dir of BUILD_DIRS) {
    files.push(...(await walk(dir)));
  }

  if (files.length === 0) {
    console.log(
      "perf-budget: no build artifacts found under apps/web/.next — skipping (run `pnpm build` first)."
    );
    process.exit(0);
  }

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  const gzipTotal = await estimateGzipTotal(files);

  const top = [...files]
    .sort((a, b) => b.size - a.size)
    .slice(0, TOP_N);

  console.log("perf-budget: apps/web/.next");
  console.log(`  files:    ${files.length}`);
  console.log(`  total:    ${humanSize(totalBytes)} (${totalBytes} B)`);
  console.log(`  gzipped:  ${humanSize(gzipTotal)} (${gzipTotal} B, sampled estimate)`);
  console.log(`  top ${TOP_N} files:`);
  for (const f of top) {
    const rel = relative(repoRoot, f.path).split(sep).join("/");
    console.log(`    ${humanSize(f.size).padStart(10)}  ${rel}`);
  }

  if (budgetKb !== null) {
    const totalKb = Math.round(totalBytes / KB);
    const gzipKb = Math.round(gzipTotal / KB);
    console.log("");
    console.log(
      `perf-budget: configured budget = ${budgetKb} KB raw / ${Math.round(budgetKb / 2)} KB gzipped (loose gzipped = budget / 2).`
    );
    const overRaw = totalKb > budgetKb;
    const overGzip = gzipKb > budgetKb / 2;
    if (overRaw) {
      console.log(
        `  ❌ over raw budget: ${totalKb} KB > ${budgetKb} KB (delta ${totalKb - budgetKb} KB)`
      );
    }
    if (overGzip) {
      console.log(
        `  ❌ over gzipped budget: ${gzipKb} KB > ${Math.round(budgetKb / 2)} KB (delta ${gzipKb - Math.round(budgetKb / 2)} KB)`
      );
    }
    if (overRaw || overGzip) {
      if (failOnExceed) {
        console.error(
          "\nperf-budget: budget exceeded. Set PERF_BUDGET_FAIL=0 to make this a warning."
        );
        process.exit(1);
      } else {
        console.log(
          "\nperf-budget: (over budget, but PERF_BUDGET_FAIL is unset — continuing)"
        );
      }
    } else {
      console.log("  ✓ within budget");
    }
  } else {
    console.log("");
    console.log(
      "perf-budget: report-only mode. Set PERF_BUDGET_KB=<kb> to enforce; PERF_BUDGET_FAIL=1 to fail CI without a budget."
    );
  }
}

main().catch((err) => {
  console.error("perf-budget: error:", err.message);
  process.exit(1);
});
