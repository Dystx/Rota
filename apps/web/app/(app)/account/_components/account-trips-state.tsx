import React from "react";
import Link from "next/link";
import { DecisionStatePanel, Icon } from "@repo/ui";

interface AccountTripsStateProps {
  /** A fetch/configuration message takes precedence over the empty shelf. */
  infoMessage?: string;
}

/**
 * Account shelf states stay explicit about whether there is no saved work or
 * whether the saved-work service is currently unavailable. Keeping these
 * branches separate prevents a persistence failure from masquerading as a
 * first-visit empty state.
 */
export function AccountTripsState({ infoMessage }: AccountTripsStateProps) {
  if (infoMessage) {
    return (
      <DecisionStatePanel
        data-testid="account-trips-unavailable"
        kind="unavailable"
        tone="light"
        className="bg-white/70"
        title="Saved plans are unavailable"
        description={infoMessage}
        illustration={<Icon name="warning-circle" aria-hidden />}
        primaryAction={(
          <Link
            href="/support"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-label-ui text-label-ui text-on-primary transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            Open support
          </Link>
        )}
      />
    );
  }

  return (
    <DecisionStatePanel
      data-testid="account-trips-empty"
      kind="empty"
      tone="inverse"
      className="bg-primary"
      title="Your shelf is ready for a first choice"
      description="Save an activity you would genuinely make time for. It will appear here with the context you need to shape a day later."
      illustration={<Icon name="bookmark" aria-hidden />}
      primaryAction={(
        <Link
          href="/explore"
          className="inline-flex items-center justify-center rounded-full bg-ochre-light px-6 py-3 font-label-ui text-label-ui text-primary transition-colors hover:bg-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          Explore activities
        </Link>
      )}
    />
  );
}
