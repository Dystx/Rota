Implemented legal pages under apps/web/app/(marketing) with locale-aware metadata, localized paths, and translated copy in messages/en.json and messages/pt.json.

Because this repo did not already ship next-intl, I added a minimal local server/middleware shim plus an async footer that reads the current locale and links to /terms, /privacy, and /cookies.
- Admin views currently operate with "no-auth" semantics, unprotected. This is baseline for now.
- 5 admin UI patterns identified: Editor, Table, Summary+Table, Summary+TileQueue, and Metrics+Leaderboard.
- Admin designs will be aligned to existing reviewer and archive compositions (no explicit admin screens in Stitch project).

## Task 22: Redesign `/admin/quality`
- **Consistency**: Implemented the `rota-glass-panel` layout alongside `StatPill` and `Badge` usage to match the `AdminPartnersPage` and `AdminReviewersPage` design systems.
- **Queue Overflow**: Extracted the "key checks" array rendering into a standard Flex/Grid format internally to `<CardContent>` to handle overflow natively (`min-w-0 max-w-full`).
- **Fallback State**: Retained the "No persisted quality flags yet" fallback cleanly mapping inside the grid.
- **Analytics**: Pre/post analytics check was empty; no new `posthog` trackers or analytics hooks were required.
- **Routing/Typecheck**: Confirmed the page retains SSR without breaking existing `db` package abstractions or relying on any user-facing strings of 'Rota'.

## Task 23: Analytics Redesign
- Successfully applied the `rota-glass-panel` and `Card` components to redesign `/admin/analytics`.
- Grouped metrics into a clean responsive grid `grid gap-6 sm:grid-cols-2 lg:grid-cols-4`.
- Wrapped main sections (funnel and partner leaderboard) in `<div className="w-full max-w-full min-w-0">` with `overflow-x-auto` to prevent mobile horizontal scroll overflow.
- Addressed pre-existing TypeScript failures locally; the changes strictly preserve existing data paths without introducing user-facing "Rota" strings.

- Slice 7 admin routes remain reachable as public/no-auth surfaces; the regression sweep confirmed both desktop and mobile widths without overflow.
- A Node Playwright script was more reliable than the flaky browser session for the full route sweep and screenshot capture.
P02: `useReducedMotion` must stay SSR-safe by checking `typeof window !== "undefined"` before `matchMedia`, and the test suite passed with four cases covering false/true/change-event/SSR.
