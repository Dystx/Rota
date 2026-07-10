import assert from "node:assert/strict";
import test from "node:test";

import { getPolicyTestFiles } from "./run-policy-tests.mjs";

test("discovers policy SQL files in sorted order", () => {
  assert.deepEqual(
    getPolicyTestFiles(["z.sql", "README.md", "a.sql"]),
    ["a.sql", "z.sql"]
  );
});

test("rejects an empty policy suite", () => {
  assert.throws(() => getPolicyTestFiles([]), /No policy SQL files/);
});
