/**
 * HackerNews source via the public Algolia search API.
 *
 * Free, no auth, generous rate limit. We use the `search_by_date`
 * endpoint so we can bias towards recent stories.
 */

import { makeId } from "../../util/hash.ts";
import type {
  SourceContext,
  TrendCandidate,
  TrendSource,
} from "./source.ts";
import type { TrendSourceName } from "../../types.ts";

const HN_API = "https://hn.algolia.com/api/v1/search_by_date";

export class HackerNewsSource implements TrendSource {
  readonly name: TrendSourceName = "hackernews";

  async fetchCandidates(ctx: SourceContext): Promise<TrendCandidate[]> {
    const out: TrendCandidate[] = [];
    const cap = Math.max(1, Math.floor(ctx.cap / Math.max(1, ctx.queries.length)));
    for (const q of ctx.queries.slice(0, 4)) {
      try {
        const url = new URL(HN_API);
        url.searchParams.set("query", q);
        url.searchParams.set("tags", "story");
        url.searchParams.set("hitsPerPage", String(cap));
        const cutoff = new Date(
          Date.now() - ctx.timeWindowHours * 3600_000,
        ).toISOString();
        // Algolia supports numeric filters; we use created_at_i as a
        // numeric timestamp filter.
        url.searchParams.set(
          "numericFilters",
          `created_at_i>${Math.floor(new Date(cutoff).getTime() / 1000)}`,
        );
        const res = await fetch(url.toString(), {
          headers: { "User-Agent": "TrendCraft/1.0 (+trend-research)" },
        });
        if (!res.ok) continue;
        const data = (await res.json()) as {
          hits: Array<{
            objectID: string;
            title: string;
            story_title?: string;
            url?: string;
            story_text?: string;
            created_at: string;
            points: number;
            num_comments: number;
            _tags: string[];
          }>;
        };
        for (const h of data.hits ?? []) {
          const title = h.title || h.story_title;
          if (!title) continue;
          const url = h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`;
          out.push({
            id: makeId("hn", h.objectID),
            title,
            description: h.story_text?.slice(0, 280) ?? "",
            canonicalUrl: url,
            sourceName: this.name,
            sourceUrl: `https://news.ycombinator.com/item?id=${h.objectID}`,
            publishedAt: h.created_at,
            rawEngagement: (h.points ?? 0) + 2 * (h.num_comments ?? 0),
            keywords: (h._tags ?? []).filter((t) => !t.startsWith("author_")),
          });
        }
      } catch {
        // Never throw from a source — degrade to empty contribution.
      }
    }
    return out;
  }
}
