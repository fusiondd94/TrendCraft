/**
 * QueryGenerator: asks the LLM to expand a user profile into
 * concrete search queries, subreddit names, and news topics.
 *
 * Doing this once up front (vs. per source) keeps the number of
 * LLM calls small and ensures every source gets a coherent
 * search vocabulary derived from the same niche context.
 */

import type { LLMClient } from "../llm/client.ts";
import type { UserProfile } from "../types.ts";
import { getLogger } from "../util/log.ts";

export interface QuerySet {
  queries: string[];
  subreddits: string[];
  newsTopics: string[];
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    queries: {
      type: "array",
      items: { type: "string" },
      description:
        "Web/HN/Reddit search queries that would surface trending content in the niche. Include both broad and specific phrasings.",
    },
    subreddits: {
      type: "array",
      items: { type: "string" },
      description: "Subreddit names (without r/ prefix) where this niche lives.",
    },
    newsTopics: {
      type: "array",
      items: { type: "string" },
      description: "Google News search phrases for this niche.",
    },
  },
  required: ["queries", "subreddits", "newsTopics"],
} as const;

export class QueryGenerator {
  constructor(private readonly llm: LLMClient) {}

  async generate(profile: UserProfile): Promise<QuerySet> {
    const prompt = buildPrompt(profile);
    try {
      const result = await this.llm.generateStructured<QuerySet>([
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ], {
        name: "trend_query_set",
        schema: SCHEMA,
        instructions:
          "Return a JSON object with three arrays: queries, subreddits, newsTopics. Each should have 3-6 short, specific strings. Avoid generic terms like 'trends' on their own.",
      });
      // Sanity bounds.
      result.queries = (result.queries ?? []).slice(0, 8);
      result.subreddits = (result.subreddits ?? []).slice(0, 6);
      result.newsTopics = (result.newsTopics ?? []).slice(0, 6);
      // Always include custom topics verbatim.
      for (const t of profile.customTopics ?? []) {
        if (t && !result.queries.includes(t)) result.queries.push(t);
      }
      // De-dup while keeping order.
      result.queries = dedup(result.queries);
      result.subreddits = dedup(result.subreddits.map((s) => s.replace(/^r\//, "")));
      result.newsTopics = dedup(result.newsTopics);
      // Guarantee at least one of each.
      if (result.queries.length === 0) result.queries.push(profile.niche);
      if (result.subreddits.length === 0) result.subreddits.push(guessSubreddit(profile.niche));
      if (result.newsTopics.length === 0) result.newsTopics.push(profile.niche);
      return result;
    } catch (err) {
      getLogger().warn("QueryGenerator LLM call failed, falling back", err);
      return fallback(profile);
    }
  }
}

const SYSTEM =
  "You expand a small business profile into search vocabulary for trend research. Be specific, avoid generic terms.";

function buildPrompt(profile: UserProfile): string {
  return [
    `Niche: ${profile.niche}`,
    `Business: ${profile.businessDescription}`,
    `Target platforms: ${profile.targetPlatforms.join(", ")}`,
    profile.brandVoice ? `Brand voice: ${profile.brandVoice}` : "",
    profile.customTopics?.length
      ? `Custom topics the user always wants covered: ${profile.customTopics.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function dedup(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    const k = s.trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(s.trim());
  }
  return out;
}

function guessSubreddit(niche: string): string {
  return niche.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20);
}

function fallback(profile: UserProfile): QuerySet {
  const niche = profile.niche;
  return {
    queries: dedup([
      niche,
      `${niche} trends`,
      `${niche} news`,
      ...profile.customTopics,
    ]),
    subreddits: [guessSubreddit(niche)],
    newsTopics: [niche, `${niche} industry`],
  };
}
