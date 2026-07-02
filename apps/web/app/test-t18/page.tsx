"use client"

import * as React from "react"
import { ItineraryTimeline, TimelineDay } from "@repo/ui"

const MOCK_ITINERARY: TimelineDay[] = [
  {
    id: "day-1",
    dateLabel: "Day 1: The Portuguese Riviera",
    activities: [
      {
        id: "act-1",
        timeLabel: "10:00 AM",
        title: "Arrival in Cascais",
        description: "Check into your oceanfront suite. Enjoy a welcome pastry and espresso on the terrace.",
      },
      {
        id: "act-2",
        timeLabel: "1:00 PM",
        title: "Coastal Seafood Lunch",
        description: "Fresh catch of the day at a hidden gem recommended by our local concierge. Table is reserved.",
      },
    ],
  },
  {
    id: "day-2",
    dateLabel: "Day 2: Sintra & Surroundings",
    activities: [
      {
        id: "act-3",
        timeLabel: "9:00 AM",
        title: "Pena Palace Private Tour",
        locked: true,
        lockedTeaser: "Unlock this itinerary to view your private guide details and skip-the-line access codes.",
        description: "Your guide, Maria, will meet you at the main gate. Here are your VIP entry barcodes: [REDACTED].",
      },
      {
        id: "act-4",
        timeLabel: "3:00 PM",
        title: "Wine Tasting at Colares",
        locked: true,
        lockedTeaser: "Unlock for directions to our exclusive vineyard partner.",
        description: "Drive down the N247 to the hidden vineyard. Ask for Joao.",
      },
    ],
  },
]

export default function TestT18Page() {
  const [activeId, setActiveId] = React.useState<string | null>("act-1")
  const [isReadOnly, setIsReadOnly] = React.useState(false)

  return (
    <main className="min-h-screen bg-[var(--color-paper)] p-8 md:p-16">
      <div className="max-w-xl mx-auto space-y-12">
        <header className="space-y-4">
          <h1 className="font-display text-4xl text-[var(--color-ink)]">T18: Timeline Primitives</h1>
          <p className="text-[var(--color-muted-foreground)] font-body">
            Demonstrating cinematic itinerary primitives, expandable details, locked states, and generic map-sync hooks.
          </p>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={isReadOnly}
                onChange={(e) => setIsReadOnly(e.target.checked)}
                className="rounded border-[var(--color-border)]"
              />
              Read-Only Mode
            </label>
            <span className="text-sm text-[var(--color-muted-foreground)]">
              Active ID: {activeId || "none"}
            </span>
          </div>
        </header>

        <section>
          <ItineraryTimeline
            days={MOCK_ITINERARY}
            activeActivityId={activeId}
            onActivitySelect={setActiveId}
            readOnly={isReadOnly}
          />
        </section>
      </div>
    </main>
  )
}
