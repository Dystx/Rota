import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppLayout, BrandMark } from "@repo/ui";
import { getCurrentSession } from "@/lib/auth/session";
import { loadCurrentAuthorizedActor } from "@/lib/auth/authorization";
import { resolveRoleCompatibleNext } from "@/lib/auth/role-compatible-next";
import { SignInForm } from "./_components/sign-in-form";
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
    <AppLayout variant="auth" bare surface="linen" surfaceTexture="none">
      <div className="rumia-auth-page min-h-full bg-transparent">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,28rem)] lg:items-center lg:gap-20 lg:px-12 lg:py-24">
          <aside className="order-2 overflow-hidden rounded-[32px] bg-midnight px-7 py-8 text-linen shadow-raised lg:order-1 lg:px-10 lg:py-11">
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.22em] text-ochre-light">
              Rumia / private daybook
            </p>
            <h2 className="mt-6 max-w-md font-display text-4xl leading-[1.02] text-linen md:text-5xl">
              Keep the day yours.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-linen/75">
              Saved activities stay in your control: no social feed, no booking
              pressure, and no public profile to maintain.
            </p>
            <div className="mt-10 grid gap-4 border-t border-linen/20 pt-6">
              {AUTH_FACTS.map(([index, label]) => (
                <div key={index} className="flex items-baseline gap-4">
                  <span className="font-mono-micro text-mono-micro tracking-[0.16em] text-ochre-light">{index}</span>
                  <span className="text-base text-linen/85">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 rounded-[22px] border border-linen/15 bg-linen/10 p-5">
              <p className="font-mono-micro text-mono-micro uppercase tracking-[0.18em] text-ochre-light">
                Field note / 03
              </p>
              <p className="mt-3 font-display text-2xl leading-tight text-linen">
                A considered day needs somewhere quiet to return to.
              </p>
            </div>
          </aside>

          <section className="order-1 w-full lg:order-2">
            <div className="flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-4">
                <BrandMark size="lg" tone="light" />
                <span className="font-display italic text-headline-sm text-primary">
                  Rumia
                </span>
              </div>
            </div>

            <div className="mt-10 text-center lg:text-left">
              <p className="font-mono-micro text-mono-micro uppercase tracking-[0.22em] text-ochre-dark">Return to your day</p>
              <h1 className="mt-4 font-display text-5xl leading-[1.02] text-ink md:text-6xl">
                Sign <em className="text-ochre-dark not-italic">in</em>
              </h1>
              <p className="mx-auto mt-5 max-w-xs text-base leading-7 text-ink-soft lg:mx-0">
                Sign in with your Rumia account password.
              </p>
            </div>

            <div className="mt-10">
              <SignInForm next={next} initialSent={sent} initialError={error} />
            </div>

            <dl className="mt-10 grid grid-cols-3 border-y border-olive-light/15 py-4 text-left">
              {AUTH_FACTS.map(([index, label]) => (
                <div key={index} className="grid gap-1 border-r border-olive-light/15 px-3 first:pl-0 last:border-r-0 last:pr-0">
                  <dt className="font-mono-micro text-mono-micro tracking-[0.16em] text-ochre-dark">{index}</dt>
                  <dd className="text-xs leading-relaxed text-olive-dark">{label}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 max-w-xs text-center text-base leading-7 text-olive-dark lg:text-left">
              No tracking and no social login. Just your Rumia account.
              <br />
              <a href="/how-it-works" className={SIGN_IN_HELP_LINK_CLASS}>
                How it works
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
