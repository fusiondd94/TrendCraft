/**
 * Server functions that wrap the TrendCraft AI Agent.
 *
 * The agent is a self-contained library at `~/agent` — see
 * `src/agent/README.md` for architecture and `src/agent/types.ts`
 * for the Zod schemas (the contract with this layer).
 *
 * Wire-up:
 *  - The agent's LLM and image providers are picked from env at
 *    first call (cached thereafter). Defaults to `mock` so the
 *    pipeline works in dev without API keys.
 *  - Request body is validated against `TrendRequestSchema`
 *    before any work happens; bad input returns a 400-shaped
 *    error result (never throws to the route).
 *  - `createPipeline()` is constructed per call so the env is
 *    re-read on each request (no stale-credentials footgun).
 *
 * Cost & latency (see `src/agent/INTEGRATION.md` for the full
 * analysis):
 *  - Mock: ~1s, free
 *  - Real (gpt-4o-mini + DALL-E 3): ~20-60s, ~$0.05-$0.10/run
 *
 * For a real deployment on Vercel, bump the function timeout to
 * 60-300s in `vercel.json` (the framework adapter honors it).
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createPipeline,
  PipelineResultSchema,
  TrendRequestSchema,
} from "~/agent";

/**
 * POST server function: run the AI agent end-to-end.
 *
 * Input  : TrendRequest (validated with Zod)
 * Output : PipelineResult (validated with Zod) OR an error
 *          envelope: `{ ok: false, error, fieldErrors? }`
 *
 * Frontend callers should branch on `result.ok`. The route at
 * `src/routes/api/generate.tsx` translates this into a 200/400
 * response and JSON body.
 */
export const generateContent = createServerFn({ method: "POST" })
  .validator(TrendRequestSchema)
  .handler(async ({ data }) => {
    const log = {
      userId: data.userProfile.id,
      niche: data.userProfile.niche,
      sources: data.sources ?? "default",
      maxTrends: data.maxTrends,
    };
    try {
      const pipeline = createPipeline();
      const result = await pipeline.run(data);
      // Re-validate on the way out so a bad pipeline impl can't
      // hand the route a malformed payload.
      const parsed = PipelineResultSchema.safeParse(result);
      if (!parsed.success) {
        return {
          ok: false as const,
          error: "agent produced an invalid PipelineResult",
          details: parsed.error.issues.slice(0, 5),
          request: log,
        };
      }
      return { ok: true as const, result: parsed.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return {
        ok: false as const,
        error: `agent run failed: ${message}`,
        request: log,
      };
    }
  });

/**
 * Optional input: the agent's request schema, re-exported for
 * the frontend so it can build a strongly-typed call site
 * without a second import. The frontend doesn't need to import
 * zod directly to use this.
 */
export const GenerateInputSchema = TrendRequestSchema;
export type GenerateInput = z.infer<typeof GenerateInputSchema>;
