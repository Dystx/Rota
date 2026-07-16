import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OperatorShell } from "@repo/ui";
import { getReviewerById } from "@repo/db";
import { loadCurrentAuthorizedActorOutcome } from "@/lib/auth/authorization";
import { loadSessionOutcome } from "@/lib/auth/session-outcome";
import { RouteRecovery } from "@/app/_components/route-recovery";

/**
 * Reviewer layout — shared shell + auth guard for every
 * /reviewer/* page. The previous layout had none: each
 * page imported `getReviewerPageAuthContext` and
 * `RequireReviewerAuth` inline, repeating the same
 * 8-line block. This layout centralises it.
 *
 * The layout also renders the shared `OperatorShell`
 * sidebar so the 5 reviewer pages have a persistent
 * cross-page nav (the previous queue page had a manual
 * 3-link strip — dropped, the sidebar replaces it).
 *
 * The auth flow:
 * 1. `getReviewerPageAuthContext` returns `{ client, reviewerId, userId }` for
 *    linked reviewers, `null` for everyone else.
 * 2. `null` → redirect to sign-in with `?next=` so the user
 *    lands back here after magic-link auth.
 * 3. `present` → load the reviewer's profile for the sidebar
 *    avatar/name, then render the shell.
 */
export default async function ReviewerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const currentPath = headerList.get("x-pathname") ?? headerList.get("next-url") ?? "/reviewer/queue";
  const sessionOutcome = await loadSessionOutcome();
  if (sessionOutcome.kind === "unavailable") {
    return <RouteRecovery kind="unavailable" landmark="document" />;
  }
  if (sessionOutcome.kind !== "ready") {
    redirect(`/sign-in?next=${encodeURIComponent(currentPath)}`);
  }

  // Use the request-scoped no-argument actor loader so child reviewer
  // contexts reuse this same authorization probe.
  const actorOutcome = await loadCurrentAuthorizedActorOutcome();
  if (actorOutcome.kind === "unavailable") {
    return <RouteRecovery kind="unavailable" landmark="document" />;
  }
  if (actorOutcome.kind !== "ready" || !actorOutcome.actor.roles.includes("reviewer") || !actorOutcome.actor.reviewerId) {
    redirect(`/sign-in?next=${encodeURIComponent(currentPath)}`);
  }

  const user = sessionOutcome.session.user;
  const reviewer = await getReviewerById(actorOutcome.actor.reviewerId, { actor: actorOutcome.actor });
  const displayName = reviewer?.name || user?.email || "Reviewer";

  // Read the current pathname for active-link highlighting.
  // Next.js 15+ exposes the current path via `headers()` under
  // the `next-url` / `x-pathname` headers (set by middleware).
  // Fall back to the queue path so the first paint is sane.
  return (
    <OperatorShell
      section="reviewer"
      currentPath={currentPath}
      user={{
        name: displayName,
        email: user?.email ?? null,
        avatarUrl: null
      }}
      signOutAction="/api/auth/sign-out"
    >
      {children}
    </OperatorShell>
  );
}
