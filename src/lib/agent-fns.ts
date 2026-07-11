/**
 * Agent server functions — stubs for the API route.
 * Will be replaced with real agent integration by the backend-dev.
 */

import type { PipelineResult, TrendRequest } from "~/agent";
import { mockContentPacks } from "~/lib/mock-content";

export interface GenerateOutput {
  ok: boolean;
  result?: PipelineResult;
  error?: string;
  fieldErrors?: Array<{ path: string; message: string }>;
}

function buildMockPipelineResult(request: TrendRequest): PipelineResult {
  return {
    userId: "user-mock-001",
    request,
    trends: mockContentPacks.map((p) => p.trend),
    contentPacks: mockContentPacks,
    generatedAt: new Date().toISOString(),
    durationMs: 0,
    warnings: [],
  };
}

export async function generateContent(params: {
  data: TrendRequest;
}): Promise<GenerateOutput> {
  try {
    const result = buildMockPipelineResult(params.data);
    return {
      ok: true,
      result,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}