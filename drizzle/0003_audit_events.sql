CREATE TABLE app.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid NOT NULL REFERENCES authn.user(id) ON DELETE RESTRICT,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  before jsonb,
  after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE INDEX app_audit_events_actor_created_idx ON app.audit_events(actor_user_id, created_at);
CREATE INDEX app_audit_events_entity_idx ON app.audit_events(entity_type, entity_id, created_at);
--> statement-breakpoint

REVOKE ALL ON TABLE app.audit_events FROM PUBLIC;
GRANT SELECT, INSERT ON TABLE app.audit_events TO rumia_app;
ALTER TABLE app.audit_events ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY audit_events_actor_insert ON app.audit_events
  FOR INSERT TO rumia_app
  WITH CHECK (actor_user_id = private.current_actor_id() OR private.current_app_role() = 'admin');
CREATE POLICY audit_events_admin_read ON app.audit_events
  FOR SELECT TO rumia_app
  USING (private.current_app_role() = 'admin' OR private.has_capability('analytics:read'));
