import { describe, expect, it, vi } from "vitest";

import {
  type AnyAnalyticsEvent,
  type WebVitalsReportedProperties,
  createFakeAnalyticsProvider,
  createNoopAnalyticsProvider,
  createPostHogAnalyticsProvider,
  isForbiddenPropertyKey,
  resolveDefaultAnalyticsProvider,
  safeAnalyticsRoute,
  safeTargetHost,
  sanitizeEventProperties,
  tryCapture
} from "./index";

describe("sanitizeEventProperties", () => {
  it("strips PII / secret-like keys regardless of casing", () => {
    const sanitized = sanitizeEventProperties({
      trip_id: "trip-1",
      email: "user@example.com",
      Email_Address: "user@example.com",
      rawBrief: "long free text",
      raw_brief: "long free text",
      notes: "private reviewer notes",
      reviewer_notes: "private reviewer notes",
      secret: "shh",
      token: "abc",
      access_token: "abc",
      api_key: "abc",
      Authorization: "Bearer xyz",
      password: "p",
      user_agent: "Mozilla/5.0",
      referer: "https://x",
      referrer: "https://x",
      request_body: "{}",
      ip_address: "1.2.3.4"
    });

    expect(sanitized).toStrictEqual({ trip_id: "trip-1" });
  });

  it("drops undefined values but keeps falsy primitives", () => {
    const sanitized = sanitizeEventProperties({
      a: 0,
      b: false,
      c: "",
      d: undefined,
      e: null
    });

    expect(sanitized).toStrictEqual({ a: 0, b: false, c: "", e: null });
  });

  it("flags forbidden keys via the helper", () => {
    expect(isForbiddenPropertyKey("EMAIL")).toBe(true);
    expect(isForbiddenPropertyKey("rawBrief")).toBe(true);
    expect(isForbiddenPropertyKey("trip_id")).toBe(false);
  });
});

describe("safeTargetHost", () => {
  it("returns the hostname without query string or path", () => {
    expect(safeTargetHost("https://booking.example.com/hotel/42?utm=email")).toBe(
      "booking.example.com"
    );
  });

  it("returns empty string for invalid input", () => {
    expect(safeTargetHost("not a url")).toBe("");
    expect(safeTargetHost("")).toBe("");
  });
});

describe("safeAnalyticsRoute", () => {
  it("strips query strings and fragments", () => {
    expect(safeAnalyticsRoute("/trip/new?step=2&utm=email")).toBe("/trip/new");
    expect(safeAnalyticsRoute("/portugal#hero")).toBe("/portugal");
  });

  it("replaces uuid, numeric, and long opaque segments with :id", () => {
    expect(
      safeAnalyticsRoute(
        "/trip/4f3a9b2c-1d2e-4f5a-8b9c-0d1e2f3a4b5c/map"
      )
    ).toBe("/trip/:id/map");
    expect(safeAnalyticsRoute("/reviewer/trips/12345")).toBe(
      "/reviewer/trips/:id"
    );
    expect(
      safeAnalyticsRoute("/admin/places/01HK8N4P9Q2R3S4T5U6V7W8X9Y")
    ).toBe("/admin/places/:id");
  });

  it("preserves stable named segments", () => {
    expect(safeAnalyticsRoute("/admin/places")).toBe("/admin/places");
    expect(safeAnalyticsRoute("/reviewer/queue")).toBe("/reviewer/queue");
    expect(safeAnalyticsRoute("/how-it-works")).toBe("/how-it-works");
  });

  it("normalizes empty / malformed input to '/'", () => {
    expect(safeAnalyticsRoute("")).toBe("/");
    expect(safeAnalyticsRoute("/")).toBe("/");
    expect(safeAnalyticsRoute("portugal")).toBe("/portugal");
    expect(safeAnalyticsRoute("/trip/new/")).toBe("/trip/new");
  });
});

