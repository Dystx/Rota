# Rota Stitch & Roadmap Completion — Decisions

## [2026-05-01] Baseline commit created
- `bc49989` is the plan start ref.
- All changes will be diffed against this commit.

## [2026-05-01] No commits in repo initially
- Created initial commit to establish baseline.
- This means `git diff bc49989...HEAD` will show all plan work.

## [2026-05-01] Verification-only path used
- No app files were modified.
- Captured browser/runtime evidence only; no routing bugfix was needed for the checked scenarios.
## [2026-05-01] Slice 6 verification completed
- Verified the reviewer queue, trip detail, history, profile, and operations routes against the live :3010 production server.
- Marked the reviewer workspace rollout complete in `docs/roadmap.md` with refs `bf415da`, `fab3c54`, `2e348b6`, `803d810`, and `a2499d1`.
- Kept the roadmap edit scoped to the Stitch implementation order block only.

## [2026-05-01] Slice 7 admin verification completed
- Re-ran the admin QA sweep for `/admin/places`, `/admin/countries`, `/admin/regions`, `/admin/partners`, `/admin/reviewers`, `/admin/quality`, and `/admin/analytics` against `http://localhost:3010`.
- Confirmed `/admin/places` and `/admin/analytics` stayed on their exact pathnames with HTTP 200 and no redirect/auth errors.
- Updated only the Stitch implementation order block in `docs/roadmap.md` to mark Slice 7 complete.
* Added `StopWithCoords` as an intersection helper over the inferred stop type so runtime schema and compile-time narrowing stay aligned.
## [2026-05-05] Mapbox budget gate contract
- Budget source is `apps/web/.budget.json` with `{ "mapboxGlGzipKb": 850 }`.
- The CI gate exits `0` for OK, `1` for budget overage, and `2` when the build manifest is missing.
- Evidence is captured with temp-root fixtures so the gate can be tested without a real Next build.
