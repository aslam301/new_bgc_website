# Phase 1: Complete Platform Foundation (REVISED)

**Duration:** Week 1-2
**Goal:** Launch complete platform with public website, user dashboard, and community discovery
**Dependencies:** None (Foundation phase)

---

## Overview

Phase 1 creates a **complete platform experience** - not just community profiles. Users get:
- Professional SaaS website (before login)
- Full platform dashboard (after login)
- Community discovery & following
- Event feed (ready for Phase 2)
- Game collection section (ready for Phase 3)
- Location-aware content

---

## Table of Contents

1. [Phase 1A: Public Website (Before Login)](#phase-1a-public-website-before-login)
2. [Phase 1B: Platform Dashboard (After Login)](#phase-1b-platform-dashboard-after-login)
3. [Phase 1C: Community Discovery](#phase-1c-community-discovery)
4. [Phase 1D: Location Detection](#phase-1d-location-detection)
5. [Database Schema](#database-schema)
6. [API Routes](#api-routes)
7. [UI Components](#ui-components)
8. [Testing Checklist](#testing-checklist)
9. [Success Criteria](#success-criteria)

---

## Phase 1A: Public Website (Before Login)

**Goal:** Professional SaaS website that explains the platform to board gamers

### Features

#### Landing Page (`/`)

**Hero Section:**
- Headline: "India's Platform for Board Gaming Communities"
- Subheadline: "Create your community page, manage events, showcase games, and grow your following"
- CTA buttons: "Get Started" (signup) + "Explore Communities" (browse)
- Hero image/illustration showing community profiles

**Features Section:**
- 4-6 key features with icons:
  1. 🏘️ Community Profiles - "Your link-in-bio for board gaming"
  2. 🎪 Event Management - "Registrations, custom forms, QR tickets"
  3. 🎲 Game Collections - "Sync from BGG, showcase your library"
  4. 🛒 Marketplace - "Buy, sell, trade with community trust"
  5. 📊 Analytics - "Track followers, engagement, growth"
  6. 💰 Zero Cost - "Start free, scale affordably"

**How It Works:**
- Step 1: Create your community profile in 5 minutes
- Step 2: Add events, games, and content
- Step 3: Share your link, grow your following
- Visual flow diagram

**Social Proof:**
- "Join 50+ Communities Already on BoardGameCulture" (update number dynamically)
- Community logo wall (if available)
- Testimonials (when available)

**Pricing Section (if applicable):**
- Free tier features
- Premium features (future)
- Enterprise options (future)

**Footer:**
- Links to legal pages, features, about, contact
- Social media links
- Newsletter signup

#### Platform Benefits Page (`/platform`)

This is where the "Powered by BoardGameCulture" badge links to.

**Sections:**
1. **What is BoardGameCulture?**
   - Platform overview
   - Mission statement

2. **For Communities:**
   - Professional online presence
   - Event management tools
   - Grow your following
   - Track analytics

3. **For Players:**
   - Discover communities near you
   - Find events and games
   - Connect with other gamers
   - Track your collection

4. **Why Choose Us?**
   - India-specific (rupee pricing, local gateways)
   - Cost-optimized (free to start)
   - BGG-independent (own database)
   - Community-first design

5. **CTA:** "Start Building Your Community"

#### Other Public Pages

- `/features` - Detailed feature breakdown
- `/about` - About the platform and team
- `/contact` - Contact form
- `/legal/terms` - Terms & Conditions
- `/legal/privacy` - Privacy Policy
- `/legal/refund` - Refund Policy
- `/legal/cookies` - Cookie Policy
- `/guidelines` - Community Guidelines

---

## Phase 1B: Platform Dashboard (After Login)

**Goal:** Complete platform experience with navigation, feeds, and discovery

### Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│ Header: Logo | Search | Notifications | Profile     │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │          Main Content Area              │
│          │                                          │
│  Home    │                                          │
│  Games   │                                          │
│  Events  │                                          │
│  Comm.   │                                          │
│  Create  │                                          │
│          │                                          │
│  Profile │                                          │
│  Settings│                                          │
└──────────┴──────────────────────────────────────────┘
```

### Sidebar Navigation

```tsx
// Layout structure
const navigation = [
  { name: 'Home', icon: HomeIcon, href: '/dashboard' },
  { name: 'My Games', icon: DiceIcon, href: '/dashboard/games', badge: 0 },
  { name: 'Events', icon: CalendarIcon, href: '/dashboard/events' },
  { name: 'Communities', icon: UsersIcon, href: '/dashboard/communities' },
  { name: 'Create Community', icon: PlusIcon, href: '/dashboard/communities/new', highlight: true },
  // Separator
  { name: 'Profile', icon: UserIcon, href: '/dashboard/profile' },
  { name: 'Settings', icon: SettingsIcon, href: '/dashboard/settings' },
];
```

---

### 1. Home Feed (`/dashboard`)

**Purpose:** Personalized landing page after login

#### Sections:

**Welcome Banner (First-time users only):**
```tsx
<div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-lg">
  <h2>Welcome to BoardGameCulture, {user.name}! 👋</h2>
  <p>Let's get you started:</p>
  <div className="flex gap-4 mt-4">
    <Button href="/dashboard/games">Add Your First Game</Button>
    <Button href="/dashboard/communities">Follow Communities</Button>
    <Button href="/dashboard/communities/new">Create Community</Button>
  </div>
</div>
```

**Quick Stats:**
```
┌──────────────┬──────────────┬──────────────┐
│ Games: 0     │ Following: 0 │ Events: 0    │
└──────────────┴──────────────┴──────────────┘
```

**Activity Feed:**
Shows recent activity from communities you follow:
- New events posted
- New games added to collections
- Community updates
- Empty state: "Follow communities to see their activity"

**Suggestions Section:**
- "Communities in {City}" (3-4 community cards)
- "Upcoming Events Near You" (3-4 event cards)
- "Trending Games" (3-4 game cards)

**Empty State (No follows, no activity):**
```tsx
<EmptyState
  icon={<HeartIcon />}
  title="Your feed is empty"
  description="Follow communities to see their latest updates and events"
  action={
    <Button href="/dashboard/communities">
      Discover Communities
    </Button>
  }
/>
```

---

### 2. My Games (`/dashboard/games`)

**Purpose:** Personal game collection (ready for Phase 3)

#### Phase 1 Implementation (Empty State):

```tsx
<EmptyState
  icon={<DiceIcon />}
  title="Build Your Game Collection"
  description="Add games you own, track plays, and connect with others who share your interests"
  features={[
    "Sync from BoardGameGeek",
    "Manual game additions",
    "Track play history",
    "Find players with same games"
  ]}
  action={
    <Button disabled>
      Add Games (Coming in Phase 3)
    </Button>
  }
  secondaryAction={
    <Link href="/games">Browse Game Database</Link>
  }
/>
```

#### Phase 3 Will Add:
- Game search and add
- BGG sync button
- List/grid view toggle
- Filters and sorting
- Play logging

---

### 3. Events Feed (`/dashboard/events`)

**Purpose:** Discover events (ready for Phase 2)

#### Tab Navigation:

```tsx
<Tabs>
  <Tab name="Near Me" active>
    {/* Events based on user's city (IP location) */}
  </Tab>
  <Tab name="Following">
    {/* Events from communities user follows */}
  </Tab>
</Tabs>
```

#### Filters & Search:

```tsx
<div className="filters flex gap-4">
  <SearchInput placeholder="Search events..." />
  <Select name="city" options={cities} />
  <Select name="date" options={['Upcoming', 'This Week', 'This Month']} />
  <Select name="type" options={eventTypes} />
</div>
```

#### Event Cards:

```tsx
<EventCard
  image={event.cover_image}
  title={event.title}
  date={event.start_date}
  location={event.venue_name}
  city={event.city}
  community={event.community}
  attendees={event.registration_count}
  maxAttendees={event.max_attendees}
  price={event.ticket_price}
  tags={event.tags}
/>
```

#### Phase 1 Implementation (Empty State):

**"Near Me" Tab:**
```tsx
<EmptyState
  icon={<CalendarIcon />}
  title="No Events in {city} Yet"
  description="Be the first to organize an event in your city!"
  action={
    <Button href="/dashboard/communities/new">
      Create Community & Host Events
    </Button>
  }
/>
```

**"Following" Tab:**
```tsx
<EmptyState
  icon={<UsersIcon />}
  title="Follow Communities to See Their Events"
  description="Discover communities and never miss an event"
  action={
    <Button href="/dashboard/communities">
      Browse Communities
    </Button>
  }
/>
```

#### Phase 2 Will Add:
- Actual event data
- Registration functionality
- Calendar view
- Map view (future)
- "Interested" / "Going" buttons

---

### 4. Communities (`/dashboard/communities`)

**Purpose:** Discover and manage communities (FULLY FUNCTIONAL in Phase 1)

#### Tab Navigation:

```tsx
<Tabs>
  <Tab name="Discover" active>
    {/* All communities with search/filter */}
  </Tab>
  <Tab name="Following" badge={followCount}>
    {/* Communities user follows */}
  </Tab>
  <Tab name="My Communities" badge={adminCount}>
    {/* Communities user created/admins */}
  </Tab>
</Tabs>
```

#### Search & Filters:

```tsx
<div className="search-filters">
  <SearchInput
    placeholder="Search communities..."
    onChange={handleSearch}
  />

  <div className="filters flex gap-4">
    <Select
      name="city"
      placeholder="All Cities"
      options={[
        'Mumbai',
        'Bangalore',
        'Delhi',
        'Pune',
        'Hyderabad',
        'Chennai',
        'Kolkata',
        'Ahmedabad',
        'Other'
      ]}
    />

    <Select
      name="sort"
      options={[
        'Most Followers',
        'Newest',
        'Most Active',
        'Alphabetical'
      ]}
    />

    {/* Future: GPS-based */}
    <Button disabled variant="outline">
      📍 Near Me (Coming Soon)
    </Button>
  </div>
</div>
```

#### Community Grid:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {communities.map(community => (
    <CommunityCard
      key={community.id}
      logo={community.logo_url}
      name={community.name}
      description={community.description}
      city={community.city}
      followers={community.follower_count}
      events={community.events_count}
      games={community.games_count}
      isFollowing={community.is_following}
      onFollow={handleFollow}
      href={`/c/${community.slug}`}
    />
  ))}
</div>
```

#### Community Card Design:

```
┌─────────────────────────────────────┐
│  🎲 [Logo]                          │
│                                     │
│  Community Name                     │
│  📍 City                            │
│                                     │
│  Bio text truncated to 2 lines...  │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  👥 120 followers                   │
│  🎪 5 events  🎲 45 games          │
│                                     │
│  [Follow Button]  [View Profile]   │
└─────────────────────────────────────┘
```

#### Following Tab:

Shows communities user follows with:
- Same community cards
- "Unfollow" button instead of "Follow"
- Empty state if not following anyone

#### My Communities Tab:

Shows communities user admins with:
- "Manage" button → Go to community dashboard
- "View Profile" button → See public page
- Empty state with "Create Community" CTA

#### Empty States:

**Discover Tab (No results):**
```tsx
<EmptyState
  icon={<SearchIcon />}
  title="No communities found"
  description="Try adjusting your filters or search query"
  action={<Button onClick={clearFilters}>Clear Filters</Button>}
/>
```

**Following Tab (Not following anyone):**
```tsx
<EmptyState
  icon={<HeartIcon />}
  title="You're not following any communities yet"
  description="Discover communities in your city and follow them to stay updated"
  action={<Button onClick={() => setActiveTab('discover')}>Discover Communities</Button>}
/>
```

**My Communities Tab (No communities):**
```tsx
<EmptyState
  icon={<PlusCircleIcon />}
  title="Create Your First Community"
  description="Build your online presence and grow your board gaming community"
  action={<Button href="/dashboard/communities/new">Create Community</Button>}
/>
```

---

### 5. Create Community (`/dashboard/communities/new`)

**Purpose:** Guide users through community creation

#### Step 1: Benefits Page (NEW)

Before showing the form, show a benefits page:

```tsx
<div className="benefits-page max-w-4xl mx-auto py-12">
  <h1>Build Your Board Gaming Community</h1>
  <p>Join 50+ communities already using BoardGameCulture</p>

  <div className="benefits-grid grid md:grid-cols-2 gap-8 mt-12">
    <BenefitCard
      icon="🏠"
      title="Professional Profile Page"
      description="Get a shareable link-in-bio style page for your community"
      example="/c/bangalore-gamers"
    />

    <BenefitCard
      icon="🎪"
      title="Event Management"
      description="Create events, manage registrations, send QR tickets"
    />

    <BenefitCard
      icon="🎲"
      title="Showcase Games"
      description="Display your game library, sync from BGG automatically"
    />

    <BenefitCard
      icon="📊"
      title="Grow Your Following"
      description="Track followers, engagement, and community growth"
    />

    <BenefitCard
      icon="🛒"
      title="Marketplace & More"
      description="Coming soon: Help members buy, sell, and trade games"
    />

    <BenefitCard
      icon="💰"
      title="Zero Cost to Start"
      description="Free forever for basic features, scale affordably"
    />
  </div>

  <div className="testimonial mt-12">
    {/* Add testimonial if available */}
  </div>

  <div className="cta mt-12 text-center">
    <Button size="lg" href="/dashboard/communities/create">
      Start Building Your Community →
    </Button>
    <p className="text-sm text-gray-600 mt-4">
      Takes less than 5 minutes to set up
    </p>
  </div>
</div>
```

#### Step 2: Community Creation Form (`/dashboard/communities/create`)

Multi-step form (or single page with sections):

**Basic Information:**
- Community Name (required)
- URL Slug (auto-generated, editable)
- City (required, dropdown)
- Description/Bio (textarea, 500 chars)

**Branding:**
- Logo Upload (drag & drop)
- Accent Color Picker (or preset colors)

**Social Links:**
- WhatsApp Group URL
- Instagram Profile
- Discord Server
- Website URL
- Facebook Group (optional)

**Preview:**
- Show live preview of profile as they type

**Submit:**
- "Create Community" button
- On success: Redirect to community dashboard
- User automatically follows their community (follower count: 1)

---

### 6. Profile (`/dashboard/profile`)

**Purpose:** Manage user profile

**Sections:**
- Profile photo
- Full name
- Email (verified)
- Phone (optional)
- Bio (optional)
- Location (city, state)
- BGG username (for Phase 3 sync)

**Actions:**
- Update profile
- Change password
- Delete account

---

### 7. Settings (`/dashboard/settings`)

**Purpose:** Account and preference settings

**Tabs:**
1. **Account:**
   - Email, password, 2FA (future)

2. **Notifications:**
   - Email preferences
   - Event reminders
   - Follow notifications
   - Newsletter subscription

3. **Privacy:**
   - Profile visibility
   - Location sharing
   - Data export request
   - Cookie preferences

4. **Legal:**
   - Links to all legal pages
   - Download data
   - Delete account

---

## Phase 1C: Community Discovery

### Search Implementation

**Full-Text Search:**
```sql
-- PostgreSQL full-text search
CREATE INDEX idx_communities_search
ON communities
USING gin(
  to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- Search query
SELECT * FROM communities
WHERE to_tsvector('english', name || ' ' || description) @@ plainto_tsquery('english', $1)
AND is_active = true
ORDER BY follower_count DESC
LIMIT 20;
```

**Filtering:**
```typescript
// API: /api/communities?city=Bangalore&sort=followers
interface CommunityFilters {
  city?: string;
  state?: string;
  search?: string;
  sortBy?: 'followers' | 'newest' | 'active' | 'alphabetical';
  page?: number;
  limit?: number;
}
```

**Backend Logic:**
```typescript
export async function getCommunitiesWithFilters(filters: CommunityFilters) {
  let query = db.communities
    .select('*')
    .where('is_active', true);

  // City filter
  if (filters.city) {
    query = query.where('city', filters.city);
  }

  // Search
  if (filters.search) {
    query = query.whereRaw(
      `to_tsvector('english', name || ' ' || description) @@ plainto_tsquery('english', ?)`,
      [filters.search]
    );
  }

  // Sorting
  switch (filters.sortBy) {
    case 'followers':
      query = query.orderBy('follower_count', 'desc');
      break;
    case 'newest':
      query = query.orderBy('created_at', 'desc');
      break;
    case 'active':
      query = query.orderBy('updated_at', 'desc');
      break;
    case 'alphabetical':
      query = query.orderBy('name', 'asc');
      break;
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  query = query.offset((page - 1) * limit).limit(limit);

  return await query;
}
```

---

## Phase 1D: Location Detection

### IP-Based Location

**On Login/Signup:**
```typescript
// middleware/location.ts
import { NextRequest } from 'next/server';

export async function detectLocation(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

  // Use ipapi.co (free tier: 1000 requests/day)
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    return {
      ip,
      city: data.city,
      state: data.region,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    // Fallback to null location
    return {
      ip,
      city: null,
      state: null,
      country: 'India',
      latitude: null,
      longitude: null,
    };
  }
}

// On user signup/login
const location = await detectLocation(request);

await db.profiles.update(userId, {
  detected_city: location.city,
  detected_state: location.state,
  location_lat: location.latitude,
  location_lng: location.longitude,
});
```

**Allow User Override:**
```tsx
// Dashboard settings
<Select
  label="Your City"
  value={user.preferred_city || user.detected_city}
  onChange={updatePreferredCity}
  options={indianCities}
  hint={`Detected: ${user.detected_city} (from IP)`}
/>
```

**Use in Discovery:**
```typescript
// Default to user's city in community discovery
const defaultFilters = {
  city: user.preferred_city || user.detected_city,
  sortBy: 'followers'
};
```

---

## Database Schema

### Updated `profiles` Table

```sql
ALTER TABLE profiles
ADD COLUMN detected_city TEXT,
ADD COLUMN detected_state TEXT,
ADD COLUMN preferred_city TEXT,
ADD COLUMN location_lat DECIMAL(10,8),
ADD COLUMN location_lng DECIMAL(11,8),
ADD COLUMN bgg_username TEXT,
ADD COLUMN bio TEXT,
ADD COLUMN avatar_url TEXT;

CREATE INDEX idx_profiles_city ON profiles(COALESCE(preferred_city, detected_city));
```

### Updated `communities` Table

```sql
ALTER TABLE communities
ADD COLUMN city TEXT NOT NULL,
ADD COLUMN state TEXT,
ADD COLUMN follower_count INT DEFAULT 1; -- Starts at 1 (admin auto-follows)

CREATE INDEX idx_communities_city ON communities(city);
CREATE INDEX idx_communities_follower_count ON communities(follower_count DESC);
```

### `community_followers` Table

```sql
CREATE TABLE community_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

CREATE INDEX idx_community_followers_community ON community_followers(community_id);
CREATE INDEX idx_community_followers_user ON community_followers(user_id);

-- Trigger: Update follower count
CREATE OR REPLACE FUNCTION update_community_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET follower_count = follower_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET follower_count = follower_count - 1
    WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follower_count
AFTER INSERT OR DELETE ON community_followers
FOR EACH ROW EXECUTE FUNCTION update_community_follower_count();

-- Trigger: Auto-follow on community creation
CREATE OR REPLACE FUNCTION auto_follow_own_community()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO community_followers (community_id, user_id)
  VALUES (NEW.id, NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_follow_community
AFTER INSERT ON communities
FOR EACH ROW EXECUTE FUNCTION auto_follow_own_community();
```

### Full Schema

See PHASES.md Phase 1 for complete schema including:
- `profiles`
- `communities`
- `community_admins`
- `community_followers`
- `legal_acceptances`

---

## API Routes

### Authentication
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/reset-password
```

### Communities
```
GET    /api/communities                # List/search communities
POST   /api/communities                # Create community
GET    /api/communities/:slug          # Get community details
PATCH  /api/communities/:slug          # Update community
DELETE /api/communities/:slug          # Delete community
POST   /api/communities/:slug/follow   # Follow community
DELETE /api/communities/:slug/follow   # Unfollow community
GET    /api/communities/:slug/followers # Get followers (paginated)
```

### User
```
GET    /api/users/me                   # Get current user
PATCH  /api/users/me                   # Update profile
GET    /api/users/me/following         # Communities user follows
GET    /api/users/me/communities       # Communities user admins
```

### Dashboard
```
GET    /api/dashboard/stats            # User stats (games, follows, events)
GET    /api/dashboard/feed             # Activity feed
GET    /api/dashboard/suggestions      # Suggested communities/events
```

### Location
```
POST   /api/location/detect            # Detect location from IP
PATCH  /api/location/set-city          # Set preferred city
```

### Legal
```
POST   /api/legal/accept               # Log legal acceptance
GET    /api/legal/acceptances          # Get user's acceptances
```

---

## UI Components

### Layout Components
```
/components/layout/
  - DashboardLayout.tsx        # Main dashboard shell
  - Sidebar.tsx                # Navigation sidebar
  - Header.tsx                 # Top header with search/notifications
  - Footer.tsx                 # Footer with legal links
  - PoweredByBadge.tsx         # "Powered by BGC" badge
```

### Dashboard Components
```
/components/dashboard/
  - WelcomeBanner.tsx          # First-time user welcome
  - QuickStats.tsx             # Stats cards
  - ActivityFeed.tsx           # Feed of updates
  - SuggestionSection.tsx      # Suggested content
  - EmptyState.tsx             # Reusable empty state
```

### Community Components
```
/components/community/
  - CommunityCard.tsx          # Community display card
  - CommunityGrid.tsx          # Grid of communities
  - CommunitySearch.tsx        # Search bar
  - CommunityFilters.tsx       # Filter controls
  - FollowButton.tsx           # Follow/unfollow button
  - CreateCommunityForm.tsx    # Community creation form
  - BenefitsPage.tsx           # Create community benefits
```

### Event Components (Empty States)
```
/components/events/
  - EventCard.tsx              # Event display card (for Phase 2)
  - EventFilters.tsx           # Filter controls
  - EventEmptyState.tsx        # No events message
```

### Game Components (Empty States)
```
/components/games/
  - GameCard.tsx               # Game display card (for Phase 3)
  - GameEmptyState.tsx         # No games message
```

### Public Components
```
/components/public/
  - LandingHero.tsx            # Landing page hero
  - FeaturesSection.tsx        # Features showcase
  - HowItWorks.tsx             # Step-by-step guide
  - SocialProof.tsx            # Testimonials/logos
  - PricingSection.tsx         # Pricing tiers
```

### Common Components
```
/components/ui/
  - Button.tsx                 # Button (shadcn)
  - Input.tsx                  # Input (shadcn)
  - Select.tsx                 # Select (shadcn)
  - Card.tsx                   # Card (shadcn)
  - Tabs.tsx                   # Tabs (shadcn)
  - Badge.tsx                  # Badge (shadcn)
  - Avatar.tsx                 # Avatar (shadcn)
  - EmptyState.tsx             # Generic empty state
  - LoadingSpinner.tsx         # Loading indicator
```

---

## Pages/Routes

### Public Routes
```
/                              # Landing page
/platform                      # Platform benefits
/features                      # Feature details
/about                         # About us
/contact                       # Contact form
/legal/terms                   # Terms & Conditions
/legal/privacy                 # Privacy Policy
/legal/refund                  # Refund Policy
/legal/cookies                 # Cookie Policy
/guidelines                    # Community Guidelines

/c/[slug]                      # Public community profile
/games                         # Browse games (Phase 3)
/events                        # Browse events (Phase 2)
```

### Auth Routes
```
/auth/signup                   # Sign up
/auth/login                    # Login
/auth/reset                    # Password reset
/auth/verify                   # Email verification
```

### Dashboard Routes
```
/dashboard                     # Home feed
/dashboard/games               # My games (empty state)
/dashboard/events              # Events feed (empty state)
/dashboard/communities         # Community discovery
/dashboard/communities/new     # Create community (benefits)
/dashboard/communities/create  # Create community (form)
/dashboard/profile             # User profile
/dashboard/settings            # Settings

# Community Management (for admins)
/dashboard/[communityId]       # Community dashboard
/dashboard/[communityId]/edit  # Edit community
```

---

## Testing Checklist

### Public Website
- [ ] Landing page loads and is responsive
- [ ] All sections display correctly
- [ ] CTAs work (signup/login)
- [ ] Platform benefits page loads
- [ ] All legal pages are accessible
- [ ] Footer links work
- [ ] Mobile navigation works

### Authentication
- [ ] User can sign up with email/password
- [ ] Email verification sent
- [ ] User can log in
- [ ] User can reset password
- [ ] Terms acceptance checkbox works
- [ ] Legal acceptance logged in database
- [ ] Session persists across page reloads

### Location Detection
- [ ] IP location detected on signup
- [ ] City saved to profile
- [ ] User can override detected city
- [ ] Preferred city persists

### Dashboard
- [ ] Dashboard loads after login
- [ ] Sidebar navigation works
- [ ] Welcome banner shows for new users
- [ ] Quick stats display correctly
- [ ] All dashboard sections accessible

### Community Discovery
- [ ] Communities list loads
- [ ] Search works
- [ ] City filter works
- [ ] Sort options work
- [ ] Pagination works
- [ ] Community cards display correctly
- [ ] Tabs switch correctly (Discover/Following/My)

### Follow System
- [ ] User can follow community
- [ ] User can unfollow community
- [ ] Follower count updates correctly
- [ ] Following status persists
- [ ] Following tab shows followed communities
- [ ] Non-logged-in users redirected to login

### Community Creation
- [ ] Benefits page displays
- [ ] Form loads correctly
- [ ] Slug auto-generates from name
- [ ] Logo upload works
- [ ] Color picker works
- [ ] City dropdown populates
- [ ] Form validation works
- [ ] Community created successfully
- [ ] User auto-follows own community
- [ ] Initial follower count is 1
- [ ] Redirect to community dashboard

### Empty States
- [ ] Games section shows empty state
- [ ] Events section shows empty state
- [ ] No followers shows empty state
- [ ] No results shows empty state
- [ ] Empty states have correct CTAs

### Powered By Badge
- [ ] Badge displays on community pages
- [ ] Badge does not display on dashboard
- [ ] Badge links to /platform
- [ ] Badge has hover effect
- [ ] Badge is responsive

### Profile & Settings
- [ ] User can update profile
- [ ] Profile changes save correctly
- [ ] Settings tabs work
- [ ] Preferences are saved
- [ ] User can change city preference

### RLS & Permissions
- [ ] Users can only edit own profile
- [ ] Users can only edit own communities
- [ ] Following is user-specific
- [ ] Public pages are accessible without auth
- [ ] Dashboard requires authentication

---

## Success Criteria

### Performance
- ✅ Landing page loads in <2 seconds
- ✅ Dashboard loads in <2 seconds
- ✅ Community search returns results in <500ms
- ✅ Follow/unfollow action completes in <500ms
- ✅ Community creation takes <30 seconds

### User Experience
- ✅ New user can sign up in <2 minutes
- ✅ New user can create community in <5 minutes
- ✅ New user can find and follow communities in <1 minute
- ✅ Mobile experience is smooth
- ✅ All empty states guide users to next actions

### Functionality
- ✅ 100% of Phase 1 features working
- ✅ Location detection works for 95% of users
- ✅ Search returns relevant results
- ✅ Follow system is reliable
- ✅ All legal pages are complete

### Business Metrics
- ✅ Platform explains value proposition clearly
- ✅ Users understand how to create communities
- ✅ Users can discover communities easily
- ✅ Foundation ready for Phase 2 (Events)
- ✅ Foundation ready for Phase 3 (Games)

---

## Phase 1 Complete! ✅

**What Users Can Do:**
1. ✅ Visit professional landing page
2. ✅ Sign up and verify email
3. ✅ Access full platform dashboard
4. ✅ Create community profiles
5. ✅ Follow/unfollow communities
6. ✅ Discover communities (search, filter by city)
7. ✅ See platform prepared for games & events
8. ✅ Update profile and settings

**What's Ready for Next Phases:**
- ✅ Event feed structure (Phase 2 will populate)
- ✅ Game collection structure (Phase 3 will populate)
- ✅ Dashboard navigation complete
- ✅ User base and community base growing
- ✅ Location-aware features working

**Platform is now a complete product, not just community profiles!**
