import assert from "node:assert/strict";
import test from "node:test";

import { findForbiddenTrackedPaths } from "./check-sensitive-paths.mjs";

test("rejects runtime and credential-bearing tracked paths", () => {
  assert.deepEqual(
    findForbiddenTrackedPaths([
      "apps/web/app/page.tsx",
      "supabase/.temp/project-ref",
      "apps/web/playwright/.auth/traveler.json",
      ".env.local",
      ".env.example"
    ]),
    [
      "supabase/.temp/project-ref",
      "apps/web/playwright/.auth/traveler.json",
      ".env.local"
    ]
  );
});
