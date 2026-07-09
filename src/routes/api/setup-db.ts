import { createAPIFileRoute } from "@tanstack/react-start/api";
import { readFile } from "node:fs/promises";
import { sql } from "~/db";
import { resolve } from "node:path";

/**
 * GET /api/setup-db
 * Runs the initial schema migration against the Neon database.
 * Safe to call repeatedly — all tables use CREATE IF NOT EXISTS.
 * Returns the names of tables created.
 */
export const Route = createAPIFileRoute("/api/setup-db")({
  GET: async () => {
    try {
      const migrationPath = resolve(
        process.cwd(),
        "src/db/migrations/001_initial_schema.sql",
      );
      const migrationSql = await readFile(migrationPath, "utf8");

      const db = sql();
      await db.unsafe(migrationSql);

      // Verify tables exist
      const tables = await db`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;

      return new Response(
        JSON.stringify({
          success: true,
          message: "Schema migration applied successfully",
          tables: tables.map((t: { table_name: string }) => t.table_name),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      return new Response(
        JSON.stringify({ success: false, error: message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
});