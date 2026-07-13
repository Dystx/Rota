import { beforeEach, describe, expect, test, vi } from "vitest";

import { handleHealthRequest } from "./handler";

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgresql://rumia_app:test@127.0.0.1:5432/rumia");
    vi.stubEnv("BETTER_AUTH_SECRET", "health-test-secret");
  });

  test("returns 200 only after the private database probe succeeds", async () => {
    const response = await handleHealthRequest({
      now: new Date("2026-07-11T08:00:00.000Z"),
      probeDatabase: async () => undefined
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      database: "ready",
      generatedAt: "2026-07-11T08:00:00.000Z",
      status: "ok"
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  test("returns 503 when PostgreSQL cannot be reached", async () => {
    const response = await handleHealthRequest({ probeDatabase: async () => { throw new Error("down"); } });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ database: "unreachable", status: "degraded" });
  });

  test("returns 503 without database credentials", async () => {
    vi.stubEnv("DATABASE_URL", "");

    const probeDatabase = vi.fn(async () => undefined);
    const response = await handleHealthRequest({ probeDatabase });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ database: "configuration-missing", status: "degraded" });
    expect(probeDatabase).not.toHaveBeenCalled();
  });
});
