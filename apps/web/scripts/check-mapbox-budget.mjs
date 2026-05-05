import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, '..');

function collectJsFiles(value, files = new Set()) {
  if (typeof value === 'string') {
    if (value.endsWith('.js')) files.add(value);
    return files;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectJsFiles(item, files);
    return files;
  }

  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectJsFiles(item, files);
  }

  return files;
}

async function readJson(filePath) {
  const contents = await readFile(filePath, 'utf8');
  return JSON.parse(contents);
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function checkMapboxBudget({ webRootPath = webRoot } = {}) {
  const manifestFile = path.join(webRootPath, '.next', 'build-manifest.json');
  const budgetFile = path.join(webRootPath, '.budget.json');

  if (!(await fileExists(manifestFile))) {
    return {
      code: 2,
      message: `[mapbox-budget] ERROR missing manifest: ${manifestFile}`,
    };
  }

  const manifest = await readJson(manifestFile);
  const budget = await readJson(budgetFile);
  const budgetKb = Number(budget?.mapboxGlGzipKb);

  if (!Number.isFinite(budgetKb)) {
    return {
      code: 2,
      message: `[mapbox-budget] ERROR invalid budget in ${budgetFile}`,
    };
  }

  const chunkFiles = [...collectJsFiles(manifest)].map((file) => path.join(webRootPath, '.next', file));
  let totalBytes = 0;

  for (const chunkFile of chunkFiles) {
    const contents = await readFile(chunkFile, 'utf8');
    if (!contents.includes('mapboxgl')) continue;
    totalBytes += gzipSync(Buffer.from(contents)).length;
  }

  const sizeKb = Math.ceil(totalBytes / 1024);
  if (sizeKb <= budgetKb) {
    return {
      code: 0,
      message: `[mapbox-budget] OK ${sizeKb}KB ≤ ${budgetKb}KB`,
      sizeKb,
      budgetKb,
    };
  }

  return {
    code: 1,
    message: `[mapbox-budget] FAIL ${sizeKb}KB > ${budgetKb}KB`,
    sizeKb,
    budgetKb,
  };
}

async function main() {
  const result = await checkMapboxBudget();
  const writer = result.code === 2 ? console.error : console.log;
  writer(result.message);
  process.exitCode = result.code;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
