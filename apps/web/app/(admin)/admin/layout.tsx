import { Metadata } from "next";
import { PageShell, SectionHeading } from "@repo/ui";
import { redirect } from "next/navigation";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";

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
    return children;
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
