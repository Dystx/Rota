import type { SpatialLayer, TelemetryChannel } from "../../core/types";

/** Runtime-free layer/channel registry shared by layers and the engine. */
const bindings = new WeakMap<SpatialLayer, TelemetryChannel>();

export function bindLayerToChannel(layer: SpatialLayer, channel: TelemetryChannel): void {
  bindings.set(layer, channel);
}

export function getLayerChannel(layer: SpatialLayer): TelemetryChannel | undefined {
  return bindings.get(layer);
}
