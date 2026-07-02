# Rumia — Refined 2026 Scope

**Status**: Additive to [`docs/spec.md`](./spec.md) (v2.0 Tiered Service Model — the long-term product vision).
**Effective**: 2026-07-02 onward.
**Scope decision**: Tiers 1 + 2 are the immediate focus; Tier 3 (in-person guide marketplace) and Mobile are deferred to the future backlog.
**Visual identity**: Olive + Ochre + Cream + Sage palette from the prototype (see §6).

---

## 1. Scope Decision

By adapting to an **AI + Remote Human Specialist** model (Tiers 1 and 2) and deferring the in-person marketplace (Tier 3), the immediate focus shifts entirely to digital product execution. Engineering and capital stay inside a single monorepo stack; no physical-liability, insurance, or guide-dispatch ops work in the critical path.

The original v2.0 spec ([`docs/spec.md`](./spec.md)) remains valid as the long-term product vision — Tier 3 is *deferred*, not *removed*. Reactivation triggers are listed in §5 below.

---

## 2. Advanced Design Paradigm — Awwwards-Grade "Intentional Humanism"

To stand out on platforms like Awwwards, Rumia cannot look like a standard corporate SaaS template. The product needs an editorial, motion-heavy layout that feels like premium boutique design software rather than an automated utility tool.

### 2.1 Asymmetric Fluid Layouts (Modern Bento Grid)

Ditch rigid, boxy columns. Modern high-end products use asymmetrical grids where content blocks morph seamlessly based on focus. When a user clicks a day on the itinerary, that module smoothly expands using **container queries**, while adjacent days gracefully contract.

### 2.2 Kinetic Typography & Contextual Transitions

- **Technique**: Variable fonts where text weight, width, and optical size shift dynamically as the user scrolls or drags timeline sliders.
- **Application**: As the user toggles from a "Packed" pace to a "Relaxed" pace, the timestamp numbers on the travel cards smoothly scale and transition, visually conveying the breathing room added to the schedule.

### 2.3 Micro-Interactions & Magnetic UI Handles

Small feedback loops build massive trust. Instead of standard form clicks, use magnetic cursor hitboxes for interaction handles (e.g., when a user moves their mouse near the "Swap for hidden gems" button, the text slightly glides toward the cursor, creating a satisfying, tactile feel).

### 2.4 Performance-First Motion Profiles

Complex animations can destroy Core Web Vitals. The product must keep **Largest Contentful Paint (LCP) under 2.5 seconds** by running complex pathing and layout morphing directly on the GPU via CSS transform matrices, leaving the main JavaScript thread completely free for data fetching.

### 2.5 Design Tokens (carry-over from `packages/ui/src/styles.css`)

```
--color-paper, --color-cream, --color-ink, --color-ink-soft
--color-atlantic, --color-aqua
--spacing-section (120px), --spacing-gutter (max(5vw, 2rem))
--motion-duration-fast (200ms), --motion-duration-base (400ms), --motion-duration-slow (800ms)
--motion-easing-cinematic: cubic-bezier(0.2, 0, 0, 1)
```

All motion durations overridden to `0ms` in `@media (prefers-reduced-motion: reduce)` — non-negotiable per Cinematic Concierge anti-patterns.

---

## 3. Refined 2026 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Next.js 16** with **React Server Components (RSCs)** | Data-heavy elements (country profile defaults) fetched on server, streaming minimal JS to keep the interface fast |
| State coordination | **Zustand** | Coordinates live coordinate updates between timeline cards and Mapbox view window without unnecessary re-renders |
| AI control layer | **Vercel AI SDK** | Simplifies structured streaming array responses, works seamlessly with Zod validation to feed clean data chunks into timeline views |
| Styling | **Tailwind v4** | Design tokens + utility classes; matches the existing `packages/ui` token system |
| Database | **Supabase (PostgreSQL + PostGIS + pgvector)** | Spatial + semantic + relational in one store |
| Runtime | **Bun** | Fast package install + script execution; compatible with the existing pnpm/Turbo monorepo via Bun as a runtime alternative for hot paths |
| Queue / Cache | **Upstash (Redis Cache + QStash Queue)** | Replaces `apps/workers` bounded-local runner with a hosted cron/queue (decision in §5) |

