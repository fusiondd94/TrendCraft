/**
 * A TrendSource is anything that can produce raw trend candidates
 * for a given niche. Sources should:
 *  - return quickly (capped fanout)
 *  - be safe to call in parallel
 *  - degrade gracefully (return [] on error, never throw)
 *  - not depend on a paid API key by default
 *
 * Each source normalises its raw output to the TrendCandidate
 * shape so the ranker can score them uniformly.
 */

import type { TrendSourceName } from "../../types.ts";

export interface TrendCandidate {
  /** Stable id for dedupe; sources should set source + url-or-title. */
  id: string;
  title: string;
  description: string;
  canonicalUrl?: string;
  sourceName: TrendSourceName;
  sourceUrl?: string;
  publishedAt?: string; // ISO
  rawEngagement?: number;
  rawMetadata?: Record<string, unknown>;
  /** Free-form terms the source already attached; the ranker will add more. */
  keywords: string[];
}

export interface SourceContext {
  /** Pre-generated search queries for the user's niche. */
  queries: string[];
  /** Pre-generated subreddit list, if the source uses it. */
  subreddits: string[];
  /** Pre-generated news topics, if the source uses it. */
  newsTopics: string[];
  /** Time window — candidates older than this should be filtered out. */
  timeWindowHours: number;
  /** Hard cap on candidates the source should return. */
  cap: number;
}

export interface TrendSource {
  readonly name: TrendSourceName;
  fetchCandidates(ctx: SourceContext): Promise<TrendCandidate[]>;
}
