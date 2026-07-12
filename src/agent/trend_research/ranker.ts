/**
 * TrendRanker: scores and ranks raw TrendCandidates.
 *
 * Scoring has two stages:
 *   1. Cheap heuristic pre-scoring (relevance + freshness + raw
 *      engagement) so the LLM only has to look at the top N.
 *   2. LLM scoring of the top N, where the model decides on a
 *      viralityScore and confirms/revises the relevance.
 *
 * The final compositeScore is a weighted blend that's easy for
 * the backend to display as a "trend strength" meter.
 */

import type { LLMClient } from "../llm/client.ts";
import type { Trend, TrendSource, UserProfile } from "../types.ts";
import { makeId } from "../util/hash.ts";
import type { TrendCandidate } from "./sources/source.ts";
import { getLogger } from "../util/log.ts";

const HEURISTIC_KEEP = 25; // candidates we send to the LLM

export interface RankOptions {
  maxTrends: number;
  timeWindowHours: number;
}

export class TrendRanker {
  constructor(private readonly llm: LLMClient) {}

  async rank(
    profile: UserProfile,
    candidates: TrendCandidate[],
    opts: RankOptions,
  ): Promise<Trend[]> {
    if (candidates.length === 0) return [];

    // 1) Dedupe by canonical URL or title.
    const deduped = dedupeByUrlOrTitle(candidates);

    // 2) Heuristic pre-score and sort.
    const pre = deduped
      .map((c) => ({ c, h: heuristic(c, profile, opts) }))
      .sort((a, b) => b.h.composite - a.h.composite)
      .slice(0, Math.max(opts.maxTrends, HEURISTIC_KEEP));

    // 3) LLM-score the top slice in batches so we don't blow the
    //    context window. If the LLM fails for a batch, fall back
    //    to the heuristic scores.
    const llmScored: Array<{ c: TrendCandidate; trend: Trend }> = [];
    const batchSize = 10;
    for (let i = 0; i < pre.length; i += batchSize) {
      const batch = pre.slice(i, i + batchSize);
      try {
        const scored = await this.scoreBatch(profile, batch);
        for (const s of scored) llmScored.push(s);
      } catch (err) {
        getLogger().warn("Ranker LLM batch failed, using heuristic", err);
        for (const { c, h } of batch) {
          llmScored.push({
            c,
            trend: buildTrend(c, h.relevance, h.virality, h.freshness, h.reasoning),
          });
        }
      }
    }

    // 4) Final sort by composite, then take maxTrends.
    return llmScored
      .sort((a, b) => b.trend.compositeScore - a.trend.compositeScore)
      .slice(0, opts.maxTrends)
      .map((s) => s.trend);
  }

  private async scoreBatch(
    profile: UserProfile,
    batch: Array<{ c: TrendCandidate; h: Heuristic }>,
  ): Promise<Array<{ c: TrendCandidate; trend: Trend }>> {
    const items = batch.map(({ c, h }, i) => ({
      idx: i,
      title: c.title,
      source: c.sourceName,
      description: c.description?.slice(0, 200) ?? "",
      keywords: c.keywords.slice(0, 6),
      hint_relevance: round2(h.relevance),
      hint_freshness: round2(h.freshness),
    }));
    const messages: Array<{ role: "system" | "user"; content: string }> = [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: [
          `Niche: ${profile.niche}`,
          `Business: ${profile.businessDescription}`,
          profile.brandVoice ? `Brand voice: ${profile.brandVoice}` : "",
          "",
          "Score each candidate on relevance (fit to niche, 0-1) and virality (likelihood of getting traction, 0-1). Return one object per candidate, preserving `idx`.",
          "",
          "Candidates:",
          JSON.stringify(items, null, 2),
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ];
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        scores: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              idx: { type: "number" },
              relevance: { type: "number", minimum: 0, maximum: 1 },
              virality: { type: "number", minimum: 0, maximum: 1 },
              reasoning: { type: "string" },
            },
            required: ["idx", "relevance", "virality", "reasoning"],
          },
        },
      },
      required: ["scores"],
    } as const;
    type Out = { scores: Array<{ idx: number; relevance: number; virality: number; reasoning: string }> };
    const out = await this.llm.generateStructured<Out>(messages, {
      name: "trend_scoring",
      schema,
      instructions:
        "Return JSON only. Use the provided idx to map scores back to candidates.",
    });
    const byIdx = new Map(out.scores.map((s) => [s.idx, s]));
    return batch.map(({ c, h }, i) => {
      const s = byIdx.get(i);
      const relevance = clamp01(s?.relevance ?? h.relevance);
      const virality = clamp01(s?.virality ?? h.virality);
      return {
        c,
        trend: buildTrend(
          c,
          relevance,
          virality,
          h.freshness,
          s?.reasoning ?? h.reasoning,
        ),
      };
    });
  }
}

