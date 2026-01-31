# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Project Name:** boardgameculture
   - **Database Password:** (generate a strong password - save it!)
   - **Region:** Choose closest to India (Singapore recommended)
   - **Pricing Plan:** Free tier is perfect to start
5. Click "Create new project"
6. Wait 2-3 minutes for project creation

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** (gear icon)
2. Click **API** in the sidebar
3. You'll see:
   - **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key:** `eyJhbGci...` (long string)
   - **service_role key:** `eyJhbGci...` (different long string)

## 3. Set Up Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## 4. Run Database Migration

### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project
2. Click **SQL Editor** in the sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20260201000001_initial_schema.sql`
5. Paste into the SQL editor
6. Click **Run** button
7. You should see "Success. No rows returned"

### Option B: Using Supabase CLI (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Push migrations:
   ```bash
   supabase db push
   ```

## 5. Verify Setup

1. In Supabase Dashboard, go to **Table Editor**
2. You should see these tables:
   - ✅ profiles
   - ✅ communities
   - ✅ community_admins
   - ✅ community_followers
   - ✅ legal_acceptances

3. Go to **Authentication** → **Policies**
4. You should see RLS policies enabled for all tables

## 6. Test the Connection

1. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Open browser console on http://localhost:3000
3. Try creating a test query (we'll add a test page later)

## 7. Configure Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. **Email** provider should be enabled by default
3. Configure settings:
   - **Confirm email:** ON (recommended)
   - **Secure password:** ON
   - **Minimum password length:** 8

4. Go to **Authentication** → **Email Templates**
5. Customize email templates (optional):
   - Confirm signup
   - Reset password
   - Magic link

## 8. Configure Storage (for Phase 4 - Photo Galleries)

This can wait until Phase 4, but to set up now:

1. Go to **Storage** in sidebar
2. Create a new bucket:
   - **Name:** `community-logos`
   - **Public:** ON
3. Create another bucket:
   - **Name:** `event-photos`
   - **Public:** ON

## Troubleshooting

### "Failed to connect"
- Check your `.env.local` file has correct values
- Make sure `NEXT_PUBLIC_` prefix is used for client-side variables
- Restart dev server after adding env variables

### "Row Level Security policy violation"
- Check RLS policies are created (Step 5)
- Try running the migration again
- Check Supabase logs in Dashboard → Logs

### "Invalid JWT"
- Anon key might be copied incorrectly
- Check for extra spaces or line breaks
- Regenerate keys in Supabase Dashboard → Settings → API

## Next Steps

Once Supabase is set up:
1. ✅ Database schema is ready
2. ✅ Authentication is configured
3. ✅ RLS policies are active
4. 🚀 Ready to build signup/login pages!

## Useful Supabase Docs

- [Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
