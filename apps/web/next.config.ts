import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ai", "@repo/config", "@repo/db", "@repo/maps", "@repo/routing", "@repo/ui", "@repo/types"]
};

export default nextConfig;
