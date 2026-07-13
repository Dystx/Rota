#!/usr/bin/env node

import crypto from "node:crypto";
import process from "node:process";
import pg from "pg";
import { hashPassword } from "better-auth/crypto";

const { Pool } = pg;

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
      languages: ["pt", "en"],
      name: "Ines Almeida",
      rating: 4.8,
      regions: ["lisbon", "porto"],
      responsePromise: "Replies within one local test cycle.",
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
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function upsertAuthUser(owner, persona, passwordHash) {
  const existing = await owner.query("select id from authn.user where lower(email) = lower($1) limit 1", [persona.email]);
  const userId = existing.rows[0]?.id ?? crypto.randomUUID();

  await owner.query(
    `insert into authn.user (id, name, email, email_verified)
     values ($1, $2, $3, true)
     on conflict (id) do update set name = excluded.name, email = excluded.email, email_verified = true, updated_at = now()`,
    [userId, persona.displayName, persona.email]
  );

  const account = await owner.query(
    "select id from authn.account where user_id = $1 and provider_id = 'credential' limit 1",
    [userId]
  );
  if (account.rows[0]) {
    await owner.query(
      "update authn.account set account_id = $1, password = $2, updated_at = now() where id = $3",
      [userId, passwordHash, account.rows[0].id]
    );
  } else {
    await owner.query(
      `insert into authn.account (account_id, provider_id, user_id, password)
       values ($1::text, 'credential', $1::uuid, $2)`,
      [userId, passwordHash]
    );
  }

  return userId;
}

async function upsertProfile(owner, userId, persona) {
  await owner.query(
    `insert into app.user_profiles (user_id, app_role, display_name)
     values ($1, $2, $3)
     on conflict (user_id) do update set app_role = excluded.app_role, display_name = excluded.display_name, updated_at = now()`,
    [userId, persona.role, persona.displayName]
  );
}

async function upsertReviewer(owner, userId, reviewer) {
  await owner.query(
    `insert into app.reviewers
      (id, user_id, name, country, regions, languages, specialties, status, rating, bio, response_promise)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     on conflict (id) do update set
       user_id = excluded.user_id,
       name = excluded.name,
       country = excluded.country,
       regions = excluded.regions,
       languages = excluded.languages,
       specialties = excluded.specialties,
       status = excluded.status,
       rating = excluded.rating,
       bio = excluded.bio,
       response_promise = excluded.response_promise,
       updated_at = now()`,
    [
      reviewer.id,
      userId,
      reviewer.name,
      reviewer.country,
      reviewer.regions,
      reviewer.languages,
      reviewer.specialties,
      reviewer.status,
      reviewer.rating,
      reviewer.bio,
      reviewer.responsePromise
    ]
  );
}

async function main() {
  const owner = new Pool({ connectionString: requiredEnv("RUMIA_OWNER_DATABASE_URL") });
  try {
    for (const persona of personas) {
      const password = requiredEnv(persona.passwordEnv);
      const passwordHash = await hashPassword(password);
      const userId = await upsertAuthUser(owner, persona, passwordHash);
      await upsertProfile(owner, userId, persona);
      if (persona.reviewer) await upsertReviewer(owner, userId, persona.reviewer);
      console.log(`${persona.email}: role=${persona.role}`);
    }
  } finally {
    await owner.end();
  }

  console.log("Local Better Auth personas seeded. Passwords were read from the local environment and were not printed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
