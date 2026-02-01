-- Phase 4: Photo Galleries
-- Event photos and community photo albums

-- =====================================================
-- EVENT PHOTOS TABLE
-- =====================================================
CREATE TABLE event_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,

  -- Photo details
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,

  -- Uploader
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Moderation
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',
  moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMUNITY PHOTOS TABLE
-- =====================================================
CREATE TABLE community_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,

  -- Photo details
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  album_name TEXT, -- Group photos into albums

  -- Uploader
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Moderation
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_event_photos_event ON event_photos(event_id);
CREATE INDEX idx_event_photos_community ON event_photos(community_id);
CREATE INDEX idx_event_photos_status ON event_photos(status);
CREATE INDEX idx_event_photos_uploaded ON event_photos(uploaded_by);

CREATE INDEX idx_community_photos_community ON community_photos(community_id);
CREATE INDEX idx_community_photos_album ON community_photos(album_name);
CREATE INDEX idx_community_photos_status ON community_photos(status);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_photos ENABLE ROW LEVEL SECURITY;

-- Event Photos
CREATE POLICY "Approved event photos viewable by everyone"
  ON event_photos FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Event attendees and admins can upload photos"
  ON event_photos FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      is_community_admin(community_id, auth.uid())
      OR
      EXISTS (
        SELECT 1 FROM event_registrations
        WHERE event_id = event_photos.event_id
        AND user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Community admins can moderate event photos"
  ON event_photos FOR UPDATE
  USING (is_community_admin(community_id, auth.uid()));

CREATE POLICY "Uploaders can delete their own photos"
  ON event_photos FOR DELETE
  USING (uploaded_by = auth.uid());

-- Community Photos
CREATE POLICY "Approved community photos viewable by everyone"
  ON community_photos FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Community admins can upload photos"
  ON community_photos FOR INSERT
  WITH CHECK (is_community_admin(community_id, auth.uid()));

CREATE POLICY "Community admins can moderate photos"
  ON community_photos FOR ALL
  USING (is_community_admin(community_id, auth.uid()));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE event_photos IS 'Photos from events, moderated by community admins';
COMMENT ON TABLE community_photos IS 'General community photo galleries';
