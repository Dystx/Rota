"use client";

import * as React from "react";

type FeedbackSource = "activity-day" | "activity-detail" | "feedback-page";

export function ActivityFeedbackForm({
  activityIds,
  source = "feedback-page"
}: {
  activityIds: readonly string[];
  source?: FeedbackSource;
}) {
  const [rating, setRating] = React.useState<number | null>(null);
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  async function submit(): Promise<void> {
    if (!rating || activityIds.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/activity-feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          activityIds,
          rating,
          note: note.trim() || undefined,
          source
        })
      });
      const body: unknown = await response.json().catch(() => null);
      const message = body && typeof body === "object" && "message" in body && typeof body.message === "string" ? body.message : null;

      if (!response.ok) {
        setStatus(message ?? "Feedback is temporarily unavailable. Please try again later.");
        return;
      }

      setStatus(message ?? "Thanks — your feedback was recorded.");
    } catch {
      setStatus("Feedback is temporarily unavailable. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 grid gap-8 rounded-[28px] border border-[var(--color-border)] bg-white/45 p-6 shadow-sm backdrop-blur-sm md:p-8" aria-labelledby="feedback-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ochre-dark">Improve the next judgement</p>
      <h2 id="feedback-heading" className="mt-3 font-display text-3xl text-primary">How did this day feel?</h2>
      <p className="mt-3 max-w-xl leading-relaxed text-on-surface-variant">Your rating is anonymous and helps us test whether Rumia&apos;s activity judgements hold up in the real world.</p>

      <div className="mt-7" aria-label="Rate this day">
        <p className="text-sm font-medium text-primary">Your rating</p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Rate this day from one to five">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={`min-h-11 min-w-11 rounded-full border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light ${rating === value ? "border-ochre-dark bg-ochre-dark text-white" : "border-[var(--color-border)] bg-white/55 text-ochre-dark hover:border-ochre-dark/60 hover:bg-white"}`}
              aria-label={`${value} out of 5`}
              aria-pressed={rating === value}
              onClick={() => setRating(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-7 block text-sm font-medium text-primary" htmlFor="activity-feedback-note">
        What would make this day better? <span className="font-normal text-on-surface-variant">(optional)</span>
      </label>
      <textarea
        id="activity-feedback-note"
        className="mt-3 min-h-28 w-full rounded-[20px] border border-[var(--color-border)] bg-white/55 p-4 text-primary outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-ochre-dark/60 focus-visible:ring-2 focus-visible:ring-ochre-light"
        value={note}
        maxLength={600}
        onChange={(event) => setNote(event.target.value)}
      />
      <p className="mt-2 text-xs text-on-surface-variant">{note.length}/600</p>

      <button
        type="button"
        className="mt-2 inline-flex min-h-11 items-center rounded-full bg-ochre-dark px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-ochre-on-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light disabled:cursor-not-allowed disabled:bg-ochre-light disabled:text-primary disabled:opacity-100"
        onClick={submit}
        disabled={!rating || activityIds.length === 0 || isSubmitting}
      >
        {isSubmitting ? "Sending feedback…" : "Send feedback"}
      </button>
      {status ? <p className="mt-4 text-sm text-on-surface-variant" role="status">{status}</p> : null}
    </section>
  );
}
