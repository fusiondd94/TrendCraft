/**
 * TrendResearchAgent: top-level entry point for trend research.
 *
 *   const agent = new TrendResearchAgent({ llm });
 *   const trends = await agent.research(request);
 *
 * Orchestrates:
 *   1. QueryGenerator   — expand the user profile into search vocabulary
 *   2. TrendSources     — fetch candidates in parallel
 *   3. TrendRanker      — score + rank, return top N
 */

import type { LLMClient } from "../llm/client.ts";
import type { Trend, TrendRequest, TrendSourceName } from "../types.ts";
import { QueryGenerator } from "./query_generator.ts";
import { TrendRanker } from "./ranker.ts";
import type { SourceContext, TrendSource } from "./sources/source.ts";
import { HackerNewsSource } from "./sources/hackernews.ts";
import { RedditSource } from "./sources/reddit.ts";
import { GoogleNewsSource } from "./sources/google_news.ts";
import { WebSearchSource } from "./sources/web_search.ts";
import { RssSource } from "./sources/rss.ts";
import { getLogger } from "../util/log.ts";

export interface TrendResearchDeps {
  llm: LLMClient;
  sources?: Partial<Record<TrendSourceName, TrendSource>>;
  /** Override the default source cap per source. */
  perSourceCap?: number;
}

const DEFAULT_SOURCES: Record<TrendSourceName, TrendSource> = {
  hackernews: new HackerNewsSource(),
  reddit: new RedditSource(),
  google_news: new GoogleNewsSource(),
  web_search: new WebSearchSource(),
  rss: new RssSource(),
  google_trends: new HackerNewsSource(), // placeholder; real impl is browser-only
};

export class TrendResearchAgent {
  private readonly llm: LLMClient;
  private readonly sources: Record<TrendSourceName, TrendSource>;
  private readonly queryGen: QueryGenerator;
  private readonly ranker: TrendRanker;
  private readonly perSourceCap: number;

  constructor(deps: TrendResearchDeps) {
    this.llm = deps.llm;
    this.sources = { ...DEFAULT_SOURCES, ...(deps.sources ?? {}) };
    this.queryGen = new QueryGenerator(this.llm);
    this.ranker = new TrendRanker(this.llm);
    this.perSourceCap = deps.perSourceCap ?? 30;
  }

  async research(req: TrendRequest): Promise<Trend[]> {
    const log = getLogger();
    log.info("trend_research:start", {
      niche: req.userProfile.niche,
      sources: req.sources,
      max: req.maxTrends,
    });

    // 1) Generate search vocabulary.
    const qs = await this.queryGen.generate(req.userProfile);
    log.debug("trend_research:queries", qs);

    // 2) Fan out to sources in parallel.
    const ctx: SourceContext = {
      queries: qs.queries,
      subreddits: qs.subreddits,
      newsTopics: qs.newsTopics,
      timeWindowHours: req.timeWindowHours,
      cap: this.perSourceCap,
    };
    const wanted = req.sources.length > 0 ? req.sources : (Object.keys(this.sources) as TrendSourceName[]);
    const sourceResults = await Promise.allSettled(
      wanted.map(async (name) => {
        const source = this.sources[name];
        if (!source) return [];
        const cands = await source.fetchCandidates(ctx);
        log.debug("trend_research:source", { name, count: cands.length });
        return cands;
      }),
    );
    const candidates = sourceResults.flatMap((r) =>
      r.status === "fulfilled" ? r.value : [],
    );

    // 3) Rank.
    const trends = await this.ranker.rank(req.userProfile, candidates, {
      maxTrends: req.maxTrends,
      timeWindowHours: req.timeWindowHours,
    });

    log.info("trend_research:done", { candidates: candidates.length, trends: trends.length });
    return trends;
  }
}
