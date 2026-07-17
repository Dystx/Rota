# Plan Audit — Rumia Frontend Corrective Convergence

**Date:** 2026-07-16 · **Verdict:** READY FOR IMPLEMENTATION; FRONTEND ACCEPTANCE REMAINS OPEN

This audit evaluates the single active frontend implementation authority:
`docs/superpowers/plans/2026-07-15-rumia-frontend-finish.md`. It is planning
evidence, not a claim that the frontend, screenshots, or release gates pass.

## Inputs audited

- `docs/superpowers/plans/2026-07-15-rumia-frontend-finish.md`
- `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md`
- `docs/superpowers/PLAN-INDEX.md`
- `apps/web/lib/routes/http-route-catalogue.ts`
- `apps/web/playwright.config.ts`
- `package.json`
- `apps/web/package.json`
- `.github/workflows/ci.yml`
- `CONVENTIONS.md`
- July 16 in-app-browser review findings recorded by the active plan

## Principles alignment

| Check | Status | Note |
| --- | --- | --- |
| Vertical slices | ✅ | Tasks 1–4 are bounded hard-gate foundations; Tasks 5–16 end in user-visible route-family behavior, focused browser proof, and revertible commits. |
| Scope bounded | ✅ | All 53 catalogue entries and supported states are in scope. Product/schema/Auth changes, organization membership, booking, Map Phase 2/3/3D, deployment, and unrelated cleanup are out of scope. |
| Success criteria | ✅ | The plan defines scene, interaction, recovery, access, responsive, accessibility, performance, exact-artifact, and human visual acceptance. |
| Hard gates | ✅ | Foundation, operator-access, non-visual proof, owner snapshot approval, and deferred-map/deployment gates are explicit. |
| Domain language | ✅ | Cover, Atlas, Decision, Utility, chosen day, unavailable, operator, fixture, persona, and scenario have fixed meanings. |

## Conventions completeness

| Check | Status | Note |
| --- | --- | --- |
| Project rules | ✅ | `CONVENTIONS.md` records Portugal-wide/activity-first, VPS, map/list, accessibility, verification, and dirty-worktree constraints. No `AGENTS.md` or `CLAUDE.md` is present. |
| Specs layout | ✅ | `specs/` and `docs/superpowers/specs/` are present; this latest audit is evidence and does not create another implementation queue. |
| Commit convention | ✅ | Every plan task has a scoped Conventional Commit boundary; snapshots and runtime behavior are kept separate. |
| Git workflow | ✅ | Existing-codebase `solo-git` flow on the current branch, with fresh status checks and exact-path staging because the checkout is intentionally dirty. |

## Pre-flight answers

| Question | Value |
| --- | --- |
| Test | `pnpm test:unit`; focused Vitest commands per task; Playwright through the scenario catalogue |
| Build | `pnpm build` exactly once before the final browser runner |
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck && pnpm --dir apps/web test:typecheck` |
| CI | GitHub Actions, `.github/workflows/ci.yml` |
| Workflow | `solo-git`; task-scoped commits; no push, PR, deployment, or snapshot refresh without its explicit gate |
| Stack | TypeScript, Next.js 16 App Router, React 19, Tailwind 4, Motion, Base UI wrappers, Vitest, Playwright, Axe, MapLibre boundaries |
| Repository | Existing pnpm/Turbo monorepo with extensive user-owned dirty changes |

## Adversarial findings closed in this audit

- The executable matrix now separates presentation obligations from concrete
  scenario records. Each scenario carries a stable ID, persona, fixture/setup,
  state, access/transition expectation, and viewport evidence. Static fixtures
  can no longer stand in for paid, reviewed, foreign, unavailable, or
  capability-denied states.
- All 53 source catalogue paths match the 53 route-presentation rows exactly;
  the contract requires exactly one all-four-viewports primary scenario per
  route and desktop/mobile evidence for every edge state.
- Signed-out coverage is required for every protected route. Dynamic and
  trip-query owner routes require foreign-resource non-disclosure scenarios.
- Recovery is content-only inside `AppLayout`; only root-document recovery may
  own `main`. Heading level is explicit, preserving one main and one visible H1.
- Recovery stays in the web/auth boundary. It uses one shared bounded session
  probe and circuit breaker; the plan makes no database package/runtime,
  database schema, Better Auth, commerce API, or saved-day schema change.
- Task 14 enumerates page, API, mutation, and server-action capability guards,
  including Console and specialist actions, with denial-before-store tests and
  sanitized envelopes.
- The four viewport projects move into Task 1, so route-family checkpoints can
  prove their own responsive claims before the final gate.
- The scenario persona union includes the specialist candidate required by
  Guide new/draft/saved fixtures, and Task 1 typechecks both application and
  Playwright contracts before its commit.
- The shared foundation explicitly verifies the three local OFL font families,
  exact four-link/one-CTA public navigation, responsive design/motion tokens,
  and poster-first mobile/WebM media loading, pause, preference, and safe-zone
  behavior.
- Reviewer/admin and Console tasks enumerate exact page, component, API, test,
  and staging paths; broad directory staging is not permitted.
- The final runner builds once, starts one standalone process, runs non-visual
  and visual suites sequentially against one build digest, and verifies process
  teardown.
- Cross-family cleanup occurs before the candidate build, uses an exact
  zero-consumer allowlist and separate runtime commit, and invalidates the
  candidate cycle if a later cleanup becomes necessary.
- Task 1 freezes an exact-current 53-route inventory before route/UI edits: 51
  rendered desktop/mobile pairs, two redirect records, provenance, artifact,
  persona/state, console, landmark, and overflow evidence.
- Pricing retains clearly perceptible static imagery; Itineraries and Vault use
  distinct inverse authored Decision panels for genuine empty states.
- Logistics is explicitly a Decision route because it compares transport and
  route consequences; that documented review-driven choice supersedes its
  earlier generic Utility grouping without enabling booking or map-first work.
- The active product plan now links to the July 15 corrective frontend plan;
  the July 14 frontend queue remains archived evidence only.

## Open implementation and owner gates

- [ ] Execute Tasks 1–17; no task is marked complete by this audit.
- [ ] Reconcile every overlapping dirty file immediately before editing it.
- [ ] Prove all concrete scenarios, access boundaries, and four-viewport route
  primaries against the exact standalone artifact.
- [ ] Obtain explicit owner decisions for all changed desktop/mobile candidates
  before any scoped snapshot update.
- [ ] Keep organization-ready B2B, Map Phase 2/3/3D, and deployment deferred.

## Verdict

**READY FOR IMPLEMENTATION.** The plan is bounded, executable, test-first,
authority-consistent, and explicit about its irreversible or owner-controlled
gates. This does not close visual acceptance or authorize implementation beyond
the listed task boundaries. The recommended next workflow is
`superpowers:subagent-driven-development`, beginning with Task 1 and stopping at
each dependency and review gate.
