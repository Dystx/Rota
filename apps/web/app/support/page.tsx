import { Metadata } from "next";
import Link from "next/link";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";

export const metadata: Metadata = {
  title: "Global Support | Rumia",
  description: "How to reach the Rumia concierge team.",
  alternates: { canonical: "/support" }
};

export default function SupportPage() {
  return (
    <>
      <TopNav />
      <main
        id="main-content"
        className="pt-header-height min-h-screen bg-background"
      >
        <article className="max-w-3xl mx-auto px-container-padding-sm md:px-container-padding-lg py-section-gap">
          <header className="mb-8">
            <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark mb-2">
              We're here
            </p>
            <h1 className="font-display text-headline-lg text-primary leading-tight">
              Global Support
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Three ways to reach the Rumia concierge team.
            </p>
          </header>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/expert-chat"
              className="block p-5 rounded-xl border border-olive-light/30 bg-white/80 hover:border-ochre-light/60 transition-colors"
            >
              <span className="ph text-ochre-dark mb-2 block">
                chat_bubble
              </span>
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Expert Chat
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Async, 24-hour response time. Free for every trip.
              </p>
            </Link>
            <Link
              href="/account"
              className="block p-5 rounded-xl border border-olive-light/30 bg-white/80 hover:border-ochre-light/60 transition-colors"
            >
              <span className="ph text-ochre-dark mb-2 block">
                account_circle
              </span>
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Your Account
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Manage your trips, preferences, and billing.
              </p>
            </Link>
            <a
              href="mailto:hello@rumia.pt"
              className="block p-5 rounded-xl border border-olive-light/30 bg-white/80 hover:border-ochre-light/60 transition-colors"
            >
              <span className="ph text-ochre-dark mb-2 block">
                mail
              </span>
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Email
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                hello@rumia.pt · 1 business day.
              </p>
            </a>
          </div>
          <section className="mt-10 grid gap-3" aria-label="Support topics">
            {[
              ["How the preview works", "The free preview shows a route shape. Full itinerary text and exports require the €19 unlock."],
              ["When expert polish is available", "The €49 review is available after unlock and has a one-business-day target."],
              ["Bookings and changes", "Rumia provides recommendations. Confirm bookings, hours, visas, and insurance directly with providers."]
            ].map(([title, body]) => (
              <details key={title} className="rounded-xl border border-olive-light/20 bg-white/70 p-4">
                <summary className="cursor-pointer font-headline-sm text-headline-sm text-primary">{title}</summary>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{body}</p>
              </details>
            ))}
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
