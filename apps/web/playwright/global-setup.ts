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
): Promise<void> {
  // Idempotent: try create; if exists, find and update app_metadata.
  const created = await admin.auth.admin.createUser({
    app_metadata: { role },
    email,
    email_confirm: true,
    password
  });

  if (!created.error) return;

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
    await ensurePersona(adminClient, persona.email, password, persona.role);
    const state = await captureStorageStateForPersona(supabaseUrl, anonKey, persona.email, password);
    const target = path.join(AUTH_DIR, persona.fileName);
    fs.writeFileSync(target, JSON.stringify(state, null, 2), "utf8");
  }
}
