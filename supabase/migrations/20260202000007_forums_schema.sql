-- Phase 8: Forums
-- Community discussion forums

-- =====================================================
-- FORUM CATEGORIES TABLE
-- =====================================================
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Category details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- Emoji or icon name

  -- Ordering
  display_order INTEGER DEFAULT 0,

  -- Stats
  thread_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FORUM THREADS TABLE
-- =====================================================
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Category
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,

  -- Thread details
  title TEXT NOT NULL,
  slug TEXT NOT NULL,

  -- Author
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Content (first post)
  content TEXT NOT NULL,

  -- Status
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,

  -- Stats
  view_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  vote_score INTEGER DEFAULT 0,

  -- Last activity
  last_post_at TIMESTAMPTZ DEFAULT NOW(),
  last_post_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(category_id, slug)
);

-- =====================================================
-- FORUM POSTS TABLE
-- =====================================================
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Thread
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,

  -- Author
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Content
  content TEXT NOT NULL,

  -- Reply to (for nested replies)
  reply_to_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL,

  -- Stats
  vote_score INTEGER DEFAULT 0,

  -- Moderation
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FORUM VOTES TABLE
-- =====================================================
CREATE TABLE forum_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Vote target (either thread or post)
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,

  -- Vote value
  vote INTEGER CHECK (vote IN (-1, 1)) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure user can only vote once per item
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, post_id),

  -- Ensure vote is for either thread or post, not both
  CHECK (
    (thread_id IS NOT NULL AND post_id IS NULL) OR
    (thread_id IS NULL AND post_id IS NOT NULL)
  )
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Forum Categories
CREATE INDEX idx_forum_categories_slug ON forum_categories(slug);
CREATE INDEX idx_forum_categories_order ON forum_categories(display_order);

-- Forum Threads
CREATE INDEX idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX idx_forum_threads_slug ON forum_threads(slug);
CREATE INDEX idx_forum_threads_last_post ON forum_threads(last_post_at DESC);
CREATE INDEX idx_forum_threads_created ON forum_threads(created_at DESC);
CREATE INDEX idx_forum_threads_pinned ON forum_threads(is_pinned, last_post_at DESC);

-- Forum Posts
CREATE INDEX idx_forum_posts_thread ON forum_posts(thread_id);
CREATE INDEX idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_reply_to ON forum_posts(reply_to_id);
CREATE INDEX idx_forum_posts_created ON forum_posts(created_at);

-- Forum Votes
CREATE INDEX idx_forum_votes_user ON forum_votes(user_id);
CREATE INDEX idx_forum_votes_thread ON forum_votes(thread_id);
CREATE INDEX idx_forum_votes_post ON forum_votes(post_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

-- Forum Categories (public read)
CREATE POLICY "Categories viewable by everyone"
  ON forum_categories FOR SELECT
  USING (TRUE);

-- Forum Threads
CREATE POLICY "Threads viewable by everyone"
  ON forum_threads FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create threads"
  ON forum_threads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

CREATE POLICY "Authors can update their threads"
  ON forum_threads FOR UPDATE
  USING (author_id = auth.uid());

-- Forum Posts
CREATE POLICY "Posts viewable by everyone"
  ON forum_posts FOR SELECT
  USING (is_deleted = FALSE);

CREATE POLICY "Users can create posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

CREATE POLICY "Authors can update their posts"
  ON forum_posts FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Authors can delete their posts"
  ON forum_posts FOR UPDATE
  USING (author_id = auth.uid());

-- Forum Votes
CREATE POLICY "Users can view all votes"
  ON forum_votes FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can manage their own votes"
  ON forum_votes FOR ALL
  USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update thread stats when post is created
CREATE OR REPLACE FUNCTION update_thread_on_post()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_threads
  SET
    post_count = post_count + 1,
    last_post_at = NEW.created_at,
    last_post_by = NEW.author_id
  WHERE id = NEW.thread_id;

  -- Update category stats
  UPDATE forum_categories
  SET post_count = post_count + 1
  WHERE id = (SELECT category_id FROM forum_threads WHERE id = NEW.thread_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_created
  AFTER INSERT ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_on_post();

-- Update category stats when thread is created
CREATE OR REPLACE FUNCTION update_category_on_thread()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_categories
  SET thread_count = thread_count + 1
  WHERE id = NEW.category_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER thread_created
  AFTER INSERT ON forum_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_category_on_thread();

-- Update vote scores
CREATE OR REPLACE FUNCTION update_vote_scores()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.thread_id IS NOT NULL THEN
    -- Update thread vote score
    UPDATE forum_threads
    SET vote_score = (
      SELECT COALESCE(SUM(vote), 0)
      FROM forum_votes
      WHERE thread_id = NEW.thread_id
    )
    WHERE id = NEW.thread_id;
  ELSIF NEW.post_id IS NOT NULL THEN
    -- Update post vote score
    UPDATE forum_posts
    SET vote_score = (
      SELECT COALESCE(SUM(vote), 0)
      FROM forum_votes
      WHERE post_id = NEW.post_id
    )
    WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vote_upserted
  AFTER INSERT OR UPDATE ON forum_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_scores();

-- =====================================================
-- SEED DATA
-- =====================================================

INSERT INTO forum_categories (name, slug, description, icon, display_order) VALUES
  ('General Discussion', 'general', 'General board game discussions', '💬', 1),
  ('Game Recommendations', 'recommendations', 'Looking for game suggestions?', '🎯', 2),
  ('Rules & Strategy', 'rules-strategy', 'Discuss rules and winning strategies', '📚', 3),
  ('Marketplace Discussion', 'marketplace', 'Buying, selling, and trading talk', '💰', 4),
  ('Community Meetups', 'meetups', 'Organize and discuss local meetups', '🤝', 5);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE forum_categories IS 'Forum categories for organizing discussions';
COMMENT ON TABLE forum_threads IS 'Forum discussion threads';
COMMENT ON TABLE forum_posts IS 'Replies in forum threads';
COMMENT ON TABLE forum_votes IS 'Upvotes/downvotes on threads and posts';
