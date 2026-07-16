import crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import pg from "pg";
import { hashPassword } from "better-auth/crypto";
import { createRumiaAuth } from "@repo/auth/factory";
import { fileURLToPath } from "node:url";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PersonaRole = "admin" | "reviewer" | "traveler" | "none";
type PersonaSpec = { email: string; legacyEmail: string; fileName: string; passwordEnv: string; role: PersonaRole; displayName: string };
type CookieRecord = {
  domain: string;
  expires: number;
  httpOnly: boolean;
  name: string;
  path: string;
  sameSite: "Lax" | "None" | "Strict";
  secure: boolean;
  value: string;
};
type StorageStateFile = {
  cookies: CookieRecord[];
  origins: Array<{ localStorage: Array<{ name: string; value: string }>; origin: string }>;
};
type TripFixtureRecord = { ownerUserId: string; tripBriefId: string; tripId: string };
type TripFixtureSeed = TripFixtureRecord & {
  hasHumanReview: boolean;
  isPaid: boolean;
  normalized: Record<string, unknown>;
  status: "draft" | "paid" | "in_review" | "reviewed";
  title: string;
};

const ADMIN_CAPABILITIES = [
  "content:manage",
  "operations:manage",
  "specialists:verify",
  "analytics:read",
  "configuration:deploy",
  "developer_docs:read"
] as const;

const FIXTURE_IDS = {
  assignedBrief: "00000000-0000-4000-8000-000000000400",
  assignedTrip: "00000000-0000-4000-8000-000000000401",
  assignedAssignment: "00000000-0000-4000-8000-000000000402",
  reviewedBrief: "00000000-0000-4000-8000-000000000403",
  reviewedTrip: "00000000-0000-4000-8000-000000000404",
  completedAssignment: "00000000-0000-4000-8000-000000000405",
  unassignedBrief: "00000000-0000-4000-8000-000000000406",
  unassignedTrip: "00000000-0000-4000-8000-000000000407",
  specialistProfile: "00000000-0000-4000-8000-000000000408",
  travelerBrief: "00000000-0000-4000-8000-000000000409",
  travelerTrip: "00000000-0000-4000-8000-000000000410"
} as const;

const E2E_BASE_URL = "http://127.0.0.1:3105";
const E2E_COOKIE_DOMAIN = "127.0.0.1";
const AUTH_DIR = path.join(__dirname, ".auth");
const PERSONAS: readonly PersonaSpec[] = [
  { email: "ops@rumia.test", legacyEmail: "e2e-admin@rota.test", fileName: "admin.json", passwordEnv: "E2E_TEST_USER_PASSWORD", role: "admin", displayName: "Rumia Operations" },
  { email: "limited-ops@rumia.test", legacyEmail: "e2e-admin-limited@rota.test", fileName: "admin-limited.json", passwordEnv: "E2E_TEST_USER_PASSWORD", role: "admin", displayName: "Rumia Limited Operations" },
  { email: "mara@rumia.test", legacyEmail: "e2e-reviewer@rota.test", fileName: "reviewer.json", passwordEnv: "E2E_TEST_USER_PASSWORD", role: "reviewer", displayName: "Mara Silva" },
  { email: "joana@rumia.test", legacyEmail: "e2e-traveler@rota.test", fileName: "traveler.json", passwordEnv: "E2E_TEST_USER_PASSWORD", role: "traveler", displayName: "Joana Costa" },
  { email: "ines@rumia.test", legacyEmail: "e2e-specialist-candidate@rota.test", fileName: "specialist-candidate.json", passwordEnv: "E2E_TEST_USER_PASSWORD", role: "traveler", displayName: "Inês Carvalho" }
];

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`[playwright global-setup] Missing required env var "${name}".`);
  return value;
}

function loadDotEnvLocal(): void {
  for (const file of [path.join(__dirname, "..", ".env.local"), path.join(__dirname, "..", ".env")]) {
    if (!fs.existsSync(file)) continue;
    for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/u)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator === -1) continue;
      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

