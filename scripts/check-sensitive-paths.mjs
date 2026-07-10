import { execFileSync } from "node:child_process";

const FORBIDDEN = [
  /^\.env(?:\.|$)/u,
  /^supabase\/\.temp\//u,
  /^apps\/web\/playwright\/\.auth\//u,
  /\.(?:pem|key)$/u
];

export function findForbiddenTrackedPaths(paths) {
  return paths.filter(
    (path) => !path.endsWith(".env.example") && FORBIDDEN.some((pattern) => pattern.test(path))
  );
}

if (process.argv[1]?.endsWith("check-sensitive-paths.mjs")) {
  const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean);
  const forbidden = findForbiddenTrackedPaths(tracked);

  if (forbidden.length > 0) {
    process.stderr.write(`Forbidden tracked paths:\n${forbidden.join("\n")}\n`);
    process.exitCode = 1;
  }
}
