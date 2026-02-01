import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get play stats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const user_id = searchParams.get('user_id')
    const game_id = searchParams.get('game_id')

    if (user_id) {
      // Get user stats
      const { data, error } = await supabase
        .from('user_play_stats')
        .select('*')
        .eq('user_id', user_id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return NextResponse.json({ stats: data || {
        user_id,
        total_plays: 0,
        unique_games: 0,
        wins: 0,
        first_places: 0,
        avg_position: null,
      }})
    } else if (game_id) {
      // Get game stats
      const { data, error } = await supabase
        .from('game_play_stats')
        .select('*')
        .eq('game_id', game_id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return NextResponse.json({ stats: data || {
        game_id,
        total_plays: 0,
        unique_players: 0,
        avg_duration: null,
        avg_players: null,
        last_played_at: null,
      }})
    }

    return NextResponse.json({ error: 'user_id or game_id required' }, { status: 400 })
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
