# Rumia Phase 0 Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a safe, testable foundation—pinned tooling, truthful readiness, database-authoritative capabilities, exact routes, single shells, living-phrase primitives, owned-asset contracts, and an executable route evidence matrix.

**Architecture:** Next.js Proxy performs only an optimistic authenticated/anonymous check. Secure page loaders, handlers/actions, and Supabase policies use one database-backed authorization context. Shared route, readiness, shell, phrase, asset, and state registries become the inputs for every later phase and for Playwright evidence generation.

**Tech Stack:** Node 24, pnpm 10.34.5, Supabase CLI 2.109.1, Next.js 16 Proxy, React 19.2, TypeScript 5.9, Tailwind 4, Supabase Postgres 17, Vitest, Node test runner, Playwright, and axe.

## Global Constraints

- Preserve all unrelated dirty-worktree changes; execute from a worktree created with `superpowers:using-git-worktrees`.
- Do not read, print, or commit secrets. Supabase `.temp` paths, Playwright auth state, and `.env*` remain untracked.
- Do not edit historical migrations; generate forward migrations through the pinned Supabase CLI.
- No route trusts `user_metadata`; database rows are the secure authority.
- Public pages render anonymous chrome when optional provider configuration is absent.
- Exactly one shell owns `main`, skip link, navigation, footer placement, and global providers.
- No production fixture fallback is introduced in this phase.
- Package-manager execution must use pinned pnpm `10.34.5`; the safety test rejects earlier versions.

---

### Task 0.1: Untrack runtime state and pin the repository toolchain

**Files:**
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `pnpm-workspace.yaml`
- Modify: `apps/web/package.json`
- Modify: `packages/auth/package.json`
- Modify: `packages/db/package.json`
- Modify: `packages/ingest/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.github/workflows/ci.yml`
- Create: `scripts/check-sensitive-paths.mjs`
- Create: `scripts/check-sensitive-paths.test.mjs`
- Create: `docs/ops/credential-review.md`
- Remove from index only: `supabase/.temp/cli-latest`, `linked-project.json`, `pooler-url`, `postgres-version`, `project-ref`, `rest-version`

**Interfaces:**
- Produces: `pnpm repo:safety`, a zero-secret-output tracked-path guard.
- Produces: local `pnpm exec supabase` pinned to `2.109.1`.
- Consumes: no application interfaces.

- [ ] **Step 1: Write the failing path-safety test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { findForbiddenTrackedPaths } from "./check-sensitive-paths.mjs";

test("rejects runtime and credential-bearing paths", () => {
  assert.deepEqual(
    findForbiddenTrackedPaths([
      "apps/web/app/page.tsx",
      "supabase/.temp/project-ref",
      "apps/web/playwright/.auth/traveler.json",
      ".env.local"
    ]),
    [
      "supabase/.temp/project-ref",
      "apps/web/playwright/.auth/traveler.json",
      ".env.local"
    ]
  );
});
```

- [ ] **Step 2: Run the test and confirm the missing module/export failure**

Run: `node --test scripts/check-sensitive-paths.test.mjs`

Expected: FAIL because `check-sensitive-paths.mjs` does not exist.

- [ ] **Step 3: Implement the guard and pin versions**

```js
import { execFileSync } from "node:child_process";

const FORBIDDEN = [
  /^\.env(?:\.|$)/u,
  /^supabase\/\.temp\//u,
  /^apps\/web\/playwright\/\.auth\//u,
  /\.(?:pem|key)$/u
];

export function findForbiddenTrackedPaths(paths) {
  return paths.filter((path) => FORBIDDEN.some((pattern) => pattern.test(path)));
}

if (process.argv[1]?.endsWith("check-sensitive-paths.mjs")) {
  const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean);
  const forbidden = findForbiddenTrackedPaths(tracked);
  if (forbidden.length > 0) {
    process.stderr.write(`Forbidden tracked paths:\n${forbidden.join("\n")}\n`);
    process.exitCode = 1;
  }
}
```

In `package.json`, set `packageManager` to `pnpm@10.34.5`, add exact `devDependencies.supabase = "2.109.1"`, and add `scripts["repo:safety"] = "node scripts/check-sensitive-paths.mjs"`. Pin `@supabase/supabase-js` to `2.105.1` and `@supabase/ssr` to `0.10.2` in every declared workspace, move the ignored `zod` override into `pnpm-workspace.yaml`, and set CI Corepack to pnpm `10.34.5` and the Supabase action version to `2.109.1`.

- [ ] **Step 4: Untrack runtime files without deleting local copies**

```bash
git rm --cached -- \
  supabase/.temp/cli-latest \
  supabase/.temp/linked-project.json \
  supabase/.temp/pooler-url \
  supabase/.temp/postgres-version \
  supabase/.temp/project-ref \
  supabase/.temp/rest-version
