## Task 8 review remediation

- RED (initial review): incomplete planner query values could render an unrepairable review; missing review fields had no controls; refine section did not edit payload values; API field errors were dropped.
- GREEN: query parsing now requires `TripBriefSchema.safeParse` and falls back to the manual form; every required review value has a visible row and `OptionSheet` (including dates, travelers, traveler type, budget, and raw context); refinement controls update food preferences, avoidances, accommodation, and raw brief; API `errors` and `fieldErrors` are surfaced.
- Verification: `pnpm --filter web exec vitest run 'app/(app)/trip/new/trip-brief-review.test.tsx'` PASS; `pnpm --filter web typecheck` PASS.
