-- Phase 7: Payments
-- Payment processing with Razorpay integration

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT, -- 'razorpay', 'offline', etc.

  -- Purpose
  payment_type TEXT CHECK (payment_type IN (
    'event_registration',
    'marketplace_purchase',
    'intermediary_deposit',
    'other'
  )) NOT NULL,

  -- References (nullable, depends on type)
  event_registration_id UUID REFERENCES event_registrations(id) ON DELETE SET NULL,
  marketplace_listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,
  intermediary_request_id UUID REFERENCES intermediary_requests(id) ON DELETE SET NULL,

  -- Razorpay details
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,

  -- Status
  status TEXT CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded'
  )) DEFAULT 'pending',

  -- Timestamps
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  -- Error handling
  error_code TEXT,
  error_message TEXT,

  -- Refund details
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,

  -- Metadata
  metadata JSONB, -- Additional data

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PAYMENT WEBHOOKS TABLE
-- =====================================================
CREATE TABLE payment_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Webhook details
  provider TEXT NOT NULL, -- 'razorpay', etc.
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,

  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,

  -- Related payment
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Payments
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_type ON payments(payment_type);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_event_registration ON payments(event_registration_id);
CREATE INDEX idx_payments_marketplace_listing ON payments(marketplace_listing_id);
CREATE INDEX idx_payments_intermediary_request ON payments(intermediary_request_id);
CREATE INDEX idx_payments_razorpay_order ON payments(razorpay_order_id);
CREATE INDEX idx_payments_razorpay_payment ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_created ON payments(created_at DESC);

-- Payment Webhooks
CREATE INDEX idx_payment_webhooks_provider ON payment_webhooks(provider);
CREATE INDEX idx_payment_webhooks_processed ON payment_webhooks(processed);
CREATE INDEX idx_payment_webhooks_payment ON payment_webhooks(payment_id);
CREATE INDEX idx_payment_webhooks_created ON payment_webhooks(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;

-- Payments
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "System can update payments"
  ON payments FOR UPDATE
  USING (TRUE); -- Allow updates for webhook processing

-- Payment Webhooks (admin only for security)
CREATE POLICY "Only system can access webhooks"
  ON payment_webhooks FOR ALL
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

-- Update payment updated_at
CREATE OR REPLACE FUNCTION update_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_updated_at();

-- Update event registration payment status
CREATE OR REPLACE FUNCTION update_event_registration_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_type = 'event_registration' AND NEW.status = 'completed' THEN
    UPDATE event_registrations
    SET payment_status = 'paid'
    WHERE id = NEW.event_registration_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_registration_payment_completed
  AFTER UPDATE ON payments
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_event_registration_on_payment();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE payments IS 'Payment transactions for events, marketplace, and intermediary services';
COMMENT ON TABLE payment_webhooks IS 'Webhook events from payment providers';
