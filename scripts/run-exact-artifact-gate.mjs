import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

import {
  BUILD_PROVENANCE_FILE_NAME,
  BUILD_PROVENANCE_SCHEMA_VERSION,
  requireBuildProvenance,
  requireCleanSourceProvenance
} from "./exact-artifact-provenance.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB_ROOT = path.join(ROOT, "apps", "web");
const NEXT_ROOT = path.join(WEB_ROOT, ".next");
const STANDALONE_RUNTIME_ROOT = path.join(NEXT_ROOT, "standalone");
const STANDALONE_ROOT = path.join(STANDALONE_RUNTIME_ROOT, "apps", "web");
const STANDALONE_BUILD_ID_PATH = path.join(STANDALONE_ROOT, ".next", "BUILD_ID");
const BUILD_PROVENANCE_PATH = path.join(STANDALONE_RUNTIME_ROOT, BUILD_PROVENANCE_FILE_NAME);
const SERVER_PATH = path.join(STANDALONE_ROOT, "server.js");
const RECEIPT_PATH = path.join(ROOT, "output", "playwright", "exact-artifact", "build-receipt.json");
const RECEIPT_ARCHIVE_ROOT = path.join(path.dirname(RECEIPT_PATH), "archive");
const RECEIPT_SCHEMA_VERSION = 3;
const PORT = 3105;
const HOST = "127.0.0.1";

const NON_VISUAL_SPECS = [
  "playwright/tests/route-scenes.spec.ts",
  "playwright/tests/loading-recovery.spec.ts",
  "playwright/tests/preference-accessibility.spec.ts",
  "playwright/tests/visual-quality.spec.ts",
  "playwright/tests/console-workspace-responsive.spec.ts",
  "playwright/tests/protected-routes.spec.ts",
  "playwright/tests/accessibility.spec.ts",
  "playwright/tests/mobile-overflow.spec.ts",
  "playwright/tests/viewport-contract.spec.ts",
  "playwright/tests/perf.spec.ts"
];
const VISUAL_SPECS = ["playwright/tests/visual.spec.ts"];

function parseArgs(args = process.argv.slice(2)) {
  let phase;
  let grep;
  let updateSnapshots = false;
  let newCandidate = false;
  let replaceCandidate;
  const valueFor = (flag, index) => {
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`[exact-artifact] ${flag} requires a value`);
    return value;
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--phase") {
      if (phase !== undefined) throw new Error("[exact-artifact] --phase may only be supplied once");
      phase = valueFor(argument, index);
      index += 1;
    } else if (argument === "--grep") {
      if (grep !== undefined) throw new Error("[exact-artifact] --grep may only be supplied once");
      grep = valueFor(argument, index);
      index += 1;
    } else if (argument === "--update-snapshots") {
      if (updateSnapshots) throw new Error("[exact-artifact] --update-snapshots may only be supplied once");
      updateSnapshots = true;
    } else if (argument === "--new-candidate") {
      if (newCandidate) throw new Error("[exact-artifact] --new-candidate may only be supplied once");
      newCandidate = true;
    } else if (argument === "--replace-candidate") {
      if (replaceCandidate !== undefined) throw new Error("[exact-artifact] --replace-candidate may only be supplied once");
      replaceCandidate = valueFor(argument, index);
      index += 1;
    } else {
      throw new Error(`[exact-artifact] unknown argument: ${argument}`);
    }
  }

  if (phase === undefined) throw new Error("[exact-artifact] --phase is required");
  if (!["pre-approval", "update-family", "final"].includes(phase)) {
    throw new Error("[exact-artifact] --phase must be pre-approval, update-family, or final");
  }
  if (replaceCandidate !== undefined && !/^[0-9a-f]{64}$/u.test(replaceCandidate)) {
    throw new Error("[exact-artifact] --replace-candidate must be a 64-character lowercase SHA-256 digest");
  }
  if (phase === "pre-approval" && Number(newCandidate) + Number(replaceCandidate !== undefined) !== 1) {
    throw new Error("[exact-artifact] pre-approval requires exactly one of --new-candidate or --replace-candidate <expected-old-digest>");
  }
  if (phase !== "pre-approval" && (newCandidate || replaceCandidate !== undefined)) {
    throw new Error("[exact-artifact] candidate creation authorization is only valid with --phase pre-approval");
  }
  if (phase === "update-family" && (!grep || !updateSnapshots)) {
    throw new Error("[exact-artifact] update-family requires both --grep <scoped-family> and --update-snapshots");
  }
  if (phase !== "update-family" && updateSnapshots) {
    throw new Error("[exact-artifact] snapshot updates are only allowed in the explicitly scoped update-family phase");
  }
  return { phase, grep, updateSnapshots, newCandidate, replaceCandidate };
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function requiredBuildArtifact() {
  const buildIdPath = path.join(NEXT_ROOT, "BUILD_ID");
  if (!(await exists(buildIdPath))) {
    throw new Error("[exact-artifact] refusing to run: apps/web/.next/BUILD_ID is missing; build once before invoking the gate");
  }
  if (!(await exists(SERVER_PATH))) {
    throw new Error("[exact-artifact] refusing to run: apps/web/.next/standalone/apps/web/server.js is missing");
  }
  const buildId = (await fs.readFile(buildIdPath, "utf8")).trim();
  if (!buildId) throw new Error("[exact-artifact] refusing to run: BUILD_ID is empty");
  return { buildId, buildIdPath };
}

