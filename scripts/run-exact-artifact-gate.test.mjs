import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const HARNESS_PATH = new URL("./run-exact-artifact-gate.mjs", import.meta.url);
const execFile = promisify(execFileCallback);
const FIXED_TIME = "2026-07-18T12:00:00.000Z";

async function writeFile(filePath, contents) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents);
}

async function createRuntimeFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "rumia-exact-artifact-red-"));
  const nextRoot = path.join(root, "apps", "web", ".next");
  const standaloneRoot = path.join(nextRoot, "standalone");
  const standaloneApp = path.join(standaloneRoot, "apps", "web");
  const buildIdPath = path.join(nextRoot, "BUILD_ID");

  await Promise.all([
    writeFile(buildIdPath, "red-build\n"),
    writeFile(path.join(standaloneApp, ".next", "BUILD_ID"), "red-build\n"),
    writeFile(path.join(standaloneApp, "server.js"), "server-runtime"),
    writeFile(path.join(standaloneApp, "public", "guide.txt"), "public-v1"),
    writeFile(path.join(standaloneApp, ".next", "static", "chunks", "app.js"), "static-v1"),
    writeFile(path.join(standaloneApp, ".next", "server", "app", "page.js"), "server-chunk-v1"),
    writeFile(path.join(standaloneRoot, "node_modules", "runtime-package", "index.js"), "dependency-v1")
  ]);
  await fs.symlink(
    "runtime-package",
    path.join(standaloneRoot, "node_modules", "runtime-link")
  );

  return { root, nextRoot, standaloneRoot, standaloneApp, buildIdPath };
}

