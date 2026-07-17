# Rumia — Master Product Specification & Architecture Blueprint

> **Historical product specification.** This itinerary/tier blueprint is not
> current execution authority. The active product contract is the
> [Portugal-wide activity-first plan](superpowers/plans/2026-07-10-rumia-activity-first-master.md),
> and current frontend work is the
> [visual completion plan](superpowers/plans/2026-07-14-rumia-frontend-polish.md).

**Version**: 2.0 (Integrated Tiered Service Model)
**Target Launch Market**: Portugal (Phased Expansion)

---

## 1. Executive Summary & Market Positioning

Rumia is an AI-powered travel planning platform designed to eliminate the multi-tab friction of modern travel research. By shifting the paradigm away from text-heavy AI chatbots and toward a premium, structured user interface, Rumia acts as a quiet orchestration engine. It synthesizes local destination graphs, spatial routing logic, and human curation into a unified, high-integrity itinerary.

### The Value Proposition

- **Plan Less. Experience More**: Consolidates hours of fragmented research (Blogs, Reddit, Maps, TikTok) into a single, cohesive interface.
- **Invisible AI**: Replaces chat boxes and text prompts with elegant UI inputs, structured question cards, and direct configuration handles.
- **The Trust Moat**: Fuses algorithmic speed with verified local human expertise to guarantee accurate, hyper-vetted travel logistics.

### The Product Ascension Funnel

Rumia avoids flat consumer subscription models, monetizing instead through an intentional three-tiered product ecosystem:

```
[ Level 1: Core AI Engine ]  ──(Upsell)──>  [ Level 2: Hybrid Specialist ]  ──(Upsell)──>  [ Level 3: In-Person Guide ]
    - 100% Automated                              - Algorithmic Blueprint                       - Live Local Guide
    - Instant Generation                          - Human Review & Curation                     - Private Experiences
    - Route Optimized                             - Asynchronous Live Chat                      - Premium Concierge
```

---

## 2. Tier Architecture & Operational Mechanics

### Level 1: Core (Automated AI Engine)

- **User Experience**: The user inputs a structured trip description. The system executes a retrieval-augmented generation (RAG) pipeline to build a day-by-day itinerary complete with maps, route optimization, and opening hour validation.
- **Monetization**: Free to generate. Monetized via Premium Exports (PDF, Calendar, offline maps), affiliate bookings, and destination packs.

### Level 2: Medium (Hybrid Specialist Review + Chat)

- **User Experience**: Users purchase a premium review. A local travel expert uses a dedicated dashboard to inspect, edit, and optimize the generated itinerary. Unlocks an asynchronous, in-app chat lifeline with the specialist for on-trip adjustments.
- **Operational Control**: To preserve unit economics, the chat interface is strictly scoped as asynchronous (e.g., maximum 4-hour response window during local business hours) and limited to itinerary modifications. Simple operational questions are triaged by the AI before escalating to the specialist.

### Level 3: Premium (Presencial Guided Experience)

- **User Experience**: Connects travelers with physical, licensed tour guides and local experts for real-world, private guided days and curated field experiences.
- **Operational Control**: Functions as a highly vetted marketplace. Requires strict compliance with local regulatory frameworks (e.g., Registo Nacional dos Agentes de Animação Turística — RNAAT in Portugal) to manage physical liabilities, insurance, and guide dispatching scheduling.

---

## 3. Technology Stack

| Layer | Technology Selected | Strategic Purpose |
|---|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui | Server-side rendering for SEO, unified component library, ultra-premium design language. |
| Mobile App | Expo, React Native | Cross-platform native compilation for offline itinerary viewing and on-trip geolocation tracking. |
| Backend | Next.js Route Handlers, Supabase Edge Functions | Edge-computed API architecture for rapid JSON parsing and database interaction. |
| Database | PostgreSQL, PostGIS, pgvector | Combined relational data consistency, geographic distance calculations, and semantic place vector embedding searches. |
| AI Layer | OpenAI API, Zod Validation | Hard-structured JSON outputs mapped directly against interface schemas via strict Zod validation pipelines. |
| Mapping Engine | Mapbox (Future: Google Routes, OSRM) | Highly aesthetic, custom-styled map-first interfaces with turn-by-turn route bounding. |
| Infrastructure | Stripe (Payments), Resend (Transactional Email), Sentry, PostHog | Infrastructure suite for international payment processing, usage tracking, and error observability. |

---

## 4. Core AI Pipeline & Architecture

The AI layer explicitly avoids generative freedom to prevent hallucinations. Every itinerary follows a deterministic pipeline before being displayed to the user:

