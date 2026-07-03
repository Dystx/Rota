"use client";

import { useEffect, useState } from "react";
import { getBehaviorConsent, setBehaviorConsent } from "@/app/_lib/behavioral-profiler";

/**
 * Opt-in toggle for the behavioral profiler. Recording is off by
 * default; this control lets the traveler turn it on and then
 * refines their route suggestions based on the signals they
 * generate (skip / extend / replace / pin / mute). When the
 * toggle is on, a "Clear recorded data" button drains the local
 * ring buffer.
 */
export function BehaviorConsentToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  // Cached so the toggle renders the same state on hydration
  // (otherwise React would log a mismatch warning).

  useEffect(() => {
    setEnabled(getBehaviorConsent());
  }, []);

  // The toggle stays in the loading state until the post-mount
  // effect reads localStorage. We avoid rendering the switch in
  // the off position during SSR because the real default is
  // "no consent on file" — the same as off — but we still want
  // the user to see something rather than a flash of unchecked.
  if (enabled === null) {
    return (
      <div className="grid gap-3" data-testid="behavior-consent-loading">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Loading personalization preferences…
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3" data-testid="behavior-consent-toggle">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => {
            const next = event.target.checked;
            setBehaviorConsent(next);
            setEnabled(next);
          }}
          className="mt-1 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
          data-testid="behavior-consent-input"
        />
        <span className="grid gap-1">
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            Personalize my route suggestions
          </span>
          <span className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
            When this is on, the platform remembers which suggested stops you skip, extend,
            or replace (stored only in your browser until you turn this off or clear the
            data). Off by default — nothing is recorded until you opt in.
          </span>
        </span>
      </label>
    </div>
  );
}
