CREATE TABLE app.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  branding jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE app.itinerary_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text NOT NULL,
  event_type text NOT NULL,
  title text NOT NULL,
  event_date date NOT NULL,
  event_time time NOT NULL,
  internal_notes text,
  created_by uuid NOT NULL REFERENCES authn.user(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_itinerary_events_type_check CHECK (event_type IN ('activity', 'accommodation', 'transfer', 'dining'))
);
--> statement-breakpoint
CREATE INDEX app_itinerary_events_conversation_date_idx
  ON app.itinerary_events (conversation_id, event_date, event_time);
--> statement-breakpoint

CREATE TABLE app.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text NOT NULL,
  author_role text NOT NULL,
  author_user_id uuid REFERENCES authn.user(id) ON DELETE SET NULL,
  body text NOT NULL,
  source_snippet_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_chat_messages_author_role_check CHECK (author_role IN ('operator', 'traveler'))
);
--> statement-breakpoint
CREATE INDEX app_chat_messages_conversation_created_idx
  ON app.chat_messages (conversation_id, created_at);
--> statement-breakpoint

GRANT SELECT ON TABLE app.organizations TO rumia_app;
GRANT SELECT, INSERT ON TABLE app.itinerary_events, app.chat_messages TO rumia_app;
ALTER TABLE app.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.itinerary_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.chat_messages ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY organizations_public_read ON app.organizations
  FOR SELECT TO rumia_app USING (slug IS NOT NULL);
CREATE POLICY itinerary_events_operations_read ON app.itinerary_events
  FOR SELECT TO rumia_app
  USING (private.current_app_role() = 'admin' OR private.has_capability('operations:manage'));
CREATE POLICY itinerary_events_operations_insert ON app.itinerary_events
  FOR INSERT TO rumia_app
  WITH CHECK (private.current_app_role() = 'admin' OR private.has_capability('operations:manage'));
CREATE POLICY chat_messages_operations_read ON app.chat_messages
  FOR SELECT TO rumia_app
  USING (private.current_app_role() = 'admin' OR private.has_capability('operations:manage'));
CREATE POLICY chat_messages_operations_insert ON app.chat_messages
  FOR INSERT TO rumia_app
  WITH CHECK (private.current_app_role() = 'admin' OR private.has_capability('operations:manage'));
--> statement-breakpoint

COMMENT ON TABLE app.organizations IS 'Public organization branding for gated B2B surfaces.';
COMMENT ON TABLE app.itinerary_events IS 'Operator-owned timeline events; access remains beta-gated.';
COMMENT ON TABLE app.chat_messages IS 'Operator/traveler console messages; access remains beta-gated.';
