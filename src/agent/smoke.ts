#!/usr/bin/env bun
/**
 * Smoke test: build a pipeline, run a tiny request, validate
 * the result with Zod, and assert a few invariants the backend
 * will rely on.
 *
 *   bun run src/smoke.ts
 *
 * Intended to be cheap (uses mock LLM + mock image) so it can run
 * in CI without API keys.
 */

import {
  ContentPackSchema,
  createPipeline,
  PipelineResultSchema,
  TrendSchema,
} from "./index.ts";

const failures: string[] = [];
function expect(cond: unknown, label: string): void {
  if (cond) {
    console.log(`  ok  ${label}`);
  } else {
    console.log(`  FAIL ${label}`);
    failures.push(label);
  }
}

console.log("TrendCraft agent — smoke test\n");

// 1) Pipeline builds and runs.
const pipeline = createPipeline();
expect(typeof pipeline.run === "function", "pipeline.run is a function");

// 2) Run a tiny request.
const result = await pipeline.run({
  userProfile: {
    id: "smoke-user",
    niche: "freelance design",
    businessDescription: "A freelance designer sharing workflow tips.",
    customTopics: ["figma"],
    targetPlatforms: ["x", "instagram"],
    brandVoice: "Casual, direct, useful.",
    locale: "en-US",
  },
  maxTrends: 2,
  trendsPerSource: 3,
  sources: ["hackernews"],
  timeWindowHours: 168,
  contentPerTrend: 1,
  generate: {
    blogPost: true,
    image: true,
    videoScript: true,
    captions: true,
  },
});

// 3) Validate the whole result with Zod.
const parsed = PipelineResultSchema.safeParse(result);
expect(parsed.success, "PipelineResult matches the Zod schema");
if (!parsed.success) {
  console.error("  schema errors:", parsed.error.issues.slice(0, 5));
}

// 4) Assert the result shape.
expect(result.userId === "smoke-user", "userId echoed correctly");
expect(result.contentPacks.length <= 2, "contentPacks.length <= maxTrends");
for (const pack of result.contentPacks) {
  const p = ContentPackSchema.safeParse(pack);
  expect(p.success, `ContentPack ${pack.id} matches schema`);
  expect(
    pack.captions.length > 0,
    `pack ${pack.id} has at least one caption`,
  );
  expect(pack.score.overallScore >= 0 && pack.score.overallScore <= 1, `pack ${pack.id} score in [0,1]`);
  if (pack.blogPost) {
    expect(pack.blogPost.wordCount > 0, `pack ${pack.id} blog has words`);
  }
  if (pack.image) {
    expect(typeof pack.image.imageUrl === "string", `pack ${pack.id} image has url/base64`);
  }
  if (pack.videoScript) {
    expect(pack.videoScript.scenes.length >= 1, `pack ${pack.id} video has scenes`);
    expect(pack.videoScript.durationSeconds > 0, `pack ${pack.id} video has duration`);
  }
}

// 5) Trends are scored.
for (const t of result.trends) {
  const tParsed = TrendSchema.safeParse(t);
  expect(tParsed.success, `Trend ${t.id} matches schema`);
  expect(
    t.compositeScore >= 0 && t.compositeScore <= 1,
    `trend ${t.id} composite in [0,1]`,
  );
}

console.log(
  `\n${failures.length === 0 ? "ALL GREEN" : `${failures.length} FAILURE(S)`}`,
);
if (failures.length > 0) process.exit(1);
