# Incident Response & Incident Drills

This runbook defines severity levels, escalation paths, and specific playbooks for common production incidents.

## 1. Severity & Escalation Matrix

| Level | Impact | Criteria | Response | Escalation |
| --- | --- | --- | --- | --- |
| **SEV-1 (Critical)** | Whole App / Core Flow | Trip creation fails; 5xx on home; RLS Lockout | Immediate (Paging) | CTO / Founder |
| **SEV-2 (High)** | Feature / Provider Down | Stripe Checkout 5xx; Email delivery failing; Reviewer queue broken | < 30 min | Tech Lead |
| **SEV-3 (Medium)** | Degraded / Non-Critical | Slow maps; PostHog analytics delay; Admin UI glitch | < 4 hours | Developer |
| **SEV-4 (Low)** | Minor / Visual | Typo; CSS glitch; SEO meta tag missing | Next Release | N/A |

## 2. Incident Playbooks

### Playbook: Payment Webhook Failure (Stripe)
1. **Signal**: `provider_error` with `provider = "stripe"` or `api_error` on `/api/webhooks/stripe`.
2. **Action**:
   - Check `payment_webhook_events` for `status = 'failed'`.
   - Inspect Stripe Dashboard (Developers -> Webhooks) for specific HTTP error codes.
   - If signature verification fails: Update `<STRIPE_WEBHOOK_SECRET>`.
3. **Reconciliation**:
   - If webhook was missed: Manually trigger the transition (e.g., mark trip as `paid` or `under_review`).

### Playbook: Email Delivery Outage (Resend)
1. **Signal**: `worker_dead_letter` for `jobKind = "review_completed_email"`.
2. **Action**:
   - Verify Resend API Key `<RESEND_API_KEY>` is valid.
   - Check Resend Dashboard for bounces or suppressed emails.
3. **Recovery**:
   - Fix the root cause.
   - Re-run the failed worker job from `LocalWorkerState`.

### Playbook: RLS Lockout / Access Denied
1. **Signal**: `auth_failure` spikes or `api_error` with 403.
2. **Action**:
   - Identify the table/policy via `errorCode`.
   - Check for recent migrations (T10 drift).
   - Use SQL Editor to fix the policy or `ALTER TABLE "name" DISABLE ROW LEVEL SECURITY` as a temporary emergency measure ONLY IF absolutely necessary. **CAUTION**: This exposes all rows in the table; re-enable immediately after fix.

### Playbook: Map Provider Degradation (Mapbox)
1. **Signal**: `api_error` or `provider_error` for Mapbox routes.
2. **Action**:
   - Check Mapbox Status page.
   - Verify `<MAPBOX_PUBLIC_TOKEN>` and `<MAPBOX_SECRET_KEY>` are active.
3. **Mitigation**:
   - If persistent, consider switching to a fallback provider in `@repo/maps` if configured.

### Playbook: Analytics Outage (PostHog)
1. **Signal**: Spike in client-side console errors or missing events in PostHog Dashboard.
2. **Action**:
   - Check PostHog Status.
   - Verify `<POSTHOG_PROJECT_ID>` and `<POSTHOG_HOST>`.
3. **Note**: Analytics outages are non-blocking for core trip flows (SEV-3).

## 3. Incident Drills (Rehearsals)

### Drill: Database Restore Rehearsal
- **Objective**: Verify that a non-production database can be wiped and restored from a schema dump without errors.
- **Commands**:
  ```bash
  # For local development environment
  npx supabase db reset 
  
  # For a dedicated test/staging project
  npx supabase db push --db-url "<TEST_PROJECT_DB_URL>"
  ```
- **Frequency**: Every 3 months or after major schema changes.

### Drill: Key Rotation Rehearsal
- **Objective**: Rotate a low-impact key (e.g., PostHog or Mapbox Public) and verify zero downtime.
- **Frequency**: Every 6 months.

## 4. Monitoring & Alerting Note (T41)
Monitoring foundation is active via `@repo/monitoring`.
- **Default Provider**: `NoopMonitoringProvider`.
- **Alert Delivery**: Not yet configured.
- **Action**: Real-time alerts (PagerDuty/Slack) require wiring a production provider (e.g., Sentry/PostHog) as defined in `docs/error-monitoring.md`.
