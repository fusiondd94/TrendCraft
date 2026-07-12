/**
 * OpenAI implementation of the LLM client.
 *
 * Uses fetch directly (no SDK) so this module stays lightweight
 * and works in any runtime that supports globalThis.fetch —
 * Node 18+, Bun, Vercel Edge, Cloudflare Workers, etc.
 *
 * Structured outputs go through the OpenAI "json_schema" response
 * format, which guarantees a schema-valid response.
 */

import type {
  LLMClient,
  LLMGenerateOptions,
  LLMMessage,
  LLMStructuredOptions,
} from "./client.ts";

export interface OpenAIClientOptions {
  apiKey?: string;
  organization?: string;
  baseUrl?: string; // for Azure / proxies
  defaultModel?: string;
  defaultJsonModel?: string;
}

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

export class OpenAIClient implements LLMClient {
  readonly provider = "openai";
  readonly defaultModel: string;
  readonly defaultJsonModel: string;
  private readonly apiKey: string;
  private readonly organization?: string;
  private readonly baseUrl: string;

  constructor(opts: OpenAIClientOptions = {}) {
    this.apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY ?? "";
    this.organization = opts.organization ?? process.env.OPENAI_ORG_ID;
    this.baseUrl = opts.baseUrl ?? process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL;
    this.defaultModel = opts.defaultModel ?? "gpt-4o-mini";
    this.defaultJsonModel = opts.defaultJsonModel ?? "gpt-4o-mini";
    if (!this.apiKey) {
      throw new Error(
        "OpenAIClient: missing apiKey. Pass one in or set OPENAI_API_KEY.",
      );
    }
  }

  private headers(): HeadersInit {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
    if (this.organization) h["OpenAI-Organization"] = this.organization;
    return h;
  }

  async generateText(
    messages: LLMMessage[],
    options: LLMGenerateOptions = {},
  ): Promise<string> {
    const body = {
      model: options.model ?? this.defaultModel,
      messages,
      temperature: options.temperature ?? 0.7,
      ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
      ...(options.stop ? { stop: options.stop } : {}),
    };
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await safeReadError(res);
      throw new Error(`OpenAI generateText failed: ${res.status} ${err}`);
    }
    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message?.content ?? "";
  }

  async generateStructured<T>(
    messages: LLMMessage[],
    options: LLMStructuredOptions<T>,
  ): Promise<T> {
    const body = {
      model: options.model ?? this.defaultJsonModel,
      messages,
      temperature: options.temperature ?? 0.4,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: options.name,
          schema: options.schema,
          strict: true,
        },
      },
    };
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await safeReadError(res);
      throw new Error(`OpenAI generateStructured failed: ${res.status} ${err}`);
    }
    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned empty structured response");
    try {
      return JSON.parse(content) as T;
    } catch (e) {
      throw new Error(
        `OpenAI structured response was not valid JSON: ${(e as Error).message}`,
      );
    }
  }
}

async function safeReadError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: { message?: string } };
    return j.error?.message ?? res.statusText;
  } catch {
    return res.statusText;
  }
}
