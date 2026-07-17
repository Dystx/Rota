import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readText = (relativePath: string): string =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

describe("development runtime memory safety", () => {
  it("uses a bounded Webpack process as the default development runtime", () => {
    const packageJson = JSON.parse(readText("../package.json")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts.dev).toBe(
      "NODE_OPTIONS=--max-old-space-size=2048 next dev --webpack"
    );
  });

  it("keeps Turbopack explicit and applies the same JavaScript heap ceiling", () => {
    const packageJson = JSON.parse(readText("../package.json")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["dev:turbopack"]).toBe(
      "NODE_OPTIONS=--max-old-space-size=2048 next dev --turbopack"
    );
  });

  it("disables persistent Turbo cache and bounds native Turbo work", () => {
    const nextConfig = readText("../next.config.ts");

    expect(nextConfig).toMatch(/turbopackFileSystemCacheForDev:\s*false/);
    expect(nextConfig).toMatch(/turbopackMemoryLimit:\s*2\s*\*\s*1024\s*\*\s*1024\s*\*\s*1024/);
    expect(nextConfig).toMatch(/turbopackPluginRuntimeStrategy:\s*["']workerThreads["']/);
  });

  it("does not archive full Next build outputs in the repository Turbo cache", () => {
    const turboConfig = JSON.parse(readText("../../../turbo.json")) as {
      tasks: {
        build: { cache?: boolean };
        "web#build"?: { cache?: boolean; outputs?: string[] };
      };
    };

    expect(turboConfig.tasks.build.cache).not.toBe(false);
    expect(turboConfig.tasks["web#build"]).toMatchObject({
      cache: false,
      outputs: [".next/**", "!.next/cache/**"]
    });
  });
});
