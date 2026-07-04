# Rumia Console — Visual Reference v1.0 (2026-07-04)

13-page Tailwind v4 + Material Symbols blueprint. Authoritative visual spec for both the consumer surface (1.x) and the admin console (2.x, 3.x). Page-by-page state map against the current codebase: see `docs/roadmap.md` §3.10.

## Index

### Consumer surface (1.x)

| File | Page | Notes |
|---|---|---|
| [`1.1-landing-discovery-gate.html`](./1.1-landing-discovery-gate.html) | Landing & Discovery Gate (cinematic hero + bento destinations) | `class="light"` |
| [`1.2-natural-brief-wizard.html`](./1.2-natural-brief-wizard.html) | Natural Brief Wizard (dark, ambient radial glow, inline `wizard-input` dashed borders) | `class="dark"` |
| [`1.3-smart-logistical-cards.html`](./1.3-smart-logistical-cards.html) | Smart Logistical Cards (single focal card, dual-option tile) | `class="light"` |
| [`1.4-dynamic-workspace.html`](./1.4-dynamic-workspace.html) | Dynamic Workspace (full-bleed map + filmstrip stops) | `class="light"` |
| [`1.5-tier-ascension-checkout.html`](./1.5-tier-ascension-checkout.html) | Tier Ascension Checkout (split-screen tier comparison) | `class="light"` |
| [`1.6-level-2-expert-chat.html`](./1.6-level-2-expert-chat.html) | Level 2 Expert Chat (3-pane: timeline / chat / recommendation card) | `class="dark"` |
| [`1.7-saved-vault-export.html`](./1.7-saved-vault-export.html) | Saved Vault & Export Panel (grid gallery + sliding export drawer) | `class="light"` |

### Admin console (2.x)

| File | Page | Notes |
|---|---|---|
| [`2.1-operations-pipeline.html`](./2.1-operations-pipeline.html) | Operations Pipeline Board (kanban: New Drafts / In Revision / Active Chats) | `class="light"` |
| [`2.2-master-revision-workspace.html`](./2.2-master-revision-workspace.html) | Master Revision Workspace (anchors + timeline + validation bar) | `class="light"` |
| [`2.3-specialist-messaging-hub.html`](./2.3-specialist-messaging-hub.html) | Specialist Messaging Hub (threads / chat / snippets + timeline push) | `class="light"` |

### Admin config (3.x)

| File | Page | Notes |
|---|---|---|
| [`3.1-global-metrics-dashboard.html`](./3.1-global-metrics-dashboard.html) | Global Metrics Dashboard (3-card bento + volume-trend bars + regional list) | `class="light"` |
| [`3.2-knowledge-graph-vector-cms.html`](./3.2-knowledge-graph-vector-cms.html) | Knowledge Graph Vector CMS (split hierarchy + record details, dark glass) | `class="dark"` |
| [`3.3-system-variable-config.html`](./3.3-system-variable-config.html) | System Variable Config (bento: LLM prompt multipliers + transit engine + status) | `class="light"` |

## Token contract

All 13 files share the same Tailwind v4 `theme.extend.colors` block (olive / ochre / cream / sage palette + `glass-light/glass-dark` glassmorphism) and the same font stack:

- **Display + headlines**: Playfair Display
- **Body + labels**: Inter
- **Mono / micro**: JetBrains Mono
- **Icons**: Material Symbols Outlined (variable `FILL` 0..1, `wght` 100..700)

These map 1:1 to the `@theme` block in `packages/ui/src/styles.css` (Phase 1b, `4591c5a`). The reference renders into the same palette the home page (`efac8b0`) and 12 prototype ports use — **no new tokens required**.

## Spacing / radius / type scale

- Spacing: `section-gap 24px`, `card-padding 20px`, `gutter 16px`, `container-padding-lg 32px`, `header-height 64px`
- Radius: `DEFAULT 0.25rem`, `lg 0.5rem`, `xl 0.75rem`, `full 9999px`
- Display: 72/1.1/-0.02em/700 (Playfair)
- Headline: `lg 30/40/700`, `sm 18/24/600`
- Body: `14/1.6/400` (Inter)
- Label: `12/16/600`
- Mono: `micro 10/12/0.1em/700`, `technical 12/16/500` (JetBrains Mono)

## How to view

The HTML files are self-contained and can be opened directly in a browser. They use `cdn.tailwindcss.com?plugins=forms,container-queries` at runtime; no build step. For pixel-accurate review, open in Chrome with the same viewport as the dev server (`/planner` and `/explore` are 1280-1440 wide).

## What changed vs the prior prototype

`docs/prototype.html` is the v0 consumer-only prototype. The 13 files here supersede it as the canonical visual spec — both the consumer surface **and** the admin console. The same `bg-olive-dark/95 backdrop-blur-xl` SideNavBar pattern repeats across 2.1 / 2.2 / 2.3 / 3.1 / 3.2 / 3.3; the same `bg-glass-light backdrop-blur-md border border-white/20` glass-card pattern repeats across 1.1 / 1.2 / 1.4 / 1.7 / 2.2 / 2.3 / 3.1 / 3.3; the same `font-mono-micro` uppercase tracking-widest pattern repeats across every page for section micro-headers.

These repetitions are the design system: a single shell (`app/console/layout.tsx`) + a single `glass-card` Tailwind class + a single mono-micro type primitive render every reference page.