describe("createFakeAnalyticsProvider", () => {
  it("captures typed events into an isolated outbox", async () => {
    const provider = createFakeAnalyticsProvider();
    const event: AnyAnalyticsEvent = {
      name: "trip_created",
      distinctId: "anon-123",
      properties: {
        trip_id: "trip-1",
        country: "portugal",
        days: 5,
        traveler_type: "couple",
        transport_mode: "rental-car",
        budget_level: "mid-range",
        pace: "balanced",
        travelers_count: 2,
        interests_count: 3,
        regions_count: 2
      }
    };

    const result = await provider.capture(event);

    expect(result.ok).toBe(true);
    expect(provider.outbox).toHaveLength(1);
    expect(provider.outbox[0]?.name).toBe("trip_created");
    expect(provider.outbox[0]?.properties).toMatchObject({ trip_id: "trip-1" });
  });

  it("strips forbidden keys if a caller forwards them through the loose type bag", async () => {
    const provider = createFakeAnalyticsProvider();
    await provider.capture({
      name: "partner_clicked",
      distinctId: "anon-1",
      properties: {
        partner_id: "p1",
        trip_id: "t1",
        source: "itinerary",
        target_host: "booking.example.com",
        // @ts-expect-error — proves runtime sanitizer drops a leaked key
        rawBrief: "should never reach provider"
      }
    });

    const captured = provider.outbox[0];
    expect(captured?.properties).not.toHaveProperty("rawBrief");
    expect(captured?.properties).toHaveProperty("partner_id", "p1");
  });

  it("reset() clears the outbox", async () => {
    const provider = createFakeAnalyticsProvider();
    await provider.capture({
      name: "itinerary_viewed",
      distinctId: "anon-1",
      properties: { trip_id: "t1", source: "detail" }
    });
    expect(provider.outbox).toHaveLength(1);
    provider.reset();
    expect(provider.outbox).toHaveLength(0);
  });

  it("outbox is a snapshot, not a live reference", async () => {
    const provider = createFakeAnalyticsProvider();
    const before = provider.outbox;
    await provider.capture({
      name: "itinerary_viewed",
      distinctId: "anon-1",
      properties: { trip_id: "t1", source: "detail" }
    });
    expect(before).toHaveLength(0);
    expect(provider.outbox).toHaveLength(1);
  });
});

describe("web_vitals_reported event", () => {
  it("captures a typed web vitals event with route and device dimensions", async () => {
    const provider = createFakeAnalyticsProvider();
    const event: AnyAnalyticsEvent = {
      name: "web_vitals_reported",
      distinctId: "anon-vitals-1",
      properties: {
        metric: "LCP",
        value: 2200,
        route: "/trip/:id",
        device: "mobile",
        rating: "good",
        navigation_type: "navigate"
      }
    };

    const result = await provider.capture(event);

    expect(result.ok).toBe(true);
    expect(provider.outbox).toHaveLength(1);
    expect(provider.outbox[0]?.name).toBe("web_vitals_reported");
    expect(provider.outbox[0]?.properties).toMatchObject({
      metric: "LCP",
      value: 2200,
      route: "/trip/:id",
      device: "mobile",
      rating: "good"
    });
  });

  it("strips PII / free-text keys if a caller leaks them onto a web vitals event", async () => {
    const provider = createFakeAnalyticsProvider();

    const unsafeProperties: Record<string, unknown> = {
      metric: "INP",
      value: 180,
      route: "/trip/new",
      device: "desktop",
      email: "user@example.com",
      rawBrief: "5 days couple trip in Lisbon",
      notes: "private",
      access_token: "abc",
      request_body: "{...}",
      referer: "https://rumia.pt/trip/new?email=user@example.com"
    };

    await provider.capture({
      name: "web_vitals_reported",
      distinctId: "anon-vitals-2",
      properties: unsafeProperties as unknown as WebVitalsReportedProperties
    });

    const captured = provider.outbox[0];
    const props = captured?.properties as Record<string, unknown>;
    expect(props).toMatchObject({
      metric: "INP",
      value: 180,
      route: "/trip/new",
      device: "desktop"
    });
    expect(props).not.toHaveProperty("email");
    expect(props).not.toHaveProperty("rawBrief");
    expect(props).not.toHaveProperty("notes");
    expect(props).not.toHaveProperty("access_token");
    expect(props).not.toHaveProperty("request_body");
    expect(props).not.toHaveProperty("referer");
  });

  it("posts the sanitized web vitals payload to the PostHog endpoint", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    const provider = createPostHogAnalyticsProvider({
      host: "https://eu.i.posthog.com",
      publicKey: "phc_test",
      fetch: fetchMock as unknown as typeof fetch
    });

    const result = await provider.capture({
      name: "web_vitals_reported",
      distinctId: "anon-vitals-3",
      properties: {
        metric: "CLS",
        value: 0.05,
        route: "/portugal",
        device: "tablet",
        rating: "good"
      }
    });

    expect(result.ok).toBe(true);
    const [, init] = fetchMock.mock.calls[0]!;
    const body = JSON.parse((init?.body as string) ?? "{}") as Record<
      string,
      unknown
    >;
    expect(body).toMatchObject({
      event: "web_vitals_reported",
      distinct_id: "anon-vitals-3"
    });
    const props = body["properties"] as Record<string, unknown>;
    expect(props).toMatchObject({
      metric: "CLS",
      value: 0.05,
      route: "/portugal",
      device: "tablet",
      rating: "good"
    });
    expect(props).not.toHaveProperty("email");
    expect(props).not.toHaveProperty("rawBrief");
  });
});

