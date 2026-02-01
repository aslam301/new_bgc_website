import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils/slug'

// Get threads
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const category_id = searchParams.get('category_id')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('forum_threads')
      .select(`
        *,
        forum_categories(name, slug),
        profiles:author_id(username, full_name, avatar_url),
        last_poster:last_post_by(username, full_name, avatar_url)
      `)
      .order('is_pinned', { ascending: false })
      .order('last_post_at', { ascending: false })
      .limit(limit)

    if (category_id) {
      query = query.eq('category_id', category_id)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ threads: data })
  } catch (error: any) {
    console.error('Error fetching threads:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create thread
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { category_id, title, content } = body

    if (!category_id || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const slug = generateSlug(title)

    const { data: thread, error: threadError } = await supabase
      .from('forum_threads')
      .insert({
        category_id,
        title,
        slug,
        content,
        author_id: user.id,
        last_post_by: user.id,
      })
      .select()
      .single()

    if (threadError) throw threadError

    return NextResponse.json({ thread })
  } catch (error: any) {
    console.error('Error creating thread:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
