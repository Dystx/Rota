import { describe, expect, it, vi } from "vitest";

import { handleActivityFeedbackPost } from "./handler";

describe("POST /api/activity-feedback", () => {
  it("accepts a bounded anonymous activity evaluation through the server boundary", async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    const consume = vi.fn().mockResolvedValue(true);
    const response = await handleActivityFeedbackPost(
      new Request("https://rumia.test/api/activity-feedback", {
        method: "POST",
        body: JSON.stringify({
          activityIds: ["porto-ribeira-slow-walk"],
          rating: 4,
          note: "The time estimate helped.",
          source: "activity-day"
        })
      }),
      { consume, persist }
    );

    expect(response.status).toBe(201);
    expect(persist).toHaveBeenCalledWith({
      activityIds: ["porto-ribeira-slow-walk"],
      rating: 4,
      note: "The time estimate helped.",
      source: "activity-day"
    });
    expect(consume).toHaveBeenCalledOnce();
  });

  it("rejects ratings and activity lists outside the public feedback boundary", async () => {
    const response = await handleActivityFeedbackPost(
      new Request("https://rumia.test/api/activity-feedback", {
        method: "POST",
        body: JSON.stringify({ activityIds: [], rating: 6 })
      })
    );

    expect(response.status).toBe(400);
  });

  it("does not persist feedback when the anonymous submission allowance is exhausted", async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    const consume = vi.fn().mockResolvedValue(false);
    const response = await handleActivityFeedbackPost(
      new Request("https://rumia.test/api/activity-feedback", {
        method: "POST",
        body: JSON.stringify({ activityIds: ["porto-ribeira-slow-walk"], rating: 4 })
      }),
      { persist, consume }
    );

    expect(response.status).toBe(429);
    expect(persist).not.toHaveBeenCalled();
  });
});
