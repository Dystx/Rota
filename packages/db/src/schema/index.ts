import { sql } from "drizzle-orm";
import {
  boolean,
  bigint,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgSchema,
  primaryKey,
  smallint,
  text,
  timestamp,
  time,
  uniqueIndex,
  uuid,
  vector,
  customType
} from "drizzle-orm/pg-core";

export const authn = pgSchema("authn");
export const app = pgSchema("app");
export const privateSchema = pgSchema("private");

const geographyPoint = customType<{ data: readonly [number, number]; driverData: string }>({
  dataType: () => "geography(Point,4326)"
});

const createdAt = timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull();
const updatedAt = timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull();

export const authUsers = authn.table(
  "user",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt,
    updatedAt
  },
  (table) => [uniqueIndex("authn_user_email_unique").on(table.email)]
);

export const authSessions = authn.table(
  "session",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
    token: text("token").notNull(),
    createdAt,
    updatedAt,
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" })
  },
  (table) => [
    uniqueIndex("authn_session_token_unique").on(table.token),
    index("authn_session_user_id_idx").on(table.userId)
  ]
);

export const authAccounts = authn.table(
  "account",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date", withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date", withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt,
    updatedAt
  },
  (table) => [index("authn_account_user_id_idx").on(table.userId)]
);

export const authVerifications = authn.table(
  "verification",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
    createdAt,
    updatedAt
  },
  (table) => [index("authn_verification_identifier_idx").on(table.identifier)]
);

export const userProfiles = app.table(
  "user_profiles",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    appRole: text("app_role").default("traveler").notNull(),
    displayName: text("display_name").default("").notNull(),
    createdAt,
    updatedAt
  },
  (table) => [check("app_user_profiles_role_check", sql`${table.appRole} in ('traveler', 'reviewer', 'admin', 'none')`)]
);

export const capabilityGrants = app.table(
  "capability_grants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subjectUserId: uuid("subject_user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    appRole: text("app_role").notNull(),
    capability: text("capability").notNull(),
    reason: text("reason").notNull(),
    grantedBy: uuid("granted_by").references(() => authUsers.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }),
    revokedAt: timestamp("revoked_at", { mode: "date", withTimezone: true }),
    revokedBy: uuid("revoked_by").references(() => authUsers.id, { onDelete: "set null" }),
    createdAt,
    updatedAt
  },
  (table) => [
    index("app_capability_grants_subject_idx").on(table.subjectUserId, table.capability),
    check("app_capability_grants_role_check", sql`${table.appRole} in ('traveler', 'reviewer', 'admin')`),
    check(
      "app_capability_grants_capability_check",
      sql`${table.capability} in ('access:manage', 'content:manage', 'operations:manage', 'analytics:read', 'configuration:deploy', 'developer_docs:read', 'specialists:verify')`
    ),
    check("app_capability_grants_reason_check", sql`length(trim(${table.reason})) > 0`),
    check("app_capability_grants_revoked_after_created_check", sql`${table.revokedAt} is null or ${table.revokedAt} >= ${table.createdAt}`)
  ]
);

export const specialistProfiles = app.table(
  "specialist_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    regionsCovered: uuid("regions_covered").array().default([]).notNull(),
    tier3OnCall: boolean("tier_3_on_call").default(false).notNull(),
    tier4LicensedGuide: boolean("tier_4_licensed_guide").default(false).notNull(),
    rnaatLicenseNumber: text("rnaat_license_number"),
    isVerified: boolean("is_verified").default(false).notNull(),
    hourlyRate: numeric("hourly_rate", { precision: 6, scale: 2, mode: "number" }).default(0).notNull(),
    bio: text("bio"),
    photoUrl: text("photo_url"),
    createdAt
  },
  (table) => [
    uniqueIndex("app_specialist_profiles_user_unique").on(table.userId),
    index("app_specialist_profiles_tier3_idx").on(table.tier3OnCall),
    index("app_specialist_profiles_tier4_idx").on(table.tier4LicensedGuide)
  ]
);

