# BoardGameCulture - Project Brief & Implementation Plan

**Version:** 2.0 (Community-First Architecture)
**Last Updated:** February 2026
**Status:** Planning Phase

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Philosophy: Community-First](#core-philosophy-community-first)
3. [Problem Statement](#problem-statement)
4. [Solution Overview](#solution-overview)
5. [Platform Architecture](#platform-architecture)
6. [Implementation Phases](#implementation-phases)
7. [Design System](#design-system)
8. [Technical Stack (Zero-Cost Optimized)](#technical-stack-zero-cost-optimized)
9. [Revenue Model](#revenue-model)
10. [Success Metrics](#success-metrics)

---

## Executive Summary

**BoardGameCulture** is India's answer to BoardGameGeek—a community-first platform where board gaming communities build their identity, manage their presence, and grow their membership. Unlike traditional event platforms, we start with community identity (Linktree-style profiles), then layer on events, games, commerce, and social features.

### The Big Idea
Think **Linktree meets BoardGameGeek meets eBay**—for India's board gaming scene.

### Core Mission
Create a **zero-barrier platform** where any board game community, cafe, or organizer can:
1. Build their digital presence (link-in-bio page) in 5 minutes
2. List events with custom forms and payments
3. Showcase their game library (synced from BGG or manual)
4. Sell/trade used games through local intermediaries
5. Access beginner guides, reviews, and buying advice

### Key Differentiators
- **Community-First**: Profile pages come first, features follow
- **Cost-Optimized**: Built to run on ~₹100/month indefinitely
- **BGG Alternative**: Full game database cached locally (BGG-independent)
- **India-Specific**: Rupee pricing, local payment gateways, regional focus
- **Marketplace Integration**: Buy/sell/trade with community intermediaries

---

## Core Philosophy: Community-First

### Traditional Event Platform (❌ Old Thinking)
```
User Signs Up → Browses Events → Registers → Done
```
**Problem:** Fragmented, no identity, no ownership

### BoardGameCulture Model (✅ New Thinking)
```
Community Creates Profile → Gets Shareable Link → Adds Events/Games/Photos → Grows Brand
```
**Advantage:** Communities own their presence, platform becomes their home

### Hierarchy
```
Community (Top Level)
  ├── Profile Page (Link-in-bio)
  ├── Events (with custom forms)
  ├── Game Collection (BGG sync)
  ├── Photos & Memories
  ├── Reviews & Guides
  └── Marketplace Listings
```

---

## Problem Statement

### Current Pain Points in Indian Board Gaming

1. **Identity Crisis**
   - Communities scattered across WhatsApp, Instagram, Facebook
   - No professional presence or portfolio
   - Difficult to showcase achievements
   - Can't easily onboard new members

2. **Event Management Chaos**
   - Google Forms + Manual tracking + Excel sheets
   - Payment collection via UPI screenshots
   - No way to collect custom info (dietary preferences, game experience, etc.)
   - Registration data lives in isolation

3. **Game Library Invisibility**
   - Communities own 100+ games but can't showcase them
   - No easy way to let attendees know "what games can we play?"
   - Manual BGG syncing is tedious

4. **Marketplace Friction**
   - Selling used games requires trust
   - No structured platform for game trading
   - Fear of fraud in online transactions
   - No local pickup coordination

5. **Knowledge Fragmentation**
   - Rules questions asked repeatedly
   - No trusted Indian-context reviews
   - Don't know where to buy games locally
   - Beginner guides missing

6. **BGG Dependency**
   - What if BGG removes API access?
   - What if BGG goes down?
   - Need Indian-specific data (prices, retailers, language)

---

## Solution Overview

### Platform Pillars (In Priority Order)

#### 1. Community Profiles (Foundation Layer)
**The Linktree for Board Game Communities**

Every community gets:
- Custom URL: `boardgameculture.com/c/bangalore-gamers`
- Shareable link for Instagram bio, WhatsApp, business cards
- Profile customization: Logo, colors, bio, social links
- Statistics: Members, events hosted, games in library
- Call-to-action buttons (Join WhatsApp, Register for Events, etc.)

**Goal:** Replace scattered links with ONE professional URL

---

#### 2. Event Management (Second Layer)
**After community exists, they can list events**

Features:
- Create events with all details
- **Custom Registration Forms**: Beyond name/email/phone
  - Checkbox: "Are you vegetarian?"
  - Dropdown: "Experience level: Beginner/Intermediate/Expert"
  - Text: "Which game do you want to learn?"
  - File upload: "Upload your BGG profile screenshot"
- Ticket pricing (free or paid)
- Capacity limits
- Automatic confirmation emails
- QR code tickets
- Check-in system

**Technical Approach:**
- Store custom form schema as JSON
- Dynamic form rendering
- Validation rules per field type
- Export attendee data to CSV

---

#### 3. Game Collection Management (Third Layer)
**Showcase what games your community owns**

#### Option A: Add Games Manually
1. Search internal database
2. If not found, add new game (admin approval)
3. Mark as: Own, Wishlist, Played

#### Option B: Import from BGG
1. Enter BGG username
2. Fetch collection via BGG XML API
3. Map to internal database (create games if new)
4. One-time sync (or periodic re-sync)

#### Our Game Database Strategy:
```
BGG API → Fetch Data → Cache in Our DB → Never Delete

Benefits:
- If BGG removes API, we still have games
- Faster queries (no API calls)
- Add India-specific data (price, availability)
- Can add non-BGG games (Indian publishers, homemade games)
```

**Data Schema:**
```sql
games (
  id, bgg_id, name, year_published,
  min_players, max_players, playtime,
  complexity, description, image_url,
  thumbnail_url, categories, mechanics,
  bgg_rating, synced_at, created_at
)

community_games (
  id, community_id, game_id, status,
  notes, times_played, created_at
)
```

**BGG Sync Process:**
1. User initiates sync
2. Background job fetches BGG collection
3. For each game:
   - Check if exists in our DB (by bgg_id)
   - If not, fetch full game data from BGG
   - Create game record
   - Link to community collection
4. Show sync status (Processing → Complete)

---

#### 4. Photo Galleries (Fourth Layer)
**Memories & Social Proof**

**Storage Strategy (Cost-Optimized):**

**Option 1: Google Photos Integration (FREE)**
- Community connects their Google Photos account
- Select specific albums to display
- Embed using Google Photos API
- **Pros:** Free, unlimited storage (if community already uses it)
- **Cons:** Requires Google account, API limits

**Option 2: Cloudflare R2 (MINIMAL COST)**
- $0.015/GB storage (~₹1.2/GB)
- Zero egress fees (unlike S3)
- First 10GB free/month
- **Cost Estimate:** 1000 photos (5MB each) = 5GB = ₹6/month
- **Pros:** No egress charges, faster CDN
- **Cons:** Small cost

**Option 3: Supabase Storage (FREE TIER)**
- 1GB free storage
- After that: $0.021/GB (~₹1.7/GB)
- **Best for:** Small communities initially

**Implementation Plan:**
- **Phase 1:** Supabase Storage (free 1GB)
- **Phase 2:** When >1GB, migrate to Cloudflare R2
- **Phase 3:** Offer Google Photos integration as premium option

**Features:**
- Event organizers upload photos
- Attendees can upload (with moderation)
- Auto-generate event albums
- Download originals
- Social sharing

---

#### 5. Reviews & Beginner Guides (Fifth Layer)
**India's BGG Alternative**

**Content Types:**

1. **Beginner Guides**
   - "How to play Catan" (Hindi + English)
   - "Board gaming terminology"
   - "How to organize a game night"
   - "Best games for beginners under ₹2000"

2. **Game Reviews**
   - Staff reviews (admin-written)
   - Community reviews (user-submitted)
   - Video reviews (YouTube embeds)
   - Rating system (1-10)
   - Pros/cons
   - "Worth it?" verdict

3. **Where to Buy**
   - Verified retailer directory (city-wise)
   - Price comparisons
   - Online vs offline availability
   - Affiliate links (see revenue model)

4. **Comparison Guides**
   - "Catan vs Ticket to Ride"
   - "Best party games 2026"
   - Decision matrices

**SEO Strategy:**
- Target keywords: "board games India", "Catan review India", "where to buy board games Bangalore"
- Rich snippets (schema markup)
- Image optimization
- Fast loading times

---

#### 6. Marketplace & Bidding System (Sixth Layer)
**eBay for Board Games (with Community Intermediaries)**

### How It Works:

#### Listing a Game:
1. User lists game for sale
   - Title, description, condition (new/like-new/used)
   - Photos (multiple angles)
   - Starting price
   - Reserve price (optional)
   - Auction duration (3/5/7 days) OR Buy It Now

2. **Optional: Community Intermediary**
   - Select nearby communities willing to act as intermediaries
   - Community holds game temporarily
   - Handles inspection and handover
   - Takes small fee (5-10% of sale price)

#### Bidding Process:
1. Buyers place bids (must be registered)
2. Auto-bid system (like eBay)
3. Notifications on outbid
4. Auction ends → Highest bidder wins

#### Transaction Flow:

**Option A: Direct Buyer-Seller (No Intermediary)**
```
Seller lists → Buyer wins → Connect via platform → Meet locally → Exchange
```

**Option B: With Community Intermediary**
```
Seller lists → Marks "Intermediary: Yes" → Selects nearby communities
↓
Community agrees → Seller drops game at community venue
↓
Auction ends → Buyer wins → Buyer collects from community venue
↓
Community verifies condition → Releases payment to seller (minus fee)
```

**Payment Handling:**
- Escrow system (hold payment until delivery confirmed)
- Multiple payment gateways (see Technical Stack)
- Platform fee: 2-3% of sale price
- Intermediary fee: 5-10% (if used)

**Trust & Safety:**
- User ratings (buyer/seller)
- Dispute resolution process
- Community intermediaries vetted (verified identity)
- Insurance option (future)

**Why Communities Will Do This:**
- Earn 5-10% on each transaction
- Attract more members (come for game pickup, stay for events)
- Build reputation as trusted intermediaries

---

#### 7. Discussion Forums (Seventh Layer)
**Community Knowledge Base**

Categories:
- **Rules Questions** - Get answers, mark best response
- **Strategy Tips** - Tactics, combos, advanced play
- **Marketplace Discussion** - Price checks, game valuations
- **Looking for Group** - Find local players
- **General Chat** - Off-topic, community building

Features:
- Upvote/downvote
- Threaded comments
- Best answer marking
- Tag system
- Full-text search

---

#### 8. Play Logging & Statistics (Eighth Layer)
**Track Your Gaming Journey**

Features:
- Log plays: Game, date, players, scores, winner
- Personal stats: Most played, win rate, total plays
- Community stats: Trending games, most active players
- Yearly "Wrapped" summaries

Integration:
- Auto-suggest games from community library
- Share plays to social media
- Compare stats with friends

---

## Implementation Phases

### **Phase 1: Community Profiles (Linktree MVP)** - Week 1-2
**Goal:** Any community can create a profile page in 5 minutes

**Features:**
- Sign up / Authentication
- Create community profile
  - Name, slug (URL), bio
  - Logo upload
  - Social links (WhatsApp, Instagram, Discord, Website)
  - Custom color accent
- Public profile page
  - Mobile-optimized vertical layout
  - Large action buttons
  - Statistics display
  - "Powered by BoardGameCulture" footer
- Edit profile
- Share functionality

**Database:**
```sql
communities (
  id, slug, name, description, logo_url,
  whatsapp_url, instagram_url, discord_url, website_url,
  accent_color, member_count, events_count, games_count,
  created_by, created_at, updated_at
)

community_admins (
  id, community_id, user_id, role, created_at
)
```

**Success Criteria:**
- Community can sign up in <5 min
- Profile page loads in <2s
- Shareable link works on all platforms
- Looks great on mobile

---

### **Phase 2: Event Management + Custom Forms** - Week 3-4

**Features:**
- Create events (linked to community)
- Event details: Title, description, date, time, venue, price, capacity
- **Custom Registration Form Builder:**
  ```
  Field Types:
  - Short text (Name, Phone)
  - Email (auto-validated)
  - Long text (Notes, dietary preferences)
  - Dropdown (Experience level, T-shirt size)
  - Checkboxes (Agree to terms, food preference)
  - File upload (ID proof, BGG profile)
  - Number (Age, +1 guests)
  ```
- Default fields always included: Name, Email, Phone
- Form preview before publishing
- Registration workflow
- Attendee list (for organizers)
- Export to CSV
- QR code tickets

**Database:**
```sql
events (
  id, community_id, title, description,
  start_date, end_date, location_venue, location_address,
  location_city, ticket_price, max_attendees,
  custom_form_schema (JSONB), status, created_at
)

event_registrations (
  id, event_id, user_id, custom_form_data (JSONB),
  payment_status, ticket_code, created_at
)
```

**Custom Form Schema Example:**
```json
{
  "fields": [
    {
      "id": "dietary",
      "type": "dropdown",
      "label": "Dietary Preference",
      "options": ["Vegetarian", "Non-Vegetarian", "Vegan"],
      "required": true
    },
    {
      "id": "experience",
      "type": "dropdown",
      "label": "Gaming Experience",
      "options": ["Beginner", "Intermediate", "Expert"],
      "required": true
    },
    {
      "id": "games_interested",
      "type": "textarea",
      "label": "Which games do you want to play?",
      "required": false
    }
  ]
}
```

**Form Rendering:**
- Dynamic form component in React
- Validation based on field type
- Store responses in `custom_form_data` JSONB column
- Admin can download responses as CSV

---

### **Phase 3: Game Collection (Manual + BGG Import)** - Week 5-6

#### 3A: Internal Game Database Setup

**Our Game Repository:**
```sql
games (
  id UUID PRIMARY KEY,
  bgg_id INT UNIQUE,
  name TEXT NOT NULL,
  year_published INT,
  min_players INT,
  max_players INT,
  playtime_min INT,
  playtime_max INT,
  complexity DECIMAL(3,2),
  description TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  categories TEXT[],
  mechanics TEXT[],
  bgg_rating DECIMAL(4,2),
  avg_weight DECIMAL(3,2),
  synced_from_bgg BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Add index for fast lookups
CREATE INDEX idx_games_bgg_id ON games(bgg_id);
CREATE INDEX idx_games_name_search ON games USING gin(to_tsvector('english', name));
```

**Game Addition Workflow:**

1. **User adds game manually:**
   - Search existing games first
   - If not found: "Request to add game"
   - Admin reviews and approves
   - Game added to database

2. **BGG Import (Background Job):**
   - User enters BGG username
   - Fetch collection XML: `https://boardgamegeek.com/xmlapi2/collection?username={user}`
   - For each game in collection:
     - Check if `bgg_id` exists in our DB
     - If not, fetch full game info: `https://boardgamegeek.com/xmlapi2/thing?id={bgg_id}&stats=1`
     - Parse XML and insert into `games` table
     - Link to community via `community_games`

**BGG API Details:**
- Free to use, no authentication required
- Rate limit: ~1-2 requests/second
- Data freshness: Cache for 24 hours minimum
- Fallback: If BGG is down, use cached data

#### 3B: Community Game Collections

```sql
community_games (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id),
  game_id UUID REFERENCES games(id),
  status TEXT CHECK (status IN ('own', 'wishlist', 'played', 'want_to_play')),
  notes TEXT,
  condition TEXT CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')),
  times_played INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, game_id)
)
```

**Features:**
- Add games to collection (own, wishlist, played)
- Display on community profile page
- Filter/search games in collection
- "We have 120 games!" badge
- Most played games widget

**BGG Sync Features:**
- One-time import
- Manual re-sync (refresh collection)
- Sync status indicator
- Conflict resolution (if game already exists)

---

### **Phase 4: Photo Galleries** - Week 7

**Implementation Plan:**

**Storage Backend:**
```typescript
// lib/storage/provider.ts
interface StorageProvider {
  upload(file: File, path: string): Promise<string>
  delete(path: string): Promise<void>
  getPublicUrl(path: string): string
}

// Implementations:
class SupabaseStorage implements StorageProvider { ... }
class CloudflareR2Storage implements StorageProvider { ... }
class GooglePhotosStorage implements StorageProvider { ... }

// Use environment variable to switch
const storage = process.env.STORAGE_PROVIDER === 'r2'
  ? new CloudflareR2Storage()
  : new SupabaseStorage()
```

**Features:**
- Upload photos to events
- Auto-create event albums
- Organizer moderation (approve/reject)
- Display on community profile
- Download originals
- Share to social media

**Database:**
```sql
event_photos (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  community_id UUID REFERENCES communities(id),
  uploaded_by UUID REFERENCES profiles(id),
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_by UUID REFERENCES profiles(id),
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Cost Estimate (1000 photos scenario):**
- Supabase: 1GB free, then ₹1.7/GB = ₹8.5 for 5GB
- Cloudflare R2: 10GB free, then ₹1.2/GB = ₹0 for 5GB
- **Winner:** Cloudflare R2 (free for first 10GB)

---

### **Phase 5: Reviews & Beginner Guides (BGG Alternative Content)** - Week 8-9

**Content Strategy:**

1. **Initial Content (Admin-Created):**
   - 20 beginner guides (game rules, how-tos)
   - 50 game reviews (top games in India)
   - 10 buying guides (best under ₹X)
   - 30 retailer listings (verified stores)

2. **User-Generated Content:**
   - Community members submit reviews
   - Moderation queue for approval
   - Upvote/downvote reviews
   - "Helpful" ratings

**Database:**
```sql
content_articles (
  id UUID PRIMARY KEY,
  type TEXT CHECK (type IN ('guide', 'review', 'buying_guide', 'comparison')),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL, -- Markdown or rich text
  author_id UUID REFERENCES profiles(id),
  game_id UUID REFERENCES games(id), -- null for guides
  rating DECIMAL(3,1), -- for reviews
  status TEXT CHECK (status IN ('draft', 'published', 'archived')),
  view_count INT DEFAULT 0,
  upvotes INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

retailers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  website_url TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  has_physical_store BOOLEAN DEFAULT FALSE,
  ships_pan_india BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**SEO Optimization:**
- Meta tags for each article
- OpenGraph images
- Schema.org markup (Article, Review)
- Sitemap generation
- Fast page loads (<2s)

---

### **Phase 6: Marketplace & Bidding System** - Week 10-12

**Core Features:**

#### Listing Creation:
```sql
marketplace_listings (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id),
  game_id UUID REFERENCES games(id),
  title TEXT NOT NULL,
  description TEXT,
  condition TEXT CHECK (condition IN ('new', 'like-new', 'used', 'poor')),
  starting_price DECIMAL(10,2) NOT NULL,
  reserve_price DECIMAL(10,2),
  buy_now_price DECIMAL(10,2),
  listing_type TEXT CHECK (listing_type IN ('auction', 'fixed_price', 'both')),
  auction_end_date TIMESTAMPTZ,
  use_intermediary BOOLEAN DEFAULT FALSE,
  intermediary_communities UUID[], -- Array of community IDs
  status TEXT CHECK (status IN ('active', 'sold', 'expired', 'cancelled')),
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

marketplace_photos (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES marketplace_listings(id),
  photo_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### Bidding System:
```sql
marketplace_bids (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES marketplace_listings(id),
  bidder_id UUID REFERENCES profiles(id),
  bid_amount DECIMAL(10,2) NOT NULL,
  is_auto_bid BOOLEAN DEFAULT FALSE,
  max_auto_bid DECIMAL(10,2),
  status TEXT CHECK (status IN ('active', 'outbid', 'won', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### Intermediary System:
```sql
intermediary_requests (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES marketplace_listings(id),
  community_id UUID REFERENCES communities(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')),
  fee_percentage DECIMAL(4,2) DEFAULT 5.00,
  notes TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

intermediary_transactions (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES marketplace_listings(id),
  community_id UUID REFERENCES communities(id),
  seller_id UUID REFERENCES profiles(id),
  buyer_id UUID REFERENCES profiles(id),
  sale_price DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  intermediary_fee DECIMAL(10,2) NOT NULL,
  seller_payout DECIMAL(10,2) NOT NULL,
  game_received_at TIMESTAMPTZ,
  game_delivered_at TIMESTAMPTZ,
  payment_released_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'in_custody', 'completed', 'disputed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Workflow:**

1. **Listing Published**
   - Seller uploads photos
   - Sets price/auction duration
   - Optionally selects intermediary communities

2. **Intermediary Accepts** (if requested)
   - Community gets notification
   - Reviews listing details
   - Accepts or declines
   - If accepts, seller drops off game at venue

3. **Bidding Happens**
   - Auto-bid system (like eBay)
   - Real-time notifications
   - Auction countdown

4. **Auction Ends**
   - Highest bidder wins
   - Payment held in escrow
   - Buyer notified to collect

5. **Delivery/Pickup**
   - **No Intermediary:** Buyer and seller connect, meet locally
   - **With Intermediary:** Buyer collects from community venue, community verifies condition

6. **Payment Release**
   - Buyer confirms receipt
   - Or auto-release after 7 days
   - Platform fee + intermediary fee deducted
   - Seller receives payout

**Trust & Safety:**
- User verification (phone + email)
- Rating system (5 stars)
- Dispute resolution (admin mediation)
- Blacklist bad actors

---

### **Phase 7: Payment Gateway Integration (Multi-Gateway Fallback)** - Week 13

**Strategy: Never Go Down**

#### Primary Gateway: Razorpay
- Market leader in India
- 2% transaction fee
- Instant settlements
- UPI, Cards, Net Banking, Wallets

#### Backup Gateway: Cashfree
- Similar pricing (2%)
- Automatic fallback if Razorpay down
- Independent infrastructure

#### Tertiary Option: PayU
- Older but reliable
- 2-3% fees
- Last resort

**Implementation:**
```typescript
// lib/payments/gateway.ts
interface PaymentGateway {
  createOrder(amount: number, currency: string): Promise<Order>
  verifyPayment(paymentId: string, signature: string): Promise<boolean>
  refund(paymentId: string, amount: number): Promise<Refund>
}

class RazorpayGateway implements PaymentGateway { ... }
class CashfreeGateway implements PaymentGateway { ... }
class PayUGateway implements PaymentGateway { ... }

// Fallback logic
class PaymentService {
  private gateways = [
    new RazorpayGateway(),
    new CashfreeGateway(),
    new PayUGateway()
  ]

  async processPayment(amount: number): Promise<Order> {
    for (const gateway of this.gateways) {
      try {
        return await gateway.createOrder(amount, 'INR')
      } catch (error) {
        console.error(`Gateway ${gateway.name} failed, trying next...`)
        continue
      }
    }
    throw new Error('All payment gateways failed')
  }
}
```

**Zero-Cost Alternative: UPI Direct**
- Generate UPI QR codes
- User pays via any UPI app
- Manual verification (screenshot upload)
- Free but requires manual work

**Escrow System:**
```sql
escrow_transactions (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES marketplace_listings(id),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_gateway TEXT,
  gateway_payment_id TEXT,
  status TEXT CHECK (status IN ('pending', 'held', 'released', 'refunded')),
  held_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

### **Phase 8: Discussion Forums** - Week 14

(Same as previous plan - voting, threading, best answers)

---

### **Phase 9: Play Logging & Stats** - Week 15

(Same as previous plan - track plays, statistics, yearly wrapped)

---

## Affiliate Link Strategy (Admin-Controlled)

**Your Concern:** "I'm not great at this, plan a proper way"

### How It Works:

#### Step 1: Build Internal Game Database
- Every game added (manual or BGG import) goes into `games` table
- We own this data permanently

#### Step 2: Admin Creates Affiliate Links
```sql
affiliate_links (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  retailer_id UUID REFERENCES retailers(id),
  affiliate_url TEXT NOT NULL, -- Your affiliate link
  display_url TEXT, -- Clean URL to show users
  commission_rate DECIMAL(4,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### Step 3: Display on Game Pages
- Game detail page shows: "Where to Buy"
- List of retailers with prices (if known)
- Click → Redirects to affiliate link
- We track click via our URL shortener

```sql
affiliate_clicks (
  id UUID PRIMARY KEY,
  affiliate_link_id UUID REFERENCES affiliate_links(id),
  user_id UUID REFERENCES profiles(id),
  ip_address INET,
  user_agent TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### Step 4: (Future) Track Conversions
- If retailer provides conversion API
- Track which clicks led to purchases
- Calculate earnings

**Example Flow:**
1. Admin adds "Catan" to database (from BGG or manual)
2. Admin creates affiliate link:
   - Retailer: Amazon India
   - URL: `https://amazon.in/?tag=boardgameculture`
3. User visits Catan game page
4. Sees "Buy on Amazon" button
5. Clicks → Tracked → Redirected to affiliate link
6. User buys → You earn commission

**Benefits:**
- You control which games have affiliate links
- Can add multiple retailers per game
- Can update links anytime
- Track performance (clicks, conversions)

---

## Design System

### Visual Identity: NeoBrutalism Meets Vibrant Community

(Same design system as before - RetroUI + Custom vibrant theme)

**Key Principles:**
- Sharp borders, bold shadows (NeoBrutalism)
- Vibrant colors: Coral, Sunny, Grape, Mint, Sky, Ink
- Typography: Outfit (sans) + Space Mono (mono)
- Mobile-first, high-contrast, accessibility-focused

(Full design details same as previous document)

---

## Technical Stack (Zero-Cost Optimized)

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui (RetroUI)
- **Hosting:** Vercel (Free Tier)
  - Unlimited bandwidth
  - Automatic HTTPS
  - Edge network
  - Preview deployments

**Cost: ₹0/month**

---

### Backend & Database
- **Database:** Supabase (Free Tier)
  - 500MB database
  - Unlimited API requests
  - Row Level Security
  - Real-time subscriptions

- **Auth:** Supabase Auth (included)
- **Storage:** Supabase Storage (1GB free)
  - Migrate to Cloudflare R2 when needed

**Cost: ₹0/month (free tier), ₹2000/month (Pro tier when needed)**

---

### File Storage Strategy

**Phase 1 (Free):**
- Supabase Storage: 1GB free
- Good for ~200 event photos

**Phase 2 (Minimal Cost):**
- Cloudflare R2: 10GB free/month
- Then $0.015/GB (~₹1.2/GB)
- **Cost for 50GB:** ₹48/month (₹1.2 × 40GB after free tier)

**Phase 3 (Optional):**
- Google Photos Integration (user connects their account)
- Completely free for communities
- We just embed their photos

**Comparison:**
| Service | Free Tier | Cost After | Egress Fees |
|---------|-----------|------------|-------------|
| Supabase | 1GB | ₹1.7/GB | Yes (₹7.5/GB) |
| Cloudflare R2 | 10GB | ₹1.2/GB | None! |
| AWS S3 | None | ₹1.6/GB | Yes (₹7.5/GB) |
| Google Photos | Unlimited | Free | None |

**Winner: Cloudflare R2** (free for 10GB, then cheapest with zero egress)

---

### Payment Gateways

**Primary: Razorpay**
- 2% transaction fee
- Instant settlements
- Dashboard for payouts
- **Cost:** Pay-per-transaction (no fixed cost)

**Backup: Cashfree**
- 2% transaction fee
- Automatic failover

**Zero-Cost Option: UPI QR Codes**
- Generate static UPI QR
- User scans and pays
- Upload payment screenshot
- Admin verifies manually
- **Cost:** ₹0

**Escrow:**
- Hold funds for 7-14 days (marketplace)
- Built into payment gateway
- No separate escrow service needed

---

### Email Service
- **Resend:** 3,000 emails/month free
- **SendGrid:** 100 emails/day free (3,000/month)
- **Fallback:** Amazon SES ($0.10 per 1000 emails = ₹8 per 1000)

**Winner: Resend** (simple API, free tier sufficient)

---

### Monitoring & Analytics
- **Sentry:** Error tracking (Free tier: 5k errors/month)
- **Vercel Analytics:** Built-in, free
- **Plausible (Self-Hosted):** Privacy-friendly analytics (₹0 if self-hosted)

---

### Total Cost Breakdown

**Startup Phase (0-500 users):**
| Service | Cost |
|---------|------|
| Domain (Namecheap) | ₹800/year = ₹67/month |
| Vercel (Free) | ₹0 |
| Supabase (Free) | ₹0 |
| Storage (1GB free) | ₹0 |
| Resend (Free) | ₹0 |
| Payment Gateway | Pay-per-transaction |
| **Total** | **₹67/month** |

**Growth Phase (500-5000 users):**
| Service | Cost |
|---------|------|
| Domain | ₹67/month |
| Vercel Pro | ₹1600/month |
| Supabase Pro | ₹2000/month |
| Cloudflare R2 (50GB) | ₹48/month |
| Resend (10k emails) | ₹1600/month |
| **Total** | **₹5315/month** |

**Scale Phase (5000+ users):**
- Upgrade as needed
- Potentially move to dedicated server
- Estimated: ₹10,000-20,000/month

---

## Revenue Model

### Primary Revenue Streams

1. **Transaction Fees (Events)**
   - 3-5% platform fee on paid event tickets
   - Razorpay charges: 2%
   - **Net to us:** 1-3%
   - **Example:** ₹500 ticket = ₹5-15 platform revenue

2. **Marketplace Fees**
   - 3% platform fee on game sales
   - **Example:** ₹2000 game sale = ₹60 platform revenue
   - Intermediary fee: 5-10% (goes to community, not us)

3. **Affiliate Commissions**
   - 5-10% commission from retailers
   - **Example:** ₹10,000 in referred sales = ₹500-1000 revenue

4. **Premium Community Features** (Future)
   - Custom domain (community.com instead of boardgameculture.com/c/community)
   - Advanced analytics
   - Priority support
   - **Price:** ₹500-1000/month

5. **Featured Listings** (Optional)
   - Featured game listings in marketplace
   - Featured community profiles
   - **Price:** ₹500/month

### Revenue Projections

**Year 1 (Conservative):**
- 50 communities
- 500 events/month (avg ₹200/ticket, 20 attendees/event)
  - GMV: ₹2,00,000/month
  - Platform fee (3%): ₹6,000/month
- 100 marketplace sales/month (avg ₹1500/sale)
  - GMV: ₹1,50,000/month
  - Platform fee (3%): ₹4,500/month
- Affiliate sales: ₹5,00,000/month referred
  - Commission (8%): ₹40,000/month
- **Total Revenue:** ₹50,500/month
- **Costs:** ₹5,315/month
- **Profit:** ₹45,185/month

**Break-even:** Month 3-4 (once we hit 30-40 events/month)

---

## Success Metrics

### Launch Targets (3 Months)

**Community Metrics:**
- 30 active communities
- 50 community profiles created
- 500 total members across communities

**Event Metrics:**
- 100 events created
- 500 event registrations
- ₹50,000 in ticket sales

**Game Database:**
- 1,000 games in database (from BGG)
- 5,000 games in community collections
- 50 game reviews published

**Marketplace:**
- 50 games listed for sale
- 20 successful transactions
- 5 community intermediaries

**Engagement:**
- 1,000 page views/day
- 30% monthly active users
- 5 discussions/day

**Technical:**
- <2s page load time
- 99% uptime
- Zero cost (free tier sufficient)

---

## Implementation Checklist

### Pre-Development
- [ ] Set up Supabase project
- [ ] Set up Vercel project
- [ ] Buy domain name
- [ ] Design mockups (Figma - optional)
- [ ] Set up GitHub repo

### Phase 1: Community Profiles
- [ ] Auth system
- [ ] Community creation flow
- [ ] Profile page design
- [ ] Social links
- [ ] Edit functionality

### Phase 2: Events + Custom Forms
- [ ] Event creation
- [ ] Custom form builder
- [ ] Registration workflow
- [ ] QR code generation
- [ ] CSV export

### Phase 3: Game Collections
- [ ] Game database schema
- [ ] Manual game addition
- [ ] BGG API integration
- [ ] Collection management
- [ ] Display on profile

### Phase 4: Photo Galleries
- [ ] Cloudflare R2 setup
- [ ] Upload workflow
- [ ] Moderation system
- [ ] Display galleries

### Phase 5: Reviews & Guides
- [ ] Content CMS
- [ ] Retailer directory
- [ ] Review submission
- [ ] SEO optimization

### Phase 6: Marketplace
- [ ] Listing creation
- [ ] Bidding system
- [ ] Intermediary workflow
- [ ] Escrow payment

### Phase 7: Multi-Gateway Payments
- [ ] Razorpay integration
- [ ] Cashfree backup
- [ ] UPI QR fallback
- [ ] Webhook handling

### Phase 8-9: Forums + Play Logging
- [ ] Discussion categories
- [ ] Voting system
- [ ] Play log tracking
- [ ] Statistics dashboard

---

## Future Vision (Year 2+)

### Advanced Features
- Mobile app (React Native)
- AI-powered game recommendations
- Virtual events (streaming integration)
- Tournament management system
- White-label solution for large communities

### Geographic Expansion
- Expand beyond India (Singapore, Malaysia, SEA)
- Multi-language support
- Currency localization

### Business Model Evolution
- Premium memberships
- White-label licenses
- B2B offerings for cafes
- Game publisher partnerships

---

## Conclusion

BoardGameCulture is built on three principles:

1. **Community First** - Give communities their identity before adding features
2. **Cost Optimized** - Run on ₹67/month initially, scale costs with revenue
3. **India Focused** - Built for Indian market with local integrations

The phased approach ensures we validate each layer before building the next. Starting with community profiles (Linktree MVP) gives immediate value, then we layer on events, games, commerce, and social features.

**With zero-cost infrastructure and a clear monetization path, we can bootstrap this to profitability within 6 months.**

Let's build India's BoardGameGeek. 🎲

---

**Document Version:**
- v2.0 (Feb 2026) - Community-first architecture + cost optimization

**Next Steps:**
1. Review and approve phases
2. Set up infrastructure (Supabase, Vercel, Cloudflare R2)
3. Begin Phase 1: Community Profiles
4. Validate with 10 pilot communities
5. Iterate and scale
