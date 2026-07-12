import { describe, expect, it } from "vitest";
import { buildCameraPresets, cameraPresetTarget } from "./camera-presets";

describe("camera presets", () => {
  it("creates explicit data beats and derives the day part from stop time", () => {
    const presets = buildCameraPresets([
      { id: "ribeira", label: "Ribeira", center: [-8.61, 41.14], startTime: "09:30" },
      { id: "bolhao", label: "Bolhão", center: [-8.60, 41.15], startTime: "14:00" },
      { id: "fado", label: "Fado", center: [-9.13, 38.71], startTime: "20:00" }
    ]);

    expect(presets.map((preset) => preset.dayPart)).toEqual(["morning", "afternoon", "evening"]);
    expect(presets[0]).toMatchObject({ stopId: "ribeira", label: "Ribeira", zoom: 12, pitch: 0 });
  });

  it("omits unresolved or invalid stops without inventing a camera target", () => {
    const presets = buildCameraPresets([
      { id: "missing", label: "Missing", center: null },
      { id: "invalid", label: "Invalid", center: [400, 41] },
      { id: "valid", label: "Valid", center: [-8.61, 41.14] }
    ]);

    expect(presets).toHaveLength(1);
    expect(presets[0]?.stopId).toBe("valid");
  });

  it("turns reduced motion into an immediate camera target", () => {
    const preset = buildCameraPresets([{ id: "ribeira", label: "Ribeira", center: [-8.61, 41.14] }])[0];
    expect(preset).toBeDefined();
    expect(cameraPresetTarget(preset!, true)).toMatchObject({ center: [-8.61, 41.14], duration: 0 });
  });
});
