# Authentication System Testing Guide

## Prerequisites

Before testing authentication, ensure:

1. Supabase project is created (follow `SUPABASE_SETUP.md`)
2. Database migrations are applied
3. `.env.local` file has correct Supabase credentials
4. Dev server is running: `npm run dev`

## Testing Checklist

### 1. Sign Up Flow

**Test: Email/Password Signup**
1. Navigate to http://localhost:3002/auth/signup
2. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123` (min 8 chars)
   - Confirm Password: `password123`
3. Click "Sign Up"
4. Expected Result:
   - Success message: "Check your email!"
   - Email confirmation sent (if enabled in Supabase)
   - User redirected to confirmation page

**Test: Password Validation**
1. Try password < 8 characters
2. Try mismatched passwords
3. Expected: Validation errors shown

**Test: Duplicate Email**
1. Try signing up with existing email
2. Expected: "Email already registered" error

### 2. Email Confirmation

**If Email Confirmation is Enabled:**
1. Check email inbox for confirmation link
2. Click confirmation link
3. Expected: Redirected to `/auth/callback` → Dashboard
4. Profile should be created automatically via trigger

**If Email Confirmation is Disabled:**
1. User is logged in immediately
2. Redirected to Dashboard

### 3. Login Flow

**Test: Valid Credentials**
1. Navigate to http://localhost:3002/auth/login
2. Enter email and password
3. Click "Log In"
4. Expected: Redirected to `/dashboard`

**Test: Invalid Credentials**
1. Enter wrong password
2. Expected: Error message displayed
3. User remains on login page

**Test: Remember Me**
1. Check "Remember me" checkbox
2. Login successfully
3. Close browser and reopen
4. Expected: Still logged in

### 4. Password Reset Flow

**Test: Request Reset Link**
1. Navigate to http://localhost:3002/auth/reset
2. Enter registered email
3. Click "Send Reset Link"
4. Expected: Success message, email sent

**Test: Update Password**
1. Click reset link in email
2. Should redirect to `/auth/update-password`
3. Enter new password (min 8 chars)
4. Confirm password
5. Click "Update Password"
6. Expected: Success, redirected to login

**Test: Invalid Reset Link**
1. Try accessing `/auth/update-password` without valid token
2. Expected: "Invalid or expired reset link" error

### 5. Protected Routes

**Test: Dashboard Access (Logged Out)**
1. Log out if logged in
2. Navigate to http://localhost:3002/dashboard
3. Expected: Redirected to `/auth/login`

**Test: Dashboard Access (Logged In)**
1. Log in
2. Navigate to `/dashboard`
3. Expected: Dashboard visible with user data

### 6. Navigation

**Test: Navbar (Logged Out)**
1. Log out
2. Check navbar shows:
   - "Communities" link
   - "Log In" button
   - "Sign Up" button

**Test: Navbar (Logged In)**
1. Log in
2. Check navbar shows:
   - "Dashboard" link
   - "Communities" link
   - "Sign Out" button

**Test: Sign Out**
1. Click "Sign Out" in navbar
2. Expected: Logged out, redirected to home page

### 7. Profile Creation

**Test: Profile Auto-Creation**
1. Sign up new user
2. Confirm email (if required)
3. Check Supabase Dashboard → Table Editor → `profiles`
4. Expected: New profile row with:
   - `user_id` matching auth.users
   - `full_name` from signup form
   - Timestamps set
   - Location fields null (to be filled later)

### 8. Auth State Persistence

**Test: Page Refresh**
1. Log in
2. Refresh page
3. Expected: Still logged in, user data intact

**Test: Browser Restart**
1. Log in
2. Close browser completely
3. Reopen and visit site
4. Expected: Session restored (if "Remember me" was checked)

## Common Issues

### "Failed to connect"
- Check `.env.local` has correct Supabase URL and keys
- Ensure `NEXT_PUBLIC_` prefix is used
- Restart dev server

### "Row Level Security policy violation"
- Check RLS policies are created
- Run migration again if needed
- Check Supabase logs

### "Invalid JWT"
- Anon key might be wrong
- Check for extra spaces in `.env.local`
- Regenerate keys in Supabase

### Email not received
- Check Supabase → Authentication → Email Templates
- Verify email provider settings
- Check spam folder
- For development, you can disable email confirmation

## Database Verification

After successful signup, verify in Supabase Dashboard:

1. **auth.users table**:
   - New user record
   - Email confirmed (if required)
   - created_at timestamp

2. **profiles table**:
   - Profile created via trigger
   - user_id matches auth.users.id
   - full_name populated
   - All other fields null/default

## Next Steps

Once authentication is working:
1. ✅ Users can sign up and log in
2. ✅ Email confirmation flow works
3. ✅ Password reset works
4. ✅ Protected routes are secure
5. 🚀 Ready to build community features!

## Useful Supabase Queries

**Check if user has profile:**
```sql
SELECT * FROM profiles WHERE user_id = 'user-uuid-here';
```

**Check auth user:**
```sql
SELECT * FROM auth.users WHERE email = 'test@example.com';
```

**Reset password manually (development only):**
```sql
UPDATE auth.users
SET encrypted_password = crypt('newpassword', gen_salt('bf'))
WHERE email = 'test@example.com';
```
