# BoardGameCulture - Detailed Phase Planning

**Version:** 1.0
**Last Updated:** February 2026
**Status:** Planning Phase

---

## Table of Contents

1. [Phase 1: Community Profiles (Linktree MVP)](#phase-1-community-profiles-linktree-mvp)
2. [Phase 2: Event Management + Custom Forms](#phase-2-event-management--custom-forms)
3. [Phase 3: Game Collection Management](#phase-3-game-collection-management)
4. [Phase 4: Photo Galleries](#phase-4-photo-galleries)
5. [Phase 5: Reviews & Beginner Guides](#phase-5-reviews--beginner-guides)
6. [Phase 6: Marketplace & Bidding](#phase-6-marketplace--bidding)
7. [Phase 7: Payment Integration](#phase-7-payment-integration)
8. [Phase 8: Discussion Forums](#phase-8-discussion-forums)
9. [Phase 9: Play Logging & Statistics](#phase-9-play-logging--statistics)

---

## Phase 1: Community Profiles (Linktree MVP)

**Duration:** Week 1-2
**Goal:** Any community can create a shareable profile page in <5 minutes
**Dependencies:** None (Foundation phase)

### Features Breakdown

#### 1.1 Authentication System
- Email/password sign up
- Email verification
- Login/logout
- Password reset flow
- Session management (Supabase Auth)

#### 1.2 User Profile Creation
- Basic profile setup (name, email)
- Role assignment (default: 'user')
- Profile completion tracking

#### 1.3 Community Creation
- Create new community
- Slug generation and validation (URL-safe, unique)
- Community name and description
- Logo upload (Supabase Storage)
- Custom accent color picker
- Social links (WhatsApp, Instagram, Discord, Website)
- Set founding admin

#### 1.4 Community Profile Page (Public)
- Clean, mobile-first vertical layout
- Hero section with logo and name
- Bio/description section
- Social link buttons (large, tappable)
- Statistics cards (members, events, games - all 0 initially)
- "Powered by BoardGameCulture" footer
- Share button (copy link)
- Responsive design (mobile/tablet/desktop)

#### 1.5 Community Dashboard
- Edit community profile
- Preview changes before saving
- Upload/change logo
- Manage social links
- View basic analytics (page views - later)

### Database Schema

```sql
-- Users and Authentication (Supabase Auth handles most)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'user')) DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communities
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  accent_color TEXT DEFAULT '#FF6B6B', -- Coral default

  -- Social links
  whatsapp_url TEXT,
  instagram_url TEXT,
  discord_url TEXT,
  website_url TEXT,

  -- Statistics (updated via triggers/functions later)
  member_count INT DEFAULT 0,
  events_count INT DEFAULT 0,
  games_count INT DEFAULT 0,

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Admins (many-to-many)
CREATE TABLE community_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'moderator')) DEFAULT 'admin',
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Indexes
CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_created_by ON communities(created_by);
CREATE INDEX idx_community_admins_user ON community_admins(user_id);
CREATE INDEX idx_community_admins_community ON community_admins(community_id);
```

### Row Level Security (RLS) Policies

```sql
-- Profiles: Users can read all, update only their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Communities: Public read, restricted write
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Communities are viewable by everyone"
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

CREATE POLICY "Platform admins can see all communities"
ON communities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Community Admins
ALTER TABLE community_admins ENABLE ROW LEVEL SECURITY;

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
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
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
```

### API Routes (Next.js App Router)

```
/api/auth/
  POST /signup          # Create new user account
  POST /login           # Authenticate user
  POST /logout          # End session
  POST /reset-password  # Send reset email

/api/communities/
  POST /                # Create new community
  GET /:slug            # Get community by slug
  PATCH /:slug          # Update community
  GET /:slug/check      # Check slug availability

/api/profiles/
  GET /me               # Get current user profile
  PATCH /me             # Update current user profile
```

### UI Components to Build

```
/components/auth/
  - SignUpForm.tsx
  - LoginForm.tsx
  - PasswordResetForm.tsx
  - AuthProvider.tsx

/components/community/
  - CommunityForm.tsx           # Create/edit community
  - SlugInput.tsx               # Slug field with validation
  - ColorPicker.tsx             # Accent color selector
  - LogoUploader.tsx            # Image upload component
  - SocialLinksForm.tsx         # Social media links

/components/profile/
  - CommunityCard.tsx           # Public profile display
  - StatsCard.tsx               # Statistics display
  - ShareButton.tsx             # Copy link functionality

/components/ui/
  - Button.tsx                  # shadcn/ui button
  - Input.tsx                   # shadcn/ui input
  - Card.tsx                    # shadcn/ui card
  - Avatar.tsx                  # shadcn/ui avatar
  - Toast.tsx                   # Notifications
```

### Pages/Routes

```
/app/
  page.tsx                      # Landing page
  /auth/
    signup/page.tsx             # Sign up page
    login/page.tsx              # Login page
    reset/page.tsx              # Password reset

  /c/
    [slug]/page.tsx             # Public community profile

  /dashboard/
    page.tsx                    # User dashboard (list communities)
    new/page.tsx                # Create new community
    [id]/
      page.tsx                  # Community dashboard
      edit/page.tsx             # Edit community profile
```

### Testing Checklist

- [ ] User can sign up with email/password
- [ ] Email verification works
- [ ] User can log in and out
- [ ] Password reset flow works
- [ ] User can create a community
- [ ] Slug validation prevents duplicates
- [ ] Slug generation handles special characters
- [ ] Logo upload works (max 2MB, image only)
- [ ] Accent color picker works
- [ ] Social links are validated (URL format)
- [ ] Public profile page displays correctly
- [ ] Public profile is mobile-responsive
- [ ] Share button copies correct URL
- [ ] Community admin can edit their community
- [ ] Non-admin cannot edit community
- [ ] Statistics show 0 initially
- [ ] RLS policies enforce permissions

### Success Criteria

- ✅ Community creation takes <5 minutes
- ✅ Public profile page loads in <2 seconds
- ✅ Mobile-first design works on all screen sizes
- ✅ URL sharing works on WhatsApp, Instagram, Twitter
- ✅ Logo displays properly (no distortion)
- ✅ All RLS policies enforced correctly

---

## Phase 2: Event Management + Custom Forms

**Duration:** Week 3-4
**Goal:** Communities can create events with custom registration forms
**Dependencies:** Phase 1 (Community profiles must exist)

### Features Breakdown

#### 2.1 Event Creation
- Basic event details form
  - Title, description (rich text editor)
  - Start date/time, end date/time
  - Venue name and address
  - City (for filtering)
  - Event type (game night, tournament, workshop, etc.)
- Ticket settings
  - Free or paid
  - Ticket price (INR)
  - Maximum attendees (capacity)
- Event visibility (draft/published)
- Event cover image upload

#### 2.2 Custom Form Builder
- Drag-and-drop form builder UI
- Default fields (always included):
  - Full Name (text, required)
  - Email (email, required)
  - Phone (tel, required)
- Custom field types:
  - Short text (single line)
  - Long text (textarea)
  - Email (with validation)
  - Phone (with validation)
  - Number (age, guest count, etc.)
  - Dropdown (single select)
  - Checkbox (multiple select)
  - Radio buttons (single select)
  - File upload (ID proof, documents)
  - Date picker
- Field configuration:
  - Label
  - Placeholder text
  - Required/optional
  - Help text
  - Validation rules
- Field ordering (drag to reorder)
- Preview mode

#### 2.3 Event Registration (Public)
- Browse events (public listing)
  - Filter by city, date, event type
  - Search by name
  - Upcoming events only
- Event detail page
  - All event information
  - Registration form (dynamic)
  - Attendee count (X/Y spots filled)
  - Map integration (optional - future)
- Dynamic form rendering
  - Renders based on custom_form_schema
  - Client-side validation
  - Server-side validation
- Registration submission
  - Save to database
  - Send confirmation email
  - Generate QR code ticket
  - Show success message

#### 2.4 Event Management (Dashboard)
- List all events for community
- Create new event
- Edit/delete events
- View registrations
  - Attendee list
  - Custom form responses
  - Export to CSV
  - Filter/search attendees
- Check-in system
  - Scan QR codes
  - Manual check-in
  - View check-in status

#### 2.5 QR Code Tickets
- Generate unique QR code per registration
- QR code contains: event_id + registration_id + verification_hash
- Email QR code to attendee
- Check-in app can scan and verify

### Database Schema

```sql
-- Event Types (optional lookup table)
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default types
INSERT INTO event_types (name, slug) VALUES
  ('Game Night', 'game-night'),
  ('Tournament', 'tournament'),
  ('Workshop', 'workshop'),
  ('Convention', 'convention'),
  ('Meetup', 'meetup');

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Event Registrations
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- null if not logged in

  -- Basic info (from form)
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
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, email)
);

-- Indexes
CREATE INDEX idx_events_community ON events(community_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_registrations_ticket ON event_registrations(ticket_code);

-- Full-text search on events
CREATE INDEX idx_events_search ON events USING gin(to_tsvector('english', title || ' ' || description));

-- Trigger to update registration_count
CREATE OR REPLACE FUNCTION update_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events SET registration_count = registration_count + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events SET registration_count = registration_count - 1
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_registration_count
AFTER INSERT OR DELETE ON event_registrations
FOR EACH ROW EXECUTE FUNCTION update_event_registration_count();

-- Trigger to update events_count in communities
CREATE OR REPLACE FUNCTION update_community_events_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET events_count = events_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET events_count = events_count - 1
    WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_events_count
AFTER INSERT OR DELETE ON events
FOR EACH ROW EXECUTE FUNCTION update_community_events_count();
```

### Custom Form Schema Structure

```typescript
// types/forms.ts
export interface FormField {
  id: string; // unique within form
  type: 'text' | 'textarea' | 'email' | 'tel' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'radio' | 'file';
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;

  // For dropdown, checkbox, radio
  options?: string[];

  // Validation
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    fileTypes?: string[]; // ['image/*', 'application/pdf']
    maxFileSize?: number; // in MB
  };

  // UI
  fullWidth?: boolean;
  sortOrder: number;
}

export interface CustomFormSchema {
  fields: FormField[];
}

// Example schema
const exampleSchema: CustomFormSchema = {
  fields: [
    {
      id: 'dietary',
      type: 'dropdown',
      label: 'Dietary Preference',
      required: true,
      options: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain'],
      sortOrder: 1
    },
    {
      id: 'experience',
      type: 'radio',
      label: 'Gaming Experience',
      required: true,
      options: ['Beginner', 'Intermediate', 'Expert'],
      sortOrder: 2
    },
    {
      id: 'games_interested',
      type: 'textarea',
      label: 'Which games would you like to play?',
      placeholder: 'E.g., Catan, Ticket to Ride...',
      required: false,
      sortOrder: 3
    },
    {
      id: 'tshirt_size',
      type: 'dropdown',
      label: 'T-Shirt Size',
      required: false,
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      sortOrder: 4
    }
  ]
};
```

### RLS Policies

```sql
-- Events: Public can read published, admins can manage
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published events viewable by everyone"
ON events FOR SELECT
USING (status = 'published');

CREATE POLICY "Community admins can manage their events"
ON events FOR ALL
USING (
  community_id IN (
    SELECT community_id FROM community_admins
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Platform admins can manage all events"
ON events FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Event Registrations
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register for events"
ON event_registrations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own registrations"
ON event_registrations FOR SELECT
USING (
  user_id = auth.uid()
  OR email = (SELECT email FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Community admins can view all registrations for their events"
ON event_registrations FOR SELECT
USING (
  event_id IN (
    SELECT e.id FROM events e
    INNER JOIN community_admins ca ON e.community_id = ca.community_id
    WHERE ca.user_id = auth.uid()
  )
);

CREATE POLICY "Community admins can check-in attendees"
ON event_registrations FOR UPDATE
USING (
  event_id IN (
    SELECT e.id FROM events e
    INNER JOIN community_admins ca ON e.community_id = ca.community_id
    WHERE ca.user_id = auth.uid()
  )
);
```

### API Routes

```
/api/events/
  POST /                        # Create event
  GET /:id                      # Get event details
  PATCH /:id                    # Update event
  DELETE /:id                   # Delete event
  GET /                         # List events (public, with filters)
  GET /:id/registrations        # Get registrations (admin only)
  POST /:id/register            # Register for event
  GET /:id/check-availability   # Check if spots available

/api/events/:id/registrations/
  GET /:registrationId          # Get registration details
  PATCH /:registrationId/check-in  # Check-in attendee
  GET /export                   # Export to CSV (admin only)

/api/events/:id/qr/
  POST /generate                # Generate QR code
  POST /verify                  # Verify QR code on check-in
```

### UI Components

```
/components/events/
  - EventForm.tsx               # Create/edit event
  - CustomFormBuilder.tsx       # Form builder UI
  - FormFieldEditor.tsx         # Edit individual field
  - FormFieldPreview.tsx        # Preview field
  - DynamicForm.tsx             # Render form from schema
  - EventCard.tsx               # Event display card
  - EventList.tsx               # List of events
  - RegistrationForm.tsx        # Public registration
  - AttendeeList.tsx            # Admin view attendees
  - CheckInScanner.tsx          # QR scanner component
  - TicketDisplay.tsx           # Show QR ticket to user

/lib/qr/
  - generateQR.ts               # QR code generation
  - verifyQR.ts                 # QR code verification
```

### Pages/Routes

```
/app/
  /events/
    page.tsx                    # Public event listing
    [id]/page.tsx               # Event detail + registration
    [id]/ticket/page.tsx        # View ticket after registration

  /dashboard/
    [communityId]/
      events/
        page.tsx                # List community events
        new/page.tsx            # Create new event
        [id]/
          edit/page.tsx         # Edit event
          registrations/page.tsx # View registrations
          check-in/page.tsx     # Check-in interface
```

### Testing Checklist

- [ ] Community admin can create event
- [ ] Event slug is unique within community
- [ ] Custom form builder allows adding all field types
- [ ] Form fields can be reordered
- [ ] Form preview works correctly
- [ ] Required fields are enforced
- [ ] Dynamic form renders correctly from schema
- [ ] Public can register for free events
- [ ] Registration validates all fields (client + server)
- [ ] Duplicate email registrations are prevented
- [ ] QR code is generated on registration
- [ ] Confirmation email is sent
- [ ] Admin can view all registrations
- [ ] Admin can export registrations to CSV
- [ ] QR code check-in works
- [ ] Registration count updates correctly
- [ ] Capacity limits are enforced
- [ ] Event listing shows correct filters
- [ ] Search works on event titles

### Success Criteria

- ✅ Form builder is intuitive (non-technical user can use it)
- ✅ Registration takes <2 minutes
- ✅ QR code generation is instant
- ✅ CSV export includes all custom fields
- ✅ Check-in process takes <10 seconds per person
- ✅ Mobile-responsive registration form

---

## Phase 3: Game Collection Management

**Duration:** Week 5-6
**Goal:** Communities can showcase their game collections, sync from BGG
**Dependencies:** Phase 1 (Communities must exist)

### Features Breakdown

#### 3.1 Internal Game Database
- Master games table (BGG-independent)
- Store complete game information
- Support for both BGG and non-BGG games
- Search functionality
- Filtering and sorting

#### 3.2 Manual Game Addition
- Search existing games in database
- Request to add new game (if not found)
- Admin approval workflow
- Add game details:
  - Name, year published
  - Player count (min/max)
  - Play time
  - Complexity rating
  - Description
  - Image upload
  - Categories/mechanics (tags)

#### 3.3 BGG API Integration
- Fetch user collection from BGG
- Background job queue for syncing
- Rate limiting (1-2 req/sec)
- Parse XML responses
- Handle API errors gracefully
- Store raw XML for debugging
- Sync progress indicator

#### 3.4 BGG Sync Workflow
- User enters BGG username
- Initiate sync job
- Fetch collection XML
- For each game:
  - Check if exists in DB (by bgg_id)
  - If not, fetch game details
  - Create game record
  - Link to community collection
- Show sync status (pending → processing → complete)
- Manual re-sync option
- Conflict resolution

#### 3.5 Community Game Collections
- Add games to collection
- Collection status:
  - Own (physically own)
  - Wishlist (want to buy)
  - Played (have played before)
  - Want to Play (interested)
- Notes per game
- Condition tracking
- Play count
- Display on community profile
- Filter/sort collection

#### 3.6 Game Detail Pages
- Full game information
- BGG rating and stats
- Communities that own it
- Where to buy (retailers)
- Reviews (Phase 5)
- Link to BGG page

### Database Schema

```sql
-- Games (Master Database)
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bgg_id INT UNIQUE, -- null for non-BGG games

  -- Basic info
  name TEXT NOT NULL,
  year_published INT,
  image_url TEXT,
  thumbnail_url TEXT,
  description TEXT,

  -- Gameplay
  min_players INT,
  max_players INT,
  playtime_min INT, -- minutes
  playtime_max INT, -- minutes
  recommended_age INT,

  -- Complexity
  complexity DECIMAL(3,2), -- 1.00 to 5.00
  avg_weight DECIMAL(3,2), -- BGG weight rating

  -- BGG stats
  bgg_rating DECIMAL(4,2),
  bgg_num_ratings INT,
  bgg_rank INT,

  -- Categorization
  categories TEXT[], -- Array of category names
  mechanics TEXT[], -- Array of mechanic names
  designers TEXT[], -- Array of designer names
  publishers TEXT[], -- Array of publisher names

  -- BGG sync
  synced_from_bgg BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMPTZ,
  raw_bgg_data JSONB, -- Store raw XML/JSON for debugging

  -- Metadata
  is_approved BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Game Collections
CREATE TABLE community_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  -- Collection status
  status TEXT CHECK (status IN ('own', 'wishlist', 'played', 'want_to_play')) NOT NULL,

  -- Ownership details (for 'own' status)
  condition TEXT CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')),
  acquisition_date DATE,
  purchase_price DECIMAL(10,2),
  notes TEXT,

  -- Play tracking
  times_played INT DEFAULT 0,
  last_played_at TIMESTAMPTZ,

  -- Display
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,

  -- Metadata
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(community_id, game_id, status) -- Same game can be in multiple statuses
);

-- BGG Sync Jobs (Track sync progress)
CREATE TABLE bgg_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  bgg_username TEXT NOT NULL,

  -- Status
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',

  -- Progress
  total_games INT DEFAULT 0,
  processed_games INT DEFAULT 0,
  new_games_added INT DEFAULT 0,
  existing_games_linked INT DEFAULT 0,

  -- Error handling
  error_message TEXT,
  retry_count INT DEFAULT 0,

  -- Metadata
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  initiated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Addition Requests (Manual addition workflow)
CREATE TABLE game_addition_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Game details
  name TEXT NOT NULL,
  year_published INT,
  bgg_id INT,
  bgg_url TEXT,
  image_url TEXT,
  description TEXT,

  -- Request details
  requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
  reason TEXT, -- Why they want this game added

  -- Status
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- If approved, link to created game
  approved_game_id UUID REFERENCES games(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_games_bgg_id ON games(bgg_id) WHERE bgg_id IS NOT NULL;
CREATE INDEX idx_games_name ON games(name);
CREATE INDEX idx_games_search ON games USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_games_year ON games(year_published);
CREATE INDEX idx_games_rating ON games(bgg_rating DESC NULLS LAST);

CREATE INDEX idx_community_games_community ON community_games(community_id);
CREATE INDEX idx_community_games_game ON community_games(game_id);
CREATE INDEX idx_community_games_status ON community_games(status);

CREATE INDEX idx_sync_jobs_community ON bgg_sync_jobs(community_id);
CREATE INDEX idx_sync_jobs_status ON bgg_sync_jobs(status);

-- Trigger to update games_count in communities
CREATE OR REPLACE FUNCTION update_community_games_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'own' THEN
    UPDATE communities SET games_count = games_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'own' THEN
    UPDATE communities SET games_count = games_count - 1
    WHERE id = OLD.community_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'own' THEN
      UPDATE communities SET games_count = games_count + 1
      WHERE id = NEW.community_id;
    ELSIF OLD.status = 'own' THEN
      UPDATE communities SET games_count = games_count - 1
      WHERE id = NEW.community_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_games_count
AFTER INSERT OR UPDATE OR DELETE ON community_games
FOR EACH ROW EXECUTE FUNCTION update_community_games_count();
```

### BGG API Integration

```typescript
// lib/bgg/client.ts

export class BGGClient {
  private baseUrl = 'https://boardgamegeek.com/xmlapi2';
  private requestQueue: Queue; // Use bullmq or similar

  /**
   * Fetch user's collection from BGG
   * Endpoint: /collection?username={user}
   */
  async fetchCollection(username: string): Promise<BGGCollectionItem[]> {
    const url = `${this.baseUrl}/collection?username=${username}&stats=1`;
    const response = await this.throttledRequest(url);
    return this.parseCollectionXML(response);
  }

  /**
   * Fetch detailed game information
   * Endpoint: /thing?id={id}&stats=1
   */
  async fetchGameDetails(bggId: number): Promise<BGGGameDetails> {
    const url = `${this.baseUrl}/thing?id=${bggId}&stats=1`;
    const response = await this.throttledRequest(url);
    return this.parseGameDetailsXML(response);
  }

  /**
   * Search games by name
   * Endpoint: /search?query={query}&type=boardgame
   */
  async searchGames(query: string): Promise<BGGSearchResult[]> {
    const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}&type=boardgame`;
    const response = await this.throttledRequest(url);
    return this.parseSearchXML(response);
  }

  /**
   * Rate-limited request (max 1-2 req/sec)
   */
  private async throttledRequest(url: string): Promise<string> {
    return this.requestQueue.add('bgg-request', { url });
  }

  /**
   * Parse XML responses
   */
  private parseCollectionXML(xml: string): BGGCollectionItem[] {
    // Use xml2js or fast-xml-parser
  }

  private parseGameDetailsXML(xml: string): BGGGameDetails {
    // Parse game details
  }

  /**
   * Handle BGG API errors
   * - 202: Request accepted, retry
   * - 429: Rate limited, backoff
   * - 500: BGG error, retry with exponential backoff
   */
  private handleError(error: Error, retryCount: number) {
    // Implement exponential backoff
  }
}

// Background job for syncing
// lib/jobs/bgg-sync.ts
export async function syncBGGCollection(jobId: string) {
  const job = await db.bgg_sync_jobs.findById(jobId);
  const client = new BGGClient();

  try {
    // Update status to processing
    await db.bgg_sync_jobs.update(jobId, {
      status: 'processing',
      started_at: new Date()
    });

    // Fetch collection
    const collection = await client.fetchCollection(job.bgg_username);

    await db.bgg_sync_jobs.update(jobId, {
      total_games: collection.length
    });

    // Process each game
    for (const item of collection) {
      // Check if game exists
      let game = await db.games.findByBggId(item.bgg_id);

      if (!game) {
        // Fetch full details and create
        const details = await client.fetchGameDetails(item.bgg_id);
        game = await db.games.create({
          bgg_id: item.bgg_id,
          name: details.name,
          year_published: details.year,
          // ... other fields
          synced_from_bgg: true,
          synced_at: new Date(),
          raw_bgg_data: details
        });
      }

      // Link to community collection
      await db.community_games.upsert({
        community_id: job.community_id,
        game_id: game.id,
        status: item.owned ? 'own' : 'played'
      });

      // Update progress
      await db.bgg_sync_jobs.update(jobId, {
        processed_games: job.processed_games + 1
      });
    }

    // Mark complete
    await db.bgg_sync_jobs.update(jobId, {
      status: 'completed',
      completed_at: new Date()
    });

  } catch (error) {
    // Handle error
    await db.bgg_sync_jobs.update(jobId, {
      status: 'failed',
      error_message: error.message,
      retry_count: job.retry_count + 1
    });

    // Retry if not exceeded max retries
    if (job.retry_count < 3) {
      // Schedule retry
    }
  }
}
```

### RLS Policies

```sql
-- Games: Public read, admin write
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Games viewable by everyone"
ON games FOR SELECT
USING (is_approved = true);

CREATE POLICY "Platform admins can manage games"
ON games FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Community Games
ALTER TABLE community_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community games viewable by everyone"
ON community_games FOR SELECT
USING (true);

CREATE POLICY "Community admins can manage their games"
ON community_games FOR ALL
USING (
  community_id IN (
    SELECT community_id FROM community_admins
    WHERE user_id = auth.uid()
  )
);

-- Game Addition Requests
ALTER TABLE game_addition_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create game requests"
ON game_addition_requests FOR INSERT
WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Users can view own requests"
ON game_addition_requests FOR SELECT
USING (requested_by = auth.uid());

CREATE POLICY "Admins can manage all requests"
ON game_addition_requests FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
```

### API Routes

```
/api/games/
  GET /                         # Search/list games
  GET /:id                      # Get game details
  POST /                        # Create game (admin only)
  PATCH /:id                    # Update game (admin only)

/api/games/requests/
  POST /                        # Request new game addition
  GET /                         # List requests (admin)
  PATCH /:id/approve            # Approve request (admin)
  PATCH /:id/reject             # Reject request (admin)

/api/communities/:id/games/
  GET /                         # Get community collection
  POST /                        # Add game to collection
  PATCH /:gameId                # Update collection entry
  DELETE /:gameId               # Remove from collection

/api/communities/:id/bgg-sync/
  POST /                        # Initiate BGG sync
  GET /:jobId                   # Get sync job status
  POST /:jobId/retry            # Retry failed sync
```

### UI Components

```
/components/games/
  - GameSearch.tsx              # Search games autocomplete
  - GameCard.tsx                # Display game card
  - GameGrid.tsx                # Grid of game cards
  - GameDetails.tsx             # Full game details
  - AddGameModal.tsx            # Add game to collection
  - GameRequestForm.tsx         # Request new game
  - BGGSyncButton.tsx           # Initiate BGG sync
  - SyncProgress.tsx            # Show sync progress
  - CollectionFilters.tsx       # Filter collection
  - CollectionStats.tsx         # Collection statistics

/components/admin/
  - GameApprovalQueue.tsx       # Admin queue for game requests
  - GameForm.tsx                # Create/edit games
```

### Pages/Routes

```
/app/
  /games/
    page.tsx                    # Browse all games
    [id]/page.tsx               # Game detail page

  /dashboard/
    [communityId]/
      games/
        page.tsx                # Community collection
        add/page.tsx            # Add games manually
        sync/page.tsx           # BGG sync interface

  /admin/
    games/
      page.tsx                  # Admin game management
      requests/page.tsx         # Game addition requests
      [id]/edit/page.tsx        # Edit game details
```

### Testing Checklist

- [ ] BGG API client handles rate limiting
- [ ] BGG sync job processes correctly
- [ ] Duplicate BGG games are not created
- [ ] Non-BGG games can be added manually
- [ ] Game addition request workflow works
- [ ] Admin can approve/reject game requests
- [ ] Community can add games to collection
- [ ] Collection filters work correctly
- [ ] Game search is fast and accurate
- [ ] BGG sync shows progress indicator
- [ ] Failed syncs can be retried
- [ ] Game detail page shows all information
- [ ] Images are displayed correctly
- [ ] Games_count updates on community profile

### Success Criteria

- ✅ BGG sync completes for 100+ game collection in <5 minutes
- ✅ Game search returns results in <500ms
- ✅ Community collection displays performantly (1000+ games)
- ✅ No duplicate games created during sync
- ✅ BGG API errors handled gracefully

---

## Phase 4: Photo Galleries

**Duration:** Week 7
**Goal:** Communities can upload and showcase event photos
**Dependencies:** Phase 2 (Events must exist)

### Features Breakdown

#### 4.1 Photo Upload
- Upload photos to events
- Drag-and-drop interface
- Multiple file upload
- Image preview before upload
- Progress indicator
- File validation (type, size)
- Auto-resize images (optimize storage)
- Generate thumbnails

#### 4.2 Storage Backend
- Start with Supabase Storage (1GB free)
- Abstraction layer for future migration
- Support for Cloudflare R2
- Organized folder structure

#### 4.3 Photo Management
- Event photo galleries
- Organizer can upload
- Attendees can upload (with moderation)
- Photo moderation queue
- Approve/reject photos
- Delete photos
- Edit captions
- Set cover photo for event

#### 4.4 Display
- Event page photo gallery
- Lightbox viewer
- Thumbnail grid
- Full-size view
- Download original
- Share individual photos
- Community profile photo showcase

### Database Schema

```sql
-- Event Photos
CREATE TABLE event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,

  -- Photo URLs
  photo_url TEXT NOT NULL, -- Full size
  thumbnail_url TEXT, -- Optimized thumbnail

  -- Metadata
  caption TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  file_size INT, -- bytes
  width INT,
  height INT,
  mime_type TEXT,

  -- Moderation
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',
  moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Display
  is_cover_photo BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  view_count INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_event_photos_event ON event_photos(event_id);
CREATE INDEX idx_event_photos_community ON event_photos(community_id);
CREATE INDEX idx_event_photos_status ON event_photos(status);
CREATE INDEX idx_event_photos_uploaded_by ON event_photos(uploaded_by);
```

### Storage Strategy

```typescript
// lib/storage/provider.ts

export interface StorageProvider {
  upload(file: File, path: string): Promise<string>;
  delete(path: string): Promise<void>;
  getPublicUrl(path: string): string;
  generateThumbnail(url: string, width: number, height: number): Promise<string>;
}

// Supabase Storage Implementation
export class SupabaseStorageProvider implements StorageProvider {
  private bucket = 'event-photos';

  async upload(file: File, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data.path;
  }

  async delete(path: string): Promise<void> {
    await supabase.storage.from(this.bucket).remove([path]);
  }

  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  async generateThumbnail(url: string, width: number, height: number): Promise<string> {
    // Use Supabase's image transformation
    return `${url}?width=${width}&height=${height}&resize=cover`;
  }
}

// Cloudflare R2 Implementation (Future)
export class CloudflareR2Provider implements StorageProvider {
  // Implementation for when we migrate
}

// Factory
export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'supabase';

  switch (provider) {
    case 'r2':
      return new CloudflareR2Provider();
    case 'supabase':
    default:
      return new SupabaseStorageProvider();
  }
}
```

### Image Processing

```typescript
// lib/images/processor.ts

export class ImageProcessor {
  /**
   * Optimize image before upload
   * - Resize if too large (max 2000px width)
   * - Convert to WebP for better compression
   * - Strip EXIF data (privacy)
   */
  async optimize(file: File): Promise<File> {
    const image = await this.loadImage(file);

    // Resize if needed
    const maxWidth = 2000;
    if (image.width > maxWidth) {
      const canvas = this.resizeImage(image, maxWidth);
      return this.canvasToFile(canvas, 'image/webp', 0.85);
    }

    return file;
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(file: File, size: number = 300): Promise<File> {
    const image = await this.loadImage(file);
    const canvas = this.resizeImage(image, size);
    return this.canvasToFile(canvas, 'image/webp', 0.80);
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private resizeImage(image: HTMLImageElement, maxWidth: number): HTMLCanvasElement {
    const ratio = maxWidth / image.width;
    const canvas = document.createElement('canvas');
    canvas.width = maxWidth;
    canvas.height = image.height * ratio;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas;
  }

  private canvasToFile(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<File> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob!], 'image.webp', { type: mimeType });
        resolve(file);
      }, mimeType, quality);
    });
  }
}
```

### RLS Policies

```sql
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved photos viewable by everyone"
ON event_photos FOR SELECT
USING (status = 'approved');

CREATE POLICY "Event attendees can upload photos"
ON event_photos FOR INSERT
WITH CHECK (
  event_id IN (
    SELECT event_id FROM event_registrations
    WHERE user_id = auth.uid()
  )
  OR
  community_id IN (
    SELECT community_id FROM community_admins
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Community admins can moderate photos"
ON event_photos FOR UPDATE
USING (
  community_id IN (
    SELECT community_id FROM community_admins
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own photos"
ON event_photos FOR DELETE
USING (uploaded_by = auth.uid());

CREATE POLICY "Community admins can delete any photo"
ON event_photos FOR DELETE
USING (
  community_id IN (
    SELECT community_id FROM community_admins
    WHERE user_id = auth.uid()
  )
);
```

### API Routes

```
/api/events/:id/photos/
  POST /                        # Upload photo(s)
  GET /                         # List photos
  PATCH /:photoId               # Update caption/set cover
  DELETE /:photoId              # Delete photo
  POST /:photoId/approve        # Approve (moderator)
  POST /:photoId/reject         # Reject (moderator)

/api/upload/
  POST /presigned-url           # Get presigned upload URL
```

### UI Components

```
/components/photos/
  - PhotoUploader.tsx           # Drag-drop upload
  - PhotoGallery.tsx            # Grid display
  - PhotoLightbox.tsx           # Full-size viewer
  - PhotoModerationQueue.tsx    # Admin moderation
  - PhotoCard.tsx               # Single photo card
  - CoverPhotoSelector.tsx      # Select event cover
```

### Pages/Routes

```
/app/
  /events/
    [id]/
      photos/page.tsx           # Event photo gallery

  /dashboard/
    [communityId]/
      events/
        [id]/
          photos/page.tsx       # Manage event photos
          photos/upload/page.tsx # Upload photos
          photos/moderate/page.tsx # Moderation queue
```

### Testing Checklist

- [ ] Photo upload works (single and multiple)
- [ ] Images are optimized on upload
- [ ] Thumbnails are generated
- [ ] Large images are resized
- [ ] File validation prevents non-images
- [ ] Size limit enforced (max 10MB)
- [ ] Progress indicator shows upload status
- [ ] Gallery displays correctly
- [ ] Lightbox navigation works
- [ ] Moderation queue shows pending photos
- [ ] Approve/reject works
- [ ] Download original works
- [ ] Cover photo can be set
- [ ] Storage usage is tracked

### Success Criteria

- ✅ Upload 10 photos in <30 seconds
- ✅ Gallery loads quickly (lazy loading)
- ✅ Images are optimized (WebP, compressed)
- ✅ Mobile upload works smoothly
- ✅ Storage costs stay within budget

---

---

## Phase 5: Reviews & Beginner Guides

**Duration:** Week 8-9
**Goal:** Create India's BGG alternative with reviews, guides, and retailer directory
**Dependencies:** Phase 3 (Games database must exist)

### Features Breakdown

#### 5.1 Content Management System
- Admin content creation
- Rich text editor (TipTap or similar)
- Content types:
  - Beginner Guides
  - Game Reviews
  - Buying Guides
  - Comparison Articles
- SEO metadata (title, description, keywords)
- Featured images
- Tags and categories
- Draft/publish workflow

#### 5.2 Game Reviews
- Staff reviews (admin-written)
- Community reviews (user-submitted with moderation)
- Rating system (1-10 scale)
- Pros and cons
- "Worth it?" verdict
- Recommended for (player types)
- Video review embeds (YouTube)
- Review helpfulness voting

#### 5.3 Beginner Guides
- How-to guides
- Game rule summaries
- Strategy tips
- Terminology guides
- Multi-language support (Hindi + English)
- Step-by-step instructions with images
- Difficulty level indicator

#### 5.4 Retailer Directory
- Verified retailer listings
- City-wise organization
- Online vs physical stores
- Contact information
- Website links
- User ratings and reviews
- "Where to Buy" section on game pages

#### 5.5 Affiliate Link System
- Admin-managed affiliate links
- Link to retailers per game
- Click tracking
- Commission tracking (future)
- Conversion tracking (if retailer provides API)

#### 5.6 User-Generated Content
- Users can submit reviews
- Moderation queue for approval
- Community guidelines enforcement
- Spam prevention
- Rating reputation system

### Database Schema

```sql
-- Content Articles
CREATE TABLE content_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content type
  type TEXT CHECK (type IN ('guide', 'review', 'buying_guide', 'comparison')) NOT NULL,

  -- Basic info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL, -- Markdown or rich text
  featured_image_url TEXT,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],

  -- Game relation (for reviews)
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  -- Author
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_staff_content BOOLEAN DEFAULT FALSE,

  -- Publishing
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,

  -- Engagement
  view_count INT DEFAULT 0,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Reviews (separate table for structured data)
CREATE TABLE game_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  article_id UUID REFERENCES content_articles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Rating
  overall_rating DECIMAL(3,1) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 10),

  -- Detailed ratings (optional)
  gameplay_rating DECIMAL(3,1),
  components_rating DECIMAL(3,1),
  replayability_rating DECIMAL(3,1),
  artwork_rating DECIMAL(3,1),

  -- Structured content
  pros TEXT[],
  cons TEXT[],
  verdict TEXT,
  recommended_for TEXT[], -- ["Families", "Strategy gamers", etc.]

  -- Video review
  video_url TEXT, -- YouTube embed

  -- Status
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_id, reviewer_id) -- One review per user per game
);

-- Review Helpfulness Votes
CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES game_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL, -- true = helpful, false = not helpful
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(review_id, user_id)
);

-- Retailers
CREATE TABLE retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,

  -- Contact
  website_url TEXT,
  email TEXT,
  phone TEXT,

  -- Location
  has_physical_store BOOLEAN DEFAULT FALSE,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  pincode TEXT,

  -- Operations
  ships_pan_india BOOLEAN DEFAULT FALSE,
  shipping_cities TEXT[], -- If not pan-India
  accepts_cod BOOLEAN DEFAULT FALSE,

  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Stats
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retailer Reviews
CREATE TABLE retailer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID REFERENCES retailers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,

  -- Purchase details
  order_value DECIMAL(10,2),
  delivery_time_days INT,

  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(retailer_id, user_id)
);

