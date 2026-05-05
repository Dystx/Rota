/**
 * @repo/analytics — typed PostHog event taxonomy and provider abstraction.
 *
 * Privacy contract:
 * - Public call sites must use the typed event builders. Arbitrary property
 *   bags are not exposed to product code.
 * - Free-text fields (raw trip brief, reviewer notes), email addresses,
 *   tokens, secrets, full URLs with query strings, request bodies,
 *   user-agent strings, and HTTP referers must never appear in event
 *   properties. `sanitizeEventProperties` strips known-forbidden keys as a
 *   defense-in-depth check before the provider sees them.
 * - Providers are dependency-free: the `fake` provider is for tests/local,
 *   the `posthog` provider uses `fetch` against PostHog's public direct
 *   HTTP capture endpoint (`POST {host}/i/v0/e/`) with the public project
 *   key only. No `posthog-js` SDK and no server-only secrets.
 */

export type AnalyticsEventName =
  | "trip_created"
  | "itinerary_viewed"
  | "map_day_switched"
  | "partner_clicked"
  | "checkout_started"
  | "checkout_completed"
  | "review_requested"
  | "review_completed"
  | "admin_cms_action"
  | "web_vitals_reported"
  | "cinematic_map_lazy_mounted"
  | "cinematic_map_load_completed"
  | "cinematic_chapter_activated"
  | "cinematic_geocode_completed"
  | "cinematic_kill_switch_triggered"
  | "cinematic_static_image_fallback_served";

/**
 * Core Web Vitals metric names supported by the field reporter.
 * Restricted to the standard browser-reported set so cardinality stays
 * bounded for analytics dashboards.
 */
export type WebVitalsMetricName = "LCP" | "INP" | "CLS" | "TTFB" | "FCP";

/** Low-cardinality device bucket used as a Web Vitals dimension. */
export type WebVitalsDeviceCategory = "mobile" | "tablet" | "desktop";

/** Standard Web Vitals rating for the metric value. */
export type WebVitalsRating = "good" | "needs-improvement" | "poor";

export type TripCreatedProperties = {
  trip_id: string;
  trip_brief_id?: string;
  country: string;
  days: number;
  traveler_type: string;
  transport_mode: string;
  budget_level: string;
  pace: string;
  travelers_count: number;
  interests_count: number;
  regions_count: number;
};

export type ItineraryViewedProperties = {
  trip_id: string;
  source: "detail" | "map" | "export";
};

export type MapDaySwitchedProperties = {
  trip_id: string;
  from_day: number;
  to_day: number;
};

export type PartnerClickedProperties = {
  partner_id: string;
  trip_id: string;
  source: string;
  /** Hostname only — never the full URL with query string. */
  target_host: string;
};

export type CheckoutStartedProperties = {
  trip_id: string;
  purchase_kind: "unlock" | "human_review";
  tier: "free-preview" | "paid-trip" | "human-polish";
};

export type CheckoutCompletedProperties = {
  trip_id: string;
  purchase_kind: "unlock" | "human_review";
  amount_cents: number;
  currency: string;
};

export type ReviewRequestedProperties = {
  trip_id: string;
  reviewer_assigned: boolean;
};

export type ReviewCompletedProperties = {
  trip_id: string;
  has_notes: boolean;
};

export type AdminCmsActionProperties = {
  entity: "place" | "country" | "region" | "partner" | "reviewer";
  action: "create" | "update" | "delete" | "publish" | "archive";
  entity_id: string;
};

export type WebVitalsReportedProperties = {
  metric: WebVitalsMetricName;
  /** Numeric metric value as reported by the browser (ms for LCP/INP/TTFB/FCP, unitless for CLS). */
  value: number;
  /** Sanitized route pattern, never a full URL or query string. */
  route: string;
  device: WebVitalsDeviceCategory;
  rating?: WebVitalsRating;
  navigation_type?: "navigate" | "reload" | "back-forward" | "back-forward-cache" | "prerender" | "restore";
};

export type CinematicMapLazyMountedProperties = {
  tripId: string;
  viewport: "mobile" | "tablet" | "desktop";
  hasCoords: boolean;
};

export type CinematicMapLoadCompletedProperties = {
  tripId: string;
  durationMs: number;
  tilesLoaded: number;
};

export type CinematicChapterActivatedProperties = {
  tripId: string;
  chapterIndex: number;
  source: "scroll" | "click" | "keyboard" | "deep-link";
};

