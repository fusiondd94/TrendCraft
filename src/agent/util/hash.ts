/**
 * Small helper utilities used across the agent.
 */

import { createHash } from "node:crypto";

/** Deterministic, short, URL-safe id from arbitrary inputs. */
export function makeId(...parts: Array<string | number | undefined | null>): string {
  const joined = parts
    .filter((p) => p !== undefined && p !== null && p !== "")
    .map((p) => String(p).trim().toLowerCase())
    .join("|");
  return createHash("sha1").update(joined).digest("hex").slice(0, 16);
}

/** Truncate text to N chars at a word boundary, appending ellipsis. */
export function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

/** Estimate reading time in minutes from a word count. */
export function readingTimeMinutes(words: number): number {
  return Math.max(1, Math.round(words / 220));
}

/** Word count of a markdown-ish string. */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Crude platform-specific character limit for caption text. */
export const PLATFORM_CAPTION_LIMITS: Record<string, number> = {
  instagram: 2200,
  tiktok: 2200,
  linkedin: 3000,
  youtube: 5000, // description
  x: 280, // post body; threads can be chained but base unit is 280
};

export function clampCaption(text: string, platform: string): string {
  const limit = PLATFORM_CAPTION_LIMITS[platform] ?? 2200;
  if (text.length <= limit) return text;
  return truncate(text, limit);
}
