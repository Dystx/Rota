# Task 12 report — traveler utility routes

Status: DONE_WITH_CONCERNS

## Implementation

- Kept Itineraries, Vault, and Account on distinct route contracts with stable
  `itineraries-archive`, `vault-assets`, and `account-settings` markers.
- Preserved the archive search/filter and export-drawer task in Itineraries,
  asset/status/download behavior in Vault, and identity/preferences/saved-work
  hierarchy in Account.
- Kept no-trip checkout at one truthful saved-day decision panel with no
  package selector.
- Added an owned paid-trip checkout state that shows the saved-day summary and
  one `Open your day` handoff without a package selector or unlock form.

## Verification

- Focused Task 12 Vitest — PASS, 8 files / 22 tests.
- `corepack pnpm --dir apps/web typecheck` — PASS.
- `corepack pnpm lint:eslint` — PASS.
- `git diff --check` — PASS.
- In-app browser: `/vault` rendered the `vault-assets` route boundary and
  `/checkout` rendered the no-trip decision state with no package selector.

## Browser concern

- The focused Playwright traveler slice still requires the standalone web
  server/build database environment; local PostgreSQL is not listening on
  `127.0.0.1:5432`. Public browser proof is complete, while authenticated
  populated/paid traveler proof remains open for Task 17.

## Dirty-boundary notes

Only Task 12 utility-route paths and the directly related route-contract tests
were staged. Existing account consent, unrelated routes, snapshots, docs,
database, and deployment changes remain unstaged.
