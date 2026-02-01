-- Phase 5: Reviews & Guides
-- Content system with reviews, guides, retailer directory, and affiliate links

-- =====================================================
-- CONTENT ARTICLES TABLE
-- =====================================================
CREATE TABLE content_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Article details
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,

  -- Article type
  article_type TEXT CHECK (article_type IN ('review', 'guide', 'comparison', 'news')) NOT NULL,

  -- Game reference (optional)
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,

  -- Author
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Rating (for reviews)
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),

  -- SEO
  meta_description TEXT,
  tags TEXT[], -- Array of tags

  -- Status
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,

  -- Stats
  view_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RETAILERS TABLE
-- =====================================================
CREATE TABLE retailers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Retailer details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,

  -- Contact
  email TEXT,
  phone TEXT,

  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',

  -- Type
  retailer_type TEXT CHECK (retailer_type IN ('online', 'physical', 'both')) DEFAULT 'both',

  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  -- Stats
  click_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AFFILIATE LINKS TABLE
-- =====================================================
CREATE TABLE affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link details
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  retailer_id UUID REFERENCES retailers(id) ON DELETE CASCADE,
  product_url TEXT NOT NULL,

  -- Pricing
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'INR',

  -- Affiliate
  affiliate_code TEXT,
  commission_rate DECIMAL(5,2), -- Percentage

  -- Availability
  in_stock BOOLEAN DEFAULT TRUE,

  -- Stats
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_id, retailer_id)
);

-- =====================================================
-- AFFILIATE CLICKS TABLE
-- =====================================================
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference
  affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,

  -- User (nullable for anonymous)
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Tracking
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,

  -- Conversion tracking
  converted BOOLEAN DEFAULT FALSE,
  conversion_value DECIMAL(10,2),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Content Articles
CREATE INDEX idx_content_articles_slug ON content_articles(slug);
CREATE INDEX idx_content_articles_type ON content_articles(article_type);
CREATE INDEX idx_content_articles_game ON content_articles(game_id);
CREATE INDEX idx_content_articles_author ON content_articles(author_id);
CREATE INDEX idx_content_articles_status ON content_articles(status);
CREATE INDEX idx_content_articles_published ON content_articles(published_at DESC);
CREATE INDEX idx_content_articles_tags ON content_articles USING GIN(tags);

-- Retailers
CREATE INDEX idx_retailers_slug ON retailers(slug);
CREATE INDEX idx_retailers_city ON retailers(city);
CREATE INDEX idx_retailers_type ON retailers(retailer_type);
CREATE INDEX idx_retailers_verified ON retailers(is_verified);

-- Affiliate Links
CREATE INDEX idx_affiliate_links_game ON affiliate_links(game_id);
CREATE INDEX idx_affiliate_links_retailer ON affiliate_links(retailer_id);

-- Affiliate Clicks
CREATE INDEX idx_affiliate_clicks_link ON affiliate_clicks(affiliate_link_id);
CREATE INDEX idx_affiliate_clicks_user ON affiliate_clicks(user_id);
CREATE INDEX idx_affiliate_clicks_created ON affiliate_clicks(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE content_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Content Articles
CREATE POLICY "Published articles viewable by everyone"
  ON content_articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can manage their articles"
  ON content_articles FOR ALL
  USING (author_id = auth.uid());

-- Retailers
CREATE POLICY "Retailers viewable by everyone"
  ON retailers FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can manage retailers"
  ON retailers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Affiliate Links
CREATE POLICY "Affiliate links viewable by everyone"
  ON affiliate_links FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can manage affiliate links"
  ON affiliate_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Affiliate Clicks
CREATE POLICY "Users can insert clicks"
  ON affiliate_clicks FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Only admins can view clicks"
  ON affiliate_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update article updated_at
CREATE OR REPLACE FUNCTION update_article_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_updated_at
  BEFORE UPDATE ON content_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_article_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE content_articles IS 'Reviews, guides, comparisons, and news articles';
COMMENT ON TABLE retailers IS 'Board game retailers directory';
COMMENT ON TABLE affiliate_links IS 'Affiliate links for games at retailers';
COMMENT ON TABLE affiliate_clicks IS 'Tracking for affiliate link clicks';
