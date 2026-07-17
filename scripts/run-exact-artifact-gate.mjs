import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB_ROOT = path.join(ROOT, "apps", "web");
const NEXT_ROOT = path.join(WEB_ROOT, ".next");
const STANDALONE_ROOT = path.join(NEXT_ROOT, "standalone", "apps", "web");
const SERVER_PATH = path.join(STANDALONE_ROOT, "server.js");
const PORT = 3105;
const HOST = "127.0.0.1";

const NON_VISUAL_SPECS = [
  "playwright/tests/route-scenes.spec.ts",
  "playwright/tests/loading-recovery.spec.ts",
  "playwright/tests/preference-accessibility.spec.ts",
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

async function requiredArtifact() {
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

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (["node_modules", "public", "static"].includes(entry.name)) continue;
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(filePath));
    else files.push(filePath);
  }
  return files;
}

async function artifactDigest(buildIdPath) {
  const candidates = [buildIdPath, SERVER_PATH];
  for (const root of [NEXT_ROOT, STANDALONE_ROOT]) {
    for (const filePath of await walk(root)) {
      if (filePath.endsWith("manifest.json") || filePath.endsWith("manifests.json")) candidates.push(filePath);
    }
  }
  const unique = [...new Set(candidates)].sort();
  const hash = createHash("sha256");
  for (const filePath of unique) {
    hash.update(path.relative(ROOT, filePath));
    hash.update("\0");
    hash.update(await fs.readFile(filePath));
    hash.update("\0");
  }
  return { digest: hash.digest("hex"), files: unique.map((filePath) => path.relative(ROOT, filePath)) };
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
  const { buildId, buildIdPath } = await requiredArtifact();
  await copyReleaseAssets();
  const { digest, files } = await artifactDigest(buildIdPath);
  const receiptPath = path.join(ROOT, "output", "playwright", "exact-artifact", "build-receipt.json");
  await fs.mkdir(path.dirname(receiptPath), { recursive: true });
  await fs.writeFile(receiptPath, `${JSON.stringify({ buildId, digest, files, server: path.relative(ROOT, SERVER_PATH), port: PORT, phase, createdAt: new Date().toISOString() }, null, 2)}\n`);

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
