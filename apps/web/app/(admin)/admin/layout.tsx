import { Metadata } from "next";
import { OperatorShell, SectionHeading } from "@repo/ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loadCurrentAuthorizedActorOutcome } from "@/lib/auth/authorization";
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
  const sessionOutcome = await loadSessionOutcome();
  if (sessionOutcome.kind === "unavailable") {
    return <RouteRecovery kind="unavailable" landmark="document" />;
  }

  // Use the request-scoped no-argument actor loader so child admin contexts
  // reuse this same authorization probe.
  const auth = await loadCurrentAuthorizedActorOutcome();

  if (auth.kind === "ready" && auth.actor.roles.includes("admin")) {
    const currentPath = (await headers()).get("x-pathname") ?? "/admin/places";

    return (
      <OperatorShell
        section="admin"
        currentPath={currentPath}
        user={{ name: sessionOutcome.kind === "ready" ? sessionOutcome.session.user.name || sessionOutcome.session.user.email || "Administrator" : "Administrator", email: sessionOutcome.kind === "ready" ? sessionOutcome.session.user.email ?? null : null, avatarUrl: sessionOutcome.kind === "ready" ? sessionOutcome.session.user.image ?? null : null }}
        signOutAction="/api/auth/sign-out"
      >
        {children}
      </OperatorShell>
    );
  }

  if (auth.kind === "unavailable") {
    return <RouteRecovery kind="unavailable" landmark="document" />;
  }

  if (auth.kind === "anonymous") {
    redirect("/sign-in?next=/admin");
  }

  return (
    <main id="main-content" className="mx-auto grid min-h-screen max-w-6xl gap-20 px-6 py-16 lg:gap-32 lg:px-12 lg:py-24">
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
