# Phase 1 Updates - Followers & Compliance

**Date:** February 2026
**Status:** Important changes to Phase 1 implementation

---

## Key Changes from Original Phase 1 Plan

### 1. Followers, Not Members ✨

**OLD Concept:** Communities have "members"
**NEW Concept:** Communities have "followers" or "interested" users

#### Why This Change?
- Communities on BoardGameCulture are more like social media pages/creators
- Users don't "join" - they "follow" or express "interest"
- Lower commitment barrier for users
- Better matches the Linktree/creator platform model

#### Implementation Details:

**Statistics Display:**
- OLD: Members, Events, Games
- NEW: Followers, Events, Games

**Initial Values:**
- Followers: 1 (community admin auto-follows on creation)
- Events: 0
- Games: 0

**User Actions:**
- "Follow" button (not "Join")
- "Interested" alternative (same functionality, different wording)
- Logged-in users can follow/unfollow
- Non-logged-in users prompted to sign up when clicking follow

**Database Changes:**

```sql
-- Communities table update
CREATE TABLE communities (
  -- ... other fields ...
  follower_count INT DEFAULT 1, -- Changed from member_count, starts at 1
  -- ... rest of fields ...
);

-- New table for tracking followers
CREATE TABLE community_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Trigger to auto-follow on community creation
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

-- Trigger to update follower count
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
```

**API Routes:**

```
POST   /api/communities/:slug/follow    # Follow a community
DELETE /api/communities/:slug/follow    # Unfollow a community
GET    /api/communities/:slug/followers # Get followers list (paginated)
GET    /api/users/me/following          # Get communities user follows
```

**UI Components:**

```tsx
// components/community/FollowButton.tsx
interface FollowButtonProps {
  communityId: string;
  initialFollowing: boolean;
  followerCount: number;
}

export function FollowButton({ communityId, initialFollowing, followerCount }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(followerCount);
  const { user } = useAuth();

  const handleFollow = async () => {
    if (!user) {
      // Redirect to login
      router.push('/auth/login?redirect=' + window.location.pathname);
      return;
    }

    try {
      if (isFollowing) {
        await fetch(`/api/communities/${communityId}/follow`, { method: 'DELETE' });
        setIsFollowing(false);
        setCount(prev => prev - 1);
      } else {
        await fetch(`/api/communities/${communityId}/follow`, { method: 'POST' });
        setIsFollowing(true);
        setCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  return (
    <button
      onClick={handleFollow}
      className={`
        px-6 py-3 rounded-lg font-medium transition-all
        ${isFollowing
          ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          : 'bg-primary hover:bg-primary-dark text-white'
        }
      `}
    >
      {isFollowing ? '✓ Following' : '+ Follow'}
      <span className="ml-2 text-sm">({count})</span>
    </button>
  );
}
```

**Alternative Wording Options:**
- "Follow" / "Following" (like Twitter/Instagram)
- "Interested" / "Following" (more casual)
- "Join" / "Joined" (if you prefer member-like feel)
- "Subscribe" / "Subscribed" (newsletter-style)

**Recommended:** Use "Follow" as primary, with "Interested" as fallback in certain contexts.

---

### 2. "Powered by BoardGameCulture" Badge 🏷️

**OLD Concept:** Footer text saying "Powered by BoardGameCulture"
**NEW Concept:** Small badge/button (like Lovable, Vercel, Made with Webflow)

#### Design Specifications:

**Visual Style:**
- Small, unobtrusive badge
- Fixed position (bottom-right recommended)
- Contains logo + text
- Hover effect for interactivity
- Responsive (smaller on mobile)

**Example Design:**

```tsx
// components/layout/PoweredByBadge.tsx
export function PoweredByBadge() {
  return (
    <a
      href="https://boardgameculture.com/platform"
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed bottom-4 right-4 z-50
        bg-white border-2 border-gray-900 rounded-lg
        px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
        hover:translate-x-[2px] hover:translate-y-[2px]
        transition-all duration-200
        flex items-center gap-2
      "
    >
      {/* Logo */}
      <Image
        src="/logo.svg"
        alt="BoardGameCulture"
        width={20}
        height={20}
      />
      {/* Text */}
      <span className="text-xs font-medium">
        Powered by <span className="font-bold">BGC</span>
      </span>
    </a>
  );
}
```

**Placement:**
- Every community profile page
- Not on admin dashboard (internal tools)
- Not on platform's own pages (landing, about, etc.)
- Only on user-facing community pages

**Landing Page:**
When users click the badge, they go to a landing page that explains:
- What is BoardGameCulture?
- How it helps communities
- Features overview
- Pricing (free tier, paid features)
- "Create Your Community" CTA

**Landing Page Route:**
`/platform` or `/create` or `/start`

---

### 3. Legal & Compliance Pages 📄

Required pages for Phase 1:

1. **Terms & Conditions** (`/legal/terms`)
   - User agreement
   - Account responsibilities
   - Service description
   - Liability limitations

