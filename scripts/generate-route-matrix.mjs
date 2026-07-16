import { createRequire } from "node:module";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(process.cwd(), { interopDefault: true });
const { ROUTE_PRESENTATION_CATALOGUE, ROUTE_SCENARIO_CATALOGUE } = jiti("./apps/web/lib/routes/route-presentation-catalogue.ts");

const viewportsFor = (scenario) => {
  if (scenario.state === "redirect") return ["redirect"];
  return scenario.viewports === "all-four"
    ? ["desktop-1440", "tablet-landscape", "tablet-portrait", "mobile-390"]
    : ["desktop-1440", "mobile-390"];
};

const markdownValue = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const fixtureLabel = (fixture) => `${fixture.kind}${"variant" in fixture ? `:${fixture.variant}` : ""}${"suffix" in fixture ? fixture.suffix : ""}`;
const setupLabel = (setup) => setup ? JSON.stringify(setup) : "—";
const rows = [];

for (const [route, contract] of Object.entries(ROUTE_PRESENTATION_CATALOGUE)) {
  for (const scenario of ROUTE_SCENARIO_CATALOGUE[route]) {
    for (const viewport of viewportsFor(scenario)) {
      rows.push([
        route,
        scenario.id,
        scenario.persona,
        scenario.state,
        viewport,
        contract.scene,
        contract.shell,
        contract.chrome,
        contract.footerMode,
        contract.texture,
        fixtureLabel(scenario.fixture),
        scenario.expected.access,
        scenario.expected.transition ?? (contract.redirectTo ? `redirect → ${contract.redirectTo}` : "—"),
        scenario.expected.noPrivateDisclosure ? "yes" : "no",
        setupLabel(scenario.setup)
      ].map(markdownValue));
    }
  }
}

const header = [
  "# Route evidence matrix",
  "",
  "Generated from `ROUTE_SCENARIO_CATALOGUE` in `apps/web/lib/routes/route-presentation-catalogue.ts`. Primary scenarios run at all four viewports; additional states run at desktop-1440 and mobile-390; redirects retain behavioral assertions.",
  "",
  `- Routes: ${Object.keys(ROUTE_PRESENTATION_CATALOGUE).length}`,
  `- Concrete scenarios: ${Object.values(ROUTE_SCENARIO_CATALOGUE).reduce((count, scenarios) => count + scenarios.length, 0)}`,
  `- Expanded evidence rows: ${rows.length}`,
  "",
  "| Route | Scenario | Persona | State | Viewport | Scene | Shell | Chrome | Footer | Texture | Fixture | Access | Transition | No private disclosure | Setup |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"
];

const body = rows.map((row) => `| ${row.join(" | ")} |`);
writeFileSync(resolve(process.cwd(), "docs/audit/route-matrix.md"), `${[...header, ...body].join("\n")}\n`, "utf8");