-- Affiliate Links
CREATE TABLE affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  retailer_id UUID REFERENCES retailers(id) ON DELETE CASCADE,

  -- Link details
  affiliate_url TEXT NOT NULL,
  display_url TEXT, -- Clean URL to show users
  price DECIMAL(10,2), -- Current price (optional)
  currency TEXT DEFAULT 'INR',

  -- Commission
  commission_rate DECIMAL(4,2), -- e.g., 8.50 for 8.5%

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Stats
  click_count INT DEFAULT 0,
  conversion_count INT DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,

  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_id, retailer_id)
);

-- Affiliate Link Clicks (tracking)
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,

  -- User info (if logged in)
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Request info
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  -- Conversion tracking
  converted BOOLEAN DEFAULT FALSE,
  conversion_amount DECIMAL(10,2),
  converted_at TIMESTAMPTZ,

  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Tags
CREATE TABLE content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Article-Tag relationship
CREATE TABLE article_tags (
  article_id UUID REFERENCES content_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES content_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Indexes
CREATE INDEX idx_articles_type ON content_articles(type);
CREATE INDEX idx_articles_status ON content_articles(status);
CREATE INDEX idx_articles_game ON content_articles(game_id);
CREATE INDEX idx_articles_slug ON content_articles(slug);
CREATE INDEX idx_articles_published ON content_articles(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_search ON content_articles USING gin(to_tsvector('english', title || ' ' || content));

CREATE INDEX idx_reviews_game ON game_reviews(game_id);
CREATE INDEX idx_reviews_reviewer ON game_reviews(reviewer_id);
CREATE INDEX idx_reviews_status ON game_reviews(status);
CREATE INDEX idx_reviews_rating ON game_reviews(overall_rating DESC);

CREATE INDEX idx_retailers_city ON retailers(city);
CREATE INDEX idx_retailers_verified ON retailers(is_verified);
CREATE INDEX idx_retailers_slug ON retailers(slug);

CREATE INDEX idx_affiliate_links_game ON affiliate_links(game_id);
CREATE INDEX idx_affiliate_links_retailer ON affiliate_links(retailer_id);
CREATE INDEX idx_affiliate_links_active ON affiliate_links(is_active);

CREATE INDEX idx_affiliate_clicks_link ON affiliate_clicks(affiliate_link_id);
CREATE INDEX idx_affiliate_clicks_user ON affiliate_clicks(user_id);

-- Trigger to update retailer ratings
CREATE OR REPLACE FUNCTION update_retailer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE retailers
  SET
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM retailer_reviews
      WHERE retailer_id = NEW.retailer_id AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM retailer_reviews
      WHERE retailer_id = NEW.retailer_id AND status = 'approved'
    )
  WHERE id = NEW.retailer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_retailer_rating
AFTER INSERT OR UPDATE ON retailer_reviews
FOR EACH ROW EXECUTE FUNCTION update_retailer_rating();

-- Trigger to update affiliate click counts
CREATE OR REPLACE FUNCTION update_affiliate_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE affiliate_links
  SET click_count = click_count + 1
  WHERE id = NEW.affiliate_link_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_affiliate_clicks
AFTER INSERT ON affiliate_clicks
FOR EACH ROW EXECUTE FUNCTION update_affiliate_click_count();
```

### RLS Policies

```sql
-- Content Articles
ALTER TABLE content_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles viewable by everyone"
ON content_articles FOR SELECT
USING (status = 'published');

CREATE POLICY "Authors can view own drafts"
ON content_articles FOR SELECT
USING (author_id = auth.uid());

CREATE POLICY "Admins can manage all articles"
ON content_articles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Game Reviews
ALTER TABLE game_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved reviews viewable by everyone"
ON game_reviews FOR SELECT
USING (status = 'approved');

CREATE POLICY "Users can submit reviews"
ON game_reviews FOR INSERT
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can view own pending reviews"
ON game_reviews FOR SELECT
USING (reviewer_id = auth.uid());

CREATE POLICY "Admins can moderate reviews"
ON game_reviews FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Retailers
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Retailers viewable by everyone"
ON retailers FOR SELECT
USING (true);

CREATE POLICY "Admins can manage retailers"
ON retailers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Affiliate Links
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active affiliate links viewable by everyone"
ON affiliate_links FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage affiliate links"
ON affiliate_links FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
```

### API Routes

```
/api/articles/
  GET /                         # List articles (with filters)
  GET /:slug                    # Get article by slug
  POST /                        # Create article (admin)
  PATCH /:id                    # Update article (admin)
  DELETE /:id                   # Delete article (admin)
  POST /:id/publish             # Publish article (admin)

/api/reviews/
  GET /game/:gameId             # Get reviews for a game
  POST /                        # Submit review (user)
  GET /:id                      # Get review details
  PATCH /:id                    # Update own review
  POST /:id/vote                # Vote helpful/not helpful
  POST /:id/approve             # Approve review (admin)
  POST /:id/reject              # Reject review (admin)

/api/retailers/
  GET /                         # List retailers (with city filter)
  GET /:slug                    # Get retailer details
  POST /                        # Create retailer (admin)
  PATCH /:id                    # Update retailer (admin)
  POST /:id/review              # Submit retailer review

/api/affiliate/
  POST /click                   # Track affiliate click
  POST /conversion              # Track conversion (webhook)
  GET /stats                    # Get affiliate stats (admin)

/api/games/:id/retailers/
  GET /                         # Get retailers selling this game
```

### UI Components

```
/components/content/
  - ArticleEditor.tsx           # Rich text editor
  - ArticleCard.tsx             # Article display card
  - ArticleList.tsx             # List of articles
  - ReviewForm.tsx              # Submit review form
  - ReviewCard.tsx              # Display review
  - ReviewList.tsx              # List reviews with filters
  - RatingStars.tsx             # Star rating component
  - VoteButtons.tsx             # Helpful voting

/components/retailers/
  - RetailerCard.tsx            # Retailer display
  - RetailerList.tsx            # Retailer directory
  - RetailerMap.tsx             # Map view (future)
  - BuyButton.tsx               # Affiliate link button
  - PriceComparison.tsx         # Compare prices across retailers

/components/admin/
  - ReviewModerationQueue.tsx   # Moderate reviews
  - AffiliateManager.tsx        # Manage affiliate links
  - ContentDashboard.tsx        # Content stats
```

### Pages/Routes

```
/app/
  /guides/
    page.tsx                    # Browse guides
    [slug]/page.tsx             # Guide detail page

  /reviews/
    page.tsx                    # Browse reviews
    [slug]/page.tsx             # Review detail page

  /games/
    [id]/
      reviews/page.tsx          # Game reviews
      where-to-buy/page.tsx     # Retailers for game

  /retailers/
    page.tsx                    # Retailer directory
    [slug]/page.tsx             # Retailer profile

  /admin/
    content/
      page.tsx                  # Content dashboard
      new/page.tsx              # Create article
      [id]/edit/page.tsx        # Edit article
    reviews/
      page.tsx                  # Review moderation
    retailers/
      page.tsx                  # Manage retailers
      [id]/edit/page.tsx        # Edit retailer
    affiliate/
      page.tsx                  # Affiliate dashboard
```

### Testing Checklist

- [ ] Admin can create articles
- [ ] Rich text editor works correctly
- [ ] SEO metadata is saved
- [ ] Articles are published/unpublished correctly
- [ ] Users can submit reviews
- [ ] Review moderation queue works
- [ ] Rating system calculates correctly
- [ ] Helpfulness voting works
- [ ] Affiliate links track clicks
- [ ] Retailers can be added and edited
- [ ] Retailer reviews are moderated
- [ ] "Where to Buy" shows correct retailers
- [ ] Search works on articles
- [ ] Tags filter articles correctly

### Success Criteria

- ✅ 50+ articles published in first month
- ✅ Article pages load in <2 seconds
- ✅ SEO ranking for target keywords
- ✅ User reviews moderated within 24 hours
- ✅ Affiliate click tracking is accurate

---

## Phase 6: Marketplace & Bidding

**Duration:** Week 10-12
**Goal:** eBay-style marketplace with community intermediaries
**Dependencies:** Phase 1 (Communities), Phase 3 (Games)

### Features Breakdown

#### 6.1 Listing Creation
- Create marketplace listings
- Link to game from database
- Upload multiple photos
- Set condition (new, like-new, used, poor)
- Pricing options:
  - Auction (with reserve price)
  - Buy It Now (fixed price)
  - Both
- Auction duration (3, 5, 7 days)
- Item description
- Shipping details

#### 6.2 Community Intermediary System
- Select intermediary communities
- Community accepts/declines request
- Intermediary fee negotiation
- Intermediary dashboard
- Track items in custody
- Handover workflows

#### 6.3 Bidding System
- Place bids on auctions
- Auto-bid system (like eBay)
- Bid increment rules
- Outbid notifications
- Auction countdown
- Bid history

#### 6.4 Transaction Flow
- Winner notification
- Payment escrow
- Buyer-seller messaging
- Pickup/delivery coordination
- Item verification
- Payment release
- Rating system

#### 6.5 Trust & Safety
- User verification (phone, email)
- Rating system (buyer/seller ratings)
- Dispute resolution
- Report listing
- Block users
- Fraud prevention

### Database Schema

```sql
-- Marketplace Listings
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  -- Listing details
  title TEXT NOT NULL,
  description TEXT,
  condition TEXT CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')) NOT NULL,

  -- Pricing
  listing_type TEXT CHECK (listing_type IN ('auction', 'fixed_price', 'both')) NOT NULL,
  starting_price DECIMAL(10,2),
  reserve_price DECIMAL(10,2), -- Minimum acceptable price
  buy_now_price DECIMAL(10,2), -- Fixed or Buy It Now price
  current_bid DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',

  -- Auction settings
  auction_end_date TIMESTAMPTZ,
  auction_duration_days INT,
  bid_increment DECIMAL(10,2) DEFAULT 50.00,

  -- Shipping
  shipping_available BOOLEAN DEFAULT FALSE,
  shipping_cost DECIMAL(10,2),
  local_pickup_only BOOLEAN DEFAULT TRUE,
  pickup_location TEXT,
  pickup_city TEXT,

  -- Intermediary
  use_intermediary BOOLEAN DEFAULT FALSE,
  intermediary_community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
  intermediary_status TEXT CHECK (intermediary_status IN ('pending', 'accepted', 'declined', 'not_used')),
  intermediary_fee_percentage DECIMAL(4,2),

  -- Status
  status TEXT CHECK (status IN ('draft', 'active', 'sold', 'expired', 'cancelled')) DEFAULT 'draft',

  -- Stats
  view_count INT DEFAULT 0,
  watch_count INT DEFAULT 0,
  bid_count INT DEFAULT 0,

  -- Winner
  winner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sold_price DECIMAL(10,2),
  sold_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing Photos
CREATE TABLE marketplace_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,

  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids
CREATE TABLE marketplace_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Bid details
  bid_amount DECIMAL(10,2) NOT NULL,

  -- Auto-bid
  is_auto_bid BOOLEAN DEFAULT FALSE,
  max_auto_bid DECIMAL(10,2), -- Maximum they're willing to pay

  -- Status
  status TEXT CHECK (status IN ('active', 'outbid', 'won', 'lost', 'retracted')) DEFAULT 'active',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intermediary Requests
CREATE TABLE intermediary_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,

  -- Request details
  requested_fee_percentage DECIMAL(4,2) DEFAULT 5.00,
  message TEXT,

  -- Response
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  response_message TEXT,
  accepted_fee_percentage DECIMAL(4,2),
  responded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Pricing
  sale_price DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  intermediary_fee DECIMAL(10,2) DEFAULT 0,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  seller_payout DECIMAL(10,2) NOT NULL,

  -- Payment
  payment_id TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'held', 'released', 'refunded')) DEFAULT 'pending',
  payment_gateway TEXT,
  paid_at TIMESTAMPTZ,

  -- Intermediary workflow (if used)
  intermediary_community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
  item_received_by_intermediary_at TIMESTAMPTZ,
  item_delivered_to_buyer_at TIMESTAMPTZ,

  -- Status
  status TEXT CHECK (status IN ('pending', 'paid', 'in_custody', 'delivered', 'completed', 'disputed', 'cancelled')) DEFAULT 'pending',

  -- Auto-release payment after 7 days
  payment_release_date TIMESTAMPTZ,
  payment_released_at TIMESTAMPTZ,

  -- Tracking
  tracking_number TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction Messages (Buyer-Seller communication)