describe("cinematic telemetry events", () => {
  it("captures cinematic_map_lazy_mounted", async () => {
    const provider = createFakeAnalyticsProvider();
    const result = await tryCapture(provider, {
      name: "cinematic_map_lazy_mounted",
      distinctId: "anon-cinematic-1",
      properties: {
        tripId: "trip-1",
        viewport: "desktop",
        hasCoords: true
      }
    });

    expect(result.ok).toBe(true);
    expect(provider.outbox[0]).toMatchObject({
      name: "cinematic_map_lazy_mounted",
      properties: {
        tripId: "trip-1",
        viewport: "desktop",
        hasCoords: true
      }
    });
  });

  it("captures cinematic_map_load_completed", async () => {
    const provider = createFakeAnalyticsProvider();
    const result = await tryCapture(provider, {
      name: "cinematic_map_load_completed",
      distinctId: "anon-cinematic-2",
      properties: {
        tripId: "trip-2",
        durationMs: 1234,
        tilesLoaded: 42
      }
    });

    expect(result.ok).toBe(true);
    expect(provider.outbox[0]).toMatchObject({
      name: "cinematic_map_load_completed",
      properties: {
        tripId: "trip-2",
        durationMs: 1234,
        tilesLoaded: 42
      }
    });
  });

  it("captures cinematic_chapter_activated", async () => {
    const provider = createFakeAnalyticsProvider();
    const result = await tryCapture(provider, {
      name: "cinematic_chapter_activated",
      distinctId: "anon-cinematic-3",
      properties: {
        tripId: "trip-3",
        chapterIndex: 2,
        source: "deep-link"
      }
    });

    expect(result.ok).toBe(true);
    expect(provider.outbox[0]).toMatchObject({
      name: "cinematic_chapter_activated",
      properties: {
        tripId: "trip-3",
        chapterIndex: 2,
        source: "deep-link"
      }
    });
  });

  it("captures cinematic_geocode_completed", async () => {
    const provider = createFakeAnalyticsProvider();
    const result = await tryCapture(provider, {
      name: "cinematic_geocode_completed",
      distinctId: "anon-cinematic-4",
      properties: {
        tripId: "trip-4",
        stopCount: 10,
        geocodedCount: 9,
        lowConfidenceCount: 1,
        durationMs: 777,
        error: "partial-match"
      }
    });

    expect(result.ok).toBe(true);
    expect(provider.outbox[0]).toMatchObject({
      name: "cinematic_geocode_completed",
      properties: {
        tripId: "trip-4",
        stopCount: 10,
        geocodedCount: 9,
        lowConfidenceCount: 1,
        durationMs: 777,
        error: "partial-match"
      }
    });
  });

  it("captures cinematic_kill_switch_triggered", async () => {
    const provider = createFakeAnalyticsProvider();
    const result = await tryCapture(provider, {
      name: "cinematic_kill_switch_triggered",
      distinctId: "anon-cinematic-5",
      properties: {
        reason: "monthly-loads",
        loadCount: 1001,
        threshold: 1000
      }
    });

    expect(result.ok).toBe(true);
    expect(provider.outbox[0]).toMatchObject({
      name: "cinematic_kill_switch_triggered",
      properties: {
        reason: "monthly-loads",
        loadCount: 1001,
        threshold: 1000
      }
    });
  });

  it("captures cinematic_static_image_fallback_served", async () => {
    const provider = createFakeAnalyticsProvider();
    const result = await tryCapture(provider, {
      name: "cinematic_static_image_fallback_served",
      distinctId: "anon-cinematic-6",
      properties: {
        tripId: "trip-6",
        reason: "reduced-motion"
      }
    });

    expect(result.ok).toBe(true);
    expect(provider.outbox[0]).toMatchObject({
      name: "cinematic_static_image_fallback_served",
      properties: {
        tripId: "trip-6",
        reason: "reduced-motion"
      }
    });
  });
});

describe("createNoopAnalyticsProvider", () => {
  it("returns ok without doing anything", async () => {
    const provider = createNoopAnalyticsProvider();
    const result = await provider.capture({
      name: "itinerary_viewed",
      distinctId: "anon-1",
      properties: { trip_id: "t1", source: "detail" }
    });
    expect(result.ok).toBe(true);
    expect(provider.mode).toBe("noop");
  });
});

