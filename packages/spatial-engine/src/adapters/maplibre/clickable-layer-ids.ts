import { AMBIENT_PULSE_LAYER_ID } from "./layers/ambient-pulse";
import {
  ACTIVITY_POINTS_LABEL_LAYER_ID,
  ACTIVITY_POINTS_LAYER_ID
} from "./layers/activity-points";
import { ROUTE_STOPS_LAYER_ID } from "./layers/route-layer";
import { SYMBOL_BADGES_LAYER_ID } from "./layers/symbol-badges";

/** Layer IDs that participate in click-to-stop forwarding. */
export const CLICKABLE_LAYER_IDS: readonly string[] = [
  AMBIENT_PULSE_LAYER_ID,
  SYMBOL_BADGES_LAYER_ID,
  ROUTE_STOPS_LAYER_ID,
  ACTIVITY_POINTS_LAYER_ID,
  ACTIVITY_POINTS_LABEL_LAYER_ID
] as const;
