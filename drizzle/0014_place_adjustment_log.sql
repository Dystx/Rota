CREATE TABLE IF NOT EXISTS app.place_adjustment_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id text NOT NULL REFERENCES app.places(slug) ON DELETE CASCADE,
  specialist_id uuid NOT NULL REFERENCES app.specialist_profiles(id) ON DELETE RESTRICT,
  trip_id uuid REFERENCES app.trips(id) ON DELETE SET NULL,
  delta numeric NOT NULL,
  reason text NOT NULL CHECK (reason IN ('swap_for_hidden_gem', 'fix_logistics_bottleneck')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_place_adjustment_log_place_created_idx
  ON app.place_adjustment_log (place_id, created_at DESC);
CREATE INDEX IF NOT EXISTS app_place_adjustment_log_specialist_created_idx
  ON app.place_adjustment_log (specialist_id, created_at DESC);

ALTER TABLE app.place_adjustment_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS place_adjustment_log_self_insert ON app.place_adjustment_log;
CREATE POLICY place_adjustment_log_self_insert ON app.place_adjustment_log
  FOR INSERT TO rumia_app
  WITH CHECK (
    specialist_id IN (
      SELECT id FROM app.specialist_profiles WHERE user_id = private.current_actor_id()
    )
  );
DROP POLICY IF EXISTS place_adjustment_log_read ON app.place_adjustment_log;
CREATE POLICY place_adjustment_log_read ON app.place_adjustment_log
  FOR SELECT TO rumia_app
  USING (private.current_app_role() = 'admin' OR private.has_capability('analytics:read'));

GRANT SELECT, INSERT ON app.place_adjustment_log TO rumia_app;
