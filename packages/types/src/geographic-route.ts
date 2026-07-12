import { z } from "zod";

/**
 * Geographic route data is deliberately separate from the legacy schematic
 * route model (`x`/`y` percentages in `routing.ts`). The tuple follows the
 * GeoJSON/MapLibre order: [longitude, latitude] in WGS84 decimal degrees.
 */
export const GeographicCoordinateSchema = z
  .tuple([
    z.number().finite().min(-180).max(180),
    z.number().finite().min(-90).max(90)
  ])
  .readonly();

export type GeographicCoordinate = z.infer<typeof GeographicCoordinateSchema>;

export const GeographicLineStringSchema = z
  .object({
    type: z.literal("LineString"),
    coordinates: z.array(GeographicCoordinateSchema).min(2)
  })
  .strict();

export type GeographicLineString = z.infer<typeof GeographicLineStringSchema>;

export const RouteTravelModeSchema = z.enum(["walk", "transit", "drive", "cycle", "mixed"]);
export type RouteTravelMode = z.infer<typeof RouteTravelModeSchema>;

export const GeographicRouteStopSchema = z
  .object({
    id: z.string().min(1),
    activityId: z.string().min(1),
    title: z.string().min(1),
    dayIndex: z.number().int().positive(),
    order: z.number().int().nonnegative(),
    coordinates: GeographicCoordinateSchema.nullable()
  })
  .strict();

export type GeographicRouteStop = z.infer<typeof GeographicRouteStopSchema>;

export const GeographicRouteSegmentSchema = z
  .object({
    fromStopId: z.string().min(1),
    toStopId: z.string().min(1),
    mode: RouteTravelModeSchema,
    durationMinutes: z.number().int().nonnegative().nullable(),
    distanceMeters: z.number().nonnegative().nullable(),
    geometry: GeographicLineStringSchema.nullable(),
    source: z.enum(["provider", "editorial", "none"]),
    checkedAt: z.string().min(1).nullable(),
    attribution: z.string().min(1).nullable()
  })
  .strict()
  .superRefine((segment, context) => {
    if (segment.source === "none" && segment.geometry !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["geometry"],
        message: "A segment without a route source cannot contain geometry."
      });
    }
    if (segment.source !== "none" && segment.geometry === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["geometry"],
        message: "A sourced segment must include validated geometry."
      });
    }
    if (segment.source !== "none" && segment.checkedAt === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkedAt"],
        message: "A sourced segment must include the date its geometry was checked."
      });
    }
    if (segment.source !== "none" && segment.attribution === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["attribution"],
        message: "A sourced segment must include provider attribution."
      });
    }
  });

export type GeographicRouteSegment = z.infer<typeof GeographicRouteSegmentSchema>;

export const GeographicRouteSchema = z
  .object({
    coordinateSystem: z.literal("WGS84"),
    status: z.enum(["ready", "partial", "unavailable"]),
    stops: z.array(GeographicRouteStopSchema),
    segments: z.array(GeographicRouteSegmentSchema)
  })
  .strict();

export type GeographicRoute = z.infer<typeof GeographicRouteSchema>;