CREATE TABLE transaction_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES marketplace_transactions(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Ratings (After transaction)
CREATE TABLE user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES marketplace_transactions(id) ON DELETE CASCADE,
  rated_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rated_by UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Rating
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  rating_type TEXT CHECK (rating_type IN ('seller', 'buyer')) NOT NULL,
  review_text TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(transaction_id, rated_user_id)
);

-- Watchlist
CREATE TABLE marketplace_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, listing_id)
);

-- Disputes
CREATE TABLE marketplace_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES marketplace_transactions(id) ON DELETE CASCADE,
  raised_by UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Dispute details
  reason TEXT CHECK (reason IN ('item_not_received', 'item_not_as_described', 'payment_issue', 'other')) NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[], -- Photo/document URLs

  -- Resolution
  status TEXT CHECK (status IN ('open', 'investigating', 'resolved', 'closed')) DEFAULT 'open',
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,

  -- Outcome
  refund_issued BOOLEAN DEFAULT FALSE,
  refund_amount DECIMAL(10,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_listings_game ON marketplace_listings(game_id);
CREATE INDEX idx_listings_status ON marketplace_listings(status);
CREATE INDEX idx_listings_end_date ON marketplace_listings(auction_end_date) WHERE status = 'active';
CREATE INDEX idx_listings_city ON marketplace_listings(pickup_city);

CREATE INDEX idx_bids_listing ON marketplace_bids(listing_id);
CREATE INDEX idx_bids_bidder ON marketplace_bids(bidder_id);
CREATE INDEX idx_bids_status ON marketplace_bids(status);

CREATE INDEX idx_transactions_seller ON marketplace_transactions(seller_id);
CREATE INDEX idx_transactions_buyer ON marketplace_transactions(buyer_id);
CREATE INDEX idx_transactions_status ON marketplace_transactions(status);

CREATE INDEX idx_intermediary_requests_community ON intermediary_requests(community_id);
CREATE INDEX idx_intermediary_requests_status ON intermediary_requests(status);

-- Trigger to update current_bid
CREATE OR REPLACE FUNCTION update_listing_current_bid()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'active') THEN
    UPDATE marketplace_listings
    SET
      current_bid = NEW.bid_amount,
      bid_count = bid_count + 1,
      updated_at = NOW()
    WHERE id = NEW.listing_id;

    -- Mark previous high bid as outbid
    UPDATE marketplace_bids
    SET status = 'outbid'
    WHERE listing_id = NEW.listing_id
      AND bidder_id != NEW.bidder_id
      AND status = 'active';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_current_bid