async function upsertPersona(owner: pg.Pool, persona: PersonaSpec, password: string): Promise<string> {
  const existing = await owner.query<{ id: string }>(
    "select id from authn.user where lower(email) in (lower($1), lower($2)) order by case when lower(email) = lower($1) then 0 else 1 end limit 1",
    [persona.email, persona.legacyEmail]
  );
  const userId = existing.rows[0]?.id ?? crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  await owner.query(
    `insert into authn.user (id, name, email, email_verified)
     values ($1, $2, $3, true)
     on conflict (id) do update set name = excluded.name, email = excluded.email, email_verified = true, updated_at = now()`,
    [userId, persona.displayName, persona.email]
  );
  const account = await owner.query<{ id: string }>("select id from authn.account where user_id = $1 and provider_id = 'credential' limit 1", [userId]);
  if (account.rows[0]) {
    await owner.query("update authn.account set account_id = $1, password = $2, updated_at = now() where id = $3", [userId, passwordHash, account.rows[0].id]);
  } else {
    await owner.query("insert into authn.account (account_id, provider_id, user_id, password) values ($1::text, 'credential', $1::uuid, $2)", [userId, passwordHash]);
  }
  await owner.query(
    `insert into app.user_profiles (user_id, app_role, display_name)
     values ($1, $2, $3)
     on conflict (user_id) do update set app_role = excluded.app_role, display_name = excluded.display_name, updated_at = now()`,
    [userId, persona.role, persona.displayName]
  );
  if (persona.role === "reviewer") {
    await owner.query(
      `insert into app.reviewers (id, user_id, name, country, regions, languages, specialties, status, rating, bio, response_promise)
       values ('e2e-reviewer', $1, $2, 'Portugal', '{lisbon,douro-valley}', '{pt,en}', '{Pacing,Food}', 'Active', 5, 'Local reviewer focused on pacing and food.', 'Within one business day')
       on conflict (id) do update set user_id = excluded.user_id, name = excluded.name, status = excluded.status, bio = excluded.bio, response_promise = excluded.response_promise, updated_at = now()`,
      [userId, persona.displayName]
    );
  }
  return userId;
}

async function ensureCapabilityGrants(owner: pg.Pool, userId: string, capabilities: readonly string[]): Promise<void> {
  await owner.query("delete from app.capability_grants where subject_user_id = $1", [userId]);
  for (const capability of capabilities) {
    await owner.query(
      "insert into app.capability_grants (subject_user_id, app_role, capability, reason, granted_by) values ($1, 'admin', $2, 'Playwright capability fixture', $1)",
      [userId, capability]
    );
  }
}

function fixtureBrief(title: string): { humanBrief: string; normalized: Record<string, unknown> } {
  const humanBrief = `${title}: a calm Portugal route with local food and room to wander.`;
  return {
    humanBrief,
    normalized: {
      destinationCountry: "portugal",
      regions: ["lisbon", "douro-valley"],
      startDate: "2027-05-10",
      endDate: "2027-05-15",
      tripLengthDays: 5,
      travelersCount: 2,
      travelerType: "couple",
      budgetLevel: "mid-range",
      pace: "calm",
      interests: ["local-food", "old-streets", "sea-views"],
      foodPreferences: ["casual-local-meals"],
      avoidances: ["rushed-schedules"],
      transportMode: "train-and-transfers",
      accommodationLocation: "Lisbon historic center",
      rawBrief: humanBrief
    }
  };
}

