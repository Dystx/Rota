import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { promisify } from "node:util";

export const BUILD_PROVENANCE_SCHEMA_VERSION = 1;
export const BUILD_PROVENANCE_FILE_NAME = "rumia-exact-artifact-provenance.json";

const execFile = promisify(execFileCallback);

async function gitOutput(root, args) {
  const { stdout } = await execFile("git", args, { cwd: root, maxBuffer: 16 * 1024 * 1024 });
  return stdout.trim();
}

export async function requireCleanSourceProvenance(
  root,
  { errorPrefix = "[exact-artifact] requires a clean source tree" } = {}
) {
  const trackedStatus = await gitOutput(root, ["status", "--porcelain=v1", "--untracked-files=no"]);
  const untracked = (await gitOutput(root, ["ls-files", "--others", "--exclude-standard"]))
    .split("\n")
    .filter(Boolean);
  const disallowedUntracked = untracked.filter(
    (filePath) => filePath !== "output" && !filePath.startsWith("output/")
  );
  if (trackedStatus || disallowedUntracked.length > 0) {
    const details = [
      trackedStatus ? "tracked changes are present" : null,
      disallowedUntracked.length > 0
        ? `untracked files outside output/: ${disallowedUntracked.join(", ")}`
        : null
    ].filter(Boolean).join("; ");
    throw new Error(`${errorPrefix} (${details})`);
  }
  return {
    sourceCommit: await gitOutput(root, ["rev-parse", "HEAD"]),
    sourceTree: await gitOutput(root, ["rev-parse", "HEAD^{tree}"]),
    trackedClean: true
  };
}

export function serializeBuildProvenance({ buildId, sourceCommit, sourceTree }) {
  return `${JSON.stringify({
    schemaVersion: BUILD_PROVENANCE_SCHEMA_VERSION,
    buildId,
    sourceCommit,
    sourceTree
  }, null, 2)}\n`;
}

function provenanceError(reason) {
  throw new Error(`[exact-artifact] build provenance ${reason}`);
}

export async function requireBuildProvenance(manifestPath, expected) {
  let contents;
  try {
    contents = await fs.readFile(manifestPath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") provenanceError("manifest is missing");
    throw error;
  }

  let manifest;
  try {
    manifest = JSON.parse(contents);
  } catch {
    provenanceError("manifest is malformed JSON");
  }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    provenanceError("manifest is malformed");
  }
  const keys = Object.keys(manifest).sort();
  const expectedKeys = ["buildId", "schemaVersion", "sourceCommit", "sourceTree"];
  if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) {
    provenanceError("manifest fields are malformed");
  }
  if (manifest.schemaVersion !== BUILD_PROVENANCE_SCHEMA_VERSION) {
    provenanceError(`schemaVersion must be ${BUILD_PROVENANCE_SCHEMA_VERSION}`);
  }
  if (typeof manifest.buildId !== "string" || !manifest.buildId) provenanceError("buildId is missing");
  if (!/^[0-9a-f]{40,64}$/u.test(manifest.sourceCommit)) provenanceError("sourceCommit is malformed");
  if (!/^[0-9a-f]{40,64}$/u.test(manifest.sourceTree)) provenanceError("sourceTree is malformed");
  for (const field of ["buildId", "sourceCommit", "sourceTree"]) {
    if (manifest[field] !== expected[field]) {
      const suffix = field === "sourceCommit" || field === "sourceTree" ? " clean HEAD" : " candidate build";
      provenanceError(`${field} does not match${suffix}`);
    }
  }
  return {
    manifest,
    manifestSha256: createHash("sha256").update(contents).digest("hex")
  };
}
