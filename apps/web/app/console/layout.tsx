import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DecisionStatePanel, OperatorShell } from "@repo/ui";
import { requirePageAccess, requirementForHttpRoute } from "@/lib/auth/page-access";
import { loadSessionOutcome } from "@/lib/auth/session-outcome";
import { RouteRecovery } from "@/app/_components/route-recovery";

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const headerList = await headers();
  const currentPath = headerList.get("x-pathname") ?? headerList.get("next-url") ?? "/console";
  const access = await requirePageAccess(requirementForHttpRoute(currentPath) ?? { anyRole: ["admin"] });

  if (access.kind === "unavailable") {
    return <RouteRecovery kind="unavailable" landmark="document" />;
  }
  if (access.kind === "unauthenticated") {
    redirect(`/sign-in?next=${encodeURIComponent(currentPath)}`);
  }
  if (access.kind === "forbidden") {
    return (
      <main id="main-content" className="min-h-screen bg-linen px-6 py-16">
        <DecisionStatePanel
          kind="error"
          tone="light"
          headingLevel={1}
          title="Console access is restricted"
          description="This operator workspace is not available to the current account."
        />
      </main>
    );
  }

  const sessionOutcome = await loadSessionOutcome();
  if (sessionOutcome.kind !== "ready") {
    return <RouteRecovery kind="unavailable" landmark="document" />;
  }

  return (
    <OperatorShell
      section="console"
      currentPath={currentPath}
      capabilities={access.actor.capabilities}
      contentWidth="wide"
      user={{
        name: sessionOutcome.session.user.name || sessionOutcome.session.user.email || "Operator",
        email: sessionOutcome.session.user.email ?? null,
        avatarUrl: sessionOutcome.session.user.image ?? null
      }}
      signOutAction="/api/auth/sign-out"
    >
      {children}
    </OperatorShell>
  );
}