pnpm install
pnpm repo:safety
pnpm --version
pnpm exec supabase --version
```

Expected: the safety check passes, pnpm prints `10.34.5`, and the Supabase CLI prints `2.109.1`. `docs/ops/credential-review.md` records only whether database credentials were rotated after a private history review; it contains no URL, identifier, token, or secret.

- [ ] **Step 5: Commit the safety/toolchain boundary**

```bash
git add .gitignore package.json pnpm-workspace.yaml apps/web/package.json \
  packages/auth/package.json packages/db/package.json packages/ingest/package.json \
  pnpm-lock.yaml .github/workflows/ci.yml scripts/check-sensitive-paths.mjs \
  scripts/check-sensitive-paths.test.mjs docs/ops/credential-review.md
git add -u -- supabase/.temp
git commit -m "chore: pin toolchain and untrack runtime state"
```

### Task 0.2: Standardize API errors and composite readiness

**Files:**
- Create: `packages/types/src/api-error.ts`
- Create: `packages/types/src/api-error.test.ts`
- Create: `packages/config/src/readiness.ts`
- Create: `packages/config/src/readiness.test.ts`
- Modify: `packages/types/src/index.ts`
- Modify: `packages/config/src/features.ts`
- Modify: `packages/config/src/features.test.ts`
- Modify: `packages/config/src/health.ts`
- Modify: `packages/config/src/index.ts`
- Modify: `packages/config/src/public.ts`
- Modify: `packages/config/src/server.ts`
- Modify: `.env.example`
- Create: `apps/web/lib/http/api-error.ts`
- Modify: `apps/web/lib/auth/api.ts`

**Interfaces:**
- Produces: `ApiErrorEnvelope`, `FeatureReadiness`, `resolveFeatureReadiness()`.
- Produces: all ten approved feature flags.
- Consumes: provider health from `packages/config/src/health.ts`.

- [ ] **Step 1: Write failing contract tests**

```ts
import { describe, expect, it } from "vitest";
import { resolveFeatureReadiness } from "./readiness";

describe("resolveFeatureReadiness", () => {
  it("never treats a flag alone as ready", () => {
    expect(resolveFeatureReadiness({ enabled: true, credentials: false, migration: true, rls: true, provider: true }))
      .toEqual({ status: "unavailable", failed: ["credentials"] });
  });

  it("returns disabled before inspecting providers", () => {
    expect(resolveFeatureReadiness({ enabled: false, credentials: false, migration: false, rls: false, provider: false }))
      .toEqual({ status: "disabled", reason: "flag_off" });
  });
});
```

- [ ] **Step 2: Run focused tests and confirm missing exports**

Run: `pnpm exec vitest run packages/types/src/api-error.test.ts packages/config/src/readiness.test.ts packages/config/src/features.test.ts`

Expected: FAIL for missing files and missing new flags.

- [ ] **Step 3: Implement exact contracts**

```ts
export type ApiErrorEnvelope = {
  code: string;
  message: string;
  fieldErrors?: Record<string, readonly string[]>;
};

export type ReadinessFailure =
  | "credentials"
  | "migration"
  | "rls"
  | "provider"
  | "capability";

export type FeatureReadiness =
  | { status: "ready" }
  | { status: "disabled"; reason: "flag_off" }
  | { status: "unavailable"; failed: readonly ReadinessFailure[] };