AFTER INSERT OR UPDATE ON marketplace_bids
FOR EACH ROW EXECUTE FUNCTION update_listing_current_bid();

-- Function to process auto-bids
CREATE OR REPLACE FUNCTION process_auto_bids(listing_uuid UUID, new_bid_amount DECIMAL)
RETURNS VOID AS $$
DECLARE
  auto_bidder_record RECORD;
  next_bid_amount DECIMAL;
  increment DECIMAL;
BEGIN
  SELECT bid_increment INTO increment
  FROM marketplace_listings
  WHERE id = listing_uuid;

  -- Find active auto-bids that can beat the new bid
  FOR auto_bidder_record IN
    SELECT *
    FROM marketplace_bids
    WHERE listing_id = listing_uuid
      AND is_auto_bid = TRUE
      AND status = 'active'
      AND max_auto_bid > new_bid_amount
    ORDER BY max_auto_bid DESC
    LIMIT 1
  LOOP
    next_bid_amount := new_bid_amount + increment;

    IF next_bid_amount <= auto_bidder_record.max_auto_bid THEN
      -- Place automatic bid
      INSERT INTO marketplace_bids (listing_id, bidder_id, bid_amount, is_auto_bid, max_auto_bid, status)
      VALUES (listing_uuid, auto_bidder_record.bidder_id, next_bid_amount, TRUE, auto_bidder_record.max_auto_bid, 'active');
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Cron job to close expired auctions (implement with pg_cron or external scheduler)
CREATE OR REPLACE FUNCTION close_expired_auctions()
RETURNS VOID AS $$
DECLARE
  auction_record RECORD;
  high_bid_record RECORD;
