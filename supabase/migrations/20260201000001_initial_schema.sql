-- BoardGameCulture Initial Schema
-- Phase 1: Profiles, Communities, Followers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'user')) DEFAULT 'user',
  avatar_url TEXT,
  bio TEXT,

  -- Location
  detected_city TEXT,
  detected_state TEXT,
  preferred_city TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),

  -- BGG Integration (Phase 3)
  bgg_username TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMUNITIES TABLE
-- =====================================================
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  accent_color TEXT DEFAULT '#FF6B6B', -- Coral default

  -- Location
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'India',

  -- Social links
  whatsapp_url TEXT,
  instagram_url TEXT,
  discord_url TEXT,
  website_url TEXT,
  facebook_url TEXT,

  -- Statistics (updated via triggers)
  follower_count INT DEFAULT 1, -- Starts at 1 (admin auto-follows)
  events_count INT DEFAULT 0,
  games_count INT DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMUNITY ADMINS TABLE
-- =====================================================
CREATE TABLE community_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'moderator')) DEFAULT 'owner',
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(community_id, user_id)
);

-- =====================================================
-- COMMUNITY FOLLOWERS TABLE
-- =====================================================
CREATE TABLE community_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(community_id, user_id)
);

-- =====================================================
-- LEGAL ACCEPTANCES TABLE
-- =====================================================
CREATE TABLE legal_acceptances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT CHECK (document_type IN ('terms', 'privacy', 'refund', 'cookies')) NOT NULL,
  document_version TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  accepted_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_city ON profiles(COALESCE(preferred_city, detected_city));
CREATE INDEX idx_profiles_role ON profiles(role);

-- Communities
CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_city ON communities(city);
CREATE INDEX idx_communities_created_by ON communities(created_by);
CREATE INDEX idx_communities_active ON communities(is_active);
CREATE INDEX idx_communities_follower_count ON communities(follower_count DESC);
CREATE INDEX idx_communities_search ON communities
  USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Community Admins
CREATE INDEX idx_community_admins_user ON community_admins(user_id);
CREATE INDEX idx_community_admins_community ON community_admins(community_id);

-- Community Followers
CREATE INDEX idx_community_followers_community ON community_followers(community_id);
CREATE INDEX idx_community_followers_user ON community_followers(user_id);

-- Legal Acceptances
CREATE INDEX idx_legal_acceptances_user ON legal_acceptances(user_id);
CREATE INDEX idx_legal_acceptances_type ON legal_acceptances(document_type);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-follow own community on creation
CREATE OR REPLACE FUNCTION auto_follow_own_community()
RETURNS TRIGGER AS $$
BEGIN
  -- Create community admin record
  INSERT INTO community_admins (community_id, user_id, role, invited_by)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);

  -- Auto-follow the community
  INSERT INTO community_followers (community_id, user_id)
  VALUES (NEW.id, NEW.created_by);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_follow_community
  AFTER INSERT ON communities
  FOR EACH ROW
  EXECUTE FUNCTION auto_follow_own_community();

-- Update follower count
CREATE OR REPLACE FUNCTION update_community_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities
    SET follower_count = follower_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities
    SET follower_count = GREATEST(follower_count - 1, 0)
    WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follower_count
  AFTER INSERT OR DELETE ON community_followers
  FOR EACH ROW
  EXECUTE FUNCTION update_community_follower_count();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_acceptances ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Communities Policies
CREATE POLICY "Active communities are viewable by everyone"
  ON communities FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can create communities"
  ON communities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community admins can update their communities"
  ON communities FOR UPDATE
  USING (
    id IN (
      SELECT community_id FROM community_admins
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Platform admins can view all communities"
  ON communities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Community Admins Policies
CREATE POLICY "Community admins viewable by community members"
  ON community_admins FOR SELECT
  USING (
    community_id IN (
      SELECT community_id FROM community_admins
      WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Community owners can manage admins"
  ON community_admins FOR ALL
  USING (
    community_id IN (
      SELECT community_id FROM community_admins
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Community Followers Policies
CREATE POLICY "Anyone can view followers"
  ON community_followers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can follow communities"
  ON community_followers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow communities"
  ON community_followers FOR DELETE
  USING (auth.uid() = user_id);

-- Legal Acceptances Policies
CREATE POLICY "Users can view own acceptances"
  ON legal_acceptances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own acceptances"
  ON legal_acceptances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles with location and preferences';
COMMENT ON TABLE communities IS 'Board gaming communities with follower-based model';
COMMENT ON TABLE community_admins IS 'Community administrators and moderators';
COMMENT ON TABLE community_followers IS 'Users following communities (not members)';
COMMENT ON TABLE legal_acceptances IS 'Track user acceptance of legal documents';

COMMENT ON COLUMN communities.follower_count IS 'Starts at 1 (admin auto-follows on creation)';
COMMENT ON COLUMN profiles.preferred_city IS 'User can override detected city';
