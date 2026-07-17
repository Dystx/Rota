"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  ChoiceCard,
  ChoiceChipGroup,
  CinematicMedia,
  OptionSheet,
  RouteConsequence,
  TripSummary,
} from "@repo/ui";
import { draftToPlannerUrl, normalizeDraft, type TripChoiceDraft } from "../_lib/choice-model";
import type { TransportChoice } from "./transport-step";
import type { Vibe } from "./vibe-step";
import type { EditorialActivity } from "@/lib/content/activities";
import { ActivityDayPlanner, type ActivityDayTime, type ActivityDayTransport } from "./activity-day-planner";

export interface PlannerSingleScreenProps {
  initialDestination?: string;
  initialDays?: number;
  initialWindow?: string;
  initialTransport?: TransportChoice | "";
  initialVibe?: Vibe;
  initialEdit?: "destination" | "travelWindow" | "days" | "transport" | "vibe";
  initialActivityIds?: readonly string[];
  initialActivities?: readonly EditorialActivity[];
  initialDayTime?: ActivityDayTime;
  initialActivityTransport?: ActivityDayTransport;
}

const DESTINATIONS = [
  ["Portugal", "A first taste of Portugal, from coast to countryside."],
  ["Lisbon", "Tile-lined streets, miradouros, and the Tagus light."],
  ["Porto", "Ribeira walks, Atlantic air, and the Douro nearby."],
  ["the Algarve", "Warm coves, slow lunches, and wide-open horizons."],
] as const;
const DURATIONS = [3, 5, 7, 14] as const;
const WINDOWS = ["Any time", "April–May", "June–July", "September–October"] as const;

const PLANNER_MEDIA = {
  Portugal: {
    poster: "/media/unsplash/portugal-coast-golden-hour.webp",
    fallback: "/media/unsplash/portugal-coast-golden-hour.jpg",
    alt: "Atlantic seawall and surf at golden hour on the Portuguese coast."
  },
  Lisbon: {
    poster: "/media/unsplash/portugal-coast-golden-hour.webp",
    fallback: "/media/unsplash/portugal-coast-golden-hour.jpg",
    alt: "Atlantic seawall and surf at golden hour on the Portuguese coast."
  },
  Porto: {
    poster: "/media/unsplash/porto-cobblestone-street.webp",
    fallback: "/media/unsplash/porto-cobblestone-street.jpg",
    alt: "A quiet, steep cobblestone street in Porto with weathered façades and balconies."
  },
  "the Algarve": {
    poster: "/media/unsplash/portugal-coast-golden-hour.webp",
    fallback: "/media/unsplash/portugal-coast-golden-hour.jpg",
    alt: "Atlantic seawall and surf at golden hour on the Portuguese coast."
  }
} as const;

