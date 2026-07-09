/**
 * Generic RSS source — for niche-specific feeds the user
 * (or the query generator) supplies.
 *
 * Used when a user says "always include RSS feed X". The feed
 * list comes from TrendRequest.sources (when 'rss' is selected)
 * combined with a default list of well-known industry feeds
 * keyed off the niche via the query generator.
 */

import { makeId } from "../../util/hash.ts";
import type {
  SourceContext,
  TrendCandidate,
  TrendSource,
} from "./source.ts";
import type { TrendSourceName } from "../../types.ts";

const UA = "TrendCraft/1.0 (+trend-research)";

// Well-known feeds the agent can use as a default. They are
// deliberately broad — the ranker will pick what fits the niche.
const DEFAULT_FEEDS: Record<string, string[]> = {
  tech: [
    "https://hnrss.org/frontpage",
    "https://www.theverge.com/rss/index.xml",
    "https://feeds.arstechnica.com/arstechnica/index",
  ],
  business: [
    "https://feeds.bloomberg.com/markets/news.rss",
    "https://www.hbr.org/feed",
  ],
  marketing: [
    "https://blog.hubspot.com/marketing/rss.xml",
    "https://feeds.feedburner.com/MarketingProfs",
  ],
  design: [
    "https://www.smashingmagazine.com/feed/",
  ],
  general: [
    "https://news.ycombinator.com/rss",
  ],
};

export class RssSource implements TrendSource {
  readonly name: TrendSourceName = "rss";

  async fetchCandidates(ctx: SourceContext): Promise<TrendCandidate[]> {
    const feeds = collectFeeds(ctx);
    const per = Math.max(1, Math.floor(ctx.cap / Math.max(1, feeds.length)));
    const out: TrendCandidate[] = [];
    for (const url of feeds) {
      try {
        const res = await fetch(url, { headers: { "User-Agent": UA } });
        if (!res.ok) continue;
        const xml = await res.text();
        for (const item of parseRss(xml, per)) {
          if (
            item.pubDate &&
            Date.parse(item.pubDate) < Date.now() - ctx.timeWindowHours * 3600_000
          )
            continue;
          out.push({
            id: makeId("rss", item.link),
            title: item.title,
            description: "",
            canonicalUrl: item.link,
            sourceName: this.name,
            sourceUrl: item.link,
            publishedAt: item.pubDate,
            rawEngagement: 0,
            keywords: [feedHost(url)],
          });
        }
      } catch {
        // degrade silently
      }
    }
    return out;
  }
}

function collectFeeds(ctx: SourceContext): string[] {
  const feeds = new Set<string>();
  for (const q of ctx.queries) {
    const key = q.toLowerCase();
    for (const [k, urls] of Object.entries(DEFAULT_FEEDS)) {
      if (key.includes(k)) urls.forEach((u) => feeds.add(u));
    }
  }
  if (feeds.size === 0) DEFAULT_FEEDS.general.forEach((u) => feeds.add(u));
  return Array.from(feeds).slice(0, 5);
}

function feedHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

interface RssItem {
  title: string;
  link: string;
  pubDate?: string;
}

function parseRss(xml: string, cap: number): RssItem[] {
  const items: RssItem[] = [];
  const re = /<item[\s>]([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) && items.length < cap) {
    const body = match[1];
    const title = firstTag(body, "title");
    const link = firstTag(body, "link") || firstTag(body, "guid");
    const pubDate = firstTag(body, "pubDate") || firstTag(body, "pubdate");
    if (!title) continue;
    items.push({
      title: decodeEntities(title),
      link: link ?? "",
      pubDate,
    });
  }
  return items;
}

function firstTag(xml: string, tag: string): string | undefined {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].trim() : undefined;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}
