/**
 * POST /api/generate — run the AI agent end-to-end and return
 * a JSON `PipelineResult` (or an error envelope).
 *
 * Request body: TrendRequest (see `~/agent` for the schema)
 * Response 200: { ok: true,  result: PipelineResult }
 * Response 400: { ok: false, error: string, details?: ZodIssue[] }
 *
 * The route delegates all the work to the `generateContent`
 * server function in `~/lib/agent-fns`. The server function
 * is the unit the frontend imports if it wants to call the
 * agent directly via TanStack Start's RPC; this HTTP route
 * is the public REST surface for external integrations and
 * for the dashboard's "Generate content" button.
 */

import { createFileRoute } from "@tanstack/react-router";
import { generateContent } from "~/lib/agent-fns";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { TrendRequestSchema } from "~/agent";

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json(
            { ok: false, error: "request body must be valid JSON" },
            { status: 400 },
          );
        }
        // Validate at the route boundary too, so we return a
        // shape that's easy for the frontend to render without
        // unwrapping the server function's error envelope.
        const parsed = TrendRequestSchema.safeParse(body);
        if (!parsed.success) {
          return json(
            {
              ok: false,
              error: "request body does not match TrendRequestSchema",
              details: parsed.error.issues.slice(0, 5),
            },
            { status: 400 },
          );
        }
        const out = await generateContent({ data: parsed.data });
        if (!out.ok) {
          // Validation / agent runtime failure — 4xx for bad
          // input, 5xx for everything else.
          const isInputError =
            typeof out.error === "string" &&
            (out.error.includes("TrendRequestSchema") ||
              out.error.includes("does not match"));
          return json(out, { status: isInputError ? 400 : 500 });
        }
        return json(out, { status: 200 });
      },
    },
  },
});

// Defeat the "isolatedModules" import-only-for-types rule when
// z is referenced only as a type. (Kept for future schema exports
// in this route file.)
type _Unused = z.ZodTypeAny;