async function ensureOwnedTrip(owner: pg.Pool, seed: TripFixtureSeed): Promise<TripFixtureRecord> {
  const { humanBrief } = fixtureBrief(seed.title);
  const existing = await owner.query<{ id: string; trip_brief_id: string }>(
    "select id, trip_brief_id from app.trips where owner_user_id = $1 and title = $2 order by created_at desc limit 1",
    [seed.ownerUserId, seed.title]
  );
  if (existing.rows[0]) {
    await owner.query(
      "update app.trips set status = $1, is_paid = $2, has_human_review = $3, updated_at = now() where id = $4",
      [seed.status, seed.isPaid, seed.hasHumanReview, existing.rows[0].id]
    );
    await owner.query(
      "update app.trip_briefs set raw_input = $1, normalized_json = $2, updated_at = now() where id = $3",
      [humanBrief, JSON.stringify(seed.normalized), existing.rows[0].trip_brief_id]
    );
    return { ownerUserId: seed.ownerUserId, tripBriefId: existing.rows[0].trip_brief_id, tripId: existing.rows[0].id };
  }

  await owner.query(
    `insert into app.trip_briefs
      (id, owner_user_id, destination_country, destination_regions, start_date, end_date, trip_length_days, travelers_count, traveler_type, budget_level, pace, interests, food_preferences, avoidances, transport_mode, accommodation_location, raw_input, normalized_json, status)
     values ($1, $2, 'portugal', '{lisbon,douro-valley}', '2027-05-10', '2027-05-15', 5, 2, 'couple', 'mid-range', 'calm', '{local-food,old-streets,sea-views}', '{casual-local-meals}', '{rushed-schedules}', 'train-and-transfers', 'Lisbon historic center', $4, $3, 'submitted')`,
    [seed.tripBriefId, seed.ownerUserId, JSON.stringify(seed.normalized), humanBrief]
  );
  await owner.query(
    `insert into app.trips (id, trip_brief_id, owner_user_id, country_slug, title, status, visibility, is_paid, has_human_review)
     values ($1, $2, $3, 'portugal', $4, $5, 'private', $6, $7)`,
    [seed.tripId, seed.tripBriefId, seed.ownerUserId, seed.title, seed.status, seed.isPaid, seed.hasHumanReview]
  );
  return { ownerUserId: seed.ownerUserId, tripBriefId: seed.tripBriefId, tripId: seed.tripId };
}

export async function ensureReviewerAssignment(
  owner: pg.Pool,
  assignmentId: string,
  tripId: string,
  reviewerUserId: string,
  status: "assigned" | "completed",
  notes: string
): Promise<void> {
  if (status === "assigned" || status === "completed") {
    await owner.query("delete from app.reviewer_assignments where trip_id = $1 and status in ('assigned', 'submitted')", [tripId]);
  }
  await owner.query(
    `insert into app.reviewer_assignments (id, trip_id, reviewer_user_id, status, notes, completed_at)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (id) do update set trip_id = excluded.trip_id, reviewer_user_id = excluded.reviewer_user_id, status = excluded.status, notes = excluded.notes, completed_at = excluded.completed_at, updated_at = now()`,
    [assignmentId, tripId, reviewerUserId, status, notes, status === "completed" ? "2027-05-04T12:00:00.000Z" : null]
  );
}

async function ensureSpecialistCandidate(owner: pg.Pool, userId: string): Promise<{ specialistId: string; userId: string }> {
  const profile = await owner.query<{ id: string }>(
    `insert into app.specialist_profiles (id, user_id, full_name, regions_covered, tier_3_on_call, tier_4_licensed_guide, is_verified, hourly_rate, bio)
     values ($1, $2, 'Inês Carvalho', '{}', false, false, false, 0, 'Portugal specialist candidate draft.')
     on conflict (user_id) do update set full_name = excluded.full_name, tier_3_on_call = false, tier_4_licensed_guide = false, is_verified = false, hourly_rate = 0, bio = excluded.bio
     returning id`,
    [FIXTURE_IDS.specialistProfile, userId]
  );
  const specialistId = profile.rows[0]?.id;
  if (!specialistId) throw new Error("[playwright global-setup] Specialist candidate fixture was not created.");
  await owner.query("delete from app.specialist_capabilities where specialist_id = $1", [specialistId]);
  return { specialistId, userId };
}

function parseSessionCookie(response: Response): CookieRecord {
  const setCookies = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [response.headers.get("set-cookie") ?? ""];
  const line = setCookies.find((candidate) => candidate.startsWith("better-auth.session_token="));
  if (!line) throw new Error("[playwright global-setup] Better Auth did not return a session cookie.");
  const [nameValue = ""] = line.split(";", 1);
  const separator = nameValue.indexOf("=");
  const value = decodeURIComponent(nameValue.slice(separator + 1));
  return {
    domain: E2E_COOKIE_DOMAIN,
    expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    httpOnly: true,
    name: nameValue.slice(0, separator),
    path: "/",
    sameSite: "Lax",
    secure: false,
    value
  };
}

