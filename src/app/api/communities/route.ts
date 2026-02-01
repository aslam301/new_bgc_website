import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/communities - List/search communities
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const city = searchParams.get('city')
  const sort = searchParams.get('sort') || 'followers' // followers, newest, active, alpha

  const supabase = await createClient()

  let query = supabase
    .from('communities')
    .select('*')
    .eq('is_active', true)

  // Apply search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Apply city filter
  if (city) {
    query = query.eq('city', city)
  }

  // Apply sorting
  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'active':
      query = query.order('updated_at', { ascending: false })
      break
    case 'alpha':
      query = query.order('name', { ascending: true })
      break
    case 'followers':
    default:
      query = query.order('follower_count', { ascending: false })
      break
  }

  const { data: communities, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ communities })
}

// POST /api/communities - Create a new community
export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Ensure profile exists (create if missing)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // Profile doesn't exist, create it
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return NextResponse.json(
          { error: 'Failed to create user profile. Please try logging out and back in.' },
          { status: 500 }
        )
      }
    }

    const body = await request.json()
    const { name, slug, description, city, state, logo_url, accent_color, whatsapp_url, instagram_url, discord_url, website_url } = body

    // Validate required fields
    if (!name || !slug || !city) {
      return NextResponse.json(
        { error: 'Name, slug, and city are required' },
        { status: 400 }
      )
    }

    // Check if slug is already taken
    const { data: existing } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'This URL slug is already taken' },
        { status: 409 }
      )
    }

    // Create community
    const { data: community, error: createError } = await supabase
      .from('communities')
      .insert({
        name,
        slug,
        description,
        city,
        state,
        logo_url,
        accent_color: accent_color || '#FF6B6B',
        whatsapp_url,
        instagram_url,
        discord_url,
        website_url,
        created_by: user.id,
        follower_count: 1, // Admin auto-follows
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // Create admin record (also handled by trigger, but explicit is better)
    const { error: adminError } = await supabase
      .from('community_admins')
      .insert({
        community_id: community.id,
        user_id: user.id,
        role: 'owner',
      })

    if (adminError) {
      // Log but don't fail (trigger might have created it)
      console.error('Admin creation error:', adminError)
    }

    // Create follower record (admin auto-follows)
    const { error: followError } = await supabase
      .from('community_followers')
      .insert({
        community_id: community.id,
        user_id: user.id,
      })

    if (followError) {
      console.error('Auto-follow error:', followError)
    }

    return NextResponse.json({ community }, { status: 201 })
  } catch (error) {
    console.error('Community creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create community' },
      { status: 500 }
    )
  }
}
