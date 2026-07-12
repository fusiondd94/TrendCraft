/**
 * Google News source via RSS.
 *
 * Free, no auth, no scraping. RSS is XML — we use a minimal
 * regex parser to keep the dependency footprint small.
 */

import { makeId } from "../../util/hash.ts";
import type {
  SourceContext,
  TrendCandidate,
  TrendSource,
} from "./source.ts";
import type { TrendSourceName } from "../../types.ts";

const RSS = "https://news.google.com/rss/search";
const UA = "TrendCraft/1.0 (+trend-research)";

export class GoogleNewsSource implements TrendSource {
  readonly name: TrendSourceName = "google_news";

  async fetchCandidates(ctx: SourceContext): Promise<TrendCandidate[]> {
    const out: TrendCandidate[] = [];
    const cap = Math.max(1, Math.floor(ctx.cap / Math.max(1, ctx.newsTopics.length)));
    for (const topic of ctx.newsTopics.slice(0, 4)) {
      try {
        const url = new URL(RSS);
        url.searchParams.set("q", topic);
        url.searchParams.set("hl", "en-US");
        url.searchParams.set("gl", "US");
        url.searchParams.set("ceid", "US:en");
        const res = await fetch(url.toString(), { headers: { "User-Agent": UA } });
        if (!res.ok) continue;
        const xml = await res.text();
        for (const item of parseRss(xml, cap)) {
          if (Date.parse(item.pubDate ?? "") < Date.now() - ctx.timeWindowHours * 3600_000) continue;
          out.push({
            id: makeId("gnews", item.link),
            title: item.title,
            description: "",
            canonicalUrl: item.link,
            sourceName: this.name,
            sourceUrl: item.link,
            publishedAt: item.pubDate,
            rawEngagement: 0,
            keywords: [topic],
          });
        }
      } catch {
        // degrade silently
      }
    }
    return out;
  }
}

interface RssItem {
  title: string;
  link: string;
  pubDate?: string;
}

function parseRss(xml: string, cap: number): RssItem[] {
  const items: RssItem[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) && items.length < cap) {
    const body = match[1];
    const title = firstTag(body, "title");
    const link = firstTag(body, "link") || firstTag(body, "guid") || "";
    const pubDate = firstTag(body, "pubDate");
    if (!title || !link) continue;
    items.push({ title: decodeEntities(title), link, pubDate });
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
    .replace(/<[^>]+>/g, "") // strip inner CDATA HTML
    .trim();
}
