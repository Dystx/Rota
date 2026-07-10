import type { ReactNode, SVGProps } from "react";

import { cn } from "../lib/cn";

export type IconWeight = "regular" | "bold" | "light" | "thin" | "fill" | "duotone";

export const MATERIAL_TO_PHOSPHOR: Record<string, string> = {
  add: "plus", add_circle: "plus-circle", arrow_back: "arrow-left", arrow_forward: "arrow-right", check: "check",
  close: "x", download: "download-simple", edit_note: "note-pencil", filter_list: "funnel", ios_share: "share-network",
  print: "printer", public: "globe", search: "magnifying-glass", support_agent: "headset", tune: "sliders-horizontal",
  car_rental: "car", directions_transit: "bus", verified_user: "shield-check", stars: "star", forum: "chat-circle-dots",
  schedule: "calendar", self_improvement: "yoga", directions_run: "person-simple-run", diamond: "diamond", museum: "bank",
  auto_awesome: "sparkle", info: "info", menu: "list", home: "house", assignment_turned_in: "check-circle",
  chat_bubble: "chat-circle", account_tree: "tree-structure", analytics: "chart-line-up", settings: "gear"
};

const PATHS: Record<string, ReactNode> = {
  "arrow-right": <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  "arrow-left": <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  x: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  list: <><path d="M5 7h14" /><path d="M5 12h14" /><path d="M5 17h14" /></>,
  house: <><path d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /><path d="M9 20v-6h6v6" /></>,
  "magnifying-glass": <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
  "check-circle": <><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.3 2.3 4.8-5" /></>,
  info: <><circle cx="12" cy="12" r="8" /><path d="M12 11v5" /><path d="M12 8h.01" /></>
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
