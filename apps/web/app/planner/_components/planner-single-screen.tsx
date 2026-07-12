"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  ChoiceCard,
  ChoiceChipGroup,
  OptionSheet,
  RouteConsequence,
  TripContextBar,
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
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (!initialEdit) return;
    setSheet(initialEdit === "travelWindow" ? "window" : initialEdit);
    if (initialEdit === "travelWindow" || initialEdit === "transport" || initialEdit === "vibe") {
      setFocusedGroup("details");
    } else if (initialEdit === "days") {
      setFocusedGroup("days");
    }
  }, [initialEdit]);

  const update = <K extends keyof TripChoiceDraft>(key: K, value: TripChoiceDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const submit = () => {
    if (pending) return;
    setPending(true);
    router.push(draftToPlannerUrl(draft));
  };
  const context = {
    destination: draft.destination,
    days: draft.days,
    travelWindow: draft.travelWindow,
    transport: draft.transport === "car" ? "Car" : "Transit",
    vibe: draft.vibe === "high_energy" ? "High energy" : draft.vibe === "restorative" ? "Restorative" : "Balanced",
  };

  return (
    <main id="main-content" className="min-h-screen bg-primary text-linen-dark" data-testid="planner-single-screen">
      <header className="flex justify-between items-center px-container-padding-lg py-5">
        <Link href="/" aria-label="Back to home" className="font-headline-sm italic text-ochre-light">Rumia</Link>
        <button type="button" onClick={() => router.push("/")} aria-label="Close planner" className="rounded p-2 text-linen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light">×</button>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-12 md:px-8 lg:grid-cols-[1.2fr_.8fr]">
        <div className="contents">
          <div className="lg:col-start-2 lg:row-start-1">
            <TripContextBar draft={context} onEdit={(key) => {
              if (key === "destination") setSheet("destination");
              else if (key === "travelWindow") setSheet("window");
              else if (key === "days") setSheet("days");
              else if (key === "transport") setSheet("transport");
              else if (key === "vibe") setSheet("vibe");
            }} tripState="draft" />
          </div>
        <section className="grid content-start gap-6">
          <div className="grid gap-2">
            <p className="font-mono-micro uppercase tracking-widest text-ochre-light">Start with an activity decision</p>
            <h1 className="font-display text-4xl leading-tight md:text-6xl">Plan from the activities you have in mind.</h1>
            <p className="max-w-xl text-linen-dark/75">Choose an activity situation first, then return here when you have a day worth shaping.</p>
          </div>

          <nav aria-label="Trip choices" className="grid grid-cols-3 gap-2 md:hidden">
            {([["destination", "Where"], ["days", "How long"], ["details", "Details"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={focusedGroup === value} onClick={() => setFocusedGroup(value)} className="min-h-11 rounded-full border border-white/20 px-3 text-sm aria-[pressed=true]:border-ochre-light aria-[pressed=true]:text-ochre-light">{label}</button>)}
          </nav>

          <div className={`grid gap-3 ${focusedGroup !== "destination" ? "hidden md:grid" : ""}`} aria-label="Destination choices">
            <div className="flex items-center justify-between"><h2 className="font-headline-sm text-xl">Where to?</h2><button type="button" onClick={() => setSheet("destination")} className="text-sm underline">Browse all</button></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {DESTINATIONS.slice(0, 2).map(([value, description]) => <ChoiceCard key={value} id={`destination-${value}`} name="destination" value={value} label={value} description={description} selected={draft.destination === value} onSelect={(next) => update("destination", next)} />)}
            </div>
          </div>

          <div className={`grid gap-3 ${focusedGroup !== "days" ? "hidden md:grid" : ""}`} aria-label="Trip duration choices">
            <h2 className="font-headline-sm text-xl">How long?</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DURATIONS.map((days) => <ChoiceCard key={days} id={`duration-${days}`} name="days" value={String(days)} label={`${days} days`} description={days === 7 ? "A balanced first journey." : "A different pace, same care."} selected={draft.days === days} onSelect={() => update("days", days)} />)}
            </div>
          </div>

          <div className={`grid gap-4 rounded-xl border border-white/15 bg-white/5 p-5 ${focusedGroup !== "details" ? "hidden md:grid" : ""}`} aria-label="Trip details choices">
            <button type="button" onClick={() => setSheet("window")} className="flex min-h-11 items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" aria-label="Choose travel window">
              <span><span className="block text-xs uppercase tracking-widest text-ochre-light">Travel window</span><span className="block text-lg">{draft.travelWindow ?? "Any time"}</span></span><span aria-hidden>⌄</span>
            </button>
            <ChoiceChipGroup label="Transport" labelClassName="text-linen-dark" multiple={false} selected={[draft.transport]} onChange={(values) => values[0] && update("transport", values[0] as TransportChoice)} options={[{ value: "transit", label: "Transit & walking" }, { value: "car", label: "Rental car" }]} />
            <ChoiceChipGroup label="Vibe" labelClassName="text-linen-dark" multiple={false} selected={[draft.vibe]} onChange={(values) => values[0] && update("vibe", values[0] as Vibe)} options={[{ value: "restorative", label: "Restorative" }, { value: "balanced", label: "Balanced" }, { value: "high_energy", label: "High energy" }]} />
          </div>

          <RouteConsequence status="ready" transportLabel={draft.transport === "transit" ? "Transit keeps the route to two bases" : "Car opens the Douro interior"} stopCount={draft.transport === "transit" ? 2 : 4} />
        </section>

        <aside className="grid content-start gap-4 lg:col-start-2 lg:row-start-2 lg:sticky lg:top-6 lg:self-start">
          <TripSummary draft={context} primaryAction={pending ? "Updating your route" : "Build my itinerary"} onPrimaryAction={submit} primaryActionDisabled={pending || !draft.destination.trim() || draft.days < 1} />
          {pending ? <p role="status" className="text-center text-sm text-linen-dark/70">Updating your route</p> : null}
        </aside>
        </div>
      </div>

      <OptionSheet open={sheet === "destination"} title="Choose a destination" description="Start with the place that pulls you in." onClose={() => setSheet(null)}>
        <div className="grid gap-3">{DESTINATIONS.map(([value, description]) => <ChoiceCard key={value} id={`sheet-destination-${value}`} name="destination-sheet" value={value} label={value} description={description} selected={draft.destination === value} onSelect={(next) => { update("destination", next); setSheet(null); }} />)}</div>
      </OptionSheet>
      <OptionSheet open={sheet === "window"} title="When will you go?" description="A season is enough; the route will do the rest." onClose={() => setSheet(null)}>
        <div role="radiogroup" aria-label="Travel window" className="grid gap-2">{WINDOWS.map((value) => <button key={value} type="button" role="radio" aria-checked={(draft.travelWindow ?? "Any time") === value} onClick={() => { update("travelWindow", value === "Any time" ? null : value); setSheet(null); }} className="min-h-11 rounded-lg border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light">{value}</button>)}</div>
      </OptionSheet>
      <OptionSheet open={sheet === "days"} title="How long will you go?" onClose={() => setSheet(null)}>
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
