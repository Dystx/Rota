# packages/analytics

Typed PostHog event taxonomy and provider abstraction for Rota server
routes. SDK-free: uses `fetch` against PostHog's public direct HTTP
capture endpoint with the public project key only.

## Exports

- Typed event names and per-event property shapes (`trip_created`,
  `itinerary_viewed`, `map_day_switched`, `partner_clicked`,
  `checkout_started`, `checkout_completed`, `review_requested`,
  `review_completed`, `admin_cms_action`).
- `AnalyticsProvider` abstraction with three modes:
  - `createFakeAnalyticsProvider()` — deterministic outbox for tests.
  - `createNoopAnalyticsProvider()` — silent ok, used when env is missing.
  - `createPostHogAnalyticsProvider({ publicKey, host, fetch? })` —
    posts to `${host}/i/v0/e/`. Never throws on network errors.
- `resolveDefaultAnalyticsProvider()` — reads `NEXT_PUBLIC_POSTHOG_KEY`
  and `NEXT_PUBLIC_POSTHOG_HOST`, returns the PostHog provider when both
  are present, otherwise noop. Used as the default for server routes.
- `tryCapture(provider, event)` — best-effort wrapper that swallows all
  errors so analytics can never break a product flow.
- `sanitizeEventProperties(props)` / `isForbiddenPropertyKey(key)` —
  defense-in-depth denylist applied inside every provider.
- `safeTargetHost(url)` — returns hostname only, never the full URL.

## Privacy contract

The typed event contract is the primary defense: per-event property
shapes (`TripCreatedProperties`, `PartnerClickedProperties`, etc.) keep
arbitrary property bags out of product code. Even so, every provider runs
`sanitizeEventProperties` before transport, dropping forbidden keys
(case-insensitive) such as: `email`, `email_address`, `rawBrief`,
`raw_brief`, `notes`, `reviewer_notes`, `secret`, `token`,
`access_token`, `refresh_token`, `api_key`, `authorization`, `password`,
`user_agent`, `referer`, `referrer`, `request_body`, `body`, `ip`,
`ip_address`.

Constraints enforced by tests:

- Never send free-text fields (raw trip brief, reviewer notes,
  accommodation location).
- Never send email addresses, tokens, secrets, request bodies,
  user-agent strings, referers, or IPs.
- Never send full URLs with query strings — use `safeTargetHost` to emit
  hostname only for partner clicks.
- `distinctId` is a stable opaque identifier (auth user id, or
  `trip:<tripId>` for non-authenticated partner-click flows). Never an
  email.

## Transport

The PostHog provider posts JSON to `${host}/i/v0/e/`:

```json
{
  "api_key": "phc_<public project key>",
  "event": "<event name>",
  "distinct_id": "<stable id>",
  "properties": { "...": "sanitized" },
  "timestamp": "<optional ISO 8601>"
}
```

`fetch` failures and non-2xx responses resolve to `{ ok: false }`. The
provider never throws.

## Usage in routes

Server routes accept an optional `analytics: AnalyticsProvider` via DI
and default to `resolveDefaultAnalyticsProvider()` so tests stay
deterministic and production reads only the public env keys.

```ts
import {
  resolveDefaultAnalyticsProvider,
  tryCapture
} from "@repo/analytics";

const analytics = deps.analytics ?? resolveDefaultAnalyticsProvider();

await tryCapture(analytics, {
  name: "trip_created",
  distinctId: auth.userId,
  properties: { /* typed shape */ }
});
```

## Env

- `NEXT_PUBLIC_POSTHOG_KEY` — public project key (browser-safe).
- `NEXT_PUBLIC_POSTHOG_HOST` — e.g. `https://eu.i.posthog.com`.

When either is missing the resolver returns the noop provider; product
flows continue without analytics.
