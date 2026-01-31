# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BoardGameCulture** is a platform for India's board gaming community—think "Linktree meets BoardGameGeek meets MakeMyPass" catered specifically to boardgamers.

**We are a PLATFORM** - not just an event site or marketplace. Like Linktree provides link management, MakeMyPass handles events, and BGG catalogs games, we provide the complete infrastructure for board gaming communities to thrive online.

Unlike traditional event platforms, we start with community identity (shareable profile pages), then layer on events, games, commerce, and social features.

### Core Philosophy: Community-First Architecture

The platform hierarchy is:
```
Community (Top Level)
  ├── Profile Page (Link-in-bio style)
  ├── Events (with custom registration forms)
  ├── Game Collection (BGG-synced or manual)
  ├── Photos & Memories
  ├── Reviews & Guides
  └── Marketplace Listings (with community intermediaries)
```

Communities get a shareable URL (`boardgameculture.com/c/bangalore-gamers`) that becomes their digital home. All features are built around this community identity.

**Important:** Communities don't have "members" - they have **followers**. Users can follow communities they're interested in. The community admin auto-follows their own community (starting follower count: 1).

## Technical Stack

### Frontend
- **Framework:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS + shadcn/ui components (RetroUI/NeoBrutalism aesthetic)
- **Hosting:** Vercel (optimized for zero-cost at startup)

### Backend & Database
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Auth:** Supabase Auth
- **Storage:** Start with Supabase Storage (1GB free), migrate to Cloudflare R2 when scaling (zero egress fees)

### Payment Infrastructure
- **Start with:** Razorpay only (2% transaction fee, simple integration)
- **Future (when revenue permits):** Add Juspay or alternative gateways for redundancy
- **Architecture:** Build with abstraction layer from day one to allow easy gateway additions later

### External Integrations
- **BGG API:** BoardGameGeek XML API v2 for game data sync
- **Email:** Resend (3,000 emails/month free tier)
- **Monitoring:** Sentry for error tracking, Vercel Analytics built-in

## Architecture Principles

### 1. Cost Optimization First
Built to run on ~₹100/month indefinitely:
- Free tiers for startup phase (Vercel, Supabase, Resend)
- Scale costs only with revenue
- Choose providers with generous free tiers and zero egress fees (Cloudflare R2 over S3)

### 2. BGG Independence Strategy
Never fully depend on BoardGameGeek API:
```
BGG API → Fetch Data → Cache in Our DB → Never Delete

Benefits:
- If BGG removes API access, we still have games
- Faster queries (no API rate limits)
- Add India-specific data (price, retailers, availability)
- Support non-BGG games (Indian publishers, homemade games)
```

**Critical:** The `games` table is our permanent game database. BGG data is cached forever. Use `bgg_id` for linking but never as primary key.

### 3. Custom Form Schema Pattern
Events use dynamic registration forms beyond basic name/email/phone:

**Storage:** JSONB column `custom_form_schema` in `events` table
**Rendering:** Dynamic form components in React based on schema

Example schema structure:
```json
{
  "fields": [
    {
      "id": "dietary",
      "type": "dropdown",
      "label": "Dietary Preference",
      "options": ["Vegetarian", "Non-Vegetarian", "Vegan"],
      "required": true
    }
  ]
}
```

Store user responses in `custom_form_data` JSONB column in `event_registrations`.

### 4. Marketplace with Community Intermediaries
Unique trust model where local communities act as intermediaries:
- Seller lists game → Community holds temporarily → Buyer collects from community venue
- Communities earn 5-10% fee, building revenue and attracting members
- Platform holds payment in escrow until delivery confirmed

**Key tables:** `marketplace_listings`, `marketplace_bids`, `intermediary_requests`, `intermediary_transactions`

### 5. Payment Gateway Strategy
**MVP Approach:** Start simple with Razorpay only. Build abstraction layer for future expansion.

```typescript
interface PaymentGateway {
  createOrder(amount: number): Promise<Order>
  verifyPayment(paymentId: string): Promise<boolean>
  refund(paymentId: string, amount: number): Promise<Refund>
}

class RazorpayGateway implements PaymentGateway { ... }
// Future: JuspayGateway, or other alternatives when revenue justifies it
```

