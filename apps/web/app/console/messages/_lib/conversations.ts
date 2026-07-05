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
 * right during design review. The data model mirrors the
 * reference's "Day 2 • Oct 13, Higashiyama Exploration"
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
    title: "Arrival in Kyoto",
    summary: "Land at KIX, transfer to the ryokan, gentle walk in Gion.",
    active: true,
    accent: "#2b3e34",
    name: "Eleanor Vance",
    avatarSrc: "https://i.pravatar.cc/40?img=5"
  },
  {
    id: "day-2",
    label: "Day 2",
    date: "Oct 13",
    title: "Higashiyama Exploration",
    summary: "Pre-dawn Kiyomizu-dera, Ryoan-ji at opening, tea ceremony.",
    active: false,
    accent: "#CE933F",
    name: "Eleanor Vance",
    avatarSrc: "https://i.pravatar.cc/40?img=5"
  },
  {
    id: "day-3",
    label: "Day 3",
    date: "Oct 14",
    title: "Arashiyama & Bamboo",
    summary: "Early-morning bamboo grove, Tenryu-ji, river boat to Uji.",
    active: false,
    accent: "#4f6358",
    name: "Eleanor Vance",
    avatarSrc: "https://i.pravatar.cc/40?img=5"
  },
  {
    id: "day-4",
    label: "Day 4",
    date: "Oct 15",
    title: "Nishiki Market & Departure",
    summary: "Last market run, craft stops, late checkout, KIX transfer.",
    active: false,
    accent: "#784d00",
    name: "Eleanor Vance",
    avatarSrc: "https://i.pravatar.cc/40?img=5"
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
