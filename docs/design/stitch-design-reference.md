# Stitch design reference

Derived from the current Stitch project **Rota: Portugal Travel Concierge** (`projects/10857043349147902133`) and the roadmap's handoff rules.

## Product mood

- calm, trustworthy, premium editorial travel product
- local-host tone instead of AI assistant personality
- cinematic but restrained
- map-friendly and card-based

## Current visual direction

Observed from the Stitch project screens:

- `Rota — Your Portugal Journey (Refined)`
- `Rota — Five Days in Porto & Douro`
- `Rota — Expert Reviewer Workspace`
- `Rota — Your Plan Audit`
- `Rota — Polish Your Plan`
- `Rota — Your Polished Journey is Ready`
- `Rota — Curated Portugal Archive`

## Typography direction

- display / storytelling: **Noto Serif**
- utility / body copy: **Inter**
- strong serif headlines with airy line-height
- compact uppercase metadata labels

## Color palette direction

Based on the Stitch design system currently attached to the project:

- background / paper: `#f7faf9`
- foreground ink: `#181c1c`
- secondary Atlantic tone: `#306576`
- accent aqua: `#b3e8fb`
- muted surface: `#ebeeed`

## Spacing rules

- generous whitespace
- large sectional rhythm
- large rounded cards for focused content
- wide layout shell with map-first panels where useful

## Card and surface style

- soft glass or paper-like surfaces over light backgrounds
- subtle borders over heavy shadows
- rounded cards with calm elevation
- content grouped into editorial blocks, not dense dashboards

## Button style

- dark ink primary action on light surface
- ghost secondary actions with border emphasis
- avoid loud gradients or neon accents

## Map layout style

- large map panel with route emphasis
- contextual notes and controls beside the map
- overlays should feel calm and legible, not tool-heavy

## Screen mapping to this scaffold

### Consumer web app

- landing page → `apps/web/app/(marketing)/page.tsx`
- Portugal destination page → `apps/web/app/(marketing)/portugal/page.tsx`
- trip brief page → `apps/web/app/(app)/trip/new/page.tsx`
- generated route overview → `apps/web/app/(app)/trip/[tripId]/page.tsx`
- map route view → `apps/web/app/(app)/trip/[tripId]/map/page.tsx`
- account / saved trips → `apps/web/app/(app)/account/page.tsx`

### Reviewer dashboard

- review queue → `apps/web/app/(reviewer)/reviewer/queue/page.tsx`
- trip review detail / map editor shell → `apps/web/app/(reviewer)/reviewer/trips/[tripId]/page.tsx`

### Admin dashboard

- places database → `apps/web/app/(admin)/admin/places/page.tsx`
- country config page → `apps/web/app/(admin)/admin/countries/page.tsx`

## Hard implementation rules from roadmap

- no generic AI chat UI
- use structured question cards instead of message threads
- keep visual decisions calm and replaceable until later design refinement
- keep consumer, reviewer, and admin surfaces distinct
