-- TrendCraft — Initial Database Schema
-- Migration 001: Core tables for users, social accounts, content pipeline, and trending topics.
-- Apply via: /api/setup-db (GET)

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL DEFAULT '',
  plan          TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'agency')),
  trial_ends_at TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);

-- ============================================================================
-- 2. SESSIONS (auth session tokens)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_token ON sessions (token);
CREATE INDEX idx_sessions_user_id ON sessions (user_id);

-- ============================================================================
-- 3. SOCIAL ACCOUNTS (connected social media platforms)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'linkedin', 'youtube', 'x')),
  account_name    TEXT NOT NULL,
  account_id      TEXT NOT NULL,
  access_token    TEXT,       -- encrypted OAuth token
  refresh_token   TEXT,       -- encrypted refresh token
  token_expires_at TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

CREATE INDEX idx_social_accounts_user_id ON social_accounts (user_id);

-- ============================================================================
-- 4. TRENDING TOPICS (researched by AI agent)
-- ============================================================================
CREATE TABLE IF NOT EXISTS trending_topics (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  niche            TEXT NOT NULL,
  topic            TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  source           TEXT NOT NULL DEFAULT '',       -- e.g. 'twitter', 'google_trends', 'reddit'
  popularity_score INTEGER NOT NULL DEFAULT 0,
  researched_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trending_topics_user_id ON trending_topics (user_id);
CREATE INDEX idx_trending_topics_niche ON trending_topics (niche);

-- ============================================================================
-- 5. CONTENT QUEUE (items awaiting review/approval)
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_queue (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source           TEXT NOT NULL DEFAULT 'ai_generated' CHECK (source IN ('ai_generated', 'manual')),
  content_type     TEXT NOT NULL CHECK (content_type IN ('blog', 'image', 'video', 'mixed')),
  title            TEXT NOT NULL DEFAULT '',
  body             TEXT NOT NULL DEFAULT '',        -- blog text / description
  media_url        TEXT NOT NULL DEFAULT '',        -- URL to generated image/video
  caption          TEXT NOT NULL DEFAULT '',        -- platform caption
  status           TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected')),
  trending_topic_id UUID REFERENCES trending_topics(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_queue_user_id ON content_queue (user_id);
CREATE INDEX idx_content_queue_status ON content_queue (status);

-- ============================================================================
-- 6. CONTENT APPROVALS (approval/rejection tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_approvals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_queue_id UUID NOT NULL REFERENCES content_queue(id) ON DELETE CASCADE,
  status          TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
  feedback        TEXT NOT NULL DEFAULT '',
  reviewed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(content_queue_id)   -- one approval decision per queue item
);

CREATE INDEX idx_content_approvals_user_id ON content_approvals (user_id);

-- ============================================================================
-- 7. SCHEDULED POSTS (content scheduled for publishing to social platforms)
-- ============================================================================
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  content_queue_id  UUID REFERENCES content_queue(id) ON DELETE SET NULL,
  content_type      TEXT NOT NULL CHECK (content_type IN ('blog', 'image', 'video', 'mixed')),
  title             TEXT NOT NULL DEFAULT '',
  body              TEXT NOT NULL DEFAULT '',
  media_url         TEXT NOT NULL DEFAULT '',
  caption           TEXT NOT NULL DEFAULT '',
  scheduled_at      TIMESTAMPTZ NOT NULL,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed')),
  published_at      TIMESTAMPTZ,
  platform_post_id  TEXT NOT NULL DEFAULT '',       -- ID returned by the social platform
  error_message     TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_posts_user_id ON scheduled_posts (user_id);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts (status);
CREATE INDEX idx_scheduled_posts_scheduled_at ON scheduled_posts (scheduled_at);
CREATE INDEX idx_scheduled_posts_social_account_id ON scheduled_posts (social_account_id);

-- ============================================================================
-- 8. ANALYTICS EVENTS (for KPI tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,   -- e.g. 'post_scheduled', 'post_published', 'signup', 'login', 'trial_started', 'subscription_changed'
  metadata   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events (user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events (event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events (created_at);

-- ============================================================================
-- Helper: updated_at trigger
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables with an updated_at column
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['users', 'social_accounts', 'content_queue', 'scheduled_posts'])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      tbl, tbl
    );
  END LOOP;
END;
$$;