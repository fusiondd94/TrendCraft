/**
 * Web search source via the public DuckDuckGo HTML endpoint.
 *
 * DuckDuckGo's HTML endpoint returns a search results page
 * without JS — we parse it with a small regex. This is not an
 * official API and DDG occasionally throttles, but it works
 * well enough as a generic web-trend fallback when the niche
 * isn't covered by HN/Reddit/news.
 *
 * If you have a real search API key (Brave, SerpAPI, Tavily),
 * implement a parallel TrendSource for it and add to the
 * default source list via TrendRequest.sources.
 */

import { makeId } from "../../util/hash.ts";
import type {
  SourceContext,
  TrendCandidate,
  TrendSource,
} from "./source.ts";
import type { TrendSourceName } from "../../types.ts";

const DDG = "https://html.duckduckgo.com/html/";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export class WebSearchSource implements TrendSource {
  readonly name: TrendSourceName = "web_search";

  async fetchCandidates(ctx: SourceContext): Promise<TrendCandidate[]> {
    const out: TrendCandidate[] = [];
    const perQuery = Math.max(1, Math.floor(ctx.cap / Math.max(1, ctx.queries.length)));
    for (const q of ctx.queries.slice(0, 4)) {
      try {
        const body = new URLSearchParams({ q, kl: "us-en" });
        const res = await fetch(DDG, {
          method: "POST",
          headers: {
            "User-Agent": UA,
            Accept: "text/html",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });
        if (!res.ok) continue;
        const html = await res.text();
        for (const r of parseDdg(html, perQuery)) {
          out.push({
            id: makeId("ddg", r.url, r.title),
            title: r.title,
            description: r.snippet,
            canonicalUrl: r.url,
            sourceName: this.name,
            sourceUrl: r.url,
            rawEngagement: 0,
            keywords: q.split(/\s+/).filter(Boolean),
          });
        }
      } catch {
        // degrade silently
      }
    }
    return out;
  }
}

interface DdgResult {
  title: string;
  url: string;
  snippet: string;
}

function parseDdg(html: string, cap: number): DdgResult[] {
  // DDG HTML uses <a class="result__a" href="...">TITLE</a>
  // and <a class="result__snippet" ...>SNIPPET</a>
  const out: DdgResult[] = [];
  const aRe = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  const sRe = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  const titles: Array<{ url: string; title: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = aRe.exec(html)) && titles.length < cap) {
    titles.push({ url: unescapeHtml(m[1]), title: clean(m[2]) });
  }
  const snippets: string[] = [];
  while ((m = sRe.exec(html)) && snippets.length < cap) {
    snippets.push(clean(m[1]));
  }
  for (let i = 0; i < titles.length; i++) {
    out.push({
      title: titles[i].title,
      url: titles[i].url,
      snippet: snippets[i] ?? "",
    });
  }
  return out;
}

function unescapeHtml(s: string): string {
  // DDG wraps outbound links in a redirector; strip it.
  const m = s.match(/uddg=([^&]+)/);
  if (m) {
    try {
      return decodeURIComponent(m[1]);
    } catch {
      /* fall through */
    }
  }
  return s;
}

function clean(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
