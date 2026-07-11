import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { isAuthenticated, getCurrentUser, logout } from "~/lib/auth-client";
import type { User } from "~/lib/auth-client";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
  loader: async () => {
    if (typeof window !== "undefined") {
      return { user: await getCurrentUser() };
    }
    return { user: null };
  },
});

function SettingsPage() {
  const { user: initialUser } = Route.useLoaderData();
  const [user, setUser] = useState<User | null>(initialUser);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your account and preferences
        </p>

        {/* Profile section */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Profile
          </h2>
          {user ? (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {user.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {user.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Member since
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Not logged in.
            </p>
          )}
        </div>

        {/* Preferences section */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Preferences
          </h2>
          <div className="mt-4 space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email notifications
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dark mode
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700"
              />
            </label>
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-6 rounded-2xl border border-red-100 bg-white p-6 dark:border-red-900/50 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Sign Out
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sign out of your account on this device.
          </p>
          <button
            onClick={handleLogout}
            className="mt-4 inline-flex items-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}