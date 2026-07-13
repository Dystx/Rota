CREATE TABLE app.regions (
  id text PRIMARY KEY,
  name text NOT NULL,
  country_slug text NOT NULL DEFAULT 'portugal',
  best_for text[] NOT NULL DEFAULT '{}',
  seasonality text NOT NULL DEFAULT '',
  launch_status text NOT NULL DEFAULT 'Planned',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX app_regions_country_status_idx
  ON app.regions (country_slug, launch_status, created_at);
--> statement-breakpoint

CREATE TABLE app.partners (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL DEFAULT '',
  coverage_regions text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'Draft',
  notes text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  is_affiliate boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX app_partners_status_created_idx
  ON app.partners (status, created_at);
--> statement-breakpoint

CREATE TABLE app.reviewers (
  id text PRIMARY KEY,
  user_id uuid REFERENCES authn.user(id) ON DELETE SET NULL,
  name text NOT NULL,
  country text NOT NULL DEFAULT 'Portugal',
  regions text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  specialties text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'Onboarding',
  rating numeric(3, 2),
  bio text NOT NULL DEFAULT '',
  response_promise text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_reviewers_user_unique UNIQUE (user_id),
  CONSTRAINT app_reviewers_rating_check CHECK (rating IS NULL OR rating BETWEEN 0 AND 5)
);
--> statement-breakpoint
CREATE INDEX app_reviewers_status_created_idx
  ON app.reviewers (status, created_at);
--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.regions, app.partners, app.reviewers TO rumia_app;
ALTER TABLE app.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.reviewers ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY regions_admin_access ON app.regions
  FOR ALL TO rumia_app
  USING (private.current_app_role() = 'admin' OR private.has_capability('content:manage'))
  WITH CHECK (private.current_app_role() = 'admin' OR private.has_capability('content:manage'));
--> statement-breakpoint

CREATE POLICY partners_public_read ON app.partners
  FOR SELECT TO rumia_app
  USING (true);
CREATE POLICY partners_admin_write ON app.partners
  FOR INSERT TO rumia_app
  WITH CHECK (private.current_app_role() = 'admin' OR private.has_capability('content:manage'));
CREATE POLICY partners_admin_update ON app.partners
  FOR UPDATE TO rumia_app
  USING (private.current_app_role() = 'admin' OR private.has_capability('content:manage'))
  WITH CHECK (private.current_app_role() = 'admin' OR private.has_capability('content:manage'));
CREATE POLICY partners_admin_delete ON app.partners
  FOR DELETE TO rumia_app
  USING (private.current_app_role() = 'admin' OR private.has_capability('content:manage'));
--> statement-breakpoint

CREATE POLICY reviewers_self_or_admin_read ON app.reviewers
  FOR SELECT TO rumia_app
  USING (
    user_id = private.current_actor_id()
    OR private.current_app_role() = 'admin'
    OR private.has_capability('operations:manage')
  );
CREATE POLICY reviewers_admin_write ON app.reviewers
  FOR INSERT TO rumia_app
  WITH CHECK (private.current_app_role() = 'admin' OR private.has_capability('operations:manage'));
CREATE POLICY reviewers_admin_update ON app.reviewers
  FOR UPDATE TO rumia_app
  USING (private.current_app_role() = 'admin' OR private.has_capability('operations:manage'))
  WITH CHECK (private.current_app_role() = 'admin' OR private.has_capability('operations:manage'));
CREATE POLICY reviewers_admin_delete ON app.reviewers
  FOR DELETE TO rumia_app
  USING (private.current_app_role() = 'admin' OR private.has_capability('operations:manage'));
--> statement-breakpoint

COMMENT ON TABLE app.regions IS 'Self-hosted Portugal region catalogue and launch metadata.';
COMMENT ON TABLE app.partners IS 'Self-hosted outbound partner sources; public reads do not imply endorsement.';
COMMENT ON TABLE app.reviewers IS 'Self-hosted reviewer profiles; identity is Better Auth user_id when linked.';
