import { createClient } from "@supabase/supabase-js";

const personas = [
  {
    displayName: "Local Traveler",
    email: "traveler@example.com",
    passwordEnv: "ROTA_TRAVELER_PASSWORD",
    role: "traveler"
  },
  {
    displayName: "Ines Almeida",
    email: "reviewer@example.com",
    passwordEnv: "ROTA_REVIEWER_PASSWORD",
    reviewer: {
      bio: "Local deterministic reviewer persona for non-production testing.",
      country: "Portugal",
      id: "ines-almeida",
      languages: ["Portuguese", "English"],
      name: "Ines Almeida",
      rating: 4.8,
      regions: ["lisbon", "porto"],
      response_promise: "Replies within one local test cycle.",
      specialties: ["family trips", "food", "rail routes"],
      status: "Active"
    },
    role: "reviewer"
  },
  {
    displayName: "Local Admin",
    email: "admin@example.com",
    passwordEnv: "ROTA_ADMIN_PASSWORD",
    role: "admin"
  },
  {
    displayName: "Local Outsider",
    email: "outsider@example.com",
    passwordEnv: "ROTA_OUTSIDER_PASSWORD",
    role: "none"
  }
];

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function findUserByEmail(supabase, email) {
  let page = 1;

  while (page < 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });

    if (error) {
      throw new Error(error.message);
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      return null;
    }

    page += 1;
  }

  throw new Error(`Could not find ${email}; local auth user list exceeded the seed script page limit.`);
}

async function upsertAuthUser(supabase, persona) {
  const password = requiredEnv(persona.passwordEnv);
  const existingUser = await findUserByEmail(supabase, persona.email);
  const attributes = {
    app_metadata: { role: persona.role },
    email: persona.email,
    email_confirm: true,
    password,
    user_metadata: { display_name: persona.displayName }
  };

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, attributes);

    if (error || !data.user) {
      throw new Error(error?.message ?? `Failed to update ${persona.email}.`);
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser(attributes);

  if (error || !data.user) {
    throw new Error(error?.message ?? `Failed to create ${persona.email}.`);
  }

  return data.user;
}

async function upsertProfile(supabase, user, persona) {
  const { error } = await supabase.from("user_profiles").upsert(
    {
      app_role: persona.role,
      display_name: persona.displayName,
      updated_at: new Date().toISOString(),
      user_id: user.id
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function upsertReviewer(supabase, user, reviewer) {
  const { error: reviewerError } = await supabase.from("reviewers").upsert(reviewer, { onConflict: "id" });

  if (reviewerError) {
    throw new Error(reviewerError.message);
  }

  const { error: linkError } = await supabase.from("reviewer_auth_links").upsert(
    {
      reviewer_id: reviewer.id,
      user_id: user.id
    },
    { onConflict: "user_id" }
  );

  if (linkError) {
    throw new Error(linkError.message);
  }
}

async function main() {
  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });

  for (const persona of personas) {
    const user = await upsertAuthUser(supabase, persona);
    await upsertProfile(supabase, user, persona);

    if (persona.reviewer) {
      await upsertReviewer(supabase, user, persona.reviewer);
    }

    console.log(`${persona.email}: role=${persona.role}`);
  }

  console.log("Local personas seeded. Passwords were read from local environment variables and were not printed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
