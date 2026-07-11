import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { mockContentPacks } from "~/lib/mock-content";

export const Route = createFileRoute("/dashboard/calendar")({
  component: CalendarPage,
});

interface CalendarPost {
  id: string;
  title: string;
  platform: string;
  date: Date;
  status: "approved" | "pending" | "draft" | "published";
  packId: string;
}

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  return { firstDay, lastDay, startPad, daysInMonth };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500",
  tiktok: "bg-blue-500",
  linkedin: "bg-blue-700",
  youtube: "bg-red-500",
  x: "bg-gray-800 dark:bg-gray-200",
};

function CalendarPage() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  const { startPad, daysInMonth } = getMonthData(currentYear, currentMonth);

  // Build calendar posts from mock data
  const posts: CalendarPost[] = mockContentPacks.flatMap((pack) => {
    const createdDate = new Date(pack.createdAt);
    const items: CalendarPost[] = [];

    // Add a post for each caption platform
    pack.captions.forEach((cap) => {
      items.push({
        id: cap.id,
        title: pack.blogPost?.title || pack.trend.title,
        platform: cap.platform,
        date: createdDate,
        status: "approved",
        packId: pack.id,
      });
    });

    // Add a post for the day after (simulating scheduled posts)
    const nextDay = new Date(createdDate);
    nextDay.setDate(nextDay.getDate() + 1);
    pack.captions.forEach((cap) => {
      items.push({
        id: `${cap.id}-scheduled`,
        title: pack.blogPost?.title || pack.trend.title,
        platform: cap.platform,
        date: nextDay,
        status: "pending",
        packId: pack.id,
      });
    });

    return items;
  });

  // Filter posts for the current month
  const postsThisMonth = posts.filter((p) => {
    return (
      p.date.getMonth() === currentMonth &&
      p.date.getFullYear() === currentYear
    );
  });

  const postsByDay: Record<number, CalendarPost[]> = {};
  postsThisMonth.forEach((p) => {
    const day = p.date.getDate();
    if (!postsByDay[day]) postsByDay[day] = [];
    postsByDay[day].push(p);
  });

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Content Calendar
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              View scheduled posts by month
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Today
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {postsThisMonth.length} posts
            </span>
          </div>
        </div>

        {/* Calendar navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Previous
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={nextMonth}
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Next
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="mt-6 grid grid-cols-7 gap-px rounded-t-xl border border-gray-200 bg-gray-200 dark:border-gray-700 dark:bg-gray-700">
          {DAYS.map((day) => (
            <div
              key={day}
              className="bg-gray-50 px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:bg-gray-900 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px border-x border-b border-gray-200 bg-gray-200 dark:border-gray-700 dark:bg-gray-700">
          {/* Empty cells for padding */}
          {Array.from({ length: startPad }).map((_, i) => (
            <div
              key={`pad-${i}`}
              className="min-h-[100px] bg-white p-2 dark:bg-gray-950"
            />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPosts = postsByDay[day] || [];
            return (
              <div
                key={day}
                className={`min-h-[100px] bg-white p-2 dark:bg-gray-950 ${
                  isToday(day)
                    ? "ring-2 ring-inset ring-indigo-500"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      isToday(day)
                        ? "flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {day}
                  </span>
                  {dayPosts.length > 0 && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {dayPosts.length}
                    </span>
                  )}
                </div>
                <div className="mt-1 space-y-1">
                  {dayPosts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="group relative cursor-pointer rounded-md px-1.5 py-1 text-[10px] leading-tight hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                            PLATFORM_COLORS[post.platform] || "bg-gray-400"
                          }`}
                        />
                        <span className="truncate font-medium text-gray-900 dark:text-gray-100">
                          {post.title.length > 20
                            ? post.title.slice(0, 20) + "…"
                            : post.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{post.platform}</span>
                        <span>·</span>
                        <span
                          className={`font-medium ${
                            post.status === "approved"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : post.status === "pending"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <p className="px-1.5 text-[10px] text-indigo-600 dark:text-indigo-400">
                      +{dayPosts.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">Platforms:</span>
          {Object.entries(PLATFORM_COLORS).map(([platform, color]) => (
            <span key={platform} className="flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
              <span className="capitalize">{platform}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}