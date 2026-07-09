/**
 * CaptionGenerator: writes platform-tailored captions for the
 * trend. One caption per target platform by default.
 *
 * The captions are tuned to each platform's conventions:
 *  - x:       280 chars, threadable
 *  - linkedin: professional, no over-hashtagging
 *  - instagram: hook + line breaks + hashtags in a block
 *  - tiktok:   short, hook-first, hashtags in caption
 *  - youtube:  description-style, timestamps if relevant
 */

import type { LLMClient } from "../llm/client.ts";
import type { Caption, Platform, Trend, UserProfile } from "../types.ts";
import { clampCaption, makeId } from "../util/hash.ts";
import { getLogger } from "../util/log.ts";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    captions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          platform: { type: "string", enum: ["instagram", "tiktok", "linkedin", "youtube", "x"] },
          hook: { type: "string" },
          text: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
          emojis: { type: "array", items: { type: "string" } },
          cta: { type: "string" },
        },
        required: ["platform", "hook", "text", "hashtags"],
      },
    },
  },
  required: ["captions"],
} as const;

export class CaptionGenerator {
  constructor(private readonly llm: LLMClient) {}

  async generate(
    trend: Trend,
    profile: UserProfile,
    platforms?: Platform[],
  ): Promise<Caption[]> {
    const targets = (platforms && platforms.length > 0
      ? platforms
      : profile.targetPlatforms) as Platform[];

    let out: { captions: Array<{ platform: Platform; hook: string; text: string; hashtags: string[]; emojis?: string[]; cta?: string }> };
    try {
      out = await this.llm.generateStructured<typeof out>(
        [
          { role: "system", content: SYSTEM },
          { role: "user", content: buildPrompt(trend, profile, targets) },
        ],
        {
          name: "captions",
          schema: SCHEMA,
          instructions:
            "Return one caption per requested platform. Use the platform's conventions; do not paste the same caption into every platform.",
        },
      );
    } catch (err) {
      getLogger().warn("caption: LLM call failed, using fallback", err);
      out = { captions: targets.map((p) => fallback(trend, p)) };
    }

    // Filter to only the platforms the user asked for (LLM sometimes
    // returns more). Clamp to platform limits.
    const filtered = (out.captions ?? []).filter((c) => targets.includes(c.platform));
    return filtered.map((c) => {
      const text = clampCaption(c.text, c.platform);
      return {
        id: makeId("cap", trend.id, c.platform),
        platform: c.platform,
        text,
        hook: c.hook ?? text.split(/\n/)[0]?.slice(0, 120) ?? "",
        hashtags: c.hashtags ?? [],
        emojis: c.emojis ?? [],
        cta: c.cta,
        characterCount: text.length,
      };
    });
  }
}

const SYSTEM = `You write social-media captions. One per platform. Match each platform's tone, length, and hashtag conventions. Do not use generic "in today's world" openers.`;

function buildPrompt(trend: Trend, profile: UserProfile, platforms: Platform[]): string {
  return [
    `Niche: ${profile.niche}`,
    `Business: ${profile.businessDescription}`,
    profile.brandVoice ? `Brand voice: ${profile.brandVoice}` : "",
    `Target platforms: ${platforms.join(", ")}`,
    "",
    `Trend: ${trend.title}`,
    trend.description ? `Context: ${trend.description}` : "",
    "",
    "For EACH requested platform, return one caption object with platform, hook (first line), text (full caption including hashtags), hashtags, emojis, cta.",
  ]
    .filter(Boolean)
    .join("\n");
}

function fallback(
  trend: Trend,
  platform: Platform,
): { platform: Platform; hook: string; text: string; hashtags: string[]; emojis: string[]; cta: string } {
  const tag = trend.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  const base = `${trend.title} — here's why it matters and what to do this week.`;
  const hashtags = [`#${tag}`];
  switch (platform) {
    case "x":
      return {
        platform,
        hook: `${trend.title} thread 🧵`,
        text: `${trend.title} thread 🧵\n\n1/ The shift\n2/ Why now\n3/ What to do\n\n${hashtags.join(" ")}`,
        hashtags,
        emojis: ["🧵"],
        cta: "RT the first post",
      };
    case "linkedin":
      return {
        platform,
        hook: `A short take on ${trend.title} for builders and operators.`,
        text: `${base}\n\nWhat's your read?`,
        hashtags: [],
        emojis: [],
        cta: "Share your view in the comments",
      };
    case "instagram":
      return {
        platform,
        hook: `${trend.title} — what to know.`,
        text: `${base}\n\nSave this for later 👇\n\n${hashtags.join(" ")}`,
        hashtags,
        emojis: ["👇", "🔥"],
        cta: "Save this for later",
      };
    case "tiktok":
      return {
        platform,
        hook: `POV: ${trend.title} just dropped`,
        text: `${trend.title} — quick take 👀\n\n${hashtags.join(" ")} #fyp`,
        hashtags: [...hashtags, "#fyp"],
        emojis: ["👀"],
        cta: "Follow for part 2",
      };
    case "youtube":
      return {
        platform,
        hook: `${trend.title} — short breakdown`,
        text: `${base}\n\n0:00 Intro\n0:10 The shift\n0:25 What to do\n\n${hashtags.join(" ")}`,
        hashtags,
        emojis: [],
        cta: "Subscribe",
      };
  }
}