BEGIN
  FOR auction_record IN
    SELECT *
    FROM marketplace_listings
    WHERE status = 'active'
      AND listing_type IN ('auction', 'both')
      AND auction_end_date <= NOW()
  LOOP
    -- Find highest bid
    SELECT *
    INTO high_bid_record
    FROM marketplace_bids
    WHERE listing_id = auction_record.id
      AND status = 'active'
    ORDER BY bid_amount DESC
    LIMIT 1;

    IF FOUND AND high_bid_record.bid_amount >= COALESCE(auction_record.reserve_price, 0) THEN
      -- Mark as sold
      UPDATE marketplace_listings
      SET
        status = 'sold',
        winner_id = high_bid_record.bidder_id,
        sold_price = high_bid_record.bid_amount,
        sold_at = NOW()
      WHERE id = auction_record.id;

      -- Mark winning bid
      UPDATE marketplace_bids
      SET status = 'won'
      WHERE id = high_bid_record.id;

      -- Mark losing bids
      UPDATE marketplace_bids
      SET status = 'lost'
      WHERE listing_id = auction_record.id
        AND id != high_bid_record.id;

      -- Create transaction
      INSERT INTO marketplace_transactions (
        listing_id, seller_id, buyer_id, sale_price,
        platform_fee, total_amount, seller_payout
      ) VALUES (
        auction_record.id,
        auction_record.seller_id,
        high_bid_record.bidder_id,
        high_bid_record.bid_amount,
        high_bid_record.bid_amount * 0.03, -- 3% platform fee
        high_bid_record.bid_amount,
        high_bid_record.bid_amount * 0.97
      );
    ELSE
      -- No winning bid (reserve not met or no bids)
      UPDATE marketplace_listings
      SET status = 'expired'
      WHERE id = auction_record.id;

      UPDATE marketplace_bids
      SET status = 'lost'
      WHERE listing_id = auction_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### RLS Policies

