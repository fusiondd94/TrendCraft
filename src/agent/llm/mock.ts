/**
 * Deterministic mock LLM for local dev and tests.
 *
 * It returns sensible default content for every prompt the agent
 * sends so that the full pipeline can be exercised end-to-end
 * without an API key. The mock is deliberately boring but
 * structurally correct — the goal is to verify the wiring, not
 * the content quality.
 */

import type {
  LLMClient,
  LLMGenerateOptions,
  LLMMessage,
  LLMStructuredOptions,
} from "./client.ts";

function shortTopic(messages: LLMMessage[]): string {
  // Only inspect the user message — system messages can contain
  // example phrases in quotes that would trip up a naive regex.
  const userLine = messages.find((m) => m.role === "user")?.content ?? "";
  // Try to extract a quoted topic from the user message first.
  const quoted = userLine.match(/"([^"]{4,80})"/);
  if (quoted) return quoted[1];
  // Otherwise strip "Niche:" / "Trend:" prefixes the prompt templates add.
  const cleaned = userLine
    .split(/\n/)
    .map((l) => l.replace(/^(Niche|Trend|Business|Brand voice|Target( platforms)?|Context|Source|Keywords|Custom topics):\s*/i, "").trim())
    .find((l) => l && l.length > 2) ?? "your niche";
  // First sentence-ish.
  const first = cleaned.split(/[.!?\n]/)[0]?.trim() ?? "your niche";
  return first.slice(0, 80);
}

export class MockLLMClient implements LLMClient {
  readonly provider = "mock";
  readonly defaultModel = "mock-1";
  readonly defaultJsonModel = "mock-1-json";

  async generateText(
    messages: LLMMessage[],
    _options?: LLMGenerateOptions,
  ): Promise<string> {
    const topic = shortTopic(messages);
    return [
      `A quick take on "${topic}": it matters because it changes how teams ship, market, and learn.`,
      `Three angles worth your audience's time:`,
      `1. What's new and why now.`,
      `2. How it actually works in practice (not the brochure version).`,
      `3. What to do this week to stay ahead.`,
    ].join("\n\n");
  }

