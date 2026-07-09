import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * Icon — Phosphor icon wrapper.
 *
 * PR-A2 (Phosphor migration). Use as:
 *
 *   <Icon name="arrow-right" weight="regular" />
 *   <Icon name="airplane-takeoff" weight="bold" className="text-4xl" />
 *   <Icon name="home" />                          // MS or Phosphor name; both resolve
 *
 * Material Symbols names (`home`, `ios_share`, `car_rental`) are
 * accepted via the migration map below. Phosphor names are direct.
 *
 * Weight defaults to "regular" (.ph base class). Other weights
 * append: -bold, -light, -thin, -fill, -duotone.
 *
 * See: https://phosphoricons.com
 */
export type IconWeight = "regular" | "bold" | "light" | "thin" | "fill" | "duotone";

/**
 * Material Symbols → Phosphor name map.
 *
 * Material Symbols names are snake_case (and contain underscores that
 * are *invalid CSS class fragments*) and do not exist in Phosphor.
 * The migration preserves the existing icon name strings in call
 * sites and translates them at render time. Update this map when the
 * design system adopts new icons.
 */
export const MATERIAL_TO_PHOSPHOR: Record<string, string> = {
  // common controls
  add: "plus",
  add_circle: "plus-circle",
  arrow_back: "arrow-left",
  arrow_forward: "arrow-right",
  check: "check",
  close: "x",
  download: "download-simple",
  edit_note: "note-pencil",
  filter_list: "funnel",
  ios_share: "share-network",
  print: "printer",
  public: "globe",
  search: "magnifying-glass",
  support_agent: "headset",
  tune: "sliders-horizontal",
  // planner
  car_rental: "car",
  directions_transit: "bus",
  // checkout
  verified_user: "shield-check",
  stars: "star",
  forum: "chat-circle-dots",
  schedule: "calendar",
  // hero / trip / account
  self_improvement: "yoga",
  directions_run: "person-simple-run",
  diamond: "diamond",
  museum: "bank",
  auto_awesome: "sparkle",
  info: "info",
  menu: "list",
  home: "house",
  // console nav
  assignment_turned_in: "check-circle",
  chat_bubble: "chat-circle",
  account_tree: "tree-structure",
  analytics: "chart-line-up",
  settings: "gear"
};

const WEIGHT_CLASS: Record<IconWeight, string> = {
  regular: "ph",
  bold: "ph-bold",
  light: "ph-light",
  thin: "ph-thin",
  fill: "ph-fill",
  duotone: "ph-duotone"
};

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Phosphor or Material Symbols icon name. Both resolve at render. */
  name: string;
  weight?: IconWeight;
  children?: ReactNode;
  className?: string;
}

export function Icon({
  name,
  weight = "regular",
  className,
  children,
  ...props
}: IconProps) {
  const resolved = MATERIAL_TO_PHOSPHOR[name] ?? name;
  const cls = `${WEIGHT_CLASS[weight]} ph-${resolved}`;
  return (
    <span
      aria-hidden
      className={cn(cls, "inline-block leading-none", className)}
      data-testid="icon"
      data-icon={resolved}
      data-weight={weight}
      {...props}
    >
      {children}
    </span>
  );
}
