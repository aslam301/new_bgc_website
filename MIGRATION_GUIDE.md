# Migration & Deployment Guide - Phases 4-9

## Quick Start

### 1. Apply All Migrations

```bash
# Apply all pending migrations
supabase db push

# Or apply migrations individually (in order)
supabase migration up
```

### 2. Verify Migrations

```bash
# Check migration status
supabase migration list

# Verify tables were created
supabase db diff
```

### 3. Setup Supabase Storage

```sql
-- Create photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true);

-- Set up RLS policies for photos bucket
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos' AND owner = auth.uid());
```

### 4. Environment Variables

Add to `.env.local`:

```env
# Razorpay (for payments)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

### 5. Install Razorpay (Client-side)

```bash
npm install razorpay
```

Add to your payment page:
```tsx
import Script from 'next/script'

export default function PaymentPage() {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {/* Your component */}
    </>
  )
}
```

---

## Migration Order

The migrations should be applied in this order:

1. ✅ `20260202000001_events_schema.sql` (Phase 2 - Already exists)
2. ✅ `20260202000002_games_schema.sql` (Phase 3 - Already exists)
3. ✅ `20260202000003_photos_schema.sql` (Phase 4 - Already exists)
4. 🆕 `20260202000004_content_schema.sql` (Phase 5 - NEW)
5. 🆕 `20260202000005_marketplace_schema.sql` (Phase 6 - NEW)
6. 🆕 `20260202000006_payments_schema.sql` (Phase 7 - NEW)
7. 🆕 `20260202000007_forums_schema.sql` (Phase 8 - NEW)
8. 🆕 `20260202000008_play_logs_schema.sql` (Phase 9 - NEW)

---

## Testing Each Phase

### Phase 4: Photo Galleries

```bash
# Test upload
curl -X POST http://localhost:3000/api/photos \
  -H "Content-Type: application/json" \
  -d '{
    "photo_url": "https://example.com/photo.jpg",
    "type": "event",
    "event_id": "event-uuid",
    "community_id": "community-uuid"
  }'

# Test fetch
curl http://localhost:3000/api/photos?type=event&event_id=event-uuid
```

### Phase 5: Reviews & Guides

```bash
# Create article
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Catan Review",
    "slug": "catan-review",
    "content": "Great game!",
    "article_type": "review",
    "rating": 4.5,
    "status": "published"
  }'

# Fetch articles
curl http://localhost:3000/api/articles?type=review
```

### Phase 6: Marketplace

```bash
# Create listing
curl -X POST http://localhost:3000/api/marketplace \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": "game-uuid",
    "title": "Catan - Like New",
    "description": "Played once",
    "condition": "like_new",
    "listing_type": "fixed_price",
    "fixed_price": 1500,
    "pickup_location": "Mumbai"
  }'

# Place bid
curl -X POST http://localhost:3000/api/marketplace/bids \
  -H "Content-Type: application/json" \
  -d '{
    "listing_id": "listing-uuid",
    "bid_amount": 1200
  }'
```

### Phase 7: Payments

```bash
# Create order
curl -X POST http://localhost:3000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "payment_type": "event_registration",
    "event_registration_id": "registration-uuid"
  }'

# Verify payment (after Razorpay checkout)
curl -X POST http://localhost:3000/api/payments/verify \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "payment-uuid",
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature_xxx"
  }'
```

### Phase 8: Forums

```bash
# Create thread
curl -X POST http://localhost:3000/api/forums/threads \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "category-uuid",
    "title": "Best starter games?",
    "content": "What games do you recommend for beginners?"
  }'

# Create post
curl -X POST http://localhost:3000/api/forums/posts \
  -H "Content-Type: application/json" \
  -d '{
    "thread_id": "thread-uuid",
    "content": "I recommend Ticket to Ride!"
  }'
```

### Phase 9: Play Logging

```bash
# Log play
curl -X POST http://localhost:3000/api/play-logs \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": "game-uuid",
    "played_at": "2024-02-01T19:00:00Z",
    "num_players": 4,
    "duration_minutes": 90,
    "players": [
      {"guest_name": "Alice", "position": 1, "score": 120, "is_winner": true},
      {"guest_name": "Bob", "position": 2, "score": 100, "is_winner": false},
      {"guest_name": "Carol", "position": 3, "score": 90, "is_winner": false},
      {"guest_name": "Dave", "position": 4, "score": 80, "is_winner": false}
    ]
  }'

# Get stats
curl http://localhost:3000/api/play-logs/stats?user_id=user-uuid
```

---

## Common Issues & Solutions

### Issue: Migration fails with "relation already exists"

**Solution:** Check if migration was already applied
```bash
supabase migration list
```

### Issue: RLS policy blocks queries

**Solution:** Verify you're authenticated and have proper permissions
```sql
-- Check your auth status
SELECT auth.uid();

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

### Issue: Razorpay payment fails

**Solution:**
1. Check environment variables are set
2. Use test credentials in development
3. Verify webhook signature
4. Check Razorpay dashboard for logs

### Issue: Photo upload fails

**Solution:**
1. Verify storage bucket exists
2. Check RLS policies on storage.objects
3. Verify file size is under limit (5MB)
4. Check file type is allowed

---

## Rollback Instructions

If you need to rollback a migration:

```bash
# Rollback last migration
supabase migration down

# Or manually drop tables in reverse order
```

```sql
-- Phase 9
DROP VIEW IF EXISTS game_play_stats;
DROP VIEW IF EXISTS user_play_stats;
DROP TABLE IF EXISTS play_log_players CASCADE;
DROP TABLE IF EXISTS play_logs CASCADE;

-- Phase 8
DROP TABLE IF EXISTS forum_votes CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS forum_threads CASCADE;
DROP TABLE IF EXISTS forum_categories CASCADE;

-- Phase 7
DROP TABLE IF EXISTS payment_webhooks CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Phase 6
DROP TABLE IF EXISTS intermediary_transactions CASCADE;
DROP TABLE IF EXISTS intermediary_requests CASCADE;
DROP TABLE IF EXISTS marketplace_bids CASCADE;
DROP TABLE IF EXISTS marketplace_photos CASCADE;
DROP TABLE IF EXISTS marketplace_listings CASCADE;

-- Phase 5
DROP TABLE IF EXISTS affiliate_clicks CASCADE;
DROP TABLE IF EXISTS affiliate_links CASCADE;
DROP TABLE IF EXISTS retailers CASCADE;
DROP TABLE IF EXISTS content_articles CASCADE;

-- Phase 4
DROP TABLE IF EXISTS community_photos CASCADE;
DROP TABLE IF EXISTS event_photos CASCADE;
```

---

## Production Deployment Checklist

- [ ] All migrations tested locally
- [ ] Environment variables set in production
- [ ] Supabase Storage bucket created
- [ ] RLS policies verified
- [ ] Razorpay webhook URL configured
- [ ] Test payments in test mode first
- [ ] Monitor error logs after deployment
- [ ] Test all API endpoints
- [ ] Verify RLS policies work correctly
- [ ] Check database indexes are created
- [ ] Backup database before deployment

---

## Monitoring & Maintenance

### Check Database Health

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check for missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
ORDER BY n_distinct DESC;
```

### Monitor Performance

```sql
-- Slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Active connections
SELECT
  count(*),
  state
FROM pg_stat_activity
GROUP BY state;
```

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Razorpay Docs:** https://razorpay.com/docs
- **Next.js Docs:** https://nextjs.org/docs

For issues, check:
1. Browser console for client errors
2. Next.js terminal for server errors
3. Supabase logs for database errors
4. Razorpay dashboard for payment errors
