-- Phase 2: Events and Event Registrations
-- Enables communities to create and manage events with custom registration forms

-- =====================================================
-- EVENT TYPES TABLE (Lookup)
-- =====================================================
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default event types
INSERT INTO event_types (name, slug, description) VALUES
  ('Game Night', 'game-night', 'Regular board game meetup'),
  ('Tournament', 'tournament', 'Competitive gaming event'),
  ('Workshop', 'workshop', 'Learn new games'),
  ('Convention', 'convention', 'Large gaming convention'),
  ('Meetup', 'meetup', 'Casual gaming session');

-- =====================================================
-- EVENTS TABLE
-- =====================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,

  -- Basic info
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,

  -- Date/time
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'Asia/Kolkata',

  -- Location
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'India',

  -- Event settings
  event_type_id UUID REFERENCES event_types(id),
  max_attendees INT,
  is_free BOOLEAN DEFAULT TRUE,
  ticket_price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',

  -- Custom form schema (JSONB)
  custom_form_schema JSONB DEFAULT '{"fields": []}'::jsonb,

  -- Status
  status TEXT CHECK (status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'draft',

  -- Statistics
  registration_count INT DEFAULT 0,
  checked_in_count INT DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(community_id, slug)
);

-- =====================================================
-- EVENT REGISTRATIONS TABLE
-- =====================================================
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- null if guest registration

  -- Basic info (always required)
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,

  -- Custom form data (JSONB)
  custom_form_data JSONB DEFAULT '{}'::jsonb,

  -- Payment (if paid event)
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  payment_id TEXT,
  amount_paid DECIMAL(10,2),

  -- Ticket
  ticket_code TEXT UNIQUE NOT NULL, -- QR code content
  qr_code_url TEXT, -- Generated QR image URL

  -- Check-in
  is_checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, email)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Events
CREATE INDEX idx_events_community ON events(community_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_type ON events(event_type_id);
CREATE INDEX idx_events_search ON events USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Event Registrations
CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_registrations_email ON event_registrations(email);
CREATE INDEX idx_registrations_ticket ON event_registrations(ticket_code);
CREATE INDEX idx_registrations_status ON event_registrations(payment_status);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at on events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update registration_count when registrations are added/removed
CREATE OR REPLACE FUNCTION update_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events
    SET registration_count = registration_count + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events
    SET registration_count = GREATEST(registration_count - 1, 0)
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_registration_count
  AFTER INSERT OR DELETE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_event_registration_count();

-- Update events_count in communities when events are added/removed
CREATE OR REPLACE FUNCTION update_community_events_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities
    SET events_count = events_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities
    SET events_count = GREATEST(events_count - 1, 0)
    WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_events_count
  AFTER INSERT OR DELETE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_community_events_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Event Types: Public read-only
CREATE POLICY "Event types viewable by everyone"
  ON event_types FOR SELECT
  USING (true);

-- Events: Public can view published events
CREATE POLICY "Published events viewable by everyone"
  ON events FOR SELECT
  USING (status = 'published');

CREATE POLICY "Community admins can manage their events"
  ON events FOR ALL
  USING (
    is_community_admin(community_id, auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Event Registrations: Anyone can register
CREATE POLICY "Anyone can register for events"
  ON event_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own registrations"
  ON event_registrations FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Event organizers can view registrations for their events"
  ON event_registrations FOR SELECT
  USING (
    event_id IN (
      SELECT e.id FROM events e
      WHERE is_community_admin(e.community_id, auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Event organizers can update registrations (check-in)"
  ON event_registrations FOR UPDATE
  USING (
    event_id IN (
      SELECT e.id FROM events e
      WHERE is_community_admin(e.community_id, auth.uid())
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE events IS 'Community events with custom registration forms';
COMMENT ON TABLE event_registrations IS 'Event registrations with custom form data';
COMMENT ON COLUMN events.custom_form_schema IS 'JSONB schema for dynamic registration form';
COMMENT ON COLUMN event_registrations.custom_form_data IS 'JSONB responses to custom form fields';
COMMENT ON COLUMN event_registrations.ticket_code IS 'Unique code for QR ticket verification';
