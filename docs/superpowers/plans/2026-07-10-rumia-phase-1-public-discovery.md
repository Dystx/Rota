# Rumia Phase 1 Public Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a coherent Portugal-first public product that explains Rumia, starts a three-phrase brief, proves local review truthfully, and gives every public/utility route a complete visual and informational purpose.

**Architecture:** Public pages consume one validated Portugal content repository, one owned-asset manifest, one pricing catalogue, and one `PublicTravelerShell`. Cinematic imagery and map motion progressively enhance server-rendered content; static routes, phrase choices, trust evidence, and primary actions remain complete without JavaScript, map tiles, or optional providers.

**Tech Stack:** Next.js 16 server/client components, React 19, `@repo/ui`, `@repo/types`, `@repo/payments`, Tailwind 4, MapLibre/CARTO progressive enhancement, AVIF/WebP/SVG assets, Vitest, Testing Library, Playwright, and axe.

## Global Constraints

- Warm Linen is `#F7F4F0`, Deep Midnight Olive is `#2B3E34`, and Terracotta Ochre is `#E3A857`.
- Public header is Portugal, How it works, Local expertise, Pricing, Plan Portugal, and Sign in/account.
- No public copy names internal queues, webhooks, sessions, provider adapters, MapLibre, CARTO, PostGIS, pgvector, or model plumbing.
- Every public image is owned/licensed, in the asset manifest, dimensioned, optimized, and locally served.
- The first mobile conversion sequence shows only three editable phrases and one action.
- The map/globe never delays or obscures the primary action and always has a designed static fallback.
- Named specialists require approved consent/publication data; otherwise show method and availability without a person.
- Tier 3/4, 24/7 concierge, and physical guide remain waitlist-only with no checkout.
- Legal and sustainability claims require owner/counsel-approved source text; implementation does not invent policy.

---

### Task 1.1: Complete the eight-region content and owned-image library

**Files:**
- Modify: `apps/web/content/asset-manifest.json`
- Modify: `apps/web/content/portugal-regions.json`
- Modify: `apps/web/lib/content/portugal-regions.test.ts`
- Create: `scripts/process-portugal-images.mjs`
- Create directories and variants under:
  - `apps/web/public/images/regions/lisbon-sintra-cascais/`
  - `apps/web/public/images/regions/porto-north/`
  - `apps/web/public/images/regions/douro/`
  - `apps/web/public/images/regions/central-portugal-silver-coast/`
  - `apps/web/public/images/regions/alentejo/`
  - `apps/web/public/images/regions/algarve/`
  - `apps/web/public/images/regions/madeira/`
  - `apps/web/public/images/regions/azores/`
- Create: `apps/web/public/images/home/portugal-route-hero-390.avif`
- Create: `apps/web/public/images/home/portugal-route-hero-1440.avif`
- Create: `apps/web/public/og-image.jpg`
- Modify: `apps/web/lib/trip-cover.ts`

**Interfaces:**
- Consumes: `AssetManifestEntry` and `PortugalRegionContent` from Phase 0.
- Produces: eight published complete region projections and all public image variants.

- [ ] **Step 1: Extend the failing content test with every required field and file**

```ts
it.each(REQUIRED_PORTUGAL_REGION_SLUGS)("publishes complete content for %s", (slug) => {
  const region = getPublishedPortugalRegions().find((entry) => entry.slug === slug);
  expect(region).toMatchObject({ published: true });
  expect(region?.verifiedNote.length).toBeGreaterThan(20);
  expect(region?.evidenceSource).toMatch(/^https:\/\//u);
  expect(region?.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
  for (const assetId of Object.values(region!.assetIds)) {
    expect(getAsset(assetId).files.length).toBeGreaterThan(0);
  }
});
```

- [ ] **Step 2: Run the asset/content gate before adding images**

Run: `pnpm qa:assets && pnpm exec vitest run apps/web/lib/content/portugal-regions.test.ts`

Expected: FAIL for each missing region field or asset file.

- [ ] **Step 3: Process only approved source files into the exact variants**

