import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@repo/analytics": new URL("../analytics/src/index.ts", import.meta.url).pathname,
      "@repo/ui": new URL("../ui/src/index.ts", import.meta.url).pathname
    }
  },
  test: {
    environment: "jsdom"
  }
});
