# TrendCraft AI Agent — Architecture

> High-level design doc. For implementation details, see
> [`/home/team/shared/agent/README.md`](./agent/README.md) and
> [`/home/team/shared/agent/INTEGRATION.md`](./agent/INTEGRATION.md).
> For backend integration, the source of truth is the Zod
> schema at `/home/team/shared/agent/src/types.ts`.

## 1. What the agent does

Given a `UserProfile` (niche, business description, custom topics,
brand voice, target platforms), the agent:

1. **Researches** what's trending in the user's niche across multiple
   free public sources.
2. **Ranks** the candidates against the niche, virality, and freshness.
3. **Generates** a publishable content pack for each top trend:
   blog post, hero image, short-form video script, platform-tailored
   captions.
4. **Scores** each pack on quality, virality, and brand fit.

The backend stores the packs and surfaces them in the approval queue.

## 2. The data flow

```
┌─────────────┐
│ UserProfile │ (niche, brand voice, platforms, …)
└─────┬───────┘
      │
      ▼
┌──────────────────────┐
│  1. QueryGenerator   │  one LLM call — expand the niche
│     (LLM)            │  into search vocabulary
└─────┬────────────────┘
      │ {queries, subreddits, newsTopics}
      ▼
┌──────────────────────────────────────────────────────┐
│  2. TrendSources (parallel, no-auth)                 │
│  ┌────────────┬───────────┬─────────────┬──────────┐  │
│  │ HackerNews │  Reddit   │ Google News │ DDG Web  │  │
│  │ (Algolia)  │  (JSON)   │   (RSS)     │ (HTML)   │  │
│  └─────┬──────┴─────┬─────┴──────┬──────┴────┬─────┘  │
│        └────────────┴────────────┴───────────┘        │
│            raw TrendCandidate[]                        │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────┐
│  3. TrendRanker                       │
│   a) heuristic pre-score              │
│   b) top 25 → LLM batch scoring       │
│   → top N Trends (scored, deduped)    │
└──────────────────────┬────────────────┘
                       │ for each top trend:
                       ▼
┌────────────────────────────────────────────────┐
│  4. ContentGenerator (parallel pieces)         │
│   BlogPost  (LLM, 400-900w markdown)           │
│   Image     (LLM prompt + image API)           │
│   VideoScript (LLM, scenes + voiceover)        │
│   Captions  (LLM, one per target platform)      │
└──────────────────────┬─────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────┐
│  5. ContentScorer (LLM)              │
│   quality / virality / brand-fit     │
│   0-1 scores + reasoning             │
└──────────────────────┬────────────────┘
                       │
                       ▼
              ContentPack[] → backend
```

## 3. Output schemas (for the backend-dev)

The complete schemas live in `agent/src/types.ts` as Zod. Backend
should `safeParse` against them on the way in.

### Trend

```ts
{
  id: string,                    // sha1 hash, stable
  title: string,
  description: string,
  canonicalUrl?: string,
  source: { name: "hackernews"|"reddit"|"google_news"|"web_search"|"rss",
            url?, rawEngagement?, rawMetadata? },
  discoveredAt: string,           // ISO
  publishedAt?: string,           // ISO
  keywords: string[],
  topics: string[],
  rawEngagement?: number,
  relevanceScore: number,         // 0-1
  viralityScore: number,          // 0-1
  freshnessScore: number,         // 0-1
  compositeScore: number,         // 0-1
  reasoning?: string              // 1-line LLM rationale
}
```

### ContentPack (the unit the backend stores)

```ts
{
  id: string,                    // sha1 hash
  trend: Trend,                   // source trend
  blogPost?: BlogPost,            // 400-900w markdown
  image?: ImageContent,           // base64 OR hosted url
  videoScript?: VideoScript,      // scenes + voiceover + hashtags
  captions: Caption[],            // one per target platform
  score: { overallScore, qualityScore,
           viralityScore, brandFitScore, reasoning },
  createdAt: string,
  modelVersions?: { llm?, image? }
}
```

### Content pieces (per-platform details)

```ts
BlogPost:     { id, title, body (markdown), excerpt,
                wordCount, seoKeywords, readingTimeMinutes }
ImageContent: { id, prompt, imageUrl|imageBase64, format,
                width, height, style, altText }
VideoScript:  { id, format, durationSeconds, hook, scenes[],
                voiceoverScript, onScreenText, hashtags, cta,
                musicMood? }
Caption:      { id, platform, text, hook, hashtags, emojis,
                cta?, characterCount }
```

