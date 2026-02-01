import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CreateGameInput, GameFilters } from '@/types/games'

// GET /api/games - Search/list approved games
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const filters: GameFilters = {
    search: searchParams.get('search') || undefined,
    min_players: searchParams.get('min_players')
      ? parseInt(searchParams.get('min_players')!)
      : undefined,
    max_players: searchParams.get('max_players')
      ? parseInt(searchParams.get('max_players')!)
      : undefined,
    playtime_min: searchParams.get('playtime_min')
      ? parseInt(searchParams.get('playtime_min')!)
      : undefined,
    playtime_max: searchParams.get('playtime_max')
      ? parseInt(searchParams.get('playtime_max')!)
      : undefined,
    complexity_min: searchParams.get('complexity_min')
      ? parseFloat(searchParams.get('complexity_min')!)
      : undefined,
    complexity_max: searchParams.get('complexity_max')
      ? parseFloat(searchParams.get('complexity_max')!)
      : undefined,
  }

  const supabase = await createClient()

  let query = supabase
    .from('games')
    .select('*')
    .eq('is_approved', true)

  // Search filter (name or description)
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    )
  }

  // Player count filters
  if (filters.min_players) {
    query = query.lte('min_players', filters.min_players)
  }
  if (filters.max_players) {
    query = query.gte('max_players', filters.max_players)
  }

  // Playtime filters
  if (filters.playtime_min) {
    query = query.gte('playtime_max', filters.playtime_min)
  }
  if (filters.playtime_max) {
    query = query.lte('playtime_min', filters.playtime_max)
  }

  // Complexity filters
  if (filters.complexity_min) {
    query = query.gte('complexity', filters.complexity_min)
  }
  if (filters.complexity_max) {
    query = query.lte('complexity', filters.complexity_max)
  }

  // Sort by name
  query = query.order('name', { ascending: true })

  const { data: games, error } = await query

  if (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ games })
}

// POST /api/games - Request a new game (user-submitted, needs approval)
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
    const body: CreateGameInput = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Game name is required' },
        { status: 400 }
      )
    }

    // Check if BGG ID already exists
    if (body.bgg_id) {
      const { data: existingGame } = await supabase
        .from('games')
        .select('id')
        .eq('bgg_id', body.bgg_id)
        .single()

      if (existingGame) {
        return NextResponse.json(
          { error: 'Game with this BGG ID already exists' },
          { status: 409 }
        )
      }
    }

    // Create game (will need admin approval unless synced from BGG)
    const { data: game, error: createError } = await supabase
      .from('games')
      .insert({
        bgg_id: body.bgg_id || null,
        name: body.name,
        year_published: body.year_published || null,
        image_url: body.image_url || null,
        thumbnail_url: body.thumbnail_url || null,
        description: body.description || null,
        min_players: body.min_players || null,
        max_players: body.max_players || null,
        playtime_min: body.playtime_min || null,
        playtime_max: body.playtime_max || null,
        recommended_age: body.recommended_age || null,
        complexity: body.complexity || null,
        avg_weight: body.avg_weight || null,
        bgg_rating: body.bgg_rating || null,
        bgg_num_ratings: body.bgg_num_ratings || null,
        bgg_rank: body.bgg_rank || null,
        categories: body.categories || null,
        mechanics: body.mechanics || null,
        designers: body.designers || null,
        publishers: body.publishers || null,
        synced_from_bgg: body.synced_from_bgg || false,
        raw_bgg_data: body.raw_bgg_data || null,
        created_by: user.id,
        is_approved: body.synced_from_bgg || false, // Auto-approve BGG games
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating game:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json({ game }, { status: 201 })
  } catch (error) {
    console.error('Game creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    )
  }
}
