import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

export function getPolicyTestFiles(files) {
  const sqlFiles = files.filter((file) => file.endsWith(".sql")).sort();
  if (sqlFiles.length === 0) throw new Error("No policy SQL files found.");
  return sqlFiles;
}

export function runPolicyTests({ databaseUrl = process.env.SUPABASE_DB_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres" } = {}) {
  const directory = resolve(process.cwd(), "supabase/policy-tests");
  const files = getPolicyTestFiles(readdirSync(directory));

  for (const file of files) {
    const result = spawnSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", resolve(directory, file)], { stdio: "inherit" });
    if (result.status !== 0) return result.status ?? 1;
  }

  return 0;
}

if (process.argv[1]?.endsWith("run-policy-tests.mjs")) {
  process.exitCode = runPolicyTests();
}
