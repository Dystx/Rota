# Cinematic Redesign B — Decisions

## [2026-05-05] Architecture Decisions (from plan)
- mapbox-gl@^3 direct (no react-map-gl)
- In-memory memo cache keyed by sha1(canonicalize(TripBrief))
- No DB migration — coords derived at render time only
- LazyMotion + m.* from motion/react-m (not motion/react motion.div)
- IntersectionObserver lazy-mount for map
- Static Images API placeholder for initial paint
- Kill switch at 75k map loads/month, alert at 40k

## [2026-05-05] T05 implementation notes
- Camera helpers remain pure and package-local.
- Cross-region flights use longer duration and wider curve once Haversine distance exceeds 200km.


## T03 geocoding analytics identity
- Geocode completion analytics uses a stable briefCacheKey-derived trip id because TripBrief has no persisted id at enrichment time.