### Stack delta from `docs/spec.md` v2.0

| | v2.0 | Refined 2026 |
|---|---|---|
| AI control layer | OpenAI API + manual Zod | **Vercel AI SDK** + Zod (structured streaming) |
| State mgmt | unspecified | **Zustand** (transient map/UI state) |
| Runtime | Node.js | **Bun** (optional runtime for hot paths) |
| Styling | Tailwind CSS (no version pin) | **Tailwind v4** (matches current `@repo/ui` package) |
| Queue | Inngest vs Upstash QStash | **Upstash QStash** (decision made) + Upstash Redis for cache |
| Frontend rendering | SSR + RSC (implied) | **Explicit RSC streaming** for data-heavy surfaces |

---

## 4. Re-Scoped Engineering Roadmap (5 active phases + 2 deferred)

### Phase 1 — Foundations & Architecture Setup

- Centralized monorepo workspace (already done: pnpm + Turbo, 12 packages, 3 apps)
- PostgreSQL relational boundaries + PostGIS extensions + pgvector indexing configurations
- Tailwind v4 design tokens matching the visual reference guidelines

### Phase 2 — Knowledge Graph Seeding (The Portugal Module)

- Seed region data layers for **Lisbon, Sintra, Porto, and the Algarve**
- Generate text descriptions for destinations and process them into `pgvector` as semantic embeddings
- Integrate Mapbox layers, applying custom-designed minimalist skin geometries to match the platform's palette

### Phase 3 — The Invisible AI Engine (Tier 1 Activation)

- Construct the structured **Trip Brief parser** using Vercel AI SDK
- Build the structural **Smart Question Cards** configuration pipeline
- Deploy geometric optimization routines to correctly cross-examine travel coordinates against real-world opening hours and realistic transit buffers

### Phase 4 — Workspace & Checkout Infrastructure

- Build out the **asymmetric timeline canvas** alongside inline custom interactive controls (`Reduce driving`, `Make it more relaxed`)
- Wire up **Stripe** payment flows for premium itinerary purchases and specialist tier access
- Implement background export pipelines to convert JSON models into layout-vetted print PDFs and standard calendar invitations

### Phase 5 — The Specialist Collaboration Hub (Tier 2 Activation)

- Deliver the custom **Reviewer Dashboard Interface** with simple timeline layout editing tools and an error-checking alert panel
- Implement a real-time, **asynchronous** chat infrastructure using Supabase's native PostgreSQL replication engines
- Construct an AI-backed triage system to screen and answer basic traveler questions automatically before routing messages to the human specialist

### Future Ecosystem Backlog (DEFERRED — not in active roadmap)

- **Phase 6 — Mobile Compilation**: Expo + React Native companion mirroring the desktop core with offline geolocation synchronization
- **Phase 7 — Tier 3 Marketplace**: Physical guide contractor matching engine, regulatory alignment, and dispatching modules

---

## 5. Reactivation Triggers for Deferred Phases

Tier 3 (Phase 7) reactivation requires all of the following:
- Tier 1 + Tier 2 monetization exceeds break-even threshold (PM to define metric)
- RNAAT legal review commissioned and complete (per spec v2.0 §7 blocker)
- Portugal-side operational partner identified for guide vetting + insurance

Mobile (Phase 6) reactivation requires:
- Tier 1 + Tier 2 retention metrics indicate repeat-trip behavior (currently single-trip planning is the dominant pattern)
- iOS + Android app store deployment budget allocated
- React Native team capacity available

---

## 6. Operational Implications

