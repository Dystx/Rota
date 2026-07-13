import { createPublicConfig } from "@repo/config/public";
import { createServerAuthConfig } from "@repo/config/server";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import type { BetterAuthOptions } from "better-auth";

type RumiaAuthFactoryOptions = {
  database: BetterAuthOptions["database"];
  onUserCreated?: (user: { id: string; name: string }) => Promise<void>;
};

/**
 * Build the Better Auth instance used by the Next server and local E2E
 * fixture setup. Keeping construction in a server-only wrapper lets the
 * fixture setup exercise the exact same auth/database contract without
 * importing Next's `server-only` guard in a standalone Node process.
 */
export function createRumiaAuth(options: RumiaAuthFactoryOptions) {
  const { betterAuthSecret } = createServerAuthConfig();
  const { appUrl } = createPublicConfig();

  return betterAuth({
    baseURL: appUrl,
    database: options.database,
    secret: betterAuthSecret,
    trustedOrigins: [appUrl],
    emailAndPassword: {
      enabled: true
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => options.onUserCreated?.(user)
        }
      }
    },
    user: {
      fields: {
        emailVerified: "email_verified",
        createdAt: "created_at",
        updatedAt: "updated_at"
      }
    },
    session: {
      fields: {
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
        ipAddress: "ip_address",
        userAgent: "user_agent",
        userId: "user_id"
      }
    },
    account: {
      fields: {
        accountId: "account_id",
        providerId: "provider_id",
        userId: "user_id",
        accessToken: "access_token",
        refreshToken: "refresh_token",
        idToken: "id_token",
        accessTokenExpiresAt: "access_token_expires_at",
        refreshTokenExpiresAt: "refresh_token_expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at"
      }
    },
    verification: {
      fields: {
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at"
      }
    },
    advanced: {
      database: {
        generateId: "uuid"
      }
    },
    plugins: [nextCookies()]
  });
}