async function requiredServedArtifact() {
  if (!(await exists(STANDALONE_BUILD_ID_PATH))) {
    throw new Error("[exact-artifact] refusing to run: served standalone .next/BUILD_ID is missing");
  }
  if (!(await exists(SERVER_PATH))) {
    throw new Error("[exact-artifact] refusing to run: apps/web/.next/standalone/apps/web/server.js is missing");
  }
  const buildId = (await fs.readFile(STANDALONE_BUILD_ID_PATH, "utf8")).trim();
  if (!buildId) throw new Error("[exact-artifact] refusing to run: served standalone BUILD_ID is empty");
  return { buildId };
}

async function copyReleaseAssets() {
  const staticSource = path.join(NEXT_ROOT, "static");
  const publicSource = path.join(WEB_ROOT, "public");
  const staticDestination = path.join(STANDALONE_ROOT, ".next", "static");
  const publicDestination = path.join(STANDALONE_ROOT, "public");
  if (!(await exists(staticSource)) || !(await exists(publicSource))) {
    throw new Error("[exact-artifact] refusing to run: public or .next/static is missing from the built artifact");
  }
  await fs.rm(staticDestination, { recursive: true, force: true });
  await fs.rm(publicDestination, { recursive: true, force: true });
  await fs.mkdir(path.dirname(staticDestination), { recursive: true });
  await fs.cp(staticSource, staticDestination, { recursive: true });
  await fs.cp(publicSource, publicDestination, { recursive: true });
}

function relativeToRoot(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function modeString(stats) {
  return (stats.mode & 0o777).toString(8).padStart(3, "0");
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => compareText(left.name, right.name))) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(filePath));
    else if (entry.isFile() || entry.isSymbolicLink()) files.push(filePath);
    else throw new Error(`[exact-artifact] unsupported runtime entry: ${relativeToRoot(filePath)}`);
  }
  return files;
}

