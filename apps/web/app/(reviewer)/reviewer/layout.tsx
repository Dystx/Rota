import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OperatorShell } from "@repo/ui";
import { getReviewerPageAuthContext } from "@/lib/auth/reviewer";
import { getReviewerById } from "@repo/db";
import { createAuthenticatedUserDataClient } from "@repo/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  const auth = await getReviewerPageAuthContext();
  if (!auth) {
    redirect("/sign-in?next=/reviewer/queue");
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const dataClient = createAuthenticatedUserDataClient(supabase);
  const reviewer = await getReviewerById(auth.reviewerId, { client: dataClient });
  const displayName = reviewer?.name || user?.email || "Reviewer";

  // Read the current pathname for active-link highlighting.
  // Next.js 15+ exposes the current path via `headers()` under
  // the `next-url` / `x-pathname` headers (set by middleware).
  // Fall back to the queue path so the first paint is sane.
  const headerList = await headers();
  const currentPath =
    headerList.get("x-pathname") ??
    headerList.get("next-url") ??
    "/reviewer/queue";

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