export const specialistCapabilities = app.table(
  "specialist_capabilities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    specialistId: uuid("specialist_id")
      .notNull()
      .references(() => specialistProfiles.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    value: text("value").notNull(),
    createdAt
  },
  (table) => [
    uniqueIndex("app_specialist_capabilities_unique").on(table.specialistId, table.type, table.value),
    index("app_specialist_capabilities_specialist_idx").on(table.specialistId),
    index("app_specialist_capabilities_type_idx").on(table.type),
    check("app_specialist_capabilities_type_check", sql`${table.type} in ('skill', 'language')`),
    check(
      "app_specialist_capabilities_language_value_check",
      sql`${table.type} <> 'language' or ${table.value} in ('pt', 'en', 'es', 'fr', 'it', 'de')`
    ),
    check("app_specialist_capabilities_skill_value_check", sql`${table.type} <> 'skill' or length(${table.value}) between 1 and 80`)
  ]
);

export const regions = app.table(
  "regions",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    countrySlug: text("country_slug").default("portugal").notNull(),
    bestFor: text("best_for").array().default([]).notNull(),
    seasonality: text("seasonality").default("").notNull(),
    launchStatus: text("launch_status").default("Planned").notNull(),
    description: text("description").default("").notNull(),
    createdAt,
    updatedAt
  },
  (table) => [index("app_regions_country_status_idx").on(table.countrySlug, table.launchStatus, table.createdAt)]
);

export const partners = app.table(
  "partners",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type").default("").notNull(),
    coverageRegions: text("coverage_regions").array().default([]).notNull(),
    status: text("status").default("Draft").notNull(),
    notes: text("notes").default("").notNull(),
    link: text("link").default("").notNull(),
    isAffiliate: boolean("is_affiliate").default(false).notNull(),
    createdAt,
    updatedAt
  },
  (table) => [index("app_partners_status_created_idx").on(table.status, table.createdAt)]
);

export const reviewers = app.table(
  "reviewers",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id").references(() => authUsers.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    country: text("country").default("Portugal").notNull(),
    regions: text("regions").array().default([]).notNull(),
    languages: text("languages").array().default([]).notNull(),
    specialties: text("specialties").array().default([]).notNull(),
    status: text("status").default("Onboarding").notNull(),
    rating: numeric("rating", { precision: 3, scale: 2, mode: "number" }),
    bio: text("bio").default("").notNull(),
    responsePromise: text("response_promise").default("").notNull(),
    createdAt,
    updatedAt
  },
  (table) => [
    uniqueIndex("app_reviewers_user_unique").on(table.userId),
    index("app_reviewers_status_created_idx").on(table.status, table.createdAt)
  ]
);

export const bookingClicks = app.table(
  "booking_clicks",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    partnerId: text("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "restrict" }),
    tripId: text("trip_id"),
    source: text("source").notNull(),
    target: text("target").notNull(),
    referer: text("referer"),
    userAgent: text("user_agent"),
    createdAt
  },
  (table) => [
    index("app_booking_clicks_partner_created_idx").on(table.partnerId, table.createdAt),
    index("app_booking_clicks_trip_created_idx").on(table.tripId, table.createdAt)
  ]
);

export const organizations = app.table(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug"),
    branding: jsonb("branding"),
    createdAt,
    updatedAt
  },
  (table) => [uniqueIndex("app_organizations_slug_unique").on(table.slug)]
);

export const itineraryEvents = app.table(
  "itinerary_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: text("conversation_id").notNull(),
    eventType: text("event_type").notNull(),
    title: text("title").notNull(),
    eventDate: date("event_date", { mode: "string" }).notNull(),
    eventTime: time("event_time").notNull(),
    internalNotes: text("internal_notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),
    createdAt
  },
  (table) => [
    index("app_itinerary_events_conversation_date_idx").on(table.conversationId, table.eventDate, table.eventTime),
    check("app_itinerary_events_type_check", sql`${table.eventType} in ('activity', 'accommodation', 'transfer', 'dining')`)
  ]
);

export const chatMessages = app.table(
  "chat_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: text("conversation_id").notNull(),
    authorRole: text("author_role").notNull(),
    authorUserId: uuid("author_user_id").references(() => authUsers.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    sourceSnippetId: text("source_snippet_id"),
    createdAt
  },
  (table) => [
    index("app_chat_messages_conversation_created_idx").on(table.conversationId, table.createdAt),
    check("app_chat_messages_author_role_check", sql`${table.authorRole} in ('operator', 'traveler')`)
  ]
);

