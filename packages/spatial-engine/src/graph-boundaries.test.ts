import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readText = (relativePath: string): string =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

describe("spatial-engine module boundaries", () => {
  it("publishes a dependency-light error-suppression entry", () => {
    const packageJson = JSON.parse(readText("../package.json")) as {
      exports: Record<string, string>;
    };

    expect(packageJson.exports["./error-suppression"]).toBe(
      "./src/error-suppression.ts"
    );
  });

  it("does not import the package barrel from GlobeWorkspace", () => {
    const globeWorkspace = readText("./components/globe-workspace.tsx");

    expect(globeWorkspace).not.toMatch(
      /from\s+["'](?:\.\.\/index(?:\.ts)?|@repo\/spatial-engine)["']/
    );
    expect(globeWorkspace).toMatch(
      /from\s+["']\.\.\/adapters\/maplibre\/clickable-layer-ids["']/
    );
  });

  it("marks live renderer surfaces as map-capable", () => {
    for (const component of [
      "./components/globe-workspace.tsx",
      "./components/workspace-canvas.tsx"
    ]) {
      expect(readText(component)).toMatch(/data-map-capable=["']{2}/);
    }
  });
});