function isInsideDirectory(directory, candidate) {
  const relative = path.relative(directory, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

async function validateSymlinkTarget(filePath) {
  let resolved;
  let resolvedRoot;
  try {
    [resolved, resolvedRoot] = await Promise.all([
      fs.realpath(filePath),
      fs.realpath(STANDALONE_RUNTIME_ROOT)
    ]);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error(`[exact-artifact] symlink target is missing: ${relativeToRoot(filePath)}`);
    }
    throw new Error(`[exact-artifact] symlink target cannot be resolved: ${relativeToRoot(filePath)} (${error instanceof Error ? error.message : String(error)})`);
  }
  if (!isInsideDirectory(resolvedRoot, resolved)) {
    throw new Error(`[exact-artifact] symlink target resolves outside standalone root: ${relativeToRoot(filePath)}`);
  }
}

async function validateRuntimeSymlinks() {
  if (!(await exists(STANDALONE_RUNTIME_ROOT))) {
    throw new Error("[exact-artifact] refusing to run: apps/web/.next/standalone is missing");
  }
  for (const filePath of await walk(STANDALONE_RUNTIME_ROOT)) {
    if ((await fs.lstat(filePath)).isSymbolicLink()) await validateSymlinkTarget(filePath);
  }
}

async function artifactDigest(_buildIdPath) {
  if (!(await exists(STANDALONE_RUNTIME_ROOT))) {
    throw new Error("[exact-artifact] refusing to run: apps/web/.next/standalone is missing");
  }
  const candidates = (await walk(STANDALONE_RUNTIME_ROOT))
    .sort((left, right) => compareText(relativeToRoot(left), relativeToRoot(right)));
  const hash = createHash("sha256");
  hash.update("rumia-standalone-runtime-v2\0");
  const inventory = [];
  for (const filePath of candidates) {
    const stats = await fs.lstat(filePath);
    const relativePath = relativeToRoot(filePath);
    if (stats.isSymbolicLink()) {
      await validateSymlinkTarget(filePath);
      const entry = {
        path: relativePath,
        type: "symlink",
        mode: modeString(stats),
        target: await fs.readlink(filePath)
      };
      inventory.push(entry);
      hash.update(JSON.stringify(entry));
      hash.update("\0");
      continue;
    }
    const contents = await fs.readFile(filePath);
    const entry = {
      path: relativePath,
      type: "file",
      mode: modeString(stats),
      size: contents.length,
      sha256: createHash("sha256").update(contents).digest("hex")
    };
    inventory.push(entry);
    hash.update(JSON.stringify(entry));
    hash.update("\0");
    hash.update(contents);
    hash.update("\0");
  }
  return {
    digest: hash.digest("hex"),
    files: inventory.map((entry) => entry.path),
    inventory
  };
}

async function sourceProvenance() {
  return requireCleanSourceProvenance(ROOT, {
    errorPrefix: "[exact-artifact] pre-approval requires a clean source tree"
  });
}

function receiptInvalid(reason) {
  throw new Error(`[exact-artifact] candidate receipt is invalid: ${reason}`);
}

function validateInventory(inventory) {
  if (!Array.isArray(inventory) || inventory.length === 0) receiptInvalid("candidate inventory is missing");
  const paths = new Set();
  for (const entry of inventory) {
    if (!entry || typeof entry !== "object" || typeof entry.path !== "string" || !entry.path) {
      receiptInvalid("candidate inventory entry is malformed");
    }
    if (paths.has(entry.path)) receiptInvalid(`duplicate inventory path ${entry.path}`);
    paths.add(entry.path);
    if (entry.type === "file") {
      if (!/^\d{3}$/.test(entry.mode) || !Number.isSafeInteger(entry.size) || entry.size < 0 || !/^[0-9a-f]{64}$/.test(entry.sha256)) {
        receiptInvalid(`file inventory entry is malformed: ${entry.path}`);
      }
    } else if (entry.type === "symlink") {
      if (!/^\d{3}$/.test(entry.mode) || typeof entry.target !== "string" || !entry.target) {
        receiptInvalid(`symlink inventory entry is malformed: ${entry.path}`);
      }
    } else {
      receiptInvalid(`unsupported inventory type: ${entry.path}`);
    }
  }
}

function validateReceipt(receipt, { allowLegacy = false } = {}) {
  const acceptedSchemas = allowLegacy ? [2, RECEIPT_SCHEMA_VERSION] : [RECEIPT_SCHEMA_VERSION];
  if (!receipt || typeof receipt !== "object" || !acceptedSchemas.includes(receipt.schemaVersion)) {
    receiptInvalid(`expected schemaVersion ${acceptedSchemas.join(" or ")}`);
  }
  const candidate = receipt.candidate;
  if (!candidate || typeof candidate !== "object") receiptInvalid("candidate identity is missing");
  for (const field of ["buildId", "digest", "sourceCommit", "sourceTree", "server", "candidateCreatedAt"]) {
    if (typeof candidate[field] !== "string" || !candidate[field]) receiptInvalid(`candidate ${field} is missing`);
  }
  if (!/^[0-9a-f]{64}$/.test(candidate.digest)) receiptInvalid("candidate digest is malformed");
  if (!/^[0-9a-f]{40,64}$/.test(candidate.sourceCommit)) receiptInvalid("candidate sourceCommit is malformed");
  if (!/^[0-9a-f]{40,64}$/.test(candidate.sourceTree)) receiptInvalid("candidate sourceTree is malformed");
  if (candidate.trackedClean !== true) receiptInvalid("candidate trackedClean must be true");
  if (candidate.server !== relativeToRoot(SERVER_PATH)) receiptInvalid("candidate server path is unexpected");
  if (candidate.port !== PORT) receiptInvalid("candidate port is unexpected");
  if (Number.isNaN(Date.parse(candidate.candidateCreatedAt))) receiptInvalid("candidate timestamp is malformed");
  validateInventory(candidate.inventory);
  if (candidate.inventoryCount !== candidate.inventory.length) receiptInvalid("candidate inventoryCount does not match inventory");
  if (receipt.schemaVersion === RECEIPT_SCHEMA_VERSION) {
    const buildProvenance = candidate.buildProvenance;
    if (!buildProvenance || typeof buildProvenance !== "object") {
      receiptInvalid("candidate buildProvenance is missing");
    }
    if (buildProvenance.schemaVersion !== BUILD_PROVENANCE_SCHEMA_VERSION) {
      receiptInvalid("candidate buildProvenance schemaVersion is unexpected");
    }
    if (buildProvenance.manifest !== relativeToRoot(BUILD_PROVENANCE_PATH)) {
      receiptInvalid("candidate buildProvenance manifest path is unexpected");
    }
    if (!/^[0-9a-f]{64}$/u.test(buildProvenance.manifestSha256)) {
      receiptInvalid("candidate buildProvenance manifestSha256 is malformed");
    }
    const creation = receipt.creation;
    if (!creation || typeof creation !== "object" || !["new", "replacement"].includes(creation.mode)) {
      receiptInvalid("candidate creation audit is missing");
    }
    if (creation.mode === "replacement") {
      if (!/^[0-9a-f]{64}$/u.test(creation.expectedPriorDigest)) {
        receiptInvalid("replacement expectedPriorDigest is malformed");
      }
      if (typeof creation.priorBuildId !== "string" || !creation.priorBuildId) {
        receiptInvalid("replacement priorBuildId is missing");
      }
      if (
        typeof creation.priorReceiptArchive !== "string" ||
        !creation.priorReceiptArchive.startsWith(`${relativeToRoot(RECEIPT_ARCHIVE_ROOT)}/`)
      ) {
        receiptInvalid("replacement priorReceiptArchive is unexpected");
      }
    }
  }
  if (!Array.isArray(receipt.verifications) || receipt.verifications.length === 0) {
    receiptInvalid("phase verifications are missing");
  }
  for (const verification of receipt.verifications) {
    if (!verification || !["pre-approval", "update-family", "final"].includes(verification.phase)) {
      receiptInvalid("phase verification is malformed");
    }
    if (typeof verification.verifiedAt !== "string" || Number.isNaN(Date.parse(verification.verifiedAt))) {
      receiptInvalid("phase verification timestamp is malformed");
    }
    if (verification.buildId !== candidate.buildId || verification.digest !== candidate.digest || verification.inventoryCount !== candidate.inventoryCount) {
      receiptInvalid("phase verification does not match candidate identity");
    }
  }
  return receipt;
}

async function readReceipt({ allowLegacy = false, includeContents = false } = {}) {
  let contents;
  try {
    contents = await fs.readFile(RECEIPT_PATH, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error("[exact-artifact] candidate receipt is missing; create it with --phase pre-approval");
    }
    throw error;
  }
  let receipt;
  try {
    receipt = JSON.parse(contents);
  } catch {
    throw new Error("[exact-artifact] candidate receipt is malformed JSON");
  }
  const validated = validateReceipt(receipt, { allowLegacy });
  return includeContents ? { receipt: validated, contents } : validated;
}

async function writeReceipt(receipt) {
  await fs.mkdir(path.dirname(RECEIPT_PATH), { recursive: true });
  const temporaryPath = `${RECEIPT_PATH}.${process.pid}.tmp`;
  try {
    await fs.writeFile(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`);
    await fs.rename(temporaryPath, RECEIPT_PATH);
  } finally {
    await fs.rm(temporaryPath, { force: true });
  }
}

function phaseVerification(phase, candidate, now) {
  return {
    phase,
    verifiedAt: now().toISOString(),
    buildId: candidate.buildId,
    digest: candidate.digest,
    inventoryCount: candidate.inventoryCount
  };
}

async function authorizeCandidateCreation({ newCandidate = false, replaceCandidate }) {
  if (!newCandidate && replaceCandidate === undefined) {
    throw new Error("[exact-artifact] pre-approval requires explicit candidate creation authorization");
  }
  if (newCandidate && replaceCandidate !== undefined) {
    throw new Error("[exact-artifact] pre-approval accepts only one candidate creation authorization");
  }
  const receiptExists = await exists(RECEIPT_PATH);
  if (newCandidate) {
    if (receiptExists) {
      throw new Error("[exact-artifact] --new-candidate requires that no candidate receipt exists");
    }
    return { creation: { mode: "new" } };
  }
  if (!receiptExists) {
    throw new Error("[exact-artifact] --replace-candidate requires an existing candidate receipt");
  }
  const { receipt, contents } = await readReceipt({ allowLegacy: true, includeContents: true });
  if (receipt.candidate.digest !== replaceCandidate) {
    throw new Error(`[exact-artifact] replacement digest mismatch: expected existing ${receipt.candidate.digest}, received ${replaceCandidate}`);
  }
  const archivePath = path.join(RECEIPT_ARCHIVE_ROOT, `build-receipt.${receipt.candidate.digest}.json`);
  return {
    archivePath,
    archivedContents: contents,
    creation: {
      mode: "replacement",
      expectedPriorDigest: receipt.candidate.digest,
      priorBuildId: receipt.candidate.buildId,
      priorReceiptArchive: relativeToRoot(archivePath)
    }
  };
}

async function archivePriorReceipt(archivePath, contents) {
  await fs.mkdir(path.dirname(archivePath), { recursive: true });
  try {
    await fs.writeFile(archivePath, contents, { flag: "wx" });
  } catch (error) {
    if (!error || error.code !== "EEXIST") throw error;
    const existing = await fs.readFile(archivePath, "utf8");
    if (existing !== contents) {
      throw new Error(`[exact-artifact] refusing to overwrite a different receipt archive: ${relativeToRoot(archivePath)}`);
    }
  }
}

async function prepareArtifactPhase({ phase, newCandidate = false, replaceCandidate, now = () => new Date() }) {
  if (phase === "pre-approval") {
    const authorization = await authorizeCandidateCreation({ newCandidate, replaceCandidate });
    const provenance = await sourceProvenance();
    const built = await requiredBuildArtifact();
    const buildProvenance = await requireBuildProvenance(BUILD_PROVENANCE_PATH, {
      buildId: built.buildId,
      sourceCommit: provenance.sourceCommit,
      sourceTree: provenance.sourceTree
    });
    await validateRuntimeSymlinks();
    await copyReleaseAssets();
    const served = await requiredServedArtifact();
    if (served.buildId !== built.buildId) {
      throw new Error("[exact-artifact] served standalone BUILD_ID does not match the candidate build");
    }
    const artifact = await artifactDigest(built.buildIdPath);
    const candidate = {
      buildId: served.buildId,
      digest: artifact.digest,
      sourceCommit: provenance.sourceCommit,
      sourceTree: provenance.sourceTree,
      trackedClean: provenance.trackedClean,
      server: relativeToRoot(SERVER_PATH),
      port: PORT,
      candidateCreatedAt: now().toISOString(),
      buildProvenance: {
        schemaVersion: BUILD_PROVENANCE_SCHEMA_VERSION,
        manifest: relativeToRoot(BUILD_PROVENANCE_PATH),
        manifestSha256: buildProvenance.manifestSha256
      },
      inventoryCount: artifact.inventory.length,
      inventory: artifact.inventory
    };
    const receipt = {
      schemaVersion: RECEIPT_SCHEMA_VERSION,
      candidate,
      creation: authorization.creation,
      verifications: [phaseVerification(phase, candidate, now)]
    };
    if (authorization.archivePath) {
      await archivePriorReceipt(authorization.archivePath, authorization.archivedContents);
    }
    await writeReceipt(receipt);
    return { artifact, receipt, receiptArchivePath: authorization.archivePath };
  }

  const receipt = await readReceipt();
  const served = await requiredServedArtifact();
  if (served.buildId !== receipt.candidate.buildId) {
    throw new Error("[exact-artifact] served BUILD_ID mismatch before server start");
  }
  const buildProvenance = await requireBuildProvenance(BUILD_PROVENANCE_PATH, {
    buildId: receipt.candidate.buildId,
    sourceCommit: receipt.candidate.sourceCommit,
    sourceTree: receipt.candidate.sourceTree
  });
  if (buildProvenance.manifestSha256 !== receipt.candidate.buildProvenance.manifestSha256) {
    throw new Error("[exact-artifact] build provenance manifest digest mismatch before server start");
  }
  const artifact = await artifactDigest();
  if (artifact.digest !== receipt.candidate.digest) {
    throw new Error(`[exact-artifact] artifact digest mismatch before server start: expected ${receipt.candidate.digest}, received ${artifact.digest}`);
  }
  if (!isDeepStrictEqual(artifact.inventory, receipt.candidate.inventory)) {
    throw new Error("[exact-artifact] artifact inventory mismatch before server start");
  }
  receipt.verifications.push(phaseVerification(phase, receipt.candidate, now));
  await writeReceipt(receipt);
  return { artifact, receipt };
}

function waitForExit(child) {
  if (child.exitCode !== null) return Promise.resolve({ code: child.exitCode, signal: null });
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

function portOpen() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: HOST, port: PORT });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForPortClosed(timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!(await portOpen())) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`[exact-artifact] listener on ${HOST}:${PORT} remained open after server termination`);
}

async function startServer(buildId, digest) {
  const output = { stdout: "", stderr: "" };
  const env = {
    ...process.env,
    HOSTNAME: HOST,
    PORT: String(PORT),
    NODE_ENV: "production",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? `http://${HOST}:${PORT}`,
    PLAYWRIGHT_BUILD_ID: buildId,
    PLAYWRIGHT_BUILD_DIGEST: digest
  };
  const child = spawn(process.execPath, [SERVER_PATH], { cwd: STANDALONE_ROOT, env, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout?.on("data", (chunk) => { output.stdout = `${output.stdout}${chunk}`.slice(-4000); });
  child.stderr?.on("data", (chunk) => { output.stderr = `${output.stderr}${chunk}`.slice(-4000); });

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`[exact-artifact] standalone server exited before health check (${child.exitCode})\n${output.stderr}`);
    for (const pathname of ["/api/health", "/health", "/"]) {
      try {
        const response = await fetch(`http://${HOST}:${PORT}${pathname}`, { signal: AbortSignal.timeout(2_000) });
        if (response.status < 500) return { child, output };
      } catch {
        // The next bounded poll covers startup races and transient DB errors.
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  child.kill("SIGTERM");
  await Promise.race([waitForExit(child), new Promise((resolve) => setTimeout(resolve, 5_000))]);
  await waitForPortClosed();
  throw new Error(`[exact-artifact] standalone server did not answer a health request within 30s\n${output.stderr}`);
}

function commandArgs(specs, grep, updateSnapshots) {
  const args = ["pnpm", "--dir", "apps/web", "exec", "playwright", "test", ...specs, "--config", "playwright.config.ts", "--workers=1"];
  if (grep) args.push("--grep", grep);
  if (updateSnapshots) args.push("--update-snapshots");
  return args;
}

async function runCommand(args, env) {
  const [command, ...commandArgsList] = args;
  process.stdout.write(`[exact-artifact] running ${args.join(" ")}\n`);
  const child = spawn("corepack", [command, ...commandArgsList], { cwd: ROOT, env, stdio: "inherit" });
  const result = await waitForExit(child);
  if (result.code !== 0) throw new Error(`[exact-artifact] command failed with exit ${result.code ?? result.signal}`);
}

async function main() {
  const { phase, grep, updateSnapshots, newCandidate, replaceCandidate } = parseArgs();
  const { receipt } = await prepareArtifactPhase({ phase, newCandidate, replaceCandidate });
  const { buildId, digest } = receipt.candidate;

  const server = await startServer(buildId, digest);
  const env = {
    ...process.env,
    PLAYWRIGHT_EXTERNAL_SERVER: "1",
    PLAYWRIGHT_BUILD_ID: buildId,
    PLAYWRIGHT_BUILD_DIGEST: digest,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? `http://${HOST}:${PORT}`
  };
  try {
    const nonVisualArgs = commandArgs(NON_VISUAL_SPECS, grep, false);
    const visualArgs = commandArgs(VISUAL_SPECS, grep, updateSnapshots);
    await runCommand(nonVisualArgs, env);
    await runCommand(visualArgs, env);
  } finally {
    if (server.child.exitCode === null) server.child.kill("SIGTERM");
    await Promise.race([waitForExit(server.child), new Promise((resolve) => setTimeout(resolve, 10_000))]);
    await waitForPortClosed();
  }
}

export const testApi = { artifactDigest, parseArgs, prepareArtifactPhase };

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
