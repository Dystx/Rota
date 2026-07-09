# Task 10 report — synchronized trip detail, map, and stop selection

Implemented owner-scoped trip context, day selection, map/list synchronization, and truthful route states. The detail page now renders the shared `TripContextBar`, day tabs, a mobile snap filmstrip with agenda/list equivalents, and map filter chips with an accessible stop list. Stop selection updates `useMapStore` and uses `runViewTransition` to focus the map when supported.

Verification:

- `pnpm vitest run --config vitest.config.ts 'apps/web/app/(app)/trip/[tripId]/_components/trip-route-sync.test.tsx'` — PASS (3 tests)
- `pnpm --filter web typecheck` — PASS

Review follow-up:

- Query-selected days now initialize the cinematic map chapter and stop list (including the 1-based day label).
- Generation failures, empty day payloads, and ready itineraries render distinct truthful states; failures retain trip context and expose a retry action.
- Context-bar edits route to a field-specific planner editor, and map filters/stop equivalents are keyboard-usable on mobile and desktop.
- Re-ran the focused route-sync tests and web typecheck after these fixes — PASS.
- Final review fixes: `?edit=` is parsed by the planner and opens the matching editor sheet; map filter chips now expose stateful menus; selected days without geocoded stops retain their day label/list and show an explicit no-map-stops message.

Final review follow-up:

- Map chapter/list stop IDs now consistently use `day-${day}-stop-${index}`, so selecting either surface highlights the same source stop.
- Explicit unresolved day selections retain their day label and expose the no-map-stops state via a tested status component; transport and layer chips are explicit menu controls with observable expanded/selection state.
- Verification: focused route-sync tests — PASS (6 tests); `pnpm --filter web typecheck` — PASS; `pnpm lint` — PASS.