export type CinematicGeocodeCompletedProperties = {
  tripId: string;
  stopCount: number;
  geocodedCount: number;
  lowConfidenceCount: number;
  durationMs: number;
  error?: string;
};

export type CinematicKillSwitchTriggeredProperties = {
  reason: "monthly-loads" | "manual";
  loadCount: number;
  threshold: number;
};

export type CinematicStaticImageFallbackServedProperties = {
  tripId: string;
  reason: "kill-switch" | "no-token" | "reduced-motion" | "no-coords";
};

export type AnalyticsEventPropertyMap = {
  trip_created: TripCreatedProperties;
  itinerary_viewed: ItineraryViewedProperties;
  map_day_switched: MapDaySwitchedProperties;
  partner_clicked: PartnerClickedProperties;
  checkout_started: CheckoutStartedProperties;
  checkout_completed: CheckoutCompletedProperties;
  review_requested: ReviewRequestedProperties;
  review_completed: ReviewCompletedProperties;
  admin_cms_action: AdminCmsActionProperties;
  web_vitals_reported: WebVitalsReportedProperties;
  cinematic_map_lazy_mounted: CinematicMapLazyMountedProperties;
  cinematic_map_load_completed: CinematicMapLoadCompletedProperties;
  cinematic_chapter_activated: CinematicChapterActivatedProperties;
  cinematic_geocode_completed: CinematicGeocodeCompletedProperties;
  cinematic_kill_switch_triggered: CinematicKillSwitchTriggeredProperties;
  cinematic_static_image_fallback_served: CinematicStaticImageFallbackServedProperties;
};

export type AnalyticsEvent<TName extends AnalyticsEventName = AnalyticsEventName> = {
  [K in AnalyticsEventName]: {
    name: K;
    properties: AnalyticsEventPropertyMap[K];
    /** Stable hashed/anonymous identifier for the actor. Never an email. */
    distinctId: string;
    timestamp?: string;
  };
}[TName];

export type AnyAnalyticsEvent = AnalyticsEvent<AnalyticsEventName>;

/**
 * Property keys that must never reach the analytics provider, even if a
 * caller tries to forward an arbitrary object. Defense-in-depth: the
 * primary contract is the typed builder, this is a runtime backstop.
 */
const FORBIDDEN_PROPERTY_KEYS: ReadonlySet<string> = new Set([
  "email",
  "email_address",
  "emailaddress",
  "rawbrief",
  "raw_brief",
  "rawBrief".toLowerCase(),
  "notes",
  "reviewer_notes",
  "reviewernotes",
  "secret",
  "token",
  "access_token",
  "refresh_token",
  "api_key",
  "apikey",
  "authorization",
  "password",
  "user_agent",
  "useragent",
  "referer",
  "referrer",
  "request_body",
  "body",
  "ip",
  "ip_address"
]);

export function isForbiddenPropertyKey(key: string): boolean {
  return FORBIDDEN_PROPERTY_KEYS.has(key.toLowerCase());
}

/**
 * Strip forbidden keys from an arbitrary object. Used as the last gate
 * before properties are sent to a provider. The typed event builders
 * already produce safe shapes; this catches accidental forwarding.
 */
export function sanitizeEventProperties<T extends Record<string, unknown>>(
  properties: T
): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (isForbiddenPropertyKey(key)) continue;
    if (value === undefined) continue;
    result[key] = value;
  }
  return result as Partial<T>;
}

export type AnalyticsCaptureResult = {
  ok: boolean;
};

export type AnalyticsProvider = {
  mode: "fake" | "posthog" | "noop";
  capture: (event: AnyAnalyticsEvent) => Promise<AnalyticsCaptureResult>;
};

export type FakeAnalyticsProvider = AnalyticsProvider & {
  mode: "fake";
  outbox: ReadonlyArray<AnyAnalyticsEvent>;
  reset: () => void;
};

export function createFakeAnalyticsProvider(): FakeAnalyticsProvider {
  const records: AnyAnalyticsEvent[] = [];

  return {
    mode: "fake",
    get outbox() {
      return records.slice();
    },
    reset() {
      records.length = 0;
    },
    async capture(event) {
      // Sanitize as defense-in-depth, mirroring the real provider path.
      const sanitized = sanitizeEventProperties(
        event.properties as Record<string, unknown>
      );
      records.push({
        ...event,
        properties: sanitized as AnyAnalyticsEvent["properties"]
      } as AnyAnalyticsEvent);
      return { ok: true };
    }
  };
}

