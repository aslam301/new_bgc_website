import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/communities/[slug] - Get community by slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = await createClient()
  const { slug } = params

  const { data: community, error } = await supabase
    .from('communities')
    .select(`
      *,
      community_admins (
        user_id,
        role,
        profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Community not found' }, { status: 404 })
  }

  return NextResponse.json({ community })
}

// PATCH /api/communities/[slug] - Update community
export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = params

  // Check if user is admin of this community
  const { data: community } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!community) {
    return NextResponse.json({ error: 'Community not found' }, { status: 404 })
  }

  const { data: isAdmin } = await supabase
    .from('community_admins')
    .select('id')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .single()

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, description, city, state, logo_url, accent_color, whatsapp_url, instagram_url, discord_url, website_url } = body

    const { data: updated, error } = await supabase
      .from('communities')
      .update({
        name,
        description,
        city,
        state,
        logo_url,
        accent_color,
        whatsapp_url,
        instagram_url,
        discord_url,
        website_url,
      })
      .eq('id', community.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ community: updated })
  } catch (error) {
    console.error('Community update error:', error)
    return NextResponse.json(
      { error: 'Failed to update community' },
      { status: 500 }
    )
  }
}
