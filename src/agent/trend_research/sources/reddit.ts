/**
 * Reddit source via the public JSON endpoints.
 *
 * Uses .json (no auth) for subreddit listings and search. We pick
 * a small set of popular general subreddits plus the niche-specific
 * ones suggested by the LLM-driven query generator.
 *
 * Notes:
 *  - Reddit throttles unauthenticated traffic. The agent only
 *    calls a handful of endpoints and respects a per-source cap.
 *  - We only read public post listings.
 */

import { makeId } from "../../util/hash.ts";
import type {
  SourceContext,
  TrendCandidate,
  TrendSource,
} from "./source.ts";
import type { TrendSourceName } from "../../types.ts";

const DEFAULT_SUBREDDITS = [
  "technology",
  "startups",
  "marketing",
  "socialmedia",
  "artificial",
  "smallbusiness",
  "entrepreneur",
];

const UA = "TrendCraft/1.0 (+trend-research)";

export class RedditSource implements TrendSource {
  readonly name: TrendSourceName = "reddit";

  async fetchCandidates(ctx: SourceContext): Promise<TrendCandidate[]> {
    const out: TrendCandidate[] = [];
    const subs = unique([
      ...DEFAULT_SUBREDDITS,
      ...ctx.subreddits.map((s) => s.replace(/^r\//, "")),
    ]).slice(0, 10);
    const perSub = Math.max(1, Math.floor(ctx.cap / subs.length));
    const cutoff = (Date.now() - ctx.timeWindowHours * 3600_000) / 1000;
    for (const sub of subs) {
      try {
        const url = `https://www.reddit.com/r/${sub}/top.json?t=${pickTimeBucket(ctx.timeWindowHours)}&limit=${perSub}`;
        const res = await fetch(url, {
          headers: { "User-Agent": UA, Accept: "application/json" },
        });
        if (!res.ok) continue;
        const data = (await res.json()) as {
          data?: { children?: Array<{ data: RedditPost }> };
        };
        for (const child of data.data?.children ?? []) {
          const p = child.data;
          if (!p?.title) continue;
          if (p.created_utc < cutoff) continue;
          out.push({
            id: makeId("reddit", p.id),
            title: p.title,
            description: (p.selftext ?? "").slice(0, 280),
            canonicalUrl: p.url_overridden_by_dest ?? `https://reddit.com${p.permalink}`,
            sourceName: this.name,
            sourceUrl: `https://reddit.com${p.permalink}`,
            publishedAt: new Date(p.created_utc * 1000).toISOString(),
            rawEngagement: (p.score ?? 0) + 2 * (p.num_comments ?? 0),
            keywords: unique([
              ...(p.link_flair_text ? [p.link_flair_text] : []),
              p.subreddit,
              ...(p.title.split(/\s+/).slice(0, 4)),
            ]),
          });
        }
      } catch {
        // degrade silently
      }
    }
    return out;
  }
}

interface RedditPost {
  id: string;
  title: string;
  selftext?: string;
  url_overridden_by_dest?: string;
  permalink: string;
  created_utc: number;
  score: number;
  num_comments: number;
  link_flair_text?: string;
  subreddit: string;
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function pickTimeBucket(hours: number): "day" | "week" | "month" {
  if (hours <= 36) return "day";
  if (hours <= 24 * 8) return "week";
  return "month";
}
