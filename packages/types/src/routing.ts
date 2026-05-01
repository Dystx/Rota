import { z } from "zod";

export const RouteStopPointSchema = z.object({
  dayIndex: z.number().int().min(1),
  index: z.number().int().min(0),
  placeName: z.string(),
  region: z.string(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  timeLabel: z.string()
});

export const RouteDayLayerSchema = z.object({
  dayIndex: z.number().int().min(1),
  label: z.string(),
  region: z.string(),
  estimatedTravelMinutes: z.number().int().min(0),
  warningCount: z.number().int().min(0),
  points: z.array(RouteStopPointSchema).min(2)
});

export const RouteWarningSchema = z.object({
  code: z.enum([
    "travel_time_high",
    "too_many_stops",
    "meal_timing_weak",
    "missing_rain_fallback",
    "rest_buffer_thin"
  ]),
  severity: z.enum(["info", "warning", "critical"]),
  title: z.string(),
  detail: z.string(),
  dayIndex: z.number().int().min(1).optional()
});

export const RouteValidationSchema = z.object({
  days: z.array(RouteDayLayerSchema).min(1),
  warnings: z.array(RouteWarningSchema),
  summary: z.string()
});

export type RouteStopPoint = z.infer<typeof RouteStopPointSchema>;
export type RouteDayLayer = z.infer<typeof RouteDayLayerSchema>;
export type RouteWarning = z.infer<typeof RouteWarningSchema>;
export type RouteValidation = z.infer<typeof RouteValidationSchema>;
