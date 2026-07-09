"use client";

import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import {
  TripBriefSchema,
  budgetLevels,
  travelerTypes,
  interestOptions,
  paceOptions,
  portugalRegions,
  transportModes,
  foodPreferenceOptions,
  avoidanceOptions
} from "@repo/types";
import { Button, Card, CardContent, CardHeader, CardTitle, ChoiceCard, ChoiceChipGroup, OptionSheet } from "@repo/ui";

const labels: Record<string, string> = { portugal: "Portugal", "mid-range": "Mid-range", "train-and-transfers": "Train + transfers", "no-car": "No car", "rental-car": "Rental car", calm: "Calm" };
const pretty = (value: string) => labels[value] ?? value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const required = ["destinationCountry", "regions", "tripLengthDays", "startDate", "endDate", "travelersCount", "travelerType", "budgetLevel", "transportMode", "pace", "interests", "rawBrief"] as const;

export function TripBriefReview({ initialBrief }: { initialBrief: Record<string, unknown> }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...initialBrief });
  const [sheet, setSheet] = useState<string | null>(null);
  const [refineOpen, setRefineOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const update = (key: string, value: unknown) => setDraft((d) => ({ ...d, [key]: value }));
  const parsed = TripBriefSchema.safeParse(draft);
  const missing = required.filter((key) => {
    if (key === "startDate" || key === "endDate") return false; // dates are optional as a pair
    const value = draft[key];
    return value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
  });
  const dateMissing = Boolean(draft.startDate) !== Boolean(draft.endDate);
  const firstMissing = missing[0] ?? (dateMissing ? "dates" : null);
  const rows: Array<[string, string, string]> = [
    ["Destination", "destinationCountry", draft.destinationCountry ? pretty(String(draft.destinationCountry)) : "Choose destination"],
    ["Regions", "regions", Array.isArray(draft.regions) && draft.regions.length ? draft.regions.map(String).map(pretty).join(", ") : "Choose regions"],
    ["Dates", "dates", draft.startDate && draft.endDate ? `${draft.startDate} → ${draft.endDate}` : "Flexible dates"],
    ["Travelers", "travelersCount", draft.travelersCount ? `${draft.travelersCount} traveler${Number(draft.travelersCount) === 1 ? "" : "s"}` : "Choose travelers"],
    ["Traveler type", "travelerType", draft.travelerType ? pretty(String(draft.travelerType)) : "Choose traveler type"],
    ["Budget", "budgetLevel", draft.budgetLevel ? pretty(String(draft.budgetLevel)) : "Choose budget"],
    ["Trip length", "tripLengthDays", draft.tripLengthDays ? `${draft.tripLengthDays} days` : "Choose duration"],
    ["Transport", "transportMode", draft.transportMode ? pretty(String(draft.transportMode)) : "Choose transport"],
    ["Pace", "pace", draft.pace ? pretty(String(draft.pace)) : "Choose pace"],
    ["Interests", "interests", Array.isArray(draft.interests) && draft.interests.length ? draft.interests.map(String).map(pretty).join(", ") : "Choose interests"]
    ,["Additional context", "rawBrief", draft.rawBrief ? String(draft.rawBrief).slice(0, 80) : "Add trip context"]
  ];
  async function submit() {
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { const key = String(issue.path[0] ?? "brief"); fieldErrors[key] = issue.message; });
      setErrors(fieldErrors); setMessage("Choose the highlighted missing values before submitting."); setSheet(firstMissing); return;
    }
    setBusy(true); setErrors({}); setMessage("");
    try {
      const response = await fetch("/api/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const payload = await response.json() as { tripId?: string; message?: string; error?: { message?: string }; errors?: Record<string, string[]>; fieldErrors?: Record<string, string[]> };
      if (!response.ok) {
        const apiErrors = payload.errors ?? payload.fieldErrors;
        if (apiErrors) { const next: Record<string, string> = {}; Object.entries(apiErrors).forEach(([key, values]) => { if (values?.[0]) next[key] = values[0]; }); setErrors(next); }
        setMessage(payload.error?.message ?? payload.message ?? "Could not save the trip brief yet."); return;
      }
      setMessage("Trip brief saved. Opening the draft route…"); if (payload.tripId) router.push(`/trip/${payload.tripId}`);
    } catch { setMessage("The draft trip request failed before the server responded."); } finally { setBusy(false); }
  }
  const options = (values: readonly string[]) => values.map((value) => ({ value, label: pretty(value) }));
  return <div className="grid gap-6" data-testid="trip-brief-review"><Card><CardHeader><CardTitle>Review your trip brief</CardTitle><p className="text-sm text-on-surface-variant">We carried your planner choices forward. Change only what needs attention.</p></CardHeader><CardContent><div className="grid gap-2">{rows.map(([title, key, value]) => <button key={key} type="button" onClick={() => setSheet(key)} className={`flex min-h-14 items-center justify-between rounded-lg border p-4 text-left ${errors[key] ? "border-red-500" : ""}`}><span><span className="block text-xs uppercase tracking-wider text-on-surface-variant">{title}</span><span>{value}</span>{errors[key] ? <span className="block text-sm text-red-600">{errors[key]}</span> : null}</span><span aria-hidden>✎</span></button>)}</div>
    <button type="button" className="mt-6 text-sm underline" onClick={() => setRefineOpen((v) => !v)} aria-expanded={refineOpen}>Refine this plan</button>
    {refineOpen ? <div className="mt-4 grid gap-4 rounded-lg border p-4"><ChoiceChipGroup label="Food preferences" options={options(foodPreferenceOptions)} selected={Array.isArray(draft.foodPreferences) ? draft.foodPreferences.map(String) : []} onChange={(v) => update("foodPreferences", v)} /><ChoiceChipGroup label="Avoidances" options={options(avoidanceOptions)} selected={Array.isArray(draft.avoidances) ? draft.avoidances.map(String) : []} onChange={(v) => update("avoidances", v)} /><label>Accommodation<input className="rota-form-input" value={String(draft.accommodationLocation ?? "")} onChange={(e) => update("accommodationLocation", e.target.value)} /></label><label>Additional context<textarea className="rota-form-input" value={String(draft.rawBrief ?? "")} onChange={(e) => update("rawBrief", e.target.value)} /></label></div> : null}
    <p role="status" aria-live="polite" className="mt-5 text-sm">{message || (parsed.success ? "Ready for audit." : "Some choices still need your attention.")}</p><Button type="button" onClick={() => void submit()} disabled={busy} className="mt-4">{busy ? "Auditing…" : "Audit & Polish Plan"}</Button></CardContent></Card>
    <OptionSheet open={sheet === "destinationCountry"} title="Choose destination" onClose={() => setSheet(null)}><ChoiceCard id="destination-portugal" name="destination" value="portugal" label="Portugal" description="A considered route through Portugal." selected={draft.destinationCountry === "portugal"} onSelect={(v) => { update("destinationCountry", v); setSheet(null); }} /></OptionSheet>
    <OptionSheet open={sheet === "regions"} title="Choose regions" onClose={() => setSheet(null)}><ChoiceChipGroup label="Regions" options={options(portugalRegions)} selected={Array.isArray(draft.regions) ? draft.regions.map(String) : []} onChange={(v) => update("regions", v)} /></OptionSheet>
    <OptionSheet open={sheet === "dates"} title="Choose dates" onClose={() => setSheet(null)}><div className="grid gap-3"><label>Start date<input type="date" className="rota-form-input" value={String(draft.startDate ?? "")} onChange={(e) => update("startDate", e.target.value)} /></label><label>End date<input type="date" className="rota-form-input" value={String(draft.endDate ?? "")} onChange={(e) => update("endDate", e.target.value)} /></label><Button type="button" onClick={() => setSheet(null)}>Done</Button></div></OptionSheet>
    <OptionSheet open={sheet === "travelersCount"} title="Choose travelers" onClose={() => setSheet(null)}><ChoiceChipGroup label="Travelers" multiple={false} options={[1,2,3,4,5,6,8,10,12].map((v) => ({ value: String(v), label: String(v) }))} selected={draft.travelersCount ? [String(draft.travelersCount)] : []} onChange={(v) => { if (v[0]) update("travelersCount", Number(v[0])); setSheet(null); }} /></OptionSheet>
    <OptionSheet open={sheet === "travelerType"} title="Choose traveler type" onClose={() => setSheet(null)}><ChoiceChipGroup label="Traveler type" multiple={false} options={options(travelerTypes)} selected={draft.travelerType ? [String(draft.travelerType)] : []} onChange={(v) => { if (v[0]) update("travelerType", v[0]); setSheet(null); }} /></OptionSheet>
    <OptionSheet open={sheet === "budgetLevel"} title="Choose budget" onClose={() => setSheet(null)}><ChoiceChipGroup label="Budget" multiple={false} options={options(budgetLevels)} selected={draft.budgetLevel ? [String(draft.budgetLevel)] : []} onChange={(v) => { if (v[0]) update("budgetLevel", v[0]); setSheet(null); }} /></OptionSheet>
    <OptionSheet open={sheet === "tripLengthDays"} title="How long is the trip?" onClose={() => setSheet(null)}><ChoiceChipGroup label="Trip length" multiple={false} options={[3,5,7,10,14].map((v) => ({ value: String(v), label: `${v} days` }))} selected={draft.tripLengthDays ? [String(draft.tripLengthDays)] : []} onChange={(v) => { if (v[0]) update("tripLengthDays", Number(v[0])); setSheet(null); }} /></OptionSheet>
    <OptionSheet open={sheet === "transportMode"} title="Choose transport" onClose={() => setSheet(null)}><ChoiceChipGroup label="Transport" multiple={false} options={options(transportModes)} selected={draft.transportMode ? [String(draft.transportMode)] : []} onChange={(v) => { if (v[0]) update("transportMode", v[0]); setSheet(null); }} /></OptionSheet>
    <OptionSheet open={sheet === "pace"} title="Choose pace" onClose={() => setSheet(null)}><ChoiceChipGroup label="Pace" multiple={false} options={options(paceOptions)} selected={draft.pace ? [String(draft.pace)] : []} onChange={(v) => { if (v[0]) update("pace", v[0]); setSheet(null); }} /></OptionSheet>
    <OptionSheet open={sheet === "interests"} title="Choose interests" onClose={() => setSheet(null)}><ChoiceChipGroup label="Interests" options={options(interestOptions)} selected={Array.isArray(draft.interests) ? draft.interests.map(String) : []} onChange={(v) => update("interests", v)} /></OptionSheet>
    <OptionSheet open={sheet === "rawBrief"} title="Add trip context" onClose={() => setSheet(null)}><div className="grid gap-3"><textarea className="rota-form-input" rows={6} value={String(draft.rawBrief ?? "")} onChange={(e) => update("rawBrief", e.target.value)} /><Button type="button" onClick={() => setSheet(null)}>Done</Button></div></OptionSheet>
  </div>;
}
