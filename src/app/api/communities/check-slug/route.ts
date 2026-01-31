import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/communities/check-slug?slug=xxx - Check if slug is available
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 })
  }

  // Validate slug format (lowercase alphanumeric and hyphens only)
  const slugRegex = /^[a-z0-9-]+$/
  if (!slugRegex.test(slug)) {
    return NextResponse.json(
      { available: false, error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
      { status: 200 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', slug)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned (slug is available)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ available: !data })
}
