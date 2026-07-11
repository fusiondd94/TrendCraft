import type { ContentPack } from "~/agent";

export const mockContentPacks: ContentPack[] = [
  {
    id: "cp-001",
    trend: {
      id: "trend-001",
      title: "AI Tools Are Replacing Entire Marketing Teams",
      description: "A growing discussion on Hacker News about how AI-powered marketing tools are enabling small teams to produce enterprise-level content output, replacing what used to require entire departments.",
      canonicalUrl: "https://news.ycombinator.com/item?id=12345",
      source: {
        name: "hackernews",
        url: "https://news.ycombinator.com/item?id=12345",
        rawEngagement: 342,
      },
      discoveredAt: "2026-07-08T12:00:00Z",
      publishedAt: "2026-07-08T10:30:00Z",
      keywords: ["AI marketing", "small teams", "enterprise content", "automation"],
      topics: ["AI", "Marketing", "Startups", "SaaS"],
      rawEngagement: 342,
      relevanceScore: 0.92,
      viralityScore: 0.85,
      freshnessScore: 0.95,
      compositeScore: 0.91,
      reasoning: "Highly relevant to SaaS marketing niche with strong engagement signals",
    },
    blogPost: {
      id: "bp-001",
      title: "How AI Marketing Tools Are Leveling the Playing Field for Small Teams",
      body: `# How AI Marketing Tools Are Leveling the Playing Field for Small Teams

The marketing landscape is undergoing a seismic shift. What once required a team of ten can now be accomplished by a single founder with the right AI tools.

## The New Reality

Gone are the days when enterprise-level content marketing required massive budgets and headcount. Today's AI-powered tools are democratizing access to high-quality content production.

## Key Changes

1. **Content Research** — AI agents now scan thousands of sources to find trending topics relevant to your niche, a task that previously required dedicated research teams.

2. **Content Creation** — From blog posts to social media captions, AI can generate on-brand content in minutes rather than days.

3. **Distribution** — Smart scheduling tools optimize posting times across platforms, ensuring maximum reach without manual intervention.

## The Bottom Line

Small teams that embrace AI marketing tools aren't just surviving — they're thriving. The barrier to entry for professional-grade content marketing has never been lower.

*Ready to transform your content strategy? Start with one platform and one AI tool, then scale from there.*`,
      excerpt: "Discover how AI-powered marketing tools are enabling small teams to produce enterprise-level content output without the enterprise-sized budget.",
      wordCount: 245,
      seoKeywords: ["AI marketing tools", "small team marketing", "content automation", "enterprise content"],
      readingTimeMinutes: 2,
    },
    image: {
      id: "img-001",
      prompt: "A small team of diverse professionals using AI interfaces to create marketing content, futuristic but warm office setting, vibrant colors",
      format: "landscape",
      width: 1200,
      height: 630,
      style: "vibrant editorial photo",
      altText: "Small marketing team using AI tools to create content",
    },
    videoScript: {
      id: "vs-001",
      format: "short",
      durationSeconds: 30,
      hook: "What if I told you a team of ONE can now do the work of TEN marketers?",
      scenes: [
        {
          index: 0,
          visualDescription: "Split screen showing a large team vs one person with AI tools",
          onScreenText: "Team of 10 → Team of 1",
          voiceover: "The marketing world has changed forever.",
          durationSeconds: 5,
        },
        {
          index: 1,
          visualDescription: "Montage of AI tools generating content rapidly",
          onScreenText: "AI-Powered Content",
          voiceover: "AI tools now handle research, writing, and scheduling.",
          durationSeconds: 10,
        },
        {
          index: 2,
          visualDescription: "Graph showing engagement growth for small teams using AI",
          onScreenText: "300% Growth",
          voiceover: "And the results speak for themselves.",
          durationSeconds: 8,
        },
        {
          index: 3,
          visualDescription: "Call to action screen with TrendCraft logo",
          onScreenText: "Start Your Free Trial",
          voiceover: "Don't get left behind. Try TrendCraft today.",
          durationSeconds: 7,
        },
      ],
      voiceoverScript: "The marketing world has changed forever. AI tools now handle research, writing, and scheduling. And the results speak for themselves. Don't get left behind. Try TrendCraft today.",
      onScreenText: ["Team of 10 → Team of 1", "AI-Powered Content", "300% Growth", "Start Your Free Trial"],
      hashtags: ["#AIMarketing", "#ContentStrategy", "#SmallTeamBigImpact"],
      cta: "Sign up for TrendCraft free trial",
      musicMood: "upbeat, motivational",
    },
    captions: [
      {
        id: "cap-001",
        platform: "linkedin",
        text: "The marketing landscape has changed. 📊\n\nWhat used to require a team of ten can now be accomplished by a single founder with the right AI tools.\n\nHere's what's different:\n• AI research agents scan thousands of sources\n• Content generation happens in minutes\n• Smart scheduling optimizes posting times\n\nSmall teams aren't just surviving — they're thriving.\n\n#AIMarketing #ContentStrategy #SmallTeamBigImpact",
        hook: "What used to require a team of ten can now be accomplished by a single founder.",
        hashtags: ["#AIMarketing", "#ContentStrategy", "#SmallTeamBigImpact"],
        emojis: ["📊", "🚀", "💡"],
        cta: "Follow for more AI marketing insights",
        characterCount: 420,
      },
      {
        id: "cap-002",
        platform: "instagram",
        text: "AI is changing the game for small teams 🚀\n\nOne person + AI tools = enterprise-level content. Swipe to see how 👆",
        hook: "AI is changing the game for small teams 🚀",
        hashtags: ["#AIMarketing", "#ContentCreation", "#SmallBizTips"],
        emojis: ["🚀", "💡", "⚡"],
        cta: "Check bio for link",
        characterCount: 145,
      },
      {
        id: "cap-003",
        platform: "x",
        text: "Hot take: AI marketing tools aren't replacing marketers — they're replacing the *need* for a huge team.\n\nOne founder + AI = enterprise-level content output.\n\nThe teams that get this will win. 🧵",
        hook: "AI marketing tools aren't replacing marketers — they're replacing the need for a huge team.",
        hashtags: ["#AI", "#Marketing", "#Startups"],
        emojis: ["🔥", "🧵"],
        cta: "Share your thoughts",
        characterCount: 210,
      },
    ],
    score: {
      overallScore: 0.88,
      qualityScore: 0.85,
      viralityScore: 0.91,
      brandFitScore: 0.87,
      reasoning: "Strong trend alignment with SaaS audience. High virality potential due to controversial framing. Excellent brand fit for TrendCraft's positioning.",
    },
    createdAt: "2026-07-08T12:30:00Z",
    modelVersions: {
      llm: "gpt-4o",
      image: "dall-e-3",
    },
  },
  {
    id: "cp-002",
    trend: {
      id: "trend-002",
      title: "The Rise of Short-Form Video for B2B Marketing",
      description: "A Reddit discussion in r/marketing about how B2B companies are seeing unprecedented engagement from short-form video content on LinkedIn and TikTok.",
      canonicalUrl: "https://reddit.com/r/marketing/comments/abc123",
      source: {
        name: "reddit",
        url: "https://reddit.com/r/marketing/comments/abc123",
        rawEngagement: 567,
      },
      discoveredAt: "2026-07-08T08:00:00Z",
      keywords: ["B2B video", "short-form content", "LinkedIn video", "TikTok B2B"],
      topics: ["B2B Marketing", "Video", "Social Media", "Content Strategy"],
      relevanceScore: 0.89,
      viralityScore: 0.78,
      freshnessScore: 0.92,
      compositeScore: 0.86,
      reasoning: "Growing trend in B2B space with strong engagement on Reddit",
    },
    blogPost: {
      id: "bp-002",
      title: "Why B2B Companies Are Betting Big on Short-Form Video",
      body: `# Why B2B Companies Are Betting Big on Short-Form Video

Short-form video isn't just for dance challenges and cat videos anymore. B2B companies are discovering that 30-second videos can generate more engagement than 500-word blog posts.

## The Data Doesn't Lie

According to recent studies, B2B decision-makers spend 2x more time watching short-form video content than reading long-form articles.

## What's Working

- **Behind-the-scenes** — Showing the human side of your business
- **Quick tips** — 30-second actionable advice
- **Product demos** — Short, focused feature highlights
- **Thought leadership** — Executive perspectives in bite-sized format

## Platform-Specific Strategies

LinkedIn video posts get 3x more engagement than text-only posts. TikTok's B2B content is growing 40% year over year.`,
      excerpt: "B2B companies are discovering that 30-second videos can generate more engagement than 500-word blog posts. Here's what's working.",
      wordCount: 180,
      seoKeywords: ["B2B video marketing", "short-form video", "LinkedIn video", "TikTok for business"],
      readingTimeMinutes: 1,
    },
    videoScript: {
      id: "vs-002",
      format: "tiktok",
      durationSeconds: 25,
      hook: "B2B marketing is boring. Here's how to fix it.",
      scenes: [
        {
          index: 0,
          visualDescription: "Person talking to camera, looking frustrated",
          voiceover: "B2B marketing doesn't have to be boring.",
          durationSeconds: 3,
        },
        {
          index: 1,
          visualDescription: "Split screen showing boring text post vs engaging video",
          onScreenText: "Video gets 3x more engagement",
          voiceover: "Short-form video is changing the game for B2B.",
          durationSeconds: 8,
        },
        {
          index: 2,
          visualDescription: "Quick cuts of B2B video examples: behind-the-scenes, tips, demos",
          voiceover: "Behind-the-scenes, quick tips, product demos — these work.",
          durationSeconds: 10,
        },
        {
          index: 3,
          visualDescription: "Call to action with TrendCraft",
          onScreenText: "Create B2B videos in minutes",
          voiceover: "Let AI help you create videos that actually get views.",
          durationSeconds: 4,
        },
      ],
      voiceoverScript: "B2B marketing doesn't have to be boring. Short-form video is changing the game for B2B. Behind-the-scenes, quick tips, product demos — these work. Let AI help you create videos that actually get views.",
      onScreenText: ["Video gets 3x more engagement", "Create B2B videos in minutes"],
      hashtags: ["#B2BMarketing", "#VideoMarketing", "#ShortFormContent"],
      cta: "Try TrendCraft for free",
      musicMood: "energetic, modern",
    },
    captions: [
      {
        id: "cap-004",
        platform: "linkedin",
        text: "Short-form video is the B2B marketing channel you're ignoring. 🎥\n\nB2B decision-makers spend 2x more time watching short-form video than reading long-form articles.\n\nWhat's working right now:\n• Behind-the-scenes content\n• Quick actionable tips\n• Short product demos\n\nLinkedIn video gets 3x more engagement than text posts. It's time to start filming.",
        hook: "Short-form video is the B2B marketing channel you're ignoring.",
        hashtags: ["#B2BMarketing", "#VideoMarketing", "#LinkedInTips"],
        emojis: ["🎥", "📈", "💡"],
        cta: "Follow for more B2B marketing insights",
        characterCount: 390,
      },
      {
        id: "cap-005",
        platform: "tiktok",
        text: "POV: You're a B2B marketer who finally tried short-form video 📈\n\nSwipe for the strategy that actually works 👆",
        hook: "POV: You're a B2B marketer who finally tried short-form video",
        hashtags: ["#B2B", "#MarketingTips", "#VideoStrategy"],
        emojis: ["📈", "🎯", "💼"],
        cta: "Link in bio",
        characterCount: 110,
      },
    ],
    score: {
      overallScore: 0.82,
      qualityScore: 0.80,
      viralityScore: 0.85,
      brandFitScore: 0.79,
      reasoning: "Strong trend with good B2B focus. Video content has high engagement potential. Slightly lower brand fit as TrendCraft's core value proposition is broader.",
    },
    createdAt: "2026-07-08T09:00:00Z",
    modelVersions: {
      llm: "gpt-4o",
      image: "dall-e-3",
    },
  },
];