# Rumia — Master Product Specification v4.0

> **Long-term/historical product vision.** The immediate product contract is
> now Portugal-wide activity curation, not a booking platform or live
> concierge. Use the [activity-first design](superpowers/specs/2026-07-10-rumia-activity-curation-design.md)
> and [latest audit](../specs/PLAN-AUDIT_LATEST.md) for current behavior. The
> tier model below remains a gated future-business vision.

**Core Paradigm**: 4-Tier Ascension Model
**Target Launch Market**: Portugal (Phased Expansion)
**Status**: Supersedes [`docs/spec.md`](./spec.md) (v2.0) and complements [`docs/spec-refined-2026.md`](./spec-refined-2026.md).

---

## 1. The Refined 4-Tier Ascension Funnel

By separating pre-trip curation, live on-trip digital support, and physical on-site guiding, Rumia structures its monetization engine around the exact trajectory of traveler anxiety.

```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│   Level 1: Core AI     │      │  Level 2: Specialist   │      │   Level 3: Full Live   │      │   Level 4: On-Site     │
│        Wrapper         │ ───> │       Curation         │ ───> │     Remote Support     │ ───> │      Real Guide        │
├────────────────────────┤      ├────────────────────────┤      ├────────────────────────┤      ├────────────────────────┤
│ - 100% Algorithmic     │      │ - AI Draft Core        │      │ - 24/7 Live Concierge  │      │ - Physical Matchmaking │
│ - Infinite Plans       │      │ - Human Expert Audit   │      │ - Real-Time Re-routes  │      │ - Local Companionship  │
│ - Instant Optimization │      │ - Async Verification   │      │ - Reservation Handling │      │ - Private Experiences  │
│ - Free Platform Tier   │      │ - Flat Fee Upfront     │      │ - Daily Execution Chat │      │ - High-Premium Billing │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘      └────────────────────────┘
         │                                                                              ▲
         └── Free upsell ──> L2 ── paid pre-trip ──> L3 ── on-trip paid ──> L4 ── premium physical ──┘
```

### Operational & Economic Profile

$$\text{Match Score} = (W_{r} \cdot R) + (W_{e} \cdot E) + (W_{l} \cdot L) + (W_{w} \cdot W)$$

| Metric | Level 1: Core | Level 2: Curation | Level 3: Remote Support | Level 4: On-Site Guide |
|---|---|---|---|---|
| Monetization Model | Free (Ad-hoc Export Fees) | One-time Flat Booking Fee | Daily Rate Subscription / Package | Premium Flat-Day Booking Fee |
| Human Labor Req. | $0 | $15–20 mins asynchronous | On-call rota shifts (concierge) | Direct physical hours on-site |
| Gross Margin Profile | ~95% | ~30% platform take | ~45% platform take | ~20% platform take |
| Platform Scalability | Infinite (Serverless limits) | High (Vetted remote network) | Moderate (Shift-based rotas) | Low (Geographic supply constraint) |
| Key Operational Metric | Map API and token costs | Review turnaround time (SLA) | Mean Response Time (MRT < 5m) | Guide dispatch punctuality rate |

---

## 2. Deep Dive: Tier 3 (Full Remote Support)

Level 3 addresses the acute anxiety of traveling in an unfamiliar country. It transforms the app into an active on-trip digital concierge lifeline.

### The Hybrid Triage Engine

To prevent human operational bottlenecks from destroying margins, the Level 3 chat platform executes a strict Automated Triage Layer before alerting the local human specialist.

```
[ User Message: "Is there parking near our lunch spot?" ]
                        │
                        ▼
         [ Level 3 AI Triage Analysis ]
         (Validates query context vs. database)
                        │
       ┌────────────────┴────────────────┐
       ▼ (Simple/Logistical Data)        ▼ (Taste/Nuance/Urgent Alteration)
[ AI Instantly Replies with Map Pin ]    [ Escalated to Live Local Specialist Rota ]
- "Yes, there is public parking at..."   - "Let me call the restaurant and push..."
```

- **Algorithmic Triage**: Questions regarding parking, opening hours, local train schedules, and basic directions are instantly resolved by the system, referencing the structured database without human intervention.
- **Specialist Escalation**: Nuanced questions ("My kid just got sick, we need a quiet alternative for this afternoon") or urgent transactional actions ("Please change our dinner reservation to 21:00") are instantly routed to the active local specialist on shift.

