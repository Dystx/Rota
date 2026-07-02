/**
 * @repo/monitoring — typed error monitoring abstraction for Rota.
 *
 * Privacy contract:
 * - Public call sites use the typed event builders. Arbitrary detail
 *   bags are stripped by `redactMonitoringDetails` before the provider
 *   ever sees them. Defense-in-depth: the typed shape is the primary
 *   contract; the redactor is the runtime backstop.
 * - Free-text fields (raw trip brief, reviewer notes), email addresses,
 *   tokens, secrets, request bodies, full URLs with query strings,
 *   user-agent strings, referers, and IPs must never reach a provider.
 * - Providers are dependency-free: the `fake` provider is for tests,
 *   the `noop` provider is the production default until a real provider
 *   is wired. No external SDKs, no required server-only secrets, no
 *   network IO from the noop path.
 *
 * Fail-open contract:
 * - `tryCapture` swallows all provider errors. Monitoring failure must
 *   never break a product flow (trip create, partner click, worker run).
 */

export type MonitoringEventName =
  | "api_error"
  | "provider_error"
  | "worker_dead_letter"
  | "auth_failure";

export type MonitoringSeverity = "warn" | "error" | "fatal";

/**
 * Surface bucket for the failing call site. Low cardinality so dashboards
 * and alerts can group by surface without per-trip rows.
 */
export type MonitoringSurface =
  | "api"
  | "worker"
  | "provider"
  | "auth"
  | "webhook";

/**
 * Stable taxonomy of provider names emitted from `provider_error` events.
 * Extended only when a new provider is wired. Values are low cardinality
 * so alert thresholds can be set per provider.
 */
export type MonitoringProviderName =
  | "supabase"
  | "stripe"
  | "resend"
  | "mapbox"
  | "posthog"
  | "unknown";

export type ApiErrorProperties = {
  /** Sanitized route pattern, e.g. `/api/trips` or `/api/trips/:id`. */
  route: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "OPTIONS";
  /** HTTP status returned to the client. */
  status: number;
  /** Stable error code from the API contract, never raw provider text. */
  errorCode:
    | "validation_error"
    | "unauthenticated"
    | "forbidden"
    | "not_found"
    | "internal_error"
    | "service_unavailable";
  /**
   * Short, fixed-vocabulary classification of the underlying cause.
   * Never the raw error message; never includes the request body or
   * `Authorization` header.
   */
  errorKind: string;
};

export type ProviderErrorProperties = {
  provider: MonitoringProviderName;
  /** Provider operation name, e.g. `checkout.create`, `email.send`. */
  operation: string;
  /** Stable code emitted by the provider's typed error layer if any. */
  errorKind: string;
  /** True when the call was attempted in retry mode. */
  retried: boolean;
};

export type WorkerDeadLetterProperties = {
  /** Logical worker job kind, never a per-trip job id. */
  jobKind: string;
  /** Stable opaque job id (no PII, no raw payload). */
  jobId: string;
  /** Final attempt count before dead-letter. */
  attempts: number;
  /** Configured cap on attempts. */
  maxAttempts: number;
  /** Short fixed-vocabulary cause (e.g. `transient`, `permanent`, `timeout`). */
  errorKind: string;
};

export type AuthFailureProperties = {
  /** Sanitized route pattern. */
  route: string;
  /** Failure category, never the raw token or session id. */
  reason: "missing_session" | "expired_session" | "forbidden_role" | "invalid_signature";
};

export type MonitoringEventPropertyMap = {
  api_error: ApiErrorProperties;
  provider_error: ProviderErrorProperties;
  worker_dead_letter: WorkerDeadLetterProperties;
  auth_failure: AuthFailureProperties;
};

export type MonitoringEvent<TName extends MonitoringEventName = MonitoringEventName> = {
  [K in MonitoringEventName]: {
    name: K;
    severity: MonitoringSeverity;
    surface: MonitoringSurface;
    properties: MonitoringEventPropertyMap[K];
    /** Optional ISO 8601 timestamp; defaults to provider receive time. */
    timestamp?: string;
    /**
     * Optional release identifier (e.g. git sha or env name). Never an
     * env value, never a secret. Caller decides what to send.
     */
    release?: string;
  };
}[TName];

export type AnyMonitoringEvent = MonitoringEvent<MonitoringEventName>;

/**
 * Property keys that must never reach the monitoring provider, even if a
 * caller forwards an arbitrary object. Defense-in-depth: the typed event
 * builders already produce safe shapes; this catches accidental forwarding.
 */
const FORBIDDEN_DETAIL_KEYS: ReadonlySet<string> = new Set([
  "email",
  "email_address",
  "emailaddress",
  "rawbrief",
  "raw_brief",
  "rawBrief".toLowerCase(),
  "trip_brief",
  "tripbrief",
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
  "cookie",
  "set-cookie",
  "setcookie",
  "password",
  "user_agent",
  "useragent",
  "referer",
  "referrer",
  "request_body",
  "body",
  "payload",
  "ip",
  "ip_address",
  "service_role_key",
  "supabase_service_role_key",
  "stripe_secret_key",
  "resend_api_key"
]);

