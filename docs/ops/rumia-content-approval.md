# Rumia Portugal activity corpus approval

**Status:** owner sign-off required before public map enablement
**Current seed:** 30 reviewed records, six each for Porto, Lisbon, Douro,
Algarve, and the Azores (`apps/web/lib/content/activities.ts`)
**Last seed review recorded in code:** 2026-07-10

The automated structural contract in
`apps/web/lib/content/activities.test.ts` now verifies unique IDs, all five
seed regions with at least six records each, non-empty judgement/practical
fields, reviewed status/date, HTTPS evidence URLs, and valid alternative
references. Passing that test is necessary but does not replace the owner's
editorial coverage and freshness sign-off.

On 2026-07-12, a read-only reachability check followed every unique evidence
URL in the seed; all 16 unique URLs returned HTTP 200 after redirects. This
confirms link availability only. It does not confirm that each source still
supports every changeable fact or that Portugal-wide coverage is sufficient.

Portugal-wide coverage remains the product scope. The current seed proves the
activity-card contract and gives the UI deterministic content; it is not a
claim that every Portuguese region or activity category is already covered.
The map and any route-storytelling feature must remain disabled until the
owner approves the corpus coverage and freshness policy below.

## Publication requirements

Every public activity record must have:

- a stable `id` and `placeId`;
- a Portugal region and human-readable title;
- a direct Rumia verdict, including a caveat when the activity is conditional;
- `bestFor`, realistic duration, best time, weather fit, effort/accessibility
  notes, and booking/preparation requirements;
- at least one nearby pairing or an explicit reason why no pairing is safe;
- an alternative when a sensible substitute exists;
- `editorialStatus: reviewed`;
- a `reviewedAt` date and a source URL;
- no fabricated ratings, availability, prices, reviewer identities, or
  personal-review claims.

The source grounds changeable facts. It does not turn the source into a Rumia
endorsement, paid placement, or copied review. Rumia's judgement must remain
separately authored and visibly attributable to the product's editorial
standard.

## Source hierarchy

Use sources in this order, retaining the URL and date checked:

1. official attraction, museum, park, municipality, transit, or tourism body;
2. official operator or venue page for opening, booking, access, and closure
   facts;
3. a reputable local source only when an official source does not cover the
   practical detail;
4. never a scraped review score or an unverified social post as the sole source.

## Freshness policy

The next corpus migration should store `sourceCheckedAt` separately from the
editorial writing date. Until that field exists, `reviewedAt` is the minimum
freshness signal and the record must be re-reviewed before its deadline:

| Fact type | Maximum age before re-review |
| --- | ---: |
| opening hours, booking, admission, transport, closure, or access | 14 days |
| restaurants, events, programmes, or seasonal availability | 30 days |
| trails, beaches, weather-sensitive outdoor access | 60 days |
| museums, landmarks, neighbourhood walks, and stable cultural context | 90 days |
| legal, safety, or public-transport disruption | immediately when changed |

Expired records are removed from public results or marked `provider_unavailable`;
they are never silently shown as current. A missing source or uncertain fact
produces a caveat or exclusion, not invented precision.

## Owner sign-off checklist

- [ ] Coverage is sufficient for the intended Portugal-wide launch slice.
- [ ] Each public record has a current source and checked date.
- [ ] Seasonal and accessibility caveats have been reviewed.
- [ ] No record implies booking, availability, or personal human review that
  did not occur.
- [ ] The owner accepts the freshness intervals above.
- [ ] The first map-enabled release names the exact approved corpus revision.

Until these boxes are checked, the generated activity list may be used for
local UI validation, but the optional activity map remains a feature-flagged
preview and not a production promise.
