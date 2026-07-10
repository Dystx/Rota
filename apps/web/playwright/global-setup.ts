import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PersonaRole = "admin" | "reviewer" | "traveler";

type PersonaSpec = {
  email: string;
  fileName: string;
  role: PersonaRole;
};

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
  origins: Array<{
    localStorage: Array<{ name: string; value: string }>;
    origin: string;
  }>;
};

const E2E_BASE_URL: string = "http://127.0.0.1:3105";
const E2E_COOKIE_DOMAIN: string = "127.0.0.1";
const AUTH_DIR: string = path.join(__dirname, ".auth");

const PERSONAS: readonly PersonaSpec[] = [
  { email: "e2e-admin@rota.test", fileName: "admin.json", role: "admin" },
  { email: "e2e-reviewer@rota.test", fileName: "reviewer.json", role: "reviewer" },
  { email: "e2e-traveler@rota.test", fileName: "traveler.json", role: "traveler" }
];

function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(
      `[playwright global-setup] Missing required env var "${name}". ` +
        `Real Supabase auth fixtures require SUPABASE_SERVICE_ROLE_KEY, ` +
        `NEXT_PUBLIC_SUPABASE_URL (or E2E_SUPABASE_URL), ` +
        `NEXT_PUBLIC_SUPABASE_ANON_KEY, and E2E_TEST_USER_PASSWORD.`
    );
  }
  return value;
}

function loadDotEnvLocal(): void {
  const candidates: string[] = [
    path.join(__dirname, "..", ".env.local"),
    path.join(__dirname, "..", ".env")
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (line.length === 0 || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined || process.env[key] === "") {
        process.env[key] = value;
      }
    }
  }
}

async function ensurePersona(
  admin: SupabaseClient,
  email: string,
  password: string,
  role: PersonaRole
): Promise<string> {
  // Idempotent: try create; if exists, find and update app_metadata.
  const created = await admin.auth.admin.createUser({
    app_metadata: { role },
    email,
    email_confirm: true,
    password
  });

  if (!created.error && created.data.user) return created.data.user.id;

  // Find existing user by paginating list (small test cohort, fine).
  let userId: string | null = null;
  let pageNumber = 1;
  while (userId === null) {
    const list = await admin.auth.admin.listUsers({ page: pageNumber, perPage: 200 });
    if (list.error) {
      throw new Error(
        `[playwright global-setup] Failed to list users while reconciling "${email}": ${list.error.message}`
      );
    }
    const match = list.data.users.find((u) => u.email === email);
    if (match) {
      userId = match.id;
      break;
    }
    if (list.data.users.length < 200) break;
    pageNumber += 1;
    if (pageNumber > 25) break;
  }

  if (userId === null) {
    throw new Error(
      `[playwright global-setup] createUser failed and existing user not found for "${email}": ${created.error.message}`
    );
  }

  const updated = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role },
    email_confirm: true,
    password
  });
  if (updated.error) {
    throw new Error(
      `[playwright global-setup] Failed to update existing persona "${email}": ${updated.error.message}`
    );
  }

  return userId;
}

async function ensureProfile(admin: SupabaseClient, userId: string, email: string, role: PersonaRole): Promise<void> {
  const profile = await admin.from("user_profiles").upsert(
    {
      app_role: role,
      display_name: `E2E ${role} persona`,
      user_id: userId
    },
    { onConflict: "user_id" }
  );

  if (profile.error) {
    throw new Error(`[playwright global-setup] Could not seed ${email} role profile: ${profile.error.message}`);
  }
}

const E2E_TRIP_TITLE = "Playwright-owned Portugal route [e2e-fixture]";
const E2E_TRIP_RAW_INPUT = "Playwright-owned traveler fixture [e2e-fixture]";

type TravelerTripFixture = {
  tripId: string;
  tripBriefId: string;
  ownerUserId: string;
};