async function captureStorageState(auth: ReturnType<typeof createRumiaAuth>, email: string, password: string): Promise<StorageStateFile> {
  const response = await auth.api.signInEmail({
    asResponse: true,
    body: { email, password, rememberMe: true },
    headers: new Headers({ origin: E2E_BASE_URL, "user-agent": "playwright-rumia-fixture" })
  });
  if (response.status !== 200) throw new Error(`[playwright global-setup] Better Auth sign-in failed for ${email} (${response.status}).`);
  return { cookies: [parseSessionCookie(response)], origins: [{ localStorage: [], origin: E2E_BASE_URL }] };
}

export async function ensureTravelerTrip(owner: pg.Pool, ownerUserId: string): Promise<{ tripId: string; tripBriefId: string; ownerUserId: string }> {
  const title = "Lisbon & Douro slow route";
  const legacyTitle = "Playwright-owned Portugal route [e2e-fixture]";
  const humanBrief = "A calm five-day Portugal route with local food and room to wander.";
  const existing = await owner.query<{ id: string; trip_brief_id: string }>(
    `select id, trip_brief_id
       from app.trips
      where owner_user_id = $1
        and title in ($2, $3)
        and status = 'draft'
        and is_paid = false
        and has_human_review = false
      order by case when title = $2 then 0 else 1 end, created_at desc
      limit 1`,
    [ownerUserId, title, legacyTitle]
  );
  if (existing.rows[0]) {
    return { ownerUserId, tripBriefId: existing.rows[0].trip_brief_id, tripId: existing.rows[0].id };
  }

  const collision = await owner.query<{ id: string }>(
    "select id from app.trip_briefs where id = $1 union all select id from app.trips where id = $2 limit 1",
    [FIXTURE_IDS.travelerBrief, FIXTURE_IDS.travelerTrip]
  );
  const briefId = collision.rows[0] ? crypto.randomUUID() : FIXTURE_IDS.travelerBrief;
  const tripId = collision.rows[0] ? crypto.randomUUID() : FIXTURE_IDS.travelerTrip;
  const normalized = {
    destinationCountry: "portugal",
    regions: ["lisbon", "douro-valley"],
    startDate: "2027-04-10",
    endDate: "2027-04-15",
    tripLengthDays: 5,
    travelersCount: 2,
    travelerType: "couple",
    budgetLevel: "mid-range",
    pace: "calm",
    interests: ["local-food", "old-streets", "sea-views"],
    foodPreferences: ["casual-local-meals"],
    avoidances: ["rushed-schedules"],
    transportMode: "train-and-transfers",
    accommodationLocation: "Lisbon historic center",
    rawBrief: "A calm five-day Portugal route with local food and room to wander."
  };
  await owner.query(
    `insert into app.trip_briefs
      (id, owner_user_id, destination_country, destination_regions, start_date, end_date, trip_length_days, travelers_count, traveler_type, budget_level, pace, interests, food_preferences, avoidances, transport_mode, accommodation_location, raw_input, normalized_json, status)
     values ($1, $2, 'portugal', '{lisbon,douro-valley}', '2027-04-10', '2027-04-15', 5, 2, 'couple', 'mid-range', 'calm', '{local-food,old-streets,sea-views}', '{casual-local-meals}', '{rushed-schedules}', 'train-and-transfers', 'Lisbon historic center', $4, $3, 'submitted')`,
    [briefId, ownerUserId, JSON.stringify(normalized), humanBrief]
  );
  await owner.query("insert into app.trips (id, trip_brief_id, owner_user_id, country_slug, title, status, visibility) values ($1, $2, $3, 'portugal', $4, 'draft', 'private')", [tripId, briefId, ownerUserId, title]);
  return { ownerUserId, tripBriefId: briefId, tripId };
}