interface Heuristic {
  relevance: number;
  virality: number;
  freshness: number;
  composite: number;
  reasoning: string;
}

const SYSTEM =
  "You score social-media trend candidates for a small business. Be calibrated — most candidates should be 0.3-0.6, only the best 1-2 should be 0.8+.";

function heuristic(
  c: TrendCandidate,
  profile: UserProfile,
  opts: RankOptions,
): Heuristic {
  const text = `${c.title} ${c.description} ${c.keywords.join(" ")}`.toLowerCase();
  const niche = profile.niche.toLowerCase();
  const custom = (profile.customTopics ?? []).map((t) => t.toLowerCase());
  const tokens = [niche, ...custom].flatMap((t) => t.split(/\s+/).filter((w) => w.length > 2));
  let relevance = 0.1;
  for (const t of tokens) {
    if (t && text.includes(t)) relevance += 0.2;
  }
  relevance = clamp01(relevance);

  const eng = Math.log10(1 + (c.rawEngagement ?? 0));
  const virality = clamp01(0.15 + 0.18 * eng);

  let freshness = 0.5;
  if (c.publishedAt) {
    const ageH = (Date.now() - Date.parse(c.publishedAt)) / 3600_000;
    freshness = clamp01(1 - ageH / opts.timeWindowHours);
  } else {
    freshness = 0.5;
  }

  const composite = 0.5 * relevance + 0.25 * virality + 0.25 * freshness;
  return {
    relevance,
    virality,
    freshness,
    composite,
    reasoning: `heuristic: ${tokens.filter((t) => text.includes(t)).slice(0, 3).join(", ") || "low overlap"}`,
  };
}

function buildTrend(
  c: TrendCandidate,
  relevance: number,
  virality: number,
  freshness: number,
  reasoning: string,
): Trend {
  const composite = 0.5 * relevance + 0.25 * virality + 0.25 * freshness;
  const source: TrendSource = {
    name: c.sourceName,
    url: c.sourceUrl,
    rawEngagement: c.rawEngagement,
    rawMetadata: c.rawMetadata,
  };
  const id = c.id || makeId("trend", c.sourceName, c.canonicalUrl ?? c.title);
  return {
    id,
    title: c.title,
    description: c.description ?? "",
    canonicalUrl: c.canonicalUrl,
    source,
    discoveredAt: new Date().toISOString(),
    publishedAt: c.publishedAt,
    keywords: c.keywords ?? [],
    topics: [],
    rawEngagement: c.rawEngagement,
    relevanceScore: round2(relevance),
    viralityScore: round2(virality),
    freshnessScore: round2(freshness),
    compositeScore: round2(composite),
    reasoning,
  };
}

function dedupeByUrlOrTitle(cands: TrendCandidate[]): TrendCandidate[] {
  const seenUrl = new Set<string>();
  const seenTitle = new Set<string>();
  const out: TrendCandidate[] = [];
  for (const c of cands) {
    const urlKey = (c.canonicalUrl ?? "").toLowerCase().replace(/\/+$/, "");
    const titleKey = c.title.toLowerCase().replace(/\W+/g, " ").trim();
    if (urlKey) {
      if (seenUrl.has(urlKey)) continue;
      seenUrl.add(urlKey);
    } else {
      if (seenTitle.has(titleKey)) continue;
      seenTitle.add(titleKey);
    }
    out.push(c);
  }
  return out;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