/**
 * Regex patterns that look like secrets. If a string value matches any of
 * these, the redactor replaces the entire value with `[redacted]`. These
 * are coarse, intentional false-positive-friendly catchers; the typed
 * event contract is the primary defense.
 */
const SECRET_VALUE_PATTERNS: ReadonlyArray<RegExp> = [
  /Bearer\s+\S+/iu,
  /sk_(test|live)_[A-Za-z0-9]{8,}/u,
  /sb_secret_[A-Za-z0-9_-]{8,}/u,
  /pk\.eyJ[A-Za-z0-9_.-]+/u,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/u,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/u
];

export function isForbiddenDetailKey(key: string): boolean {
  return FORBIDDEN_DETAIL_KEYS.has(key.toLowerCase());
}

export function looksLikeSecret(value: string): boolean {
  return SECRET_VALUE_PATTERNS.some((re) => re.test(value));
}

/**
 * Strip forbidden keys and obvious-secret string values from an arbitrary
 * detail bag. Used as the last gate before properties are sent to a
 * provider. Returns a shallow-cloned object; nested objects are also
 * sanitized one level deep so callers can't slip secrets through e.g.
 * `{ headers: { authorization: "Bearer ..." } }`.
 */
export function redactMonitoringDetails<T extends Record<string, unknown>>(
  details: T
): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    if (isForbiddenDetailKey(key)) continue;
    if (value === undefined) continue;
    if (typeof value === "string") {
      result[key] = looksLikeSecret(value) ? "[redacted]" : value;
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = redactMonitoringDetails(value as Record<string, unknown>);
      continue;
    }
    if (Array.isArray(value)) {
      result[key] = value.map((entry) =>
        typeof entry === "string" && looksLikeSecret(entry) ? "[redacted]" : entry
      );
      continue;
    }
    result[key] = value;
  }
  return result as Partial<T>;
}

export type MonitoringCaptureResult = {
  ok: boolean;
};

export type MonitoringProvider = {
  mode: "fake" | "noop";
  capture: (event: AnyMonitoringEvent) => Promise<MonitoringCaptureResult>;
};

export type FakeMonitoringProvider = MonitoringProvider & {
  mode: "fake";
  outbox: ReadonlyArray<AnyMonitoringEvent>;
  reset: () => void;
};

export function createFakeMonitoringProvider(): FakeMonitoringProvider {
  const records: AnyMonitoringEvent[] = [];

  return {
    mode: "fake",
    get outbox() {
      return records.slice();
    },
    reset() {
      records.length = 0;
    },
    async capture(event) {
      const sanitized = redactMonitoringDetails(
        event.properties as Record<string, unknown>
      );
      records.push({
        ...event,
        properties: sanitized as AnyMonitoringEvent["properties"]
      } as AnyMonitoringEvent);
      return { ok: true };
    }
  };
}

/**
 * Noop provider — the production default until a real monitoring provider
 * is wired. Never throws, never makes a network call, returns ok=true.
 */
export function createNoopMonitoringProvider(): MonitoringProvider {
  return {
    mode: "noop",
    async capture() {
      return { ok: true };
    }
  };
}

/**
 * Best-effort capture wrapper. Swallows errors so monitoring can never
 * break the surrounding business flow. Mirrors `tryCapture` from
 * `@repo/analytics` so the patterns stay aligned across packages.
 */
export async function tryCapture(
  provider: MonitoringProvider,
  event: AnyMonitoringEvent
): Promise<MonitoringCaptureResult> {
  try {
    return await provider.capture(event);
  } catch {
    return { ok: false };
  }
}

/**
 * Resolve the default monitoring provider for server runtimes.
 *
 * No external monitoring provider is wired today — this returns the noop
 * provider unconditionally so local dev, CI, and production all boot
 * without a monitoring SDK or secret. Tests should inject the fake
 * provider via DI. Future wiring (Sentry, Logflare, etc.) replaces this
 * function body without touching call sites.
 */
export function resolveDefaultMonitoringProvider(): MonitoringProvider {
  return createNoopMonitoringProvider();
}

/**
 * Sanitize a Next.js pathname into a low-cardinality route label safe for
 * monitoring. Strips query strings, fragments, trailing slashes, and
 * replaces dynamic segments (UUIDs, numeric ids, opaque tokens) with
 * `:id` so dashboards see `/api/trips/:id/unlock` instead of one row per
 * trip. Never returns a full URL.
 */
export function safeMonitoringRoute(pathname: string): string {
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
 * Classify an unknown error into a fixed-vocabulary error kind. Never
 * returns the raw error message — that's the whole point.
 */
export function classifyErrorKind(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    if (message.startsWith("Missing required environment variable")) return "missing_env";
    if (/timeout/iu.test(message)) return "timeout";
    if (/network|fetch failed|ECONN/iu.test(message)) return "network";
    if (/unauthorized|forbidden/iu.test(message)) return "auth";
    if (/not found|no rows/iu.test(message)) return "not_found";
    if (/conflict|duplicate|unique/iu.test(message)) return "conflict";
    return "unknown";
  }
  return "unknown";
}