function destinationLabel(value: string): string {
  const key = value.trim().toLowerCase();
  if (key === "portugal") return "Portugal";
  if (key === "algarve" || key === "the algarve") return "the Algarve";
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PlannerSingleScreen(props: PlannerSingleScreenProps) {
  if (props.initialActivities && props.initialActivities.length > 0) {
    return <ActivityDayPlanner activities={props.initialActivities} initialDayTime={props.initialDayTime} initialTransport={props.initialActivityTransport} />;
  }

  return <TripPlannerSingleScreen {...props} />;
}

function TripPlannerSingleScreen({
  initialDestination = "Portugal",
  initialDays = 7,
  initialWindow = "",
  initialTransport = "transit",
  initialVibe = "balanced",
  initialEdit,
  initialActivityIds = [],
}: PlannerSingleScreenProps) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<TripChoiceDraft>(() => normalizeDraft({
    destination: destinationLabel(initialDestination),
    days: initialDays,
    travelWindow: initialWindow || null,
    transport: initialTransport || "transit",
    vibe: initialVibe,
    activityIds: [...initialActivityIds],
  }));
  const [sheet, setSheet] = React.useState<"destination" | "window" | "days" | "transport" | "vibe" | null>(null);
  const [focusedGroup, setFocusedGroup] = React.useState<"destination" | "days" | "details">("destination");
  const [actionState, setActionState] = React.useState<"ready" | "navigating" | "continued" | "error">("ready");
  const mountedRef = React.useRef(true);

  React.useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  React.useEffect(() => {
    if (!initialEdit) return;
    setSheet(initialEdit === "travelWindow" ? "window" : initialEdit);
    if (initialEdit === "travelWindow" || initialEdit === "transport" || initialEdit === "vibe") {
      setFocusedGroup("details");
    } else if (initialEdit === "days") {
      setFocusedGroup("days");
    }
  }, [initialEdit]);

  const update = <K extends keyof TripChoiceDraft>(key: K, value: TripChoiceDraft[K]) => {
    setActionState("ready");
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const submit = () => {
    if (actionState === "navigating") return;
    setActionState("navigating");
    try {
      router.push(draftToPlannerUrl(draft));
      queueMicrotask(() => {
        // The router handoff can outlive a test or a fast route transition;
        // don't schedule React work after this surface has unmounted.
        if (mountedRef.current) setActionState("continued");
      });
    } catch {
      setActionState("error");
    }
  };
  const context = {
    destination: draft.destination,
    days: draft.days,
    travelWindow: draft.travelWindow,
    transport: draft.transport === "car" ? "Car" : "Transit",
    vibe: draft.vibe === "high_energy" ? "High energy" : draft.vibe === "restorative" ? "Restorative" : "Balanced",
  };

  return (
    <main
      id="main-content"
      className="rumia-planner-page min-h-screen rumia-surface rumia-surface-midnight rumia-page-enter text-linen-dark"
      data-testid="planner-single-screen"
      data-planner="single-screen"
      data-scene="decision"
      data-surface-texture="none"
    >
      <header className="border-b border-ochre-light/15" data-testid="planner-editorial-shell">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8 lg:px-12">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Back to home" className="font-headline-sm italic text-ochre-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary">Rumia</Link>
            <span aria-hidden className="hidden h-4 w-px bg-ochre-light/25 sm:block" />
            <p className="hidden font-mono-micro uppercase tracking-[0.18em] text-linen-dark/60 sm:block">Activity planning field</p>
          </div>
          <button type="button" onClick={() => router.push("/")} aria-label="Close planner" className="min-h-11 min-w-11 rounded-full border border-linen-dark/20 text-lg text-linen-dark transition-colors hover:border-ochre-light hover:text-ochre-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary">×</button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 pb-16 md:px-8 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,24rem)] lg:gap-16 lg:px-12 lg:py-16">
        <section className="grid content-start gap-8" data-testid="planner-brief">
          <div className="grid max-w-3xl gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light">01 / 03</span>
              <span className="h-px w-10 bg-ochre-light/40" aria-hidden />
              <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-linen-dark/60">Shape the brief</span>
            </div>
            <p className="font-mono-micro uppercase tracking-widest text-ochre-light">Start with an activity decision</p>
            <h1 className="font-display text-4xl leading-[1.02] tracking-tight md:text-6xl">Plan from the activities you have in mind.</h1>
            <p className="max-w-xl text-base leading-relaxed text-linen-dark/75 md:text-lg">Choose an activity situation first, then return here when you have a day worth shaping.</p>
          </div>

          <nav aria-label="Activity context choices" className="grid grid-cols-3 gap-2 md:hidden">
            {([["destination", "Place"], ["days", "Time"], ["details", "Details"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={focusedGroup === value} onClick={() => setFocusedGroup(value)} className="min-h-11 rounded-full border border-white/20 px-3 text-sm aria-[pressed=true]:border-ochre-light aria-[pressed=true]:text-ochre-light">{label}</button>)}
          </nav>

          <div className={`grid gap-3 ${focusedGroup !== "destination" ? "hidden md:grid" : ""}`} aria-label="Place context choices">
            <div className="flex items-center justify-between"><h2 className="font-headline-sm text-xl">Where will you spend time?</h2><button type="button" onClick={() => setSheet("destination")} className="min-h-11 px-1 text-sm underline underline-offset-4">Browse places</button></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {DESTINATIONS.slice(0, 2).map(([value, description]) => <ChoiceCard key={value} id={`destination-${value}`} name="destination" value={value} label={value} description={description} selected={draft.destination === value} onSelect={(next) => update("destination", next)} />)}
            </div>
          </div>

          <div className={`grid gap-3 ${focusedGroup !== "days" ? "hidden md:grid" : ""}`} aria-label="Time choices">
            <h2 className="font-headline-sm text-xl">How much time do you have?</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DURATIONS.map((days) => <ChoiceCard key={days} id={`duration-${days}`} name="days" value={String(days)} label={`${days} days`} description={days === 7 ? "A balanced first journey." : "A different pace, same care."} selected={draft.days === days} onSelect={() => update("days", days)} />)}
            </div>
          </div>

          <div className={`grid gap-4 rounded-xl border border-white/15 bg-white/5 p-5 ${focusedGroup !== "details" ? "hidden md:grid" : ""}`} aria-label="Trip details choices">
            <button type="button" onClick={() => setSheet("window")} className="flex min-h-11 items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" aria-label="Choose travel window">
              <span><span className="block text-xs uppercase tracking-widest text-ochre-light">Travel window</span><span className="block text-lg">{draft.travelWindow ?? "Any time"}</span></span><span aria-hidden>⌄</span>
            </button>
            <ChoiceChipGroup label="Transport" labelClassName="!text-linen-dark" multiple={false} selected={[draft.transport]} onChange={(values) => values[0] && update("transport", values[0] as TransportChoice)} options={[{ value: "transit", label: "Transit & walking" }, { value: "car", label: "Rental car" }]} />
            <ChoiceChipGroup label="Vibe" labelClassName="!text-linen-dark" multiple={false} selected={[draft.vibe]} onChange={(values) => values[0] && update("vibe", values[0] as Vibe)} options={[{ value: "restorative", label: "Restorative" }, { value: "balanced", label: "Balanced" }, { value: "high_energy", label: "High energy" }]} />
          </div>

          <RouteConsequence status="ready" transportLabel={draft.transport === "transit" ? "Transit keeps the day practical" : "A car makes wider activity combinations possible"} stopCount={draft.transport === "transit" ? 2 : 4} />
        </section>

        <aside className="grid content-start gap-4 lg:sticky lg:top-6 lg:self-start">
          <CinematicMedia
            src="/media/unsplash/portugal-coast-golden-hour-loop.mp4"
            poster={PLANNER_MEDIA[draft.destination as keyof typeof PLANNER_MEDIA]?.poster ?? PLANNER_MEDIA.Portugal.poster}
            fallbackSrc={PLANNER_MEDIA[draft.destination as keyof typeof PLANNER_MEDIA]?.fallback ?? PLANNER_MEDIA.Portugal.fallback}
            alt={PLANNER_MEDIA[draft.destination as keyof typeof PLANNER_MEDIA]?.alt ?? PLANNER_MEDIA.Portugal.alt}
            width={2400}
            height={1761}
            sizes="(min-width: 1024px) 384px, 100vw"
            motionPolicy="poster-only"
            className="relative aspect-[4/3] w-full overflow-hidden rounded-[22px] border border-linen-dark/15"
            posterClassName="brightness-[0.72] saturate-[0.88]"
            overlayClassName="bg-gradient-to-t from-primary/80 via-primary/10 to-transparent"
            testId="planner-context-media"
          />
          <div className="grid gap-2">
            <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light">Your brief</p>
          <p className="max-w-xs text-base leading-7 text-linen-dark/65">Keep the practical context visible while you choose what is worth doing.</p>
          </div>
          <div className="rumia-planner-summary grid gap-3" data-testid="planner-summary">
            <p className="text-xs leading-relaxed text-linen-dark/55">
              Edit any choice on the left, then carry this brief into your activity day.
            </p>
            <TripSummary
              title="Activity context"
              ariaLabel="Activity context"
              draft={context}
              onEdit={(key) => {
                if (key === "destination") setSheet("destination");
                else if (key === "travelWindow") setSheet("window");
                else if (key === "days") setSheet("days");
                else if (key === "transport") setSheet("transport");
                else if (key === "vibe") setSheet("vibe");
              }}
              primaryAction={
                actionState === "navigating"
                  ? "Saving this context"
                  : actionState === "continued"
                    ? "Open this context again"
                    : actionState === "error"
                      ? "Retry context"
                      : "Continue with this context"
              }
              onPrimaryAction={submit}
              primaryActionDisabled={actionState === "navigating" || !draft.destination.trim() || draft.days < 1}
            />
          </div>
          {actionState === "navigating" ? <p role="status" className="text-center text-base text-linen-dark/70">Opening the activity view…</p> : null}
          {actionState === "continued" ? <p role="status" className="text-center text-base text-ochre-light">Context ready in the activity view.</p> : null}
          {actionState === "error" ? <p role="status" className="text-center text-base text-rose-200">We could not open the activity view. Try again.</p> : null}
        </aside>
      </div>

      <OptionSheet open={sheet === "destination"} title="Where will you spend time?" description="Choose the place where you’ll already be; activities come next." onClose={() => setSheet(null)}>
        <div className="grid gap-3">{DESTINATIONS.map(([value, description]) => <ChoiceCard key={value} id={`sheet-destination-${value}`} name="destination-sheet" value={value} label={value} description={description} selected={draft.destination === value} onSelect={(next) => { update("destination", next); setSheet(null); }} />)}</div>
      </OptionSheet>
      <OptionSheet open={sheet === "window"} title="When will you go?" description="A season is enough; the route will do the rest." onClose={() => setSheet(null)}>
        <div role="radiogroup" aria-label="Travel window" className="grid gap-2">{WINDOWS.map((value) => <button key={value} type="button" role="radio" aria-checked={(draft.travelWindow ?? "Any time") === value} onClick={() => { update("travelWindow", value === "Any time" ? null : value); setSheet(null); }} className="min-h-11 rounded-lg border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light">{value}</button>)}</div>
      </OptionSheet>
      <OptionSheet open={sheet === "days"} title="How much time do you have?" onClose={() => setSheet(null)}>
        <div role="radiogroup" aria-label="Trip duration" className="grid gap-2">{DURATIONS.map((days) => <button key={days} type="button" role="radio" aria-checked={draft.days === days} onClick={() => { update("days", days); setSheet(null); }} className="min-h-11 rounded-lg border p-3 text-left">{days} days</button>)}</div>
      </OptionSheet>
      <OptionSheet open={sheet === "transport"} title="How will you move?" onClose={() => setSheet(null)}>
        <ChoiceChipGroup label="Transport" multiple={false} selected={[draft.transport]} onChange={(values) => { if (values[0]) update("transport", values[0] as TransportChoice); setSheet(null); }} options={[{ value: "transit", label: "Transit & walking" }, { value: "car", label: "Rental car" }]} />
      </OptionSheet>
      <OptionSheet open={sheet === "vibe"} title="What is the trip vibe?" onClose={() => setSheet(null)}>
        <ChoiceChipGroup label="Vibe" multiple={false} selected={[draft.vibe]} onChange={(values) => { if (values[0]) update("vibe", values[0] as Vibe); setSheet(null); }} options={[{ value: "restorative", label: "Restorative" }, { value: "balanced", label: "Balanced" }, { value: "high_energy", label: "High energy" }]} />
      </OptionSheet>
    </main>
  );
}
