import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ai", "@repo/config", "@repo/db", "@repo/routing", "@repo/ui", "@repo/types"],
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
  }
};

export default nextConfig;
