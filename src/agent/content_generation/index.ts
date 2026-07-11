/**
 * ContentGenerator: top-level entry for content production.
 *
 *   const gen = new ContentGenerator({ llm, image });
 *   const pack = await gen.generateContentPack(trend, profile);
 *
 * Generates blog post, image, video script, and platform captions
 * for a single trend. Each piece is independent — failures in
 * one piece don't fail the others, they're collected as warnings
 * the caller can surface.
 */

import type { LLMClient } from "../llm/client.ts";
import type { ImageGeneratorClient } from "../image/client.ts";
import type {
  ContentPack,
  ContentScore,
  Trend,
  UserProfile,
} from "../types.ts";
import { BlogPostGenerator } from "./blog_post.ts";
import { ImageContentGenerator } from "./image_content.ts";
import { VideoScriptGenerator } from "./video_script.ts";
import { CaptionGenerator } from "./caption.ts";
import { makeId } from "../util/hash.ts";
import { getLogger } from "../util/log.ts";
import { scoreContentPack } from "../scoring/content_scorer.ts";

export interface ContentGeneratorDeps {
  llm: LLMClient;
  image: ImageGeneratorClient;
  blogPostGenerator?: BlogPostGenerator;
  imageContentGenerator?: ImageContentGenerator;
  videoScriptGenerator?: VideoScriptGenerator;
  captionGenerator?: CaptionGenerator;
  scoreContent?: (pack: PartialContentPack, profile: UserProfile) => Promise<ContentScore>;
}

export interface PartialContentPack {
  trend: Trend;
  blogPost?: ContentPack["blogPost"];
  image?: ContentPack["image"];
  videoScript?: ContentPack["videoScript"];
  captions: ContentPack["captions"];
}

export interface ContentGenOptions {
  generate?: {
    blogPost?: boolean;
    image?: boolean;
    videoScript?: boolean;
    captions?: boolean;
  };
}

export class ContentGenerator {
  private readonly llm: LLMClient;
  private readonly image: ImageGeneratorClient;
  private readonly blogPostGen: BlogPostGenerator;
  private readonly imageGen: ImageContentGenerator;
  private readonly videoGen: VideoScriptGenerator;
  private readonly captionGen: CaptionGenerator;
  private readonly scoreFn: (pack: PartialContentPack, profile: UserProfile) => Promise<ContentScore>;

  constructor(deps: ContentGeneratorDeps) {
    this.llm = deps.llm;
    this.image = deps.image;
    this.blogPostGen = deps.blogPostGenerator ?? new BlogPostGenerator(this.llm);
    this.imageGen = deps.imageContentGenerator ?? new ImageContentGenerator(this.llm, this.image);
    this.videoGen = deps.videoScriptGenerator ?? new VideoScriptGenerator(this.llm);
    this.captionGen = deps.captionGenerator ?? new CaptionGenerator(this.llm);
    this.scoreFn = deps.scoreContent ?? ((p, profile) => scoreContentPack(this.llm, p, profile));
  }

  async generateContentPack(
    trend: Trend,
    profile: UserProfile,
    options: ContentGenOptions = {},
  ): Promise<ContentPack> {
    const log = getLogger();
    const want = {
      blogPost: options.generate?.blogPost ?? true,
      image: options.generate?.image ?? true,
      videoScript: options.generate?.videoScript ?? true,
      captions: options.generate?.captions ?? true,
    };
    const warnings: string[] = [];
    const partial: PartialContentPack = {
      trend,
      captions: [],
    };

    // Blog post + video script + image are independent. Run in parallel.
    const tasks: Array<Promise<void>> = [];
    if (want.blogPost) {
      tasks.push(
        this.blogPostGen.generate(trend, profile).then(
          (bp) => {
            partial.blogPost = bp;
          },
          (err) => {
            warnings.push(`blog_post failed: ${(err as Error).message}`);
            log.warn("content_gen: blog_post failed", err);
          },
        ),
      );
    }
    if (want.videoScript) {
      tasks.push(
        this.videoGen.generate(trend, profile, { platforms: profile.targetPlatforms }).then(
          (vs) => {
            partial.videoScript = vs;
          },
          (err) => {
            warnings.push(`video_script failed: ${(err as Error).message}`);
            log.warn("content_gen: video_script failed", err);
          },
        ),
      );
    }
    if (want.image) {
      tasks.push(
        this.imageGen.generate(trend, profile, "landscape").then(
          (img) => {
            partial.image = img;
          },
          (err) => {
            warnings.push(`image failed: ${(err as Error).message}`);
            log.warn("content_gen: image failed", err);
          },
        ),
      );
    }
    if (want.captions) {
      tasks.push(
        this.captionGen.generate(trend, profile).then(
          (caps) => {
            partial.captions = caps;
          },
          (err) => {
            warnings.push(`captions failed: ${(err as Error).message}`);
            log.warn("content_gen: captions failed", err);
          },
        ),
      );
    }
    await Promise.all(tasks);

    // Score the assembled pack.
    const score = await this.scoreFn(partial, profile).catch((err) => {
      warnings.push(`scoring failed: ${(err as Error).message}`);
      return {
        overallScore: 0.5,
        qualityScore: 0.5,
        viralityScore: 0.5,
        brandFitScore: 0.5,
        reasoning: "scoring failed; using neutral default",
      };
    });

    return {
      id: makeId("pack", trend.id),
      trend,
      blogPost: partial.blogPost,
      image: partial.image,
      videoScript: partial.videoScript,
      captions: partial.captions,
      score,
      createdAt: new Date().toISOString(),
      modelVersions: {
        llm: this.llm.defaultJsonModel,
        image: this.image.defaultModel,
      },
    };
  }
}
