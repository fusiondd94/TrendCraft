/**
 * Mock image generator that returns a stylized SVG data URI.
 *
 * Lets the whole pipeline run offline and in tests without ever
 * touching a real image API. The output is a real, viewable image
 * (a gradient + headline text), not a placeholder gray box.
 */

import type {
  ImageGeneratorClient,
  ImageGenRequest,
  ImageGenResult,
} from "./client.ts";
import { FORMAT_DIMENSIONS } from "./client.ts";
import { createHash } from "node:crypto";

export class MockImageClient implements ImageGeneratorClient {
  readonly provider = "mock";
  readonly defaultModel = "mock-svg-1";

  async generate(req: ImageGenRequest): Promise<ImageGenResult> {
    const { w, h } = FORMAT_DIMENSIONS[req.format];
    const seed = createHash("md5")
      .update(req.prompt + (req.seed ?? ""))
      .digest("hex");
    const hue = parseInt(seed.slice(0, 2), 16) * 1.4; // 0..~360
    const accent = `hsl(${Math.floor(hue)}, 70%, 55%)`;
    const bg = `hsl(${(Math.floor(hue) + 200) % 360}, 35%, 18%)`;
    const headline = (req.prompt.split(/[.!?\n]/)[0] ?? "trendcraft").slice(0, 60);
    const safe = escapeXml(headline);
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="hsl(${(Math.floor(hue) + 30) % 360}, 45%, 28%)"/>
    </linearGradient>
    <radialGradient id="r" cx="30%" cy="20%" r="60%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#r)"/>
  <g font-family="ui-sans-serif, -apple-system, system-ui, sans-serif" fill="white">
    <text x="${w * 0.08}" y="${h * 0.18}" font-size="${Math.round(w * 0.06)}" font-weight="700" letter-spacing="0.02em">TRENDCRAFT</text>
    <text x="${w * 0.08}" y="${h * 0.55}" font-size="${Math.round(w * 0.07)}" font-weight="800">${safe}</text>
    <text x="${w * 0.08}" y="${h * 0.62}" font-size="${Math.round(w * 0.028)}" opacity="0.7">${escapeXml((req.style ?? "mock image").slice(0, 80))}</text>
  </g>
  <circle cx="${w * 0.85}" cy="${h * 0.2}" r="${w * 0.08}" fill="${accent}" opacity="0.85"/>
</svg>`;
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    return {
      imageUrl: dataUri,
      imageBase64: Buffer.from(svg).toString("base64"),
      mimeType: "image/svg+xml",
      width: w,
      height: h,
      provider: this.provider,
      model: this.defaultModel,
      providerRef: seed.slice(0, 12),
    };
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
