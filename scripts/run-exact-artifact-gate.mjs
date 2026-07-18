import { execFile as execFileCallback, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual, promisify } from "node:util";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB_ROOT = path.join(ROOT, "apps", "web");
const NEXT_ROOT = path.join(WEB_ROOT, ".next");
const STANDALONE_RUNTIME_ROOT = path.join(NEXT_ROOT, "standalone");
const STANDALONE_ROOT = path.join(STANDALONE_RUNTIME_ROOT, "apps", "web");
const STANDALONE_BUILD_ID_PATH = path.join(STANDALONE_ROOT, ".next", "BUILD_ID");
const SERVER_PATH = path.join(STANDALONE_ROOT, "server.js");
const RECEIPT_PATH = path.join(ROOT, "output", "playwright", "exact-artifact", "build-receipt.json");
const RECEIPT_SCHEMA_VERSION = 2;
const PORT = 3105;
const HOST = "127.0.0.1";
const execFile = promisify(execFileCallback);

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

function parseArgs() {
  const args = process.argv.slice(2);
  const phaseIndex = args.indexOf("--phase");
  const phase = phaseIndex === -1 ? "pre-approval" : args[phaseIndex + 1];
  const grepIndex = args.indexOf("--grep");
  const grep = grepIndex === -1 ? undefined : args[grepIndex + 1];
  const updateSnapshots = args.includes("--update-snapshots");
  if (!["pre-approval", "update-family", "final"].includes(phase)) {
    throw new Error("[exact-artifact] --phase must be pre-approval, update-family, or final");
  }
  if (phase === "update-family" && (!grep || !updateSnapshots)) {
    throw new Error("[exact-artifact] update-family requires both --grep <scoped-family> and --update-snapshots");
  }
  if (phase !== "update-family" && updateSnapshots) {
    throw new Error("[exact-artifact] snapshot updates are only allowed in the explicitly scoped update-family phase");
  }
  return { phase, grep, updateSnapshots };
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

async function gitOutput(args) {
  const { stdout } = await execFile("git", args, { cwd: ROOT, maxBuffer: 16 * 1024 * 1024 });
  return stdout.trim();
}

async function sourceProvenance() {
  const trackedStatus = await gitOutput(["status", "--porcelain=v1", "--untracked-files=no"]);
  const untracked = (await gitOutput(["ls-files", "--others", "--exclude-standard"]))
    .split("\n")
    .filter(Boolean);
  const disallowedUntracked = untracked.filter((filePath) => filePath !== "output" && !filePath.startsWith("output/"));
  if (trackedStatus || disallowedUntracked.length > 0) {
    const details = [
      trackedStatus ? "tracked changes are present" : null,
      disallowedUntracked.length > 0 ? `untracked files outside output/: ${disallowedUntracked.join(", ")}` : null
    ].filter(Boolean).join("; ");
    throw new Error(`[exact-artifact] pre-approval requires a clean source tree (${details})`);
  }
  return {
    sourceCommit: await gitOutput(["rev-parse", "HEAD"]),
    sourceTree: await gitOutput(["rev-parse", "HEAD^{tree}"]),
    trackedClean: true
  };
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

function validateReceipt(receipt) {
  if (!receipt || typeof receipt !== "object" || receipt.schemaVersion !== RECEIPT_SCHEMA_VERSION) {
    receiptInvalid(`expected schemaVersion ${RECEIPT_SCHEMA_VERSION}`);
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

async function readReceipt() {
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
  return validateReceipt(receipt);
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

async function prepareArtifactPhase({ phase, now = () => new Date() }) {
  if (phase === "pre-approval") {
    const provenance = await sourceProvenance();
    const built = await requiredBuildArtifact();
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
      inventoryCount: artifact.inventory.length,
      inventory: artifact.inventory
    };
    const receipt = {
      schemaVersion: RECEIPT_SCHEMA_VERSION,
      candidate,
      verifications: [phaseVerification(phase, candidate, now)]
    };
    await writeReceipt(receipt);
    return { artifact, receipt };
  }

  const receipt = await readReceipt();
  const served = await requiredServedArtifact();
  if (served.buildId !== receipt.candidate.buildId) {
    throw new Error("[exact-artifact] served BUILD_ID mismatch before server start");
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
  const { phase, grep, updateSnapshots } = parseArgs();
  const { receipt } = await prepareArtifactPhase({ phase });
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

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
