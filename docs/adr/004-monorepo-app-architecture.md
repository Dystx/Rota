# ADR-002 — Single-app vs two-app architecture (Specialist dashboard)

> **Status:** Accepted (2026-07-03, confirmed in the 2026-07-03 decision log)
> **Deciders:** Engineering (consensus from the post-Phase-7 review-fix session)
> **Related:** `docs/roadmap.md` §3.5 (decision 1), `docs/engineering-lifecycle.md` §4

## Context

The 8-phase engineering lifecycle defines two apps:

```
apps/web/    # Next.js 16 — traveler-facing
apps/ops/    # Next.js 16 — specialist dashboard (Level 2/3)
```

Specialist work in the current tree lives as route groups
under `apps/web/app/` — `(admin)`, `(reviewer)`, `console/`,
`expert-chat/`. The question is whether to:

1. **Stay single-app** with route groups (current state).
2. **Split** into `apps/web/` (travelers) + `apps/ops/`
   (specialists), with separate build pipelines.

The choice has cost on three axes: bundle size, deployment
independence, and shared-type churn.

## Options

### A. Stay single-app with route groups (current)

```
apps/web/
  app/
    (app)/trip/*        # traveler
    (admin)/admin/*     # admin
    (reviewer)/reviewer/* # reviewer
    console/            # ops console
    expert-chat/        # traveler-facing chat
    layout.tsx          # shared root
```

**Pros**
- One bundle of shared deps (`@repo/ui`, `zustand`,
  `maplibre-gl`, `@repo/auth`). No duplication.
- One middleware chain (auth, RLS, rate limits).
- One deploy pipeline; one set of env vars.
- Cross-cutting changes (a new RLS policy, a telemetry
  event) land in one place.
- Dev velocity: one `next dev`, one HMR.
- Easy cross-app navigation (no subdomain boundary).
- Shared type packages (`@repo/types`, `@repo/ai`) are
  consumed by the same compile unit; no version drift.

**Cons**
- All consumers get the full code graph at build time
  (Next tree-shakes; bundle bloat is the risk).
- Specialists see traveler code in the same bundle (and
  vice versa) — privacy + attack-surface concern.
- Deploys are all-or-nothing; a bad specialist change
  ships to travelers.
- Auth boundary is route-level not app-level — easier
  to forget a guard.
- Vercel route groups don't get separate scale limits;
  specialist and traveler traffic share the same
  function pool.
- Bundle size: traveler's first-paint includes specialist
  kanban code unless code-split aggressively.

### B. Split into two apps

```
apps/web/         # traveler-facing Next.js 16
apps/ops/         # specialist dashboard Next.js 16
```

**Pros**
- Clean separation; smaller bundles per app.
- Independent deploys (specialist team ships without
  blocking travelers).
- Different auth flows possible (specialists may need
  SSO/SAML; travelers stay on Supabase email magic
  link).
- Different rate limit + observability stacks per app.
- Smaller attack surface per app.
- Clear ownership: one team per repo/app.
- Scale independence: specialist dashboard can be on a
  cheaper runtime.

**Cons**
- Type sharing requires every shared type in `@repo/types`
  — no inline types crossing the boundary.
- Bundle duplication: both apps include shared deps.
- Cross-app navigation is a full page load (or careful
  subdomain + shared-session cookie).
- More CI/CD: two pipelines, two env configs, two
  deploys, two uptime monitors.
- Auth boundary is app-level; shared sessions need
  careful design (Supabase handles this, but not free).
- More ops overhead per change.

## Decision

**Adopt A (stay single-app with route groups) for the next
two quarters.** Specialist MAU is <5% of total. Shared
types are still in flux. Vercel per-route middleware
covers 80% of the bundle-separation benefit at 20% of
the operational cost. The two-app pattern is a real
architectural improvement when the trigger conditions
are met, but committing to it now is premature.

## Re-evaluation triggers

Switch to B (split) when **any** of these become true:

1. **Specialist SSO.** A SAML / OIDC requirement lands.
   Two-app lets the specialist app own its auth flow
   without affecting travelers.
2. **Stripe Connect.** Per-org Stripe Connect accounts
   with separate webhooks. A `Stripe-Signature` per
   app is cleaner than a single webhook with manual
   routing.
3. **B2B white-label.** A partner needs a branded
   specialist dashboard. The `apps/ops` app becomes
   the template that gets cloned per partner.
4. **Bundle size is a real perf problem.** Currently
   acceptable. Vercel bundle analysis would surface
   this before it becomes user-visible.
5. **Specialist MAU >20%.** The build-time cost of
   shipping specialist code to travelers becomes
   material.

## Consequences

### Positive
- Lower operational overhead for the next 6 months.
- Specialist code can ship quickly without blocking
  traveler deploys via Vercel's per-route feature flags.
- Type sharing across specialist + traveler stays
  frictionless.

### Negative
- Bundle size for `apps/web` is the union of traveler +
  specialist code. If specialists add a heavy lib
  (e.g. a PDF viewer), it lands in the traveler bundle
  unless code-split carefully.
- Specialist and traveler share the same auth boundary
  definition. A bug in the shared auth code affects
  both.
- If B-1 or B-3 fires within 6 months, we do a
  non-trivial split. Defer that cost; the re-evaluation
  triggers are concrete enough to make the call.

## Implementation

- Existing route groups under `apps/web/app/` stay.
- The specialist console at `apps/web/app/console`
  remains the entry point. A future PR (PR-10 in the
  master plan) adds a side-by-side raw-AI vs editable
  view at `apps/web/app/console/workspace` for the
  15-min Level 2 audit.
- Specialist and traveler are differentiated by auth
  claims (`user_profiles.role IN ('specialist', 'admin')`)
  plus middleware-level route protection. A future PR
  promotes this to a stricter per-route auth boundary.

## References

- `docs/roadmap.md` §3.5 — 2026-07-03 decision log
- `docs/engineering-lifecycle.md` §4 — Two-app + mobile
  are both deferred
- `docs/reviews/2026-07-03-llm-review.md` — the LOW
  catalog; LOW-9 documents the per-route auth
  contract
