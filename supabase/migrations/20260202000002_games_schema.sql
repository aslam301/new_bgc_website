-- Phase 3: Games and Community Collections
-- BGG-independent game database with community collection tracking

-- =====================================================
-- GAMES TABLE (Master Database)
-- =====================================================
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bgg_id INT UNIQUE, -- null for non-BGG games

  -- Basic info
  name TEXT NOT NULL,
  year_published INT,
  image_url TEXT,
  thumbnail_url TEXT,
  description TEXT,

  -- Gameplay
  min_players INT,
  max_players INT,
  playtime_min INT, -- minutes
  playtime_max INT, -- minutes
  recommended_age INT,

  -- Complexity
  complexity DECIMAL(3,2), -- 1.00 to 5.00
  avg_weight DECIMAL(3,2), -- BGG weight rating

  -- BGG stats
  bgg_rating DECIMAL(4,2),
  bgg_num_ratings INT,
  bgg_rank INT,

  -- Categorization (using TEXT ARRAY for PostgreSQL)
  categories TEXT[], -- Array of category names
  mechanics TEXT[], -- Array of mechanic names
  designers TEXT[], -- Array of designer names
  publishers TEXT[], -- Array of publisher names

  -- BGG sync
  synced_from_bgg BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMPTZ,
  raw_bgg_data JSONB, -- Store raw data for debugging

  -- Approval workflow
  is_approved BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMUNITY GAMES TABLE (Collections)
-- =====================================================
CREATE TABLE community_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  -- Status
  status TEXT CHECK (status IN ('own', 'wishlist', 'played', 'want_to_play')) DEFAULT 'own',

  -- Details
  notes TEXT,
  condition TEXT CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')),
  times_played INT DEFAULT 0,
  acquisition_date DATE,

  -- Metadata
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(community_id, game_id)
);

-- =====================================================
-- BGG SYNC JOBS TABLE
-- =====================================================
CREATE TABLE bgg_sync_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  bgg_username TEXT NOT NULL,

  -- Status
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',

  -- Progress
  total_games INT DEFAULT 0,
  processed_games INT DEFAULT 0,
  new_games_added INT DEFAULT 0,

  -- Error handling
  error_message TEXT,

  -- Metadata
  started_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Games
CREATE INDEX idx_games_bgg_id ON games(bgg_id);
CREATE INDEX idx_games_name ON games(name);
CREATE INDEX idx_games_approved ON games(is_approved);
CREATE INDEX idx_games_search ON games USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_games_categories ON games USING gin(categories);
CREATE INDEX idx_games_mechanics ON games USING gin(mechanics);

-- Community Games
CREATE INDEX idx_community_games_community ON community_games(community_id);
CREATE INDEX idx_community_games_game ON community_games(game_id);
CREATE INDEX idx_community_games_status ON community_games(status);

-- BGG Sync Jobs
CREATE INDEX idx_bgg_sync_jobs_community ON bgg_sync_jobs(community_id);
CREATE INDEX idx_bgg_sync_jobs_status ON bgg_sync_jobs(status);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_games_updated_at
  BEFORE UPDATE ON community_games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update games_count in communities
CREATE OR REPLACE FUNCTION update_community_games_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities
    SET games_count = games_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities
    SET games_count = GREATEST(games_count - 1, 0)
    WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_games_count
  AFTER INSERT OR DELETE ON community_games
  FOR EACH ROW
  EXECUTE FUNCTION update_community_games_count();

-- Auto-approve BGG synced games
CREATE OR REPLACE FUNCTION auto_approve_bgg_games()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.synced_from_bgg = TRUE AND NEW.is_approved = FALSE THEN
    NEW.is_approved = TRUE;
    NEW.approved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_approve_bgg_games
  BEFORE INSERT ON games
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_bgg_games();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE bgg_sync_jobs ENABLE ROW LEVEL SECURITY;

-- Games: Public can view approved games
CREATE POLICY "Approved games viewable by everyone"
  ON games FOR SELECT
  USING (is_approved = TRUE);

CREATE POLICY "Admins can view all games"
  ON games FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can request new games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can approve and manage games"
  ON games FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Community Games: Public can view collections
CREATE POLICY "Community game collections viewable by everyone"
  ON community_games FOR SELECT
  USING (true);

CREATE POLICY "Community admins can manage their collections"
  ON community_games FOR ALL
  USING (
    is_community_admin(community_id, auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- BGG Sync Jobs
CREATE POLICY "Community admins can view their sync jobs"
  ON bgg_sync_jobs FOR SELECT
  USING (
    is_community_admin(community_id, auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Community admins can create sync jobs"
  ON bgg_sync_jobs FOR INSERT
  WITH CHECK (
    is_community_admin(community_id, auth.uid())
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE games IS 'Master game database, BGG-independent with local caching';
COMMENT ON TABLE community_games IS 'Community game collections with ownership status';
COMMENT ON TABLE bgg_sync_jobs IS 'Track BGG collection sync operations';
COMMENT ON COLUMN games.bgg_id IS 'BoardGameGeek ID for synced games, null for custom games';
COMMENT ON COLUMN games.is_approved IS 'Admin approval required for user-submitted games';
COMMENT ON COLUMN community_games.status IS 'own=physically own, wishlist=want to buy, played=have played, want_to_play=interested';
