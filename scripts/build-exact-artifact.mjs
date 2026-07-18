import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  BUILD_PROVENANCE_FILE_NAME,
  requireCleanSourceProvenance,
  serializeBuildProvenance
} from "./exact-artifact-provenance.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function waitForExit(child) {
  if (child.exitCode !== null) return Promise.resolve({ code: child.exitCode, signal: null });
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

async function runRealBuild(root) {
  const child = spawn("corepack", ["pnpm", "--dir", "apps/web", "build"], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  const result = await waitForExit(child);
  if (result.code !== 0) {
    throw new Error(`[build:acceptance] build failed with exit ${result.code ?? result.signal}`);
  }
}

async function readBuildId(filePath, label) {
  let buildId;
  try {
    buildId = (await fs.readFile(filePath, "utf8")).trim();
  } catch (error) {
    if (error && error.code === "ENOENT") throw new Error(`[build:acceptance] ${label} BUILD_ID is missing`);
    throw error;
  }
  if (!buildId) throw new Error(`[build:acceptance] ${label} BUILD_ID is empty`);
  return buildId;
}

export async function buildAcceptance({ root = ROOT, runBuild = () => runRealBuild(root) } = {}) {
  const before = await requireCleanSourceProvenance(root, {
    errorPrefix: "[build:acceptance] requires a clean source tree"
  });

  await runBuild();

  const after = await requireCleanSourceProvenance(root, {
    errorPrefix: "[build:acceptance] source tree changed during acceptance build"
  });
  if (after.sourceCommit !== before.sourceCommit || after.sourceTree !== before.sourceTree) {
    throw new Error("[build:acceptance] source commit or tree changed during acceptance build");
  }

  const nextRoot = path.join(root, "apps", "web", ".next");
  const standaloneRoot = path.join(nextRoot, "standalone");
  const buildId = await readBuildId(path.join(nextRoot, "BUILD_ID"), "root");
  const standaloneBuildId = await readBuildId(
    path.join(standaloneRoot, "apps", "web", ".next", "BUILD_ID"),
    "standalone"
  );
  if (standaloneBuildId !== buildId) {
    throw new Error("[build:acceptance] standalone BUILD_ID does not match root BUILD_ID");
  }

  const manifestPath = path.join(standaloneRoot, BUILD_PROVENANCE_FILE_NAME);
  const temporaryPath = `${manifestPath}.${process.pid}.tmp`;
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  try {
    await fs.writeFile(temporaryPath, serializeBuildProvenance({ buildId, ...before }), "utf8");
    await fs.rename(temporaryPath, manifestPath);
  } finally {
    await fs.rm(temporaryPath, { force: true });
  }

  const finalSource = await requireCleanSourceProvenance(root, {
    errorPrefix: "[build:acceptance] source tree changed while writing build provenance"
  });
  if (finalSource.sourceCommit !== before.sourceCommit || finalSource.sourceTree !== before.sourceTree) {
    throw new Error("[build:acceptance] source commit or tree changed while writing build provenance");
  }

  return {
    buildId,
    sourceCommit: before.sourceCommit,
    sourceTree: before.sourceTree,
    manifestPath
  };
}

export const testApi = { buildAcceptance };

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  buildAcceptance()
    .then(({ buildId, sourceCommit, sourceTree }) => {
      process.stdout.write(`[build:acceptance] built ${buildId} from ${sourceCommit} (${sourceTree})\n`);
    })
    .catch((error) => {
      process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
      process.exitCode = 1;
    });
}
