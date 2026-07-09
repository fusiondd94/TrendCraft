/**
 * Public surface of the TrendCraft AI Agent.
 *
 * Importers should pull from this file:
 *   import { createPipeline, TrendCraftPipeline } from "@trendcraft/agent";
 *   import type { PipelineResult, ContentPack, Trend, UserProfile } from "@trendcraft/agent";
 */

export * from "./types.ts";

// LLM
export type { LLMClient, LLMMessage, LLMGenerateOptions, LLMStructuredOptions } from "./llm/client.ts";
export { OpenAIClient } from "./llm/openai.ts";
export { MockLLMClient } from "./llm/mock.ts";
export { createLLMClient } from "./llm/factory.ts";

// Image
export type { ImageGeneratorClient, ImageGenRequest, ImageGenResult } from "./image/client.ts";
export { OpenAIImagesClient } from "./image/openai_dalle.ts";
export { MockImageClient } from "./image/mock.ts";
export { createImageClient } from "./image/factory.ts";

// Trend research
export { TrendResearchAgent } from "./trend_research/index.ts";
export { QueryGenerator } from "./trend_research/query_generator.ts";
export { TrendRanker } from "./trend_research/ranker.ts";
export { HackerNewsSource } from "./trend_research/sources/hackernews.ts";
export { RedditSource } from "./trend_research/sources/reddit.ts";
export { GoogleNewsSource } from "./trend_research/sources/google_news.ts";
export { WebSearchSource } from "./trend_research/sources/web_search.ts";
export { RssSource } from "./trend_research/sources/rss.ts";
export type { TrendSource, SourceContext, TrendCandidate } from "./trend_research/sources/source.ts";

// Content generation
export { ContentGenerator } from "./content_generation/index.ts";
export { BlogPostGenerator } from "./content_generation/blog_post.ts";
export { ImageContentGenerator } from "./content_generation/image_content.ts";
export { VideoScriptGenerator } from "./content_generation/video_script.ts";
export { CaptionGenerator } from "./content_generation/caption.ts";
export { scoreContentPack } from "./scoring/content_scorer.ts";

// Pipeline
export { TrendCraftPipeline, createPipeline } from "./pipeline.ts";
export type { PipelineDeps } from "./pipeline.ts";

// Logging
export { setLogger, getLogger } from "./util/log.ts";
export type { Logger, LogLevel } from "./util/log.ts";
