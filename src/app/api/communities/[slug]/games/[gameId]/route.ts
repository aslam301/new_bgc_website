import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { UpdateCommunityGameInput } from '@/types/games'

// PATCH /api/communities/[slug]/games/[gameId] - Update game in collection
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; gameId: string }> }
) {
  const { slug, gameId } = await params
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: UpdateCommunityGameInput = await request.json()

    // Get community
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', slug)
      .single()

    if (communityError || !community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      )
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_community_admin', {
      p_community_id: community.id,
      p_user_id: user.id,
    })

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'You must be a community admin to manage games' },
        { status: 403 }
      )
    }

    // Update game
    const updateData: any = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.condition !== undefined) updateData.condition = body.condition
    if (body.times_played !== undefined)
      updateData.times_played = body.times_played
    if (body.acquisition_date !== undefined)
      updateData.acquisition_date = body.acquisition_date

    const { data: communityGame, error: updateError } = await supabase
      .from('community_games')
      .update(updateData)
      .eq('id', gameId)
      .eq('community_id', community.id)
      .select(
        `
        *,
        game:games(*)
      `
      )
      .single()

    if (updateError) {
      console.error('Error updating community game:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ communityGame })
  } catch (error) {
    console.error('Error updating community game:', error)
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    )
  }
}

// DELETE /api/communities/[slug]/games/[gameId] - Remove game from collection
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; gameId: string }> }
) {
  const { slug, gameId } = await params
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get community
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', slug)
      .single()

    if (communityError || !community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      )
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_community_admin', {
      p_community_id: community.id,
      p_user_id: user.id,
    })

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'You must be a community admin to manage games' },
        { status: 403 }
      )
    }

    // Delete game
    const { error: deleteError } = await supabase
      .from('community_games')
      .delete()
      .eq('id', gameId)
      .eq('community_id', community.id)

    if (deleteError) {
      console.error('Error deleting community game:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting community game:', error)
    return NextResponse.json(
      { error: 'Failed to remove game' },
      { status: 500 }
    )
  }
}
