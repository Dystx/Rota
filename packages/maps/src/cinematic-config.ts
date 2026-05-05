export const CINEMATIC_STYLE = "mapbox://styles/mapbox/standard";

export const TERRAIN_CONFIG = {
  source: "mapbox-dem",
  exaggeration: 1.4,
} as const;

export const FOG_CONFIG = {
  "horizon-blend": 0.3,
  color: "#e8d5b0",
  "high-color": "#2d3a5c",
} as const;

export const CHAPTER_CAMERA_DEFAULTS = {
  zoom: 12,
  pitch: 60,
  bearing: 30,
  duration: 2400,
  curve: 1.42,
} as const;

export const OVERVIEW_CAMERA = {
  zoom: 6,
  pitch: 0,
  bearing: 0,
} as const;
