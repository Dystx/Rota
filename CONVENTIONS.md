# Rumia engineering conventions

These rules apply to the active Rumia worktree until a more specific package
rule is added.

## Product boundaries

- Rumia is activity-first and Portugal-wide: help a traveller decide what is
  worth doing with limited time.
- Do not turn the public experience into a booking platform, accommodation
  search, travel agency, or chatbot.
- Lists and semantic fallbacks are authoritative. Maps are progressive
  enhancement and may never hide an activity decision or invent route truth.

## Runtime and data

- Production direction is VPS-native Better Auth, private PostgreSQL/PostGIS,
  and server-only Drizzle repositories. The browser never connects to SQL.
- The hosted Supabase project is rollback evidence only; do not add new feature
  work, runtime dependencies, or deployment instructions for it.
- Lumes shares the VPS. Never change its service, port 3001, or Caddy route in
  a Rumia change.
- MapLibre is the renderer boundary. A basemap, route, glyph, sprite, terrain,
  and attribution license must be recorded before the relevant feature flag is
  enabled.

## UI and accessibility

- Use the shared SVG `Icon` component; do not add icon-font ligatures or
  literal icon text.
- Preserve the linen/olive/ochre editorial tokens and semantic heading order.
- Every route has one meaningful `main` and visible `h1`, keyboard-complete
  controls, reduced-motion behavior, and a usable list/static/error fallback.
- Keep mobile controls within the viewport and provide 44px targets where
  practical. Do not let fixed trays obscure activity content.

## Verification

- Before handoff, run the proportionate unit, typecheck, lint, build, browser,
  accessibility, performance, migration, and sensitive-path gates.
- Treat browser warnings, stale screenshots, missing auth markers, or skipped
  states as incomplete evidence rather than green results.
- Use `apply_patch` for source/doc edits; preserve unrelated dirty changes and
  never reset or clean the worktree as part of a Rumia task.
