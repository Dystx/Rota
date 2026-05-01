# Supabase

This folder now holds the first migration for trip brief persistence.

## Local workflow

Prerequisite: Docker Desktop or a compatible container runtime must be installed and running.

From the repo root:

```bash
npx supabase start
npx supabase db reset
```

Then copy the CLI output into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
SUPABASE_SERVICE_ROLE_KEY=<secret key>
```

Useful local endpoints:

- API: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`
- Postgres: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

## Hosted workflow

If you already have a Supabase project, apply the migrations in this folder to that project and set the same three variables in `.env.local` using your hosted project values.

## Current blocker on this machine

This repo is ready for Supabase, but the local stack cannot be started here until a Docker-compatible runtime is installed and running.
