/**
 * Shared types + fixtures for the console /messages page.
 *
 * Extracted from the page component so the conversation data
 * and the `Conversation` type can be consumed by both the
 * page shell and the upcoming `<ConversationList>` /
 * `<MessageThread>` subcomponents without dragging 1067 lines
 * of JSX into every import.
 *
 * The fixtures are wireframe-quality (no real backend yet) —
 * they give the UI something to render with realistic shape
 * (avatar, region, timestamp, "last message" preview) so
 * the kanban + chat surfaces look right during design review.
 * When the realtime channel is wired up (Supabase
 * `conversation` + `message` tables) the data layer can
 * replace this fixture without touching the components.
 */

export interface Conversation {
  id: string;
  name: string;
  region: string;
  lastMessage: string;
  timestamp: string;
  active: boolean;
  avatarSrc: string;
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: "eleanor",
    name: "Eleanor Vance",
    region: "Kyoto, Japan",
    lastMessage: "I\u2019d love to add that tea ceremony to the itinerary.",
    timestamp: "10:42 AM",
    active: true,
    avatarSrc: "https://i.pravatar.cc/40?img=5"
  },
  {
    id: "hastings",
    name: "The Hasting Family",
    region: "Tuscany, Italy",
    lastMessage: "Could you confirm the car transfer?",
    timestamp: "Yesterday",
    active: false,
    avatarSrc: "https://i.pravatar.cc/40?img=11"
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