```sql
-- Marketplace Listings
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings viewable by everyone"
ON marketplace_listings FOR SELECT
USING (status IN ('active', 'sold'));

CREATE POLICY "Users can create listings"
ON marketplace_listings FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can manage own listings"
ON marketplace_listings FOR ALL
USING (seller_id = auth.uid());

CREATE POLICY "Admins can manage all listings"
ON marketplace_listings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Bids
ALTER TABLE marketplace_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can place bids"
ON marketplace_bids FOR INSERT
WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "Users can view own bids"
ON marketplace_bids FOR SELECT
USING (bidder_id = auth.uid());

CREATE POLICY "Sellers can view bids on their listings"
ON marketplace_bids FOR SELECT
USING (
  listing_id IN (
    SELECT id FROM marketplace_listings
    WHERE seller_id = auth.uid()
  )
);

-- Transactions
ALTER TABLE marketplace_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transaction parties can view"
ON marketplace_transactions FOR SELECT
USING (
  buyer_id = auth.uid()
  OR seller_id = auth.uid()
  OR intermediary_community_id IN (
    SELECT community_id FROM community_admins
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Transaction parties can update"
ON marketplace_transactions FOR UPDATE
USING (
  buyer_id = auth.uid()
  OR seller_id = auth.uid()
  OR intermediary_community_id IN (
    SELECT community_id FROM community_admins
    WHERE user_id = auth.uid()
  )
);
```

### API Routes

```
/api/marketplace/
  GET /                         # Browse listings
  GET /:id                      # Get listing details
  POST /                        # Create listing
  PATCH /:id                    # Update listing
  DELETE /:id                   # Cancel listing
  POST /:id/watch               # Add to watchlist
  DELETE /:id/watch             # Remove from watchlist

/api/marketplace/:id/bids/
  GET /                         # Get bid history (seller only)
  POST /                        # Place bid
  POST /auto-bid                # Place auto-bid

/api/marketplace/:id/intermediary/
  POST /request                 # Request intermediary
  POST /accept                  # Accept intermediary request
  POST /decline                 # Decline intermediary request

/api/transactions/
  GET /                         # User's transactions
  GET /:id                      # Transaction details
  POST /:id/messages            # Send message
  GET /:id/messages             # Get messages
  POST /:id/complete            # Mark as completed
  POST /:id/dispute             # Raise dispute
  POST /:id/rate                # Rate other party

/api/disputes/
  GET /:id                      # Get dispute details
  PATCH /:id/resolve            # Resolve dispute (admin)
```

### UI Components

```
/components/marketplace/
  - ListingForm.tsx             # Create listing
  - ListingCard.tsx             # Display listing
  - ListingGrid.tsx             # Browse listings
  - BidForm.tsx                 # Place bid
  - BidHistory.tsx              # Show bid history
  - AuctionTimer.tsx            # Countdown timer
  - IntermediarySelector.tsx    # Choose intermediary
  - TransactionChat.tsx         # Buyer-seller messages
  - RatingForm.tsx              # Rate user
  - DisputeForm.tsx             # Raise dispute

/components/admin/
  - DisputeResolution.tsx       # Handle disputes
  - MarketplaceModeration.tsx   # Moderate listings
```

### Pages/Routes

```
/app/
  /marketplace/
    page.tsx                    # Browse listings
    [id]/page.tsx               # Listing details
    [id]/bid/page.tsx           # Bidding page
    sell/page.tsx               # Create listing

  /dashboard/
    marketplace/
      page.tsx                  # User's listings
      transactions/page.tsx     # User's transactions
      [transactionId]/page.tsx  # Transaction details

  /admin/
    marketplace/
      page.tsx                  # Marketplace admin
      disputes/page.tsx         # Dispute resolution
```

### Testing Checklist

- [ ] User can create auction listing
- [ ] User can create fixed-price listing
- [ ] Photos upload correctly (multiple)
- [ ] Bidding works correctly
- [ ] Auto-bid system functions properly
- [ ] Bid increments are enforced
- [ ] Auction timer counts down accurately
- [ ] Auctions close at correct time
- [ ] Winner is determined correctly
- [ ] Reserve price is enforced
- [ ] Intermediary request/accept flow works
- [ ] Transaction messaging works
- [ ] Payment escrow holds funds
- [ ] Payment releases correctly
- [ ] Rating system works
- [ ] Disputes can be raised and resolved
- [ ] Notifications are sent at key events

### Success Criteria

- ✅ Listing creation takes <5 minutes
- ✅ Bidding is real-time (WebSocket)
- ✅ 100% of transactions have escrow
- ✅ Disputes resolved within 48 hours
- ✅ <5% dispute rate

---

## Phase 7: Payment Integration

**Duration:** Week 13
**Goal:** Razorpay integration for event tickets and marketplace
**Dependencies:** Phase 2 (Events), Phase 6 (Marketplace)

### Features Breakdown

#### 7.1 Razorpay Integration
- Account setup and KYC
- API key configuration
- Webhook setup
- Test mode vs live mode

#### 7.2 Event Ticket Payments
- Payment during registration
- Order creation
- Payment page redirect
- Success/failure handling
- Automatic confirmation
- Receipt generation

#### 7.3 Marketplace Escrow
- Hold payment on purchase
- Release to seller after delivery
- Auto-release after 7 days
- Refund handling
- Partial refunds

#### 7.4 Webhook Handling
- Payment success
- Payment failure
- Refund processed
- Dispute notification
- Webhook signature verification

#### 7.5 Payout System
- Community earnings tracking
- Seller payouts
- Platform fee calculation
- Payout schedules
- Transaction history

### Database Schema

```sql
-- Payment Orders
CREATE TABLE payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Order details
  order_type TEXT CHECK (order_type IN ('event_ticket', 'marketplace_purchase', 'premium_feature')) NOT NULL,
  reference_id UUID NOT NULL, -- event_registration_id or transaction_id

  -- Payment gateway
  gateway TEXT CHECK (gateway IN ('razorpay', 'juspay', 'manual')) DEFAULT 'razorpay',
  gateway_order_id TEXT UNIQUE,

  -- Amount
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',

  -- Payer
  payer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  payer_email TEXT NOT NULL,
  payer_phone TEXT,

  -- Status
  status TEXT CHECK (status IN ('created', 'pending', 'paid', 'failed', 'expired', 'refunded')) DEFAULT 'created',

  -- Payment details (filled after payment)
  gateway_payment_id TEXT,
  payment_method TEXT, -- upi, card, netbanking, wallet
  paid_at TIMESTAMPTZ,

  -- Refund
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,

  -- Metadata
  notes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks Log (for debugging)
CREATE TABLE payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  gateway TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  signature TEXT,

  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,

  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payouts
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  recipient_type TEXT CHECK (recipient_type IN ('community', 'seller', 'intermediary')) NOT NULL,
  recipient_id UUID NOT NULL, -- community_id or profile_id

  -- Amount
  gross_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',

  -- Related transactions
  transaction_ids UUID[], -- Array of transaction IDs

  -- Payout details
  gateway TEXT DEFAULT 'razorpay',
  gateway_payout_id TEXT,

  -- Bank details
  bank_account_number TEXT,
  bank_ifsc TEXT,
  account_holder_name TEXT,

  -- Status
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',

  -- Dates
  scheduled_for TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,

  -- Error handling
  failure_reason TEXT,
  retry_count INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_orders_reference ON payment_orders(reference_id);
CREATE INDEX idx_payment_orders_payer ON payment_orders(payer_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);
CREATE INDEX idx_payment_orders_gateway_order_id ON payment_orders(gateway_order_id);

CREATE INDEX idx_payouts_recipient ON payouts(recipient_type, recipient_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_scheduled ON payouts(scheduled_for) WHERE status = 'pending';
```

### Razorpay Integration

```typescript
// lib/payments/razorpay.ts

import Razorpay from 'razorpay';
import crypto from 'crypto';

export class RazorpayService {
  private client: Razorpay;

  constructor() {
    this.client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  /**
   * Create order for payment
   */
  async createOrder(amount: number, currency: string = 'INR', notes?: any): Promise<any> {
    try {
      const order = await this.client.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        notes,
        receipt: `rcpt_${Date.now()}`,
      });

      return order;
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  }

  /**
   * Fetch payment details
   */
  async getPayment(paymentId: string): Promise<any> {
    return await this.client.payments.fetch(paymentId);
  }

  /**
   * Issue refund
   */
  async refund(paymentId: string, amount?: number, notes?: any): Promise<any> {
    try {
      const refund = await this.client.payments.refund(paymentId, {
        amount: amount ? Math.round(amount * 100) : undefined,
        notes,
      });

      return refund;
    } catch (error) {
      console.error('Razorpay refund failed:', error);
      throw new Error('Failed to process refund');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Create payout (fund transfer to seller/community)
   */
  async createPayout(
    accountNumber: string,
    ifsc: string,
    amount: number,
    notes?: any
  ): Promise<any> {
    try {
      const payout = await this.client.payouts.create({
        account_number: accountNumber,
        fund_account_id: `fa_${Date.now()}`, // Fund account ID
        amount: Math.round(amount * 100),
        currency: 'INR',
        mode: 'IMPS', // Instant transfer
        purpose: 'payout',
        notes,
      });

      return payout;
    } catch (error) {
      console.error('Razorpay payout failed:', error);
      throw new Error('Failed to create payout');
    }
  }
}

// Wrapper service with abstraction
export interface PaymentGateway {
  createOrder(amount: number, currency: string, notes?: any): Promise<any>;
  verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean>;
  refund(paymentId: string, amount?: number): Promise<any>;
}

export class PaymentService implements PaymentGateway {
  private gateway: RazorpayService;

  constructor() {
    // Currently only Razorpay, but ready for future gateways
    this.gateway = new RazorpayService();
  }

  async createOrder(amount: number, currency: string = 'INR', notes?: any) {
    return await this.gateway.createOrder(amount, currency, notes);
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    return this.gateway.verifyPaymentSignature(orderId, paymentId, signature);
  }

  async refund(paymentId: string, amount?: number) {
    return await this.gateway.refund(paymentId, amount);
  }
}
```

