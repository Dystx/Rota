import { z } from "zod";

import {
  consumeActivityFeedbackToken as consumePostgresActivityFeedbackToken,
  persistActivityFeedback as persistPostgresActivityFeedback
} from "@repo/db";
import { internalError, validationError } from "@/lib/auth/api";

const MAX_ACTIVITY_FEEDBACK_PER_MINUTE = 20;

const ActivityFeedbackSchema = z
  .object({
    activityIds: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).min(1).max(5),
    rating: z.number().int().min(1).max(5),
    note: z.string().trim().max(600).optional(),
    source: z.enum(["activity-day", "activity-detail", "feedback-page"]).default("feedback-page")
  })
  .refine((value) => new Set(value.activityIds).size === value.activityIds.length, {
    message: "Activities must be unique.",
    path: ["activityIds"]
  });

type ActivityFeedback = z.infer<typeof ActivityFeedbackSchema>;

export type ActivityFeedbackDependencies = {
  consume?: () => Promise<boolean>;
  persist?: (feedback: ActivityFeedback) => Promise<void>;
};

async function consumeActivityFeedbackToken(): Promise<boolean> {
  return consumePostgresActivityFeedbackToken(MAX_ACTIVITY_FEEDBACK_PER_MINUTE);
}

async function persistActivityFeedback(feedback: ActivityFeedback): Promise<void> {
  await persistPostgresActivityFeedback({
    activityIds: feedback.activityIds,
    note: feedback.note,
    rating: feedback.rating,
    source: feedback.source
  });
}

export async function handleActivityFeedbackPost(
  request: Request,
  dependencies: ActivityFeedbackDependencies = {}
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationError("Activity feedback must be valid JSON.");
  }

  const parsed = ActivityFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Activity feedback validation failed.", parsed.error.flatten().fieldErrors);
  }

  try {
    const canAcceptFeedback = await (dependencies.consume ?? consumeActivityFeedbackToken)();
    if (!canAcceptFeedback) {
      return Response.json(
        { code: "rate_limited", message: "Feedback is taking a short pause. Please try again in a minute." },
        { status: 429, headers: { "retry-after": "60" } }
      );
    }
    await (dependencies.persist ?? persistActivityFeedback)(parsed.data);
    return Response.json({ message: "Thanks — your feedback was recorded." }, { status: 201 });
  } catch {
    return internalError("Feedback is temporarily unavailable. Please try again later.", 503);
  }
}
