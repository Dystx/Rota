import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import type { CameraExecutor } from "../../core/camera-controller";
import type { CameraTarget, MapStyleEndpoint } from "../../core/types";

export interface MapLibreInstanceOptions {
  container: HTMLElement;
  style: MapStyleEndpoint;
  initialTarget?: CameraTarget;
  reducedMotion?: boolean;
}

/**
 * Mounts a MapLibre Map and exposes a CameraExecutor that proxies
 * flyTo/jumpTo/fitBounds.
 *
 * The 3D globe projection is enabled here per the architecture brief: a
 * single `setProjection({ type: "globe" })` call transforms the flat
 * canvas into a smooth interactive orb. Phase 2 will layer a soft fog
 * halo on top via a custom paint layer once the style-spec version is
 * bumped to a release that types fog as a top-level StyleSpecification
 * property.
 */
export async function mountMapLibreInstance(options: MapLibreInstanceOptions): Promise<{
  map: MapLibreMap;
  executor: CameraExecutor;
}> {
  const target = options.initialTarget ?? { center: [-8.2245, 39.3999] as [number, number], zoom: 1.6 };

  const map = new maplibregl.Map({
    container: options.container,
    style: options.style.url,
    center: target.center as [number, number],
    zoom: target.zoom ?? 1.6,
    pitch: target.pitch ?? 0,
    bearing: target.bearing ?? 0,
    attributionControl: false,
    cooperativeGestures: true
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

  await new Promise<void>((resolve, reject) => {
    const onLoad = () => {
      map.off("error", onError);
      resolve();
    };
    const onError = (event: { error?: Error }) => {
      map.off("load", onLoad);
      reject(event.error ?? new Error("MapLibre style failed to load"));
    };
    map.once("load", onLoad);
    map.once("error", onError);
  });

  // Globe projection — the headline visual from the architecture brief.
  map.setProjection({ type: "globe" });

  const executor: CameraExecutor = {
    flyTo: (flyOptions) =>
      new Promise<void>((resolve) => {
        map.flyTo({
          center: flyOptions.center,
          zoom: flyOptions.zoom,
          pitch: flyOptions.pitch,
          bearing: flyOptions.bearing,
          duration: flyOptions.duration,
          essential: true
        });
        if (flyOptions.duration === 0) {
          resolve();
          return;
        }
        const startedAt = Date.now();
        const duration = flyOptions.duration ?? 1200;
        const tick = () => {
          if (Date.now() - startedAt >= duration) {
            map.off("moveend", tick);
            resolve();
            return;
          }
          map.once("moveend", tick);
        };
        map.once("moveend", tick);
      }),
    jumpTo: (jumpOptions) => {
      map.jumpTo({
        center: jumpOptions.center,
        zoom: jumpOptions.zoom,
        pitch: jumpOptions.pitch,
        bearing: jumpOptions.bearing
      });
    },
    fitBounds: (bounds, opts) =>
      new Promise<void>((resolve) => {
        map.fitBounds(bounds, {
          padding: opts?.padding ?? 80,
          duration: opts?.duration ?? 1200,
          essential: true
        });
        if (opts?.duration === 0) {
          resolve();
          return;
        }
        map.once("moveend", () => resolve());
      })
  };

  return { map, executor };
}