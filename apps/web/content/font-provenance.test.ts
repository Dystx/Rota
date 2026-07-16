import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("self-hosted font provenance", () => {
  it("records local files and OFL notices for every editorial family", () => {
    const manifestPath = resolve(process.cwd(), "apps/web/content/font-provenance.json");
    expect(existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Array<{
      family: string;
      files: string[];
      licenseFile: string;
      sourceUrl: string;
      licenseUrl: string;
      cssFamily: string;
      fallbackStack: string[];
      sha256: string[];
      licenseSha256: string;
    }>;

    expect(manifest.map((entry) => entry.family)).toEqual([
      "Newsreader",
      "Source Sans 3",
      "IBM Plex Mono"
    ]);

    for (const entry of manifest) {
      expect(entry.sourceUrl).toMatch(/^https:\/\//);
      expect(entry.licenseUrl).toMatch(/^https:\/\//);
      expect(entry.cssFamily.length).toBeGreaterThan(0);
      expect(entry.fallbackStack.length).toBeGreaterThan(0);
      expect(entry.fallbackStack.at(-1)).toMatch(/serif|sans-serif|monospace/);
      expect(entry.sha256).toHaveLength(entry.files.length);
      expect(existsSync(resolve(process.cwd(), "apps/web/public", entry.licenseFile.slice(1)))).toBe(true);
      const licensePath = resolve(process.cwd(), "apps/web/public", entry.licenseFile.slice(1));
      expect(createHash("sha256").update(readFileSync(licensePath)).digest("hex")).toBe(entry.licenseSha256);
      for (const [index, file] of entry.files.entries()) {
        expect(file.startsWith("/fonts/")).toBe(true);
        const filePath = resolve(process.cwd(), "apps/web/public", file.slice(1));
        expect(existsSync(filePath)).toBe(true);
        expect(createHash("sha256").update(readFileSync(filePath)).digest("hex")).toBe(entry.sha256[index]);
      }
    }
  });

  it("keeps font-face requests on the local origin", () => {
    const css = readFileSync(resolve(process.cwd(), "packages/ui/src/styles.css"), "utf8");
    expect(css).not.toMatch(/fonts\.(googleapis|gstatic)\.com/i);
    expect(css).toContain("/fonts/newsreader/Newsreader-Variable.ttf");
    expect(css).toContain("/fonts/source-sans-3/SourceSans3-Variable.ttf");
    expect(css).toContain("/fonts/ibm-plex-mono/IBMPlexMono-Regular.ttf");
  });
});
