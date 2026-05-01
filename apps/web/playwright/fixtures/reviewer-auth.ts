import { test as base } from "@playwright/test";

export function createReviewerStorageState() {
  return {
    cookies: [
      {
        name: "sb-localhost-auth-token",
        value: "mock-reviewer-token",
        domain: "localhost",
        path: "/",
        expires: Date.now() / 1000 + 60 * 60 * 24 * 7,
        httpOnly: false,
        secure: false,
        sameSite: "Lax",
      },
    ],
    origins: [
      {
        origin: "http://localhost:3000",
        localStorage: [
          {
            name: "supabase.auth.token",
            value: JSON.stringify({
              currentSession: {
                user: {
                  id: "ines-almeida",
                  role: "reviewer",
                },
              },
            }),
          },
        ],
      },
    ],
  };
}

export const test = base.extend({
  // Add fixture logic if needed later
});

export { expect } from "@playwright/test";
