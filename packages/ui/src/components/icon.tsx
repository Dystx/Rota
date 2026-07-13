import type { ReactNode, SVGProps } from "react";

import { cn } from "../lib/cn";

export type IconWeight = "regular" | "bold" | "light" | "thin" | "fill" | "duotone";

export const MATERIAL_TO_PHOSPHOR: Record<string, string> = {
  add: "plus", add_circle: "plus-circle", arrow_back: "arrow-left", arrow_forward: "arrow-right", arrow_upward: "arrow-up", check: "check",
  close: "x", download: "download-simple", edit_note: "note-pencil", filter_list: "funnel", ios_share: "share-network",
  print: "printer", public: "globe", search: "magnifying-glass", support_agent: "headset", tune: "sliders-horizontal",
  car_rental: "car", directions_transit: "bus", verified_user: "shield-check", stars: "star", forum: "chat-circle-dots",
  schedule: "calendar", self_improvement: "yoga", directions_run: "person-simple-run", diamond: "diamond", museum: "bank",
  auto_awesome: "sparkle", info: "info", error: "warning-circle", menu: "list", home: "house", assignment_turned_in: "check-circle",
  format_quote: "quotes", bookmark: "bookmark-simple", rule: "scroll", sparkle: "sparkle", trending_up: "trend-up", trending_down: "trend-down", drag_indicator: "dots-six-vertical", priority_high: "warning-circle", warning: "warning-circle",
  check_circle: "check-circle", expand_more: "caret-down", inbox: "tray", history: "clock-counter-clockwise", sync: "arrows-clockwise",
  person: "user", map: "map", place: "map-pin", handshake: "handshake", verified: "seal-check", fact_check: "clipboard-text", monitoring: "pulse",
  luggage: "suitcase", restaurant: "fork-knife", directions_walk: "person-simple-walk", hotel: "bed", route: "path",
  payments: "credit-card", swap_calls: "arrows-left-right", timer: "timer", explore: "compass", chat_bubble: "chat-circle",
  account_tree: "tree-structure", analytics: "chart-line-up", settings: "gear",
  save: "floppy-disk", sliders_horizontal: "sliders-horizontal", funnel: "funnel",
  library_books: "books", timeline: "timeline", plus_circle: "plus-circle",
  sync_alt: "arrows-left-right", groups: "users-three", edit: "pencil-simple",
  data_array: "list-dashes", satellite_alt: "satellite", location_city: "buildings",
  terrain: "mountains", chevron_right: "caret-right", lock: "lock",
  chat_circle_dots: "chat-circle-dots", attach_file: "paperclip", send: "paper-plane-right",
  travel_explore: "compass", add_location_alt: "map-pin", picture_as_pdf: "file-pdf",
  event: "calendar", link: "link", grid_view: "squares-four", view_list: "list",
  sync_saved_locally: "cloud-arrow-down", share: "share-network", file_download: "download-simple",
  more_vert: "dots-three-vertical"
};

