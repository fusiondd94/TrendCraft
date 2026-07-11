#!/usr/bin/env bun
/**
 * TrendCraft Agent — CLI demo.
 *
 * Runs the full pipeline against a hard-coded user profile and
 * prints a human-readable summary of the result. Works in mock
 * mode (no API keys) or with real OpenAI keys.
 *
 *   AGENT_LLM=mock   AGENT_IMAGE=mock   bun run demo
 *   AGENT_LLM=openai AGENT_IMAGE=openai bun run demo
 */

import { createPipeline, type UserProfile, type TrendRequest } from "./index.ts";

const profile: UserProfile = {
  id: "demo-user",
  niche: "indie SaaS marketing",
  businessDescription:
    "A bootstrapped founder building a time-tracking tool for freelancers. Wants to grow on LinkedIn and X with sharp, opinionated content — no generic growth-hacker tone.",
  customTopics: ["time tracking", "deep work", "bootstrapping"],
  targetPlatforms: ["linkedin", "x", "instagram"],
  brandVoice:
    "Opinionated, concrete, slightly dry humor. First person. No exclamation marks.",
  preferredImageStyle: "minimalist editorial photo, muted palette",
  locale: "en-US",
};

const request: TrendRequest = {
  userProfile: profile,
  maxTrends: 3,
  trendsPerSource: 8,
  sources: ["hackernews", "reddit", "google_news", "web_search"],
  timeWindowHours: 72,
  contentPerTrend: 1,
  generate: {
    blogPost: true,
    image: true,
    videoScript: true,
    captions: true,
  },
};

const pipeline = createPipeline();
const result = await pipeline.run(request);

console.log("\n=== TrendCraft demo ===\n");
console.log(`User:    ${result.userId} (${result.request.userProfile.niche})`);
console.log(`Trends:  ${result.trends.length}`);
console.log(`Packs:   ${result.contentPacks.length}`);
console.log(`Took:    ${result.durationMs}ms`);
if (result.warnings.length) {
  console.log(`Warnings:`);
  for (const w of result.warnings) console.log(`  - ${w}`);
}

console.log("\n— Top trends —");
for (const t of result.trends) {
  console.log(
    `  • [${t.source.name}] (${t.compositeScore.toFixed(2)}) ${t.title}`,
  );
  if (t.reasoning) console.log(`      ${t.reasoning}`);
}

console.log("\n— Content packs —");
for (const p of result.contentPacks) {
  console.log(
    `\n  Pack ${p.id}  score=${p.score.overallScore.toFixed(2)}  trend="${p.trend.title}"`,
  );
  if (p.blogPost) {
    console.log(`    Blog:    ${p.blogPost.title} (${p.blogPost.wordCount}w)`);
  }
  if (p.image) {
    console.log(
      `    Image:   ${p.image.format} ${p.image.width}x${p.image.height}  style="${p.image.style}"`,
    );
    console.log(`             url=${p.image.imageUrl?.slice(0, 80)}...`);
  }
  if (p.videoScript) {
    console.log(
      `    Video:   ${p.videoScript.format} ${p.videoScript.durationSeconds}s  hook="${p.videoScript.hook}"`,
    );
  }
  for (const c of p.captions) {
    console.log(
      `    ${c.platform.padEnd(10)} (${c.characterCount}c) ${c.text.slice(0, 80).replace(/\n/g, " ")}…`,
    );
  }
  if (p.score.reasoning) console.log(`    Note:    ${p.score.reasoning}`);
}

console.log("\n=== JSON dump (last pack) ===");
console.log(JSON.stringify(result.contentPacks[0] ?? null, null, 2));
