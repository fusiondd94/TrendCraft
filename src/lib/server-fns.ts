import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { sql } from "~/db";
import { resolve } from "node:path";

/**
 * Server function: apply the database schema migration.
 * Call this from a route or via a fetch to get the migration result.
 */
export const getHealth = createServerFn({ method: "GET" }).handler(async () => {
  const checks: Record<string, string> = {};
  checks.server = "ok";

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
  } else {
    checks.database = "skipped (DATABASE_URL not configured)";
  }

  const allOk = Object.values(checks).every(
    (v) => v.startsWith("ok") || v.startsWith("connected"),
  );

  return {
    status: allOk ? "healthy" : "degraded" as const,
    checks,
    timestamp: new Date().toISOString(),
  };
});

/**
 * Server function: apply the database schema migration.
 */
export const setupDatabase = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const migrationPath = resolve(
      process.cwd(),
      "src/db/migrations/001_initial_schema.sql",
    );
    const migrationSql = await readFile(migrationPath, "utf8");

    const db = sql();
    await db.unsafe(migrationSql);

    const tables = await db`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    return {
      success: true as const,
      message: "Schema migration applied successfully",
      tables: tables.map((t: { table_name: string }) => t.table_name),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});