describe("createPostHogAnalyticsProvider", () => {
  it("rejects empty config", () => {
    expect(() =>
      createPostHogAnalyticsProvider({ host: "https://eu.i.posthog.com", publicKey: "" })
    ).toThrow();
    expect(() =>
      createPostHogAnalyticsProvider({ host: "", publicKey: "phc_x" })
    ).toThrow();
  });

  it("POSTs a sanitized payload to the configured capture endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    const provider = createPostHogAnalyticsProvider({
      host: "https://eu.i.posthog.com/",
      publicKey: "phc_test",
      fetch: fetchMock as unknown as typeof fetch
    });

    const result = await provider.capture({
      name: "trip_created",
      distinctId: "anon-9",
      timestamp: "2026-05-02T00:00:00.000Z",
      properties: {
        trip_id: "trip-1",
        country: "portugal",
        days: 7,
        traveler_type: "couple",
        transport_mode: "rental-car",
        budget_level: "mid-range",
        pace: "balanced",
        travelers_count: 2,
        interests_count: 3,
        regions_count: 1
      }
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://eu.i.posthog.com/i/v0/e/");
    expect(init?.method).toBe("POST");
    const body = JSON.parse((init?.body as string) ?? "{}") as Record<string, unknown>;
    expect(body).toMatchObject({
      api_key: "phc_test",
      event: "trip_created",
      distinct_id: "anon-9",
      timestamp: "2026-05-02T00:00:00.000Z"
    });
    const props = body["properties"] as Record<string, unknown>;
    expect(props["trip_id"]).toBe("trip-1");
    expect(props).not.toHaveProperty("email");
    expect(props).not.toHaveProperty("rawBrief");
  });

  it("returns ok=false when fetch rejects, never throws", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    const provider = createPostHogAnalyticsProvider({
      host: "https://eu.i.posthog.com",
      publicKey: "phc_test",
      fetch: fetchMock as unknown as typeof fetch
    });

    const result = await provider.capture({
      name: "itinerary_viewed",
      distinctId: "anon-1",
      properties: { trip_id: "t1", source: "detail" }
    });

    expect(result.ok).toBe(false);
  });

  it("returns ok=false on non-2xx without throwing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("nope", { status: 500 }));
    const provider = createPostHogAnalyticsProvider({
      host: "https://eu.i.posthog.com",
      publicKey: "phc_test",
      fetch: fetchMock as unknown as typeof fetch
    });

    const result = await provider.capture({
      name: "itinerary_viewed",
      distinctId: "anon-1",
      properties: { trip_id: "t1", source: "detail" }
    });

    expect(result.ok).toBe(false);
  });
});

describe("tryCapture", () => {
  it("swallows provider errors so callers cannot break on analytics", async () => {
    const broken = {
      mode: "fake" as const,
      capture: vi.fn().mockRejectedValue(new Error("boom"))
    };
    const result = await tryCapture(broken, {
      name: "itinerary_viewed",
      distinctId: "anon-1",
      properties: { trip_id: "t1", source: "detail" }
    });
    expect(result.ok).toBe(false);
  });
});

describe("resolveDefaultAnalyticsProvider", () => {
  // Capture/restore the only two env keys the resolver reads. Tests never
  // depend on real env or live network.
  function withPostHogEnv(
    key: string | undefined,
    host: string | undefined,
    fn: () => void
  ): void {
    const originalKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const originalHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    try {
      if (key === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
      else process.env.NEXT_PUBLIC_POSTHOG_KEY = key;
      if (host === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
      else process.env.NEXT_PUBLIC_POSTHOG_HOST = host;
      fn();
    } finally {
      if (originalKey === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
      else process.env.NEXT_PUBLIC_POSTHOG_KEY = originalKey;
      if (originalHost === undefined)
        delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
      else process.env.NEXT_PUBLIC_POSTHOG_HOST = originalHost;
    }
  }

  it("returns the noop provider when both env vars are absent", () => {
    withPostHogEnv(undefined, undefined, () => {
      const provider = resolveDefaultAnalyticsProvider();
      expect(provider.mode).toBe("noop");
    });
  });

  it("returns the noop provider when only the key is set", () => {
    withPostHogEnv("phc_test_key", undefined, () => {
      const provider = resolveDefaultAnalyticsProvider();
      expect(provider.mode).toBe("noop");
    });
  });

  it("returns the noop provider when only the host is set", () => {
    withPostHogEnv(undefined, "https://eu.i.posthog.com", () => {
      const provider = resolveDefaultAnalyticsProvider();
      expect(provider.mode).toBe("noop");
    });
  });

  it("returns the noop provider when env values are blank/whitespace", () => {
    withPostHogEnv("   ", "   ", () => {
      const provider = resolveDefaultAnalyticsProvider();
      expect(provider.mode).toBe("noop");
    });
  });

  it("returns a posthog provider when both NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST are present", () => {
    withPostHogEnv("phc_test_key", "https://eu.i.posthog.com", () => {
      const provider = resolveDefaultAnalyticsProvider();
      expect(provider.mode).toBe("posthog");
    });
  });
});
