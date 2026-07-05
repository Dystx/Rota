import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signInWithMagicLinkAction } from "./_actions/sign-in";
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
      <main id="main-content" className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl text-ink mb-3">
              Sign <em className="text-ochre-dark not-italic">in</em>
            </h1>
            <p className="text-ink-soft text-base">
              We&apos;ll email you a one-time link. No password to remember.
            </p>
          </div>

          <form
            action={signInWithMagicLinkAction}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-olive-light/20 p-8 shadow-sm"
          >
            <input type="hidden" name="next" value={next} />

            <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg border border-olive-light/30 bg-white text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-ochre-light focus:border-transparent transition-colors"
            />

            <button
              type="submit"
              className="mt-6 w-full bg-ink text-cream font-medium py-3 rounded-lg hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 transition-colors"
            >
              Send magic link
            </button>
          </form>

          {sent ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 p-4 rounded-lg bg-sage/30 border border-olive-light/20 text-ink text-sm"
            >
              <strong className="font-medium">Check your inbox.</strong> We sent a sign-in link to your email. It expires in 10 minutes.
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm"
            >
              <strong className="font-medium">Sign-in failed.</strong> {decodeURIComponent(error)}
            </div>
          ) : null}

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
