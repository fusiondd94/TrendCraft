import { createAPIFileRoute } from "@tanstack/react-start/api";
import { sql } from "~/db";

/**
 * GET /api/health
 * Lightweight health check — verifies the server is running and the database
 * is reachable. Returns a 200 with status info or a 503 if the DB is down.
 */
export const Route = createAPIFileRoute("/api/health")({
  GET: async () => {
    const checks: Record<string, string> = {};

    // Server check
    checks.server = "ok";

    // Database check (only if DATABASE_URL is set)
    checks.database = "skipped (DATABASE_URL not configured)";
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      try {
        const db = sql();
        const result = await db`SELECT now() as current_time`;
        const row = result[0] as { current_time: string } | undefined;
        checks.database = row
          ? `connected — ${String(row.current_time)}`
          : "error: no response";
      } catch (err) {
        checks.database = `error: ${err instanceof Error ? err.message : "unknown"}`;
      }
    }

    const allOk = Object.values(checks).every(
      (v) => v.startsWith("ok") || v.startsWith("connected"),
    );

    return new Response(
      JSON.stringify({
        status: allOk ? "healthy" : "degraded",
        checks,
        timestamp: new Date().toISOString(),
      }),
      {
        status: allOk ? 200 : 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  },
});