export function resolveFeatureReadiness(input: {
  enabled: boolean;
  credentials: boolean;
  migration: boolean;
  rls: boolean;
  provider: boolean;
  capability?: boolean;
}): FeatureReadiness {
  if (!input.enabled) return { status: "disabled", reason: "flag_off" };
  const failed: ReadinessFailure[] = [];
  if (!input.credentials) failed.push("credentials");
  if (!input.migration) failed.push("migration");
  if (!input.rls) failed.push("rls");
  if (!input.provider) failed.push("provider");
  if (input.capability === false) failed.push("capability");
  return failed.length > 0 ? { status: "unavailable", failed } : { status: "ready" };
}
```

Add `operatorConsole`, `consoleConfig`, and `apiDocs` to `FeatureFlag`; keep `pt` false. Make Stripe, PostHog, map, email, and AI public/server credentials optional until the corresponding readiness function is evaluated. Change `apiError()` to emit the top-level envelope, never raw `details`.

- [ ] **Step 4: Run package tests and typechecks**

Run: `pnpm exec vitest run packages/types/src/api-error.test.ts packages/config/src && pnpm --filter @repo/config typecheck && pnpm --filter web typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/types/src packages/config/src .env.example apps/web/lib/http/api-error.ts apps/web/lib/auth/api.ts
git commit -m "feat: add truthful readiness and API errors"
```

### Task 0.3: Add database-authoritative capabilities and quarantine unsafe policies

**Files:**
- Create via CLI: `supabase/migrations/*_create_app_role_capability_grants.sql`
- Create via CLI: `supabase/migrations/*_quarantine_unsafe_org_and_message_access.sql`
- Create: `supabase/policy-tests/phase-0-authorization-baseline.sql`
- Create: `packages/types/src/access-control.ts`
- Create: `packages/types/src/access-control.test.ts`
- Create: `packages/db/src/access-control.ts`
- Create: `packages/db/src/access-control.test.ts`
- Modify: `packages/types/src/index.ts`
- Modify: `packages/db/src/index.ts`

**Interfaces:**
- Produces: `Capability`, `AuthorizedActor`, `getAuthorizationContext()`.
- Produces database helpers: `private.has_app_role`, `private.has_capability`, `private.has_active_reviewer_assignment`, `private.has_organization_membership`.
- Consumes: existing `user_profiles`, `reviewer_auth_links`, and `reviewer_assignments`.

- [ ] **Step 1: Write failing type and repository tests**

```ts
import { describe, expect, it } from "vitest";
import { capabilitySchema } from "./access-control";

describe("capabilitySchema", () => {
  it.each([
    "access:manage",
    "content:manage",
    "operations:manage",
    "analytics:read",
    "configuration:deploy",
    "developer_docs:read",
    "specialists:verify"
  ])("accepts %s", (value) => expect(capabilitySchema.parse(value)).toBe(value));
});
```

- [ ] **Step 2: Generate both forward migrations**

Run:

```bash
pnpm exec supabase migration new create_app_role_capability_grants
pnpm exec supabase migration new quarantine_unsafe_org_and_message_access
```

Expected: two new migration paths with ordered CLI timestamps.

- [ ] **Step 3: Implement capability storage and private predicates**

```sql
create table public.app_role_capability_grants (
  id uuid primary key default gen_random_uuid(),
  subject_user_id uuid not null references auth.users(id) on delete cascade,
  app_role text not null check (app_role in ('traveler','reviewer','admin')),
  capability text null check (capability in (
    'access:manage','content:manage','operations:manage','analytics:read',
    'configuration:deploy','developer_docs:read','specialists:verify'
  )),
  granted_by uuid null references auth.users(id) on delete set null,
  reason text not null,
  expires_at timestamptz null,
  revoked_at timestamptz null,
  revoked_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.app_role_capability_grants enable row level security;
revoke all on public.app_role_capability_grants from public, anon, authenticated;
grant select, insert, update, delete on public.app_role_capability_grants to service_role;

create or replace function private.has_capability(required_capability text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.app_role_capability_grants g
    where g.subject_user_id = (select auth.uid())
      and g.capability = required_capability
      and g.revoked_at is null
      and (g.expires_at is null or g.expires_at > now())
  );
$$;
revoke all on function private.has_capability(text) from public, anon, authenticated;
grant execute on function private.has_capability(text) to authenticated;
```

Backfill current admin/reviewer roles from `user_profiles`; grant the approved admin capabilities to existing admins and ensure at least one existing admin receives `access:manage`. Remove JWT fallback from `private.current_app_role`. The quarantine migration drops the anonymous organization policy, removes the `user_metadata` branch from organization authority, revokes broad execution on the public helper, drops `chat_messages_read_all_participants` and `chat_messages_insert_own_role`, and revokes direct `anon/authenticated` access until later scoped replacements land.

- [ ] **Step 4: Prove the policy boundary**

Run:

```bash
pnpm check:migrations
pnpm exec supabase db reset
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -v ON_ERROR_STOP=1 -f supabase/policy-tests/phase-0-authorization-baseline.sql
pnpm exec vitest run packages/types/src/access-control.test.ts packages/db/src/access-control.test.ts
```

Expected: PASS; the SQL test rejects `user_metadata`, public-schema security-definer execution, broad message reads, self-grants, expired grants, and cross-user capability reads.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations supabase/policy-tests/phase-0-authorization-baseline.sql \
  packages/types/src packages/db/src
git commit -m "feat: add authoritative capability grants"
```

### Task 0.4: Move secure authorization into a shared data-access layer and Next.js Proxy

**Files:**
- Create: `apps/web/proxy.ts`
- Delete: `apps/web/middleware.ts`
- Create: `apps/web/lib/auth/authorization.ts`
- Create: `apps/web/lib/auth/authorization.test.ts`
- Modify: `apps/web/lib/auth/routes.ts`
- Modify: `apps/web/lib/auth/routes.test.ts`
- Modify: `apps/web/lib/auth/api.ts`
- Modify: `apps/web/lib/auth/admin.ts`
- Modify: `apps/web/lib/auth/reviewer.ts`
- Modify: `apps/web/lib/supabase/middleware.ts`
- Modify: `packages/db/src/clients.ts`
- Modify: `packages/db/src/clients.test.ts`
- Modify: `scripts/seed-local-personas.mjs`
- Modify: `apps/web/playwright/global-setup.ts`

**Interfaces:**
- Consumes: `getAuthorizationContext()` from Task 0.3.
- Produces: `requirePageAccess()`, `requireApiAccess()`, `UserDataOptions`, and `SystemDataOptions`.
- Produces fixed 307/401/403/404 semantics.

- [ ] **Step 1: Write failing authorization tests**

```ts
it("uses database capabilities for secure decisions", async () => {
  const result = await requireApiAccess(
    { allCapabilities: ["operations:manage"] },
    { loadActor: async () => ({ userId: "u1", roles: ["admin"], capabilities: [], reviewerId: null }) }
  );
  expect(result).toMatchObject({ status: 403 });
});

it("returns the same 404 for missing and foreign resources", () => {
  expect(resourceNotFound()).toEqual({ status: 404, body: { code: "not_found", message: "Resource not found." } });
});
```

- [ ] **Step 2: Run focused tests**

Run: `pnpm exec vitest run apps/web/lib/auth/authorization.test.ts apps/web/lib/auth/routes.test.ts`

Expected: FAIL for missing `requireApiAccess` and missing Proxy coverage.

- [ ] **Step 3: Implement optimistic Proxy plus secure DAL checks**

```ts
export type AccessRequirement = {
  anyRole?: readonly ("traveler" | "reviewer" | "admin")[];
  allCapabilities?: readonly Capability[];
  activeReviewerTripId?: string;
  organizationId?: string;
};

export async function requireApiAccess(requirement: AccessRequirement): Promise<AuthorizedActor | Response> {
  const actor = await loadCurrentAuthorizedActor();
  if (!actor) return Response.json({ code: "unauthenticated", message: "Authentication required." }, { status: 401 });
  if (requirement.anyRole && !requirement.anyRole.some((role) => actor.roles.includes(role))) {
    return Response.json({ code: "forbidden", message: "Forbidden." }, { status: 403 });
  }
  if (requirement.allCapabilities?.some((capability) => !actor.capabilities.includes(capability))) {
    return Response.json({ code: "forbidden", message: "Forbidden." }, { status: 403 });
  }
  return actor;
}
```

`proxy.ts` refreshes the Supabase session and redirects only anonymous protected pages to `/sign-in?next=...`; it does not fetch capabilities or authorize resource access. Route layouts/loaders and API handlers call the DAL.

- [ ] **Step 4: Run auth tests and protected-route smoke**

Run: `pnpm exec vitest run apps/web/lib/auth packages/db/src/access-control.test.ts && pnpm --dir apps/web exec playwright test playwright/tests/protected-routes.spec.ts --project=desktop-chrome`

Expected: PASS with anonymous page 307, anonymous API 401, wrong capability 403, and missing/foreign resource 404.

- [ ] **Step 5: Commit**

```bash
git add apps/web/proxy.ts apps/web/middleware.ts apps/web/lib/auth apps/web/lib/supabase/middleware.ts \
  packages/db/src/clients.ts packages/db/src/clients.test.ts scripts/seed-local-personas.mjs \
  apps/web/playwright/global-setup.ts
git commit -m "refactor: centralize secure authorization"
```

### Task 0.5: Create the exact route catalogue, redirects, sitemap, and robots contract

**Files:**
- Create: `apps/web/lib/routes/http-route-catalogue.ts`
- Create: `apps/web/lib/routes/http-route-catalogue.test.ts`
- Create: `apps/web/lib/routes/redirects.ts`
- Create: `apps/web/lib/routes/redirects.test.ts`
- Modify: `apps/web/next.config.ts`
- Modify: `apps/web/app/sitemap.ts`
- Create: `apps/web/app/sitemap.test.ts`
- Modify: `apps/web/app/robots.ts`
- Create: `apps/web/app/robots.test.ts`
- Modify: `apps/web/app/(marketing)/explore/page.tsx`
- Modify: `apps/web/app/(marketing)/explore/workspace/page.tsx`
- Modify: `apps/web/app/(marketing)/human-review/page.tsx`
- Modify: `apps/web/app/plan/page.tsx`
- Modify: `apps/web/app/logistics/page.tsx`
- Modify: `apps/web/app/expert-chat/page.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/operations/page.tsx`
- Modify: `apps/web/app/(admin)/admin/countries/page.tsx`
- Modify: `apps/web/app/(admin)/admin/reviewers/page.tsx`
- Modify: `apps/web/app/(admin)/admin/analytics/page.tsx`
- Modify: `apps/web/app/console/page.tsx`
- Modify: `apps/web/app/console/workspace/page.tsx`
- Create: `apps/web/playwright/tests/route-normalization.spec.ts`

**Interfaces:**
- Produces: `HTTP_ROUTE_CATALOGUE`, `PUBLIC_SITEMAP_PATHS`, `resolveLegacyRedirect()`.
- Consumes: capability names from Task 0.3.

- [ ] **Step 1: Write a failing catalogue test for every existing page**

```ts
it("assigns every existing route a purpose or redirect", () => {
  expect(HTTP_ROUTE_CATALOGUE.map((entry) => entry.path)).toEqual(expect.arrayContaining([
    "/", "/portugal", "/explore", "/explore/workspace", "/how-it-works",
    "/human-review", "/local-expertise", "/pricing", "/planner", "/trip/new",
    "/trip/[tripId]", "/checkout", "/itineraries", "/vault", "/account",
    "/reviewer/queue", "/admin/places", "/console/pipeline", "/guide", "/b2b/[orgSlug]"
  ]));
});
```

- [ ] **Step 2: Run the catalogue tests**

Run: `pnpm exec vitest run apps/web/lib/routes apps/web/app/sitemap.test.ts apps/web/app/robots.test.ts`

Expected: FAIL because the catalogue does not exist.

- [ ] **Step 3: Implement typed route and redirect records**

```ts
export type HttpRouteDefinition = {
  path: string;
  responsibility: string;
  shell: "public" | "traveler" | "operator" | "none";
  indexable: boolean;
  auth: "public" | "owner" | "reviewer" | "admin" | "organization" | "token";
  capability?: Capability;
  redirect?: { status: 307 | 308; destination: string };
};

export const PUBLIC_SITEMAP_PATHS = [
  "/", "/portugal", "/how-it-works", "/local-expertise", "/pricing",
  "/support", "/privacy", "/terms", "/sustainability"
] as const;
```

Static redirects use `permanentRedirect()` or `next.config.ts` with `permanent: true`. Query-dependent `/logistics` and `/expert-chat` use the exact 307/308 contracts and allow only `trip`, `draft`, `view`, `panel`, `mode`, `stage`, `sku`, and `source` values. Add `noindex` metadata to planner, auth, app, operator, beta, share, and API-doc routes.

- [ ] **Step 4: Verify status, location, canonical, and indexability**

Run: `pnpm exec vitest run apps/web/lib/routes apps/web/app/sitemap.test.ts apps/web/app/robots.test.ts && pnpm --dir apps/web exec playwright test playwright/tests/route-normalization.spec.ts --project=desktop-chrome`

Expected: PASS for every documented redirect and sitemap exclusion.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/routes apps/web/next.config.ts apps/web/app/sitemap.ts apps/web/app/sitemap.test.ts \
  apps/web/app/robots.ts apps/web/app/robots.test.ts apps/web/app apps/web/playwright/tests/route-normalization.spec.ts
git commit -m "feat: normalize every application route"
```

### Task 0.6: Make one shell own landmarks and navigation

**Files:**
- Modify: `packages/ui/src/components/app-layout.tsx`
- Create: `packages/ui/src/components/app-layout.test.tsx`
- Modify: `packages/ui/src/components/operator-shell.tsx`
- Create: `apps/web/app/_components/public-traveler-shell.tsx`
- Create: `apps/web/app/_components/public-traveler-shell.test.tsx`
- Create: `apps/web/app/_components/traveler-shell.tsx`
- Modify: `apps/web/app/_components/top-nav.tsx`
- Modify: `apps/web/app/_components/site-footer.tsx`
- Modify: `apps/web/app/_components/public-route-layout.tsx`
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/app/(marketing)/layout.tsx`
- Modify: `apps/web/app/(app)/account/layout.tsx`
- Modify: `apps/web/app/(app)/trip/layout.tsx`
- Modify: `apps/web/app/(reviewer)/reviewer/layout.tsx`
- Modify: `apps/web/app/(admin)/admin/layout.tsx`
- Modify: `apps/web/app/console/layout.tsx`
- Modify: `apps/web/app/sign-in/page.tsx`

**Interfaces:**
- Produces: `PublicTravelerShell`, `TravelerShell`, role-aware `OperatorShell`.
- Consumes: verified viewer and route definition from Tasks 0.4–0.5.

- [ ] **Step 1: Write the failing shell test**

```tsx
it("renders exactly one landmark and anonymous sign in", () => {
  const { container } = render(
    <PublicTravelerShell mode="public" viewer={{ kind: "anonymous" }}>
      <h1>Portugal</h1>
    </PublicTravelerShell>
  );
  expect(container.querySelectorAll("main")).toHaveLength(1);
  expect(screen.getByRole("link", { name: "Sign in" })).toBeTruthy();
  expect(screen.queryByLabelText(/account/i)).toBeNull();
});
```

- [ ] **Step 2: Run UI/web shell tests**

Run: `pnpm exec vitest run apps/web/app/_components/public-traveler-shell.test.tsx packages/ui/src/components/app-layout.test.tsx`

Expected: FAIL for the missing shell and duplicate page landmarks.

- [ ] **Step 3: Implement shell ownership**

```tsx
export function PublicTravelerShell({ mode, viewer, children }: PublicTravelerShellProps) {
  return (
    <AppLayout
      topNav={<TopNav mode={mode} viewer={viewer} />}
      siteFooter={mode === "auth" ? null : <SiteFooter compact />}
    >
      {children}
    </AppLayout>
  );
}
```

`AppLayout` renders the only `<main id="main-content">`; route pages provide sections and one visible `h1`. Public navigation is Portugal, How it works, Local expertise, Pricing, Plan Portugal, Sign in/account. Traveler navigation is Trips, Explore Portugal, Support, Plan another trip, account. Operator routes have no marketing footer.

- [ ] **Step 4: Run landmark and chrome checks**

Run: `pnpm --filter @repo/ui test && pnpm exec vitest run apps/web/app/_components && pnpm --dir apps/web exec playwright test playwright/tests/accessibility.spec.ts --project=desktop-chrome`

Expected: PASS for one main, one visible h1, working skip link, and no fake avatar.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/app-layout.tsx packages/ui/src/components/operator-shell.tsx \
  apps/web/app/_components apps/web/app/layout.tsx 'apps/web/app/(marketing)/layout.tsx' \
  'apps/web/app/(app)' 'apps/web/app/(reviewer)' 'apps/web/app/(admin)' apps/web/app/console apps/web/app/sign-in/page.tsx
git commit -m "refactor: unify public traveler and operator shells"
```

### Task 0.7: Install the exact visual tokens, SVG icons, and accepted-phrase primitive

**Files:**
- Modify: `packages/ui/src/styles.css`
- Modify: `packages/ui/package.json`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/package.json`
- Modify: `pnpm-lock.yaml`
- Replace: `packages/ui/src/components/icon.tsx`
- Modify: `packages/ui/src/components/icon.test.tsx`
- Create: `packages/ui/src/components/accepted-phrase.tsx`
- Create: `packages/ui/src/components/accepted-phrase.test.tsx`
- Create: `packages/ui/src/components/phrase-choice-rail.tsx`
- Create: `packages/ui/src/components/phrase-choice-rail.test.tsx`
- Modify: `packages/ui/src/index.ts`
- Create: `scripts/check-icons.mjs`
- Modify: `package.json`
- Remove: `apps/web/public/brand/phosphor/style.css`
- Remove: `apps/web/public/brand/phosphor/Phosphor.woff`
- Remove: `apps/web/public/brand/phosphor/Phosphor.ttf`
- Remove: `apps/web/public/brand/phosphor/Phosphor.woff2`
- Modify: `apps/web/public/manifest.webmanifest`

**Interfaces:**
- Produces: SVG `Icon`, `AcceptedPhrase`, `PhraseChoiceRail`.
- Consumes: `PhraseState` from the approved cross-plan ledger.

- [ ] **Step 1: Write failing interaction and icon tests**

```tsx
it("opens a roving phrase rail and restores focus on Escape", () => {
  render(<AcceptedPhrase label="Duration" value="one week" options={durationOptions} onAccept={vi.fn()} onClear={vi.fn()} />);
  const phrase = screen.getByRole("button", { name: /duration, one week/i });
  fireEvent.click(phrase);
  fireEvent.keyDown(screen.getByRole("button", { name: "five days" }), { key: "Escape" });
  expect(document.activeElement).toBe(phrase);
});

it("renders an inline svg and no font ligature", () => {
  const { container } = render(<Icon name="arrow-right" />);
  expect(container.querySelector("svg")).toBeTruthy();
  expect(container.querySelector(".ph, .material-symbols-outlined")).toBeNull();
});
```

- [ ] **Step 2: Run focused UI tests**

Run: `pnpm --filter @repo/ui test -- accepted-phrase phrase-choice-rail icon`

Expected: FAIL for missing phrase components and font-based icon output.

- [ ] **Step 3: Implement tokens and accessible primitives**

```css
:root {
  --color-linen: #f7f4f0;
  --color-olive: #2b3e34;
  --color-ochre: #e3a857;
  --radius-inline: 0;
  --focus-ring: 0 0 0 3px rgba(227, 168, 87, 0.45);
}
```

`AcceptedPhrase` renders an inline button when accepted and a labelled borderless input/textarea only after **Write my own**. `PhraseChoiceRail` uses roving-tabindex buttons, all arrow keys, Enter/Space selection, Escape restoration, 44×44px targets, and no overlay. Remove `@phosphor-icons/web`, add exact `@phosphor-icons/react` version `2.1.10`, delete the checked-in icon-font CSS and three font files, and replace shared-shell public icon calls with SVG `Icon`; page-family icon migrations continue in their phases. Add `pnpm qa:icons` to reject raw `.ph`/Material Symbol call sites after the final phase.

- [ ] **Step 4: Run UI tests, typecheck, and icon scan in shared scope**

Run: `pnpm --filter @repo/ui test && pnpm --filter @repo/ui typecheck && pnpm qa:icons -- --scope=shared`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src apps/web/app/globals.css apps/web/app/layout.tsx apps/web/public/brand \
  apps/web/public/manifest.webmanifest scripts/check-icons.mjs package.json pnpm-lock.yaml
git commit -m "feat: establish intentional humanist design primitives"
```

### Task 0.8: Define the owned-asset and Portugal content gates

**Files:**
- Create: `apps/web/content/asset-manifest.json`
- Create: `apps/web/content/portugal-regions.json`
- Create: `apps/web/lib/content/asset-manifest.ts`
- Create: `apps/web/lib/content/asset-manifest.test.ts`
- Create: `apps/web/lib/content/portugal-regions.ts`
- Create: `apps/web/lib/content/portugal-regions.test.ts`
- Create: `scripts/check-assets.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `AssetManifestEntry`, `PortugalRegionContent`, `getPublishedPortugalRegions()`.
- Blocks Phase 1 until all eight region groups pass.

- [ ] **Step 1: Write a failing completeness test**

```ts
it("requires all eight complete Portugal groups", () => {
  expect(getPublishedPortugalRegions().map((region) => region.slug)).toEqual([
    "lisbon-sintra-cascais", "porto-north", "douro",
    "central-portugal-silver-coast", "alentejo", "algarve", "madeira", "azores"
  ]);
});
```

- [ ] **Step 2: Run content tests**

Run: `pnpm exec vitest run apps/web/lib/content`

Expected: FAIL because the manifest and content loaders do not exist.

- [ ] **Step 3: Implement schemas and validators**

```ts
export type AssetManifestEntry = {
  id: string;
  files: readonly { src: string; width: number; height: number; bytes: number }[];
  source: string;
  licence: string;
  attribution: string | null;
  focalPoint: { x: number; y: number };
  owner: string;
  expiresAt: string | null;
};

export type PortugalRegionContent = {
  slug: string;
  assetIds: { primary: string; detail: string; routeThumbnail: string; mapFallback: string };
  bestSeason: string;
  idealDuration: string;
  transportConsequence: string;
  routeArchetype: string;
  verifiedNote: string;
  evidenceSource: string;
  reviewedAt: string;
  published: boolean;
};
```

`check-assets.mjs` validates local paths, dimensions, byte budgets, responsive variants, licences, owner, expiry, and forbidden remote hosts. Initial JSON may contain unpublished records, but Phase 1 cannot begin until eight complete records and files exist.

- [ ] **Step 4: Run the asset gate**

Run: `pnpm qa:assets && pnpm exec vitest run apps/web/lib/content`

Expected: PASS only when all required records/files are complete; otherwise stop before Phase 1 and acquire approved assets/content.

- [ ] **Step 5: Commit**

```bash
git add apps/web/content apps/web/lib/content scripts/check-assets.mjs package.json
git commit -m "feat: add owned Portugal content gates"
```

### Task 0.9: Make the route × persona × state matrix executable

**Files:**
- Create: `apps/web/playwright/route-matrix.ts`
- Create: `apps/web/playwright/route-matrix.test.ts`
- Create: `scripts/generate-route-matrix.mjs`
- Modify: `docs/audit/route-matrix.md`
- Modify: `apps/web/playwright/global-setup.ts`
- Create: `apps/web/playwright/fixtures/specialist-candidate-auth.ts`
- Create: `apps/web/playwright/fixtures/organization-member-auth.ts`
- Modify: `apps/web/playwright/tests/visual.spec.ts`
- Modify: `apps/web/playwright/tests/accessibility.spec.ts`
- Modify: `apps/web/playwright/tests/mobile-overflow.spec.ts`
- Modify: `apps/web/playwright/tests/protected-routes.spec.ts`

**Interfaces:**
- Consumes: route catalogue and readiness/state families.
- Produces: `ROUTE_MATRIX` and generated human-readable documentation.

- [ ] **Step 1: Write a failing matrix coverage test**

```ts
it("covers every catalogue route with an applicable persona and state", () => {
  for (const route of HTTP_ROUTE_CATALOGUE) {
    const rows = ROUTE_MATRIX.filter((row) => row.route === route.path);
    expect(rows.length, route.path).toBeGreaterThan(0);
    expect(rows.every((row) => row.persona && row.state)).toBe(true);
  }
});
```

- [ ] **Step 2: Run the matrix test**

Run: `pnpm exec vitest run apps/web/playwright/route-matrix.test.ts`

Expected: FAIL because the matrix is not yet executable.

- [ ] **Step 3: Implement the matrix and role proof marker**

```ts
export type RouteMatrixRow = {
  route: string;
  persona: "anonymous" | "traveler" | "specialist_candidate" | "reviewer" | "admin" | "organization_member";
  state: string;
  viewport: "desktop" | "mobile";
  expectedRoleMarker?: string;
  fixtureMode: "production" | "demo";
};
```

Every authenticated capture asserts its role marker and one role-scoped data read. Demo rows are a separate Playwright project and require the **Demo data** label plus disabled mutation controls.

- [ ] **Step 4: Generate docs and run foundational route checks**

Run: `node scripts/generate-route-matrix.mjs && pnpm exec vitest run apps/web/playwright/route-matrix.test.ts && pnpm --dir apps/web test:typecheck`

Expected: PASS and a generated `docs/audit/route-matrix.md` with no historical pass claims embedded in the contract table.

- [ ] **Step 5: Commit**

```bash
git add apps/web/playwright scripts/generate-route-matrix.mjs docs/audit/route-matrix.md
git commit -m "test: make route evidence matrix executable"
```

### Task 0.10: Run the Phase 0 release gate

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `package.json`
- Modify: `apps/web/package.json`
- Create: `scripts/run-policy-tests.mjs`
- Create: `scripts/run-policy-tests.test.mjs`
- Modify: `supabase/config.toml`
- Modify: `docs/ops/launch.md`
- Modify: `supabase/README.md`

**Interfaces:**
- Consumes every Phase 0 contract.
- Produces serialized unit, browser, Supabase, and artifact jobs for later phases.

- [ ] **Step 1: Split unit and browser commands in package scripts**

```json
{
  "scripts": {
    "test:unit": "pnpm exec vitest run",
    "test:rls": "node scripts/run-policy-tests.mjs",
    "test:e2e": "pnpm --dir apps/web test:e2e",
    "test:visual": "pnpm --dir apps/web test:visual",
    "test:a11y": "pnpm --dir apps/web test:a11y",
    "test:perf": "pnpm --dir apps/web test:perf"
  }
}
```

- [ ] **Step 2: Add local Supabase/Auth callback configuration and CI policy execution**

Write `scripts/run-policy-tests.mjs` plus a failing-first discovery/order/zero-files test, then update `supabase/config.toml` with the app’s `3105` callback/return URLs. In CI, pin the CLI, reset the local database, execute every `supabase/policy-tests/*.sql` with `ON_ERROR_STOP=1`, and run DB lint/advisors. The E2E job starts its own local Supabase because jobs do not share services.

- [ ] **Step 3: Run the complete Phase 0 gate serially**

```bash
pnpm repo:safety
pnpm qa:assets
pnpm check:migrations
pnpm lint
pnpm typecheck
pnpm --dir apps/web test:typecheck
pnpm test:unit
pnpm build
pnpm exec supabase db reset
pnpm test:rls
pnpm --dir apps/web exec playwright test \
  playwright/tests/route-normalization.spec.ts \
  playwright/tests/protected-routes.spec.ts \
  playwright/tests/accessibility.spec.ts \
  playwright/tests/mobile-overflow.spec.ts \
  --project=desktop-chrome --project=mobile-chromium
git diff --check
```

Expected: all commands pass. Browser tests run against a fresh build and fresh local database.

- [ ] **Step 4: Record evidence without claiming later-phase readiness**

Update `docs/ops/launch.md` with command, timestamp, commit, environment, pass/fail, artifact path, and the explicit statement that Stripe, AI, messaging, Guide, B2B, console, and configuration flags remain off.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml package.json apps/web/package.json supabase/config.toml \
  scripts/run-policy-tests.mjs scripts/run-policy-tests.test.mjs docs/ops/launch.md supabase/README.md
git commit -m "ci: enforce phase zero release gates"
```

## Phase 0 completion checkpoint

- All ten tasks are committed independently.
- `pnpm repo:safety` confirms no runtime/credential path is tracked.
- A clean database reset and all policy matrices pass.
- Every route is classified; every static redirect has the correct 307/308 behavior.
- Shells render one landmark and truthful anonymous/account navigation.
- The core palette, SVG icon path, accepted phrase, and in-flow phrase rail are available.
- Eight-region asset/content readiness is explicit; Phase 1 starts only after it passes.
- No product/provider flag is enabled by this phase.
