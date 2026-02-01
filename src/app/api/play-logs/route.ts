import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get play logs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const game_id = searchParams.get('game_id')
    const user_id = searchParams.get('user_id')
    const event_id = searchParams.get('event_id')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('play_logs')
      .select(`
        *,
        games(name, image_url),
        profiles:logged_by(username, full_name, avatar_url),
        play_log_players(
          *,
          profiles:user_id(username, full_name, avatar_url)
        )
      `)
      .order('played_at', { ascending: false })
      .limit(limit)

    if (game_id) {
      query = query.eq('game_id', game_id)
    }

    if (user_id) {
      query = query.or(`logged_by.eq.${user_id},play_log_players.user_id.eq.${user_id}`)
    }

    if (event_id) {
      query = query.eq('event_id', event_id)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ play_logs: data })
  } catch (error: any) {
    console.error('Error fetching play logs:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create play log
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      game_id,
      played_at,
      duration_minutes,
      location,
      num_players,
      expansion_used,
      notes,
      photos,
      is_public,
      event_id,
      players,
    } = body

    if (!game_id || !played_at || !num_players || !players || players.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create play log
    const { data: playLog, error: logError } = await supabase
      .from('play_logs')
      .insert({
        game_id,
        logged_by: user.id,
        played_at: new Date(played_at).toISOString(),
        duration_minutes,
        location,
        num_players,
        expansion_used,
        notes,
        photos,
        is_public: is_public ?? true,
        event_id,
      })
      .select()
      .single()

    if (logError) throw logError

    // Add players
    const playerInserts = players.map((p: any) => ({
      play_log_id: playLog.id,
      user_id: p.user_id,
      guest_name: p.guest_name,
      position: p.position,
      score: p.score,
      is_winner: p.is_winner,
      color: p.color,
      character: p.character,
    }))

    const { error: playersError } = await supabase
      .from('play_log_players')
      .insert(playerInserts)

    if (playersError) throw playersError

    return NextResponse.json({ play_log: playLog })
  } catch (error: any) {
    console.error('Error creating play log:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