```js
const variants = [
  { name: "primary-640.avif", width: 640 },
  { name: "primary-1280.avif", width: 1280 },
  { name: "detail-640.avif", width: 640 },
  { name: "route-thumbnail-640.avif", width: 640 }
];
```

For each region, create those four raster files plus `map-fallback.svg`; record source, licence, attribution, focal point, owner, expiry, width, height, and bytes. Add verified season, ideal duration, transport consequence, archetype, local note, evidence URL, and review date. Add explicit `madeira` and `central-portugal-silver-coast` cover mappings.

- [ ] **Step 4: Run content, asset, and image-budget checks**

Run: `node scripts/process-portugal-images.mjs --verify-only && pnpm qa:assets && pnpm exec vitest run apps/web/lib/content`

Expected: PASS; first-viewport assets remain within the approved mobile/desktop budgets.

- [ ] **Step 5: Commit**

```bash
git add apps/web/content apps/web/lib/content apps/web/public/images apps/web/public/og-image.jpg \
  apps/web/lib/trip-cover.ts scripts/process-portugal-images.mjs
git commit -m "content: add complete Portugal destination library"
```

### Task 1.2: Rebuild the homepage around the living-brief proposition

**Files:**
- Modify: `apps/web/app/(marketing)/page.tsx`
- Modify: `apps/web/app/(marketing)/page.test.tsx`
- Replace: `apps/web/app/(marketing)/_components/hero-intent-card.tsx`
- Modify: `apps/web/app/(marketing)/_components/hero-intent-card.test.tsx`
- Replace: `apps/web/app/(marketing)/_components/hero-quick-start.tsx`
- Modify: `apps/web/app/(marketing)/_components/public-trip-choices.ts`
- Replace: `apps/web/app/(marketing)/hero-map.tsx`
- Create: `apps/web/app/(marketing)/_components/home-route-preview.tsx`
- Create: `apps/web/app/(marketing)/_components/specialist-review-comparison.tsx`
- Create: `apps/web/app/(marketing)/_components/regional-stories.tsx`
- Create: `apps/web/app/(marketing)/_components/trust-ledger.tsx`
- Create: `apps/web/app/(marketing)/_components/public-tier-ledger.tsx`
- Create: `apps/web/app/(marketing)/_components/living-brief-cta.tsx`
- Modify: `apps/web/app/_components/destination-bento.tsx`
- Modify: `apps/web/app/_components/destination-bento.test.tsx`

**Interfaces:**
- Consumes: `AcceptedPhrase`, `PhraseChoiceRail`, region content, and public pricing catalogue.
- Produces: `PublicStarterDraft` and `publicStarterToPlannerUrl()` for Phase 2 ingestion.

- [ ] **Step 1: Write the failing first-viewport test**

```tsx
it("renders the proposition, three phrases, and visible action", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { level: 1, name: "Your Portugal trip, solved." })).toBeTruthy();
  expect(screen.getAllByRole("button", { name: /destination|duration|pace/i })).toHaveLength(3);
  expect(screen.getByRole("link", { name: "Plan Portugal" })).toBeVisible();
  expect(screen.queryByText(/MapLibre|CARTO|webhook|checkout session/i)).toBeNull();
});
```

- [ ] **Step 2: Run homepage tests**

Run: `pnpm exec vitest run 'apps/web/app/(marketing)/page.test.tsx' 'apps/web/app/(marketing)/_components/hero-intent-card.test.tsx' apps/web/app/_components/destination-bento.test.tsx`

Expected: FAIL against the current boxed quick-start and old proposition.

- [ ] **Step 3: Implement the exact narrative sequence**

```tsx
<LivingBriefHero
  heading="Your Portugal trip, solved."
  supporting="AI shapes the first route. Portugal specialists verify the decisions that benefit from local judgment."
  phrases={[destinationPhrase, durationPhrase, pacePhrase]}
  action={{ label: "Plan Portugal", href: publicStarterToPlannerUrl(draft) }}
/>
```

Render sections in this order: route preview, before/after specialist comparison, synchronized regional stories, trust ledger, tier ledger, final living-brief CTA. Remove fixed hero heights and any world-globe dominance. Each destination story has one action.

