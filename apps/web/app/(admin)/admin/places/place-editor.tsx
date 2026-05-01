"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, DataTable } from "@repo/ui";
import type { Place } from "@repo/types";

type PlaceRow = Place & { quality: number | null };

const initialPlaces: PlaceRow[] = [
  {
    id: "miradouro-da-vitoria",
    category: "Viewpoint",
    name: "Miradouro da Vitória",
    quality: 8.8,
    region: "Porto",
    sourceConfidence: "High"
  },
  {
    id: "quinta-pinhao",
    category: "Wine experience",
    name: "Quinta in Pinhão",
    quality: 9.1,
    region: "Douro",
    sourceConfidence: "Medium"
  },
  {
    id: "rainy-day-museum",
    category: "Museum",
    name: "Rainy-day museum",
    quality: 7.9,
    region: "Lisbon",
    sourceConfidence: "High"
  }
];

type DraftState = {
  category: string;
  name: string;
  quality: string;
  region: string;
  sourceConfidence: string;
};

const emptyDraft: DraftState = {
  category: "",
  name: "",
  quality: "",
  region: "",
  sourceConfidence: ""
};

function toId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `place-${Date.now()}`;
}

export function PlaceEditor() {
  const [places, setPlaces] = useState<PlaceRow[]>(initialPlaces);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [message, setMessage] = useState("Loading persisted places…");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const rows = useMemo(
    () =>
      places.map((place) => [
        place.name,
        place.region,
        place.category,
        place.quality?.toString() ?? "Pending",
        place.sourceConfidence,
        <Button key={`${place.id}-edit`} type="button" variant="ghost" onClick={() => startEdit(place)}>
          Edit
        </Button>
      ]),
    [places]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadPlaces() {
      try {
        const response = await fetch("/api/places");
        const payload = (await response.json()) as {
          message?: string;
          places?: PlaceRow[];
        };

        if (!isMounted) {
          return;
        }

        if (response.ok && payload.places) {
          setPlaces(payload.places);
          setMessage(payload.places.length ? "Loaded persisted places." : "No persisted places yet.");
          return;
        }

        setPlaces(initialPlaces);
        setMessage(payload.message ?? "Falling back to local admin rehearsal data.");
      } catch {
        if (!isMounted) {
          return;
        }

        setPlaces(initialPlaces);
        setMessage("Could not load persisted places. Using local admin rehearsal data.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPlaces();

    return () => {
      isMounted = false;
    };
  }, []);

  function startEdit(place: PlaceRow) {
    setEditingId(place.id);
    setDraft({
      category: place.category,
      name: place.name,
      quality: place.quality?.toString() ?? "",
      region: place.region,
      sourceConfidence: place.sourceConfidence
    });
    setMessage(`Editing ${place.name}.`);
  }

  function resetForm() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function savePlace() {
    if (!draft.name.trim() || !draft.region.trim()) {
      setMessage("Name and region are required.");
      return;
    }

    const nextPlace = {
      id: editingId ?? toId(draft.name),
      category: draft.category || "Uncategorized",
      name: draft.name.trim(),
      quality: draft.quality ? Number(draft.quality) : null,
      region: draft.region.trim(),
      sourceConfidence: draft.sourceConfidence || "Pending"
    };

    setIsSaving(true);

    try {
      const response = await fetch(editingId ? `/api/places/${editingId}` : "/api/places", {
        body: JSON.stringify(nextPlace),
        headers: {
          "Content-Type": "application/json"
        },
        method: editingId ? "PATCH" : "POST"
      });

      const payload = (await response.json()) as {
        message?: string;
        place?: PlaceRow;
      };

      if (response.ok && payload.place) {
        setPlaces((current) => {
          if (!editingId) {
            return [payload.place!, ...current.filter((place) => place.id !== payload.place!.id)];
          }

          return current.map((place) => (place.id === editingId ? payload.place! : place));
        });

        setMessage(payload.message ?? (editingId ? `${payload.place.name} updated.` : `${payload.place.name} added.`));
        resetForm();
        return;
      }

      setPlaces((current) => {
        if (!editingId) {
          return [nextPlace, ...current];
        }

        return current.map((place) => (place.id === editingId ? nextPlace : place));
      });

      setMessage(payload.message ?? (editingId ? `${nextPlace.name} updated in the local admin editor.` : `${nextPlace.name} added to the local admin editor.`));
      resetForm();
    } catch {
      setPlaces((current) => {
        if (!editingId) {
          return [nextPlace, ...current];
        }

        return current.map((place) => (place.id === editingId ? nextPlace : place));
      });

      setMessage(editingId ? `${nextPlace.name} updated in the local admin editor.` : `${nextPlace.name} added to the local admin editor.`);
      resetForm();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>Places table</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {isLoading ? <p className="rota-muted text-sm">Loading places…</p> : null}
          <DataTable columns={["Place", "Region", "Category", "Quality", "Source confidence", "Action"]} rows={rows} />
          <p className="rota-muted text-sm">{message}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit place" : "New place"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField label="Place name">
            <input className="rota-form-input" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
          </FormField>
          <FormField label="Region">
            <input className="rota-form-input" value={draft.region} onChange={(event) => setDraft((current) => ({ ...current, region: event.target.value }))} />
          </FormField>
          <FormField label="Category">
            <input className="rota-form-input" value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Quality score">
              <input className="rota-form-input" value={draft.quality} onChange={(event) => setDraft((current) => ({ ...current, quality: event.target.value }))} />
            </FormField>
            <FormField label="Source confidence">
              <input className="rota-form-input" value={draft.sourceConfidence} onChange={(event) => setDraft((current) => ({ ...current, sourceConfidence: event.target.value }))} />
            </FormField>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={savePlace} disabled={isSaving}>{isSaving ? "Saving…" : editingId ? "Save place" : "Add place"}</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>Clear</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FormField({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="rota-form-field">
      <span className="rota-form-label">{label}</span>
      {children}
    </label>
  );
}