```
[ User Trip Brief ]
       │
       ▼
[ Step 1: Normalization Engine ] ───> Extracts Dates, Budgets, Pace, & Preferences into JSON
       │
       ▼
[ Step 2: Semantic Retrieval ]   ───> Queries vector database via pgvector for matching Places/Restaurants
       │
       ▼
[ Step 3: Spatial Filtering ]    ───> Filters retrieved nodes via PostGIS for realistic transit boundaries
       │
       ▼
[ Step 4: Logic Validation ]    ───> Validates opening hours, seasonal availability, and travel times
       │
       ▼
[ Step 5: JSON Schema Render ]   ───> Outputs full UI-ready JSON validated via Zod
```

### The Invisible AI UI Controls

Instead of text prompts, users refine their itineraries through structured UI interactions:

- **Make it more relaxed** → Triggers backend logic to cap daily activity counts and widen travel time buffers.
- **Replace this stop** → Drops the place node from the itinerary matrix and re-runs the pgvector semantic search for alternative locations within the same PostGIS polygon.

---

## 5. Relational Database Schema Blueprint

The database is built on PostgreSQL, utilizing PostGIS for location coordinates and pgvector for semantic embeddings of places and restaurants.

```sql
-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Core Geographic Entities
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) UNIQUE NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    transportation_assumptions JSONB,
    cultural_rules TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Knowledge Graph Nodes (Places & Restaurants)
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'attraction', 'beach', 'museum', 'viewpoint'
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    opening_hours JSONB,
    average_spend NUMERIC(6,2),
    embedding VECTOR(1536), -- OpenAI embedding vector for semantic search
    local_notes TEXT,
    is_tourist_trap BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cuisine_type VARCHAR(100)[],
    price_tier VARCHAR(4), -- '€', '€€', '€€€', '€€€€'
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    opening_hours JSONB,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Core Trip Engines
CREATE TABLE trip_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    destination_country_id UUID REFERENCES countries(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    traveler_count INT DEFAULT 1,
    budget_per_day NUMERIC(6,2) NOT NULL,
    travel_pace VARCHAR(50) NOT NULL, -- 'relaxed', 'balanced', 'packed'
    interests VARCHAR(100)[],
    raw_input TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID REFERENCES trip_briefs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    tier_level INT DEFAULT 1, -- 1 = AI, 2 = Specialist Hybrid, 3 = Presencial Guide
    is_published BOOLEAN DEFAULT FALSE,
    quality_score NUMERIC(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trip_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    date DATE NOT NULL,
    weather_consideration JSONB
);

CREATE TABLE trip_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID REFERENCES trip_days(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE SET NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
    arrival_time TIME NOT NULL,
    departure_time TIME NOT NULL,
    sequence_order INT NOT NULL,
    ai_explanation TEXT,
    reviewer_notes TEXT,
    is_reviewed_by_human BOOLEAN DEFAULT FALSE
);

-- 4. Level 2 Chat Engine
CREATE TABLE chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL, -- 'user', 'specialist', 'ai_triage'
    message_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Level 3 Guide Engine
CREATE TABLE guide_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    regions_covered UUID[] NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    hourly_rate NUMERIC(6,2) NOT NULL
);

CREATE TABLE guide_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id),
    guide_id UUID REFERENCES guide_profiles(id),
    booking_date DATE NOT NULL,
    duration_hours INT NOT NULL,
    total_price NUMERIC(8,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' -- 'pending', 'confirmed', 'completed', 'cancelled'
);
```

---

## 6. Phased Development Roadmap

```
├─ Phase 1: Foundation (Infrastructure, Auth, Core Schemas, Monorepo Setup)
├─ Phase 2: Portugal MVP (Knowledge Graph Seeding, PostGIS/Vector Setup, Basic AI Itineraries)
├─ Phase 3: AI Planning Engine (Trip Brief Normalization, Smart Cards, Custom Layout Engine)
├─ Phase 4: Premium Monetization (Stripe Infrastructure, PDF/Calendar Export Engines)
├─ Phase 5: Level 2 Hybrid System (Reviewer Dashboard, Asynchronous Triage Chat System)
├─ Phase 6: Level 3 Marketplace (Guide Onboarding, Verification Logic, Dynamic Dispatch)
├─ Phase 7: Mobile Experience (React Native Companion App, Offline Synchronizer)
└─ Phase 8: International Expansion (Modular Porting to Spain, Italy, France, Greece, Japan)
```

---

## 7. Critical Verification Checks Prior to Next Steps

- **Knowledge Graph Seeding**: Ensure that vector space attributes adequately capture contextual descriptions (e.g., separating "seafood spots with sunset views" from "traditional tascas").
- **Reviewer Dashboard SLAs**: The Level 2 specialist dashboard must display calculated route timelines clearly so human operators can spot logistics and pacing friction in under two minutes.
- **Regulatory Auditing**: Confirm Portugal's RNAAT legal requirements for Level 3 marketplace contractors before deploying the local guide matching engine.