- [ ] **Step 4: Run unit and first-viewport Playwright tests**

Run: `pnpm exec vitest run 'apps/web/app/(marketing)' apps/web/app/_components/destination-bento.test.tsx && pnpm --dir apps/web exec playwright test playwright/tests/public-discovery.spec.ts --grep "homepage" --project=desktop-chrome --project=mobile-chromium`

Expected: PASS; the CTA is visible without scrolling at 1440×900 and in the first mobile conversion sequence.

- [ ] **Step 5: Commit**

```bash
git add 'apps/web/app/(marketing)' apps/web/app/_components/destination-bento.tsx \
  apps/web/app/_components/destination-bento.test.tsx
git commit -m "feat: rebuild the Portugal-first homepage"
```

### Task 1.3: Build the canonical Portugal atlas with map/list synchronization

**Files:**
- Replace: `apps/web/app/(marketing)/portugal/page.tsx`
- Create: `apps/web/app/(marketing)/portugal/portugal-atlas.tsx`
- Create: `apps/web/app/(marketing)/portugal/portugal-atlas.test.tsx`
- Create: `apps/web/app/(marketing)/portugal/atlas-map.tsx`
- Create: `apps/web/app/(marketing)/portugal/atlas-list.tsx`
- Create: `apps/web/app/(marketing)/portugal/atlas-static-map.tsx`
- Modify: `packages/spatial-engine/src/components/globe-workspace.tsx`
- Modify: `packages/spatial-engine/src/core/camera-choreography.ts`

**Interfaces:**
- Consumes: eight published `PortugalRegionContent` records.
- Produces: URL state `view=map|list`, `focus=<region-slug>`, and planner starter handoff.

- [ ] **Step 1: Write failing synchronized-focus tests**

```tsx
it("focuses the same region in list and map modes", () => {
  render(<PortugalAtlas regions={regions} initialView="list" />);
  fireEvent.click(screen.getByRole("button", { name: /Douro/i }));
  expect(screen.getByTestId("atlas-map")).toHaveAttribute("data-focus", "douro");
  expect(screen.getByRole("link", { name: "Plan a Douro route" })).toHaveAttribute("href", expect.stringContaining("region=douro"));
});
```

- [ ] **Step 2: Run atlas tests**

Run: `pnpm exec vitest run 'apps/web/app/(marketing)/portugal/portugal-atlas.test.tsx'`

Expected: FAIL because the atlas components do not exist.

- [ ] **Step 3: Implement list-first SSR plus progressive map**

```tsx
<section aria-labelledby="portugal-atlas-title">
  <AtlasViewRail value={view} onChange={setView} />
  <AtlasMap regions={regions} focusedSlug={focus} onFocus={setFocus} fallback={<AtlasStaticMap regions={regions} />} />
  <AtlasList regions={regions} focusedSlug={focus} onFocus={setFocus} />
</section>
```

Region content shows image, best season, ideal duration, transport consequence, route archetype, and verified note. Filters are in-flow text rails for coast, city, wine, islands, and nature. Map failure leaves the list and static map fully usable.

- [ ] **Step 4: Run atlas tests and map fallback smoke**

Run: `pnpm exec vitest run 'apps/web/app/(marketing)/portugal' packages/spatial-engine/src && pnpm --dir apps/web exec playwright test playwright/tests/public-discovery.spec.ts --grep "Portugal atlas" --project=desktop-chrome --project=mobile-chromium`

Expected: PASS for keyboard map/list focus, static fallback, and no document overflow.

- [ ] **Step 5: Commit**

```bash
git add 'apps/web/app/(marketing)/portugal' packages/spatial-engine/src/components/globe-workspace.tsx \
  packages/spatial-engine/src/core/camera-choreography.ts
git commit -m "feat: add synchronized Portugal atlas"
```

### Task 1.4: Build the product storyboard and truthful local-expertise proof