async function ensureTravelerTrip(admin: SupabaseClient, travelerEmail: string): Promise<TravelerTripFixture> {
  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (users.error) throw new Error(`[playwright global-setup] Could not list users for trip fixture: ${users.error.message}`);
  const traveler = users.data.users.find((user) => user.email === travelerEmail);
  if (!traveler) throw new Error(`[playwright global-setup] Traveler persona missing for trip fixture.`);

  // Reuse only the fixture that this setup created for this exact persona and
  // marker. Never inspect or mutate a well-known id from the hosted project.
  const existing = await admin
    .from("trips")
    .select("id,trip_brief_id,owner_user_id")
    .eq("owner_user_id", traveler.id)
    .eq("title", E2E_TRIP_TITLE)
    .limit(1)
    .maybeSingle();
  if (existing.error) throw new Error(`[playwright global-setup] Could not inspect owned trip fixture: ${existing.error.message}`);
  if (existing.data) {
    return {
      ownerUserId: traveler.id,
      tripBriefId: String(existing.data.trip_brief_id),
      tripId: String(existing.data.id)
    };
  }

  const brief = {
    destination_country: "portugal",
    destination_regions: ["lisbon", "douro-valley"],
    start_date: "2027-04-10",
    end_date: "2027-04-15",
    trip_length_days: 5,
    travelers_count: 2,
    traveler_type: "couple",
    budget_level: "mid-range",
    pace: "calm",
    interests: ["local-food", "old-streets", "sea-views"],
    food_preferences: ["casual-local-meals"],
    avoidances: ["rushed-schedules"],
    transport_mode: "train-and-transfers",
    accommodation_location: "Lisbon historic center",
    raw_input: E2E_TRIP_RAW_INPUT,
    normalized_json: {
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
    },
    owner_user_id: traveler.id,
    status: "submitted"
  };

  // Prefer the transaction RPC so a failed trip insert cannot leave a partial
  // brief behind. It allocates the identity id server-side.
  const created = await admin.rpc("create_trip_draft", {
    p_accommodation_location: brief.accommodation_location,
    p_avoidances: brief.avoidances,
    p_budget_level: brief.budget_level,
    p_destination_country: brief.destination_country,
    p_destination_regions: brief.destination_regions,
    p_end_date: brief.end_date,
    p_food_preferences: brief.food_preferences,
    p_interests: brief.interests,
    p_normalized_json: brief.normalized_json,
    p_owner_user_id: traveler.id,
    p_pace: brief.pace,
    p_raw_input: brief.raw_input,
    p_start_date: brief.start_date,
    p_title: E2E_TRIP_TITLE,
    p_transport_mode: brief.transport_mode,
    p_traveler_type: brief.traveler_type,
    p_travelers_count: brief.travelers_count,
    p_trip_length_days: brief.trip_length_days
  }).single();
  let row = created.data as { trip_id?: number | string; trip_brief_id?: number | string } | null;
  if (created.error || !row) {
    // Some hosted projects have not applied the transaction RPC migration yet.
    // Fall back to two service-role inserts with no caller-supplied identity
    // id. Cleanup keeps the brief table consistent if the second insert fails.
    const insertedBrief = await admin.from("trip_briefs").insert(brief).select("id").single();
    if (insertedBrief.error || !insertedBrief.data) {
      throw new Error(
        `[playwright global-setup] Could not create owned trip fixture via RPC (${created.error?.message ?? "no row"}) or direct brief insert (${insertedBrief.error?.message ?? "unknown error"}).`
      );
    }

    const insertedTrip = await admin
      .from("trips")
      .insert({
        country_slug: "portugal",
        has_human_review: false,
        is_paid: false,
        owner_user_id: traveler.id,
        status: "draft",
        title: E2E_TRIP_TITLE,
        trip_brief_id: insertedBrief.data.id,
        visibility: "private"
      })
      .select("id,trip_brief_id")
      .single();
    if (insertedTrip.error || !insertedTrip.data) {
      await admin.from("trip_briefs").delete().eq("id", insertedBrief.data.id);
      throw new Error(
        `[playwright global-setup] Could not create owned trip fixture via RPC (${created.error?.message ?? "no row"}) or direct trip insert (${insertedTrip.error?.message ?? "unknown error"}).`
      );
    }
    row = insertedTrip.data as { trip_id?: number | string; trip_brief_id?: number | string };
    row.trip_id = (insertedTrip.data as { id: number | string }).id;
  }

  if (row.trip_id === undefined || row.trip_brief_id === undefined) {
    throw new Error("[playwright global-setup] Trip fixture RPC returned an invalid row.");
  }

  return {
    ownerUserId: traveler.id,
    tripBriefId: String(row.trip_brief_id),
    tripId: String(row.trip_id)
  };
}

