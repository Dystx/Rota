CREATE TABLE app.booking_clicks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  partner_id text NOT NULL REFERENCES app.partners(id) ON DELETE RESTRICT,
  trip_id text,
  source text NOT NULL,
  target text NOT NULL,
  referer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX app_booking_clicks_partner_created_idx
  ON app.booking_clicks (partner_id, created_at);
--> statement-breakpoint
CREATE INDEX app_booking_clicks_trip_created_idx
  ON app.booking_clicks (trip_id, created_at);
--> statement-breakpoint

GRANT SELECT, INSERT ON TABLE app.booking_clicks TO rumia_app;
ALTER TABLE app.booking_clicks ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY booking_clicks_anonymous_insert ON app.booking_clicks
  FOR INSERT TO rumia_app
  WITH CHECK (length(trim(source)) between 1 and 100 AND length(target) between 1 and 4000);
CREATE POLICY booking_clicks_analytics_read ON app.booking_clicks
  FOR SELECT TO rumia_app
  USING (private.current_app_role() = 'admin' OR private.has_capability('analytics:read'));
--> statement-breakpoint

COMMENT ON TABLE app.booking_clicks IS 'Privacy-limited outbound partner click ledger; anonymous inserts are allowed and analytics reads are restricted.';
