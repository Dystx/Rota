import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { CINEMATIC_MEDIA, type CinematicMediaEntry } from "./cinematic-media-manifest";

describe("Cinematic media manifest", () => {
  it("keeps every motion entry local, licensed, poster-backed, and within budget", () => {
    for (const entry of Object.values(CINEMATIC_MEDIA) as readonly CinematicMediaEntry[]) {
      expect(entry.videoSrc.startsWith("/")).toBe(true);
      expect(entry.posterSrc.startsWith("/")).toBe(true);
      expect(entry.fallbackSrc.startsWith("/")).toBe(true);
      expect(entry.licence.length).toBeGreaterThan(0);
      expect(entry.licenceUrl.startsWith("https://")).toBe(true);
      expect(entry.sourceUrl.startsWith("https://")).toBe(true);
      expect(entry.loadStrategy).toBe("eager");
      expect(entry.pauseWhenHidden).toBe(true);
      expect(entry.textSafeZone.width).toBeGreaterThan(0);
      expect(entry.textSafeZone.height).toBeGreaterThan(0);
      if (entry.mobileTextSafeZone) {
        expect(entry.mobileTextSafeZone.width).toBeGreaterThan(0);
        expect(entry.mobileTextSafeZone.height).toBeGreaterThan(0);
      }
      expect(entry.durationMs).toBeGreaterThanOrEqual(6000);
      expect(entry.durationMs).toBeLessThanOrEqual(10000);
      expect(entry.videoBytes).toBeLessThanOrEqual(1_500_000);
      expect(entry.mobileBytes).toBeLessThanOrEqual(1_500_000);
      expect(existsSync(resolve(process.cwd(), "apps/web/public", entry.videoSrc.slice(1)))).toBe(true);
      expect(existsSync(resolve(process.cwd(), "apps/web/public", entry.posterSrc.slice(1)))).toBe(true);
      expect(existsSync(resolve(process.cwd(), "apps/web/public", entry.fallbackSrc.slice(1)))).toBe(true);
      expect(statSync(resolve(process.cwd(), "apps/web/public", entry.videoSrc.slice(1))).size).toBe(entry.videoBytes);
      for (const optionalSrc of [entry.webmSrc, entry.mobileWebmSrc, entry.mobileSrc, entry.mobileVideoSrc, entry.mobilePosterSrc]) {
        if (optionalSrc) {
          expect(optionalSrc.startsWith("/")).toBe(true);
          expect(existsSync(resolve(process.cwd(), "apps/web/public", optionalSrc.slice(1)))).toBe(true);
        }
      }
    }
  });
});