**Why abstraction layer now:** Makes it easy to add Juspay or backup gateways later without code changes throughout the app.

## User Hierarchy & Permissions

The platform has 4 distinct user levels:

### 1. Super Admin
- Platform owner with full system access
- Can manage all platform admins
- Access to all communities, events, and data
- Financial controls and system settings
- Database: `profiles.role = 'super_admin'`

### 2. Admins (Platform Admins)
- Manage platform operations
- Review and approve game additions
- Moderate content (reviews, marketplace listings)
- Handle disputes and support tickets
- Can act as any community admin for support purposes
- Database: `profiles.role = 'admin'`

### 3. Community Admins
- Can create and manage their own community pages
- Create and manage events under their community
- Manage their community's game collection
- Upload photos and manage community content
- Cannot access other communities unless invited
- Database: `community_admins` table linking `profiles` to `communities`

### 4. Normal Logged-in Users
- Register for events
- Can list their personal games (for marketplace/trading)
- Submit reviews and forum posts (with moderation)
- Bid on marketplace items
- Track their play history
- Database: `profiles.role = 'user'` (default)

### Permission Matrix
```
Action                          Super Admin  Admin  Community Admin  User
-------------------------------------------------------------------
Create community                     ✓         ✓          ✓           ✗
Edit any community                   ✓         ✓          ✗           ✗
Edit own community                   ✓         ✓          ✓           ✗
Create events                        ✓         ✓          ✓           ✗
Register for events                  ✓         ✓          ✓           ✓
Approve new games                    ✓         ✓          ✗           ✗
List personal games                  ✓         ✓          ✓           ✓
Moderate marketplace                 ✓         ✓          ✗           ✗
Access admin panel                   ✓         ✓          ✗           ✗
Access community dashboard           ✓         ✓          ✓           ✗
```

### Database Schema for Permissions
```sql
profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMPTZ
)

community_admins (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id),
  user_id UUID REFERENCES profiles(id),
  role TEXT CHECK (role IN ('owner', 'admin', 'moderator')),
  invited_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ,
  UNIQUE(community_id, user_id)
)
```

### RLS Policy Pattern
```sql
-- Example: Events table RLS
-- Community admins can edit their own community's events
CREATE POLICY "Community admins can update own events"
ON events FOR UPDATE
USING (
  community_id IN (
    SELECT community_id FROM community_admins
    WHERE user_id = auth.uid()
  )
);

-- Platform admins can see everything
CREATE POLICY "Admins see all"
ON events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);
```

## Database Schema Patterns

### Community-Centric Design
Everything links back to `communities` table:
```sql
communities (id, slug, name, description, logo_url, accent_color, ...)
  ↓
├─ events (community_id, custom_form_schema JSONB, ...)
├─ community_games (community_id, game_id, status, ...)
├─ event_photos (community_id, event_id, ...)
└─ marketplace_listings (seller_id, intermediary_communities UUID[], ...)
```

### JSONB for Flexibility
Use JSONB columns for:
- `events.custom_form_schema` - Form builder configuration
- `event_registrations.custom_form_data` - User responses
- Any data structure that varies between instances

### BGG Sync Pattern
```sql
games (
  id UUID PRIMARY KEY,
  bgg_id INT UNIQUE,  -- Link to BGG but not primary key
  name, year_published, min_players, max_players,
  complexity, description, image_url, categories, mechanics,
  bgg_rating, synced_from_bgg BOOLEAN, synced_at TIMESTAMPTZ
)

community_games (
  id UUID,
  community_id UUID REFERENCES communities(id),
  game_id UUID REFERENCES games(id),
  status TEXT CHECK (status IN ('own', 'wishlist', 'played')),
  notes TEXT, times_played INT
)
```

## Implementation Phases (In Order)

### Phase 1: Complete Platform Foundation (Week 1-2) ⭐ REVISED
**Goal:** Launch complete platform with public website, dashboard, and community discovery

