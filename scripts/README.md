# Scripts

## PostgreSQL migrations

- `pnpm db:generate` generates a candidate Drizzle migration from `packages/db/src/schema/`.
- `pnpm db:migrate` applies the checked-in forward-only migrations using the server-only `DATABASE_URL`.
- `RUMIA_ALLOW_DB_RESET=1 pnpm db:reset` destroys and recreates schemas only on a loopback database. It refuses a non-local host.

The development database mirrors the VPS extensions: PostGIS, `pg_trgm`, pgvector, and `pgcrypto`. Historical hosted migrations are rollback evidence only; all new work uses Drizzle migrations.

Planned for Portugal seed imports, embeddings generation, and place validation scripts.

## Local Better Auth personas

`seed-local-personas.mjs` creates or updates deterministic non-production auth users and trusted role/profile rows for local testing:

- `traveler@example.com` -> `traveler`
- `reviewer@example.com` -> `reviewer`, linked to reviewer id `ines-almeida`
- `admin@example.com` -> `admin`
- `outsider@example.com` -> `none`

The script intentionally does not contain passwords. Provide local throwaway passwords through untracked environment variables before running it:

```bash
export ROTA_TRAVELER_PASSWORD='local-only-password'
export ROTA_REVIEWER_PASSWORD='local-only-password'
export ROTA_ADMIN_PASSWORD='local-only-password'
export ROTA_OUTSIDER_PASSWORD='local-only-password'
node scripts/seed-local-personas.mjs
```

It requires the server-only `RUMIA_OWNER_DATABASE_URL` in the local shell. Never commit real credentials or print database credentials in evidence.