### Webhook Handler

```typescript
// app/api/webhooks/razorpay/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { RazorpayService } from '@/lib/payments/razorpay';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-razorpay-signature');
  const body = await req.text();

  const razorpay = new RazorpayService();

  // Verify webhook signature
  if (!signature || !razorpay.verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  // Log webhook
  await db.payment_webhooks.create({
    gateway: 'razorpay',
    event_type: event.event,
    payload: event,
    signature,
  });

  try {
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case 'refund.processed':
        await handleRefundProcessed(event.payload.refund.entity);
        break;

      case 'payout.processed':
        await handlePayoutProcessed(event.payload.payout.entity);
        break;

      default:
        console.log('Unhandled event:', event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function handlePaymentCaptured(payment: any) {
  const order = await db.payment_orders.findByGatewayOrderId(payment.order_id);

  if (!order) {
    console.error('Order not found:', payment.order_id);
    return;
  }

  // Update payment order
  await db.payment_orders.update(order.id, {
    status: 'paid',
    gateway_payment_id: payment.id,
    payment_method: payment.method,
    paid_at: new Date(payment.created_at * 1000),
  });

  // Update reference (event registration or marketplace transaction)
  if (order.order_type === 'event_ticket') {
    await db.event_registrations.update(order.reference_id, {
      payment_status: 'completed',
      payment_id: payment.id,
    });

    // Send confirmation email
    await sendEventConfirmationEmail(order.reference_id);
  } else if (order.order_type === 'marketplace_purchase') {
    await db.marketplace_transactions.update(order.reference_id, {
      payment_status: 'held',
      payment_id: payment.id,
      paid_at: new Date(),
    });

    // Notify seller
    await notifySellerOfPurchase(order.reference_id);
  }
}

async function handlePaymentFailed(payment: any) {
  const order = await db.payment_orders.findByGatewayOrderId(payment.order_id);

  if (order) {
    await db.payment_orders.update(order.id, {
      status: 'failed',
      gateway_payment_id: payment.id,
    });
  }
}

async function handleRefundProcessed(refund: any) {
  const order = await db.payment_orders.findByGatewayPaymentId(refund.payment_id);

  if (order) {
    await db.payment_orders.update(order.id, {
      status: 'refunded',
      refund_amount: refund.amount / 100,
      refunded_at: new Date(),
    });
  }
}

async function handlePayoutProcessed(payout: any) {
  // Update payout record
  await db.payouts.updateByGatewayId(payout.id, {
    status: 'completed',
    processed_at: new Date(),
  });
}
```

### RLS Policies

```sql
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment orders"
ON payment_orders FOR SELECT
USING (payer_id = auth.uid());

CREATE POLICY "Admins can view all payment orders"
ON payment_orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipients can view own payouts"
ON payouts FOR SELECT
USING (
  (recipient_type = 'seller' AND recipient_id = auth.uid())
  OR
  (recipient_type = 'community' AND recipient_id IN (
    SELECT community_id FROM community_admins WHERE user_id = auth.uid()
  ))
);
```

### API Routes

```
/api/payments/
  POST /create-order            # Create payment order
  POST /verify                  # Verify payment
  POST /:id/refund              # Issue refund
  GET /:id                      # Get payment details

/api/webhooks/
  POST /razorpay                # Razorpay webhook handler

/api/payouts/
  GET /                         # List payouts (for community/seller)
  POST /                        # Request payout (admin)
  GET /:id                      # Get payout details
```

### UI Components

```
/components/payments/
  - PaymentButton.tsx           # Initiate payment
  - PaymentModal.tsx            # Razorpay checkout
  - PaymentStatus.tsx           # Success/failure display
  - RefundButton.tsx            # Request refund (admin)
  - PayoutDashboard.tsx         # View earnings
  - TransactionHistory.tsx      # Payment history
```

### Testing Checklist

- [ ] Payment order created correctly
- [ ] Razorpay checkout opens
- [ ] Payment success captured via webhook
- [ ] Registration marked as paid
- [ ] Confirmation email sent
- [ ] Payment failure handled gracefully
- [ ] Refunds process correctly
- [ ] Escrow holds funds
- [ ] Escrow releases to seller
- [ ] Auto-release after 7 days works
- [ ] Payouts to communities work
- [ ] Webhook signature verified
- [ ] Test mode vs live mode switching
- [ ] Payment history displays correctly

### Success Criteria

- ✅ 99%+ payment success rate
- ✅ Webhook processing <1 second
- ✅ Zero missed webhook events
- ✅ Refunds processed within 24 hours
- ✅ Payout schedule automated

---

## Phase 8: Discussion Forums

**Duration:** Week 14
**Goal:** Community knowledge base and discussions
**Dependencies:** Phase 1 (Communities), Phase 3 (Games)

### Features Breakdown

#### 8.1 Forum Categories
- Rules Questions
- Strategy Tips
- Marketplace Discussion
- Looking for Group (LFG)
- General Chat
- Community-specific forums

#### 8.2 Discussion Threads
- Create new thread
- Rich text editor
- Attach images
- Tag games
- Tag users
- Pin important threads
- Lock threads

#### 8.3 Replies and Comments
- Threaded comments
- Quote functionality
- Markdown support
- Image attachments
- Reactions (upvote/downvote)
- Report inappropriate content

#### 8.4 Best Answers
- Mark best answer (OP or moderator)
- Highlight best answer
- Sort by best answer first

#### 8.5 Search and Discovery
- Full-text search
- Filter by category
- Filter by game
- Sort by recent, popular, unanswered
- Tag-based filtering

#### 8.6 Moderation
- Report threads/comments
- Moderator queue
- Ban users
- Delete content
- Edit content

### Database Schema

```sql
-- Forum Categories
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- Icon name
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO forum_categories (name, slug, description, sort_order) VALUES
  ('Rules Questions', 'rules-questions', 'Ask about game rules and clarifications', 1),
  ('Strategy Tips', 'strategy', 'Share and discuss game strategies', 2),
  ('Marketplace', 'marketplace', 'Discuss prices, valuations, and trades', 3),
  ('Looking for Group', 'lfg', 'Find local players and gaming groups', 4),
  ('General', 'general', 'General board gaming discussion', 5);

-- Forum Threads
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,

  -- Thread content
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Author
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Game relation (optional)
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,

  -- Tags
  tags TEXT[],

  -- Status
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,

  -- Best answer
  best_answer_id UUID, -- References forum_replies

  -- Stats
  view_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  upvote_count INT DEFAULT 0,
  downvote_count INT DEFAULT 0,

  -- Latest activity
  last_reply_at TIMESTAMPTZ DEFAULT NOW(),
  last_reply_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(category_id, slug)
);

-- Forum Replies
CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE, -- For nested replies

  -- Content
  content TEXT NOT NULL,

  -- Author
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Status
  is_deleted BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,

  -- Stats
  upvote_count INT DEFAULT 0,
  downvote_count INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thread/Reply Votes
CREATE TABLE forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Vote target (either thread or reply)
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,

  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, reply_id),
  CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL)
    OR
    (thread_id IS NULL AND reply_id IS NOT NULL)
  )
);

-- Reports
CREATE TABLE forum_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Report target
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,

  -- Reporter
  reported_by UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Report details
  reason TEXT CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'off_topic', 'other')) NOT NULL,
  description TEXT,

  -- Moderation
  status TEXT CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL)
    OR
    (thread_id IS NULL AND reply_id IS NOT NULL)
  )
);

-- User Follows (follow threads for notifications)
CREATE TABLE forum_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, thread_id)
);

-- Indexes
CREATE INDEX idx_threads_category ON forum_threads(category_id);
CREATE INDEX idx_threads_author ON forum_threads(author_id);
CREATE INDEX idx_threads_game ON forum_threads(game_id);
CREATE INDEX idx_threads_slug ON forum_threads(category_id, slug);
CREATE INDEX idx_threads_last_reply ON forum_threads(last_reply_at DESC);
CREATE INDEX idx_threads_search ON forum_threads USING gin(to_tsvector('english', title || ' ' || content));

CREATE INDEX idx_replies_thread ON forum_replies(thread_id);
CREATE INDEX idx_replies_author ON forum_replies(author_id);
CREATE INDEX idx_replies_parent ON forum_replies(parent_reply_id);

CREATE INDEX idx_votes_user ON forum_votes(user_id);
CREATE INDEX idx_votes_thread ON forum_votes(thread_id);
CREATE INDEX idx_votes_reply ON forum_votes(reply_id);

CREATE INDEX idx_reports_status ON forum_reports(status);

-- Trigger to update reply count
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_deleted = FALSE THEN
    UPDATE forum_threads
    SET
      reply_count = reply_count + 1,
      last_reply_at = NEW.created_at,
      last_reply_by = NEW.author_id
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE THEN
    UPDATE forum_threads
    SET reply_count = reply_count - 1
    WHERE id = NEW.thread_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reply_count
AFTER INSERT OR UPDATE ON forum_replies
FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

-- Trigger to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.thread_id IS NOT NULL THEN
      IF NEW.vote_type = 'upvote' THEN
        UPDATE forum_threads SET upvote_count = upvote_count + 1 WHERE id = NEW.thread_id;
      ELSE
        UPDATE forum_threads SET downvote_count = downvote_count + 1 WHERE id = NEW.thread_id;
      END IF;
    ELSIF NEW.reply_id IS NOT NULL THEN
      IF NEW.vote_type = 'upvote' THEN
        UPDATE forum_replies SET upvote_count = upvote_count + 1 WHERE id = NEW.reply_id;
      ELSE
        UPDATE forum_replies SET downvote_count = downvote_count + 1 WHERE id = NEW.reply_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.thread_id IS NOT NULL THEN
      IF OLD.vote_type = 'upvote' THEN
        UPDATE forum_threads SET upvote_count = upvote_count - 1 WHERE id = OLD.thread_id;
      ELSE
        UPDATE forum_threads SET downvote_count = downvote_count - 1 WHERE id = OLD.thread_id;
      END IF;
    ELSIF OLD.reply_id IS NOT NULL THEN
      IF OLD.vote_type = 'upvote' THEN
        UPDATE forum_replies SET upvote_count = upvote_count - 1 WHERE id = OLD.reply_id;
      ELSE
        UPDATE forum_replies SET downvote_count = downvote_count - 1 WHERE id = OLD.reply_id;
      END IF;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vote_counts
AFTER INSERT OR DELETE ON forum_votes
FOR EACH ROW EXECUTE FUNCTION update_vote_counts();
```

### RLS Policies

```sql
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Non-deleted threads viewable by everyone"
ON forum_threads FOR SELECT
USING (is_deleted = FALSE);

CREATE POLICY "Authenticated users can create threads"
ON forum_threads FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own threads"
ON forum_threads FOR UPDATE
USING (author_id = auth.uid());

CREATE POLICY "Moderators can manage threads"
ON forum_threads FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Non-deleted replies viewable by everyone"
ON forum_replies FOR SELECT
USING (is_deleted = FALSE);

CREATE POLICY "Authenticated users can create replies"
ON forum_replies FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own replies"
ON forum_replies FOR UPDATE
USING (author_id = auth.uid());

CREATE POLICY "Moderators can manage replies"
ON forum_replies FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own votes"
ON forum_votes FOR ALL
USING (user_id = auth.uid());
```

