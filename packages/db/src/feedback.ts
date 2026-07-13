import "server-only";

import { sql } from "drizzle-orm";

import { getDatabase } from "./connection";
import { activityFeedback } from "./schema";

export type ActivityFeedbackRecord = {
  activityIds: readonly string[];
  note?: string;
  ownerUserId?: string | null;
  rating: number;
  source: "activity-day" | "activity-detail" | "feedback-page";
};

export async function consumeActivityFeedbackToken(maxPerMinute: number): Promise<boolean> {
  const result = await getDatabase().execute<{ accepted: boolean }>(sql`
    select private.consume_activity_feedback_token(${maxPerMinute}) as accepted
  `);

  return result.rows[0]?.accepted === true;
}

export async function persistActivityFeedback(record: ActivityFeedbackRecord): Promise<void> {
  await getDatabase().insert(activityFeedback).values({
    activityIds: [...record.activityIds],
    note: record.note || null,
    ownerUserId: record.ownerUserId ?? null,
    rating: record.rating,
    source: record.source
  });
}
