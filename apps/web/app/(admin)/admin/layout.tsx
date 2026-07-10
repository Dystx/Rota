import { Metadata } from "next";
import { OperatorShell, SectionHeading } from "@repo/ui";
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
