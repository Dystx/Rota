# ADR: Authentication and Row-Level Security (RLS)

- **Status**: Proposed / Awaiting Infrastructure Reconciliation
- **Date**: 2026-05-04

## Context

The Rota platform handles sensitive traveler data (itineraries, preferences) and reviewer operational data. While the initial MVP used the Supabase `service_role` key for unauthenticated writes, a production launch requires a robust security model.

## Decision

We will implement a defense-in-depth security model using Supabase Auth and PostgreSQL Row-Level Security (RLS).

1. **User Identity**: Every traveler will be represented by an `auth.users` record.
2. **Data Ownership**: The `trips` and `trip_briefs` tables must include an `owner_user_id` column referencing `auth.users(id)`.
3. **RLS Policies**:
   - Travelers can only view/edit trips where `owner_user_id = auth.uid()`.
   - Reviewers can view any trip assigned to them via the `reviewer_assignments` join table.
   - Admins can access all records via a specific `admin` role or bypass.
4. **Service Role Boundary**: The `@repo/db` package will continue to use the `service_role` key for specific background tasks (like AI generation or system audit logs) but will explicitly use RLS-constrained clients for all user-facing requests.

## Consequences

- **Schema Change Required**: Existing `trips` and `trip_briefs` tables in the hosted database must be migrated to include ownership columns.
- **Middleware Integration**: Next.js middleware must ensure a valid session exists before accessing `/(app)` or `/(reviewer)` routes.
- **Development Overhead**: Local development will require a running Supabase instance to test RLS policies effectively.
