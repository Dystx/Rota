import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, StatPill } from "@repo/ui";
import { TripBriefFormBoundary } from "./trip-brief-form";

export const metadata: Metadata = {
  title: "Shape a saved plan",
  description: "Set the time, pace, and practical context that should shape the activities you keep in Portugal.",
  alternates: {
    canonical: "/trip/new"
  }
};

export default function NewTripPage() {
  return (
    <div className="min-h-screen">
      <section className="relative isolate w-full overflow-hidden border-b border-olive-light/20">
        <div className="absolute inset-0 w-full h-full -z-10">
          <div
            className="w-full h-full bg-cover bg-center filter brightness-[0.85] contrast-110 saturate-110"
            style={{
              backgroundImage:
                "url('/hero/portugal-coast-golden-hour.svg')",
            }}
            />
          <div className="absolute inset-0 bg-gradient-to-r from-linen via-linen/80 to-linen/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-linen via-transparent to-transparent opacity-90" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 py-16 md:px-10 md:py-24">
          <div className="max-w-3xl">
            <StatPill label="Saved-plan editor" value="Activity-first" />
            <p className="mt-8 font-label-ui text-label-ui uppercase tracking-[0.22em] text-primary/70">
              A practical layer for the activities you keep
            </p>
            <h1 className="mt-4 font-display text-display-mobile text-foreground drop-shadow-2xl md:text-display">
              Give your time a shape.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
              Set the pace, travel window, and context that should hold your Portugal activities together. Rumia uses these choices to keep the plan useful, realistic, and yours.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Link
                href="/explore"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 font-label-ui text-label-ui text-on-primary shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                Find activities in Explore
              </Link>
              <span className="text-base text-on-surface-variant">
                Or continue with a saved selection below.
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1200px] items-start gap-10 px-6 py-12 md:px-10 md:py-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:gap-16">
        <div className="min-w-0">
          <div className="mb-6 max-w-2xl">
            <p className="font-label-ui text-label-ui uppercase tracking-[0.2em] text-primary/65">Shape the saved plan</p>
            <h2 className="mt-3 font-display text-3xl text-foreground md:text-4xl">Keep the constraints that make a good day possible.</h2>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              These choices are a quiet editing layer—not a booking flow. Change only what should affect the activities you keep, then save the shape.
            </p>
          </div>
          <TripBriefFormBoundary />
        </div>

        <div className="min-w-0 grid gap-6 lg:sticky lg:top-32">
          <Card className="min-w-0 border border-olive-light/25 bg-white/65 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <p className="font-label-ui text-label-ui uppercase tracking-[0.18em] text-primary/65">What this protects</p>
              <h3 className="font-display text-2xl text-foreground">A plan with room to work.</h3>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="border-t border-olive-light/20 pt-5">
                <p className="font-medium text-[var(--color-foreground)]">A believable pace</p>
                <p className="mt-2 text-base leading-7 text-on-surface-variant">
                  Fewer, better stops with time for the walk, meal, view, or pause that makes them worthwhile.
                </p>
              </div>

              <div className="border-t border-olive-light/20 pt-5">
                <p className="font-medium text-[var(--color-foreground)]">Useful local context</p>
                <p className="mt-2 text-base leading-7 text-on-surface-variant">
                  Season, transfers, effort, and nearby combinations stay visible when you shape what to do.
                </p>
              </div>

              <div className="border-t border-olive-light/20 pt-5">
                <p className="font-medium text-[var(--color-foreground)]">Your control</p>
                <p className="mt-2 text-base leading-7 text-on-surface-variant">
                  Save, remove, or reorder later. Rumia does not book, choose accommodation, or take over the day.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-olive-light/20 bg-olive-light/10 p-5">
            <p className="font-label-ui text-label-ui uppercase tracking-[0.18em] text-primary/65">Need recommendations first?</p>
            <p className="mt-2 text-base leading-7 text-on-surface-variant">Explore Portugal by situation, then return here when you have a shortlist worth shaping.</p>
            <Link href="/explore" className="mt-4 inline-flex items-center font-label-ui text-label-ui text-primary underline decoration-olive-light/60 underline-offset-4 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2">
              Browse worthwhile activities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
