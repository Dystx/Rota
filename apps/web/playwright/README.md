# Playwright conventions

- `@smoke` covers minimal route and auth-state sanity checks.
- `@visual` uses the canonical `desktop-1440`, `tablet-landscape`, `tablet-portrait`, and `mobile-390` projects. The visual suite keeps compatibility with the committed desktop/mobile snapshot filenames while selecting viewports only from those canonical projects.
- `@a11y` runs `@axe-core/playwright` against stable public routes.
- Auth personas use seeded storage-state helpers from `playwright/fixtures/*.ts`; they are conventions only and do not replace real Supabase sign-in coverage.

## Visual Regression Baselines
- **Regenerate baselines**: `pnpm --dir apps/web exec playwright test --grep @visual --update-snapshots`
- **When to approve**: Approve visual diffs when intentional design changes are made. Review carefully to ensure unrelated UI elements did not break.
- **Masking**: Use `mask: [page.locator('selector')]` to hide dynamic regions (timestamps, avatars, seeded IDs) in `visual.spec.ts` so baselines remain stable. Keep masks narrow.
- **Plan evidence**: Full-app Framer Motion redesign task 5 writes evidence under `.sisyphus/evidence/full-app-framer-redesign/task-5-*`.
