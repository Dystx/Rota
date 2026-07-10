# Supabase

This folder holds the local Supabase configuration and migrations for Rota persistence, role/profile mapping, and traveler ownership prerequisites.

## Local workflow

Prerequisite: Docker Desktop or a compatible container runtime must be installed and running.

From the repo root:

```bash
pnpm exec supabase start
pnpm exec supabase db reset
```

Then copy the CLI output into `.env.local`. This file is ignored by git because the service key is server-only secret material:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
SUPABASE_SERVICE_ROLE_KEY=<server-only service_role/secret key>
```

Useful local endpoints:

- API: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`
- Postgres: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

## Hosted workflow

If you already have a Supabase project, apply the migrations in this folder to that project and set the same three variables in `.env.local` using your hosted project values. Prefer a current `sb_secret_...` key for backend code when available; never expose it through `NEXT_PUBLIC_*`, client components, browser headers, docs, or committed files.

If a hosted service-role or secret key was exposed, rotate it before production from **Supabase Dashboard → Project Settings → API Keys**. Create a replacement secret key, update backend/runtime secret stores, verify the app boots, then delete the exposed key. Record only timestamps/key labels in evidence, never the key value.

### Linked-project release gate

The project is linked through the CLI. Before enabling a live data feature, run:

```bash
pnpm exec supabase migration list --linked
pnpm exec supabase db advisors --linked --type security --level warn --fail-on error
```

Migration history must be in parity. The security advisor currently reports a
managed-PostGIS finding for `public.spatial_ref_sys`: the extension was
historically installed in `public`, and the migration role is not allowed to
alter that extension-owned table. Do **not** bypass this by editing Supabase
internal ownership or by forcing a broad table policy. Resolve it in a tested
infrastructure change by moving/reinstalling PostGIS into a dedicated schema
through the Supabase Dashboard/support path, then re-run the advisor. This
also removes the related `extension_in_public` warnings. The same review
should cover `vector` and `pg_trgm`, which were also installed in `public`.
Enable Auth leaked-password protection in **Dashboard → Authentication →
Security** before public sign-up is enabled; the advisor reports it when the
setting is off.

## Trusted roles and local personas

Application roles are trusted only from server-owned public tables:

- `public.user_profiles.app_role`: `traveler`, `reviewer`, `admin`, or `none`
- `public.reviewer_auth_links`: maps an auth user to a reviewer row such as local test reviewer `ines-almeida`
- `public.trip_briefs.owner_user_id` and `public.trips.owner_user_id`: traveler ownership prerequisites for future RLS policies

Do not authorize from JWT metadata, `auth.users.raw_user_meta_data`, client-provided `user_metadata`, form fields, cookies, or localStorage. User metadata is acceptable for display-only profile details, but not for role decisions.

Run the policy contracts after a reset:

```bash
pnpm test:rls
```

For deterministic local testing, run the local persona script after `npx supabase db reset` and after exporting local-only throwaway passwords:

```bash
export ROTA_TRAVELER_PASSWORD='local-only-password'
export ROTA_REVIEWER_PASSWORD='local-only-password'
export ROTA_ADMIN_PASSWORD='local-only-password'
export ROTA_OUTSIDER_PASSWORD='local-only-password'
node scripts/seed-local-personas.mjs
```

The script creates or updates `traveler@example.com`, `reviewer@example.com`, `admin@example.com`, and `outsider@example.com`, writes trusted app metadata roles, upserts `public.user_profiles`, and links the reviewer persona to `public.reviewers.id = 'ines-almeida'`. No real credentials, provider keys, JWTs, or `.env.local` values should be committed or copied into evidence.

## Current blocker on this machine

This repo is ready for Supabase, but the local stack cannot be started here until a Docker-compatible runtime is installed and running.