async function loadCurrentGate(root) {
  const source = await fs.readFile(HARNESS_PATH, "utf8");
  const isolatedSource = source
    .replace(
      'const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");',
      `const ROOT = ${JSON.stringify(root)};`
    )
    .replace(
      /main\(\)\.catch\(\(error\) => \{[\s\S]*?\n\}\);\s*$/,
      `export const testApi = {
        artifactDigest,
        prepareArtifactPhase: typeof prepareArtifactPhase === "function" ? prepareArtifactPhase : undefined
      };\n`
    );
  const modulePath = path.join(root, "output", "test-harness", "isolated-gate.mjs");
  await fs.mkdir(path.dirname(modulePath), { recursive: true });
  await fs.writeFile(modulePath, isolatedSource);
  return (await import(`${new URL(`file://${modulePath}`).href}?test=${Date.now()}`)).testApi;
}

async function initializeGitFixture(fixture) {
  await Promise.all([
    writeFile(path.join(fixture.root, ".gitignore"), "apps/web/.next/\n"),
    writeFile(path.join(fixture.root, "tracked-source.txt"), "tracked\n"),
    writeFile(path.join(fixture.root, "apps", "web", "public", "guide.txt"), "public-v1"),
    writeFile(path.join(fixture.nextRoot, "static", "chunks", "app.js"), "static-v1")
  ]);
  await execFile("git", ["init"], { cwd: fixture.root });
  await execFile("git", ["config", "user.name", "Artifact Test"], { cwd: fixture.root });
  await execFile("git", ["config", "user.email", "artifact@example.invalid"], { cwd: fixture.root });
  await execFile("git", ["add", ".gitignore", "tracked-source.txt", "apps/web/public/guide.txt"], { cwd: fixture.root });
  await execFile("git", ["commit", "-m", "fixture"], { cwd: fixture.root });
  await writeFile(path.join(fixture.root, "output", "existing.txt"), "allowed\n");
}

test("artifact digest inventory covers every served payload class", async (t) => {
  const fixture = await createRuntimeFixture();
  t.after(() => fs.rm(fixture.root, { recursive: true, force: true }));
  const { artifactDigest } = await loadCurrentGate(fixture.root);

  const { files, inventory } = await artifactDigest(fixture.buildIdPath);

  for (const relativePath of [
    "apps/web/.next/standalone/apps/web/public/guide.txt",
    "apps/web/.next/standalone/apps/web/.next/static/chunks/app.js",
    "apps/web/.next/standalone/apps/web/.next/server/app/page.js",
    "apps/web/.next/standalone/node_modules/runtime-package/index.js"
  ]) {
    assert.ok(files.includes(relativePath), `missing served payload from inventory: ${relativePath}`);
  }
  const symlink = inventory.find((entry) => entry.path.endsWith("node_modules/runtime-link"));
  assert.deepEqual(
    { path: symlink?.path, type: symlink?.type, target: symlink?.target },
    {
      path: "apps/web/.next/standalone/node_modules/runtime-link",
      type: "symlink",
      target: "runtime-package"
    }
  );
  assert.match(symlink?.mode ?? "", /^\d{3}$/);
});

test("artifact digest changes for public, static, server, dependency, and symlink mutations", async (t) => {
  const fixture = await createRuntimeFixture();
  t.after(() => fs.rm(fixture.root, { recursive: true, force: true }));
  const { artifactDigest } = await loadCurrentGate(fixture.root);
  const paths = [
    path.join(fixture.standaloneApp, "public", "guide.txt"),
    path.join(fixture.standaloneApp, ".next", "static", "chunks", "app.js"),
    path.join(fixture.standaloneApp, ".next", "server", "app", "page.js"),
    path.join(fixture.standaloneRoot, "node_modules", "runtime-package", "index.js")
  ];

  for (const [index, filePath] of paths.entries()) {
    const original = await fs.readFile(filePath);
    const before = await artifactDigest(fixture.buildIdPath);
    await fs.writeFile(filePath, Buffer.concat([original, Buffer.from(`-mutation-${index}`)]));
    const after = await artifactDigest(fixture.buildIdPath);
    assert.notEqual(after.digest, before.digest, `digest ignored ${path.relative(fixture.root, filePath)}`);
    await fs.writeFile(filePath, original);
  }

  const symlinkPath = path.join(fixture.standaloneRoot, "node_modules", "runtime-link");
  const beforeSymlink = await artifactDigest(fixture.buildIdPath);
  await fs.unlink(symlinkPath);
  await fs.symlink("alternate-package", symlinkPath);
  const afterSymlink = await artifactDigest(fixture.buildIdPath);
  assert.notEqual(afterSymlink.digest, beforeSymlink.digest);
});

test("pre-approval materializes once and records immutable candidate provenance", async (t) => {
  const fixture = await createRuntimeFixture();
  t.after(() => fs.rm(fixture.root, { recursive: true, force: true }));
  await initializeGitFixture(fixture);
  await fs.rm(path.join(fixture.standaloneApp, "public"), { recursive: true, force: true });
  await fs.rm(path.join(fixture.standaloneApp, ".next", "static"), { recursive: true, force: true });
  const { prepareArtifactPhase } = await loadCurrentGate(fixture.root);
  assert.equal(typeof prepareArtifactPhase, "function", "candidate phase API is missing");

  const result = await prepareArtifactPhase({
    phase: "pre-approval",
    now: () => new Date(FIXED_TIME)
  });
  const sourceCommit = (await execFile("git", ["rev-parse", "HEAD"], { cwd: fixture.root })).stdout.trim();
  const sourceTree = (await execFile("git", ["rev-parse", "HEAD^{tree}"], { cwd: fixture.root })).stdout.trim();

  assert.equal(result.receipt.schemaVersion, 2);
  assert.deepEqual(
    {
      buildId: result.receipt.candidate.buildId,
      digest: result.receipt.candidate.digest,
      sourceCommit: result.receipt.candidate.sourceCommit,
      sourceTree: result.receipt.candidate.sourceTree,
      trackedClean: result.receipt.candidate.trackedClean,
      server: result.receipt.candidate.server,
      candidateCreatedAt: result.receipt.candidate.candidateCreatedAt,
      inventoryCount: result.receipt.candidate.inventoryCount
    },
    {
      buildId: "red-build",
      digest: result.artifact.digest,
      sourceCommit,
      sourceTree,
      trackedClean: true,
      server: "apps/web/.next/standalone/apps/web/server.js",
      candidateCreatedAt: FIXED_TIME,
      inventoryCount: result.artifact.inventory.length
    }
  );
  assert.equal(result.receipt.candidate.inventory.length, result.artifact.inventory.length);
  assert.deepEqual(result.receipt.verifications.map(({ phase }) => phase), ["pre-approval"]);
  assert.equal(
    await fs.readFile(path.join(fixture.standaloneApp, "public", "guide.txt"), "utf8"),
    "public-v1"
  );
});

test("later phases never recopy assets and reject a changed served byte before startup", async (t) => {
  const fixture = await createRuntimeFixture();
  t.after(() => fs.rm(fixture.root, { recursive: true, force: true }));
  await initializeGitFixture(fixture);
  const { prepareArtifactPhase } = await loadCurrentGate(fixture.root);
  assert.equal(typeof prepareArtifactPhase, "function", "candidate phase API is missing");

  const created = await prepareArtifactPhase({ phase: "pre-approval", now: () => new Date(FIXED_TIME) });
  const candidateIdentity = structuredClone(created.receipt.candidate);
  await fs.writeFile(path.join(fixture.root, "apps", "web", "public", "guide.txt"), "source-v2");

  const updated = await prepareArtifactPhase({ phase: "update-family", now: () => new Date("2026-07-18T12:30:00.000Z") });
  assert.deepEqual(updated.receipt.candidate, candidateIdentity);
  const verified = await prepareArtifactPhase({ phase: "final", now: () => new Date("2026-07-18T13:00:00.000Z") });
  assert.deepEqual(verified.receipt.candidate, candidateIdentity);
  assert.deepEqual(verified.receipt.verifications.map(({ phase }) => phase), ["pre-approval", "update-family", "final"]);
  assert.equal(
    await fs.readFile(path.join(fixture.standaloneApp, "public", "guide.txt"), "utf8"),
    "public-v1"
  );

  await fs.writeFile(path.join(fixture.standaloneApp, "public", "guide.txt"), "tampered");
  await assert.rejects(
    prepareArtifactPhase({ phase: "final", now: () => new Date("2026-07-18T14:00:00.000Z") }),
    /artifact digest mismatch.*before server start/i
  );
});

test("pre-approval rejects tracked changes and untracked files outside output", async (t) => {
  const fixture = await createRuntimeFixture();
  t.after(() => fs.rm(fixture.root, { recursive: true, force: true }));
  await initializeGitFixture(fixture);
  const { prepareArtifactPhase } = await loadCurrentGate(fixture.root);
  assert.equal(typeof prepareArtifactPhase, "function", "candidate phase API is missing");

  await fs.writeFile(path.join(fixture.root, "tracked-source.txt"), "dirty\n");
  await assert.rejects(
    prepareArtifactPhase({ phase: "pre-approval" }),
    /clean source tree.*tracked changes are present/i
  );
  await fs.writeFile(path.join(fixture.root, "tracked-source.txt"), "tracked\n");
  await fs.writeFile(path.join(fixture.root, "stray.txt"), "stray\n");
  await assert.rejects(
    prepareArtifactPhase({ phase: "pre-approval" }),
    /clean source tree.*untracked files outside output/i
  );
});

test("later phases reject missing and malformed receipts", async (t) => {
  const fixture = await createRuntimeFixture();
  t.after(() => fs.rm(fixture.root, { recursive: true, force: true }));
  await initializeGitFixture(fixture);
  const { prepareArtifactPhase } = await loadCurrentGate(fixture.root);
  assert.equal(typeof prepareArtifactPhase, "function", "candidate phase API is missing");
  const receiptPath = path.join(fixture.root, "output", "playwright", "exact-artifact", "build-receipt.json");

  await assert.rejects(
    prepareArtifactPhase({ phase: "final" }),
    /candidate receipt is missing/i
  );
  await writeFile(receiptPath, "not-json\n");
  await assert.rejects(
    prepareArtifactPhase({ phase: "final" }),
    /candidate receipt is malformed/i
  );
  await fs.writeFile(receiptPath, "{}\n");
  await assert.rejects(
    prepareArtifactPhase({ phase: "final" }),
    /candidate receipt is invalid/i
  );
});
