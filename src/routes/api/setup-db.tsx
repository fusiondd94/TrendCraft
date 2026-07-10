import { createFileRoute } from "@tanstack/react-router";
import { setupDatabase } from "~/lib/server-fns";

/**
 * GET /api/setup-db — Apply database schema migrations
 * Safe to call repeatedly (CREATE IF NOT EXISTS).
 */
export const Route = createFileRoute("/api/setup-db")({
  component: () => (
    <pre className="m-4 rounded bg-gray-100 p-4 font-mono text-sm dark:bg-gray-800" />
  ),
  loader: async () => {
    const data = await setupDatabase();
    return data;
  },
});