/**
 * Image generation client interface.
 *
 * The agent never calls an image API directly — it always goes
 * through this interface. Real providers (DALL-E 3, Stability)
 * produce hosted URLs that can be returned to the backend for
 * storage. The mock provider produces inline SVG data URIs so
 * the demo pipeline can be exercised offline.
 */

import type { ImageFormat } from "../types.ts";

export interface ImageGenRequest {
  prompt: string;
  negativePrompt?: string;
  format: ImageFormat;
  style?: string;
  seed?: number;
}

export interface ImageGenResult {
  /** A URL the user can open in a browser. May be a data: URI. */
  imageUrl: string;
  /** Inline bytes; useful when the host app stores the image itself. */
  imageBase64?: string;
  mimeType: string;
  width: number;
  height: number;
  /** Provider-side id, for cost tracking / re-runs. */
  providerRef?: string;
  /** Provider that produced this image. */
  provider: string;
  /** Model that produced this image. */
  model: string;
}

export interface ImageGeneratorClient {
  readonly provider: string;
  readonly defaultModel: string;
  generate(req: ImageGenRequest): Promise<ImageGenResult>;
}

export const FORMAT_DIMENSIONS: Record<ImageFormat, { w: number; h: number }> = {
  square: { w: 1024, h: 1024 },
  landscape: { w: 1536, h: 1024 },
  portrait: { w: 1024, h: 1536 },
};
