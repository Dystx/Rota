ALTER TABLE app.payment_webhook_events ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY payment_webhook_events_owner_or_analytics_read ON app.payment_webhook_events
  FOR SELECT TO rumia_app
  USING (
    user_id = private.current_actor_id()
    OR private.has_capability('analytics:read')
    OR private.has_capability('operations:manage')
  );
--> statement-breakpoint
CREATE POLICY payment_webhook_events_owner_or_operations_insert ON app.payment_webhook_events
  FOR INSERT TO rumia_app
  WITH CHECK (
    user_id = private.current_actor_id()
    OR private.has_capability('operations:manage')
  );