**Files:**
- Replace: `apps/web/app/(marketing)/how-it-works/page.tsx`
- Replace: `apps/web/app/(marketing)/_components/how-it-works.tsx`
- Create: `apps/web/app/(marketing)/local-expertise/page.tsx`
- Create: `apps/web/app/(marketing)/local-expertise/page.test.tsx`
- Create: `apps/web/app/(marketing)/local-expertise/review-artifact.tsx`
- Create: `apps/web/app/(marketing)/local-expertise/specialist-proof.tsx`
- Create: `packages/db/src/public-specialists.ts`
- Create: `packages/db/src/public-specialists.test.ts`
- Create via CLI: `supabase/migrations/*_add_specialist_publication_consent.sql`

**Interfaces:**
- Produces: `PublishedSpecialistProjection` containing consented identity only.
- Consumes: approved specialist profile and region content.

- [ ] **Step 1: Write failing empty/person proof tests**

```tsx
it("never invents a specialist when none is published", async () => {
  render(await LocalExpertisePage({ loadSpecialists: async () => [] }));
  expect(screen.getByText("How local review works")).toBeTruthy();
  expect(screen.queryByRole("img", { name: /specialist/i })).toBeNull();
  expect(screen.queryByText("Sofia Almeida")).toBeNull();
});
```

- [ ] **Step 2: Generate the consent migration and run failing tests**

Run:

```bash
pnpm exec supabase migration new add_specialist_publication_consent
pnpm exec vitest run 'apps/web/app/(marketing)/local-expertise' packages/db/src/public-specialists.test.ts
```

Expected: FAIL for missing schema/helper/page.

- [ ] **Step 3: Implement the storyboard and public projection**

```ts
export type PublishedSpecialistProjection = {
  id: string;
  displayName: string;
  portraitPath: string | null;
  regions: readonly string[];
  credentialSummary: string;
  publishedAt: string;
};
```

The migration adds `public_profile_consent_at`, `public_profile_published_at`, and a sanitized credential summary. `/how-it-works` shows Write brief → Route appears → Refine → Add local expertise, using real UI fragments. `/local-expertise` shows annotated before/after changes, exact checks, two-business-hour acknowledgement and one-business-day completion targets, and review/concierge boundaries.

- [ ] **Step 4: Run database, page, and visual tests**

Run: `pnpm check:migrations && pnpm exec supabase db reset && pnpm exec vitest run 'apps/web/app/(marketing)/how-it-works' 'apps/web/app/(marketing)/local-expertise' packages/db/src/public-specialists.test.ts`

Expected: PASS; unpublished profiles never enter the projection.

- [ ] **Step 5: Commit**

```bash
git add 'apps/web/app/(marketing)/how-it-works' 'apps/web/app/(marketing)/local-expertise' \
  packages/db/src/public-specialists.ts packages/db/src/public-specialists.test.ts supabase/migrations
git commit -m "feat: explain Rumia with truthful local proof"
```

### Task 1.5: Make one server-owned pricing catalogue drive public tiers

**Files:**
- Create: `packages/payments/src/catalogue.ts`
- Create: `packages/payments/src/catalogue.test.ts`
- Modify: `packages/payments/src/index.ts`
- Modify: `packages/payments/src/index.test.ts`
- Replace: `apps/web/app/(marketing)/pricing/page.tsx`
- Modify: `apps/web/app/(marketing)/_components/public-tier-ledger.tsx`

**Interfaces:**
- Produces: `COMMERCE_CATALOGUE_VERSION`, `getCommerceProduct()`.
- Consumes: no Stripe credentials.

- [ ] **Step 1: Write the failing catalogue parity test**

```ts
it("locks launch products and prices", () => {
  expect(listCommerceProducts()).toEqual([
    expect.objectContaining({ sku: "full_itinerary_v1", unitAmountCents: 1900, currency: "eur" }),
    expect.objectContaining({ sku: "local_polish_v1", unitAmountCents: 4900, currency: "eur", requires: "full_itinerary_v1" })
  ]);
});
```

- [ ] **Step 2: Run payment tests**

Run: `pnpm exec vitest run packages/payments/src`

Expected: FAIL for the missing catalogue.

- [ ] **Step 3: Implement catalogue and traveler-facing comparison rows**

