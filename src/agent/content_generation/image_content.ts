/**
 * ImageContentGenerator: produces a hero image for the trend.
 *
 * Two steps:
 *   1. Ask the LLM to suggest 3 image prompts in different styles.
 *   2. Pick the one that best matches the user's brand voice and
 *      have the image client render it.
 *
 * The image client may return a hosted URL (DALL-E) or a data URI
 * (mock). The host app decides whether to upload the bytes and
 * replace the URL.
 */

import type { ImageGeneratorClient } from "../image/client.ts";
import type { LLMClient } from "../llm/client.ts";
import type {
  ImageContent,
  ImageFormat,
  Trend,
  UserProfile,
} from "../types.ts";
import { makeId } from "../util/hash.ts";
import { getLogger } from "../util/log.ts";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    prompts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          prompt: { type: "string" },
          format: { type: "string", enum: ["square", "landscape", "portrait"] },
          style: { type: "string" },
          altText: { type: "string" },
        },
        required: ["prompt", "format", "style", "altText"],
      },
    },
  },
  required: ["prompts"],
} as const;

export class ImageContentGenerator {
  constructor(
    private readonly llm: LLMClient,
    private readonly image: ImageGeneratorClient,
  ) {}

  async generate(
    trend: Trend,
    profile: UserProfile,
    format: ImageFormat = "landscape",
  ): Promise<ImageContent> {
    const log = getLogger();
    let prompt: string;
    let style: string;
    let altText: string;
    try {
      const out = await this.llm.generateStructured<{
        prompts: Array<{
          prompt: string;
          format: ImageFormat;
          style: string;
          altText: string;
        }>;
      }>(
        [
          { role: "system", content: SYSTEM },
          { role: "user", content: buildPrompt(trend, profile, format) },
        ],
        {
          name: "image_prompts",
          schema: SCHEMA,
          instructions: "Return 3 distinct image prompt candidates.",
        },
      );
      // Pick the one matching the requested format, else the first.
      const pick =
        out.prompts.find((p) => p.format === format) ?? out.prompts[0];
      prompt = pick.prompt;
      style = pick.style;
      altText = pick.altText;
    } catch (err) {
      log.warn("image_content: LLM prompt gen failed, using fallback", err);
      prompt = fallbackPrompt(trend, profile, format);
      style = profile.preferredImageStyle ?? "editorial photo";
      altText = `Hero image for: ${trend.title}`;
    }

    const result = await this.image.generate({
      prompt,
      format,
      style,
    });

    return {
      id: makeId("img", trend.id, format),
      prompt,
      imageUrl: result.imageUrl,
      imageBase64: result.imageBase64,
      format: result.width > result.height ? "landscape" : result.width < result.height ? "portrait" : "square",
      width: result.width,
      height: result.height,
      style,
      altText,
    };
  }
}

const SYSTEM =
  "You generate image prompts for AI image models. Be specific about subject, lighting, composition, and mood. Avoid brand names, real people, and copyrighted characters.";

function buildPrompt(
  trend: Trend,
  profile: UserProfile,
  format: ImageFormat,
): string {
  return [
    `Niche: ${profile.niche}`,
    `Business: ${profile.businessDescription}`,
    profile.brandVoice ? `Brand voice: ${profile.brandVoice}` : "",
    profile.preferredImageStyle ? `Preferred style: ${profile.preferredImageStyle}` : "",
    `Target format: ${format}`,
    "",
    `Trend: ${trend.title}`,
    trend.description ? `Context: ${trend.description}` : "",
    "",
    "Generate 3 distinct image prompts (different visual approaches) suitable for a hero image on this trend.",
  ]
    .filter(Boolean)
    .join("\n");
}

function fallbackPrompt(
  trend: Trend,
  _profile: UserProfile,
  format: ImageFormat,
): string {
  const aspect =
    format === "square"
      ? "1:1 aspect ratio"
      : format === "portrait"
        ? "vertical 2:3"
        : "wide 3:2";
  return `Editorial photo evoking the idea of "${trend.title}", soft natural light, clean composition, modern, ${aspect}`;
}