2. **Privacy Policy** (`/legal/privacy`)
   - Data collection practices
   - How data is used
   - User rights (GDPR-style)
   - Contact for privacy requests

3. **Refund Policy** (`/legal/refund`)
   - **Key point:** No refunds except technical failures
   - Event ticket policy
   - Marketplace policy
   - Dispute process

4. **Cookie Policy** (`/legal/cookies`)
   - Types of cookies used
   - How to manage cookies
   - Third-party cookies

5. **Community Guidelines** (`/guidelines`)
   - Acceptable behavior
   - Content policies
   - Consequences for violations

**Implementation Requirements:**

✅ All pages accessible before signup
✅ Footer links to all legal pages
✅ "I agree to Terms" checkbox during signup
✅ Log acceptance in database with timestamp
✅ Version control for legal document changes
✅ Require re-acceptance if Terms change significantly

**Database Schema:**

```sql
CREATE TABLE legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT CHECK (document_type IN ('terms', 'privacy', 'refund', 'cookies')) NOT NULL,
  document_version TEXT NOT NULL, -- e.g., "1.0", "1.1"
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
```

**Signup Flow Update:**

```tsx
// components/auth/SignUpForm.tsx
export function SignUpForm() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms & Conditions');
      return;
    }

    // ... signup logic ...

    // Log acceptance
    await fetch('/api/legal/accept', {
      method: 'POST',
      body: JSON.stringify({
        document_type: 'terms',
        document_version: '1.0'
      })
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... other fields ... */}

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          required
        />
        <label htmlFor="terms" className="text-sm">
          I agree to the{' '}
          <a href="/legal/terms" target="_blank" className="underline">
            Terms & Conditions
          </a>{' '}
          and{' '}
          <a href="/legal/privacy" target="_blank" className="underline">
            Privacy Policy
          </a>
        </label>
      </div>

      <button type="submit" disabled={!agreedToTerms}>
        Sign Up
      </button>
    </form>
  );
}
```

---

### 4. Updated Phase 1 Testing Checklist

**Follower Functionality:**
- [ ] Community admin auto-follows on creation
- [ ] Initial follower count is 1 (not 0)
- [ ] Logged-in users can follow communities
- [ ] Logged-in users can unfollow communities
- [ ] Non-logged-in users are prompted to sign up
- [ ] Follower count updates in real-time
- [ ] Following status persists across sessions
- [ ] User can see list of communities they follow
- [ ] Community can see list of followers (admin only)

**"Powered by" Badge:**
- [ ] Badge displays on all community profile pages
- [ ] Badge does NOT display on admin dashboard
- [ ] Badge does NOT display on platform's own pages
- [ ] Badge links to platform landing page
- [ ] Badge has hover effect
- [ ] Badge is responsive (smaller on mobile)
- [ ] Landing page loads correctly
- [ ] Landing page has clear CTA

**Legal Pages:**
- [ ] All legal pages are accessible
- [ ] Footer links to all legal pages work
- [ ] Legal pages are readable on mobile
- [ ] Terms checkbox appears on signup
- [ ] Cannot sign up without accepting terms
- [ ] Acceptance is logged in database
- [ ] Acceptance includes timestamp and IP
- [ ] Links to legal pages open in new tab

---

### 5. Terminology Updates Throughout Platform

Replace all instances of:
- "Members" → "Followers"
- "Member count" → "Follower count"
- "Join" → "Follow" (on community pages)
- "Joined" → "Following"
- "Member list" → "Followers list"

Keep these terms:
- "Community Admin" (not "Community Owner")
- "Event Attendees" (not followers)
- "Platform Admin" (not changed)

---

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| Community connections | Members (join) | Followers (follow/interested) |
| Initial count | 0 members | 1 follower (admin) |
| Branding element | Footer text | Clickable badge |
| Badge destination | N/A | Platform landing page |
| Legal pages | TBD | 5 required pages |
| Signup | Email/password | + Terms acceptance |
| Terminology | Join/Members | Follow/Followers |

---

## Next Steps

1. ✅ Update database schema with community_followers table
2. ✅ Implement follow/unfollow API endpoints
3. ✅ Create FollowButton component
4. ✅ Update community profile page with Follow button
5. ✅ Design and implement PoweredByBadge component
6. ✅ Create platform landing page
7. ✅ Write all legal pages (get legal review)
8. ✅ Add legal acceptance to signup flow
9. ✅ Add footer with legal links
10. ✅ Update all copy from "members" to "followers"
11. ✅ Test all follower functionality
12. ✅ Test badge display and linking
13. ✅ Test legal page accessibility

---

## Questions to Resolve

1. **Follow button placement:** Above or below statistics?
2. **Badge size:** How small is too small?
3. **Landing page URL:** `/platform`, `/create`, or `/start`?
4. **Alternative wording:** "Follow" vs "Interested" - which is primary?
5. **Logo for badge:** Will be provided - what dimensions?

---

**Ready to implement these Phase 1 updates!**
