import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/communities/[slug]/follow - Follow a community
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  // Get community by slug
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', slug)
    .single()

  if (communityError || !community) {
    return NextResponse.json({ error: 'Community not found' }, { status: 404 })
  }

  // Check if already following
  const { data: existing } = await supabase
    .from('community_followers')
    .select('id')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ message: 'Already following' }, { status: 200 })
  }

  // Create follow record
  const { error: followError } = await supabase
    .from('community_followers')
    .insert({
      community_id: community.id,
      user_id: user.id,
    })

  if (followError) {
    return NextResponse.json({ error: followError.message }, { status: 500 })
  }

  // Trigger will automatically update follower_count
  return NextResponse.json({ message: 'Successfully followed' }, { status: 201 })
}

// DELETE /api/communities/[slug]/follow - Unfollow a community
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  // Get community by slug
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', slug)
    .single()

  if (communityError || !community) {
    return NextResponse.json({ error: 'Community not found' }, { status: 404 })
  }

  // Delete follow record
  const { error: unfollowError } = await supabase
    .from('community_followers')
    .delete()
    .eq('community_id', community.id)
    .eq('user_id', user.id)

  if (unfollowError) {
    return NextResponse.json({ error: unfollowError.message }, { status: 500 })
  }

  // Trigger will automatically update follower_count
  return NextResponse.json({ message: 'Successfully unfollowed' }, { status: 200 })
}
