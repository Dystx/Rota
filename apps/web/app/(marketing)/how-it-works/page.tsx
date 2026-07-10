import * as React from "react";
import Link from "next/link";
import { PageShell, SectionHeading } from "@repo/ui";

const steps = [["Write your trip", "Start with the places, time, and pace you want."], ["See the first route", "Rumia turns the brief into a practical Portugal-shaped plan."], ["Refine the choices", "Adjust the route through simple phrases, not a chat thread."], ["Add local judgment", "Unlock the itinerary, then ask for a specialist review when you want it."]];

export default function HowItWorksPage() {
  return <PageShell bare><SectionHeading eyebrow="A calm way to plan" title="From a trip idea to a route you can trust." description="Rumia keeps the AI in the background and puts your decisions in the foreground." h1 /><ol className="grid gap-8 md:grid-cols-4">{steps.map(([title, text], index) => <li key={title} className="border-t border-[var(--color-border)] pt-4"><p className="text-sm text-ochre-dark">0{index + 1}</p><h2 className="mt-3 font-display text-2xl text-primary">{title}</h2><p className="mt-2 text-sm text-on-surface-variant">{text}</p></li>)}</ol><Link href="/planner" className="mt-12 inline-block border-b border-ochre-dark text-ochre-dark">Plan Portugal</Link></PageShell>;
}
