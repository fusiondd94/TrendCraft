/**
 * Factory: pick an LLM client based on environment.
 *
 *   AGENT_LLM=openai   → real OpenAI client (requires OPENAI_API_KEY)
 *   AGENT_LLM=mock     → deterministic mock (default if unset)
 *   AGENT_LLM=openai → also accepts model overrides via env
 */

import type { LLMClient } from "./client.ts";
import { OpenAIClient } from "./openai.ts";
import { MockLLMClient } from "./mock.ts";

export function createLLMClient(): LLMClient {
  const which = (process.env.AGENT_LLM ?? "mock").toLowerCase();
  switch (which) {
    case "openai":
      return new OpenAIClient();
    case "mock":
      return new MockLLMClient();
    default:
      throw new Error(
        `Unknown AGENT_LLM="${which}". Use "openai" or "mock".`,
      );
  }
}
