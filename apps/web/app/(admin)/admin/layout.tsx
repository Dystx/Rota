import { Metadata } from "next";
import { OperatorShell, PageShell, SectionHeading } from "@repo/ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin Workspace",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAdminPageAuthContext();

  if (isAdminPageAuthContext(auth)) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const currentPath = (await headers()).get("x-pathname") ?? "/admin/places";

    return (
      <OperatorShell
        section="admin"
        currentPath={currentPath}
        user={{ name: user?.email ?? "Administrator", email: user?.email ?? null, avatarUrl: null }}
        signOutAction="/api/auth/sign-out"
      >
        {children}
      </OperatorShell>
    );
  }

  if (auth.reason === "unauthenticated") {
    redirect("/sign-in?next=/admin");
  }

  return (
    <PageShell variant="admin">
      <div data-testid="admin-forbidden">
        <SectionHeading
          eyebrow="Admin access"
          title="Forbidden"
          description="This admin workspace is only available to trusted administrator sessions."
        />
      </div>
    </PageShell>
  );
}
