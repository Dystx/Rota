# Task 12 report — truthful trip messaging

Trip messaging remains opt-in behind `ENABLE_TRIP_MESSAGING`. The trip-scoped
API now authenticates the traveler, verifies ownership plus paid/reviewed status,
and reads/writes only the `trip_messages` provider table. Missing schema,
provider failures, and a disabled capability return a structured 503
`MESSAGING_UNAVAILABLE` response; no in-memory or fabricated messages are used.

The client treats 401/403 responses as denied and provider 503 responses as a
provider-error state. Sends are acknowledged only after the API succeeds and
the canonical message list is reloaded.
