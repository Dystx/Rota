# packages/config

Shared app-level configuration surface for typed environment parsing.

## Entry points

- `@repo/config`: public/shared config API surface
- `@repo/config/public`: browser-safe public config factory
- `@repo/config/server`: server-only secrets plus public config factory

## Validated env groups

- Supabase: URL, anon key, service role key
- Stripe: publishable key, server-only secret key, server-only webhook signing secret
- Resend: API key (server-only, via `createServerResendConfig`; never exported from `@repo/config` root)
- PostHog: public key, host
- Mapbox: public token, secret key
- App URL and environment mode
