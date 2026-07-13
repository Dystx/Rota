CREATE POLICY trips_analytics_read ON app.trips
  FOR SELECT TO rumia_app
  USING (private.current_app_role() = 'admin' OR private.has_capability('analytics:read'));
--> statement-breakpoint
CREATE POLICY reviewer_assignments_analytics_read ON app.reviewer_assignments
  FOR SELECT TO rumia_app
  USING (private.current_app_role() = 'admin' OR private.has_capability('analytics:read'));
