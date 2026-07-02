import { describe, expect, it } from "vitest";
import {
  classifyErrorKind,
  createFakeMonitoringProvider,
  createNoopMonitoringProvider,
  isForbiddenDetailKey,
  looksLikeSecret,
  redactMonitoringDetails,
  resolveDefaultMonitoringProvider,
  safeMonitoringRoute,
  tryCapture
} from "./index";

describe("redactMonitoringDetails", () => {
  it("strips forbidden keys regardless of casing", () => {
    const out = redactMonitoringDetails({
      Authorization: "Bearer eyJabc.def.ghi",
      Cookie: "session=xyz",
      EMAIL: "user@example.com",
      raw_brief: "we want a 5 day trip to tokyo",
      reviewer_notes: "private comment",
      request_body: "{}",
      user_agent: "Mozilla/5.0",
      Referer: "https://example.com/x?secret=1",
      ip_address: "10.0.0.1",
      keep: "ok"
    });
    expect(out).toEqual({ keep: "ok" });
  });

  it("redacts string values that look like secrets", () => {
    const out = redactMonitoringDetails({
      note: "Bearer sk_live_abcdefgh",
      stripe: "sk_test_abcdefghij",
      supabase: "sb_secret_abcdefghij",
      mapboxToken: "pk.eyJabcdefghij.kl",
      jwt: "eyJabcdefghij.eyJabcdefghij.signaturehere",
      pemBlob: "-----BEGIN RSA PRIVATE KEY-----\nMIIB",
      addr: "user@example.com",
      safe: "trip-abc-12345"
    });
    expect(out).toEqual({
      note: "[redacted]",
      stripe: "[redacted]",
      supabase: "[redacted]",
      mapboxToken: "[redacted]",
      jwt: "[redacted]",
      pemBlob: "[redacted]",
      addr: "[redacted]",
      safe: "trip-abc-12345"
    });
  });

  it("recurses one level into nested objects", () => {
    const out = redactMonitoringDetails({
      headers: {
        authorization: "Bearer abc",
        traceId: "trace-1"
      },
      meta: { tier: "free" }
    });
    expect(out).toEqual({
      headers: { traceId: "trace-1" },
      meta: { tier: "free" }
    });
  });

  it("redacts secret-shaped strings inside arrays", () => {
    const out = redactMonitoringDetails({
      tokens: ["sk_live_abcdefghij", "ok-value", "Bearer xyz"]
    });
    expect(out).toEqual({ tokens: ["[redacted]", "ok-value", "[redacted]"] });
  });

  it("drops undefined values entirely", () => {
    const out = redactMonitoringDetails({ a: undefined, b: 1 });
    expect(out).toEqual({ b: 1 });
  });
});

describe("isForbiddenDetailKey / looksLikeSecret", () => {
  it("flags the documented key set", () => {
    for (const k of ["Authorization", "cookie", "Set-Cookie", "API_KEY", "password", "raw_brief", "ip_address"]) {
      expect(isForbiddenDetailKey(k)).toBe(true);
    }
    expect(isForbiddenDetailKey("status")).toBe(false);
  });

  it("recognizes common secret value shapes", () => {
    expect(looksLikeSecret("Bearer abc.def")).toBe(true);
    expect(looksLikeSecret("sk_live_abcdefgh")).toBe(true);
    expect(looksLikeSecret("plain text")).toBe(false);
  });
});

describe("safeMonitoringRoute", () => {
  it("strips query and fragment", () => {
    expect(safeMonitoringRoute("/api/trips?token=abc#x")).toBe("/api/trips");
  });

  it("replaces UUID, numeric, and opaque dynamic segments with :id", () => {
    expect(
      safeMonitoringRoute("/api/trips/0a0b0c0d-1111-2222-3333-444455556666/unlock")
    ).toBe("/api/trips/:id/unlock");
    expect(safeMonitoringRoute("/api/users/12345/posts")).toBe("/api/users/:id/posts");
    expect(safeMonitoringRoute("/api/trips/abcdef0123456789ZZ")).toBe("/api/trips/:id");
  });

  it("normalizes leading slash and trailing slash", () => {
    expect(safeMonitoringRoute("api/trips/")).toBe("/api/trips");
    expect(safeMonitoringRoute("")).toBe("/");
  });
});

describe("classifyErrorKind", () => {
  it("maps known message shapes to fixed-vocabulary kinds", () => {
    expect(classifyErrorKind(new Error("Missing required environment variable FOO"))).toBe("missing_env");
    expect(classifyErrorKind(new Error("Request timeout after 5000ms"))).toBe("timeout");
    expect(classifyErrorKind(new Error("fetch failed"))).toBe("network");
    expect(classifyErrorKind(new Error("Unauthorized"))).toBe("auth");
    expect(classifyErrorKind(new Error("not found"))).toBe("not_found");
    expect(classifyErrorKind(new Error("duplicate key"))).toBe("conflict");
    expect(classifyErrorKind(new Error("kaboom"))).toBe("unknown");
    expect(classifyErrorKind("string error")).toBe("unknown");
  });
});

describe("monitoring providers", () => {
  it("fake provider records sanitized events", async () => {
    const provider = createFakeMonitoringProvider();
    const result = await provider.capture({
      name: "api_error",
      severity: "error",
      surface: "api",
      properties: {
        route: "/api/trips",
        method: "POST",
        status: 500,
        errorCode: "internal_error",
        errorKind: "unknown"
      }
    });
    expect(result.ok).toBe(true);
    expect(provider.outbox).toHaveLength(1);
    expect(provider.outbox[0]?.name).toBe("api_error");
  });

  it("fake provider sanitizes properties on capture", async () => {
    const provider = createFakeMonitoringProvider();
    await provider.capture({
      name: "auth_failure",
      severity: "warn",
      surface: "auth",
      properties: {
        route: "/api/trips",
        reason: "missing_session",
        // Casted through an `as` to exercise the runtime backstop.
        ...({ authorization: "Bearer leak" } as unknown as Record<string, never>)
      }
    });
    const stored = provider.outbox[0]?.properties as Record<string, unknown>;
    expect(stored.authorization).toBeUndefined();
    expect(stored.reason).toBe("missing_session");
  });

  it("noop provider returns ok=true and never throws", async () => {
    const provider = createNoopMonitoringProvider();
    const result = await provider.capture({
      name: "worker_dead_letter",
      severity: "error",
      surface: "worker",
      properties: {
        jobKind: "send_email",
        jobId: "job-1",
        attempts: 3,
        maxAttempts: 3,
        errorKind: "transient"
      }
    });
    expect(result.ok).toBe(true);
  });

  it("resolveDefaultMonitoringProvider returns the noop provider", () => {
    expect(resolveDefaultMonitoringProvider().mode).toBe("noop");
  });

  it("tryCapture swallows provider errors (fail-open)", async () => {
    const broken = {
      mode: "fake",
      capture: async () => {
        throw new Error("provider down");
      }
    } as const;
    const result = await tryCapture(broken as unknown as ReturnType<typeof createFakeMonitoringProvider>, {
      name: "api_error",
      severity: "error",
      surface: "api",
      properties: {
        route: "/api/trips",
        method: "POST",
        status: 500,
        errorCode: "internal_error",
        errorKind: "unknown"
      }
    });
    expect(result.ok).toBe(false);
  });
});
