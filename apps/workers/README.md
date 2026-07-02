# Workers

`apps/workers` owns the launch-critical background-job boundary for Rota.
The execution target is a bounded Node runner that is compatible with a
Vercel Cron invocation or a local one-shot command. It intentionally does
not attach Redis, BullMQ, SQS, Supabase Cron, or any other unbounded queue
provider.

## Current scope

- Existing deterministic `buildWorkerPlan()` export for export/review/routing
  planning.
- Local `runLocalWorker()` pipeline with explicit job statuses, attempts,
  retry scheduling, retry limits, and idempotency keys.
- Review-complete email delivery via `@repo/emails` typed builders and an
  injected provider. Tests use only fake providers.
- Abandoned checkout/trip cleanup against deterministic local records. The
  cleanup marks stale open checkout artifacts expired and leaves active paid
  trips unchanged.

## Execution target

The chosen launch target is `bounded-node-cron-compatible-local-runner`:

1. A cron trigger (for example Vercel Cron) can invoke a small server-only
   endpoint or script that seeds due jobs and calls `runLocalWorker()` once.
2. Each invocation drains only currently due jobs from the provided state and
   stops; retry scheduling is explicit on the job record.
3. Providers are injected, so tests and local runs use fakes while production
   can pass server-only providers from a backend-only entrypoint.

This keeps T27 deterministic and launch-critical without introducing a broad
queue system or unrestricted service-role behavior.

## Local verification

```bash
pnpm --dir apps/workers test
pnpm --dir apps/workers typecheck
```

The worker tests prove:

- email retry fails once, retries, succeeds, and records one completed logical
  delivery for the email idempotency key;
- a duplicate completed email job is skipped before provider send;
- cleanup expires only the abandoned checkout/trip artifact while the active
  paid trip remains unchanged.
