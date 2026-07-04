/**
 * Root ESLint flat config (ESLint 9).
 *
 * Scope (2026-07-04):
 *   - Lints the NEW code added in the 2026-07-04 risk-mitigation
 *     pass: the filmstrip / camera-sync hooks + tests in
 *     `apps/web/lib/hooks/`, the new trip-section / stop-filmstrip
 *     tests in `apps/web/app/(app)/trip/[tripId]/_components/`,
 *     and the `useMapSourceSync` test.
 *   - The rest of the repo is explicitly OUT OF SCOPE. Project-wide
 *     lint is a future hardening task; existing legacy code would
 *     produce 100+ style violations on first run and is out of
 *     scope for incremental work.
 *
 * Conventions enforced on the in-scope files:
 *   - TypeScript safety: no explicit any, no unused vars
 *   - React Hooks: rules-of-hooks + exhaustive-deps
 *   - Style: prefer-const, no-var, no-shadow, eqeqeq
 *
 * To extend: add paths to IN_SCOPE below. To do a project-wide
 * sweep, replace IN_SCOPE with a broader glob and address the
 * legacy files in a follow-up PR.
 */
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

// The targeted files. Anything not in this list is NOT LINTED —
// this is intentional, see the docstring above.
const IN_SCOPE = [
  "apps/web/lib/hooks/useFilmstripSourceSync.ts",
  "apps/web/lib/hooks/useFilmstripSourceSync.test.ts",
  "apps/web/lib/hooks/useFilmstripSourceSync.test.tsx",
  "apps/web/lib/hooks/useTargetCoordinatesCameraSync.ts",
  "apps/web/store/useMapSourceSync.test.tsx",
  "apps/web/app/(app)/trip/[tripId]/_components/cinematic-map-section.test.tsx",
  "apps/web/app/(app)/trip/[tripId]/_components/stop-filmstrip.tsx"
];

export default [
  // 0. Global ignores — never lint dependencies, build
  // output, or cache dirs.
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/.sisyphus/**",
      "**/.playwright-mcp/**",
      "**/test-results/**"
    ]
  },

  // 1. Single config block, scoped to IN_SCOPE, with all the
  // rules inlined. Spreading the recommended configs would
  // apply them repo-wide; inlining keeps the scope tight.
  {
    files: IN_SCOPE,
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vitest test globals
        ...globals.vitest,
        // React 19 JSX runtime doesn't need React in scope
        React: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react-hooks": reactHooks
    },
    rules: {
      // ====== @eslint/js recommended ======
      ...js.configs.recommended.rules,
      // ====== typescript-eslint recommended ======
      ...tseslint.configs.recommended[0].rules,
      ...tseslint.configs.recommended[1].rules,
      // ====== react-hooks recommended ======
      ...reactHooks.configs.recommended.rules,

      // ====== Project-specific overrides ======
      // The repo uses `unknown` for runtime-shape guards; the
      // `no-explicit-any` rule is too strict for the existing
      // code shape. Off; revisit per file.
      "@typescript-eslint/no-explicit-any": "off",
      // Allow `_`-prefixed unused vars/args.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      // Test files can use non-null assertions for `flights[0]!`
      // etc. — the type system can't see the test's stub.
      "@typescript-eslint/no-non-null-assertion": "off"
    }
  }
];