### API Routes

```
/api/forum/
  GET /categories                # List categories
  GET /categories/:slug/threads  # List threads in category

/api/forum/threads/
  POST /                         # Create thread
  GET /:id                       # Get thread details
  PATCH /:id                     # Update thread
  DELETE /:id                    # Delete thread
  POST /:id/replies              # Add reply
  POST /:id/vote                 # Vote on thread
  POST /:id/follow               # Follow thread
  POST /:id/pin                  # Pin thread (moderator)
  POST /:id/lock                 # Lock thread (moderator)
  POST /:id/best-answer          # Mark best answer

/api/forum/replies/
  GET /:id                       # Get reply
  PATCH /:id                     # Update reply
  DELETE /:id                    # Delete reply
  POST /:id/vote                 # Vote on reply

/api/forum/reports/
  POST /                         # Report content
  GET /                          # List reports (moderator)
  PATCH /:id                     # Review report (moderator)
```

### UI Components

```
/components/forum/
  - ThreadList.tsx               # List threads
  - ThreadCard.tsx               # Thread card
  - ThreadForm.tsx               # Create thread
  - ReplyForm.tsx                # Reply form
  - ReplyList.tsx                # Threaded replies
  - VoteButtons.tsx              # Upvote/downvote
  - BestAnswerBadge.tsx          # Best answer indicator
  - ReportButton.tsx             # Report content

/components/admin/
  - ForumModeration.tsx          # Moderation dashboard
```

### Pages/Routes

```
/app/
  /forum/
    page.tsx                     # Forum home (categories)
    [category]/page.tsx          # Category threads
    [category]/[threadId]/page.tsx # Thread detail

  /admin/
    forum/
      page.tsx                   # Forum moderation
      reports/page.tsx           # Review reports
```

### Testing Checklist

- [ ] User can create thread
- [ ] Rich text editor works
- [ ] Threads display correctly
- [ ] Replies are threaded properly
- [ ] Voting works (upvote/downvote)
- [ ] Best answer can be marked
- [ ] Thread search works
- [ ] Filters work correctly
- [ ] Pinned threads stay on top
- [ ] Locked threads can't be replied to
- [ ] Reports are submitted
- [ ] Moderators can review reports
- [ ] Content can be deleted
- [ ] Follow notifications work

### Success Criteria

- ✅ Thread creation takes <1 minute
- ✅ Real-time reply updates (WebSocket)
- ✅ Search returns results in <500ms
- ✅ Reports reviewed within 24 hours
- ✅ Active discussions daily

---

## Phase 9: Play Logging & Statistics

**Duration:** Week 15
**Goal:** Track gaming sessions and provide statistics
**Dependencies:** Phase 1 (Communities), Phase 3 (Games)

### Features Breakdown

#### 9.1 Play Logging
- Log game plays
  - Game played
  - Date and duration
  - Players list
  - Scores (optional)
  - Winner(s)
  - Location
  - Notes
- Quick log (minimal fields)
- Detailed log (all fields)
- Batch import from BGG

#### 9.2 Personal Statistics
- Total plays
- Unique games played
- Most played games
- Win rate (if tracking winners)
- Play time statistics
- Play calendar (heatmap)
- Monthly/yearly summaries

#### 9.3 Community Statistics
- Community's most played games
- Trending games
- Most active players
- Total play time
- Leaderboards

#### 9.4 Game Statistics
- Times played (across platform)
- Average play time
- Win rate distribution
- Popular player counts
- Community popularity

#### 9.5 Yearly Wrapped
- End-of-year summary
- Total plays, hours, games
- Top games
- Play streaks
- Achievements
- Shareable image

### Database Schema

```sql
-- Play Logs
CREATE TABLE play_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  -- Play details
  played_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT, -- Optional

  -- Location
  location_type TEXT CHECK (location_type IN ('home', 'community', 'cafe', 'convention', 'online', 'other')),
  community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
  location_name TEXT,

  -- Notes
  notes TEXT,

  -- Logging
  logged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Play Log Players
CREATE TABLE play_log_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  play_log_id UUID REFERENCES play_logs(id) ON DELETE CASCADE,

  -- Player (may or may not be registered user)
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,

  -- Score
  score DECIMAL(10,2),
  score_type TEXT, -- 'points', 'ranking', 'win/loss'

  -- Winner
  is_winner BOOLEAN DEFAULT FALSE,
  placement INT, -- 1st, 2nd, 3rd, etc.

  -- Player role (for asymmetric games)
  role TEXT, -- 'Imperium', 'Rebel', etc.

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BGG Play Import Jobs
CREATE TABLE bgg_play_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bgg_username TEXT NOT NULL,

  -- Progress
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  total_plays INT DEFAULT 0,
  imported_plays INT DEFAULT 0,

  -- Date range
  from_date DATE,
  to_date DATE,

  -- Error handling
  error_message TEXT,

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Play Achievements (Gamification)
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Achievement details
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,

  -- Criteria (JSONB for flexibility)
  criteria JSONB, -- { "type": "play_count", "threshold": 100 }

  -- Metadata
  rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  points INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,

  earned_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

-- Play Statistics (Materialized view or cached table)
CREATE TABLE play_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Scope
  scope_type TEXT CHECK (scope_type IN ('user', 'community', 'game', 'global')) NOT NULL,
  scope_id UUID, -- user_id, community_id, or game_id

  -- Time period
  period TEXT CHECK (period IN ('all_time', 'year', 'month', 'week')) NOT NULL,
  year INT,
  month INT,
  week INT,

  -- Statistics
  total_plays INT DEFAULT 0,
  unique_games INT DEFAULT 0,
  unique_players INT DEFAULT 0,
  total_duration_minutes INT DEFAULT 0,

  -- Top games (JSONB array)
  top_games JSONB, -- [{ "game_id": "...", "plays": 10 }]

  -- Last computed
  computed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(scope_type, scope_id, period, year, month, week)
);

-- Indexes
CREATE INDEX idx_play_logs_game ON play_logs(game_id);
CREATE INDEX idx_play_logs_logged_by ON play_logs(logged_by);
CREATE INDEX idx_play_logs_community ON play_logs(community_id);
CREATE INDEX idx_play_logs_date ON play_logs(played_at DESC);

CREATE INDEX idx_play_players_log ON play_log_players(play_log_id);
CREATE INDEX idx_play_players_user ON play_log_players(user_id);

CREATE INDEX idx_statistics_scope ON play_statistics(scope_type, scope_id);
CREATE INDEX idx_statistics_period ON play_statistics(period, year, month);

-- Function to update play statistics (run periodically)
CREATE OR REPLACE FUNCTION update_play_statistics()
RETURNS VOID AS $$
BEGIN
  -- Update user statistics (all time)
  INSERT INTO play_statistics (scope_type, scope_id, period, total_plays, unique_games, total_duration_minutes)
  SELECT
    'user' as scope_type,
    logged_by as scope_id,
    'all_time' as period,
    COUNT(*) as total_plays,
    COUNT(DISTINCT game_id) as unique_games,
    SUM(COALESCE(duration_minutes, 0)) as total_duration_minutes
  FROM play_logs
  GROUP BY logged_by
  ON CONFLICT (scope_type, scope_id, period, year, month, week)
  DO UPDATE SET
    total_plays = EXCLUDED.total_plays,
    unique_games = EXCLUDED.unique_games,
    total_duration_minutes = EXCLUDED.total_duration_minutes,
    computed_at = NOW();

  -- Similar for monthly, yearly, community, game statistics...
END;
$$ LANGUAGE plpgsql;
```

### RLS Policies

```sql
ALTER TABLE play_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own play logs"
ON play_logs FOR SELECT
USING (logged_by = auth.uid());

CREATE POLICY "Community play logs viewable by members"
ON play_logs FOR SELECT
USING (
  community_id IN (
    SELECT community_id FROM community_admins
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create play logs"
ON play_logs FOR INSERT
WITH CHECK (auth.uid() = logged_by);

CREATE POLICY "Users can update own play logs"
ON play_logs FOR UPDATE
USING (logged_by = auth.uid());

CREATE POLICY "Public statistics viewable by everyone"
ON play_statistics FOR SELECT
USING (true);
```

### API Routes

```
/api/plays/
  POST /                         # Log a play
  GET /                          # Get user's plays
  GET /:id                       # Get play details
  PATCH /:id                     # Update play
  DELETE /:id                    # Delete play

/api/plays/import/
  POST /bgg                      # Import plays from BGG
  GET /bgg/:jobId                # Check import status

/api/stats/
  GET /user/:userId              # User statistics
  GET /community/:id             # Community statistics
  GET /game/:id                  # Game statistics
  GET /wrapped/:year             # Yearly wrapped

/api/achievements/
  GET /                          # List achievements
  GET /user/:userId              # User's achievements
```

### UI Components

```
/components/plays/
  - PlayLogForm.tsx              # Log play
  - PlayCard.tsx                 # Display play
  - PlayList.tsx                 # List of plays
  - PlayCalendar.tsx             # Calendar heatmap
  - QuickLogButton.tsx           # Quick log popup

/components/stats/
  - UserStats.tsx                # User statistics dashboard
  - CommunityStats.tsx           # Community leaderboard
  - GameStats.tsx                # Game popularity
  - YearlyWrapped.tsx            # Year-end summary
  - AchievementBadges.tsx        # Achievements display
```

### Pages/Routes

```
/app/
  /dashboard/
    plays/
      page.tsx                   # User's play history
      new/page.tsx               # Log new play
      [id]/edit/page.tsx         # Edit play

  /stats/
    page.tsx                     # Global statistics
    user/[id]/page.tsx           # User stats (public)
    wrapped/[year]/page.tsx      # Yearly wrapped

  /communities/
    [id]/
      stats/page.tsx             # Community statistics
```

### Testing Checklist

- [ ] User can log play
- [ ] Players can be added to play
- [ ] Scores are recorded correctly
- [ ] Winner is marked
- [ ] Play history displays correctly
- [ ] Statistics calculate correctly
- [ ] Play calendar shows plays
- [ ] Monthly summaries work
- [ ] BGG import works
- [ ] Achievements are earned
- [ ] Yearly wrapped generates
- [ ] Shareable wrapped image works

### Success Criteria

- ✅ Play logging takes <30 seconds
- ✅ Statistics update in real-time
- ✅ Play calendar is visually appealing
- ✅ Yearly wrapped is shareable
- ✅ Achievements motivate usage

---

## Summary

All 9 phases are now detailed with:
- ✅ Complete feature breakdowns
- ✅ Database schemas with triggers and indexes
- ✅ Row Level Security policies
- ✅ API endpoint specifications
- ✅ UI component lists
- ✅ Page routing structure
- ✅ Testing checklists
- ✅ Success criteria

This document serves as the complete implementation blueprint for BoardGameCulture.
