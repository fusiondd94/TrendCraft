/**
 * ContentScorer: rates a generated ContentPack on quality,
 * virality, and brand fit.
 *
 * The scorer is an LLM call (cheap, single turn) that returns
 * four 0-1 scores plus a one-sentence reasoning string. The
 * downstream UI uses the overallScore to sort packs in the
 * approval queue.
 *
 * If the LLM is unavailable, the scorer falls back to a small
 * heuristic so the pipeline never breaks.
 */

import type { LLMClient } from "../llm/client.ts";
import type { ContentScore, UserProfile } from "../types.ts";
import type { PartialContentPack } from "../content_generation/index.ts";
import { getLogger } from "../util/log.ts";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    overallScore: { type: "number", minimum: 0, maximum: 1 },
    qualityScore: { type: "number", minimum: 0, maximum: 1 },
    viralityScore: { type: "number", minimum: 0, maximum: 1 },
    brandFitScore: { type: "number", minimum: 0, maximum: 1 },
    reasoning: { type: "string" },
  },
  required: ["overallScore", "qualityScore", "viralityScore", "brandFitScore", "reasoning"],
} as const;

export async function scoreContentPack(
  llm: LLMClient,
  pack: PartialContentPack,
  profile: UserProfile,
): Promise<ContentScore> {
  try {
    return await llm.generateStructured<ContentScore>(
      [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildPrompt(pack, profile) },
      ],
      {
        name: "content_scoring",
        schema: SCHEMA,
        instructions: "Return JSON matching the schema only.",
      },
    );
  } catch (err) {
    getLogger().warn("content_scorer: LLM call failed, using heuristic", err);
    return heuristicScore(pack, profile);
  }
}

const SYSTEM =
  "You rate AI-generated social content for small businesses. Be calibrated: most content is 0.4-0.6; only the best should be 0.8+.";

function buildPrompt(pack: PartialContentPack, profile: UserProfile): string {
  const blog = pack.blogPost
    ? `BLOG (${pack.blogPost.wordCount}w): ${pack.blogPost.body.slice(0, 600)}...`
    : "BLOG: (not generated)";
  const video = pack.videoScript
    ? `VIDEO (${pack.videoScript.format}, ${pack.videoScript.durationSeconds}s): hook="${pack.videoScript.hook}" scenes=${pack.videoScript.scenes.length}`
    : "VIDEO: (not generated)";
  const img = pack.image
    ? `IMAGE (${pack.image.format}, ${pack.image.style}): alt="${pack.image.altText}" prompt="${pack.image.prompt.slice(0, 200)}"`
    : "IMAGE: (not generated)";
  const caps = pack.captions.length
    ? `CAPTIONS: ${pack.captions
        .map((c) => `${c.platform}: "${c.hook}"`)
        .join(" | ")}`
    : "CAPTIONS: (none generated)";
  return [
    `Niche: ${profile.niche}`,
    `Business: ${profile.businessDescription}`,
    profile.brandVoice ? `Brand voice: ${profile.brandVoice}` : "",
    "",
    `TREND: ${pack.trend.title}`,
    pack.trend.description ? `Context: ${pack.trend.description}` : "",
    pack.trend.compositeScore !== undefined
      ? `Trend composite score (heuristic): ${pack.trend.compositeScore}`
      : "",
    "",
    blog,
    "",
    video,
    "",
    img,
    "",
    caps,
    "",
    "Rate the overall content pack on overall, quality, virality, and brand-fit (0-1 each). Be specific in reasoning.",
  ]
    .filter(Boolean)
    .join("\n");
}

function heuristicScore(pack: PartialContentPack, profile: UserProfile): ContentScore {
  const trendComp = pack.trend.compositeScore ?? 0.5;
  const blogWords = pack.blogPost?.wordCount ?? 0;
  const blogOk = blogWords >= 300 && blogWords <= 1200;
  const videoOk = (pack.videoScript?.scenes.length ?? 0) >= 3;
  const imgOk = !!pack.image;
  const capsOk = pack.captions.length > 0;
  const quality = mean([blogOk ? 1 : 0.3, videoOk ? 1 : 0.3, imgOk ? 1 : 0.3, capsOk ? 1 : 0.3]);
  const virality = clamp01(trendComp);
  const brandFit = profile.brandVoice ? 0.6 : 0.7;
  const overall = 0.4 * quality + 0.35 * virality + 0.25 * brandFit;
  return {
    overallScore: round2(overall),
    qualityScore: round2(quality),
    viralityScore: round2(virality),
    brandFitScore: round2(brandFit),
    reasoning: "Heuristic scoring (LLM unavailable).",
  };
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
