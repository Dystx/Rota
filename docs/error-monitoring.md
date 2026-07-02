# Error Monitoring & Production Logs Runbook

Status: foundation in place — provider abstraction shipped, production
provider (Sentry/PostHog/etc.) not yet wired. This document defines the
contract, alert criteria, and operational playbooks so any future provider
wiring is mechanical.

## 1. Architecture

The monitoring abstraction lives in `packages/monitoring` and follows the
exact pattern used by `@repo/analytics`, `@repo/emails`, and
`@repo/payments`:

- `MonitoringProvider` is a small interface with one method: `capture(event)`.
- `createNoopMonitoringProvider()` is the production default (no external
  service is required for boot).
- `createFakeMonitoringProvider()` is used in unit tests; events accumulate
  in `provider.outbox`.
- `tryCapture(provider, event)` is fail-open: a thrown provider error never
  affects the calling request or job.
- `resolveDefaultMonitoringProvider()` returns the noop provider today and is
  the single function to update when wiring Sentry / PostHog server-side
  capture.

### Event types

| Event name           | Surface | When it fires                                             |
| -------------------- | ------- | --------------------------------------------------------- |
| `api_error`          | api     | Caught error in a Next.js route handler                   |
| `provider_error`     | api     | Third-party provider call failed (Stripe/Supabase/Resend) |
| `worker_dead_letter` | worker  | Worker job exhausted `maxAttempts`                        |
| `auth_failure`       | api     | Auth/role check rejected the request                      |

Each event carries a small typed property bag. **No raw error messages, no
request bodies, no user emails, no auth tokens, no Supabase keys, no JWTs,
and no cookies are ever attached to events.** A defense-in-depth
`redactMonitoringDetails` helper exists for ad-hoc property bags that come
from less constrained call sites.

### Allowed property values

- Stable enums (`errorCode`, `errorKind`, `jobKind`)
- Sanitized routes via `safeMonitoringRoute(path)` (collapses UUIDs / numeric
  IDs / opaque tokens to `:id`)
- HTTP method, HTTP status (number)
- Job IDs, attempt counts (numerics, never user-controlled)

### What is forbidden

- `email`, `email_address`, `rawBrief`, `raw_brief`, `trip_brief`, `notes`,
  `reviewer_notes`
- Any auth header, cookie, token, or API key
- `request_body`, `payload`, `body`, `ip`, `ip_address`, `user_agent`,
  `referer`
- Provider-specific secret keys (`stripe_secret_key`, `resend_api_key`,
  `supabase_service_role_key`, `service_role_key`)

`isForbiddenDetailKey` and `looksLikeSecret` (regex set: Bearer, `sk_*`,
`sb_secret_*`, JWT, PEM, email patterns) provide the runtime backstop.

## 2. Wiring a real provider

To switch from noop to a real provider, replace the body of
`resolveDefaultMonitoringProvider()` in `packages/monitoring/src/index.ts`.
The provider must:

1. Receive only the typed `MonitoringEvent` shape.
2. Never throw out of `capture()` (we already wrap with `tryCapture` but
   defense-in-depth still requires this).
3. Be configurable via server-only env (no `NEXT_PUBLIC_*` for write keys).

Recommended providers, in order of fit:

- **Sentry** (server SDK, errors-only, sampling for non-error breadcrumbs).
- **PostHog** server-side capture (already used for analytics; reuse the
  same project with a separate `monitoring` event prefix if desired).

## 3. Alert criteria

The following alerts should be configured in whichever provider is wired.
Until then, they live here as the contract.

### Critical (page within 5 minutes)

- `api_error` count > 5 per minute on `/api/trips` POST
  → Trip creation is the launch-critical path; sustained 5xx blocks all
    traveler conversions.
- `api_error` with `errorCode = "service_unavailable"` and
  `errorKind = "missing_env"` on any route
  → A required server secret was not loaded; the deploy is broken.
- `worker_dead_letter` for `jobKind = "review_completed_email"`
  → A traveler completed review but never received notification; manual
    follow-up required.
- `provider_error` with `provider = "stripe"` count > 3 per minute
  → Payment funnel impacted.

### Warning (notify within 30 minutes)

- `api_error` count > 20 per minute across all routes
- `auth_failure` count > 50 per minute (potential brute-force / scraping)
- `worker_dead_letter` for any `jobKind` (non-email)
- `provider_error` with `provider = "supabase"` count > 10 per minute

### Informational (daily digest)

- Top 10 `errorKind` distribution per surface
- `safeMonitoringRoute` cardinality check (should stay < 100 unique routes)

## 4. Triage playbook

When an alert fires:

1. **Identify scope**: filter the dashboard by `surface`, then by `route`
   or `jobKind`.
2. **Identify error class**: read `errorKind` and `errorCode`. These are
   the only enum-like fields and are safe to share in incident chat.
3. **Reproduce locally**: events do NOT carry the raw error or the request
   body. To reproduce, correlate by timestamp + route + status with the
   server logs (Vercel function logs, Supabase logs, worker run logs).
4. **Server logs are the deep-dive surface**, not the monitoring dashboard.
   Server logs may legitimately contain more detail (handled by the
   platform's own redaction) but must never be screenshotted or pasted into
   external tools without redaction.
5. **Worker dead-letters**: inspect the corresponding entry in
   `LocalWorkerState.attempts` for the raw `error` string. Never paste this
   into a public channel or a third-party tool without redacting tokens and
   emails.

## 5. Privacy guarantees

- The monitoring channel is structurally incapable of carrying:
  trip free text, reviewer notes, traveler emails, auth tokens, cookies,
  request bodies, or provider secret keys.
- Even if a future contributor accidentally adds a forbidden key to a
  property bag, `redactMonitoringDetails` strips it at runtime.
- Tests in `packages/monitoring/src/index.test.ts` assert all forbidden keys
  and value patterns are stripped. CI must keep these tests green.

## 6. Verification commands

```bash
pnpm --dir packages/monitoring test
pnpm --dir apps/workers test
pnpm --dir apps/web exec vitest run --config ../../vitest.config.ts \
  apps/web/app/api/trips/route.test.ts
pnpm --dir apps/web typecheck
```

## 7. Out of scope for the foundation task

- Wiring an actual SaaS provider (Sentry/PostHog server) — left to a
  follow-up task that owns the env variable rollout and the dashboard
  configuration.
- Configuring real alert delivery (PagerDuty, Slack) — depends on the
  provider choice above.
- Frontend client-side error capture — server-side only is sufficient for
  the launch-critical surfaces (trip create, checkout webhook, worker).
