import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Dashboard header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Welcome back! Here's your content overview.
            </p>
          </div>
          <Link
            to="/signup"
            className="gradient-btn inline-flex items-center justify-center !px-5 !py-2.5 text-sm"
          >
            Create New Post
          </Link>
        </div>

        {/* Stats grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Posts Scheduled
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
              24
            </p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              +12% from last week
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Published
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
              142
            </p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              +8% this month
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Review
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
              7
            </p>
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Needs attention
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Engagement
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
              3.2K
            </p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              +24% this week
            </p>
          </div>
        </div>

        {/* Content Calendar Preview */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Upcoming Content
            </h2>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              View calendar
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {[
              {
                platform: "Instagram",
                title: "Quick tip: 3 ways to boost engagement",
                date: "Today, 2:00 PM",
                status: "Approved",
                statusColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
              },
              {
                platform: "LinkedIn",
                title: "The future of AI in content marketing",
                date: "Tomorrow, 9:00 AM",
                status: "Pending",
                statusColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
              },
              {
                platform: "TikTok",
                title: "Behind the scenes: our content process",
                date: "Jul 11, 12:00 PM",
                status: "Approved",
                statusColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
              },
              {
                platform: "X (Twitter)",
                title: "Thread: 5 social media trends to watch",
                date: "Jul 12, 10:00 AM",
                status: "Draft",
                statusColor: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800",
              },
            ].map((post) => (
              <div
                key={post.title}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    {post.platform.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {post.platform} &middot; {post.date}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${post.statusColor}`}
                >
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}