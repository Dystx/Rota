import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkMapboxBudget } from './check-mapbox-budget.mjs';

async function makeWebRoot({ budgetKb, manifest, chunkContent } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mapbox-budget-'));
  const nextDir = path.join(root, '.next');
  await mkdir(nextDir, { recursive: true });

  if (typeof budgetKb === 'number') {
    await writeFile(path.join(root, '.budget.json'), JSON.stringify({ mapboxGlGzipKb: budgetKb }));
  }

  if (manifest) {
    await writeFile(path.join(nextDir, 'build-manifest.json'), JSON.stringify(manifest));
  }

  if (chunkContent) {
    await mkdir(path.join(nextDir, 'static/chunks'), { recursive: true });
    await writeFile(path.join(nextDir, 'static/chunks/mapbox.js'), chunkContent);
  }

  return root;
}

test('returns exit 0 when mapbox chunk stays within budget', async () => {
  const webRoot = await makeWebRoot({
    budgetKb: 10,
    manifest: { pages: { '/': ['static/chunks/mapbox.js'] } },
    chunkContent: 'const mapboxgl = { version: "test" };',
  });

  const result = await checkMapboxBudget({ webRootPath: webRoot });

  assert.equal(result.code, 0);
  assert.match(result.message, /^\[mapbox-budget\] OK \d+KB ≤ 10KB$/);
});

test('returns exit 1 when mapbox chunk exceeds budget', async () => {
  const webRoot = await makeWebRoot({
    budgetKb: 0,
    manifest: { pages: { '/': ['static/chunks/mapbox.js'] } },
    chunkContent: 'const mapboxgl = { version: "test" };',
  });

  const result = await checkMapboxBudget({ webRootPath: webRoot });

  assert.equal(result.code, 1);
  assert.match(result.message, /^\[mapbox-budget\] FAIL \d+KB > 0KB$/);
});

test('returns exit 2 when build manifest is missing', async () => {
  const webRoot = await makeWebRoot({ budgetKb: 10 });

  const result = await checkMapboxBudget({ webRootPath: webRoot });

  assert.equal(result.code, 2);
  assert.match(result.message, /^\[mapbox-budget\] ERROR missing manifest:/);
});
