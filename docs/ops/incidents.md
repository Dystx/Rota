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

### Playbook: PostgreSQL authorization lockout / Access Denied
1. **Signal**: `auth_failure` spikes or `api_error` with 403.
2. **Action**:
   - Identify the table/policy via `errorCode`.
   - Check for recent migrations (T10 drift).
   - Connect through the local owner role using the approved maintenance path,
     inspect the RLS policy and actor context, and repair forward with a
     migration. Never expose PostgreSQL or disable RLS as a casual emergency
     workaround; if a narrowly scoped break-glass action is unavoidable, record
     it, re-enable protection immediately, and run the cross-owner tests.

### Playbook: Map Provider Degradation (MapLibre surface)
1. **Signal**: MapLibre tile/style errors, route-provider failures, or a
   missing map canvas.
2. **Action**:
   - Check the approved basemap/route provider status and quota.
   - Confirm the attribution and provider feature flag are unchanged.
3. **Mitigation**:
   - Keep the list/schematic fallback visible and disable the provider flag;
     never draw fabricated route geometry.

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
  # On the VPS, as root, against the encrypted Restic repository
  /usr/local/sbin/restore-rumia-check.sh
  ```
- **Frequency**: Every 3 months or after major schema changes.

### Drill: Key Rotation Rehearsal
- **Objective**: Rotate a low-impact key (for example PostHog) and verify zero downtime.
- **Frequency**: Every 6 months.

## 4. Monitoring & Alerting Note (T41)
Monitoring foundation is active via `@repo/monitoring`.
- **Default Provider**: `NoopMonitoringProvider`.
- **Alert Delivery**: Not yet configured.
- **Action**: Real-time alerts (PagerDuty/Slack) require wiring a production provider (e.g., Sentry/PostHog) as defined in `docs/error-monitoring.md`.
