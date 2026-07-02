# ADR: Deterministic Contracts for Third-Party Providers

- **Status**: Accepted
- **Date**: 2026-05-04

## Context

The platform depends on several external APIs (OpenAI for itinerary generation, Stripe for payments, Resend for emails, Mapbox for routing). Integrating these directly during the early development phase leads to high costs, flakiness in CI, and tight coupling between the UI and specific provider SDKs.

## Decision

We have adopted a "Deterministic Contract" pattern for all external dependencies.

1. **Package Isolation**: Each external dependency is isolated in a dedicated workspace package (e.g., `@repo/ai`, `@repo/payments`).
2. **Schema-First Design**: Shared data contracts (using Zod) are defined in `@repo/types`. These schemas dictate the exact shape of inputs and outputs (e.g., `ItinerarySchema`).
3. **Provider-Free Implementations**: The packages currently return deterministic, schema-validated results based on predefined rules rather than calling live APIs.
   - Example: `@repo/ai` generates a valid itinerary JSON without calling OpenAI.
   - Example: `@repo/payments` returns checkout plan metadata without calling Stripe.

## Consequences

- **Parallel Development**: UI and frontend logic can be iterated and tested locally against "real-shaped" data without waiting for backend integration.
- **Reliable Testing**: CI/CD pipelines run without network dependencies or API keys.
- **Simple Migration**: Switching to a real provider (e.g., from a stub to OpenAI) only requires updating the implementation inside the isolated package; the `apps/web` consumption code remains unchanged.
- **Launch Requirement**: A "Production Integration" phase is required before launch to replace these stubs with live API calls.
