#!/usr/bin/env node

/**
 * Validate the checked-in Drizzle migration journal without connecting to a
 * database. Applying migrations is covered separately by the local/VPS
 * migration gates; this check catches missing, duplicated, or out-of-order
 * files before those gates run.
 */

import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const drizzleRoot = join(repoRoot, "drizzle");
const journalPath = join(drizzleRoot, "meta", "_journal.json");

const journal = JSON.parse(await readFile(journalPath, "utf8"));
const entries = Array.isArray(journal.entries) ? journal.entries : [];
const migrationFiles = (await readdir(drizzleRoot)).filter((name) => name.endsWith(".sql")).sort();

const issues = [];
const seenIndexes = new Set();
const seenTags = new Set();

for (const [position, entry] of entries.entries()) {
  if (!Number.isInteger(entry.idx) || entry.idx !== position) {
    issues.push(`journal index ${entry.idx ?? "missing"} is not sequential at position ${position}`);
  }
  if (seenIndexes.has(entry.idx)) issues.push(`duplicate journal index ${entry.idx}`);
  if (seenTags.has(entry.tag)) issues.push(`duplicate migration tag ${entry.tag}`);
  seenIndexes.add(entry.idx);
  seenTags.add(entry.tag);
  if (!migrationFiles.includes(`${entry.tag}.sql`)) {
    issues.push(`journal entry ${entry.tag} has no matching SQL file`);
  }
}

for (const file of migrationFiles) {
  const tag = file.slice(0, -4);
  if (!seenTags.has(tag)) issues.push(`SQL file ${file} is missing from the journal`);
}

if (issues.length > 0) {
  console.error("[drizzle-migrations] validation failed:");
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(`[drizzle-migrations] ${migrationFiles.length} files match the journal`);
