import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ai", "@repo/db", "@repo/routing", "@repo/ui", "@repo/types"]
};

export default nextConfig;