export default async function globalSetup(): Promise<void> {
  loadDotEnvLocal();
  process.env.NEXT_PUBLIC_APP_URL ||= E2E_BASE_URL;
  process.env.BETTER_AUTH_SECRET ||= readRequiredEnv("BETTER_AUTH_SECRET");
  const ownerUrl = process.env.RUMIA_OWNER_DATABASE_URL?.trim() || readRequiredEnv("DATABASE_URL");
  const password = readRequiredEnv("E2E_TEST_USER_PASSWORD");
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const owner = new Pool({ connectionString: ownerUrl, max: 4, options: "-c search_path=authn,app,public" });
  const auth = createRumiaAuth({ database: owner });
  try {
    const userIds = new Map<string, string>();
    for (const persona of PERSONAS) {
      const userId = await upsertPersona(owner, persona, password);
      userIds.set(persona.fileName, userId);
      const state = await captureStorageState(auth, persona.email, password);
      fs.writeFileSync(path.join(AUTH_DIR, persona.fileName), JSON.stringify(state, null, 2), "utf8");
    }
    const adminUserId = userIds.get("admin.json");
    const limitedAdminUserId = userIds.get("admin-limited.json");
    const reviewerUserId = userIds.get("reviewer.json");
    const travelerUserId = userIds.get("traveler.json");
    const specialistCandidateUserId = userIds.get("specialist-candidate.json");
    if (!adminUserId || !limitedAdminUserId || !reviewerUserId || !specialistCandidateUserId) {
      throw new Error("[playwright global-setup] Required operator and specialist fixtures were not created.");
    }
    if (!travelerUserId) throw new Error("[playwright global-setup] Traveler fixture was not created.");
    fs.writeFileSync(path.join(AUTH_DIR, "traveler-trip.json"), JSON.stringify(await ensureTravelerTrip(owner, travelerUserId), null, 2), "utf8");

    await ensureCapabilityGrants(owner, adminUserId, ADMIN_CAPABILITIES);
    await ensureCapabilityGrants(owner, limitedAdminUserId, []);

    const assignedBrief = fixtureBrief("Assigned reviewer route");
    const assignedTrip = await ensureOwnedTrip(owner, {
      hasHumanReview: false,
      isPaid: true,
      normalized: assignedBrief.normalized,
      ownerUserId: travelerUserId,
      status: "in_review",
      title: "Assigned reviewer route",
      tripBriefId: FIXTURE_IDS.assignedBrief,
      tripId: FIXTURE_IDS.assignedTrip
    });
    const reviewedBrief = fixtureBrief("Reviewed Portugal route");
    const reviewedTrip = await ensureOwnedTrip(owner, {
      hasHumanReview: true,
      isPaid: true,
      normalized: reviewedBrief.normalized,
      ownerUserId: travelerUserId,
      status: "reviewed",
      title: "Reviewed Portugal route",
      tripBriefId: FIXTURE_IDS.reviewedBrief,
      tripId: FIXTURE_IDS.reviewedTrip
    });
    const unassignedBrief = fixtureBrief("Unassigned reviewer route");
    const unassignedTrip = await ensureOwnedTrip(owner, {
      hasHumanReview: false,
      isPaid: true,
      normalized: unassignedBrief.normalized,
      ownerUserId: specialistCandidateUserId,
      status: "paid",
      title: "Unassigned reviewer route",
      tripBriefId: FIXTURE_IDS.unassignedBrief,
      tripId: FIXTURE_IDS.unassignedTrip
    });
    await ensureReviewerAssignment(owner, FIXTURE_IDS.assignedAssignment, assignedTrip.tripId, reviewerUserId, "assigned", "Review pacing and local substitutions.");
    await ensureReviewerAssignment(owner, FIXTURE_IDS.completedAssignment, reviewedTrip.tripId, reviewerUserId, "completed", "Reviewed route with calmer pacing and local food stops.");

    fs.writeFileSync(
      path.join(AUTH_DIR, "reviewer-trip.json"),
      JSON.stringify({ reviewerUserId, assignedTripId: assignedTrip.tripId, completedTripId: reviewedTrip.tripId, unassignedTripId: unassignedTrip.tripId }, null, 2),
      "utf8"
    );
    fs.writeFileSync(path.join(AUTH_DIR, "reviewed-trip.json"), JSON.stringify(reviewedTrip, null, 2), "utf8");
    fs.writeFileSync(path.join(AUTH_DIR, "admin-limited-record.json"), JSON.stringify({ userId: limitedAdminUserId }, null, 2), "utf8");
    fs.writeFileSync(
      path.join(AUTH_DIR, "specialist-candidate-record.json"),
      JSON.stringify(await ensureSpecialistCandidate(owner, specialistCandidateUserId), null, 2),
      "utf8"
    );
  } finally {
    await owner.end();
  }
}
