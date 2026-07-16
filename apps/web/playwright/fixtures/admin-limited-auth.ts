import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.resolve(__dirname, "..", ".auth", "admin-limited-record.json");
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export type AdminLimitedAuthFixture = {
  userId: string;
};

const CONTRACT_FIXTURE: AdminLimitedAuthFixture = {
  userId: "00000000-0000-4000-8000-000000000411"
};

function parseFixture(value: unknown): AdminLimitedAuthFixture {
  if (!value || typeof value !== "object") {
    throw new Error("[playwright] Limited admin fixture is not an object.");
  }
  const userId = (value as { userId?: unknown }).userId;
  if (typeof userId !== "string" || !UUID_PATTERN.test(userId)) {
    throw new Error("[playwright] Limited admin fixture has an invalid user ID.");
  }
  return { userId };
}

export function readAdminLimitedAuthFixture(): AdminLimitedAuthFixture {
  if (!fs.existsSync(FIXTURE_PATH)) return CONTRACT_FIXTURE;
  return parseFixture(JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")));
}

export function createAdminLimitedStorageState(): string {
  return path.resolve(__dirname, "..", ".auth", "admin-limited.json");
}
