P01 tokens added cleanly inside the existing `@theme inline` block in `packages/ui/src/styles.css`.
Tailwind v4 token naming works for both `--color-iberian-*` utilities and non-color gradient tokens.
`pnpm -F @repo/ui build` completed successfully after the additive CSS edit.
T05 camera math stayed pure with no mapbox-gl dependency; bearing interpolation used shortest-path modular math and passed the wrap-around test.


## T03 geocoding integration
- AI enrichment uses @repo/maps directly to avoid pulling the maps package root TSX provider into the @repo/ai typecheck.
- @repo/ai tests can inject createFakeAnalyticsProvider via enrich options for deterministic telemetry assertions.
