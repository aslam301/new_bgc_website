import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get articles
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const article_type = searchParams.get('type')
    const game_id = searchParams.get('game_id')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('content_articles')
      .select('*, profiles:author_id(username, full_name, avatar_url), games(name, image_url)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (article_type) {
      query = query.eq('article_type', article_type)
    }

    if (game_id) {
      query = query.eq('game_id', game_id)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ articles: data })
  } catch (error: any) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create article
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      content,
      excerpt,
      cover_image_url,
      article_type,
      game_id,
      rating,
      meta_description,
      tags,
      status,
    } = body

    if (!title || !slug || !content || !article_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const articleData: any = {
      title,
      slug,
      content,
      excerpt,
      cover_image_url,
      article_type,
      game_id,
      rating,
      meta_description,
      tags,
      status: status || 'draft',
      author_id: user.id,
    }

    if (status === 'published' && !articleData.published_at) {
      articleData.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('content_articles')
      .insert(articleData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ article: data })
  } catch (error: any) {
    console.error('Error creating article:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