### The Run-Time Geolocation Buffer

Utilizing the mobile device's live GPS signals, the system detects if the user is falling behind schedule. If the traveler is still at a museum at 14:30 when their next stop is a 45-minute drive away, the system triggers a push notification:

> *"We noticed you're still in Sintra. Tap here to automatically push your Cascais winery booking back by 1 hour."*

---

## 3. Deep Dive: Tier 4 (Real Guide on Site)

Level 4 is the ultimate premium tier. It connects travelers with curated, vetted local guides for physical, private in-person experiences.

### Marketplace Mechanics & Safety Boundaries

Operating a live physical guiding marketplace requires a highly robust operational framework:

- **Regulatory Compliance (Portugal)**: All guides placed on-site must be registered under the Registo Nacional dos Agentes de Animação Turística (**RNAAT**). The platform enforces automated API checks verifying active license credentials during onboarding.
- **Insurance & Liability Protection**: Every Tier 4 transaction is backed by platform-brokered public liability and personal accident insurance layers to cover potential incidents during excursions.
- **Physical Matching Algorithm**: In-person matching extends beyond basic vector interest profiles. The algorithm calculates:
  - **Availability Overlaps**: Checking against active calendars.
  - **Geographic Proximity**: Ensuring the guide's operational PostGIS polygon matches the exact pickup/experience coordinates.
  - **Language Matrix**: Ensuring native fluency matching the traveler profile.

---

## 4. Updated Database Schema Blueprint (v4.0)

This PostgreSQL/PostGIS database schema incorporates tracking tables for Live Execution States, Real-Time Geolocation Log lines, and Level 4 Guide Dispatching. **Builds on** the migration set already shipped in [`supabase/migrations/`](./../supabase/migrations/).

```sql
-- Enable Extensions (already enabled in 202607022000)
-- CREATE EXTENSION IF NOT EXISTS postgis;
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Core Regional Definitions
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) UNIQUE NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    transportation_assumptions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core Places & Restaurants Tables (existing places table; columns from
-- migration 202607022000)
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    opening_hours JSONB,
    average_spend NUMERIC(6,2),
    embedding VECTOR(1536),
    is_tourist_trap BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active User & Trip Planning Tables
CREATE TABLE trip_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    destination_country_id UUID REFERENCES countries(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    travel_pace VARCHAR(50) NOT NULL,
    budget_per_day NUMERIC(6,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID REFERENCES trip_briefs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    tier_level INT DEFAULT 1, -- 1=Free, 2=Curation, 3=Remote Support, 4=On-Site Guide
    current_execution_status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'active_today', 'completed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trip_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    date DATE NOT NULL
);

CREATE TABLE trip_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID REFERENCES trip_days(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE SET NULL,
    arrival_time TIME NOT NULL,
    departure_time TIME NOT NULL,
    sequence_order INT NOT NULL,
    is_reviewed_by_human BOOLEAN DEFAULT FALSE
);

-- Geolocation Log Layer for Live Tracking (Tier 3 Execution)
-- NEW for v4: real-time coordinate stream from mobile companion
CREATE TABLE user_geolocation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX user_geolocation_logs_trip_recorded_idx
  ON public.user_geolocation_logs (trip_id, recorded_at DESC);

-- Level 3 & Level 4 Specialized Specialist Profile Database
-- NEW for v4: unified specialist_profiles replaces separate reviewers/
-- partners; adds tier_3_on_call + tier_4_licensed_guide + RNAAT creds
CREATE TABLE specialist_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    regions_covered UUID[] NOT NULL,
    tier_3_on_call BOOLEAN DEFAULT FALSE,
    tier_4_licensed_guide BOOLEAN DEFAULT FALSE,
    rnaat_license_number VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    hourly_rate NUMERIC(6,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Level 3 Real-time & Asynchronous Messaging Engine
-- UPDATED for v4: service_level distinguishes Tier 2 (pre-trip) vs
-- Tier 3 (active on-trip)
CREATE TABLE chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    assigned_specialist_id UUID REFERENCES specialist_profiles(id),
    service_level INT DEFAULT 2, -- 2=Pre-trip Verification, 3=Active On-Trip Support
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL, -- 'user', 'specialist', 'system_triage'
    message_text TEXT NOT NULL,
    metadata JSONB, -- For passing proposed stop adjustment nodes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Level 4 Physical Booking & Dispatch Tables
-- NEW for v4: replaces guide_bookings + guide_profiles; adds dispatch
-- status state machine + pickup_coordinates PostGIS column
CREATE TABLE guide_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    guide_id UUID REFERENCES specialist_profiles(id) ON DELETE CASCADE,
    execution_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    pickup_coordinates GEOMETRY(Point, 4326) NOT NULL,
    status VARCHAR(50) DEFAULT 'assigned', -- 'assigned', 'guide_en_route', 'active', 'completed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX guide_dispatches_status_date_idx
  ON public.guide_dispatches (status, execution_date);
```

