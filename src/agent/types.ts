/**
 * TrendCraft AI Agent — Shared Types & Zod Schemas
 *
 * This file is the single source of truth for the data the agent
 * produces and consumes. The backend can import these schemas
 * directly to validate rows before storage, and the frontend can
 * import the inferred types for type-safe rendering.
 *
 * Keep this file framework-free: it must be importable from any
 * server/edge runtime (Node, Bun, Vercel functions, etc.) and
 * from the client bundle.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Platforms
// ---------------------------------------------------------------------------

export const PlatformSchema = z.enum([
  "instagram",
  "tiktok",
  "linkedin",
  "youtube",
  "x",
]);
export type Platform = z.infer<typeof PlatformSchema>;

export const ALL_PLATFORMS: Platform[] = [
  "instagram",
  "tiktok",
  "linkedin",
  "youtube",
  "x",
];

// ---------------------------------------------------------------------------
// User profile & request inputs
// ---------------------------------------------------------------------------

export const UserProfileSchema = z.object({
  id: z.string().min(1),
  niche: z.string().min(2).describe("Short niche label, e.g. 'SaaS marketing'"),
  businessDescription: z
    .string()
    .min(10)
    .describe("1-3 sentence description of the business / audience"),
  customTopics: z
    .array(z.string())
    .default([])
    .describe("Always-include topics, e.g. the user's own product"),
  targetPlatforms: z
    .array(PlatformSchema)
    .min(1)
    .describe("Where the content will be posted"),
  brandVoice: z
    .string()
    .optional()
    .describe("e.g. 'professional but playful', 'no jargon', 'first person'"),
  preferredImageStyle: z
    .string()
    .optional()
    .describe("e.g. 'minimalist line art', 'vibrant editorial photo'"),
  locale: z.string().default("en-US"),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const TrendSourceNameSchema = z.enum([
  "hackernews",
  "reddit",
  "google_news",
  "rss",
  "google_trends",
  "web_search",
]);
export type TrendSourceName = z.infer<typeof TrendSourceNameSchema>;

export const TrendRequestSchema = z.object({
  userProfile: UserProfileSchema,
  maxTrends: z.number().int().min(1).max(50).default(10),
  trendsPerSource: z.number().int().min(1).max(50).default(15),
  sources: z
    .array(TrendSourceNameSchema)
    .default(["hackernews", "reddit", "google_news", "web_search"]),
  timeWindowHours: z.number().int().min(1).max(24 * 14).default(72),
  contentPerTrend: z
    .number()
    .int()
    .min(1)
    .max(4)
    .default(1)
    .describe("How many distinct content packs to produce per trend"),
  generate: z
    .object({
      blogPost: z.boolean().default(true),
      image: z.boolean().default(true),
      videoScript: z.boolean().default(true),
      captions: z.boolean().default(true),
    })
    .default({
      blogPost: true,
      image: true,
      videoScript: true,
      captions: true,
    }),
});
export type TrendRequest = z.infer<typeof TrendRequestSchema>;

// ---------------------------------------------------------------------------
// Trend (output of trend research)
// ---------------------------------------------------------------------------

export const TrendSourceSchema = z.object({
  name: TrendSourceNameSchema,
  url: z.string().url().optional(),
  rawEngagement: z.number().optional(),
  rawMetadata: z.record(z.string(), z.unknown()).optional(),
});
export type TrendSource = z.infer<typeof TrendSourceSchema>;

export const TrendSchema = z.object({
  id: z.string().describe("Stable hash of (source + canonical url/title)"),
  title: z.string(),
  description: z.string(),
  canonicalUrl: z.string().url().optional(),
  source: TrendSourceSchema,
  discoveredAt: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
  keywords: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  rawEngagement: z.number().optional(),
  relevanceScore: z.number().min(0).max(1),
  viralityScore: z.number().min(0).max(1),
  freshnessScore: z.number().min(0).max(1),
  compositeScore: z.number().min(0).max(1),
  reasoning: z.string().optional(),
});
export type Trend = z.infer<typeof TrendSchema>;

// ---------------------------------------------------------------------------
// Content outputs
// ---------------------------------------------------------------------------

export const BlogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string().describe("Markdown body, 400-900 words"),
  excerpt: z.string().max(300),
  wordCount: z.number().int().positive(),
  seoKeywords: z.array(z.string()).default([]),
  readingTimeMinutes: z.number().positive(),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;

export const ImageFormatSchema = z.enum(["square", "landscape", "portrait"]);
export type ImageFormat = z.infer<typeof ImageFormatSchema>;

export const ImageContentSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  negativePrompt: z.string().optional(),
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
  format: ImageFormatSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  style: z.string(),
  altText: z.string(),
});
export type ImageContent = z.infer<typeof ImageContentSchema>;

export const VideoFormatSchema = z.enum([
  "short",
  "reel",
  "tiktok",
  "youtube_short",
]);
export type VideoFormat = z.infer<typeof VideoFormatSchema>;

export const VideoSceneSchema = z.object({
  index: z.number().int().nonnegative(),
  visualDescription: z.string(),
  onScreenText: z.string().optional(),
  voiceover: z.string().optional(),
  durationSeconds: z.number().positive(),
});
export type VideoScene = z.infer<typeof VideoSceneSchema>;

export const VideoScriptSchema = z.object({
  id: z.string(),
  format: VideoFormatSchema,
  durationSeconds: z.number().positive(),
  hook: z.string().describe("First 3 seconds, must stop the scroll"),
  scenes: z.array(VideoSceneSchema).min(1),
  voiceoverScript: z.string(),
  onScreenText: z.array(z.string()),
  hashtags: z.array(z.string()),
  cta: z.string(),
  musicMood: z.string().optional(),
});
export type VideoScript = z.infer<typeof VideoScriptSchema>;

export const CaptionSchema = z.object({
  id: z.string(),
  platform: PlatformSchema,
  text: z.string().describe("Full caption text, including hashtags"),
  hook: z.string().describe("First line / scroll-stopper"),
  hashtags: z.array(z.string()),
  emojis: z.array(z.string()),
  cta: z.string().optional(),
  characterCount: z.number().int().nonnegative(),
});
export type Caption = z.infer<typeof CaptionSchema>;

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export const ContentScoreSchema = z.object({
  overallScore: z.number().min(0).max(1),
  qualityScore: z.number().min(0).max(1),
  viralityScore: z.number().min(0).max(1),
  brandFitScore: z.number().min(0).max(1),
  reasoning: z.string(),
});
export type ContentScore = z.infer<typeof ContentScoreSchema>;

// ---------------------------------------------------------------------------
// Top-level output: ContentPack
// ---------------------------------------------------------------------------

export const ContentPackSchema = z.object({
  id: z.string(),
  trend: TrendSchema,
  blogPost: BlogPostSchema.optional(),
  image: ImageContentSchema.optional(),
  videoScript: VideoScriptSchema.optional(),
  captions: z.array(CaptionSchema).default([]),
  score: ContentScoreSchema,
  createdAt: z.string().datetime(),
  modelVersions: z
    .object({
      llm: z.string().optional(),
      image: z.string().optional(),
    })
    .optional(),
});
export type ContentPack = z.infer<typeof ContentPackSchema>;

// ---------------------------------------------------------------------------
// Pipeline response (the contract the backend will store)
// ---------------------------------------------------------------------------

export const PipelineResultSchema = z.object({
  userId: z.string(),
  request: TrendRequestSchema,
  trends: z.array(TrendSchema),
  contentPacks: z.array(ContentPackSchema),
  generatedAt: z.string().datetime(),
  durationMs: z.number().int().nonnegative(),
  warnings: z.array(z.string()).default([]),
});
export type PipelineResult = z.infer<typeof PipelineResultSchema>;
