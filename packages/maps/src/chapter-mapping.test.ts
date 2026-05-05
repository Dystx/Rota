import { describe, expect, it } from "vitest";
import { CHAPTER_CAMERA_DEFAULTS } from "./cinematic-config";
import { cameraForChapter, interpolateCamera, stopsToChapters } from "./chapter-mapping";

describe("chapter mapping", () => {
  it("stopsToChapters preserves order across multi-day trips", () => {
    expect(
      stopsToChapters([
        {
          dayIndex: 0,
          stops: [
            { stopName: "Lisbon" },
            { stopName: "Sintra" },
          ],
        },
        {
          dayIndex: 1,
          stops: [
            { stopName: "Porto" },
            { stopName: "Braga" },
          ],
        },
      ]).map((chapter) => chapter.stopName),
    ).toEqual(["Lisbon", "Sintra", "Porto", "Braga"]);
  });

  it("cameraForChapter returns longer duration for cross-region jumps", () => {
    const previousChapter = {
      chapterIndex: 0,
      stopName: "Lisbon",
      lng: -9.1393,
      lat: 38.7223,
      dayIndex: 0,
    };
    const nextChapter = {
      chapterIndex: 1,
      stopName: "Madrid",
      lng: -3.7038,
      lat: 40.4168,
      dayIndex: 1,
    };

    const camera = cameraForChapter(nextChapter, previousChapter);

    expect(camera.duration).toBeGreaterThan(CHAPTER_CAMERA_DEFAULTS.duration);
    expect(camera.curve).toBeGreaterThan(CHAPTER_CAMERA_DEFAULTS.curve);
  });

  it("interpolateCamera lerps endpoints and midpoint", () => {
    const from = { zoom: 10, pitch: 20, bearing: 15, lng: -9, lat: 38 };
    const to = { zoom: 14, pitch: 50, bearing: 45, lng: -8, lat: 39 };

    expect(interpolateCamera(from, to, 0)).toEqual(from);
    expect(interpolateCamera(from, to, 1)).toEqual(to);
    expect(interpolateCamera(from, to, 0.5)).toEqual({
      zoom: 12,
      pitch: 35,
      bearing: 30,
      lng: -8.5,
      lat: 38.5,
    });
  });

  it("interpolateCamera wraps bearing across 360 degrees", () => {
    const from = { zoom: 10, pitch: 20, bearing: 350, lng: -9, lat: 38 };
    const to = { zoom: 12, pitch: 40, bearing: 10, lng: -8, lat: 39 };

    expect(interpolateCamera(from, to, 0.5).bearing).toBeLessThan(1);
  });
});
