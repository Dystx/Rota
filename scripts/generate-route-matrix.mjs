import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const catalogueSource = readFileSync(resolve(process.cwd(), "apps/web/lib/routes/http-route-catalogue.ts"), "utf8");
const paths = [...catalogueSource.matchAll(/path: "([^"]+)"/gu)].map((match) => match[1]);

// The TypeScript matrix is the executable source. This script intentionally
// writes a concise audit template; CI verifies the source test separately.
const header = "# Route evidence matrix\n\nGenerated from `apps/web/playwright/route-matrix.ts`. Capture evidence per persona and viewport before release.\n\n| Route | Persona | State | Desktop | Mobile |\n| --- | --- | --- | --- | --- |\n";
const rows = paths.map((path) => `| ${path} | See executable matrix | Pending capture | Pending | Pending |`).join("\n");
writeFileSync(resolve(process.cwd(), "docs/audit/route-matrix.md"), `${header}${rows}\n`, "utf8");
