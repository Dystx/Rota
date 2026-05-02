# packages/maps

Map provider configuration, safe token resolution, and provider-backed map components.

## Architecture

This package provides a safe abstraction layer for Mapbox integration:
- **`provider.ts`**: Resolves whether Mapbox is enabled (`isMapProviderEnabled`) and safely retrieves the token (`getMapProviderToken`).
  - It enforces that only public tokens (`pk.*`) are accepted.
  - It ignores private tokens (`sk.*`), which prevents `MAPBOX_SECRET_KEY` from being accidentally loaded on the client.
  - It includes a deterministic Playwright override (`forceMapboxProvider=1` query param) which only functions when `NODE_ENV !== "production"`.
- **`ProviderMap`**: A lightweight facade component that serves as the placeholder for the real Mapbox GL instance. It respects the same layout and interface as the schematic fallback map but indicates the presence of a provider token.
  - *Note: A heavy SDK like `react-map-gl` would plug directly into this facade. We keep this facade lightweight to avoid blocking app initialization and keeping bundle budgets small until the full SDK is needed.*

## Usage

```tsx
import { isMapProviderEnabled, ProviderMap } from "@repo/maps";
import { RouteMap as SchematicMap } from "@repo/ui";

export function RouteMap(props) {
  // Always verify on the client side to avoid hydration mismatch if env is different
  const [useProvider, setUseProvider] = useState<boolean | null>(null);

  useEffect(() => {
    setUseProvider(isMapProviderEnabled());
  }, []);

  if (useProvider === null) return <SchematicMap {...props} />;
  return useProvider ? <ProviderMap {...props} /> : <SchematicMap {...props} />;
}
```
