/**
 * OpenAI Images (DALL-E 3) implementation of ImageGeneratorClient.
 *
 * Uses /v1/images/generations. Returns a hosted URL by default;
 * pass `response_format: "b64_json"` for inline bytes — the
 * factory below lets the host pick.
 */

import type {
  ImageGeneratorClient,
  ImageGenRequest,
  ImageGenResult,
} from "./client.ts";
import { FORMAT_DIMENSIONS } from "./client.ts";

export interface OpenAIImagesOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string; // "dall-e-3" or "gpt-image-1"
  /** If true, return base64 instead of a hosted URL. */
  asBase64?: boolean;
}

export class OpenAIImagesClient implements ImageGeneratorClient {
  readonly provider = "openai";
  readonly defaultModel: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly asBase64: boolean;

  constructor(opts: OpenAIImagesOptions = {}) {
    this.apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY ?? "";
    this.baseUrl =
      opts.baseUrl ?? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
    this.defaultModel = opts.model ?? "dall-e-3";
    this.asBase64 = opts.asBase64 ?? false;
    if (!this.apiKey) {
      throw new Error(
        "OpenAIImagesClient: missing apiKey. Pass one in or set OPENAI_API_KEY.",
      );
    }
  }

  async generate(req: ImageGenRequest): Promise<ImageGenResult> {
    const { w, h } = FORMAT_DIMENSIONS[req.format];
    // DALL-E 3 only supports 1024x1024, 1792x1024, 1024x1792.
    // We pick the closest legal size rather than request an arbitrary one.
    const size = pickDallESize(w, h);
    const body = {
      model: this.defaultModel,
      prompt: req.prompt,
      n: 1,
      size,
      response_format: this.asBase64 ? "b64_json" : "url",
      ...(req.style ? { style: req.style } : {}),
    };
    const res = await fetch(`${this.baseUrl}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await safeReadError(res);
      throw new Error(`OpenAI image generation failed: ${res.status} ${err}`);
    }
    const data = (await res.json()) as {
      data: Array<{ url?: string; b64_json?: string; revised_prompt?: string }>;
    };
    const item = data.data[0];
    if (!item) throw new Error("OpenAI returned no image");
    const [outW, outH] = size.split("x").map(Number) as [number, number];
    return {
      imageUrl: item.url ?? `data:image/png;base64,${item.b64_json ?? ""}`,
      imageBase64: item.b64_json,
      mimeType: "image/png",
      width: outW,
      height: outH,
      provider: this.provider,
      model: this.defaultModel,
      providerRef: item.revised_prompt,
    };
  }
}

function pickDallESize(w: number, h: number): "1024x1024" | "1792x1024" | "1024x1792" {
  const ratio = w / h;
  if (ratio > 1.3) return "1792x1024";
  if (ratio < 0.77) return "1024x1792";
  return "1024x1024";
}

async function safeReadError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: { message?: string } };
    return j.error?.message ?? res.statusText;
  } catch {
    return res.statusText;
  }
}