async function ensureReviewerLink(admin: SupabaseClient, reviewerEmail: string): Promise<void> {
  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (users.error) throw new Error(`[playwright global-setup] Could not list users for reviewer fixture: ${users.error.message}`);
  const reviewerUser = users.data.users.find((user) => user.email === reviewerEmail);
  if (!reviewerUser) throw new Error("[playwright global-setup] Reviewer persona missing for reviewer fixture.");

  const reviewerId = "e2e-reviewer";
  const reviewer = await admin.from("reviewers").upsert({
    id: reviewerId,
    name: "E2E Portugal Reviewer",
    country: "Portugal",
    regions: ["lisbon", "douro-valley"],
    languages: ["en", "pt"],
    specialties: ["Pacing", "Local food"],
    status: "Active",
    rating: 5,
    bio: "Playwright-owned reviewer fixture.",
    response_promise: "Within one business day"
  }, { onConflict: "id" }).select("id").single();
  if (reviewer.error || !reviewer.data) throw new Error(`[playwright global-setup] Could not seed reviewer fixture: ${reviewer.error?.message ?? "no row"}`);

  const profile = await admin.from("user_profiles").upsert({
    user_id: reviewerUser.id,
    app_role: "reviewer",
    display_name: "E2E Portugal Reviewer"
  }, { onConflict: "user_id" });
  if (profile.error) throw new Error(`[playwright global-setup] Could not seed reviewer role profile: ${profile.error.message}`);

  const link = await admin.from("reviewer_auth_links").upsert({
    user_id: reviewerUser.id,
    reviewer_id: reviewerId
  }, { onConflict: "user_id" });
  if (link.error) throw new Error(`[playwright global-setup] Could not link reviewer persona: ${link.error.message}`);
}

function unquoteCookieValue(value: string): string {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  return value;
}

async function captureStorageStateForPersona(
  supabaseUrl: string,
  anonKey: string,
  email: string,
  password: string
): Promise<StorageStateFile> {
  const cookieJar: Map<string, { options: CookieOptions; value: string }> = new Map();

  const ssrClient = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return Array.from(cookieJar.entries()).map(([name, entry]) => ({
          name,
          value: entry.value
        }));
      },
      setAll(cookiesToSet) {
        for (const { name, options, value } of cookiesToSet) {
          if (value === "" || value === undefined) {
            cookieJar.delete(name);
          } else {
            cookieJar.set(name, { options: options ?? {}, value });
          }
        }
      }
    }
  });

  const signIn = await ssrClient.auth.signInWithPassword({ email, password });
  if (signIn.error || !signIn.data.session) {
    throw new Error(
      `[playwright global-setup] signInWithPassword failed for "${email}": ${signIn.error?.message ?? "no session returned"}`
    );
  }

  const expiresUnix: number = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const cookies: CookieRecord[] = Array.from(cookieJar.entries()).map(([name, entry]) => ({
    domain: E2E_COOKIE_DOMAIN,
    expires: expiresUnix,
    httpOnly: false,
    name,
    path: "/",
    sameSite: "Lax",
    secure: false,
    value: unquoteCookieValue(entry.value)
  }));

  return {
    cookies,
    origins: [{ localStorage: [], origin: E2E_BASE_URL }]
  };
}

export default async function globalSetup(): Promise<void> {
  loadDotEnvLocal();

  const supabaseUrl: string =
    process.env.E2E_SUPABASE_URL && process.env.E2E_SUPABASE_URL.length > 0
      ? process.env.E2E_SUPABASE_URL
      : readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey: string = readRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceRoleKey: string = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const password: string = readRequiredEnv("E2E_TEST_USER_PASSWORD");

  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const adminClient: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  for (const persona of PERSONAS) {
    const userId = await ensurePersona(adminClient, persona.email, password, persona.role);
    await ensureProfile(adminClient, userId, persona.email, persona.role);
    const state = await captureStorageStateForPersona(supabaseUrl, anonKey, persona.email, password);
    const target = path.join(AUTH_DIR, persona.fileName);
    fs.writeFileSync(target, JSON.stringify(state, null, 2), "utf8");
  }

  const travelerTrip = await ensureTravelerTrip(adminClient, "e2e-traveler@rota.test");
  fs.writeFileSync(
    path.join(AUTH_DIR, "traveler-trip.json"),
    JSON.stringify(travelerTrip, null, 2),
    "utf8"
  );
  await ensureReviewerLink(adminClient, "e2e-reviewer@rota.test");
}
