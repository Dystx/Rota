import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const HARNESS_PATH = new URL("./run-exact-artifact-gate.mjs", import.meta.url);
const execFile = promisify(execFileCallback);
const FIXED_TIME = "2026-07-18T12:00:00.000Z";
const PROVENANCE_FILE_NAME = "rumia-exact-artifact-provenance.json";

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
  let isolatedSource = source.replace(
      'const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");',
      `const ROOT = ${JSON.stringify(root)};`
    );
  if (!isolatedSource.includes("export const testApi")) {
    isolatedSource = isolatedSource.replace(
      /main\(\)\.catch\(\(error\) => \{[\s\S]*?\n\}\);\s*$/,
      `export const testApi = {
        artifactDigest,
        parseArgs,
        prepareArtifactPhase: typeof prepareArtifactPhase === "function" ? prepareArtifactPhase : undefined
      };\n`
    );
  }
  const modulePath = path.join(root, "output", "test-harness", "isolated-gate.mjs");
  await fs.mkdir(path.dirname(modulePath), { recursive: true });
  await fs.writeFile(modulePath, isolatedSource);
  const provenanceModule = new URL("./exact-artifact-provenance.mjs", HARNESS_PATH);
  if (await fs.access(provenanceModule).then(() => true, () => false)) {
    await fs.copyFile(provenanceModule, path.join(path.dirname(modulePath), "exact-artifact-provenance.mjs"));
  }
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

