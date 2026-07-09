import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-indigo-950/30" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/4 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-600/10" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/4 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-600/10" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              AI-Powered Content Creation
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Never Run Out of{" "}
              <span className="gradient-text">Viral Content</span> Ideas
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 sm:text-xl">
              TrendCraft researches trending topics in your niche, then
              auto-creates and schedules viral-ready content — blog posts,
              images, and videos with eye-catching captions. Post consistently
              without the manual grind.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/signup"
                className="gradient-btn text-base !px-8 !py-4"
              >
                Start Free Trial
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                See How It Works
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </a>
            </div>

            <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
              No credit card required &middot; 7-day free trial
            </p>
          </div>

          {/* Dashboard preview mockup */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
              <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    Content Calendar — TrendCraft
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-7 gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-500 dark:text-gray-400"
                      >
                        {day}
                      </div>
                    ),
                  )}
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg border border-gray-100 p-1 dark:border-gray-800 ${
                        i >= 10 && i <= 16
                          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30"
                          : ""
                      }`}
                    >
                      {i >= 10 && i <= 16 && (
                        <div className="flex h-full flex-col justify-between">
                          <span className="text-[10px] font-medium text-gray-900 dark:text-gray-100">
                            {i - 9}
                          </span>
                          <div className="flex gap-0.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                            <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                          </div>
                        </div>
                      )}
                      {i < 10 || i > 16 ? (
                        <span className="text-[10px] text-gray-300 dark:text-gray-700">
                          {i + 1 > 31 ? "" : i + 1}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="border-t border-gray-100 bg-white px-4 py-20 dark:border-gray-800 dark:bg-gray-950 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to{" "}
              <span className="gradient-text">Dominate Social</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Stop spending hours on content research and creation. Let AI do
              the heavy lifting while you focus on growing your business.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="feature-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                <svg
                  className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Trend Research
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                AI continuously scans your niche for trending topics, viral
                formats, and rising conversations — so you're always ahead of
                the curve.
              </p>
            </div>

            <div className="feature-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50">
                <svg
                  className="h-6 w-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                AI Content Generation
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Automatically generate blog posts, images, short videos, and
                viral captions — all tailored to your brand voice and optimized
                for each platform.
              </p>
            </div>

            <div className="feature-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-900/50">
                <svg
                  className="h-6 w-6 text-pink-600 dark:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Smart Scheduling
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                AI optimizes your posting schedule for each platform's peak
                engagement times. Review, approve, and post — or let it auto-publish
                on autopilot.
              </p>
            </div>

            <div className="feature-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                <svg
                  className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Multi-Platform
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Connect Instagram, TikTok, LinkedIn, YouTube, and X. Create once,
                publish everywhere — with content optimized for each platform's
                format and audience.
              </p>
            </div>

            <div className="feature-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
                <svg
                  className="h-6 w-6 text-amber-600 dark:text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Analytics & Insights
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Track engagement, reach, and conversions across all platforms.
                See which content formats and topics drive the best results.
              </p>
            </div>

            <div className="feature-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/50">
                <svg
                  className="h-6 w-6 text-rose-600 dark:text-rose-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Brand Safety
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Every piece of AI-generated content comes with a review queue.
                Approve, edit, or reject before it goes live — you're always in
                control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Three simple steps to consistent, viral-ready content.
            </p>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                1
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Connect Your Accounts
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Link your Instagram, TikTok, LinkedIn, YouTube, and X accounts.
                Tell us your niche and brand voice preferences.
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-2xl font-bold text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                2
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                AI Researches & Creates
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Our AI researches trending topics in your niche, then generates
                blog posts, images, videos, and captions optimized for each
                platform.
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100 text-2xl font-bold text-pink-600 dark:bg-pink-900/50 dark:text-pink-400">
                3
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Review & Schedule
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Review content in your dashboard, approve what you love, and
                schedule it to post at the best times — or let it auto-publish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="border-t border-gray-100 bg-gray-50 px-4 py-20 dark:border-gray-800 dark:bg-gray-950 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple,{" "}
              <span className="gradient-text">Transparent Pricing</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Start free, upgrade as you grow. No hidden fees.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {/* Starter */}
            <div className="feature-card flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Starter
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Perfect for solopreneurs getting started
              </p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  $19
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  /month
                </span>
              </div>
              <ul className="mt-8 flex-1 space-y-4">
                {[
                  "1 social account",
                  "30 posts per month",
                  "AI trend research",
                  "Content calendar",
                  "Basic analytics",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="mt-8 inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Get Started
              </Link>
            </div>

            {/* Pro (Featured) */}
            <div className="relative flex flex-col rounded-2xl border-2 border-indigo-500 bg-white p-8 shadow-xl dark:border-indigo-500 dark:bg-gray-900">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Pro
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                For serious content creators
              </p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  $49
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  /month
                </span>
              </div>
              <ul className="mt-8 flex-1 space-y-4">
                {[
                  "3 social accounts",
                  "100 posts per month",
                  "AI trend research",
                  "Content calendar",
                  "Image generation (DALL-E)",
                  "Video snippets",
                  "Advanced analytics",
                  "Priority support",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="gradient-btn mt-8 inline-flex items-center justify-center !px-6 !py-3 text-sm"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Agency */}
            <div className="feature-card flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Agency
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                For teams and agencies
              </p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  $99
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  /month
                </span>
              </div>
              <ul className="mt-8 flex-1 space-y-4">
                {[
                  "10 social accounts",
                  "Unlimited posts",
                  "AI trend research",
                  "Content calendar",
                  "Image + video generation",
                  "Team collaboration",
                  "White-label options",
                  "Custom analytics reports",
                  "Dedicated account manager",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="mt-8 inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-16 text-center sm:px-16">
            <div
              className="absolute inset-0 -z-10"
              aria-hidden="true"
            >
              <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-white/10 blur-3xl" />
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Transform Your Content Strategy?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-indigo-100">
              Join thousands of creators who save 10+ hours per week with
              TrendCraft. Start your free trial today.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Start Free Trial
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white hover:bg-white/10"
              >
                See How It Works
              </a>
            </div>
            <p className="mt-4 text-sm text-indigo-200">
              No credit card required &middot; 7-day free trial
            </p>
          </div>
        </div>
      </section>
    </>
  );
}