`lsp_diagnostics` could not run because the configured Biome LSP is not installed in this environment.
Verification fallback used: package build plus grep and diff checks.


## T03 package export gotcha
- Re-exporting geocoding from @repo/maps root made @repo/ai typecheck traverse provider-map.tsx without JSX enabled; fixed by adding AI package JSX compiler support while importing @repo/maps.
