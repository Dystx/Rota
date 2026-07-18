import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const BUILD_SCRIPT = new URL("./build-exact-artifact.mjs", import.meta.url);
const MANIFEST_NAME = "rumia-exact-artifact-provenance.json";
const execFile = promisify(execFileCallback);

async function writeFile(filePath, contents) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents);
}

async function createSourceFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "rumia-build-acceptance-red-"));
  await writeFile(path.join(root, ".gitignore"), "apps/web/.next/\noutput/\n");
  await writeFile(path.join(root, "tracked-source.txt"), "source-a\n");
  await execFile("git", ["init"], { cwd: root });
  await execFile("git", ["config", "user.name", "Artifact Test"], { cwd: root });
  await execFile("git", ["config", "user.email", "artifact@example.invalid"], { cwd: root });
  await execFile("git", ["add", ".gitignore", "tracked-source.txt"], { cwd: root });
  await execFile("git", ["commit", "-m", "source a"], { cwd: root });
  return root;
}

async function materializeBuild(root, buildId = "build-a") {
  const nextRoot = path.join(root, "apps", "web", ".next");
  await writeFile(path.join(nextRoot, "BUILD_ID"), `${buildId}\n`);
  await writeFile(path.join(nextRoot, "standalone", "apps", "web", ".next", "BUILD_ID"), `${buildId}\n`);
  await writeFile(path.join(nextRoot, "standalone", "apps", "web", "server.js"), "runtime\n");
}

async function loadBuildApi() {
  return (await import(`${BUILD_SCRIPT.href}?test=${Date.now()}`)).testApi;
}

test("canonical acceptance build writes a deterministic clean-source manifest", async (t) => {
  const root = await createSourceFixture();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const { buildAcceptance } = await loadBuildApi();
  assert.equal(typeof buildAcceptance, "function", "buildAcceptance API is missing");

  const first = await buildAcceptance({ root, runBuild: () => materializeBuild(root) });
  const manifestPath = path.join(root, "apps", "web", ".next", "standalone", MANIFEST_NAME);
  const firstBytes = await fs.readFile(manifestPath, "utf8");
  const sourceCommit = (await execFile("git", ["rev-parse", "HEAD"], { cwd: root })).stdout.trim();
  const sourceTree = (await execFile("git", ["rev-parse", "HEAD^{tree}"], { cwd: root })).stdout.trim();
  assert.equal(firstBytes, `${JSON.stringify({
    schemaVersion: 1,
    buildId: "build-a",
    sourceCommit,
    sourceTree
  }, null, 2)}\n`);
  assert.deepEqual(first, { buildId: "build-a", sourceCommit, sourceTree, manifestPath });

  await buildAcceptance({ root, runBuild: () => materializeBuild(root) });
  assert.equal(await fs.readFile(manifestPath, "utf8"), firstBytes);
});

test("canonical acceptance build rejects source changes made during the build", async (t) => {
  const root = await createSourceFixture();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const { buildAcceptance } = await loadBuildApi();
  const manifestPath = path.join(root, "apps", "web", ".next", "standalone", MANIFEST_NAME);

  await assert.rejects(
    buildAcceptance({
      root,
      runBuild: async () => {
        await materializeBuild(root);
        await fs.writeFile(path.join(root, "tracked-source.txt"), "dirty-during-build\n");
      }
    }),
    /source tree changed during acceptance build.*tracked changes are present/i
  );
  await assert.rejects(fs.access(manifestPath), /ENOENT/);
});

test("canonical acceptance build rejects mismatched standalone and root build IDs", async (t) => {
  const root = await createSourceFixture();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const { buildAcceptance } = await loadBuildApi();

  await assert.rejects(
    buildAcceptance({
      root,
      runBuild: async () => {
        await materializeBuild(root, "root-build");
        await fs.writeFile(
          path.join(root, "apps", "web", ".next", "standalone", "apps", "web", ".next", "BUILD_ID"),
          "served-build\n"
        );
      }
    }),
    /standalone BUILD_ID does not match/i
  );
});

test("root scripts expose the canonical build, safe final gate, and routine unit wiring", async () => {
  const packageJson = JSON.parse(await fs.readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(packageJson.scripts["build:acceptance"], "node scripts/build-exact-artifact.mjs");
  assert.equal(packageJson.scripts["test:acceptance"], "node scripts/run-exact-artifact-gate.mjs --phase final");
  assert.equal(
    packageJson.scripts["test:exact-artifact-unit"],
    "node --test scripts/build-exact-artifact.test.mjs scripts/run-exact-artifact-gate.test.mjs"
  );
  assert.match(packageJson.scripts.test, /test:exact-artifact-unit/u);
});