  async generateStructured<T>(
    messages: LLMMessage[],
    options: LLMStructuredOptions<T>,
  ): Promise<T> {
    const topic = shortTopic(messages);
    // Hand-rolled mock by schema name. The agent's prompts include
    // the schema name in `options.name` so this can branch.
    switch (options.name) {
      case "trend_query_set":
        return {
          queries: [
            `${topic} trends 2026`,
            `${topic} viral`,
            `${topic} news this week`,
          ],
          subreddits: [slugify(topic), "technology", "startups"],
          newsTopics: [topic, `${topic} industry`],
        } as unknown as T;

      case "trend_scoring":
        return {
          scores: [
            { idx: 0, relevance: 0.7, virality: 0.6, reasoning: "Mock: on-niche, generic framing." },
            { idx: 1, relevance: 0.6, virality: 0.55, reasoning: "Mock: adjacent fit." },
            { idx: 2, relevance: 0.5, virality: 0.7, reasoning: "Mock: tangential but viral." },
            { idx: 3, relevance: 0.4, virality: 0.4, reasoning: "Mock: weak fit." },
            { idx: 4, relevance: 0.3, virality: 0.5, reasoning: "Mock: off-topic." },
            { idx: 5, relevance: 0.55, virality: 0.65, reasoning: "Mock: decent fit, possible hook." },
            { idx: 6, relevance: 0.65, virality: 0.5, reasoning: "Mock: on-niche but stale." },
            { idx: 7, relevance: 0.45, virality: 0.6, reasoning: "Mock: adjacent, hot." },
            { idx: 8, relevance: 0.35, virality: 0.45, reasoning: "Mock: off-topic, low traction." },
            { idx: 9, relevance: 0.5, virality: 0.55, reasoning: "Mock: average." },
          ],
        } as unknown as T;

      case "blog_post":
        return {
          title: `Why ${topic} matters in 2026`,
          body: `## Why ${topic} matters in 2026\n\nA short, scannable take on what's changing and what to do about it. (Mock content — replace with a real LLM call.)\n\n## The shift\n\n- Tooling is faster than habits\n- Audiences reward specifics\n- Distribution beats polish\n\n## What to do this week\n\n1. Pick one concrete example\n2. Write the post you'd want to read\n3. Ship before it's perfect`,
          excerpt: `A short, scannable take on ${topic} and what to do about it.`,
          seoKeywords: topic.split(/\s+/).filter(Boolean).slice(0, 5),
        } as unknown as T;

      case "video_script":
        return {
          format: "reel",
          durationSeconds: 30,
          hook: `Stop scrolling — ${topic} changed this week.`,
          scenes: [
            {
              index: 0,
              visualDescription: "Tight close-up, direct to camera",
              onScreenText: `${topic} in 30s`,
              voiceover: `Stop scrolling — ${topic} changed this week.`,
              durationSeconds: 3,
            },
            {
              index: 1,
              visualDescription: "B-roll: product / dashboard / example",
              onScreenText: "Here's why",
              voiceover: `Here's why it matters and what to do next.`,
              durationSeconds: 18,
            },
            {
              index: 2,
              visualDescription: "End card, brand mark, CTA",
              onScreenText: "Follow for more",
              voiceover: `Follow for the next one.`,
              durationSeconds: 9,
            },
          ],
          voiceoverScript: `Stop scrolling — ${topic} changed this week. Here's why it matters and what to do next. Follow for the next one.`,
          onScreenText: [`${topic} in 30s`, "Here's why", "Follow for more"],
          hashtags: ["#trending", `#${slugify(topic)}`, "#trendcraft"],
          cta: "Follow for more",
          musicMood: "upbeat, confident",
        } as unknown as T;

      case "captions":
        return {
          captions: [
            {
              platform: "instagram",
              hook: `${topic} just changed — here's what to do.`,
              text: `${topic} just changed — here's what to do.\n\n• What's new\n• Why it matters\n• One action for this week\n\n#${slugify(topic)} #trending`,
              hashtags: [`#${slugify(topic)}`, "#trending"],
              emojis: ["🔥", "👇"],
              cta: "Save this for later",
            },
            {
              platform: "linkedin",
              hook: `A short take on ${topic} for builders and operators.`,
              text: `A short take on ${topic} for builders and operators.\n\nThe shift: tools moved faster than habits. The opportunity: clearer specifics win.\n\nWhat are you seeing?`,
              hashtags: [],
              emojis: [],
              cta: "Share your view in the comments",
            },
            {
              platform: "x",
              hook: `${topic} thread 🧵`,
              text: `${topic} thread 🧵\n\n1/ The shift\n2/ Why now\n3/ What to do this week`,
              hashtags: [`#${slugify(topic)}`],
              emojis: ["🧵"],
              cta: "RT the first post",
            },
            {
              platform: "tiktok",
              hook: `POV: ${topic} just dropped`,
              text: `POV: ${topic} just dropped and nobody is talking about it #${slugify(topic)} #fyp`,
              hashtags: [`#${slugify(topic)}`, "#fyp"],
              emojis: ["👀"],
              cta: "Follow for part 2",
            },
            {
              platform: "youtube",
              hook: `Why ${topic} matters in 2026`,
              text: `Why ${topic} matters in 2026 — and a short checklist for this week.\n\nTimestamps:\n0:00 Intro\n0:10 The shift\n0:25 What to do\n\n#${slugify(topic)}`,
              hashtags: [`#${slugify(topic)}`],
              emojis: [],
              cta: "Subscribe",
            },
          ],
        } as unknown as T;

      case "image_prompts":
        return {
          prompts: [
            {
              prompt: `Editorial photo of a clean desk with a glowing laptop, soft morning light, muted palette, shallow depth of field, cinematic, ${topic} subtle hint in a sticky note`,
              format: "landscape",
              style: "editorial photo, soft natural light",
              altText: `A clean desk scene evoking ${topic}`,
            },
            {
              prompt: `Minimal vector illustration of an abstract upward graph made of paper layers, soft pastel palette, flat design, ${topic} energy`,
              format: "square",
              style: "minimal flat illustration",
              altText: `Abstract illustration of growth for ${topic}`,
            },
            {
              prompt: `Bold typographic poster, large condensed sans-serif, single hero word, high contrast, single accent color, ${topic} mood`,
              format: "portrait",
              style: "typographic poster",
              altText: `Typographic poster for ${topic}`,
            },
          ],
        } as unknown as T;

      case "content_scoring":
        return {
          overallScore: 0.7,
          qualityScore: 0.75,
          viralityScore: 0.6,
          brandFitScore: 0.7,
          reasoning: `Mock scoring for "${topic}". Looks coherent, could use a stronger hook and a concrete example.`,
        } as unknown as T;

      default:
        return {} as T;
    }
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 30);
}
