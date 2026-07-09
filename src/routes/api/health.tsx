import { createFileRoute } from "@tanstack/react-router";
import { getHealth } from "~/lib/server-fns";

/**
 * GET /api/health — JSON health check endpoint
 * Returns server and database status as JSON.
 */
export const Route = createFileRoute("/api/health")({
  component: () => (
    <pre className="m-4 rounded bg-gray-100 p-4 font-mono text-sm dark:bg-gray-800" />
  ),
  loader: async () => {
    const data = await getHealth();
    return data;
  },
});

function HealthPage() {
  const data = Route.useLoaderData();
  return (
    <pre className="m-4 rounded bg-gray-100 p-4 font-mono text-sm dark:bg-gray-800">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}