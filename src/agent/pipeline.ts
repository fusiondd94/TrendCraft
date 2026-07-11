/**
 * Pipeline: end-to-end orchestrator.
 *
 *   const pipeline = createPipeline();
 *   const result = await pipeline.run(request);
 *
 *   result = {
 *     userId, request, trends, contentPacks, generatedAt, durationMs, warnings
 *   }
 *
 * The backend stores `result.contentPacks` and surfaces them in
 * the approval queue.
 */

import type { LLMClient } from "./llm/client.ts";
import type { ImageGeneratorClient } from "./image/client.ts";
import { TrendResearchAgent } from "./trend_research/index.ts";
import { ContentGenerator } from "./content_generation/index.ts";
import { createLLMClient } from "./llm/factory.ts";
import { createImageClient } from "./image/factory.ts";
import type { PipelineResult, TrendRequest, TrendSourceName } from "./types.ts";
import { getLogger } from "./util/log.ts";

export interface PipelineDeps {
  llm?: LLMClient;
  image?: ImageGeneratorClient;
  sources?: Partial<Record<TrendSourceName, import("./trend_research/sources/source.ts").TrendSource>>;
  /** Max number of trends to turn into full content packs. Defaults to request.maxTrends. */
  contentPackLimit?: number;
}

export class TrendCraftPipeline {
  private readonly llm: LLMClient;
  private readonly image: ImageGeneratorClient;
  private readonly research: TrendResearchAgent;
  private readonly content: ContentGenerator;
  private readonly contentPackLimit?: number;

  constructor(deps: PipelineDeps = {}) {
    this.llm = deps.llm ?? createLLMClient();
    this.image = deps.image ?? createImageClient();
    this.research = new TrendResearchAgent({ llm: this.llm, sources: deps.sources });
    this.content = new ContentGenerator({ llm: this.llm, image: this.image });
    this.contentPackLimit = deps.contentPackLimit;
  }

  async run(request: TrendRequest): Promise<PipelineResult> {
    const start = Date.now();
    const log = getLogger();
    log.info("pipeline:start", {
      user: request.userProfile.id,
      niche: request.userProfile.niche,
    });
    const warnings: string[] = [];

    // 1) Trend research.
    const trends = await this.research.research(request);
    if (trends.length === 0) {
      warnings.push("no trends found in any source for this niche");
    }

    // 2) Content generation for the top trends.
    const limit = Math.min(
      this.contentPackLimit ?? request.maxTrends,
      trends.length,
    );
    const top = trends.slice(0, limit);
    const packs = await Promise.all(
      top.map((t) =>
        this.content
          .generateContentPack(t, request.userProfile, {
            generate: request.generate,
          })
          .catch((err) => {
            warnings.push(`content_pack for trend ${t.id} failed: ${(err as Error).message}`);
            log.warn("pipeline: content_pack failed", err);
            return null;
          }),
      ),
    );
    const contentPacks = packs.filter((p): p is NonNullable<typeof p> => p !== null);

    const result: PipelineResult = {
      userId: request.userProfile.id,
      request,
      trends,
      contentPacks,
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      warnings,
    };
    log.info("pipeline:done", {
      trends: trends.length,
      packs: contentPacks.length,
      ms: result.durationMs,
      warnings: warnings.length,
    });
    return result;
  }
}

export function createPipeline(deps?: PipelineDeps): TrendCraftPipeline {
  return new TrendCraftPipeline(deps);
}
