/**
 * Conversation data is intentionally not seeded in the UI layer. A console
 * message becomes renderable only when a persisted conversation source is
 * connected; otherwise the route presents an unavailable state.
 */

export interface Day {
  id: string;
  label: string;
  date: string;
  title: string;
  summary: string;
  active: boolean;
  accent: string;
  name: string;
  avatarSrc: string;
}

export const DAYS: readonly Day[] = [];

export function formatChatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}