- **Tier 1 + Tier 2 are now the entire product surface.** No Tier 3 marketplace code work; no `guide_profiles`/`guide_bookings` tables until reactivation.
- **`apps/workers` becomes Tier 1 export-only** (PDF/Calendar pipeline) instead of a Tier 3 dispatch runner.
- **Upstash QStash is the queue decision** (resolves Phase 3 open question in `docs/roadmap.md` §6). Decision documented; no ADR needed.
- **Tech stack migrations**: Tailwind v3 → v4 audit, Bun runtime validation against the existing pnpm/Turbo pipeline, Zustand introduction for transient state.
- **Design quality bar**: Awwwards-grade parity with the "Intentional Humanism" pattern in §2. Existing `packages/ui` primitives + new asymmetric/kinetic/magnetic surfaces.

---

## 7. Cross-References

- [`docs/spec.md`](./spec.md) — v2.0 long-term product vision (3 tiers, 8 phases, 12-table schema)
- [`docs/roadmap.md`](./roadmap.md) — operational roadmap (Phase 0–8), aligned with this refined scope
- [`docs/prototype.html`](./prototype.html) — single-file React SPA prototype (the source for the new visual identity + route map)
- [`docs/prototype-routes.md`](./prototype-routes.md) — prototype routes mapped to current Next.js routes + migration plan
- [`docs/design-tokens-olive-ochre.css`](./design-tokens-olive-ochre.css) — proposed replacement for `packages/ui/src/styles.css` (REFERENCE; not yet applied)
- [`docs/audit/phase-0-cinematic-redesign.md`](./audit/phase-0-cinematic-redesign.md) — Phase 0 audit evidence (Cinematic Concierge tokens)
- `packages/ui/src/styles.css` — active design token source of truth (Cinematic Concierge palette — pending replacement)

---

## 6. Visual Identity: Olive + Ochre + Cream + Sage

The visual identity is anchored by the prototype at [`docs/prototype.html`](./prototype.html). Distinct from the earlier Cinematic Concierge tokens (paper / cream / ink / atlantic / aqua), the prototype uses an editorial Iberian palette:

### 6.1 Primary palette

```
--color-primary:           #16281f   deep green-black
--color-primary-container: #2b3e34   forest
--color-olive-light:       #3c5447   mid olive
--color-olive-dark:        #1d2a23   deep olive
--color-ochre-light:       #eab875   warm tan (brand accent)
--color-ochre-dark:        #ce933f   burnt ochre (brand accent deep)
--color-linen-dark:        #efece6   cream linen (foreground on dark)
--color-background:        #e8fff0   pale sage
```

### 6.2 Typography

```
display:        Playfair Display (serif) — headlines, hero
headline:       Playfair Display (serif) — section headings
body:           Inter (sans-serif) — body, UI labels
mono:           JetBrains Mono (monospace) — technical micro-labels (mono-micro 10px)
```

Type scale (carried over from prototype): `display 72px`, `display-mobile 48px`, `headline-lg 30px`, `headline-sm 18px`, `body-md 14px`, `label-ui 12px`, `mono-micro 10px`.

### 6.3 Glass surfaces (defining characteristic)

The prototype's hero pattern is a `h-[819px]` cinematic background with a glass-morphism CTA card overlay:

```
.glass-panel {
  background: rgba(255, 255, 255, 0.65);    /* glass-light */
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
.glass-panel-dark {
  background: rgba(43, 62, 52, 0.85);       /* glass-dark */
  backdrop-filter: blur(24px);
}
```

### 6.4 Motion (carry-over)

The Cinematic Concierge motion system is retained:

```
--motion-duration-fast:   200ms
--motion-duration-base:   400ms
--motion-duration-slow:   800ms
--motion-easing-cinematic: cubic-bezier(0.2, 0, 0, 1)
@media (prefers-reduced-motion: reduce) { /* all durations -> 0ms */ }
```

### 6.5 Migration status

- **Reference doc**: [`docs/design-tokens-olive-ochre.css`](./design-tokens-olive-ochre.css) — full v4 `@theme` block, ready to swap into `packages/ui/src/styles.css`.
- **Active stylesheet**: `packages/ui/src/styles.css` still holds Cinematic Concierge tokens (paper/cream/ink/atlantic/aqua) — pending replacement.
- **Open question**: which palette wins? Cinematic Concierge (current 5-commit wave) vs Olive + Ochre (prototype). See `docs/roadmap.md` §7 Open Questions.