```ts
export const COMMERCE_CATALOGUE_VERSION = "2026-07-10";
export const COMMERCE_PRODUCTS = [
  { sku: "full_itinerary_v1", unitAmountCents: 1900, currency: "eur", requires: null },
  { sku: "local_polish_v1", unitAmountCents: 4900, currency: "eur", requires: "full_itinerary_v1" }
] as const;
```

Render Free preview, Full itinerary, and Local expert polish as aligned text rows with exact deliverables, timing, eligibility, and limitations. Concierge/guide is a waitlist row without checkout. Keep internal fulfillment metadata out of public copy.

- [ ] **Step 4: Run pricing and catalogue tests**

Run: `pnpm exec vitest run packages/payments/src 'apps/web/app/(marketing)/pricing' && pnpm --filter @repo/payments typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/payments/src 'apps/web/app/(marketing)/pricing' \
  'apps/web/app/(marketing)/_components/public-tier-ledger.tsx'
git commit -m "feat: publish one-time Rumia pricing catalogue"
```

### Task 1.6: Complete support, legal, sustainability, and offline routes

**Files:**
- Replace: `apps/web/app/support/page.tsx`
- Replace: `apps/web/app/privacy/page.tsx`
- Replace: `apps/web/app/terms/page.tsx`
- Replace: `apps/web/app/sustainability/page.tsx`
- Replace: `apps/web/app/offline/page.tsx`
- Create: `apps/web/app/offline/offline-status.tsx`
- Create: `apps/web/app/offline/offline-status.test.tsx`
- Modify: `apps/web/public/sw.js`
- Modify: `apps/web/public/manifest.webmanifest`
- Create: `apps/web/content/legal/privacy.md`
- Create: `apps/web/content/legal/terms.md`
- Create: `apps/web/content/legal/sustainability.md`
- Create: `apps/web/lib/content/legal.ts`
- Create: `apps/web/lib/content/legal.test.ts`

**Interfaces:**
- Produces versioned legal documents with effective dates.
- Produces offline connectivity/cached-pack status contract for Phase 3.

- [ ] **Step 1: Write failing legal/offline tests**

```ts
it("requires effective date and mandatory privacy sections", () => {
  const privacy = loadLegalDocument("privacy");
  expect(privacy.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
  expect(privacy.sections.map((section) => section.id)).toEqual(expect.arrayContaining([
    "data-collected", "processors", "retention", "payments", "ai-limitations", "contact"
  ]));
});
```

- [ ] **Step 2: Run tests before approved source text is added**

Run: `pnpm exec vitest run apps/web/lib/content/legal.test.ts apps/web/app/offline/offline-status.test.tsx`

Expected: FAIL for missing documents/components.

- [ ] **Step 3: Implement approved documents and offline recovery**

Use counsel/content-owner-approved text only. Support groups planning, payment, export, review status, account, and emergency limitation. Sustainability publishes substantiated methodology only. Offline shows online/offline state, cached packs, last sync, Retry, and an offline-safe route; it does not promise cache content that is absent.

This task cannot be marked complete or released until the three legal source documents have named content-owner/counsel approval and an effective date. Engineering may complete the loader and offline component first, but draft legal copy is not shippable evidence.

```tsx
<OfflineStatus
  online={online}
  cachedPacks={packs}
  onRetry={() => window.location.reload()}
  safeHref={packs[0]?.href ?? "/offline"}
/>
```

- [ ] **Step 4: Run unit and offline Playwright tests**

Run: `pnpm exec vitest run apps/web/lib/content apps/web/app/offline && pnpm --dir apps/web exec playwright test playwright/tests/public-discovery.spec.ts --grep "support|legal|offline" --project=desktop-chrome --project=mobile-chromium`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/support apps/web/app/privacy apps/web/app/terms apps/web/app/sustainability \
  apps/web/app/offline apps/web/content/legal apps/web/lib/content/legal.ts \
  apps/web/lib/content/legal.test.ts apps/web/public/sw.js apps/web/public/manifest.webmanifest
