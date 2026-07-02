import { test as base } from "@playwright/test";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createTravelerStorageState(): string {
  return path.resolve(__dirname, "..", ".auth", "traveler.json");
}

export const test = base.extend({});

export { expect } from "@playwright/test";
