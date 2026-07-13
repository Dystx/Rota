CREATE UNIQUE INDEX IF NOT EXISTS app_reviewer_assignments_one_active_per_trip_idx
  ON app.reviewer_assignments (trip_id)
  WHERE status IN ('assigned', 'submitted');
--> statement-breakpoint
COMMENT ON INDEX app.app_reviewer_assignments_one_active_per_trip_idx IS
  'At most one active reviewer assignment per trip; completed and returned history remains allowed.';
