-- Phase 6: Marketplace & Bidding
-- Peer-to-peer marketplace with bidding and intermediary services

-- =====================================================
-- MARKETPLACE LISTINGS TABLE
-- =====================================================
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Game reference
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  -- Seller
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Listing details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')) NOT NULL,

  -- Pricing
  listing_type TEXT CHECK (listing_type IN ('fixed_price', 'auction', 'both')) NOT NULL,
  fixed_price DECIMAL(10,2),
  starting_bid DECIMAL(10,2),
  reserve_price DECIMAL(10,2), -- Minimum acceptable price
  buyout_price DECIMAL(10,2), -- Buy it now price

  -- Auction details
  auction_end_date TIMESTAMPTZ,
  current_bid DECIMAL(10,2) DEFAULT 0,
  bid_count INTEGER DEFAULT 0,

  -- Shipping
  shipping_available BOOLEAN DEFAULT TRUE,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  pickup_location TEXT, -- City for local pickup

  -- Status
  status TEXT CHECK (status IN ('active', 'sold', 'expired', 'cancelled')) DEFAULT 'active',
  sold_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sold_at TIMESTAMPTZ,
  final_price DECIMAL(10,2),

  -- Intermediary
  use_intermediary BOOLEAN DEFAULT FALSE,
  intermediary_fee DECIMAL(10,2),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MARKETPLACE PHOTOS TABLE
-- =====================================================
CREATE TABLE marketplace_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,

  photo_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MARKETPLACE BIDS TABLE
-- =====================================================
CREATE TABLE marketplace_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Bid details
  bid_amount DECIMAL(10,2) NOT NULL,
  is_auto_bid BOOLEAN DEFAULT FALSE, -- For proxy bidding
  max_bid_amount DECIMAL(10,2), -- For proxy bidding

  -- Status
  status TEXT CHECK (status IN ('active', 'outbid', 'winning', 'won', 'lost')) DEFAULT 'active',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INTERMEDIARY REQUESTS TABLE
-- =====================================================
CREATE TABLE intermediary_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Agreement
  agreed_price DECIMAL(10,2) NOT NULL,
  intermediary_fee DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL, -- agreed_price + intermediary_fee

  -- Status
  status TEXT CHECK (status IN (
    'pending_seller_approval',
    'pending_payment',
    'payment_received',
    'item_shipped',
    'item_received',
    'completed',
    'cancelled',
    'disputed'
  )) DEFAULT 'pending_seller_approval',

  -- Tracking
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Dispute
  dispute_reason TEXT,
  disputed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INTERMEDIARY TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE intermediary_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference
  intermediary_request_id UUID REFERENCES intermediary_requests(id) ON DELETE CASCADE,

  -- Transaction details
  transaction_type TEXT CHECK (transaction_type IN (
    'buyer_payment',
    'seller_payout',
    'fee_collection',
    'refund'
  )) NOT NULL,

  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',

  -- Payment details
  payment_method TEXT,
  payment_reference TEXT,

  -- Status
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  processed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Marketplace Listings
CREATE INDEX idx_marketplace_listings_game ON marketplace_listings(game_id);
CREATE INDEX idx_marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_type ON marketplace_listings(listing_type);
CREATE INDEX idx_marketplace_listings_location ON marketplace_listings(pickup_location);
CREATE INDEX idx_marketplace_listings_created ON marketplace_listings(created_at DESC);
CREATE INDEX idx_marketplace_listings_auction_end ON marketplace_listings(auction_end_date);

-- Marketplace Photos
CREATE INDEX idx_marketplace_photos_listing ON marketplace_photos(listing_id);

-- Marketplace Bids
CREATE INDEX idx_marketplace_bids_listing ON marketplace_bids(listing_id);
CREATE INDEX idx_marketplace_bids_bidder ON marketplace_bids(bidder_id);
CREATE INDEX idx_marketplace_bids_status ON marketplace_bids(status);
CREATE INDEX idx_marketplace_bids_created ON marketplace_bids(created_at DESC);

-- Intermediary Requests
CREATE INDEX idx_intermediary_requests_listing ON intermediary_requests(listing_id);
CREATE INDEX idx_intermediary_requests_buyer ON intermediary_requests(buyer_id);
CREATE INDEX idx_intermediary_requests_seller ON intermediary_requests(seller_id);
CREATE INDEX idx_intermediary_requests_status ON intermediary_requests(status);

-- Intermediary Transactions
CREATE INDEX idx_intermediary_transactions_request ON intermediary_transactions(intermediary_request_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE intermediary_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE intermediary_transactions ENABLE ROW LEVEL SECURITY;

-- Marketplace Listings
CREATE POLICY "Active listings viewable by everyone"
  ON marketplace_listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create listings"
  ON marketplace_listings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND seller_id = auth.uid());

CREATE POLICY "Sellers can manage their listings"
  ON marketplace_listings FOR ALL
  USING (seller_id = auth.uid());

-- Marketplace Photos
CREATE POLICY "Photos viewable by everyone"
  ON marketplace_photos FOR SELECT
  USING (TRUE);

CREATE POLICY "Sellers can manage listing photos"
  ON marketplace_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_listings
      WHERE marketplace_listings.id = marketplace_photos.listing_id
      AND marketplace_listings.seller_id = auth.uid()
    )
  );

-- Marketplace Bids
CREATE POLICY "Bidders can view their own bids"
  ON marketplace_bids FOR SELECT
  USING (bidder_id = auth.uid());

CREATE POLICY "Sellers can view bids on their listings"
  ON marketplace_bids FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_listings
      WHERE marketplace_listings.id = marketplace_bids.listing_id
      AND marketplace_listings.seller_id = auth.uid()
    )
  );

CREATE POLICY "Users can place bids"
  ON marketplace_bids FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND bidder_id = auth.uid());

-- Intermediary Requests
CREATE POLICY "Buyers and sellers can view their requests"
  ON intermediary_requests FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Buyers can create requests"
  ON intermediary_requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND buyer_id = auth.uid());

CREATE POLICY "Buyers and sellers can update their requests"
  ON intermediary_requests FOR UPDATE
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Intermediary Transactions
CREATE POLICY "Users can view their transactions"
  ON intermediary_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM intermediary_requests
      WHERE intermediary_requests.id = intermediary_transactions.intermediary_request_id
      AND (intermediary_requests.buyer_id = auth.uid() OR intermediary_requests.seller_id = auth.uid())
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update listing when bid is placed
CREATE OR REPLACE FUNCTION update_listing_on_bid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace_listings
  SET
    current_bid = NEW.bid_amount,
    bid_count = bid_count + 1
  WHERE id = NEW.listing_id
  AND NEW.bid_amount > current_bid;

  -- Update previous bids to 'outbid'
  UPDATE marketplace_bids
  SET status = 'outbid'
  WHERE listing_id = NEW.listing_id
  AND id != NEW.id
  AND status = 'winning';

  -- Set new bid to 'winning'
  NEW.status = 'winning';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bid_placed
  BEFORE INSERT ON marketplace_bids
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_on_bid();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE marketplace_listings IS 'Peer-to-peer marketplace listings for board games';
COMMENT ON TABLE marketplace_photos IS 'Photos for marketplace listings';
COMMENT ON TABLE marketplace_bids IS 'Bids placed on auction listings';
COMMENT ON TABLE intermediary_requests IS 'Intermediary service requests for secure transactions';
COMMENT ON TABLE intermediary_transactions IS 'Financial transactions for intermediary services';
