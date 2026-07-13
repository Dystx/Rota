import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("PostgreSQL activity feedback repository", () => {
  let ownerPool: import("pg").Pool;
  let consumeActivityFeedbackToken: typeof import("./feedback").consumeActivityFeedbackToken;
  let persistActivityFeedback: typeof import("./feedback").persistActivityFeedback;

  beforeAll(async () => {
    process.env.DATABASE_URL = "postgresql:///rumia?user=rumia_app";
    const { Pool } = await import("pg");
    ownerPool = new Pool({ connectionString: "postgresql:///rumia?user=rumia_owner", max: 1 });
    ({ consumeActivityFeedbackToken, persistActivityFeedback } = await import("./feedback"));
  });

  afterAll(async () => {
    await ownerPool.query("delete from app.activity_feedback where note = $1", ["postgres feedback integration"]);
    await ownerPool.query("delete from private.activity_feedback_rate_limit");
    await ownerPool.end();
  });

  it("uses the database rate-limit function and inserts anonymous feedback through RLS", async () => {
    await expect(consumeActivityFeedbackToken(2)).resolves.toBe(true);
    await persistActivityFeedback({
      activityIds: ["porto-ribeira-slow-walk"],
      note: "postgres feedback integration",
      rating: 4,
      source: "activity-day"
    });

    const rows = await ownerPool.query<{ count: string }>("select count(*)::text as count from app.activity_feedback where note = $1", [
      "postgres feedback integration"
    ]);
    expect(rows.rows[0]?.count).toBe("1");
  });
});
