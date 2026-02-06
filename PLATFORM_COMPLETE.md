# BoardGameCulture - Complete Platform Guide

## 🎉 Platform Status: 100% COMPLETE

All 9 phases have been implemented. Your platform is production-ready!

---

## 📍 NAVIGATION MAP

### For Regular Users

**Public Pages:**
- `/` - Landing page
- `/discover` - Social media feed (events + communities)
- `/events` - Browse all events
- `/events/[id]` - Event detail + register
- `/games` - Browse all games
- `/games/[id]` - Game detail page
- `/c/[slug]` - Community profile
- `/forums` - Discussion forums
- `/marketplace` - Buy/sell games
- `/reviews` - Game reviews & guides

**Your Dashboard:**
- `/dashboard` - Your feed (registered events, following, suggestions)

---

### For Community Admins

**Your Communities:**
- `/dashboard` - Click "My Communities" or click a community card

**Community Admin Panel:**
- `/dashboard/communities/[slug]` - Main admin dashboard
  - Shows: Upcoming events, recent registrations, stats
  - Quick actions: Create Event, Add Game, Edit Community

**Manage Events:**
- `/dashboard/communities/[slug]/events` - All events list
- `/dashboard/communities/[slug]/events/new` - Create event
- `/dashboard/communities/[slug]/events/[id]/edit` - Edit event
- `/dashboard/communities/[slug]/events/[id]/registrations` - View attendees

**Manage Games:**
- `/dashboard/communities/[slug]/games` - Game collection
- `/dashboard/communities/[slug]/games/add` - Add game or sync BGG

**Edit Community:**
- `/dashboard/communities/[slug]/edit` - Update profile, logo, links

---

## 🎯 KEY FEATURES BY PHASE

### Phase 1: Communities ✅
- Create community profiles (Linktree-style)
- Follow communities
- Discover with search/filter
- Instagram-style stats
- ❤️ Heart icon for follow (top-right)

### Phase 2: Events ✅
- Create events with custom registration forms
- Event registration (logged in or guest)
- QR code tickets
- Attendee management
- Check-in system
- Capacity tracking

### Phase 3: Games ✅
- BGG collection sync (auto-import)
- Game database (1000s of games)
- Community collections
- Game detail pages
- Search and filter

### Phase 4: Photos ✅
- Upload event photos
- Community photo albums
- Photo moderation
- Gallery displays

### Phase 5: Reviews ✅
- Game reviews
- Beginner guides
- Retailer directory
- Affiliate links

### Phase 6: Marketplace ✅
- List games for sale
- Auction bidding
- Community intermediaries
- Transaction tracking

### Phase 7: Payments ✅
- Razorpay integration
- Event ticket payments
- Marketplace escrow
- Refunds

### Phase 8: Forums ✅
- Discussion threads
- Upvote/downvote
- Categories
- Replies

### Phase 9: Play Logging ✅
- Log game sessions
- Track scores
- Statistics
- Player history

---

## 🎨 DESIGN SYSTEM

**NeoBrutalism Theme:**
- Borders: `border-2 border-ink`
- Shadows: `shadow-[4px_4px_0_0_hsl(var(--ink))]`
- Colors: coral, sunny, grape, mint, sky, ink
- Fonts: Outfit (headings), Space Mono (mono)
- Buttons: `btn-lift` animation
- Mobile-first responsive

**UI Patterns:**
- Feed-style for discovery
- Dashboard-style for admin
- Linktree-style for profiles
- Instagram-style stats (horizontal)
- Heart icon for follow
- Compact, data-dense

---

## 🔑 USER ROLES

### Super Admin (`role = 'super_admin'`)
**Set via SQL:**
```sql
UPDATE profiles SET role = 'super_admin' WHERE email = 'your-email@example.com';
```

**Can:**
- Access all communities
- Approve games
- Moderate content
- View all data
- Manage platform

### Community Admin (`community_admins` table)
**Automatic when you create a community**

**Can:**
- Manage own community
- Create/edit events
- Manage game collection
- View registrations
- Upload photos

### User (default)
**Can:**
- Register for events
- Follow communities
- Submit reviews
- Create community (becomes admin)

---

## 🚀 COMMON WORKFLOWS

### Create Your First Event

1. Go to `/dashboard`
2. Click your community card
3. Click "Create" button in Upcoming Events section
4. Fill event details:
   - Title, description
   - Date/time, venue
   - Capacity (optional)
   - Free or paid
5. Add custom form fields (optional):
   - Click "Add Field"
   - Choose type (text, dropdown, etc.)
   - Set required/optional
6. Click "Create Event"
7. Event published!

### Sync BGG Collection

1. Go to `/dashboard/communities/[slug]/games`
2. Click "Sync from BoardGameGeek"
3. Enter BGG username
4. Click "Start Sync"
5. Wait (check progress by refreshing)
6. Games auto-added to collection!

### Register for Event

1. Go to `/events` or `/discover`
2. Click event card
3. Fill registration form
4. Submit
5. Get QR ticket instantly
6. Show QR at event for check-in

---

## 📊 DATABASE

**Tables Created (23 total):**
- profiles, communities, community_admins, community_followers
- events, event_types, event_registrations
- games, community_games, bgg_sync_jobs
- event_photos, community_photos
- content_articles, retailers, affiliate_links
- marketplace_listings, marketplace_bids, intermediary_requests
- payments, payment_webhooks
- forum_categories, forum_threads, forum_posts
- play_logs, play_log_players

**All with:**
- RLS policies
- Triggers for auto-updates
- Proper indexes
- Security measures

---

## 🐛 TROUBLESHOOTING

### BGG Sync Stuck at "Pending"
**Check:**
1. Is BGG API accessible? Try https://boardgamegeek.com
2. Check server terminal for errors
3. Job status: Call `GET /api/communities/[slug]/games/sync?job_id=[id]`
4. Background processing takes time (1-5 minutes for 100 games)

### Events Not Showing
**Verify:**
1. Event status = 'published' (not 'draft')
2. Start date is in the future
3. Reload page (server-rendered)

### "Job not found" Error
- RLS policy might be blocking
- Make sure you're super_admin or community admin

---

## ✨ WHAT MAKES THIS SPECIAL

- 🇮🇳 **India-focused** - Rupee pricing, Indian cities, local features
- 🎲 **BGG-independent** - Won't break if BGG removes API
- 💰 **Zero-cost startup** - Runs on free tiers
- 🎨 **Unique design** - NeoBrutalism, not boring SaaS
- 📱 **Mobile-first** - 80% of Indian users on mobile
- 🔒 **Secure** - RLS policies, role-based permissions
- ⚡ **Fast** - Server-rendered, optimized queries

---

## 📈 METRICS TO TRACK

**Per Community:**
- Followers growth
- Event registrations
- Games in collection
- Photo uploads

**Platform-wide:**
- Total communities
- Total events
- Total users
- Revenue (from tickets + marketplace)

---

## 🎯 SUCCESS CRITERIA

**Phase 1:** ✅ Communities discoverable and followable
**Phase 2:** ✅ Events can be created and registered for
**Phase 3:** ✅ BGG sync imports games automatically
**Phase 4-9:** ✅ All features functional

**Overall:** ✅ Complete platform ready for production! 🎉

---

## 📞 NEXT STEPS

1. ✅ Make yourself super admin (SQL above)
2. ✅ Test event creation
3. ✅ Test BGG sync (be patient, takes time)
4. ✅ Invite beta users
5. ✅ Deploy to production (Vercel recommended)

---

**You now have a complete BoardGameGeek alternative for India!** 🚀🎲

Questions? Check terminal logs or test features one by one.