git commit -m "feat: complete public trust and recovery routes"
```

### Task 1.7: Rebuild sentence-style magic-link sign-in with role-safe return

**Files:**
- Replace: `apps/web/app/sign-in/page.tsx`
- Replace: `apps/web/app/sign-in/_components/sign-in-form.tsx`
- Create: `apps/web/app/sign-in/_components/sign-in-form.test.tsx`
- Modify: `apps/web/app/sign-in/_actions/sign-in.ts`
- Create: `apps/web/app/sign-in/_actions/sign-in.test.ts`
- Modify: `apps/web/app/auth/safe-next.ts`
- Modify: `apps/web/app/auth/safe-next.test.ts`
- Modify: `apps/web/app/auth/callback/route.ts`
- Create: `apps/web/app/auth/callback/route.test.ts`
- Create: `apps/web/lib/auth/role-compatible-next.ts`
- Create: `apps/web/lib/auth/role-compatible-next.test.ts`
- Create: `apps/web/playwright/tests/public-auth.spec.ts`

**Interfaces:**
- Consumes: Phase 0 `AuthorizedActor` and route catalogue.
- Produces: `resolveRoleCompatibleNext(next, actor)`.
- Leaves Phase 2 draft claim hooks explicit but inactive.

- [ ] **Step 1: Write failing lexical and role-return tests**

```ts
it("rejects an admin return for a traveler", () => {
  expect(resolveRoleCompatibleNext("/admin/places", travelerActor)).toBe("/itineraries");
});

it("keeps an allowed planner draft return", () => {
  expect(safeNext("/planner?draft=abc&stage=preview")).toBe("/planner?draft=abc&stage=preview");
});
```

- [ ] **Step 2: Run auth tests**

Run: `pnpm exec vitest run apps/web/app/auth apps/web/app/sign-in apps/web/lib/auth/role-compatible-next.test.ts`

Expected: FAIL for missing database-role validation and sentence UI.

- [ ] **Step 3: Implement the sentence action and post-exchange authorization**

```tsx
<form action={signInWithMagicLinkAction}>
  <label htmlFor="email">Send my private sign-in link to</label>
  <input id="email" name="email" type="email" autoComplete="email" required className="inline-email-baseline" />
  <button type="submit">Send link</button>
</form>
```

The callback exchanges the code, loads the database authorization context, validates `next` against route auth/capability, then redirects. Already-authenticated `/sign-in` uses the same resolver. Render one brand mark, one h1, and at most the compact footer.

- [ ] **Step 4: Run unit and browser auth journeys**

Run: `pnpm exec vitest run apps/web/app/auth apps/web/app/sign-in apps/web/lib/auth && pnpm --dir apps/web exec playwright test playwright/tests/public-auth.spec.ts --project=desktop-chrome --project=mobile-chromium`

Expected: PASS for sent, invalid, expired, already-authenticated, allowed return, and denied return states.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/sign-in apps/web/app/auth apps/web/lib/auth/role-compatible-next.ts \
  apps/web/lib/auth/role-compatible-next.test.ts apps/web/playwright/tests/public-auth.spec.ts
git commit -m "feat: add role-safe sentence sign in"
```

### Task 1.8: Retire public fixture routes and finalize canonical chrome

**Files:**
- Delete: `apps/web/app/(marketing)/explore/discovery-globe.tsx`
- Delete: `apps/web/app/(marketing)/explore/workspace/workspace-canvas-client.tsx`
- Delete: `apps/web/app/(marketing)/explore/workspace/workspace-shell.tsx`
- Modify: `apps/web/app/_components/top-nav.tsx`
- Modify: `apps/web/app/_components/site-footer.tsx`
- Modify: `apps/web/app/sitemap.ts`
- Modify: `apps/web/app/robots.ts`
- Modify: `apps/web/playwright/tests/route-normalization.spec.ts`
- Modify: `apps/web/playwright/tests/prototype-redirect.spec.ts`

**Interfaces:**
- Consumes: final Phase 0 route catalogue.
- Produces: no public fixture imports and exact compact footer.

- [ ] **Step 1: Write a failing production-fixture scan**

```ts
it("does not import spatial fixtures from public routes", async () => {
  const sources = await readPublicRouteSources();
  expect(sources).not.toMatch(/spatial-engine\/src\/fixtures|fixtureRouteCollection|Demo data/u);
});
```