### Pipeline result (the function return)

```ts
{
  userId: string,
  request: TrendRequest,
  trends: Trend[],
  contentPacks: ContentPack[],    // up to request.maxTrends
  generatedAt: string,
  durationMs: number,
  warnings: string[]              // per-piece failures, never empty if hard error
}
```

## 4. API choices & cost

| Piece | Default | Cost | Free alternative |
| --- | --- | --- | --- |
| LLM (text) | OpenAI `gpt-4o-mini` via fetch | ~$0.15/1M in, $0.60/1M out | Groq free tier, Gemini Flash free tier |
| Image | DALL-E 3 (1024x1024) | $0.04/img | Stability AI free credits, Pollinations.ai (free) |
| Trend data | HN Algolia, Reddit JSON, Google News RSS, DDG | $0 | All of these — no key required |
| Video (script only) | LLM-generated | included in LLM cost | — |
| Video (asset, future) | HeyGen / Runway | TBD | Stable Video Diffusion (self-host) |

**Per full run** (3 trends, all 4 content types, on gpt-4o-mini):
~13 LLM calls + 3 image calls ≈ **$0.05–$0.10** per run.

## 5. LLM provider strategy

Default is OpenAI because of two reasons that matter for us:
- **Structured outputs** (json_schema strict mode) — guarantees the
  agent never gets a hallucinated shape back. Without this we'd
  have to parse JSON defensively on every call.
- **Cheap, fast `gpt-4o-mini`** — adequate for trend scoring and
  captions; switch to `gpt-4o` for blog posts if quality matters.

The LLM client is behind an interface (`LLMClient` in
`src/llm/client.ts`), so swapping in Anthropic, Gemini, or a
local model is a single-file change.

## 6. Reliability properties

- **Sources fan out in parallel** (`Promise.allSettled`). One slow
  source never blocks the rest.
- **No source ever throws.** A failing source returns `[]` and a
  warning; the pipeline still produces results from the others.
- **Every LLM / image call is wrapped in try/catch** with
  per-piece fallback. A broken image generator returns a
  warning, not a 500.
- **Mock LLM is schema-valid**, so the whole pipeline can be
  exercised in CI without API keys.
- **All I/O uses `fetch`** — works in Node 18+, Bun, Vercel Edge,
  Cloudflare Workers, no SDK dependencies.

## 7. What lives where

```
/home/team/shared/agent/                ← the library
├── README.md                           ← architecture (implementation level)
├── INTEGRATION.md                      ← backend wiring, table mapping
├── package.json + tsconfig.json
├── src/
│   ├── types.ts                        ← Zod schemas (the contract)
│   ├── pipeline.ts                     ← single entry point
│   ├── llm/         (OpenAIClient, MockLLMClient, factory)
│   ├── image/       (OpenAIImagesClient, MockImageClient, factory)
│   ├── trend_research/  (sources, query gen, ranker)
│   ├── content_generation/  (blog, image, video, captions)
│   ├── scoring/      (content scorer)
│   ├── util/         (log, hash)
│   ├── demo.ts       (CLI demo)
│   └── smoke.ts      (Zod-validated smoke test)
```

## 8. What's achievable today

**Yes (v1):** trend research, blog posts, hero images, video
scripts, platform captions, scoring, end-to-end demo in mock mode,
TypeScript-typed contracts.

**Stubbed / partial:**
- Video *asset* generation. The agent produces the **script**
  (scenes + voiceover + hashtags + CTA) — that's what the
  existing schema covers. Rendering the actual video would need
  a service like HeyGen, Runway, or a self-hosted pipeline; out
  of scope for v1.
- A real web-search API (Brave/Tavily) behind a key. The agent
  ships with DDG as a no-key fallback. To add Brave, write a
  class that implements `TrendSource` and pass it via
  `createPipeline({ sources: { web_search: new BraveSource(...) }})`.
- X/Twitter trend source. Reddit JSON covers a lot of it; the
  real X API is paid.

## 9. Next steps

1. Get backend wired up to call `createPipeline().run(request)`
   and persist the result using the table mapping in
   `INTEGRATION.md`.
2. Frontend builds the approval queue off the persisted
   `ContentPack[]`.
3. Once the user has historical engagement data, re-rank trends
   using that as a prior.
4. Add a per-`(userProfile, timeWindow)` cache so repeat runs
   don't re-fetch the web.
5. (Optional) Wire a real web-search API and a video-asset
   service.
