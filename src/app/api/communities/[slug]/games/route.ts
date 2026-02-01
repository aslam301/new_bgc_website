import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { AddCommunityGameInput, GameFilters } from '@/types/games'

// GET /api/communities/[slug]/games - Get community's game collection
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)

  const filters: GameFilters = {
    search: searchParams.get('search') || undefined,
    status: searchParams.get('status') as any,
    min_players: searchParams.get('min_players')
      ? parseInt(searchParams.get('min_players')!)
      : undefined,
    max_players: searchParams.get('max_players')
      ? parseInt(searchParams.get('max_players')!)
      : undefined,
  }

  const supabase = await createClient()

  // Get community ID from slug
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

  let query = supabase
    .from('community_games')
    .select(
      `
      *,
      game:games(*)
    `
    )
    .eq('community_id', community.id)

  // Status filter
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  const { data: communityGames, error } = await query

  if (error) {
    console.error('Error fetching community games:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Apply filters on the games
  let filteredGames = communityGames

  if (filters.search) {
    filteredGames = filteredGames.filter((cg) =>
      cg.game?.name.toLowerCase().includes(filters.search!.toLowerCase())
    )
  }

  if (filters.min_players) {
    filteredGames = filteredGames.filter(
      (cg) =>
        cg.game?.min_players &&
        cg.game.min_players <= filters.min_players!
    )
  }

  if (filters.max_players) {
    filteredGames = filteredGames.filter(
      (cg) =>
        cg.game?.max_players &&
        cg.game.max_players >= filters.max_players!
    )
  }

  return NextResponse.json({ games: filteredGames })
}

// POST /api/communities/[slug]/games - Add game to community collection
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: AddCommunityGameInput = await request.json()

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

    // Validate game exists and is approved
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, is_approved')
      .eq('id', body.game_id)
      .single()

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    if (!game.is_approved) {
      return NextResponse.json(
        { error: 'Game is not approved yet' },
        { status: 400 }
      )
    }

    // Check if game already in collection
    const { data: existing } = await supabase
      .from('community_games')
      .select('id')
      .eq('community_id', community.id)
      .eq('game_id', body.game_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Game already in collection' },
        { status: 409 }
      )
    }

    // Add game to collection
    const { data: communityGame, error: createError } = await supabase
      .from('community_games')
      .insert({
        community_id: community.id,
        game_id: body.game_id,
        status: body.status || 'own',
        notes: body.notes || null,
        condition: body.condition || null,
        times_played: body.times_played || 0,
        acquisition_date: body.acquisition_date || null,
        added_by: user.id,
      })
      .select(
        `
        *,
        game:games(*)
      `
      )
      .single()

    if (createError) {
      console.error('Error adding game to collection:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json({ communityGame }, { status: 201 })
  } catch (error) {
    console.error('Error adding game to collection:', error)
    return NextResponse.json(
      { error: 'Failed to add game to collection' },
      { status: 500 }
    )
  }
}
