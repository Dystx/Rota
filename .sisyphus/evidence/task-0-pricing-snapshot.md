# T00 Mapbox pricing snapshot

Date: 2026-05-05

## Confirmed from Mapbox pricing/docs

- Mapbox GL JS v1.0.0+ is billed by **Map Loads for Web**.
- A map load occurs whenever a Mapbox GL JS `Map` object is initialized on a webpage; interactivity after initialization does not add more map-load charges within the session.
- Maximum session length for one map load is 12 hours; a still-open map after 12 hours counts as a new map-load session.
- Current Mapbox pricing page lists Mapbox GL JS free tier as **up to 50,000 map loads/month**.
- Current Mapbox pricing page lists Mapbox GL JS overage tiers:
  - 50,001–100,000: **$5.00 per 1,000** map loads
  - 100,001–200,000: **$4.00 per 1,000** map loads
  - 200,001+: **$3.00 per 1,000** map loads
  - 1,000,000+: contact sales for discount
- Static Images API quota: **free up to 50,000 requests/month**.
- Static Images API overage starts at **$1.00 per 1,000 requests**, with discounted tiers noted over 500K, 1M, and 5M requests/month.

## Sources

- https://www.mapbox.com/pricing
- https://docs.mapbox.com/help/glossary/map-loads/
- https://www.mapbox.com/static-maps
- https://docs.mapbox.com/api/maps/static-images/

Pricing can change; re-check before production launch or budget commitments.
