/**
 * VideoScriptGenerator: produces a short-form video script.
 *
 * Output is structured (hook / scenes / voiceover / on-screen text
 * / hashtags / CTA) so the editor (human or future AI editor) can
 * render it directly without re-parsing a blob of text.
 */

import type { LLMClient } from "../llm/client.ts";
import type {
  Platform,
  Trend,
  UserProfile,
  VideoScript,
  VideoFormat,
} from "../types.ts";
import { makeId } from "../util/hash.ts";
import { getLogger } from "../util/log.ts";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    format: { type: "string", enum: ["short", "reel", "tiktok", "youtube_short"] },
    durationSeconds: { type: "number" },
    hook: { type: "string" },
    scenes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          index: { type: "number" },
          visualDescription: { type: "string" },
          onScreenText: { type: "string" },
          voiceover: { type: "string" },
          durationSeconds: { type: "number" },
        },
        required: ["index", "visualDescription", "durationSeconds"],
      },
    },
    voiceoverScript: { type: "string" },
    onScreenText: { type: "array", items: { type: "string" } },
    hashtags: { type: "array", items: { type: "string" } },
    cta: { type: "string" },
    musicMood: { type: "string" },
  },
  required: [
    "format",
    "durationSeconds",
    "hook",
    "scenes",
    "voiceoverScript",
    "onScreenText",
    "hashtags",
    "cta",
  ],
} as const;

export class VideoScriptGenerator {
  constructor(private readonly llm: LLMClient) {}

  async generate(
    trend: Trend,
    profile: UserProfile,
    opts: { format?: VideoFormat; platforms?: Platform[] } = {},
  ): Promise<VideoScript> {
    const format = opts.format ?? pickFormat(opts.platforms ?? profile.targetPlatforms);
    const targetSeconds = format === "youtube_short" ? 45 : 30;
    const out = await this.llm.generateStructured<VideoScript>(
      [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildPrompt(trend, profile, format, targetSeconds) },
      ],
      {
        name: "video_script",
        schema: SCHEMA,
        instructions: `Return a JSON object matching the schema. Target ~${targetSeconds} seconds total.`,
      },
    );
    return {
      id: makeId("vid", trend.id, format),
      format: out.format ?? format,
      durationSeconds: out.durationSeconds ?? targetSeconds,
      hook: out.hook ?? "",
      scenes: (out.scenes ?? []).map((s, i) => ({
        index: s.index ?? i,
        visualDescription: s.visualDescription ?? "",
        onScreenText: s.onScreenText,
        voiceover: s.voiceover,
        durationSeconds: s.durationSeconds ?? Math.round(targetSeconds / Math.max(1, out.scenes?.length ?? 3)),
      })),
      voiceoverScript: out.voiceoverScript ?? "",
      onScreenText: out.onScreenText ?? [],
      hashtags: out.hashtags ?? [],
      cta: out.cta ?? "",
      musicMood: out.musicMood,
    };
  }
}

const SYSTEM = `You write short-form video scripts. Hook in the first 3 seconds, concrete visuals, on-screen text that reinforces (not repeats) the voiceover, and a clear CTA at the end.`;

function buildPrompt(
  trend: Trend,
  profile: UserProfile,
  format: VideoFormat,
  targetSeconds: number,
): string {
  return [
    `Niche: ${profile.niche}`,
    `Business: ${profile.businessDescription}`,
    profile.brandVoice ? `Brand voice: ${profile.brandVoice}` : "",
    `Video format: ${format}`,
    `Target duration: ${targetSeconds} seconds`,
    "",
    `Trend: ${trend.title}`,
    trend.description ? `Context: ${trend.description}` : "",
    "",
    "Write a script with 3-5 scenes. The first scene must be a scroll-stopping hook. End with a CTA. Include 3-5 platform-appropriate hashtags.",
  ]
    .filter(Boolean)
    .join("\n");
}

function pickFormat(platforms: Platform[]): VideoFormat {
  if (platforms.includes("youtube")) return "youtube_short";
  if (platforms.includes("tiktok")) return "tiktok";
  if (platforms.includes("instagram")) return "reel";
  return "reel";
}

// Used to silence unused-import warning if log is unused.
getLogger().debug("video_script:module loaded");