**This is NOT just community profiles - it's a complete platform!**

**Phase 1A: Public Website (Before Login)**
- Professional SaaS landing page
- Platform benefits page (where "Powered by" badge links)
- All legal/compliance pages

**Phase 1B: Platform Dashboard (After Login)**
- Full dashboard with navigation
- Home feed with activity & suggestions
- My Games section (empty state for Phase 3)
- Events feed (empty state for Phase 2)
- Communities discovery (FULLY FUNCTIONAL - search, filter, follow)
- Create Community (with benefits page)
- Profile & Settings

**Phase 1C: Community Discovery**
- Full-text search
- Filter by city
- Sort options (followers, newest, active)
- Follow/unfollow system
- Location-aware suggestions

**Phase 1D: Location Detection**
- IP-based city detection
- User can override preferred city
- Powers discovery and event suggestions

**Success criteria:**
- Complete platform launched (not just profiles)
- Users can discover & follow communities
- Dashboard ready for events & games (Phase 2 & 3)
- All legal compliance done
- Mobile-first, loads <2s

### Phase 2: Event Management + Custom Forms (Week 3-4)
**Goal:** Dynamic event registration with custom form fields

**Key implementation:**
- Form builder UI for creating custom fields (dropdown, checkbox, textarea, file upload)
- Store schema in `custom_form_schema` JSONB
- Dynamic form renderer on registration page
- Validation based on field types
- CSV export with custom field columns
- QR code ticket generation

### Phase 3: Game Collection Management (Week 5-6)
**Goal:** BGG sync + local game database

**Critical implementation:**
- Background job for BGG collection sync via XML API
- For each BGG game: check if exists by `bgg_id`, fetch if new, cache forever
- Manual game addition workflow (user request → admin approval)
- Display game collections on community profiles
- Filter/search within collections

**BGG API endpoints:**
- Collection: `https://boardgamegeek.com/xmlapi2/collection?username={user}`
- Game details: `https://boardgamegeek.com/xmlapi2/thing?id={bgg_id}&stats=1`
- **Rate limit:** 1-2 requests/second, implement queue

### Phase 4: Photo Galleries (Week 7)
**Storage strategy:**
- Start: Supabase Storage (1GB free)
- Scale: Cloudflare R2 (10GB free, then ₹1.2/GB with zero egress)
- Future: Google Photos integration option

**Implementation:** Abstracted `StorageProvider` interface for easy provider switching

### Phase 5: Reviews & Beginner Guides (Week 8-9)
**Goal:** India's BGG alternative content

- Admin-created game reviews and buying guides
- User-submitted reviews with moderation
- Retailer directory (city-wise, verified stores)
- SEO optimization with schema.org markup
- Affiliate link system (admin-managed per game)

### Phase 6: Marketplace & Bidding (Week 10-12)
**Goal:** eBay-style auctions with community intermediaries

**Complex workflows:**
- Auction system with auto-bidding (like eBay)
- Intermediary request/accept flow
- Escrow payment holding (7-14 days)
- Multi-step transaction status tracking
- Dispute resolution system

### Phase 7: Payment Integration (Week 13)
**Goal:** Razorpay integration for event tickets and marketplace

**MVP Implementation:**
- Razorpay payment gateway only
- Event ticket payments
- Marketplace escrow payments
- Webhook handling for payment confirmation
- Refund functionality

**Future expansion:** When revenue justifies it, add Juspay or alternative gateways using the abstraction layer.

### Phase 8-9: Forums + Play Logging (Week 14-15)
Standard forum features + personal gaming statistics tracking

## Key Design Decisions

### URL Structure
- Community profiles: `/c/[slug]`
- Events: `/c/[slug]/events/[event-id]`
- Games: `/games/[game-id]` (global)
- Marketplace: `/marketplace` (global) or `/c/[slug]/marketplace` (community)

### Design System: NeoBrutalism
- Sharp borders, bold shadows (3-4px)
- Vibrant color palette: Coral, Sunny, Grape, Mint, Sky, Ink
- Typography: Outfit (sans-serif) + Space Mono (monospace)
- High contrast, accessibility-first
- RetroUI component library aesthetic

