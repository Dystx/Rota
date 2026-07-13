import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./packages/db/src/schema/index.ts",
  breakpoints: true,
  strict: true,
  verbose: true
});
