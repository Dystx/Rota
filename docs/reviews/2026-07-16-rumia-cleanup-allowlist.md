# Rumia frontend cleanup allowlist

Date: 2026-07-16
Task: 17 — exact-artifact acceptance

Status: the only provably superseded acceptance file was migrated and removed. No runtime component was deleted in this task.

| Exact file or selector | Current owner | Zero-consumer proof | Dirty-diff decision | Deletion result |
| --- | --- | --- | --- | --- |
| `apps/web/playwright/tests/catalogue-visual.spec.ts` (whole file) | Task 17 route-scene and manifest visual suites | `rg -n "catalogue-visual|@catalogue visual coverage" apps/web/playwright --glob '*.{ts,tsx,md}'` returns no matches after the assertions were moved to `route-scenes.spec.ts` and `visual.spec.ts`; the remaining plan references are historical instructions only | The file was tracked and clean before this task; deletion is limited to this exact acceptance file and does not overlap the unrelated dirty runtime tree | Deleted with `apply_patch` after migrating scene, legal geometry, feedback, reviewer, logistics, fixture-marker, and filtered-empty assertions |
| `FALLBACK_ITEMS` selector | Task 16 console pipeline | `rg -n "FALLBACK_ITEMS|sample.*pipeline|Demo pipeline" apps/web/app/console apps/web/app/api/console --glob '*.{ts,tsx}'` returns no matches | Already removed and committed by Task 16; no Task 17 deletion permitted | No-op |
| `DAYS` fixture records selector | Task 16 console messages | `rg -n "DAYS|Ada Lovelace|Mara Silva|sample conversation" apps/web/app/console/messages --glob '*.{ts,tsx}'` returns no fixture records; the empty source is still consumed by the route | Consumer remains (`DAYS` is the truthful empty-state source); not a deletion candidate | No-op |

The acceptance build was frozen only after this allowlist decision. No broad directory cleanup, runtime template removal, or snapshot deletion is authorized by this document.
