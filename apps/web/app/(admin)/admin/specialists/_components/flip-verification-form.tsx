"use client";

/**
 * Tiny client form for the admin verification flip. One
 * button per row, plus a hidden field with the desired
 * next state (true = verify, false = unverify). The
 * server action is the only authority on the write; the
 * button is disabled while the transition is in flight.
 *
 * Tier-4 specialists get a `disabled` button on the
 * "unverify" action because the DB CHECK
 * `specialist_profiles_tier4_must_be_verified` would
 * reject it; the application-layer mirror in
 * `setSpecialistVerified` throws a friendly error if a
 * caller somehow tries.
 */

import * as React from "react";
import { Button } from "@repo/ui";
import { flipVerification } from "../actions";

type Props = {
  specialistId: string;
  isVerified: boolean;
  tier4LicensedGuide: boolean;
};

export function FlipVerificationForm({
  specialistId,
  isVerified,
  tier4LicensedGuide
}: Props) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function handle(nextVerified: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await flipVerification({ specialistId, verified: nextVerified });
      if (result.kind === "error") {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={isVerified ? "ghost" : "primary"}
        disabled={isPending || (isVerified && tier4LicensedGuide)}
        onClick={() => handle(!isVerified)}
        data-testid={`admin-specialists-flip-${specialistId}`}
      >
        {isPending ? "Saving…" : isVerified ? "Unverify" : "Verify"}
      </Button>
      {error ? (
        <p
          className="text-xs text-error"
          role="alert"
          data-testid={`admin-specialists-flip-error-${specialistId}`}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
