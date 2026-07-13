CREATE TABLE app.specialist_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES authn.user(id) ON DELETE CASCADE,
  full_name varchar(255) NOT NULL,
  regions_covered uuid[] NOT NULL DEFAULT '{}',
  tier_3_on_call boolean NOT NULL DEFAULT false,
  tier_4_licensed_guide boolean NOT NULL DEFAULT false,
  rnaat_license_number varchar(100),
  is_verified boolean NOT NULL DEFAULT false,
  hourly_rate numeric(6, 2) NOT NULL DEFAULT 0,
  bio text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_specialist_profiles_user_unique UNIQUE (user_id),
  CONSTRAINT app_specialist_profiles_tier4_requires_license CHECK (
    tier_4_licensed_guide = false OR rnaat_license_number IS NOT NULL
  ),
  CONSTRAINT app_specialist_profiles_tier4_must_be_verified CHECK (
    tier_4_licensed_guide = false OR is_verified = true
  )
);
--> statement-breakpoint

CREATE INDEX app_specialist_profiles_tier3_idx
  ON app.specialist_profiles (tier_3_on_call)
  WHERE tier_3_on_call = true;
--> statement-breakpoint

CREATE INDEX app_specialist_profiles_tier4_idx
  ON app.specialist_profiles (tier_4_licensed_guide)
  WHERE tier_4_licensed_guide = true;
--> statement-breakpoint

CREATE INDEX app_specialist_profiles_regions_gin_idx
  ON app.specialist_profiles USING gin (regions_covered);
--> statement-breakpoint

CREATE TABLE app.specialist_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id uuid NOT NULL REFERENCES app.specialist_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_specialist_capabilities_unique UNIQUE (specialist_id, type, value),
  CONSTRAINT app_specialist_capabilities_type_check CHECK (type IN ('skill', 'language')),
  CONSTRAINT app_specialist_capabilities_language_value_check CHECK (
    type <> 'language' OR value IN ('pt', 'en', 'es', 'fr', 'it', 'de')
  ),
  CONSTRAINT app_specialist_capabilities_skill_value_check CHECK (
    type <> 'skill' OR length(value) BETWEEN 1 AND 80
  )
);
--> statement-breakpoint

CREATE INDEX app_specialist_capabilities_specialist_idx
  ON app.specialist_capabilities (specialist_id);
--> statement-breakpoint
CREATE INDEX app_specialist_capabilities_type_idx
  ON app.specialist_capabilities (type);
--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.specialist_profiles, app.specialist_capabilities TO rumia_app;
ALTER TABLE app.specialist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.specialist_capabilities ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY specialist_profiles_actor_or_verifier ON app.specialist_profiles
  FOR ALL TO rumia_app
  USING (
    user_id = private.current_actor_id()
    OR private.has_capability('specialists:verify')
  )
  WITH CHECK (
    user_id = private.current_actor_id()
    OR private.has_capability('specialists:verify')
  );
--> statement-breakpoint

CREATE POLICY specialist_capabilities_actor_or_verifier ON app.specialist_capabilities
  FOR ALL TO rumia_app
  USING (
    private.has_capability('specialists:verify')
    OR EXISTS (
      SELECT 1
      FROM app.specialist_profiles AS profile
      WHERE profile.id = specialist_id
        AND profile.user_id = private.current_actor_id()
    )
  )
  WITH CHECK (
    private.has_capability('specialists:verify')
    OR EXISTS (
      SELECT 1
      FROM app.specialist_profiles AS profile
      WHERE profile.id = specialist_id
        AND profile.user_id = private.current_actor_id()
    )
  );
--> statement-breakpoint

COMMENT ON TABLE app.specialist_profiles IS 'Self-hosted specialist onboarding and verification profiles.';
COMMENT ON TABLE app.specialist_capabilities IS 'Self-hosted specialist skills and spoken languages.';
