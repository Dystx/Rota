/**
 * Production OpenAI embedding client (PR-5).
 *
 * Wires the Vercel AI SDK's `embedMany` into our
 * `EmbeddingClient` interface. Lazy-imports the AI SDK so
 * tests that never create a real client don't trigger
 * the SDK's import-time side effects (PR-1's "tsc
 * hangs on the v5 type surface" workaround).
 *
 * The model defaults to `text-embedding-3-small` (1536-dim).
 * A future bump to `text-embedding-3-large` is a constant
 * change in this file plus a re-embed run.
 *
 * If `OPENAI_API_KEY` is unset, `createOpenAIEmbeddingClient`
 * throws on `embed()` (fail fast in production). Tests use
 * the stub from `pipeline.test.ts` and never touch this
 * file.
 */

import type { EmbeddingClient, EmbeddingRequest, EmbeddingResponse } from "./types";

export type OpenAIEmbeddingClientOptions = {
  apiKey?: string;
  model?: string;
};

export function createOpenAIEmbeddingClient(
  options: OpenAIEmbeddingClientOptions = {}
): EmbeddingClient {
  // Resolve the key at factory time (not at embed time) so
  // a misconfiguration fails the worker startup, not the
  // first request.
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "createOpenAIEmbeddingClient: OPENAI_API_KEY is required (or pass apiKey explicitly)"
    );
  }
  const defaultModel = options.model ?? "text-embedding-3-small";

  return {
    async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
      // Lazy import: the Vercel AI SDK has a large type
      // surface that hangs `tsc` when statically imported.
      // Loading both the provider and embedMany lazily keeps
      // the module import cost near-zero for consumers that
      // never call this factory.
      const { embedMany } = await import("ai");
      const { createOpenAI } = await import("@ai-sdk/openai");
      const openai = createOpenAI({ apiKey });

      const result = await embedMany({
        model: openai.textEmbeddingModel(request.model ?? defaultModel),
        values: [...request.inputs]
      });

      return {
        embeddings: result.embeddings,
        model: request.model ?? defaultModel,
        totalTokens: result.usage?.tokens ?? 0
      };
    }
  };
}