- [ ] **Step 2: Run redirect and fixture tests**

Run: `pnpm exec vitest run apps/web/lib/routes && pnpm --dir apps/web exec playwright test playwright/tests/route-normalization.spec.ts playwright/tests/prototype-redirect.spec.ts --project=desktop-chrome`

Expected: FAIL while legacy public fixture modules remain referenced.

- [ ] **Step 3: Delete orphaned UI and finalize navigation/footer**

Remove all imports to deleted fixture components. Footer groups are Portugal, Product, Help, Legal, and one Plan Portugal action. Sitemap contains only the nine approved public paths; canonical metadata points to final targets.

- [ ] **Step 4: Run source scan, typecheck, and redirect tests**

Run: `pnpm qa:assets && pnpm qa:icons -- --scope=public && pnpm --filter web typecheck && pnpm --dir apps/web exec playwright test playwright/tests/route-normalization.spec.ts playwright/tests/prototype-redirect.spec.ts --project=desktop-chrome`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A 'apps/web/app/(marketing)/explore' apps/web/app/_components/top-nav.tsx \
  apps/web/app/_components/site-footer.tsx apps/web/app/sitemap.ts apps/web/app/robots.ts \
  apps/web/playwright/tests/route-normalization.spec.ts apps/web/playwright/tests/prototype-redirect.spec.ts
git commit -m "refactor: retire public fixture routes"
```

### Task 1.9: Run and record the public release gate

**Files:**
- Modify: `apps/web/playwright/tests/public-discovery.spec.ts`
- Modify: `apps/web/playwright/tests/visual.spec.ts`
- Modify: `apps/web/playwright/tests/accessibility.spec.ts`
- Modify: `apps/web/playwright/tests/mobile-overflow.spec.ts`
- Modify: `apps/web/playwright/tests/perf.spec.ts`
- Modify: `docs/audit/route-matrix.md`
- Modify: `docs/ops/launch.md`

**Interfaces:**
- Consumes all Phase 1 routes and content.
- Produces public desktop/mobile/keyboard/static-map/performance evidence.

- [ ] **Step 1: Add explicit public assertions**

```ts
await expect(page.locator("main")).toHaveCount(1);
await expect(page.locator("h1:visible")).toHaveCount(1);
await expect(page.getByRole("link", { name: "Plan Portugal" }).first()).toBeVisible();
expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
```

- [ ] **Step 2: Run unit, build, and public journeys**

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
pnpm --dir apps/web exec playwright test \
  playwright/tests/public-discovery.spec.ts \
  playwright/tests/public-auth.spec.ts \
  playwright/tests/route-normalization.spec.ts \
  --project=desktop-chrome --project=mobile-chromium
```

Expected: PASS.

- [ ] **Step 3: Run public visual, accessibility, overflow, and performance matrix**

```bash
pnpm --dir apps/web test:visual
pnpm --dir apps/web test:a11y
pnpm --dir apps/web test:perf
pnpm qa:perf-budget
```

Expected: zero serious/critical axe violations, no 390px document overflow, no stale navigation/fixtures, and all public budgets pass.

- [ ] **Step 4: Review every 1440×900 and 390×844 public artifact manually**

Reject clipped hero actions, generic gradients, raw icon names, duplicate footer/chrome, developer copy, fabricated people/claims, invisible content, or map-only information. Record exact artifact names and outcomes in the route matrix.

- [ ] **Step 5: Commit the gate evidence**

```bash
git add apps/web/playwright/tests docs/audit/route-matrix.md docs/ops/launch.md
git commit -m "test: certify public discovery release"
```

## Phase 1 completion checkpoint

- All public acquisition and utility routes have their approved purpose.
- The homepage starts a three-phrase brief and never clips the primary action.
- The atlas covers all eight required destination groups with licensed imagery and evidence.
- Pricing, trust, legal, sustainability, offline, and sign-in claims are truthful.
- Legacy discovery/workspace/human-review URLs are exact redirects with canonical targets.
- No public route contains fixtures, technical implementation copy, raw icon ligatures, or unsupported Tier 3/4 purchase claims.