export const places = app.table(
  "places",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    regionSlug: text("region_slug").notNull(),
    category: text("category").notNull(),
    editorialStatus: text("editorial_status").default("draft").notNull(),
    qualityScore: integer("quality_score"),
    sourceConfidence: text("source_confidence").default("pending").notNull(),
    coordinates: geographyPoint("coordinates"),
    embedding: vector("embedding", { dimensions: 1536 }),
    openingHours: jsonb("opening_hours"),
    localNotes: text("local_notes"),
    isTouristTrap: boolean("is_tourist_trap").default(false).notNull(),
    averageSpendCents: integer("average_spend_cents"),
    createdAt,
    updatedAt
  },
  (table) => [
    uniqueIndex("app_places_slug_unique").on(table.slug),
    index("app_places_region_category_idx").on(table.regionSlug, table.category),
    index("app_places_coordinates_gist").using("gist", table.coordinates)
  ]
);

export const editorialActivityProfiles = app.table(
  "editorial_activity_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    verdict: text("verdict").notNull(),
    whyWorthIt: text("why_worth_it").notNull(),
    suitability: jsonb("suitability").notNull().default({}),
    idealDurationMinutes: integer("ideal_duration_minutes"),
    bestTimeOfDay: text("best_time_of_day"),
    bookingRequired: boolean("booking_required").default(false).notNull(),
    disappointmentRisks: jsonb("disappointment_risks").notNull().default([]),
    createdAt,
    updatedAt
  },
  (table) => [uniqueIndex("app_editorial_activity_profiles_place_unique").on(table.placeId)]
);

export const savedActivityDays = app.table(
  "saved_activity_days",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    destinationSlug: text("destination_slug").notNull(),
    title: text("title").notNull(),
    dayDate: timestamp("day_date", { mode: "date", withTimezone: false }),
    createdAt,
    updatedAt
  },
  (table) => [index("app_saved_activity_days_owner_created_idx").on(table.ownerUserId, table.createdAt)]
);

export const savedActivitySelections = app.table(
  "saved_activity_selections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    savedActivityDayId: uuid("saved_activity_day_id")
      .notNull()
      .references(() => savedActivityDays.id, { onDelete: "cascade" }),
    placeId: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    note: text("note"),
    createdAt,
    updatedAt
  },
  (table) => [
    uniqueIndex("app_saved_activity_selections_day_position_unique").on(table.savedActivityDayId, table.position),
    uniqueIndex("app_saved_activity_selections_day_place_unique").on(table.savedActivityDayId, table.placeId)
  ]
);

export const tripBriefs = app.table(
  "trip_briefs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    destinationCountry: text("destination_country").notNull(),
    destinationRegions: text("destination_regions").array().default([]).notNull(),
    startDate: timestamp("start_date", { mode: "date", withTimezone: false }),
    endDate: timestamp("end_date", { mode: "date", withTimezone: false }),
    tripLengthDays: integer("trip_length_days").notNull(),
    travelersCount: integer("travelers_count").notNull(),
    travelerType: text("traveler_type").notNull(),
    budgetLevel: text("budget_level").notNull(),
    pace: text("pace").notNull(),
    interests: text("interests").array().default([]).notNull(),
    foodPreferences: text("food_preferences").array().default([]).notNull(),
    avoidances: text("avoidances").array().default([]).notNull(),
    transportMode: text("transport_mode").notNull(),
    accommodationLocation: text("accommodation_location").default("").notNull(),
    rawInput: text("raw_input").notNull(),
    normalizedJson: jsonb("normalized_json").notNull(),
    status: text("status").default("submitted").notNull(),
    createdAt,
    updatedAt
  },
  (table) => [index("app_trip_briefs_owner_created_idx").on(table.ownerUserId, table.createdAt)]
);

export const trips = app.table(
  "trips",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripBriefId: uuid("trip_brief_id")
      .notNull()
      .references(() => tripBriefs.id, { onDelete: "cascade" }),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    countrySlug: text("country_slug").notNull(),
    title: text("title").notNull(),
    status: text("status").default("draft").notNull(),
    visibility: text("visibility").default("private").notNull(),
    isPaid: boolean("is_paid").default(false).notNull(),
    hasHumanReview: boolean("has_human_review").default(false).notNull(),
    createdAt,
    updatedAt
  },
  (table) => [
    index("app_trips_owner_status_created_idx").on(table.ownerUserId, table.status, table.createdAt),
    index("app_trips_trip_brief_idx").on(table.tripBriefId)
  ]
);

