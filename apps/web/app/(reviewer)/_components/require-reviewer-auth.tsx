import * as React from "react";
import Link from "next/link";
import { Button, Card, CardContent, EmptyState } from "@repo/ui";

/**
 * RequireReviewerAuth — the empty state shown on every reviewer
 * page when the visitor isn't signed in (or isn't a linked
 * reviewer). Centralised so the copy stays consistent across
 * queue / history / profile / operations.
 *
 * Renders the same card chrome the pages used inline so the
 * extracted component is a drop-in replacement — no visual
 * regression. The `noun` prop customises only the surface word
 * ("load your active queue" vs "load your persisted history").
 *
 * The component is purely presentational: callers pass `signedIn`
 * from the auth check they already do server-side. We don't
 * re-check auth here because the parent server component
 * already has the session context.
 */
export function RequireReviewerAuth({
  signedIn,
  noun
}: {
  signedIn: boolean;
  noun: "queue" | "history" | "profile" | "operations";
}) {
  if (signedIn) return null;
  const descriptions: Record<typeof noun, string> = {
    queue: "load your active queue",
    history: "load your persisted history",
    profile: "load your persisted profile",
    operations: "load the operations pipeline"
  };
  return (
    <Card className="mt-8 overflow-hidden border-[var(--color-border)] bg-white/60 shadow-sm">
      <CardContent className="p-0">
        <EmptyState
          variant="table"
          title="Sign in required"
          description={`Sign in with a linked reviewer account to ${descriptions[noun]}.`}
          action={
            <Button asChild size="md" variant="secondary">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
