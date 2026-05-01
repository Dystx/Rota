# Rota

Portugal-first travel planning platform scaffold.

## What this repo includes

- `apps/web`: Next.js App Router web shell with marketing, consumer, reviewer, and admin surfaces.
- `packages/ui`: shared UI primitives and Stitch-aligned design tokens.
- `packages/typescript-config`: shared TypeScript config.
- `docs/design/stitch-design-reference.md`: implementation-facing summary of the current Stitch direction.
- `docs/architecture.md`: scaffold architecture notes plus dependency research updates.
- placeholders for the roadmap packages and future Supabase/scripts work.

## Principles carried into the scaffold

- No generic AI chat UI.
- Web/PWA first.
- Portugal-first content model.
- Consumer, reviewer, and admin route groups from day one.
- Shared UI tokens derived from the current Stitch project, while avoiding over-polished lock-in.

## Quick start

```bash
pnpm install
pnpm dev
```

## Supabase setup

The trip create/read/unlock/review/export flows expect these variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

For local Supabase:

```bash
npx supabase start
npx supabase db reset
```

Then copy the local keys from the CLI output into `.env.local` and restart the app.

If Docker is not installed or not running, local Supabase will not start.

## Admin places API

The first admin place-management API now exists:

- `GET /api/places`
- `POST /api/places`
- `GET /api/places/[placeId]`
- `PATCH /api/places/[placeId]`

These routes use the shared place schema and Supabase-backed db helpers when env is configured. The admin editor still falls back to local-only changes if the API is unavailable.

## Initial route surfaces

- `/` landing page
- `/portugal`
- `/how-it-works`
- `/pricing`
- `/human-review`
- `/trip/new`
- `/trip/[tripId]`
- `/trip/[tripId]/map`
- `/trip/[tripId]/export`
- `/account`
- `/reviewer/queue`
- `/reviewer/profile`
- `/reviewer/history`
- `/reviewer/trips/[tripId]`
- `/admin/places`
- `/admin/countries`
- `/admin/regions`
- `/admin/partners`
- `/admin/reviewers`
- `/admin/quality`
- `/admin/analytics`

## Dependency direction

The roadmap already covers the core stack. After package research, the current stance is:

- add now: `zod`
- add soon: `date-fns`, `tailwind-merge`, `clsx`, `class-variance-authority`
- add with shadcn/ui: `lucide-react`, Radix-based primitives, `react-day-picker`, `@tanstack/react-table`, `cmdk`
- add later only when needed: `motion`, `sonner`, `@tanstack/react-query`, `next-themes`, `recharts`

The next roadmap milestone in code is the structured trip brief, so the first new dependency should be `zod`.
