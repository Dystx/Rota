import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ai", "@repo/config", "@repo/db", "@repo/routing", "@repo/ui", "@repo/types", "@repo/workers"],
  // Server Actions cap request bodies at 1MB by default. The trip-brief
  // Route Action payload is small today, but the cinematic trip page posts
  // feature collections + brief edits that we expect to push past 1MB as
  // the product grows. 4MB matches Vercel's documented limit for the
  // Node.js runtime and is the limit we ship in this Next.js 16 + Turbopack
  // build. See docs/ops/serverless-database-connections.md for the
  // corresponding operational notes (Supabase pooler, body size, etc.).
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb"
    }
  },
  // Next.js 16 ships a built-in dev tools indicator (the floating
  // "N" badge in the bottom-left of every page). It's a dev-only
  // affordance but it ships in the dev build and clutters the UI
  // during design review. Disabled in this repo so screenshots
  // and Playwright captures show the real layout, not the
  // developer's toolbar.
  devIndicators: false
};

// `withSentryConfig` is a no-op in the absence of
// `SENTRY_DSN` / `SENTRY_AUTH_TOKEN` (the SDK detects the
// missing DSN at the config files). `silent: !SENTRY_DSN`
// keeps the build log clean in dev/preview; `dryRun`
// skips the Sentry CLI source-map upload step when the
// auth token is missing.
const sentryBuildOptions = {
  silent: !process.env.SENTRY_DSN,
  hideSourceMaps: true,
  disableLogger: true,
  dryRun: !process.env.SENTRY_AUTH_TOKEN,
  // Turbopack-friendly: the @sentry/nextjs build plugin
  // walks the .next output to inject the SDK; the v8
  // SDK supports Next.js 15+ and works with Turbopack.
  widenClientFileUpload: true
} as Parameters<typeof withSentryConfig>[1];

export default process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryBuildOptions)
  : nextConfig;