async function writeBuildProvenance(fixture, overrides = {}) {
  const sourceCommit = (await execFile("git", ["rev-parse", "HEAD"], { cwd: fixture.root })).stdout.trim();
  const sourceTree = (await execFile("git", ["rev-parse", "HEAD^{tree}"], { cwd: fixture.root })).stdout.trim();
  const manifest = {
    schemaVersion: 1,
    buildId: "red-build",
    sourceCommit,
    sourceTree,
    ...overrides
  };
  const contents = `${JSON.stringify(manifest, null, 2)}\n`;
  const manifestPath = path.join(fixture.standaloneRoot, PROVENANCE_FILE_NAME);
  await writeFile(manifestPath, contents);
  return {
    manifest,
    manifestPath,
    manifestSha256: createHash("sha256").update(contents).digest("hex")
  };
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
  await writeFile(
    path.join(fixture.standaloneRoot, "node_modules", "alternate-package", "index.js"),
    "alternate-dependency"
  );
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
  const provenance = await writeBuildProvenance(fixture);
  await fs.rm(path.join(fixture.standaloneApp, "public"), { recursive: true, force: true });
  await fs.rm(path.join(fixture.standaloneApp, ".next", "static"), { recursive: true, force: true });
  const { prepareArtifactPhase } = await loadCurrentGate(fixture.root);
  assert.equal(typeof prepareArtifactPhase, "function", "candidate phase API is missing");

  const result = await prepareArtifactPhase({
    phase: "pre-approval",
    newCandidate: true,
    now: () => new Date(FIXED_TIME)
  });
  const sourceCommit = (await execFile("git", ["rev-parse", "HEAD"], { cwd: fixture.root })).stdout.trim();
  const sourceTree = (await execFile("git", ["rev-parse", "HEAD^{tree}"], { cwd: fixture.root })).stdout.trim();

  assert.equal(result.receipt.schemaVersion, 3);
  assert.deepEqual(
    {
      buildId: result.receipt.candidate.buildId,
      digest: result.receipt.candidate.digest,
      sourceCommit: result.receipt.candidate.sourceCommit,
      sourceTree: result.receipt.candidate.sourceTree,
      trackedClean: result.receipt.candidate.trackedClean,
      server: result.receipt.candidate.server,
      candidateCreatedAt: result.receipt.candidate.candidateCreatedAt,
      inventoryCount: result.receipt.candidate.inventoryCount,
      buildProvenance: result.receipt.candidate.buildProvenance
    },
    {
      buildId: "red-build",
      digest: result.artifact.digest,
      sourceCommit,
      sourceTree,
      trackedClean: true,
      server: "apps/web/.next/standalone/apps/web/server.js",
      candidateCreatedAt: FIXED_TIME,
      inventoryCount: result.artifact.inventory.length,
      buildProvenance: {
        schemaVersion: 1,
        manifest: `apps/web/.next/standalone/${PROVENANCE_FILE_NAME}`,
        manifestSha256: provenance.manifestSha256
      }
    }
  );
  assert.deepEqual(result.receipt.creation, { mode: "new" });
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
  await writeBuildProvenance(fixture);
  const { prepareArtifactPhase } = await loadCurrentGate(fixture.root);
  assert.equal(typeof prepareArtifactPhase, "function", "candidate phase API is missing");

  const created = await prepareArtifactPhase({ phase: "pre-approval", newCandidate: true, now: () => new Date(FIXED_TIME) });
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
  await writeBuildProvenance(fixture);
  const { prepareArtifactPhase } = await loadCurrentGate(fixture.root);
  assert.equal(typeof prepareArtifactPhase, "function", "candidate phase API is missing");

  await fs.writeFile(path.join(fixture.root, "tracked-source.txt"), "dirty\n");
  await assert.rejects(
    prepareArtifactPhase({ phase: "pre-approval", newCandidate: true }),
    /clean source tree.*tracked changes are present/i
  );
  await fs.writeFile(path.join(fixture.root, "tracked-source.txt"), "tracked\n");
  await fs.writeFile(path.join(fixture.root, "stray.txt"), "stray\n");
  await assert.rejects(
    prepareArtifactPhase({ phase: "pre-approval", newCandidate: true }),
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

test("argument parsing requires an explicit phase and valid candidate authorization", async (t) => {
  const fixture = await createRuntimeFixture();
  t.after(() => fs.rm(fixture.root, { recursive: true, force: true }));
  const { parseArgs } = await loadCurrentGate(fixture.root);
  assert.equal(typeof parseArgs, "function", "argument parser API is missing");

  assert.throws(() => parseArgs([]), /--phase is required/i);
  assert.deepEqual(parseArgs(["--phase", "final"]), {
    phase: "final",
    grep: undefined,
    updateSnapshots: false,
    newCandidate: false,
    replaceCandidate: undefined
  });
  assert.deepEqual(parseArgs(["--phase", "pre-approval", "--new-candidate", "--grep", "console-workspace"]), {
    phase: "pre-approval",
    grep: "console-workspace",
    updateSnapshots: false,
    newCandidate: true,
    replaceCandidate: undefined
  });
  assert.throws(
    () => parseArgs(["--phase", "pre-approval"]),
    /requires exactly one of --new-candidate or --replace-candidate/i
  );
  assert.throws(
    () => parseArgs(["--phase", "pre-approval", "--new-candidate", "--replace-candidate", "a".repeat(64)]),
    /exactly one/i
  );
  assert.throws(
    () => parseArgs(["--phase", "final", "--new-candidate"]),
    /only valid with --phase pre-approval/i
  );
  assert.throws(
    () => parseArgs(["--phase", "pre-approval", "--replace-candidate", "not-a-digest"]),
    /64-character lowercase sha-256/i
  );
  assert.throws(() => parseArgs(["--phase", "final", "--unknown"]), /unknown argument/i);
});

test("repeated pre-approval without replacement authorization preserves receipt and served bytes", async (t) => {
  const fixture = await createRuntimeFixture();
  t.after(() => fs.rm(fixture.root, { recursive: true, force: true }));
  await initializeGitFixture(fixture);
  await writeBuildProvenance(fixture);
  const { prepareArtifactPhase } = await loadCurrentGate(fixture.root);
  const receiptPath = path.join(fixture.root, "output", "playwright", "exact-artifact", "build-receipt.json");
  const servedStatic = path.join(fixture.standaloneApp, ".next", "static", "chunks", "app.js");

  await prepareArtifactPhase({ phase: "pre-approval", newCandidate: true, now: () => new Date(FIXED_TIME) });
  const receiptBefore = await fs.readFile(receiptPath);
  const servedBefore = await fs.readFile(servedStatic);
  await fs.writeFile(path.join(fixture.nextRoot, "static", "chunks", "app.js"), "static-v2");

  await assert.rejects(
    prepareArtifactPhase({ phase: "pre-approval" }),
    /requires explicit candidate creation authorization/i
  );
  assert.deepEqual(await fs.readFile(receiptPath), receiptBefore);
  assert.deepEqual(await fs.readFile(servedStatic), servedBefore);
});

test("replacement requires the exact old digest and archives the prior receipt bytes", async (t) => {
  const fixture = await createRuntimeFixture();
  t.after(() => fs.rm(fixture.root, { recursive: true, force: true }));
  await initializeGitFixture(fixture);
  await writeBuildProvenance(fixture);
  const { prepareArtifactPhase } = await loadCurrentGate(fixture.root);
  const receiptPath = path.join(fixture.root, "output", "playwright", "exact-artifact", "build-receipt.json");
  const servedStatic = path.join(fixture.standaloneApp, ".next", "static", "chunks", "app.js");

  const first = await prepareArtifactPhase({ phase: "pre-approval", newCandidate: true, now: () => new Date(FIXED_TIME) });
  const legacyReceipt = structuredClone(first.receipt);
  legacyReceipt.schemaVersion = 2;
  delete legacyReceipt.creation;
  delete legacyReceipt.candidate.buildProvenance;
  await fs.writeFile(receiptPath, `${JSON.stringify(legacyReceipt, null, 2)}\n`);
  const oldReceiptBytes = await fs.readFile(receiptPath);
  const oldServedBytes = await fs.readFile(servedStatic);
  await fs.writeFile(path.join(fixture.nextRoot, "static", "chunks", "app.js"), "static-v2");

  await assert.rejects(
    prepareArtifactPhase({ phase: "pre-approval", replaceCandidate: "0".repeat(64) }),
    /replacement digest mismatch/i
  );
  assert.deepEqual(await fs.readFile(receiptPath), oldReceiptBytes);
  assert.deepEqual(await fs.readFile(servedStatic), oldServedBytes);

  const replacement = await prepareArtifactPhase({
    phase: "pre-approval",
    replaceCandidate: first.receipt.candidate.digest,
    now: () => new Date("2026-07-18T13:00:00.000Z")
  });
  const expectedArchive = path.join(
    fixture.root,
    "output",
    "playwright",
    "exact-artifact",
    "archive",
    `build-receipt.${first.receipt.candidate.digest}.json`
  );
  assert.deepEqual(await fs.readFile(expectedArchive), oldReceiptBytes);
  assert.notEqual(replacement.receipt.candidate.digest, first.receipt.candidate.digest);
  assert.deepEqual(replacement.receipt.creation, {
    mode: "replacement",
    expectedPriorDigest: first.receipt.candidate.digest,
    priorBuildId: first.receipt.candidate.buildId,
    priorReceiptArchive: path.relative(fixture.root, expectedArchive).split(path.sep).join("/")
  });
});

test("pre-approval rejects stale build provenance before receipt creation or asset mutation", async (t) => {
  const fixture = await createRuntimeFixture();
  t.after(() => fs.rm(fixture.root, { recursive: true, force: true }));
  await initializeGitFixture(fixture);
  await writeBuildProvenance(fixture);
  const { prepareArtifactPhase } = await loadCurrentGate(fixture.root);
  const receiptPath = path.join(fixture.root, "output", "playwright", "exact-artifact", "build-receipt.json");
  const servedStatic = path.join(fixture.standaloneApp, ".next", "static", "chunks", "app.js");
  const servedBefore = await fs.readFile(servedStatic);

  await fs.writeFile(path.join(fixture.root, "tracked-source.txt"), "advanced\n");
  await execFile("git", ["add", "tracked-source.txt"], { cwd: fixture.root });
  await execFile("git", ["commit", "-m", "advance source"], { cwd: fixture.root });
  await fs.writeFile(path.join(fixture.nextRoot, "static", "chunks", "app.js"), "stale-copy-attempt");

  await assert.rejects(
    prepareArtifactPhase({ phase: "pre-approval", newCandidate: true }),
    /build provenance sourceCommit does not match clean HEAD/i
  );
  await assert.rejects(fs.access(receiptPath), /ENOENT/);
  assert.deepEqual(await fs.readFile(servedStatic), servedBefore);
});

test("pre-approval rejects missing and malformed build provenance before asset mutation", async (t) => {
  const fixture = await createRuntimeFixture();
  t.after(() => fs.rm(fixture.root, { recursive: true, force: true }));
  await initializeGitFixture(fixture);
  const { prepareArtifactPhase } = await loadCurrentGate(fixture.root);
  const servedStatic = path.join(fixture.standaloneApp, ".next", "static", "chunks", "app.js");
  const servedBefore = await fs.readFile(servedStatic);

  await assert.rejects(
    prepareArtifactPhase({ phase: "pre-approval", newCandidate: true }),
    /build provenance manifest is missing/i
  );
  assert.deepEqual(await fs.readFile(servedStatic), servedBefore);
  await writeFile(path.join(fixture.standaloneRoot, PROVENANCE_FILE_NAME), "not-json\n");
  await assert.rejects(
    prepareArtifactPhase({ phase: "pre-approval", newCandidate: true }),
    /build provenance manifest is malformed JSON/i
  );
  assert.deepEqual(await fs.readFile(servedStatic), servedBefore);

  await writeBuildProvenance(fixture, { buildId: "different-build" });
  await assert.rejects(
    prepareArtifactPhase({ phase: "pre-approval", newCandidate: true }),
    /build provenance buildId does not match candidate build/i
  );
  assert.deepEqual(await fs.readFile(servedStatic), servedBefore);

  await writeBuildProvenance(fixture, { sourceTree: "0".repeat(40) });
  await assert.rejects(
    prepareArtifactPhase({ phase: "pre-approval", newCandidate: true }),
    /build provenance sourceTree does not match clean HEAD/i
  );
  assert.deepEqual(await fs.readFile(servedStatic), servedBefore);
});

test("artifact digest rejects missing and out-of-root symlink targets", async (t) => {
  const fixture = await createRuntimeFixture();
  t.after(() => fs.rm(fixture.root, { recursive: true, force: true }));
  const { artifactDigest } = await loadCurrentGate(fixture.root);
  const symlinkPath = path.join(fixture.standaloneRoot, "node_modules", "runtime-link");

  await fs.unlink(symlinkPath);
  await fs.symlink("missing-package", symlinkPath);
  await assert.rejects(artifactDigest(fixture.buildIdPath), /symlink target is missing/i);

  await fs.unlink(symlinkPath);
  const outsideTarget = path.join(fixture.root, "outside-runtime.js");
  await fs.writeFile(outsideTarget, "outside");
  await fs.symlink(path.relative(path.dirname(symlinkPath), outsideTarget), symlinkPath);
  await assert.rejects(artifactDigest(fixture.buildIdPath), /symlink target resolves outside standalone root/i);
});
