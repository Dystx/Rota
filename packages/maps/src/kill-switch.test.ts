import { describe, it, expect, afterEach } from "vitest";
import { getKillSwitchSource, isKillSwitchActive } from "./kill-switch";

describe("kill-switch helper", () => {
  const originalServer = process.env.MAPBOX_KILL_SWITCH;
  const originalClient = process.env.NEXT_PUBLIC_MAPBOX_KILL_SWITCH;

  afterEach(() => {
    process.env.MAPBOX_KILL_SWITCH = originalServer;
    process.env.NEXT_PUBLIC_MAPBOX_KILL_SWITCH = originalClient;
  });

  it("returns true when server env is exactly '1'", () => {
    expect(isKillSwitchActive({ server: "1" })).toBe(true);
    expect(getKillSwitchSource({ server: "1" })).toBe("server");
  });

  it("returns true when client env is exactly '1'", () => {
    expect(isKillSwitchActive({ client: "1" })).toBe(true);
    expect(getKillSwitchSource({ client: "1" })).toBe("client");
  });

  it("returns false when value is '0'", () => {
    expect(isKillSwitchActive({ server: "0", client: "0" })).toBe(false);
    expect(getKillSwitchSource({ server: "0", client: "0" })).toBe("off");
  });

  it("returns false when value is empty string", () => {
    expect(isKillSwitchActive({ server: "", client: "" })).toBe(false);
    expect(getKillSwitchSource({ server: "", client: "" })).toBe("off");
  });

  it("returns false when both env values are undefined", () => {
    expect(isKillSwitchActive({})).toBe(false);
    expect(getKillSwitchSource({})).toBe("off");
  });

  it("returns false for non-literal active values like 'true' or ' 1 '", () => {
    expect(isKillSwitchActive({ server: "true" })).toBe(false);
    expect(isKillSwitchActive({ client: "yes" })).toBe(false);
    expect(isKillSwitchActive({ server: " 1 " })).toBe(false);
    expect(getKillSwitchSource({ server: "true", client: "yes" })).toBe("off");
  });

  it("server precedence wins when both are active", () => {
    expect(isKillSwitchActive({ server: "1", client: "1" })).toBe(true);
    expect(getKillSwitchSource({ server: "1", client: "1" })).toBe("server");
  });

  it("activates via client when only client is set to '1'", () => {
    expect(isKillSwitchActive({ server: "0", client: "1" })).toBe(true);
    expect(getKillSwitchSource({ server: "0", client: "1" })).toBe("client");
  });

  it("falls back to process.env when no argument is supplied (SSR-safe)", () => {
    process.env.MAPBOX_KILL_SWITCH = "1";
    delete process.env.NEXT_PUBLIC_MAPBOX_KILL_SWITCH;
    expect(isKillSwitchActive()).toBe(true);
    expect(getKillSwitchSource()).toBe("server");

    delete process.env.MAPBOX_KILL_SWITCH;
    process.env.NEXT_PUBLIC_MAPBOX_KILL_SWITCH = "1";
    expect(isKillSwitchActive()).toBe(true);
    expect(getKillSwitchSource()).toBe("client");

    delete process.env.MAPBOX_KILL_SWITCH;
    delete process.env.NEXT_PUBLIC_MAPBOX_KILL_SWITCH;
    expect(isKillSwitchActive()).toBe(false);
    expect(getKillSwitchSource()).toBe("off");
  });
});
