import { Metadata } from "next";
import { OperatorShell, SectionHeading } from "@repo/ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requirePageAccess, requirementForHttpRoute } from "@/lib/auth/page-access";
import { loadSessionOutcome } from "@/lib/auth/session-outcome";
import { RouteRecovery } from "@/app/_components/route-recovery";

export const metadata: Metadata = {
  title: "Admin Workspace",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const currentPath = headerList.get("x-pathname") ?? headerList.get("next-url") ?? "/admin/places";
  const catalogueRequirement = requirementForHttpRoute(currentPath);
  const auth = await requirePageAccess(catalogueRequirement ?? { anyRole: ["admin"] });

  if (auth.kind === "ready") {
    const sessionOutcome = await loadSessionOutcome();
    if (sessionOutcome.kind !== "ready") {
      return <RouteRecovery kind="unavailable" landmark="document" />;
    }

    return (
      <OperatorShell
        section="admin"
        currentPath={currentPath}
        capabilities={auth.actor.capabilities}
        user={{ name: sessionOutcome.session.user.name || sessionOutcome.session.user.email || "Administrator", email: sessionOutcome.session.user.email ?? null, avatarUrl: sessionOutcome.session.user.image ?? null }}
        signOutAction="/api/auth/sign-out"
      >
        {children}
      </OperatorShell>
    );
  }

  if (auth.kind === "unavailable") {
    return <RouteRecovery kind="unavailable" landmark="document" />;
  }

  if (auth.kind === "unauthenticated") {
    redirect(`/sign-in?next=${encodeURIComponent(currentPath)}`);
  }

  return (
    <main id="main-content" data-scene="utility" data-surface-texture="none" className="mx-auto grid min-h-screen max-w-6xl gap-20 px-6 py-16 lg:gap-32 lg:px-12 lg:py-24">
      <div data-testid="admin-forbidden">
        <SectionHeading
          eyebrow="Admin access"
          title="Forbidden"
          description="This admin workspace is only available to trusted administrator sessions."
          h1
        />
      </div>
    </main>
  );
}