---

## 5. UI & Screen Specifications (Awwwards-Compliant)

Every screen is designed to emphasize visual geography over tech mechanics.

### Page 3.1: Tier 3 Live Concierge HUD (Mobile App View)

- **Aesthetic**: Frost-acrylic navigation cards overlaying a high-contrast satellite view showing the user's real-time coordinate position relative to their schedule.
- **Top Context Pane**: Minimal text indicator: *"Active Now: Day 2 Sintra"* with a secondary running tracker reading: *"Schedule: On Time"*.
- **Chat Box Access Portal**: Slide-up bottom container containing the triage indicator: *"Any questions about your Sintra route today? Ana is active on your thread."*

### Page 4.1: Level 4 Guide Selection Card Component

- **Frame**: Asymmetric layout focusing on editorial imagery over tabular data.
- **Visual Elements**: Large profile photo of the licensed specialist in their destination region.
- **Data Layout**:
  - **Left**: Muted, delicate typography detailing credentials: *Ana • Sintra Expert • License RNAAT #4282*.
  - **Center**: Specific localized experiences highlighted: *[Cascais Coast Exploration], [Private Sintra Forest Paths]*.
  - **Right**: Clear payment node: *€65/hour • Secure with Stripe*.

The reference prototype at [`docs/prototype.html`](./prototype.html) demonstrates the editorial glass-morphism vocabulary: frosted glass cards on hero imagery, Playfair Display + Inter typography, olive + ochre + cream + sage palette. The legacy public `/prototype.html` path redirects to the live app.

---

## 6. Phased Engineering Strategy

```
Phase 1: Foundations   ──>  Phase 2: AI Pipeline   ──>  Phase 3: L2 Curation   ──>  Phase 4: L3 Concierge   ──>  Phase 5: L4 Marketplace
(PostGIS/Vector Setup)    (Zod JSON Outputs)           (Reviewer Workbench)        (Triage Chat Systems)         (Physical Dispatch)
```

- **Phase 1–3**: Stand up the Core AI Wrapper (Tier 1) and the Tier 2 pre-trip human curation dashboard. Verify the database schemas and indexing structures.
- **Phase 4**: Tier 3 Concierge Execution: WebSocket-based chat infrastructure, automated database triage filters, background location-tracking listener on the mobile companion application.
- **Phase 5**: Tier 4 Physical Marketplace: Physical dispatch engine, verification workflows for professional guides, liability protection hooks, real-time appointment confirmations.

---

## 7. Core Structural Impact

- **The Operational Shield**: By establishing Tier 3 as a remote support layer first, Rumia acts as an online digital agency. This shields the platform from immediate physical guiding overhead and local transportation licensing loops during the critical initial launch window in Portugal.
- **Scale-Optimized Margins**: Tier 3 leverages remote shift rotas. A single specialist on call can manage 15 to 20 active traveling groups simultaneously, generating high gross margins.
- **Ascension Intent**: Tier 1 captures traveler intent, Tier 2 validates schedule layout, Tier 3 anchors on-trip safety, Tier 4 monetizes high-end personalized luxury.

This system is completely scalable, highly optimized, and ready to be integrated straight into the development stack or mock layout generator.

---

## 8. Cross-References

- [`docs/spec.md`](./spec.md) — v2.0 spec (long-term product vision, 3 tiers)
- [`docs/spec-refined-2026.md`](./spec-refined-2026.md) — Tier 1+2-only refined scope
- [`docs/prototype.html`](./prototype.html) — React SPA prototype (visual identity + route map)
- [`docs/prototype-routes.md`](./prototype-routes.md) — prototype route mapping
- [`docs/design-tokens-olive-ochre.css`](./design-tokens-olive-ochre.css) — v4 `@theme` tokens (reference)
- [`docs/roadmap.md`](./roadmap.md) — operational roadmap (aligned with v4 phases)
