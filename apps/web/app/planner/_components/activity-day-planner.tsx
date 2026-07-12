"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChoiceChipGroup, EditorialHeading } from "@repo/ui";
import type { ActivityDayDraft, ActivityDayTime, ActivityDayTransport } from "@repo/types";
import type { EditorialActivity } from "@/lib/content/activities";

export type { ActivityDayTime, ActivityDayTransport } from "@repo/types";

const dayTimes: Readonly<Record<ActivityDayTime, { label: string; minutes: number }>> = {
  "three-hours": { label: "3 hours", minutes: 180 },
  afternoon: { label: "An afternoon", minutes: 270 },
  "full-day": { label: "A full day", minutes: 420 }
};

const regionNames: Readonly<Record<EditorialActivity["region"], string>> = {
  porto: "Porto",
  lisbon: "Lisbon",
  douro: "the Douro",
  algarve: "the Algarve",
  azores: "the Azores"
};

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${remainder} minutes`;
  if (remainder === 0) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  return `${hours} ${hours === 1 ? "hour" : "hours"} ${remainder} minutes`;
}

function joinRegions(regions: readonly string[]): string {
  if (regions.length === 1) return regions[0]!;
  if (regions.length === 2) return `${regions[0]} and ${regions[1]}`;
  return `${regions.slice(0, -1).join(", ")}, and ${regions.at(-1)}`;
}

export type ActivityDayFeasibility =
  | { kind: "cross-region"; regions: readonly string[]; selectedMinutes: number }
  | { kind: "overfull"; selectedMinutes: number; overByMinutes: number }
  | { kind: "tight"; selectedMinutes: number; remainingMinutes: number }
  | { kind: "comfortable"; selectedMinutes: number; remainingMinutes: number };

export function assessActivityDay(
  activities: readonly EditorialActivity[],
  availableMinutes: number
): ActivityDayFeasibility {
  const selectedMinutes = activities.reduce((total, activity) => total + activity.durationMinutes, 0);
  const regions = [...new Set(activities.map((activity) => regionNames[activity.region]))];

  if (regions.length > 1) return { kind: "cross-region", regions, selectedMinutes };

  const remainingMinutes = availableMinutes - selectedMinutes;
  if (remainingMinutes < 0) return { kind: "overfull", selectedMinutes, overByMinutes: Math.abs(remainingMinutes) };
  if (remainingMinutes <= 60) return { kind: "tight", selectedMinutes, remainingMinutes };
  return { kind: "comfortable", selectedMinutes, remainingMinutes };
}

function workspaceHref(activities: readonly EditorialActivity[]): string {
  const params = new URLSearchParams();
  activities.forEach((activity) => params.append("activity", activity.id));
  return `/explore/workspace?${params.toString()}`;
}

export function activityDayPlannerHref(
  activities: readonly EditorialActivity[],
  preferences: Pick<ActivityDayDraft, "dayTime" | "transport">
): string {
  const params = new URLSearchParams();
  activities.forEach((activity) => params.append("activity", activity.id));
  params.set("dayTime", preferences.dayTime);
  params.set("transport", preferences.transport);
  return `/planner?${params.toString()}`;
}

export function activityDaySignInHref(dayHref: string): string {
  return `/sign-in?next=${encodeURIComponent(dayHref)}`;
}

export function ActivityDayPlanner({
  activities,
  initialDayTime = "afternoon",
  initialTransport = "transit"
}: {
  activities: readonly EditorialActivity[];
  initialDayTime?: ActivityDayTime;
  initialTransport?: ActivityDayTransport;
}) {
  const router = useRouter();
  const [dayTime, setDayTime] = React.useState<ActivityDayTime>(initialDayTime);
  const [transport, setTransport] = React.useState<ActivityDayTransport>(initialTransport);
  const [isPreviewed, setIsPreviewed] = React.useState(false);
  const feasibility = assessActivityDay(activities, dayTimes[dayTime].minutes);
  const browserDraftHref = activityDayPlannerHref(activities, { dayTime, transport });

  function updateBrowserDraft(next: { dayTime: ActivityDayTime; transport: ActivityDayTransport }): void {
    router.replace(activityDayPlannerHref(activities, next), { scroll: false });
  }

  function chooseDayTime(values: readonly string[]): void {
    const next = values[0];
    if (next === "three-hours" || next === "afternoon" || next === "full-day") {
      setDayTime(next);
      setIsPreviewed(false);
      updateBrowserDraft({ dayTime: next, transport });
    }
  }

  function chooseTransport(values: readonly string[]): void {
    const next = values[0];
    if (next === "transit" || next === "car") {
      setTransport(next);
      setIsPreviewed(false);
      updateBrowserDraft({ dayTime, transport: next });
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-primary px-6 py-12 text-linen-dark md:px-10 md:py-16">
      <div className="mx-auto max-w-3xl">
        <Link className="inline-flex min-h-11 items-center text-sm font-medium text-ochre-light underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" href={workspaceHref(activities)}>
          Back to your selected day
        </Link>
        <div className="mt-10">
          <EditorialHeading
            eyebrow="Activity pace check"
            title="Shape your chosen day."
            tone="midnight"
            dek={<span className="text-linen-dark/80">Rumia will test the activities you selected against the time you have. It will not invent a route, bookings, or transfer times it cannot support.</span>}
          />
        </div>

        <section className="mt-10 border-y border-white/15 py-7" aria-labelledby="selected-activities-heading">
          <h2 id="selected-activities-heading" className="font-display text-3xl">Already chosen</h2>
          <ul className="mt-5 space-y-4">
            {activities.map((activity) => (
              <li className="flex flex-wrap items-baseline justify-between gap-2 text-linen-dark/85" key={activity.id}>
                <span>{activity.title}</span>
                <span className="text-sm text-ochre-light">{formatMinutes(activity.durationMinutes)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 grid gap-7" aria-label="Day feasibility choices">
          <ChoiceChipGroup
            label="Available time"
            labelClassName="text-linen-dark"
            multiple={false}
            options={Object.entries(dayTimes).map(([value, option]) => ({ value, label: option.label }))}
            selected={[dayTime]}
            onChange={chooseDayTime}
          />
          <ChoiceChipGroup
            label="Transport preference"
            labelClassName="text-linen-dark"
            multiple={false}
            options={[{ value: "transit", label: "Transit & walking" }, { value: "car", label: "Rental car" }]}
            selected={[transport]}
            onChange={chooseTransport}
          />
          <p className="text-sm leading-relaxed text-linen-dark/70">{transport === "transit" ? "Transit & walking is noted, but Rumia will not claim exact transfer times without your starting base." : "A rental car is noted, but Rumia will not claim exact driving time without your starting base."}</p>
          <button className="inline-flex min-h-11 w-fit items-center bg-ochre-light px-5 py-3 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary" type="button" onClick={() => setIsPreviewed(true)}>
            Preview this day
          </button>
        </section>

        {isPreviewed ? <FeasibilityResult feasibility={feasibility} dayTime={dayTimes[dayTime].label} signInHref={activityDaySignInHref(browserDraftHref)} /> : null}
      </div>
    </main>
  );
}

function FeasibilityResult({
  feasibility,
  dayTime,
  signInHref
}: {
  feasibility: ActivityDayFeasibility;
  dayTime: string;
  signInHref: string;
}) {
  return (
    <section className="mt-10 border border-ochre-light/50 bg-white/5 p-6" aria-live="polite" aria-labelledby="feasibility-heading">
      <h2 id="feasibility-heading" className="font-display text-3xl">Does this day fit?</h2>
      {feasibility.kind === "cross-region" ? (
        <p className="mt-4 max-w-2xl leading-relaxed text-linen-dark/85">Your selections span {joinRegions(feasibility.regions)}. Treat them as different days; Rumia will not pretend a transport preference makes that a practical single-day route.</p>
      ) : null}
      {feasibility.kind === "overfull" ? (
        <p className="mt-4 max-w-2xl leading-relaxed text-linen-dark/85">{feasibility.selectedMinutes} minutes of selected activity time is about {formatMinutes(feasibility.overByMinutes)} more than {dayTime.toLowerCase()} allows, before any real transfers or meals.</p>
      ) : null}
      {feasibility.kind === "tight" ? (
        <p className="mt-4 max-w-2xl leading-relaxed text-linen-dark/85">{feasibility.selectedMinutes} minutes of selected activity time fits {dayTime.toLowerCase()} on timing alone, but leaves only about {formatMinutes(feasibility.remainingMinutes)} unallocated before a transfer, meal, or pause.</p>
      ) : null}
      {feasibility.kind === "comfortable" ? (
        <p className="mt-4 max-w-2xl leading-relaxed text-linen-dark/85">{feasibility.selectedMinutes} minutes of selected activity time fits {dayTime.toLowerCase()} on timing alone and leaves about {formatMinutes(feasibility.remainingMinutes)} unallocated. Use that time for a meal, a pause, or an actual transfer once you know your base.</p>
      ) : null}
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-linen-dark/70">This is still an editable browser day. <Link className="font-medium text-ochre-light underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" href={signInHref}>Sign in to keep this day</Link> and return to the same selections.</p>
    </section>
  );
}
