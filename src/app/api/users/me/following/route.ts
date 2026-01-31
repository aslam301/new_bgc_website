import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/users/me/following - Get communities the current user follows
export async function GET() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: following, error } = await supabase
    .from('community_followers')
    .select('community_id, followed_at')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ following })
}
