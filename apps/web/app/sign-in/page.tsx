import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandMark } from "@repo/ui";
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

      {/* Sign-in lock-up: mark + italic wordmark, centered above the card. */}
      <div className="flex justify-center pt-28 pb-3">
        <div className="inline-flex items-center gap-4">
          <BrandMark size="lg" tone="light" />
          <span className="font-display italic text-headline-sm text-primary">
            Rumia
          </span>
        </div>
      </div>

      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-6 pt-12 pb-16"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl text-ink mb-3">
              Sign <em className="text-ochre-dark not-italic">in</em>
            </h1>
            <p className="text-ink-soft text-base max-w-xs mx-auto">
              We&rsquo;ll email you a one-time link. No password to remember.
            </p>
          </div>

          <SignInForm next={next} initialSent={sent} initialError={error} />

          {/* Why a link? — warm-voice microcopy replacing the previous
              branded testimonial block. The earlier "&ldquo;The trip was
              crafted around our family pace&rdquo;" was a stitch from a
              different brand voice; this one is honest and brief. */}
          <p className="mt-8 text-center text-sm text-olive-dark max-w-xs mx-auto">
            No tracking, no social login, no second screen. Just you and your inbox.
            <br />
            <a
              href="/how-it-works"
              className="text-ochre-dark underline underline-offset-2 hover:text-ochre transition-colors duration-fast ease-standard"
            >
              How it works
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