const PATHS: Record<string, ReactNode> = {
  "arrow-right": <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  "arrow-left": <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
  "arrow-up": <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>,
  "caret-down": <path d="m6 9 6 6 6-6" />,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  x: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  list: <><path d="M5 7h14" /><path d="M5 12h14" /><path d="M5 17h14" /></>,
  house: <><path d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /><path d="M9 20v-6h6v6" /></>,
  "magnifying-glass": <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
  "check-circle": <><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.3 2.3 4.8-5" /></>,
  info: <><circle cx="12" cy="12" r="8" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
  "warning-circle": <><circle cx="12" cy="12" r="8" /><path d="M12 8v5" /><path d="M12 16h.01" /></>,
  tray: <><path d="M4 5h16v12H4z" /><path d="M4 14h5l1.5 2h3L15 14h5" /></>,
  user: <><circle cx="12" cy="8" r="3" /><path d="M5 20c.8-3.3 3.1-5 7-5s6.2 1.7 7 5" /></>,
  "map-pin": <><path d="M19 10c0 4.5-7 10-7 10S5 14.5 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
  map: <><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z" /><path d="M9 4v14M15 6v14" /></>,
  compass: <><circle cx="12" cy="12" r="8" /><path d="m15 9-2 4-4 2 2-4z" /></>,
  "note-pencil": <><path d="M13 6h5a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-5" /><path d="M5 15 4 20l5-1 9-9-4-4z" /></>,
  quotes: <><path d="M9 11H5a1 1 0 0 0-1 1v4h5v-5a5 5 0 0 0-5-5" /><path d="M20 11h-4a1 1 0 0 0-1 1v4h5v-5a5 5 0 0 0-5-5" /></>,
  "bookmark-simple": <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z" />,
  car: <><path d="m5 16 1.5-6h11L19 16" /><path d="M4 16h16v3H4z" /><circle cx="7" cy="19" r="1" /><circle cx="17" cy="19" r="1" /></>,
  bus: <><rect x="5" y="3" width="14" height="17" rx="2" /><path d="M5 9h14M8 16h.01M16 16h.01M8 20v1M16 20v1" /></>,
  scroll: <><path d="M8 5h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a3 3 0 0 1-3-3V7a2 2 0 0 1 2-2h1" /><path d="M8 5v11a3 3 0 0 0 3 3" /></>,
  sparkle: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6z" /></>,
  "trend-up": <><path d="M4 16 10 10l4 4 6-7" /><path d="M15 7h5v5" /></>,
  "trend-down": <><path d="m4 8 6 6 4-4 6 7" /><path d="M15 17h5v-5" /></>,
  "dots-six-vertical": <><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></>
  ,"floppy-disk": <><path d="M5 3h11l3 3v15H5z" /><path d="M8 3v6h8V3" /><path d="M8 14h8v7H8z" /></>,
  "sliders-horizontal": <><path d="M4 7h6M14 7h6M4 17h3M11 17h9" /><circle cx="12" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  funnel: <path d="M4 5h16l-6 7v5l-4 2v-7z" />,
  books: <><path d="M6 4h10v16H6z" /><path d="M9 4v16M10 8h3M10 12h3" /><path d="M18 6h2v14h-2" /></>,
  timeline: <><circle cx="6" cy="6" r="2" /><circle cx="18" cy="12" r="2" /><circle cx="6" cy="18" r="2" /><path d="M8 7.5 16 11M16 13 8 16.5" /></>,
  "plus-circle": <><circle cx="12" cy="12" r="8" /><path d="M12 8v8M8 12h8" /></>,
  "arrows-left-right": <><path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4" /></>,
  "users-three": <><circle cx="9" cy="8" r="3" /><path d="M3 20c.7-3.2 2.7-5 6-5s5.3 1.8 6 5" /><path d="M16 5.5a3 3 0 0 1 0 5.8M17 15c2.2.5 3.5 2.1 4 5" /></>,
  "pencil-simple": <><path d="m5 19 1-4L16 5l3 3L9 18z" /><path d="m14 7 3 3" /></>,
  "list-dashes": <><path d="M5 6h2M10 6h9M5 12h2M10 12h9M5 18h2M10 18h9" /></>,
  satellite: <><path d="m7 7 10 10M9 5l2-2 10 10-2 2zM5 9l-2 2 10 10 2-2z" /><circle cx="12" cy="12" r="2" /></>,
  buildings: <><path d="M5 21V4h9v17M14 9h5v12M8 8h3M8 12h3M8 16h3M17 13h1M17 17h1" /></>,
  mountains: <><path d="m3 20 6-11 4 6 2-3 6 8z" /><path d="m9 9 2-2 2 3" /></>,
  "caret-right": <path d="m9 6 6 6-6 6" />,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  "chat-circle-dots": <><path d="M20 12a8 8 0 0 1-8 8 8.8 8.8 0 0 1-4-.9L4 20l.9-4A8 8 0 1 1 20 12Z" /><circle cx="9" cy="12" r=".7" /><circle cx="12" cy="12" r=".7" /><circle cx="15" cy="12" r=".7" /></>,
  paperclip: <path d="m8 12 5-5a3 3 0 0 1 4 4l-6 6a4 4 0 0 1-6-6l6-6" />,
  "paper-plane-right": <><path d="m4 5 16 7-16 7 3-7z" /><path d="M7 12h13" /></>,
  "tree-structure": <><circle cx="6" cy="6" r="2" /><circle cx="18" cy="12" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 6h4a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3M15 12h1" /></>,
  "chart-line-up": <><path d="M4 19V5M4 19h16" /><path d="m7 15 4-4 3 2 5-6" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.2-1.7l2-1.5-2-3.4-2.4 1a7 7 0 0 0-3-1.7L13 2H9l-.4 2.7a7 7 0 0 0-3 1.7l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 3 12c0 .6.1 1.2.2 1.7l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 3 1.7L9 22h4l.4-2.7a7 7 0 0 0 3-1.7l2.4 1 2-3.4-2-1.5c.1-.5.2-1.1.2-1.7Z" /></>,
  "download-simple": <><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></>,
  printer: <><path d="M6 9V4h12v5" /><path d="M6 17H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v7H6z" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
  headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h3v5H5a1 1 0 0 1-1-1zM20 14h-3v5h2a1 1 0 0 0 1-1z" /></>,
  "share-network": <><circle cx="6" cy="12" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="m8 11 8-4M8 13l8 4" /></>,
  "file-pdf": <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5" /><path d="M8 16h8M8 12h5" /></>,
  link: <><path d="M9 15 7 17a3 3 0 0 1-4-4l3-3a3 3 0 0 1 4 0" /><path d="m15 9 2-2a3 3 0 0 1 4 4l-3 3a3 3 0 0 1-4 0" /><path d="m8 16 8-8" /></>,
  "squares-four": <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  "cloud-arrow-down": <><path d="M7 18h10a4 4 0 0 0 .6-8A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7Z" /><path d="M12 10v6M9.5 13.5 12 16l2.5-2.5" /></>,
  "dots-three-vertical": <><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></>
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  name: string;
  weight?: IconWeight;
  children?: ReactNode;
}

export function Icon({ name, weight = "regular", className, children, ...props }: IconProps) {
  const resolved = MATERIAL_TO_PHOSPHOR[name] ?? name;
  const strokeWidth = weight === "bold" ? 2.4 : weight === "light" || weight === "thin" ? 1.25 : 1.8;

  return (
    <svg
      aria-hidden="true"
      className={cn("inline-block shrink-0", className)}
      data-icon={resolved}
      data-testid="icon"
      data-weight={weight}
      fill="none"
      focusable="false"
      height="1em"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      {PATHS[resolved] ?? <circle cx="12" cy="12" r="7" />}
      {children}
    </svg>
  );
}