export const reviewerAssignments = app.table(
  "reviewer_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    reviewerUserId: uuid("reviewer_user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    status: text("status").default("assigned").notNull(),
    notes: text("notes").default("").notNull(),
    createdAt,
    completedAt: timestamp("completed_at", { mode: "date", withTimezone: true }),
    updatedAt
  },
  (table) => [
    index("app_reviewer_assignments_reviewer_trip_idx").on(table.reviewerUserId, table.tripId),
    uniqueIndex("app_reviewer_assignments_one_active_per_trip_idx")
      .on(table.tripId)
      .where(sql`${table.status} in ('assigned', 'submitted')`)
  ]
);

export const paymentWebhookEvents = app.table(
  "payment_webhook_events",
  {
    eventId: text("event_id").primaryKey(),
    stripeSessionId: text("stripe_session_id").notNull(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),
    purchaseKind: text("purchase_kind").notNull(),
    payload: jsonb("payload").notNull().default({}),
    processedAt: timestamp("processed_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    createdAt
  },
  (table) => [
    index("app_payment_webhook_events_trip_created_idx").on(table.tripId, table.createdAt),
    index("app_payment_webhook_events_stripe_session_idx").on(table.stripeSessionId),
    check("app_payment_webhook_events_purchase_kind_check", sql`${table.purchaseKind} in ('unlock', 'human_review')`)
  ]
);

export const activityFeedback = app.table(
  "activity_feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id").references(() => authUsers.id, { onDelete: "set null" }),
    activityIds: text("activity_ids").array().notNull(),
    rating: smallint("rating").notNull(),
    note: text("note"),
    source: text("source").default("feedback-page").notNull(),
    createdAt
  },
  (table) => [
    index("app_activity_feedback_owner_created_idx").on(table.ownerUserId, table.createdAt),
    check("app_activity_feedback_rating_check", sql`${table.rating} between 1 and 5`),
    check("app_activity_feedback_activity_count_check", sql`cardinality(${table.activityIds}) between 1 and 5`),
    check("app_activity_feedback_note_length_check", sql`${table.note} is null or char_length(${table.note}) <= 600`),
    check("app_activity_feedback_source_check", sql`${table.source} in ('activity-day', 'activity-detail', 'feedback-page')`)
  ]
);

export const auditEvents = app.table(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "restrict" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    createdAt
  },
  (table) => [index("app_audit_events_actor_created_idx").on(table.actorUserId, table.createdAt), index("app_audit_events_entity_idx").on(table.entityType, table.entityId, table.createdAt)]
);

export const jobOutbox = privateSchema.table(
  "job_outbox",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    topic: text("topic").notNull(),
    payload: jsonb("payload").notNull(),
    status: text("status").default("queued").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    availableAt: timestamp("available_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    lockedAt: timestamp("locked_at", { mode: "date", withTimezone: true }),
    lockedBy: text("locked_by"),
    completedAt: timestamp("completed_at", { mode: "date", withTimezone: true }),
    lastError: text("last_error"),
    createdAt,
    updatedAt
  },
  (table) => [
    index("private_job_outbox_available_idx").on(table.status, table.availableAt),
    check("private_job_outbox_status_check", sql`${table.status} in ('queued', 'running', 'completed', 'failed')`),
    check("private_job_outbox_attempts_check", sql`${table.attempts} >= 0`)
  ]
);

export const activityFeedbackRateLimit = privateSchema.table("activity_feedback_rate_limit", {
  minuteBucket: bigint("minute_bucket", { mode: "number" }).primaryKey(),
  callCount: integer("call_count").default(0).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull()
});

export const placeAdjustmentLogs = app.table(
  "place_adjustment_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    placeId: text("place_id")
      .notNull()
      .references(() => places.slug, { onDelete: "cascade" }),
    specialistId: uuid("specialist_id")
      .notNull()
      .references(() => specialistProfiles.id, { onDelete: "restrict" }),
    tripId: uuid("trip_id").references(() => trips.id, { onDelete: "set null" }),
    delta: numeric("delta", { mode: "number" }).notNull(),
    reason: text("reason").notNull(),
    createdAt
  },
  (table) => [
    index("app_place_adjustment_log_place_created_idx").on(table.placeId, table.createdAt),
    index("app_place_adjustment_log_specialist_created_idx").on(table.specialistId, table.createdAt),
    check("app_place_adjustment_log_reason_check", sql`${table.reason} in ('swap_for_hidden_gem', 'fix_logistics_bottleneck')`)
  ]
);

export const authSchema = {
  account: authAccounts,
  session: authSessions,
  user: authUsers,
  verification: authVerifications
};
