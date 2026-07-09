/**
 * Factory: pick an image generator based on environment.
 *
 *   AGENT_IMAGE=openai   → DALL-E 3 (requires OPENAI_API_KEY)
 *   AGENT_IMAGE=mock     → SVG mock (default if unset)
 */

import type { ImageGeneratorClient } from "./client.ts";
import { OpenAIImagesClient } from "./openai_dalle.ts";
import { MockImageClient } from "./mock.ts";

export function createImageClient(): ImageGeneratorClient {
  const which = (process.env.AGENT_IMAGE ?? "mock").toLowerCase();
  switch (which) {
    case "openai":
    case "dalle":
    case "dall-e":
      return new OpenAIImagesClient();
    case "mock":
      return new MockImageClient();
    default:
      throw new Error(
        `Unknown AGENT_IMAGE="${which}". Use "openai" or "mock".`,
      );
  }
}
