import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@repo/ui": new URL("../ui/src/index.ts", import.meta.url).pathname
    }
  },
  test: {
    environment: "jsdom"
  }
});
