# Scripts

Planned for Portugal seed imports, embeddings generation, and place validation scripts.

## Local Supabase personas

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

It requires `NEXT_PUBLIC_SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY` in the local shell. Never commit real credentials or print service keys in evidence.
