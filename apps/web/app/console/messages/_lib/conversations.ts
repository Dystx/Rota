/**
 * Shared types + fixtures for the console /messages page.
 *
 * Extracted from the page component so the day data and the
 * `Day` type can be consumed by both the page shell and the
 * upcoming `<DayList>` / `<MessageThread>` subcomponents
 * without dragging 1067 lines of JSX into every import.
 *
 * The fixtures are wireframe-quality (no real backend yet) —
 * they give the UI something to render with realistic shape
 * (date badge, title, summary) so the day-cards sidebar looks
 * right during design review. The data model mirrors a
 * Portugal-first route sample and is explicitly marked as demo
 * data by the page shell.
 * pattern: each day is a selectable card in the left rail
 * that filters the chat thread in the center column.
 *
 * When the realtime channel is wired up (Supabase `itinerary`
 * + `message` tables) the data layer can replace this fixture
 * without touching the components.
 */

export interface Day {
  /** Stable id used as the active-day key. */
  id: string;
  /** Short day label, e.g. "Day 2". */
  label: string;
  /** Date pill, e.g. "Oct 13". */
  date: string;
  /** Headline describing the day's focus. */
  title: string;
  /** One-line summary shown in the card body. */
  summary: string;
  /** True for the first day so it boots selected. */
  active: boolean;
  /** Optional accent stripe color (hex) for the date pill. */
  accent: string;
  /** Traveler name shown in the chat thread header. */
  name: string;
  /** Avatar URL shown in the chat thread header bubbles. */
  avatarSrc: string;
}

export const DAYS: Day[] = [
  {
    id: "day-1",
    label: "Day 1",
    date: "Oct 12",
    title: "Arrival in Lisbon",
    summary: "Land in Lisbon, settle in Alfama, and take an easy river walk.",
    active: true,
    accent: "#2b3e34",
    name: "Eleanor Vance",
    avatarSrc: "/brand/mark.svg"
  },
  {
    id: "day-2",
    label: "Day 2",
    date: "Oct 13",
    title: "Lisbon Neighbourhoods",
    summary: "A slow Baixa loop, a tile studio, and a sunset viewpoint.",
    active: false,
    accent: "#CE933F",
    name: "Eleanor Vance",
    avatarSrc: "/brand/mark.svg"
  },
  {
    id: "day-3",
    label: "Day 3",
    date: "Oct 14",
    title: "Douro Valley & Vineyards",
    summary: "A quiet quinta visit, river lunch, and an unhurried return.",
    active: false,
    accent: "#4f6358",
    name: "Eleanor Vance",
    avatarSrc: "/brand/mark.svg"
  },
  {
    id: "day-4",
    label: "Day 4",
    date: "Oct 15",
    title: "Porto & Departure",
    summary: "Market breakfast, a final craft stop, and airport transfer.",
    active: false,
    accent: "#784d00",
    name: "Eleanor Vance",
    avatarSrc: "/brand/mark.svg"
  }
];

/**
 * Phase 7.1: format a chat-message ISO timestamp for the
 * bubble footer. Falls back to the raw string if the date
 * is unparseable, which keeps the UI informative on bad
 * data rather than showing "Invalid Date".
 */
export function formatChatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  // Locale-agnostic: 12-hour HH:MM AM/PM.
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}
