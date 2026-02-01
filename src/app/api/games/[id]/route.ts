import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/games/[id] - Get game details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .eq('is_approved', true)
    .single()

  if (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  return NextResponse.json({ game })
}
