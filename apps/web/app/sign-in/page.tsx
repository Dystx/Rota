import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppLayout, BrandMark } from "@repo/ui";
import { getCurrentSession } from "@/lib/auth/session";
import { loadCurrentAuthorizedActor } from "@/lib/auth/authorization";
import { resolveRoleCompatibleNext } from "@/lib/auth/role-compatible-next";
import { SignInForm } from "./_components/sign-in-form";
import { TopNav } from "../_components/top-nav";
import { safeNext } from "../auth/safe-next";

export const SIGN_IN_HELP_LINK_CLASS =
  "text-ochre-dark underline underline-offset-2 hover:text-[var(--color-ochre-on-light)] transition-colors duration-fast ease-standard";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Rumia to access your saved Portugal activity days."
};

const AUTH_FACTS = [
  ["01", "Private saved days"],
  ["02", "No social login"],
  ["03", "Portugal-first"],
] as const;

interface SignInPageProps {
  searchParams: Promise<{ next?: string; sent?: string; error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const sent = params.sent === "1";
  const error = params.error;

  // If already signed in, send the user on to the post-auth landing.
  const session = await getCurrentSession();
  if (session) {
    const actor = await loadCurrentAuthorizedActor();
    redirect(actor ? resolveRoleCompatibleNext(next, actor) : "/account");
  }

  return (
    <AppLayout variant="auth" topNav={<TopNav />}>
      <div className="flex min-h-full flex-col bg-transparent">

      {/* Sign-in lock-up: mark + italic wordmark, centered above the card. */}
      <div className="flex justify-center pt-28 pb-3">
        <div className="inline-flex items-center gap-4">
          <BrandMark size="lg" tone="light" />
          <span className="font-display italic text-headline-sm text-primary">
            Rumia
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pt-12 pb-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl text-ink mb-3">
              Sign <em className="text-ochre-dark not-italic">in</em>
            </h1>
            <p className="text-ink-soft text-base max-w-xs mx-auto">
              Sign in with your Rumia account password.
            </p>
          </div>

          <SignInForm next={next} initialSent={sent} initialError={error} />

          <dl className="mt-10 grid grid-cols-3 border-y border-olive-light/15 py-4 text-left">
            {AUTH_FACTS.map(([index, label]) => (
              <div key={index} className="grid gap-1 border-r border-olive-light/15 px-3 first:pl-0 last:border-r-0 last:pr-0">
                <dt className="font-mono-micro text-mono-micro tracking-[0.16em] text-ochre-dark">{index}</dt>
                <dd className="text-xs leading-relaxed text-olive-dark">{label}</dd>
              </div>
            ))}
          </dl>

          {/* Why a link? — warm-voice microcopy replacing the previous
              branded testimonial block. The earlier "&ldquo;The trip was
              crafted around our family pace&rdquo;" was a stitch from a
              different brand voice; this one is honest and brief. */}
          <p className="mt-8 text-center text-sm text-olive-dark max-w-xs mx-auto">
            No tracking and no social login. Just your Rumia account.
            <br />
            <a
              href="/how-it-works"
              className={SIGN_IN_HELP_LINK_CLASS}
            >
              How it works
            </a>
            .
          </p>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