/**
 * Noop provider for production paths where analytics is intentionally
 * disabled (missing public key, build-time render). Never throws.
 */
export function createNoopAnalyticsProvider(): AnalyticsProvider {
  return {
    mode: "noop",
    async capture() {
      return { ok: true };
    }
  };
}

export type PostHogAnalyticsProviderOptions = {
  /** Browser-safe public PostHog project key (NEXT_PUBLIC_POSTHOG_KEY). */
  publicKey: string;
  /** PostHog host, e.g. https://eu.i.posthog.com. */
  host: string;
  fetch?: typeof fetch;
};

type PostHogCapturePayload = {
  api_key: string;
  event: string;
  distinct_id: string;
  properties: Record<string, unknown>;
  timestamp?: string;
};

export function createPostHogAnalyticsProvider(
  options: PostHogAnalyticsProviderOptions
): AnalyticsProvider {
  if (!options.publicKey || options.publicKey.trim().length === 0) {
    throw new Error("PostHog public key is required to create the analytics provider.");
  }
  if (!options.host || options.host.trim().length === 0) {
    throw new Error("PostHog host is required to create the analytics provider.");
  }

  const fetchImpl = options.fetch ?? fetch;
  const endpoint = `${options.host.replace(/\/+$/u, "")}/i/v0/e/`;

  return {
    mode: "posthog",
    async capture(event) {
      const sanitized = sanitizeEventProperties(
        event.properties as Record<string, unknown>
      );
      const payload: PostHogCapturePayload = {
        api_key: options.publicKey,
        event: event.name,
        distinct_id: event.distinctId,
        properties: sanitized,
        ...(event.timestamp ? { timestamp: event.timestamp } : {})
      };

      try {
        const response = await fetchImpl(endpoint, {
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        });
        return { ok: response.ok };
      } catch {
        // Analytics failure must never break product flows.
        return { ok: false };
      }
    }
  };
}

/**
 * Sanitize a Next.js pathname into a low-cardinality route label safe for
 * analytics. Strips query strings, fragments, trailing slashes, and
 * replaces dynamic segments (UUIDs, numeric ids, opaque tokens) with
 * `:id` so dashboards see `/trip/:id/map` instead of one row per trip.
 * Never returns a full URL.
 */
export function safeAnalyticsRoute(pathname: string): string {
  if (typeof pathname !== "string" || pathname.length === 0) return "/";
  let path = pathname;
  const queryIndex = path.search(/[?#]/u);
  if (queryIndex !== -1) path = path.slice(0, queryIndex);
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
  const segments = path.split("/").map((seg) => {
    if (seg.length === 0) return seg;
    if (uuidRe.test(seg)) return ":id";
    if (/^\d+$/u.test(seg)) return ":id";
    if (seg.length >= 16 && /^[A-Za-z0-9_-]+$/u.test(seg)) return ":id";
    return seg;
  });
  const result = segments.join("/");
  return result.length === 0 ? "/" : result;
}

/**
 * Extract the host portion of a URL for safe analytics. Returns an empty
 * string for invalid URLs so the caller never panics. Never returns the
 * full URL or any query parameters.
 */
export function safeTargetHost(target: string): string {
  try {
    return new URL(target).host;
  } catch {
    return "";
  }
}

/**
 * Best-effort capture wrapper. Swallows errors so analytics can never
 * break the surrounding business flow (trip create, partner click, etc.).
 */
export async function tryCapture(
  provider: AnalyticsProvider,
  event: AnyAnalyticsEvent
): Promise<AnalyticsCaptureResult> {
  try {
    return await provider.capture(event);
  } catch {
    return { ok: false };
  }
}

declare const process: {
  env: Record<string, string | undefined>;
};

/**
 * Resolve the default analytics provider for server runtimes.
 *
 * Reads only browser-safe `NEXT_PUBLIC_POSTHOG_*` env values. Returns a
 * PostHog HTTP provider when both are present, otherwise a noop. Never
 * throws — analytics must never break product flows or builds.
 *
 * Tests should inject `analytics` via DI and not depend on real env.
 */
export function resolveDefaultAnalyticsProvider(): AnalyticsProvider {
  try {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
    if (!key || !host) {
      return createNoopAnalyticsProvider();
    }
    return createPostHogAnalyticsProvider({ host, publicKey: key });
  } catch {
    return createNoopAnalyticsProvider();
  }
}
