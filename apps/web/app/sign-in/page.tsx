import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SignInForm } from "./_components/sign-in-form";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";

export const metadata: Metadata = {
  title: "Sign in | Rumia",
  description: "Sign in to Rumia to access your curated Portugal travel routes."
};

interface SignInPageProps {
  searchParams: Promise<{ next?: string; sent?: string; error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const next = params.next ?? "/account";
  const sent = params.sent === "1";
  const error = params.error;

  // If already signed in, send the user on to the post-auth landing.
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect(next);
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <TopNav />
      <main
        id="main-content"
        data-map-container=""
        className="flex-1 flex items-center justify-center px-6 py-16 pt-[112px]"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl text-ink mb-3">
              Sign <em className="text-ochre-dark not-italic">in</em>
            </h1>
            <p className="text-ink-soft text-base">
              We&apos;ll email you a one-time link. No password to remember.
            </p>
            <p className="mt-4 font-display text-sm italic text-ochre-dark/80 max-w-xs mx-auto">
              &ldquo;The trip was crafted around our family pace — not the other way around.&rdquo;
            </p>
          </div>

          <SignInForm next={next} initialSent={sent} initialError={error} />

          <p className="mt-8 text-center text-sm text-ink-soft">
            New to Rumia?{" "}
            <a href="/how-it-works" className="text-ochre-dark underline underline-offset-2 hover:text-ochre">
              Learn how it works
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
