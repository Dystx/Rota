CREATE SCHEMA "app";
--> statement-breakpoint
CREATE SCHEMA "authn";
--> statement-breakpoint
CREATE SCHEMA "private";
--> statement-breakpoint
CREATE TABLE "app"."activity_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid,
	"activity_ids" text[] NOT NULL,
	"rating" smallint NOT NULL,
	"note" text,
	"source" text DEFAULT 'feedback-page' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_activity_feedback_rating_check" CHECK ("app"."activity_feedback"."rating" between 1 and 5),
	CONSTRAINT "app_activity_feedback_activity_count_check" CHECK (cardinality("app"."activity_feedback"."activity_ids") between 1 and 5),
	CONSTRAINT "app_activity_feedback_note_length_check" CHECK ("app"."activity_feedback"."note" is null or char_length("app"."activity_feedback"."note") <= 600),
	CONSTRAINT "app_activity_feedback_source_check" CHECK ("app"."activity_feedback"."source" in ('activity-day', 'activity-detail', 'feedback-page'))
);
--> statement-breakpoint
CREATE TABLE "authn"."account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authn"."session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authn"."user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authn"."verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."capability_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_user_id" uuid NOT NULL,
	"app_role" text NOT NULL,
	"capability" text NOT NULL,
	"reason" text NOT NULL,
	"granted_by" uuid,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_capability_grants_role_check" CHECK ("app"."capability_grants"."app_role" in ('traveler', 'reviewer', 'admin')),
	CONSTRAINT "app_capability_grants_capability_check" CHECK ("app"."capability_grants"."capability" in ('access:manage', 'content:manage', 'operations:manage', 'analytics:read', 'configuration:deploy', 'developer_docs:read', 'specialists:verify')),
	CONSTRAINT "app_capability_grants_reason_check" CHECK (length(trim("app"."capability_grants"."reason")) > 0),
	CONSTRAINT "app_capability_grants_revoked_after_created_check" CHECK ("app"."capability_grants"."revoked_at" is null or "app"."capability_grants"."revoked_at" >= "app"."capability_grants"."created_at")
);
--> statement-breakpoint
CREATE TABLE "app"."editorial_activity_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" uuid NOT NULL,
	"verdict" text NOT NULL,
	"why_worth_it" text NOT NULL,
	"suitability" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ideal_duration_minutes" integer,
	"best_time_of_day" text,
	"booking_required" boolean DEFAULT false NOT NULL,
	"disappointment_risks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "private"."job_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_at" timestamp with time zone,
	"locked_by" text,
	"completed_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "private_job_outbox_status_check" CHECK ("private"."job_outbox"."status" in ('queued', 'running', 'completed', 'failed')),
	CONSTRAINT "private_job_outbox_attempts_check" CHECK ("private"."job_outbox"."attempts" >= 0)
);
--> statement-breakpoint
CREATE TABLE "app"."payment_webhook_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"stripe_session_id" text NOT NULL,
	"trip_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"purchase_kind" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_payment_webhook_events_purchase_kind_check" CHECK ("app"."payment_webhook_events"."purchase_kind" in ('unlock', 'human_review'))
);
--> statement-breakpoint
CREATE TABLE "app"."places" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"region_slug" text NOT NULL,
	"category" text NOT NULL,
	"editorial_status" text DEFAULT 'draft' NOT NULL,
	"quality_score" integer,
	"source_confidence" text DEFAULT 'pending' NOT NULL,
	"coordinates" geography(Point,4326),
	"embedding" vector(1536),
	"opening_hours" jsonb,
	"local_notes" text,
	"is_tourist_trap" boolean DEFAULT false NOT NULL,
	"average_spend_cents" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."reviewer_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"reviewer_user_id" uuid NOT NULL,
	"status" text DEFAULT 'assigned' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."saved_activity_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"destination_slug" text NOT NULL,
	"title" text NOT NULL,
	"day_date" timestamp,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."saved_activity_selections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saved_activity_day_id" uuid NOT NULL,
	"place_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."trip_briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"destination_country" text NOT NULL,
	"destination_regions" text[] DEFAULT '{}' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"trip_length_days" integer NOT NULL,
	"travelers_count" integer NOT NULL,
	"traveler_type" text NOT NULL,
	"budget_level" text NOT NULL,
	"pace" text NOT NULL,
	"interests" text[] DEFAULT '{}' NOT NULL,
	"food_preferences" text[] DEFAULT '{}' NOT NULL,
	"avoidances" text[] DEFAULT '{}' NOT NULL,
	"transport_mode" text NOT NULL,
	"accommodation_location" text DEFAULT '' NOT NULL,
	"raw_input" text NOT NULL,
	"normalized_json" jsonb NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_brief_id" uuid NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"country_slug" text NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"has_human_review" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"app_role" text DEFAULT 'traveler' NOT NULL,
	"display_name" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_user_profiles_role_check" CHECK ("app"."user_profiles"."app_role" in ('traveler', 'reviewer', 'admin', 'none'))
);
--> statement-breakpoint
ALTER TABLE "app"."activity_feedback" ADD CONSTRAINT "activity_feedback_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "authn"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authn"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "authn"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authn"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "authn"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."capability_grants" ADD CONSTRAINT "capability_grants_subject_user_id_user_id_fk" FOREIGN KEY ("subject_user_id") REFERENCES "authn"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."capability_grants" ADD CONSTRAINT "capability_grants_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "authn"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."capability_grants" ADD CONSTRAINT "capability_grants_revoked_by_user_id_fk" FOREIGN KEY ("revoked_by") REFERENCES "authn"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."editorial_activity_profiles" ADD CONSTRAINT "editorial_activity_profiles_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "app"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "app"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "authn"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."reviewer_assignments" ADD CONSTRAINT "reviewer_assignments_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "app"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."reviewer_assignments" ADD CONSTRAINT "reviewer_assignments_reviewer_user_id_user_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "authn"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."saved_activity_days" ADD CONSTRAINT "saved_activity_days_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "authn"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."saved_activity_selections" ADD CONSTRAINT "saved_activity_selections_saved_activity_day_id_saved_activity_days_id_fk" FOREIGN KEY ("saved_activity_day_id") REFERENCES "app"."saved_activity_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."saved_activity_selections" ADD CONSTRAINT "saved_activity_selections_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "app"."places"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."trip_briefs" ADD CONSTRAINT "trip_briefs_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "authn"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."trips" ADD CONSTRAINT "trips_trip_brief_id_trip_briefs_id_fk" FOREIGN KEY ("trip_brief_id") REFERENCES "app"."trip_briefs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."trips" ADD CONSTRAINT "trips_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "authn"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "authn"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "app_activity_feedback_owner_created_idx" ON "app"."activity_feedback" USING btree ("owner_user_id","created_at");--> statement-breakpoint
CREATE INDEX "authn_account_user_id_idx" ON "authn"."account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "authn_session_token_unique" ON "authn"."session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "authn_session_user_id_idx" ON "authn"."session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "authn_user_email_unique" ON "authn"."user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "authn_verification_identifier_idx" ON "authn"."verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "app_capability_grants_subject_idx" ON "app"."capability_grants" USING btree ("subject_user_id","capability");--> statement-breakpoint
CREATE UNIQUE INDEX "app_editorial_activity_profiles_place_unique" ON "app"."editorial_activity_profiles" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "private_job_outbox_available_idx" ON "private"."job_outbox" USING btree ("status","available_at");--> statement-breakpoint
CREATE INDEX "app_payment_webhook_events_trip_created_idx" ON "app"."payment_webhook_events" USING btree ("trip_id","created_at");--> statement-breakpoint
CREATE INDEX "app_payment_webhook_events_stripe_session_idx" ON "app"."payment_webhook_events" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "app_places_slug_unique" ON "app"."places" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "app_places_region_category_idx" ON "app"."places" USING btree ("region_slug","category");--> statement-breakpoint
CREATE INDEX "app_places_coordinates_gist" ON "app"."places" USING gist ("coordinates");--> statement-breakpoint
CREATE INDEX "app_reviewer_assignments_reviewer_trip_idx" ON "app"."reviewer_assignments" USING btree ("reviewer_user_id","trip_id");--> statement-breakpoint
CREATE INDEX "app_saved_activity_days_owner_created_idx" ON "app"."saved_activity_days" USING btree ("owner_user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "app_saved_activity_selections_day_position_unique" ON "app"."saved_activity_selections" USING btree ("saved_activity_day_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "app_saved_activity_selections_day_place_unique" ON "app"."saved_activity_selections" USING btree ("saved_activity_day_id","place_id");--> statement-breakpoint
CREATE INDEX "app_trip_briefs_owner_created_idx" ON "app"."trip_briefs" USING btree ("owner_user_id","created_at");--> statement-breakpoint
CREATE INDEX "app_trips_owner_status_created_idx" ON "app"."trips" USING btree ("owner_user_id","status","created_at");--> statement-breakpoint
CREATE INDEX "app_trips_trip_brief_idx" ON "app"."trips" USING btree ("trip_brief_id");
--> statement-breakpoint

-- Runtime isolation. The application role is the only non-owner role that
-- receives table access; RLS then narrows that access to the current actor.
REVOKE ALL ON SCHEMA authn, app, private FROM PUBLIC;
GRANT USAGE ON SCHEMA authn, app TO rumia_app;
GRANT USAGE ON SCHEMA private TO rumia_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA authn, app TO rumia_app;
REVOKE ALL ON ALL TABLES IN SCHEMA private FROM PUBLIC, rumia_app;
--> statement-breakpoint

CREATE UNIQUE INDEX app_capability_grants_active_unique
  ON app.capability_grants(subject_user_id, capability)
  WHERE revoked_at IS NULL;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.current_actor_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(pg_catalog.current_setting('app.actor_id', true), '')::uuid;
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.current_reviewer_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(pg_catalog.current_setting('app.reviewer_id', true), '')::uuid;
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.current_app_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT profile.app_role
  FROM app.user_profiles AS profile
  WHERE profile.user_id = private.current_actor_id();
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.has_capability(required_capability text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM app.capability_grants AS grant_row
    WHERE grant_row.subject_user_id = private.current_actor_id()
      AND grant_row.capability = required_capability
      AND grant_row.revoked_at IS NULL
      AND (grant_row.expires_at IS NULL OR grant_row.expires_at > pg_catalog.now())
  );
$$;
--> statement-breakpoint

REVOKE ALL ON FUNCTION private.current_actor_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.current_reviewer_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.current_app_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_capability(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.current_actor_id() TO rumia_app;
GRANT EXECUTE ON FUNCTION private.current_reviewer_id() TO rumia_app;
GRANT EXECUTE ON FUNCTION private.current_app_role() TO rumia_app;
GRANT EXECUTE ON FUNCTION private.has_capability(text) TO rumia_app;
--> statement-breakpoint

ALTER TABLE app.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.capability_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.editorial_activity_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.saved_activity_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.saved_activity_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.trip_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.reviewer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.activity_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.places ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY user_profiles_actor_or_access_admin ON app.user_profiles
  FOR ALL TO rumia_app
  USING (user_id = private.current_actor_id() OR private.has_capability('access:manage'))
  WITH CHECK (user_id = private.current_actor_id() OR private.has_capability('access:manage'));
CREATE POLICY capability_grants_access_admin ON app.capability_grants
  FOR ALL TO rumia_app
  USING (private.has_capability('access:manage'))
  WITH CHECK (private.has_capability('access:manage'));
CREATE POLICY places_read_for_app ON app.places
  FOR SELECT TO rumia_app
  USING (true);
CREATE POLICY places_content_write ON app.places
  FOR ALL TO rumia_app
  USING (private.has_capability('content:manage'))
  WITH CHECK (private.has_capability('content:manage'));
CREATE POLICY editorial_profiles_read_for_app ON app.editorial_activity_profiles
  FOR SELECT TO rumia_app
  USING (true);
CREATE POLICY editorial_profiles_content_write ON app.editorial_activity_profiles
  FOR ALL TO rumia_app
  USING (private.has_capability('content:manage'))
  WITH CHECK (private.has_capability('content:manage'));
--> statement-breakpoint

CREATE POLICY saved_days_owner_or_admin ON app.saved_activity_days
  FOR ALL TO rumia_app
  USING (owner_user_id = private.current_actor_id() OR private.has_capability('access:manage'))
  WITH CHECK (owner_user_id = private.current_actor_id() OR private.has_capability('access:manage'));
CREATE POLICY saved_selections_owner_or_admin ON app.saved_activity_selections
  FOR ALL TO rumia_app
  USING (
    private.has_capability('access:manage')
    OR EXISTS (
      SELECT 1
      FROM app.saved_activity_days AS day
      WHERE day.id = saved_activity_day_id
        AND day.owner_user_id = private.current_actor_id()
    )
  )
  WITH CHECK (
    private.has_capability('access:manage')
    OR EXISTS (
      SELECT 1
      FROM app.saved_activity_days AS day
      WHERE day.id = saved_activity_day_id
        AND day.owner_user_id = private.current_actor_id()
    )
  );
CREATE POLICY trip_briefs_owner_or_admin ON app.trip_briefs
  FOR ALL TO rumia_app
  USING (owner_user_id = private.current_actor_id() OR private.has_capability('access:manage'))
  WITH CHECK (owner_user_id = private.current_actor_id() OR private.has_capability('access:manage'));
CREATE POLICY trips_owner_reviewer_or_admin ON app.trips
  FOR ALL TO rumia_app
  USING (
    owner_user_id = private.current_actor_id()
    OR private.has_capability('access:manage')
    OR EXISTS (
      SELECT 1
      FROM app.reviewer_assignments AS assignment
      WHERE assignment.trip_id = trips.id
        AND assignment.reviewer_user_id = private.current_reviewer_id()
        AND assignment.status IN ('assigned', 'submitted')
    )
  )
  WITH CHECK (owner_user_id = private.current_actor_id() OR private.has_capability('access:manage'));
CREATE POLICY reviewer_assignments_reviewer_or_admin ON app.reviewer_assignments
  FOR ALL TO rumia_app
  USING (reviewer_user_id = private.current_reviewer_id() OR private.has_capability('operations:manage'))
  WITH CHECK (reviewer_user_id = private.current_reviewer_id() OR private.has_capability('operations:manage'));
--> statement-breakpoint

CREATE POLICY activity_feedback_insert_server ON app.activity_feedback
  FOR INSERT TO rumia_app
  WITH CHECK (owner_user_id IS NULL OR owner_user_id = private.current_actor_id());
CREATE POLICY activity_feedback_analytics_read ON app.activity_feedback
  FOR SELECT TO rumia_app
  USING (private.has_capability('analytics:read'));
--> statement-breakpoint

COMMENT ON SCHEMA private IS 'Internal job state. rumia_app has no table privileges; access is through reviewed security-definer functions.';
COMMENT ON TABLE app.capability_grants IS 'Server-owned capability grants. Never derive authorization from browser-controlled metadata.';
COMMENT ON TABLE app.places IS 'Portugal-first editorial activity catalogue; embeddings remain nullable until semantic retrieval is approved.';