### Revenue Model
1. Event ticket fees: 3-5% platform fee (net 1-3% after payment gateway)
2. Marketplace fees: 3% platform fee on sales
3. Affiliate commissions: 5-10% from retailers
4. Premium features (future): Custom domains, advanced analytics

**Target:** Break-even at 30-40 events/month (~Month 3-4)

## Development Guidelines

### Data Ownership
- Communities own their data completely
- Export functionality for all user data
- Never lock users into platform

### Mobile-First
- All layouts must work perfectly on mobile
- Vertical "link-in-bio" style for community profiles
- Large tap targets (min 44px)
- Test on actual mobile devices

### Performance Targets
- Page load: <2s on 3G
- Time to Interactive: <3s
- Lighthouse score: >90

### Security Considerations
- Row Level Security (RLS) policies for all Supabase tables
- Community admins can only edit their own communities
- Validate all custom form inputs server-side
- Sanitize user-generated content (XSS prevention)
- Rate limit BGG API calls to avoid bans

### BGG API Best Practices
- Cache responses for minimum 24 hours
- Implement exponential backoff on failures
- Queue sync requests (don't overwhelm BGG)
- Handle XML parsing errors gracefully
- Store raw XML response for debugging

## Testing Strategy

### Critical Paths to Test
1. User roles: Super admin → Admin → Community admin → User permissions
2. Community profile creation → event creation → registration flow
3. BGG sync: handle missing games, duplicate games, API failures
4. Payment flow: Razorpay integration + webhook handling
5. Custom form builder: all field types + validation
6. Marketplace: bidding, intermediary flow, escrow release

### Edge Cases
- BGG API down during sync
- Payment gateway timeout mid-transaction
- Duplicate BGG game IDs (user syncs twice)
- Custom form with 20+ fields
- Community changes slug (URL) after events created

## Affiliate Link Implementation

**Admin-controlled system:**
1. Admin creates affiliate link for a game + retailer combo
2. Store in `affiliate_links` table with commission rate
3. Display "Where to Buy" on game detail pages
4. Track clicks via `affiliate_clicks` table
5. (Future) Track conversions if retailer provides API

**Never auto-generate affiliate links** - admin manually curates to ensure quality and avoid spam.

## File Organization

```
/app
  /(public)
    /c/[slug]          # Community public profile
    /events            # Event listing & details
    /games             # Game database
    /marketplace       # Marketplace listings
  /(dashboard)
    /dashboard         # Community admin dashboard
  /api                 # API routes
/components
  /ui                  # shadcn/ui components
  /forms               # Dynamic form components
  /community           # Community-specific components
/lib
  /supabase            # Supabase client & helpers
  /payments            # Payment gateway abstraction
  /storage             # Storage provider abstraction
  /bgg                 # BGG API client
/types
  /database.types.ts   # Auto-generated from Supabase
```

## Environment Variables

Required from day one:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
# Future: Add Juspay or alternative gateway credentials

RESEND_API_KEY=

CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
```

## Common Pitfalls to Avoid

1. **Don't over-engineer early phases** - Start with Razorpay only, add gateways later when needed
2. **Don't depend solely on BGG API** - Always cache in local database
3. **Don't skip RLS policies** - Security breach risk without proper Supabase RLS
4. **Don't mix user permissions** - Enforce 4-level hierarchy strictly (Super Admin → Admin → Community Admin → User)
5. **Don't hardcode payment gateway** - Use abstraction layer even with single gateway
6. **Don't ignore mobile** - 80% of Indian users are mobile-first
7. **Custom forms must validate server-side** - Client validation is insufficient
8. **Users can list games too** - Not just community admins, regular users can list their personal games

## Future Considerations (Post-MVP)

- Mobile app (React Native)
- Multi-language support (Hindi, regional languages)
- WhatsApp integration for event reminders
- Tournament management system
- White-label solution for large communities
- Geographic expansion (Singapore, Malaysia, SEA)
