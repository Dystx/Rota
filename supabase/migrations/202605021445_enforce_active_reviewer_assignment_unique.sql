create unique index if not exists reviewer_assignments_one_active_per_trip_idx
  on public.reviewer_assignments(trip_id)
  where status in ('assigned', 'submitted');

comment on index public.reviewer_assignments_one_active_per_trip_idx is 'T30: enforces at most one active reviewer assignment per trip while allowing completed/returned history rows.';
