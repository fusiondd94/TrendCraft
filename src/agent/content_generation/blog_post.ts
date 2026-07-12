/**
 * BlogPostGenerator: turns a Trend + UserProfile into a publishable
 * blog post (markdown).
 *
 * The blog post is a longer-form companion to the social posts.
 * Targets 400-900 words — long enough to rank, short enough to
 * actually be read.
 */

import type { LLMClient } from "../llm/client.ts";
import type { BlogPost, Trend, UserProfile } from "../types.ts";
import { makeId, readingTimeMinutes, wordCount } from "../util/hash.ts";
import { getLogger } from "../util/log.ts";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    body: { type: "string" },
    excerpt: { type: "string" },
    seoKeywords: { type: "array", items: { type: "string" } },
  },
  required: ["title", "body", "excerpt", "seoKeywords"],
} as const;

export class BlogPostGenerator {
  constructor(private readonly llm: LLMClient) {}

  async generate(trend: Trend, profile: UserProfile): Promise<BlogPost> {
    const out = await this.llm.generateStructured<{
      title: string;
      body: string;
      excerpt: string;
      seoKeywords: string[];
    }>(
      [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildPrompt(trend, profile) },
      ],
      {
        name: "blog_post",
        schema: SCHEMA,
        instructions:
          "Write a 400-900 word markdown blog post. Use a hook in the first 100 words. Return JSON matching the schema.",
      },
    );
    const body = out.body?.trim() ?? "";
    const words = wordCount(body);
    return {
      id: makeId("blog", trend.id),
      title: out.title?.trim() || trend.title,
      body,
      excerpt: (out.excerpt ?? "").slice(0, 300),
      wordCount: words,
      seoKeywords: out.seoKeywords ?? trend.keywords ?? [],
      readingTimeMinutes: readingTimeMinutes(words),
    };
  }
}

const SYSTEM = `You are a sharp, no-fluff content writer for small businesses.
Voice: clear, specific, scannable. Avoid corporate jargon, generic
"in today's fast-paced world" openers, and AI tells. Use short
paragraphs, subheadings, and at least one concrete example.`;

function buildPrompt(trend: Trend, profile: UserProfile): string {
  return [
    `Niche: ${profile.niche}`,
    `Business: ${profile.businessDescription}`,
    profile.brandVoice ? `Brand voice: ${profile.brandVoice}` : "",
    "",
    `Trend: ${trend.title}`,
    trend.description ? `Context: ${trend.description}` : "",
    trend.canonicalUrl ? `Source: ${trend.canonicalUrl}` : "",
    trend.keywords?.length ? `Keywords: ${trend.keywords.join(", ")}` : "",
    "",
    "Write a blog post that:",
    "1. Hooks in the first 100 words with a concrete claim or story.",
    "2. Explains what's actually changing and why it matters to this audience.",
    "3. Gives 2-3 concrete things the reader can do this week.",
    "4. Closes with a single clear next step.",
  ]
    .filter(Boolean)
    .join("\n");
}

// Used to silence unused-import warning if log is unused.
getLogger().debug("blog_post:module loaded");
