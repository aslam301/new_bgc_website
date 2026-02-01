-- Phase 9: Play Logging
-- Track game sessions and player statistics

-- =====================================================
-- PLAY LOGS TABLE
-- =====================================================
CREATE TABLE play_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Game
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  -- Logger (person who created the log)
  logged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Event (optional)
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,

  -- Session details
  played_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER, -- Game duration
  location TEXT, -- Where it was played

  -- Game details
  num_players INTEGER NOT NULL,
  expansion_used TEXT[], -- Names of expansions used

  -- Notes
  notes TEXT,
  photos TEXT[], -- URLs of session photos

  -- Visibility
  is_public BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PLAY LOG PLAYERS TABLE
-- =====================================================
CREATE TABLE play_log_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Play log
  play_log_id UUID REFERENCES play_logs(id) ON DELETE CASCADE,

  -- Player (nullable for guests)
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name TEXT, -- For non-registered players

  -- Game results
  position INTEGER, -- 1st, 2nd, 3rd, etc. (NULL for cooperative)
  score INTEGER,
  is_winner BOOLEAN DEFAULT FALSE,

  -- Player details
  color TEXT, -- Player color/faction
  character TEXT, -- Character/role played

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Either user_id or guest_name must be provided
  CHECK (
    (user_id IS NOT NULL AND guest_name IS NULL) OR
    (user_id IS NULL AND guest_name IS NOT NULL)
  )
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Play Logs
CREATE INDEX idx_play_logs_game ON play_logs(game_id);
CREATE INDEX idx_play_logs_logger ON play_logs(logged_by);
CREATE INDEX idx_play_logs_event ON play_logs(event_id);
CREATE INDEX idx_play_logs_played_at ON play_logs(played_at DESC);
CREATE INDEX idx_play_logs_created ON play_logs(created_at DESC);
CREATE INDEX idx_play_logs_public ON play_logs(is_public);

-- Play Log Players
CREATE INDEX idx_play_log_players_log ON play_log_players(play_log_id);
CREATE INDEX idx_play_log_players_user ON play_log_players(user_id);
CREATE INDEX idx_play_log_players_winner ON play_log_players(is_winner);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE play_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_log_players ENABLE ROW LEVEL SECURITY;

-- Play Logs
CREATE POLICY "Public play logs viewable by everyone"
  ON play_logs FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Loggers can view their own play logs"
  ON play_logs FOR SELECT
  USING (logged_by = auth.uid());

CREATE POLICY "Players can view their play logs"
  ON play_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM play_log_players
      WHERE play_log_players.play_log_id = play_logs.id
      AND play_log_players.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create play logs"
  ON play_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND logged_by = auth.uid());

CREATE POLICY "Loggers can update their play logs"
  ON play_logs FOR UPDATE
  USING (logged_by = auth.uid());

CREATE POLICY "Loggers can delete their play logs"
  ON play_logs FOR DELETE
  USING (logged_by = auth.uid());

-- Play Log Players
CREATE POLICY "Players viewable with their play logs"
  ON play_log_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM play_logs
      WHERE play_logs.id = play_log_players.play_log_id
      AND (
        play_logs.is_public = TRUE
        OR play_logs.logged_by = auth.uid()
        OR play_log_players.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Loggers can manage players in their logs"
  ON play_log_players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM play_logs
      WHERE play_logs.id = play_log_players.play_log_id
      AND play_logs.logged_by = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update play log updated_at
CREATE OR REPLACE FUNCTION update_play_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER play_log_updated_at
  BEFORE UPDATE ON play_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_play_log_updated_at();

-- Update game play count
CREATE OR REPLACE FUNCTION update_game_play_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment play count for game
  UPDATE games
  SET play_count = (
    SELECT COUNT(*)
    FROM play_logs
    WHERE game_id = NEW.game_id
  )
  WHERE id = NEW.game_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER game_play_logged
  AFTER INSERT ON play_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_game_play_count();

-- =====================================================
-- VIEWS
-- =====================================================

-- User play stats view
CREATE VIEW user_play_stats AS
SELECT
  user_id,
  COUNT(*) as total_plays,
  COUNT(DISTINCT play_logs.game_id) as unique_games,
  COUNT(CASE WHEN is_winner THEN 1 END) as wins,
  COUNT(CASE WHEN position = 1 THEN 1 END) as first_places,
  AVG(CASE WHEN position IS NOT NULL THEN position END) as avg_position
FROM play_log_players
JOIN play_logs ON play_logs.id = play_log_players.play_log_id
WHERE user_id IS NOT NULL
GROUP BY user_id;

-- Game play stats view
CREATE VIEW game_play_stats AS
SELECT
  game_id,
  COUNT(*) as total_plays,
  COUNT(DISTINCT logged_by) as unique_players,
  AVG(duration_minutes) as avg_duration,
  AVG(num_players) as avg_players,
  MAX(played_at) as last_played_at
FROM play_logs
GROUP BY game_id;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE play_logs IS 'Game session logs with details and results';
COMMENT ON TABLE play_log_players IS 'Players who participated in a game session';
COMMENT ON VIEW user_play_stats IS 'Aggregated statistics for each user';
COMMENT ON VIEW game_play_stats IS 'Aggregated statistics for each game';
