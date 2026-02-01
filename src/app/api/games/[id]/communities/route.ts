import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/games/[id]/communities - Get communities that own this game
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: communityGames, error } = await supabase
    .from('community_games')
    .select(
      `
      *,
      community:communities(id, name, slug, logo_url, city, state)
    `
    )
    .eq('game_id', id)

  if (error) {
    console.error('Error fetching game communities:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ communities: communityGames })
}
