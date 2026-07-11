import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { mockContentPacks } from "~/lib/mock-content";
import type { ContentPack } from "../../../agent/src/types";

export const Route = createFileRoute("/dashboard/content")({
  component: ContentQueuePage,
});

type FilterStatus = "pending" | "approved" | "rejected" | "all";

function ContentQueuePage() {
  const [packs, setPacks] = useState(mockContentPacks);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [statuses, setStatuses] = useState<Record<string, FilterStatus>>({});

  const filteredPacks = packs.filter((p) => {
    if (filter === "all") return true;
    return (statuses[p.id] || "pending") === filter;
  });

  const handleApprove = (id: string) => {
    setStatuses((prev) => ({ ...prev, [id]: "approved" }));
  };

  const handleReject = (id: string) => {
    setStatuses((prev) => ({ ...prev, [id]: "rejected" }));
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Content Queue
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Review and approve AI-generated content before it goes live
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredPacks.length} items
            </span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mt-6 flex gap-2 border-b border-gray-200 dark:border-gray-800">
          {(["all", "pending", "approved", "rejected"] as FilterStatus[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  filter === f
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ),
          )}
        </div>

        {/* Content cards */}
        <div className="mt-6 space-y-6">
          {filteredPacks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                No {filter !== "all" ? filter : ""} content items to review.
              </p>
            </div>
          )}

          {filteredPacks.map((pack) => (
            <ContentCard
              key={pack.id}
              pack={pack}
              status={statuses[pack.id] || "pending"}
              isExpanded={expandedId === pack.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === pack.id ? null : pack.id)
              }
              onApprove={() => handleApprove(pack.id)}
              onReject={() => handleReject(pack.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentCard({
  pack,
  status,
  isExpanded,
  onToggleExpand,
  onApprove,
  onReject,
}: {
  pack: ContentPack;
  status: FilterStatus;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const statusColors: Record<string, string> = {
    pending: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400",
    approved: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400",
    rejected: "text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Card header */}
      <div className="border-b border-gray-50 p-5 dark:border-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {pack.trend.title}
              </h3>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-medium ${statusColors[status]}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {pack.trend.description}
            </p>
          </div>
          <button
            onClick={onToggleExpand}
            className="flex-shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg
              className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
          </button>
        </div>

        {/* Score bar */}
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Score
            </span>
            <div className="flex h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: `${Math.round(pack.score.overallScore * 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {Math.round(pack.score.overallScore * 100)}%
            </span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {pack.trend.source.name}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(pack.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-gray-50 p-5 dark:border-gray-800">
          <div className="space-y-6">
            {/* Blog Post */}
            {pack.blogPost && (
              <Section title="Blog Post">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {pack.blogPost.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {pack.blogPost.excerpt}
                  </p>
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    {pack.blogPost.wordCount} words · {pack.blogPost.readingTimeMinutes} min read
                  </p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                      Preview full body
                    </summary>
                    <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {pack.blogPost.body.split("\n").map((line, i) => (
                          <p key={i} className="mb-1">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>
              </Section>
            )}

            {/* Image */}
            {pack.image && (
              <Section title="Image">
                <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 dark:from-indigo-950 dark:to-purple-950 dark:text-indigo-400">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {pack.image.format} · {pack.image.width}x{pack.image.height}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {pack.image.altText}
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Style: {pack.image.style}
                    </p>
                  </div>
                </div>
              </Section>
            )}

            {/* Video Script */}
            {pack.videoScript && (
              <Section title="Video Script">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                      {pack.videoScript.format}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {pack.videoScript.durationSeconds}s
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    Hook: "{pack.videoScript.hook}"
                  </p>
                  <div className="mt-2 space-y-2">
                    {pack.videoScript.scenes.map((scene) => (
                      <div
                        key={scene.index}
                        className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
                      >
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                          {scene.index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {scene.visualDescription}
                          </p>
                          {scene.onScreenText && (
                            <p className="mt-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                              Text: {scene.onScreenText}
                            </p>
                          )}
                          {scene.voiceover && (
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 italic">
                              "{scene.voiceover}"
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-gray-400">
                            {scene.durationSeconds}s
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">CTA:</span> {pack.videoScript.cta}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Music: {pack.videoScript.musicMood}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {pack.videoScript.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {/* Platform Captions */}
            {pack.captions.length > 0 && (
              <Section title="Platform Captions">
                <div className="space-y-3">
                  {pack.captions.map((caption) => (
                    <div
                      key={caption.id}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                          {caption.platform}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {caption.characterCount} chars
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {caption.hook}
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                        {caption.text}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {caption.emojis.map((emoji, i) => (
                          <span key={i} className="text-sm">
                            {emoji}
                          </span>
                        ))}
                        {caption.hashtags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {caption.cta && (
                        <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                          CTA: {caption.cta}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Score Details */}
            <Section title="Content Score">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Overall", value: pack.score.overallScore, color: "bg-indigo-500" },
                  { label: "Quality", value: pack.score.qualityScore, color: "bg-emerald-500" },
                  { label: "Virality", value: pack.score.viralityScore, color: "bg-purple-500" },
                  { label: "Brand Fit", value: pack.score.brandFitScore, color: "bg-amber-500" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {s.label}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`h-full rounded-full ${s.color} transition-all`}
                          style={{ width: `${Math.round(s.value * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {Math.round(s.value * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                {pack.score.reasoning}
              </p>
            </Section>
          </div>
        </div>
      )}

      {/* Actions bar */}
      <div className="flex items-center justify-between border-t border-gray-50 px-5 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2">
          {pack.trend.keywords.slice(0, 3).map((kw) => (
            <span
              key={kw}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            >
              {kw}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {status === "pending" && (
            <>
              <button
                onClick={onReject}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
              <button
                onClick={onApprove}
                className="gradient-btn inline-flex items-center gap-1.5 !px-3 !py-1.5 text-xs"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Approve
              </button>
            </>
          )}
          {status === "approved" && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              ✓ Approved
            </span>
          )}
          {status === "rejected" && (
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              ✗ Rejected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
        {title}
      </h4>
      {children}
    </div>
  );
}