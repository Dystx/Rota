import "server-only";

import { ensureTravelerProfile } from "@repo/db";
import { getDatabasePool } from "@repo/db/connection";
import { createRumiaAuth } from "./factory";

/** Better Auth instance backed by the private PostgreSQL pool. */
export const auth = createRumiaAuth({
  database: getDatabasePool(),
  onUserCreated: (user) => ensureTravelerProfile(user.id, user.name)
});
