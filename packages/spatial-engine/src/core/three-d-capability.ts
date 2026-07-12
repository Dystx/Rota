/**
 * Conservative gate for optional 3D map enhancement.
 *
 * The list and top-down map remain available when any capability check fails.
 * This is intentionally pure so device policy can be tested without a browser
 * or a MapLibre instance.
 */
export interface ThreeDCapabilityInput {
  requested: boolean;
  reducedMotion: boolean;
  viewportWidth: number;
  finePointer: boolean;
  hardwareConcurrency: number;
  webgl: boolean;
}

export type ThreeDCapabilityFailureReason =
  | "reduced-motion"
  | "small-viewport"
  | "coarse-pointer"
  | "weak-device"
  | "webgl-unavailable"
  | null;

export interface ThreeDCapabilityResult {
  enabled: boolean;
  reason: ThreeDCapabilityFailureReason;
}

export function evaluateThreeDCapability(input: ThreeDCapabilityInput): ThreeDCapabilityResult {
  if (!input.requested) return { enabled: false, reason: null };
  if (input.reducedMotion) return { enabled: false, reason: "reduced-motion" };
  if (input.viewportWidth < 768) return { enabled: false, reason: "small-viewport" };
  if (!input.finePointer) return { enabled: false, reason: "coarse-pointer" };
  if (input.hardwareConcurrency < 4) return { enabled: false, reason: "weak-device" };
  if (!input.webgl) return { enabled: false, reason: "webgl-unavailable" };
  return { enabled: true, reason: null };
}

export function canUseThreeDEnhancement(input: ThreeDCapabilityInput): boolean {
  return evaluateThreeDCapability(input).enabled;
}
