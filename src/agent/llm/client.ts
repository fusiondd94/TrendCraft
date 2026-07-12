/**
 * LLM client interface.
 *
 * Every LLM call in the agent goes through this interface so we
 * can swap real providers (OpenAI, Anthropic, local) and the
 * mock implementation (for tests / local dev) without touching
 * the call sites.
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMStructuredOptions<_T = unknown> {
  /** Name of the schema (used for logging + cache keys). */
  name: string;
  /** JSON schema describing the expected output shape. */
  schema: unknown;
  /** Human-readable instructions for the model. */
  instructions: string;
  /** Optional model override (e.g. "gpt-4o", "gpt-4o-mini"). */
  model?: string;
  /** Sampling temperature. Default 0.7. */
  temperature?: number;
}

export interface LLMGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stop?: string[];
}

export interface LLMClient {
  /** Provider name for logging / observability. */
  readonly provider: string;
  /** Model that will be used by default for text generation. */
  readonly defaultModel: string;
  /** Model used for structured JSON output. */
  readonly defaultJsonModel: string;
  /** Plain chat completion. */
  generateText(
    messages: LLMMessage[],
    options?: LLMGenerateOptions,
  ): Promise<string>;
  /** Chat completion with JSON-mode structured output. */
  generateStructured<T>(
    messages: LLMMessage[],
    options: LLMStructuredOptions<T>,
  ): Promise<T>;
}
