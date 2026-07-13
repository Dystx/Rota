import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const listed = execFileSync(
  "rg",
  ["--files", "apps", "packages", "scripts", ".github/workflows", ".env.example", "package.json", "pnpm-workspace.yaml"],
  { cwd: root, encoding: "utf8" }
)
  .split("\n")
  .filter(Boolean);

const forbiddenRuntimePatterns = [
  /@supabase\//u,
  /NEXT_PUBLIC_SUPABASE/u,
  /SUPABASE_(?:SERVICE_ROLE|ANON_KEY|URL)/u,
  /supabase\/start/u,
  /supabase db (?:reset|push|lint|advisors)/u,
  /supabase\/setup-cli/u
];

const violations = [];
for (const relative of listed) {
  if (relative.includes("/supabase/") || /\.test\.[cm]?[jt]sx?$/u.test(relative) || relative === "scripts/check-runtime-architecture.mjs") {
    continue;
  }
  const filename = path.join(root, relative);
  if (!fs.statSync(filename).isFile()) continue;
  const content = fs.readFileSync(filename, "utf8");
  for (const pattern of forbiddenRuntimePatterns) {
    if (pattern.test(content)) violations.push(`${relative}: ${pattern}`);
  }
}

if (violations.length > 0) {
  console.error("Active runtime still contains retired Supabase activation paths:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Self-hosted runtime contract passed: no active Supabase activation path found.");
}
