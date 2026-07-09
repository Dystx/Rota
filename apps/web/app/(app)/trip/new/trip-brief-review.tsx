"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TripBriefSchema, type TripBrief, interestOptions, paceOptions, transportModes, portugalRegions } from "@repo/types";
import { Button, Card, CardContent, CardHeader, CardTitle, ChoiceCard, ChoiceChipGroup, OptionSheet } from "@repo/ui";

const labels: Record<string, string> = { portugal: "Portugal", "mid-range": "Mid-range", "train-and-transfers": "Train + transfers", "no-car": "No car", "rental-car": "Rental car", calm: "Calm" };
const label = (value: string) => labels[value] ?? value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function TripBriefReview({ initialBrief }: { initialBrief: Partial<TripBrief> }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...initialBrief });
  const [sheet, setSheet] = useState<string | null>(null);
  const [refineOpen, setRefineOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key: string, value: unknown) => setDraft((d) => ({ ...d, [key]: value }));
  const result = TripBriefSchema.safeParse(draft);
  const missing = ["destinationCountry", "regions", "tripLengthDays", "travelersCount", "travelerType", "budgetLevel", "pace", "interests", "transportMode", "rawBrief"].find((key) => {
    const value = draft[key];
    return value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
  });
  async function submit() {
    if (!result.success) { setMessage("Choose the highlighted missing values before submitting."); setSheet(missing ?? null); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(result.data) });
      const payload = await response.json() as { tripId?: string; message?: string; error?: { message?: string } };
      if (!response.ok) { setMessage(payload.error?.message ?? payload.message ?? "Could not save the trip brief yet."); return; }
      setMessage("Trip brief saved. Opening the draft route…"); if (payload.tripId) router.push(`/trip/${payload.tripId}`);
    } catch { setMessage("The draft trip request failed before the server responded."); } finally { setBusy(false); }
  }
  const rows: Array<[string, string, string]> = [["Destination", "destinationCountry", label(String(draft.destinationCountry ?? "Choose destination"))], ["Regions", "regions", Array.isArray(draft.regions) ? draft.regions.map(String).map(label).join(", ") : "Choose regions"], ["Dates", "dates", draft.startDate && draft.endDate ? `${draft.startDate} → ${draft.endDate}` : "Flexible dates"], ["Trip length", "tripLengthDays", draft.tripLengthDays ? `${draft.tripLengthDays} days` : "Choose duration"], ["Transport", "transportMode", draft.transportMode ? label(String(draft.transportMode)) : "Choose transport"], ["Pace", "pace", draft.pace ? label(String(draft.pace)) : "Choose pace"], ["Interests", "interests", Array.isArray(draft.interests) ? draft.interests.map(String).map(label).join(", ") : "Choose interests"]];
  return <div className="grid gap-6" data-testid="trip-brief-review"><Card><CardHeader><CardTitle>Review your trip brief</CardTitle><p className="text-sm text-on-surface-variant">We carried your planner choices forward. Change only what needs attention.</p></CardHeader><CardContent><div className="grid gap-2">{rows.map(([title, key, value]) => <button key={key} type="button" onClick={() => setSheet(key)} className="flex min-h-14 items-center justify-between rounded-lg border p-4 text-left"><span><span className="block text-xs uppercase tracking-wider text-on-surface-variant">{title}</span><span>{value}</span></span><span aria-hidden>✎</span></button>)}</div><button type="button" className="mt-6 text-sm underline" onClick={() => setRefineOpen((v) => !v)} aria-expanded={refineOpen}>Refine this plan</button>{refineOpen ? <div className="mt-4 rounded-lg border p-4 text-sm">Food preferences, avoidances, accommodation, and additional context can be refined here.</div> : null}<p role="status" aria-live="polite" className="mt-5 text-sm">{message || (result.success ? "Ready for audit." : "Some choices still need your attention.")}</p><Button type="button" onClick={() => void submit()} disabled={busy} className="mt-4">{busy ? "Auditing…" : "Audit & Polish Plan"}</Button></CardContent></Card>
    <OptionSheet open={sheet === "transportMode"} title="Choose transport" onClose={() => setSheet(null)}><ChoiceChipGroup label="Transport" multiple={false} selected={draft.transportMode ? [String(draft.transportMode)] : []} onChange={(v) => { if (v[0]) update("transportMode", v[0]); setSheet(null); }} options={transportModes.map((v) => ({ value: v, label: label(v) }))} /></OptionSheet>
    <OptionSheet open={sheet === "pace"} title="Choose pace" onClose={() => setSheet(null)}><ChoiceChipGroup label="Pace" multiple={false} selected={draft.pace ? [String(draft.pace)] : []} onChange={(v) => { if (v[0]) update("pace", v[0]); setSheet(null); }} options={paceOptions.map((v) => ({ value: v, label: label(v) }))} /></OptionSheet>
    <OptionSheet open={sheet === "destinationCountry"} title="Choose destination" onClose={() => setSheet(null)}><ChoiceCard id="destination-portugal" name="destination" value="portugal" label="Portugal" description="A considered route through Portugal." selected={draft.destinationCountry === "portugal"} onSelect={(v) => { update("destinationCountry", v); setSheet(null); }} /></OptionSheet>
    <OptionSheet open={sheet === "regions"} title="Choose regions" onClose={() => setSheet(null)}><ChoiceChipGroup label="Regions" multiple selected={Array.isArray(draft.regions) ? draft.regions.map(String) : []} onChange={(v) => update("regions", v)} options={portugalRegions.map((v) => ({ value: v, label: label(v) }))} /></OptionSheet>
    <OptionSheet open={sheet === "interests"} title="Choose interests" onClose={() => setSheet(null)}><ChoiceChipGroup label="Interests" multiple selected={Array.isArray(draft.interests) ? draft.interests.map(String) : []} onChange={(v) => update("interests", v)} options={interestOptions.map((v) => ({ value: v, label: label(v) }))} /></OptionSheet>
    <OptionSheet open={sheet === "tripLengthDays"} title="How long is the trip?" onClose={() => setSheet(null)}><ChoiceChipGroup label="Trip length" multiple={false} selected={draft.tripLengthDays ? [String(draft.tripLengthDays)] : []} onChange={(v) => { if (v[0]) update("tripLengthDays", Number(v[0])); setSheet(null); }} options={[3, 5, 7, 10, 14].map((v) => ({ value: String(v), label: `${v} days` }))} /></OptionSheet>
  </div>;
}
